/**
 * @file cart.ts
 * @description 장바구니 관련 서버 액션
 *
 * 주요 기능:
 * 1. 장바구니 아이템 추가
 * 2. 장바구니 목록 조회
 * 3. 장바구니 아이템 수량 변경
 * 4. 장바구니 아이템 삭제
 * 5. 장바구니 비우기
 * 6. 장바구니 총액 계산
 *
 * @dependencies
 * - @/utils/supabase/server: 서버 측 Supabase 클라이언트
 * - zod: 데이터 유효성 검사
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 장바구니 아이템 스키마 정의
const CartItemSchema = z.object({
  product_id: z.number().min(1, "상품 ID는 필수입니다"),
  quantity: z.number().min(1, "수량은 1 이상이어야 합니다"),
});

// 장바구니 아이템 타입 정의
export type CartItem = {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
  };
};

export type CartSummary = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
};

/**
 * 현재 사용자의 장바구니 목록 조회
 */
export async function getCartItems(): Promise<CartSummary> {
  console.group("🛒 장바구니 목록 조회");

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

    console.log("사용자 ID:", user.id);

    // 장바구니 아이템과 상품 정보 함께 조회
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        product_id,
        quantity,
        created_at,
        product:products(
          id,
          name,
          price,
          image_url,
          stock_quantity
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("장바구니 조회 실패:", error);
      console.groupEnd();
      throw new Error("장바구니 조회 중 오류가 발생했습니다");
    }

    // 타입 안전한 데이터 변환
    const validCartItems: CartItem[] =
      cartItems
        ?.filter((item) => {
          // product가 존재하고 객체이며 배열이 아닌지 확인
          const product = Array.isArray(item.product)
            ? item.product[0]
            : item.product;
          return product !== null && typeof product === "object";
        })
        .map((item) => {
          // product가 배열인 경우 첫 번째 요소를 사용 (조인 결과에서 단일 객체인 경우)
          const product = Array.isArray(item.product)
            ? item.product[0]
            : item.product;
          return {
            ...item,
            product: product as CartItem["product"],
          };
        }) || [];

    // 총 아이템 수와 총액 계산
    const totalItems = validCartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalAmount = validCartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const result = {
      items: validCartItems,
      totalItems,
      totalAmount,
    };

    console.log("장바구니 조회 완료:", {
      아이템수: validCartItems.length,
      총수량: totalItems,
      총액: totalAmount,
    });
    console.groupEnd();

    return result;
  } catch (error) {
    console.error("장바구니 조회 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 장바구니에 상품 추가
 */
export async function addToCart(productId: number, quantity: number = 1) {
  console.group("🛒 장바구니 추가");
  console.log("상품 ID:", productId, "수량:", quantity);

  try {
    // 입력값 검증
    const validatedData = CartItemSchema.parse({
      product_id: productId,
      quantity,
    });

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

    // 상품 존재 여부 및 재고 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", validatedData.product_id)
      .single();

    if (productError || !product) {
      console.error("상품 조회 실패:", productError);
      console.groupEnd();
      throw new Error("상품을 찾을 수 없습니다");
    }

    if (product.stock_quantity < validatedData.quantity) {
      console.error("재고 부족:", {
        요청수량: validatedData.quantity,
        재고수량: product.stock_quantity,
      });
      console.groupEnd();
      throw new Error("재고가 부족합니다");
    }

    // 기존 장바구니 아이템 확인
    const { data: existingItem, error: checkError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", validatedData.product_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (정상적인 경우)
      console.error("기존 아이템 확인 실패:", checkError);
      console.groupEnd();
      throw new Error("장바구니 확인 중 오류가 발생했습니다");
    }

    let result;

    if (existingItem) {
      // 기존 아이템이 있으면 수량 업데이트
      const newQuantity = existingItem.quantity + validatedData.quantity;

      // 재고 재확인
      if (newQuantity > product.stock_quantity) {
        console.error("총 수량이 재고를 초과:", {
          기존수량: existingItem.quantity,
          추가수량: validatedData.quantity,
          총수량: newQuantity,
          재고수량: product.stock_quantity,
        });
        console.groupEnd();
        throw new Error(
          `재고가 부족합니다. 현재 재고: ${product.stock_quantity}개`,
        );
      }

      const { data: updateData, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (updateError) {
        console.error("수량 업데이트 실패:", updateError);
        console.groupEnd();
        throw new Error("장바구니 업데이트 중 오류가 발생했습니다");
      }

      result = updateData;
      console.log("기존 아이템 수량 업데이트:", {
        기존: existingItem.quantity,
        신규: newQuantity,
      });
    } else {
      // 새 아이템 추가
      const { data: insertData, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: validatedData.product_id,
          quantity: validatedData.quantity,
        })
        .select()
        .single();

      if (insertError) {
        console.error("아이템 추가 실패:", insertError);
        console.groupEnd();
        throw new Error("장바구니 추가 중 오류가 발생했습니다");
      }

      result = insertData;
      console.log("새 아이템 추가 완료");
    }

    console.log("장바구니 추가 성공:", product.name);
    console.groupEnd();

    // 관련 페이지 재검증
    revalidatePath("/cart");
    revalidatePath("/");

    return {
      success: true,
      message: `${product.name}이(가) 장바구니에 추가되었습니다`,
      cartItem: result,
    };
  } catch (error) {
    console.error("장바구니 추가 오류:", error);
    console.groupEnd();

    if (error instanceof z.ZodError) {
      throw new Error("입력값이 올바르지 않습니다");
    }

    throw error;
  }
}

/**
 * 장바구니 아이템 수량 변경
 */
export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
) {
  console.group("🛒 장바구니 수량 변경");
  console.log("카트 아이템 ID:", cartItemId, "새 수량:", quantity);

  try {
    // 수량 검증
    if (quantity < 1) {
      throw new Error("수량은 1 이상이어야 합니다");
    }

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

    // 장바구니 아이템과 상품 정보 확인
    const { data: cartItem, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        user_id,
        product_id,
        quantity,
        product:products(stock_quantity, name)
      `,
      )
      .eq("id", cartItemId)
      .eq("user_id", user.id)
      .single();

    if (cartError || !cartItem) {
      console.error("장바구니 아이템 조회 실패:", cartError);
      console.groupEnd();
      throw new Error("장바구니 아이템을 찾을 수 없습니다");
    }

    const product = Array.isArray(cartItem.product)
      ? cartItem.product[0]
      : cartItem.product;
    if (!product) {
      throw new Error("상품 정보를 찾을 수 없습니다");
    }

    // 재고 확인
    if (quantity > product.stock_quantity) {
      console.error("재고 초과:", {
        요청수량: quantity,
        재고수량: product.stock_quantity,
      });
      console.groupEnd();
      throw new Error(
        `재고가 부족합니다. 현재 재고: ${product.stock_quantity}개`,
      );
    }

    // 수량 업데이트
    const { data: updateData, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .select()
      .single();

    if (updateError) {
      console.error("수량 업데이트 실패:", updateError);
      console.groupEnd();
      throw new Error("수량 변경 중 오류가 발생했습니다");
    }

    console.log("수량 변경 완료:", {
      상품: product.name,
      기존수량: cartItem.quantity,
      새수량: quantity,
    });
    console.groupEnd();

    // 관련 페이지 재검증
    revalidatePath("/cart");

    return {
      success: true,
      message: "수량이 변경되었습니다",
      cartItem: updateData,
    };
  } catch (error) {
    console.error("수량 변경 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 장바구니 아이템 삭제
 */
export async function removeFromCart(cartItemId: number) {
  console.group("🛒 장바구니 아이템 삭제");
  console.log("카트 아이템 ID:", cartItemId);

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

    // 삭제 전 아이템 정보 조회 (로깅용)
    const { data: cartItem } = await supabase
      .from("cart_items")
      .select(
        `
        product:products(name)
      `,
      )
      .eq("id", cartItemId)
      .eq("user_id", user.id)
      .single();

    // 아이템 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("아이템 삭제 실패:", deleteError);
      console.groupEnd();
      throw new Error("아이템 삭제 중 오류가 발생했습니다");
    }

    // 안전한 상품 이름 추출
    let productName = "상품";
    if (cartItem?.product) {
      const product = Array.isArray(cartItem.product)
        ? cartItem.product[0]
        : cartItem.product;
      if (product && typeof product === "object" && "name" in product) {
        productName = (product as { name: string }).name;
      }
    }

    console.log("아이템 삭제 완료:", productName);
    console.groupEnd();

    // 관련 페이지 재검증
    revalidatePath("/cart");

    return {
      success: true,
      message: `${productName}이(가) 장바구니에서 제거되었습니다`,
    };
  } catch (error) {
    console.error("아이템 삭제 오류:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 장바구니 비우기
 */
export async function clearCart() {
  console.group("🛒 장바구니 비우기");

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

    // 모든 장바구니 아이템 삭제
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("장바구니 비우기 실패:", deleteError);
      console.groupEnd();
      throw new Error("장바구니 비우기 중 오류가 발생했습니다");
    }

    console.log("장바구니 비우기 완료");
    console.groupEnd();

    // 관련 페이지 재검증
    revalidatePath("/cart");

    return {
      success: true,
      message: "장바구니가 비워졌습니다",
    };
  } catch (error) {
    console.error("장바구니 비우기 오류:", error);
    console.groupEnd();
    throw error;
  }
}
