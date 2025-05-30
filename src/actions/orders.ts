/**
 * @file orders.ts
 * @description 주문 관련 서버 액션
 *
 * 주요 기능:
 * 1. 주문 생성 (장바구니 → 주문 변환)
 * 2. 사용자별 주문 내역 조회
 * 3. 개별 주문 상세 조회
 * 4. 관리자용 전체 주문 조회
 * 5. 주문 상태 변경 (관리자 전용)
 *
 * @dependencies
 * - @/utils/supabase/server: 서버 측 Supabase 클라이언트
 * - @/actions/cart: 장바구니 관련 함수
 * - zod: 데이터 유효성 검사
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { clearCart } from "@/actions/cart";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// 주문 생성 스키마
const CreateOrderSchema = z.object({
  customerName: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이내로 입력해주세요"),
  customerPhone: z
    .string()
    .min(10, "유효한 연락처를 입력해주세요")
    .max(20, "연락처는 20자 이내로 입력해주세요"),
  customerAddress: z
    .string()
    .min(5, "상세한 주소를 입력해주세요")
    .max(200, "주소는 200자 이내로 입력해주세요"),
});

// 주문 상태 스키마
const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipping",
  "delivered",
  "cancelled",
]);

// 주문 타입 정의
export type Order = {
  id: number;
  user_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
};

export type OrderWithItems = Order & {
  order_items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    price_at_time: number;
    product: {
      id: number;
      name: string;
      image_url: string | null;
    };
  }>;
};

// 관리자 주문 조회 결과 타입
type OrdersWithProfilesResult =
  | {
      success: true;
      orders: (OrderWithItems & { profiles: { name: string | null } | null })[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * 주문 생성 (장바구니에서 주문으로 변환 또는 바로 구매)
 */
export async function createOrder(formData: FormData) {
  console.group("📦 주문 생성");

  try {
    // 폼 데이터 파싱
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;
    const isDirectPurchase = formData.get("is_direct_purchase") === "true";
    const directPurchaseDataRaw = formData.get(
      "direct_purchase_data",
    ) as string;
    const cartDataRaw = formData.get("cart_data") as string;

    console.log("🔍 받은 폼 데이터:", {
      customerName: customerName?.substring(0, 10) + "...",
      isDirectPurchase,
      hasDirectPurchaseData: !!directPurchaseDataRaw,
      hasCartData: !!cartDataRaw,
      directDataLength: directPurchaseDataRaw?.length || 0,
      cartDataLength: cartDataRaw?.length || 0,
    });

    // 입력값 검증
    const validatedData = CreateOrderSchema.parse({
      customerName,
      customerPhone,
      customerAddress,
    });

    console.log("주문자 정보:", validatedData);
    console.log("주문 유형:", isDirectPurchase ? "바로 구매" : "장바구니");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      throw new Error("로그인이 필요합니다");
    }

    console.log("사용자 ID:", user.id);

    const orderItems: Array<{
      product_id: number;
      quantity: number;
      price_at_time: number;
      product_name: string;
    }> = [];
    let totalAmount = 0;

    if (isDirectPurchase && directPurchaseDataRaw) {
      // 바로 구매 모드
      console.log("바로 구매 데이터 처리");

      try {
        const directPurchaseData = JSON.parse(directPurchaseDataRaw);

        if (
          !directPurchaseData.items ||
          directPurchaseData.items.length === 0
        ) {
          console.error("바로 구매 데이터가 비어있음");
          console.groupEnd();
          throw new Error("구매할 상품이 없습니다");
        }

        totalAmount = directPurchaseData.total_amount;
        console.log("바로 구매 아이템:", directPurchaseData.items.length, "개");
        console.log("총 주문 금액:", totalAmount, "원");

        // 바로 구매 아이템들의 재고 검증 및 데이터 준비
        for (const item of directPurchaseData.items) {
          // 상품 정보 조회 (재고 검증용)
          const { data: product, error: productError } = await supabase
            .from("products")
            .select("id, name, stock_quantity, price")
            .eq("id", item.product_id)
            .single();

          if (productError || !product) {
            console.error("상품 조회 실패:", item.product_id, productError);
            console.groupEnd();
            throw new Error(`상품을 찾을 수 없습니다 (ID: ${item.product_id})`);
          }

          // 재고 검증
          if (product.stock_quantity < item.quantity) {
            console.error("재고 부족:", product.name, {
              요청수량: item.quantity,
              재고수량: product.stock_quantity,
            });
            console.groupEnd();
            throw new Error(
              `${product.name}의 재고가 부족합니다 (재고: ${product.stock_quantity}개)`,
            );
          }

          // 가격 검증 (세션 데이터의 가격과 현재 가격 비교)
          if (product.price !== item.price) {
            console.warn("가격 변동 감지:", product.name, {
              세션가격: item.price,
              현재가격: product.price,
            });
            // 실제 서비스에서는 사용자에게 알리고 확인받는 것이 좋음
          }

          orderItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: product.price, // 현재 가격 사용
            product_name: product.name,
          });
        }
      } catch (parseError) {
        console.error("바로 구매 데이터 파싱 오류:", parseError);
        console.groupEnd();
        throw new Error("구매 데이터가 유효하지 않습니다");
      }
    } else {
      // 기존 장바구니 모드
      console.log("장바구니 데이터 처리");

      // 클라이언트에서 전달받은 장바구니 데이터가 반드시 있어야 함
      if (!cartDataRaw) {
        console.error("❌ 클라이언트 장바구니 데이터가 없음");
        console.groupEnd();
        throw new Error(
          "장바구니 데이터를 찾을 수 없습니다. 장바구니 페이지로 돌아가서 다시 시도해주세요.",
        );
      }

      let cartData;
      try {
        cartData = JSON.parse(cartDataRaw);
        console.log("✅ 클라이언트 장바구니 데이터 파싱 성공:", {
          itemsCount: cartData.items?.length || 0,
          totalAmount: cartData.totalAmount,
          timestamp: cartData.timestamp,
        });
      } catch (parseError) {
        console.error("❌ 장바구니 데이터 파싱 실패:", parseError);
        console.groupEnd();
        throw new Error(
          "장바구니 데이터가 손상되었습니다. 장바구니 페이지로 돌아가서 다시 시도해주세요.",
        );
      }

      if (!cartData.items || cartData.items.length === 0) {
        console.error("❌ 장바구니 아이템이 없음");
        console.groupEnd();
        throw new Error(
          "장바구니에 상품이 없습니다. 상품을 추가한 후 다시 시도해주세요.",
        );
      }

      // 데이터 유효성 검사 (1시간 이내)
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;

      if (now - cartData.timestamp > hourInMs) {
        console.warn("⏰ 장바구니 데이터가 만료됨");
        console.groupEnd();
        throw new Error(
          "장바구니 데이터가 만료되었습니다. 장바구니 페이지로 돌아가서 새로고침 후 다시 시도해주세요.",
        );
      }

      totalAmount = cartData.totalAmount;
      console.log("장바구니 아이템:", cartData.items.length, "개");
      console.log("총 주문 금액:", totalAmount, "원");

      // 실제 상품 가격으로 총액 재계산 (가격 변동 고려)
      let recalculatedTotal = 0;

      // 재고 검증 및 주문 아이템 데이터 준비
      for (const item of cartData.items) {
        // 상품 정보 다시 조회하여 최신 데이터 사용
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, name, price, stock_quantity")
          .eq("id", item.product.id)
          .single();

        if (productError || !product) {
          console.error("상품 조회 실패:", item.product.id, productError);
          console.groupEnd();
          throw new Error(
            `상품을 찾을 수 없습니다: ${item.product.name || item.product.id}`,
          );
        }

        // 재고 검증
        if (product.stock_quantity < item.quantity) {
          console.error("재고 부족:", product.name, {
            요청수량: item.quantity,
            재고수량: product.stock_quantity,
          });
          console.groupEnd();
          throw new Error(
            `${product.name}의 재고가 부족합니다 (재고: ${product.stock_quantity}개)`,
          );
        }

        // 가격 변동 확인
        if (product.price !== item.product.price) {
          console.warn("가격 변동 감지:", product.name, {
            장바구니가격: item.product.price,
            현재가격: product.price,
          });
          // 실제 서비스에서는 사용자에게 알리고 확인받는 것이 좋음
        }

        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price_at_time: product.price, // 현재 가격 사용
          product_name: product.name,
        });

        recalculatedTotal += product.price * item.quantity;
      }

      // 총액 검증
      if (Math.abs(recalculatedTotal - totalAmount) > 1) {
        console.warn("💰 총액 불일치 감지:", {
          클라이언트총액: totalAmount,
          재계산총액: recalculatedTotal,
          차이: Math.abs(recalculatedTotal - totalAmount),
        });

        // 차이가 크면 에러, 작으면 서버 가격 사용
        if (Math.abs(recalculatedTotal - totalAmount) > totalAmount * 0.1) {
          console.groupEnd();
          throw new Error(
            "상품 가격이 변동되었습니다. 장바구니를 새로고침하고 다시 시도해주세요.",
          );
        } else {
          totalAmount = recalculatedTotal; // 서버 가격으로 업데이트
          console.log("✅ 서버 가격으로 총액 업데이트:", totalAmount);
        }
      }
    }

    // Supabase 트랜잭션으로 주문 처리
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total_amount: totalAmount,
        // 주문자 정보는 별도 테이블로 분리하는 것이 좋지만, 현재는 간단히 구현
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("주문 생성 실패:", orderError);
      console.groupEnd();
      throw new Error("주문 생성 중 오류가 발생했습니다");
    }

    console.log("주문 생성 완료:", order.id);

    // 주문 상품 정보 저장
    const orderItemsForDB = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsForDB);

    if (orderItemsError) {
      console.error("주문 상품 저장 실패:", orderItemsError);

      // 주문 취소 (롤백)
      await supabase.from("orders").delete().eq("id", order.id);

      console.groupEnd();
      throw new Error("주문 상품 저장 중 오류가 발생했습니다");
    }

    console.log("주문 상품 저장 완료:", orderItemsForDB.length, "개");

    // 재고 차감
    for (const item of orderItems) {
      // 현재 재고 조회
      const { data: currentProduct, error: currentProductError } =
        await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single();

      if (currentProductError || !currentProduct) {
        console.error(
          "상품 재고 조회 실패:",
          item.product_id,
          currentProductError,
        );
        console.groupEnd();
        throw new Error(
          `${item.product_name} 재고 조회 중 오류가 발생했습니다`,
        );
      }

      const newStock = currentProduct.stock_quantity - item.quantity;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.product_id);

      if (stockError) {
        console.error("재고 차감 실패:", stockError);
        console.groupEnd();
        throw new Error(
          `${item.product_name} 재고 업데이트 중 오류가 발생했습니다`,
        );
      }

      console.log(
        `재고 차감: ${item.product_name} (${currentProduct.stock_quantity} → ${newStock})`,
      );
    }

    // 장바구니 비우기 (장바구니 모드인 경우에만)
    if (!isDirectPurchase) {
      await clearCart();
      console.log("장바구니 비우기 완료");
    }

    console.log("주문 처리 완료:", order.id);
    console.groupEnd();

    // 주문 완료 페이지로 리다이렉트
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/orders");
    redirect(`/order-success/${order.id}`);
  } catch (error) {
    console.error("주문 생성 오류:", error);
    console.groupEnd();

    if (error instanceof z.ZodError) {
      throw new Error(`입력 오류: ${error.errors[0].message}`);
    }

    throw error;
  }
}

/**
 * 사용자별 주문 내역 조회
 */
export async function getOrders(page: number = 1, limit: number = 10) {
  console.group("📦 주문 내역 조회");
  console.log("페이지:", page, "제한:", limit);

  try {
    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      throw new Error("로그인이 필요합니다");
    }

    const offset = (page - 1) * limit;

    // 주문 목록 조회
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        total_amount,
        created_at,
        order_items(
          id,
          product_id,
          quantity,
          price_at_time,
          product:products(
            id,
            name,
            image_url
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("주문 조회 실패:", error);
      console.groupEnd();
      throw new Error("주문 내역 조회 중 오류가 발생했습니다");
    }

    // 전체 주문 수 조회
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("주문 수 조회 실패:", countError);
      console.groupEnd();
      throw new Error("주문 수 조회 중 오류가 발생했습니다");
    }

    const result = {
      orders:
        (orders?.map((order) => ({
          ...order,
          order_items: order.order_items?.map((item) => ({
            ...item,
            product: Array.isArray(item.product)
              ? item.product[0]
              : item.product,
          })),
        })) as OrderWithItems[]) || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };

    console.log("주문 조회 완료:", {
      주문수: orders?.length || 0,
      전체수: count,
      페이지: page,
    });
    console.groupEnd();

    return result;
  } catch (error) {
    console.error("주문 조회 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 개별 주문 상세 조회
 */
export async function getOrder(orderId: number) {
  console.group("📦 주문 상세 조회");
  console.log("주문 ID:", orderId);

  try {
    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      throw new Error("로그인이 필요합니다");
    }

    // 주문 상세 조회
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        total_amount,
        created_at,
        order_items(
          id,
          product_id,
          quantity,
          price_at_time,
          product:products(
            id,
            name,
            image_url,
            description
          )
        )
      `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (error || !order) {
      console.error("주문 조회 실패:", error);
      console.groupEnd();
      throw new Error("주문을 찾을 수 없습니다");
    }

    console.log("주문 상세 조회 완료:", order.id);
    console.groupEnd();

    // 안전한 타입 변환
    const transformedOrder = {
      ...order,
      order_items: order.order_items?.map((item) => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      })),
    };

    return transformedOrder as OrderWithItems;
  } catch (error) {
    console.error("주문 상세 조회 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 관리자용 전체 주문 조회
 */
export async function getOrdersForAdmin(page: number = 1, limit: number = 20) {
  console.group("📦 관리자 주문 조회");
  console.log("페이지:", page, "제한:", limit);

  try {
    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인 및 관리자 권한 체크
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      throw new Error("로그인이 필요합니다");
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      console.error("관리자 권한 없음:", profileError);
      console.groupEnd();
      throw new Error("관리자 권한이 필요합니다");
    }

    const offset = (page - 1) * limit;

    // 전체 주문 조회
    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        total_amount,
        created_at,
        profiles(
          name
        ),
        order_items(
          id,
          product_id,
          quantity,
          price_at_time,
          product:products(
            id,
            name,
            image_url
          )
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("관리자 주문 조회 실패:", error);
      console.groupEnd();
      throw new Error("주문 조회 중 오류가 발생했습니다");
    }

    // 전체 주문 수 조회
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("주문 수 조회 실패:", countError);
      console.groupEnd();
      throw new Error("주문 수 조회 중 오류가 발생했습니다");
    }

    const result = {
      orders:
        (orders?.map((order) => ({
          ...order,
          profiles: Array.isArray(order.profiles)
            ? order.profiles[0]
            : order.profiles,
          order_items: order.order_items?.map((item) => ({
            ...item,
            product: Array.isArray(item.product)
              ? item.product[0]
              : item.product,
          })),
        })) as (OrderWithItems & {
          profiles: { name: string | null } | null;
        })[]) || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };

    console.log("관리자 주문 조회 완료:", {
      주문수: orders?.length || 0,
      전체수: count,
      페이지: page,
    });
    console.groupEnd();

    return result;
  } catch (error) {
    console.error("관리자 주문 조회 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 관리자용 프로필 포함 주문 조회 (검색 및 필터 지원)
 */
export async function getOrdersWithProfiles(
  page: number = 1,
  limit: number = 20,
  statusFilter?: string,
  searchTerm?: string,
): Promise<OrdersWithProfilesResult> {
  console.group("📦 관리자 주문 조회 (프로필 포함)");
  console.log(
    "페이지:",
    page,
    "제한:",
    limit,
    "상태 필터:",
    statusFilter,
    "검색어:",
    searchTerm,
  );

  try {
    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인 및 관리자 권한 체크
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      return { success: false, error: "로그인이 필요합니다" };
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      console.error("관리자 권한 없음:", profileError);
      console.groupEnd();
      return { success: false, error: "관리자 권한이 필요합니다" };
    }

    const offset = (page - 1) * limit;

    // 쿼리 빌더 생성
    let query = supabase.from("orders").select(
      `
        id,
        user_id,
        status,
        total_amount,
        created_at,
        customer_name,
        customer_phone,
        customer_address,
        profiles(
          name
        ),
        order_items(
          id,
          product_id,
          quantity,
          price_at_time,
          product:products(
            id,
            name,
            image_url
          )
        )
      `,
    );

    // 상태 필터 적용
    if (statusFilter && statusFilter !== "") {
      query = query.eq("status", statusFilter);
    }

    // 검색 필터 적용 (주문 ID 또는 사용자 이름으로 검색)
    if (searchTerm && searchTerm.trim() !== "") {
      const searchTermTrimmed = searchTerm.trim();
      // 숫자인 경우 주문 ID로 검색, 그 외에는 고객명으로 검색
      if (/^\d+$/.test(searchTermTrimmed)) {
        query = query.eq("id", parseInt(searchTermTrimmed));
      } else {
        query = query.ilike("customer_name", `%${searchTermTrimmed}%`);
      }
    }

    // 정렬 및 페이지네이션 적용
    const { data: orders, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("관리자 주문 조회 실패:", error);
      console.groupEnd();
      return { success: false, error: "주문 조회 중 오류가 발생했습니다" };
    }

    // 전체 주문 수 조회 (같은 필터 조건 적용)
    let countQuery = supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (statusFilter && statusFilter !== "") {
      countQuery = countQuery.eq("status", statusFilter);
    }

    if (searchTerm && searchTerm.trim() !== "") {
      const searchTermTrimmed = searchTerm.trim();
      if (/^\d+$/.test(searchTermTrimmed)) {
        countQuery = countQuery.eq("id", parseInt(searchTermTrimmed));
      } else {
        countQuery = countQuery.ilike(
          "customer_name",
          `%${searchTermTrimmed}%`,
        );
      }
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("주문 수 조회 실패:", countError);
      console.groupEnd();
      return { success: false, error: "주문 수 조회 중 오류가 발생했습니다" };
    }

    const result = {
      success: true as const,
      orders:
        (orders?.map((order) => ({
          ...order,
          profiles: Array.isArray(order.profiles)
            ? order.profiles[0]
            : order.profiles,
          order_items: order.order_items?.map((item) => ({
            ...item,
            product: Array.isArray(item.product)
              ? item.product[0]
              : item.product,
          })),
        })) as (OrderWithItems & {
          profiles: { name: string | null } | null;
        })[]) || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    };

    console.log("관리자 주문 조회 완료:", {
      주문수: orders?.length || 0,
      전체수: count,
      페이지: page,
    });
    console.groupEnd();

    return result;
  } catch (error) {
    console.error("관리자 주문 조회 오류:", error);
    console.groupEnd();
    return { success: false, error: "주문 조회 중 오류가 발생했습니다" };
  }
}

/**
 * 주문 상태 변경 (관리자 전용)
 */
export async function updateOrderStatus(orderId: number, status: string) {
  console.group("📦 주문 상태 변경");
  console.log("주문 ID:", orderId, "상태:", status);

  try {
    // 상태 유효성 검사
    const validatedStatus = OrderStatusSchema.parse(status);

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인 및 관리자 권한 체크
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      throw new Error("로그인이 필요합니다");
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      console.error("관리자 권한 없음:", profileError);
      console.groupEnd();
      throw new Error("관리자 권한이 필요합니다");
    }

    // 주문 상태 업데이트
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status: validatedStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (error || !order) {
      console.error("주문 상태 변경 실패:", error);
      console.groupEnd();
      throw new Error("주문 상태 변경 중 오류가 발생했습니다");
    }

    console.log("주문 상태 변경 완료:", order.id, "→", validatedStatus);
    console.groupEnd();

    revalidatePath("/admin/orders");
    revalidatePath("/orders");

    return { success: true, order };
  } catch (error) {
    console.error("주문 상태 변경 오류:", error);
    console.groupEnd();

    if (error instanceof z.ZodError) {
      throw new Error(`유효하지 않은 주문 상태: ${status}`);
    }

    throw error;
  }
}
