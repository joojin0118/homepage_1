/**
 * @file products.ts
 * @description 상품 관련 서버 액션
 *
 * 주요 기능:
 * 1. 상품 목록 조회 (페이지네이션 지원)
 * 2. 상품 상세 조회
 * 3. 상품 생성 (관리자만)
 * 4. 상품 수정 (관리자만)
 * 5. 상품 삭제 (관리자만)
 *
 * @dependencies
 * - @/utils/supabase/server: 서버 측 Supabase 클라이언트
 * - zod: 데이터 유효성 검사
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 상품 스키마 정의 (category 필드 제거로 스키마 캐시 문제 해결)
const ProductSchema = z.object({
  name: z.string().min(1, "상품명은 필수입니다"),
  description: z.string().optional(),
  price: z.number().min(0, "가격은 0 이상이어야 합니다"),
  image_url: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) => val === undefined || z.string().url().safeParse(val).success,
      "올바른 이미지 URL을 입력해주세요",
    ),
  stock_quantity: z.number().min(0, "재고는 0 이상이어야 합니다"),
  // category 필드 완전 제거 (스키마 캐시 문제 해결 시까지)
});

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string;
  created_by: string | null;
  created_at: string | null;
};

/**
 * 상품 목록 조회
 */
export async function getProducts(
  page: number = 1,
  limit: number = 12,
  category?: string,
  searchTerm?: string,
): Promise<{
  products: Product[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    console.group("📦 상품 목록 조회");
    console.log(
      "페이지:",
      page,
      "제한:",
      limit,
      "카테고리:",
      category || "전체",
      "검색어:",
      searchTerm || "없음",
    );

    const supabase = await createServerSupabaseClient();
    const offset = (page - 1) * limit;

    // 기본 쿼리
    let query = supabase.from("products").select("*", { count: "exact" });
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // 카테고리 필터 조건
    if (category && category !== "all") {
      query = query.eq("category", category);
      countQuery = countQuery.eq("category", category);
    }

    // 검색 조건 (상품명 또는 설명에서 검색)
    if (searchTerm && searchTerm.trim()) {
      const searchFilter = `name.ilike.%${searchTerm.trim()}%,description.ilike.%${searchTerm.trim()}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    // 전체 상품 수 조회 (필터 적용)
    const { count } = await countQuery;

    // 상품 목록 조회 (필터 적용)
    const { data: products, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("상품 목록 조회 오류:", error);
      throw new Error("상품 목록을 불러오는 중 오류가 발생했습니다.");
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log("조회된 상품 수:", products?.length || 0);
    console.log("전체 상품 수 (필터링 후):", totalCount);
    console.groupEnd();

    return {
      products: products || [],
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("상품 목록 조회 실패:", error);
    throw new Error("상품 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * 상품 상세 조회
 */
export async function getProduct(id: number): Promise<Product | null> {
  try {
    console.group("🔍 상품 상세 조회");
    console.log("상품 ID:", id);

    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("상품 상세 조회 오류:", error);
      if (error.code === "PGRST116") {
        console.log("상품을 찾을 수 없음");
        console.groupEnd();
        return null;
      }
      throw new Error("상품 정보를 불러오는 중 오류가 발생했습니다.");
    }

    console.log("조회된 상품:", product.name);
    console.groupEnd();

    return product;
  } catch (error) {
    console.error("상품 상세 조회 실패:", error);
    throw new Error("상품 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

/**
 * 상품 생성 (관리자만)
 */
export async function createProduct(formData: FormData): Promise<{
  success: boolean;
  message: string;
  productId?: number;
}> {
  try {
    console.group("➕ 상품 생성");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    console.log("🔐 사용자 인증 확인...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ 인증 오류:", authError);
      return { success: false, message: `인증 오류: ${authError.message}` };
    }

    if (!user) {
      console.log("❌ 로그인되지 않은 사용자");
      return { success: false, message: "로그인이 필요합니다." };
    }

    console.log("✅ 사용자 인증 완료:", user.id);

    // 관리자 권한 확인
    console.log("👤 관리자 권한 확인...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ 프로필 조회 오류:", profileError);
      return {
        success: false,
        message: `프로필 조회 오류: ${profileError.message}`,
      };
    }

    if (!profile?.is_admin) {
      console.log("❌ 관리자 권한 없음:", profile);
      return { success: false, message: "관리자 권한이 필요합니다." };
    }

    console.log("✅ 관리자 권한 확인 완료");

    // 폼 데이터 파싱
    console.log("📝 폼 데이터 파싱...");
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      image_url: formData.get("image_url"),
      stock_quantity: formData.get("stock_quantity"),
      // category: formData.get("category"), // 제거
    };

    console.log("원본 폼 데이터:", rawData);

    const productData = {
      name: rawData.name as string,
      description: rawData.description as string,
      price: Number(rawData.price),
      image_url: rawData.image_url as string,
      stock_quantity: Number(rawData.stock_quantity),
      // category 필드 완전 제거
    };

    console.log("파싱된 상품 데이터:", productData);

    // 데이터 유효성 검사
    console.log("✔️ 데이터 유효성 검사...");
    let validatedData;
    try {
      validatedData = ProductSchema.parse(productData);
      console.log("✅ 유효성 검사 통과:", validatedData);
    } catch (validationError) {
      console.error("❌ 유효성 검사 실패:", validationError);
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        return {
          success: false,
          message: `유효성 검사 실패: ${errorMessages}`,
        };
      }
      throw validationError;
    }

    // 상품 생성
    console.log("💾 데이터베이스에 상품 저장...");
    const insertData = {
      ...validatedData,
      created_by: user.id,
    };
    console.log("삽입할 데이터:", insertData);

    const { data: product, error } = await supabase
      .from("products")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("❌ 데이터베이스 삽입 오류:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        message: `데이터베이스 오류: ${error.message} (코드: ${error.code})`,
      };
    }

    if (!product) {
      console.error("❌ 상품 생성 후 데이터 없음");
      return {
        success: false,
        message: "상품이 생성되었지만 데이터를 가져올 수 없습니다.",
      };
    }

    console.log("✅ 상품 생성 완료:", product.id);
    console.groupEnd();

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: "상품이 성공적으로 생성되었습니다.",
      productId: product.id,
    };
  } catch (error) {
    console.error("❌ 상품 생성 전체 프로세스 실패:", error);
    console.error("오류 상세 정보:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.groupEnd();

    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return {
        success: false,
        message: `유효성 검사 실패: ${errorMessages}`,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "상품 생성 중 알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 상품 수정 (관리자만)
 */
export async function updateProduct(
  id: number,
  formData: FormData,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.group("✏️ 상품 수정");
    console.log("상품 ID:", id);

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return { success: false, message: "관리자 권한이 필요합니다." };
    }

    // 폼 데이터 파싱
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      image_url: formData.get("image_url") as string,
      stock_quantity: Number(formData.get("stock_quantity")),
      category: formData.get("category") as string,
    };

    console.log("수정할 상품 데이터:", productData);

    // 데이터 유효성 검사
    const validatedData = ProductSchema.parse(productData);

    // 상품 수정
    const { error } = await supabase
      .from("products")
      .update(validatedData)
      .eq("id", id);

    if (error) {
      console.error("상품 수정 오류:", error);
      throw new Error("상품 수정 중 오류가 발생했습니다.");
    }

    console.log("상품 수정 완료");
    console.groupEnd();

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/products/${id}`);

    return {
      success: true,
      message: "상품이 성공적으로 수정되었습니다.",
    };
  } catch (error) {
    console.error("상품 수정 실패:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `유효성 검사 실패: ${error.errors[0].message}`,
      };
    }
    return {
      success: false,
      message: "상품 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 상품 삭제 (관리자만)
 */
export async function deleteProduct(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.group("🗑️ 상품 삭제");
    console.log("상품 ID:", id);

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "로그인이 필요합니다." };
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return { success: false, message: "관리자 권한이 필요합니다." };
    }

    // 상품 삭제
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("상품 삭제 오류:", error);
      throw new Error("상품 삭제 중 오류가 발생했습니다.");
    }

    console.log("상품 삭제 완료");
    console.groupEnd();

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: "상품이 성공적으로 삭제되었습니다.",
    };
  } catch (error) {
    console.error("상품 삭제 실패:", error);
    return {
      success: false,
      message: "상품 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 상품 재고 수량 조정 (관리자만)
 */
export async function adjustProductStock(
  productId: number,
  adjustment: number, // 양수면 재고 증가, 음수면 재고 감소
): Promise<{
  success: boolean;
  message: string;
  newStock?: number;
}> {
  try {
    console.group("📊 상품 재고 조정");
    console.log("상품 ID:", productId, "조정량:", adjustment);

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 실패:", authError);
      console.groupEnd();
      return { success: false, message: "로그인이 필요합니다." };
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      console.error("관리자가 아닌 사용자의 재고 조정 시도:", user.id);
      console.groupEnd();
      return { success: false, message: "관리자 권한이 필요합니다." };
    }

    // 현재 상품 정보 조회
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("상품 조회 실패:", productError);
      console.groupEnd();
      return { success: false, message: "상품을 찾을 수 없습니다." };
    }

    // 새로운 재고 계산
    const newStock = product.stock_quantity + adjustment;

    // 재고가 음수가 되지 않도록 검증
    if (newStock < 0) {
      console.error("재고 부족으로 조정 불가:", {
        현재재고: product.stock_quantity,
        조정량: adjustment,
        결과재고: newStock,
      });
      console.groupEnd();
      return {
        success: false,
        message: `재고를 ${Math.abs(adjustment)}개 감소시킬 수 없습니다. 현재 재고: ${product.stock_quantity}개`,
      };
    }

    // 재고 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId);

    if (updateError) {
      console.error("재고 업데이트 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        message: "재고 업데이트 중 오류가 발생했습니다.",
      };
    }

    console.log("재고 조정 완료:", {
      상품명: product.name,
      기존재고: product.stock_quantity,
      조정량: adjustment,
      새재고: newStock,
    });
    console.groupEnd();

    // 관련 페이지 재검증
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath(`/products/${productId}`);

    const actionText = adjustment > 0 ? "증가" : "감소";
    return {
      success: true,
      message: `${product.name}의 재고가 ${Math.abs(adjustment)}개 ${actionText}했습니다. (현재 재고: ${newStock}개)`,
      newStock,
    };
  } catch (error) {
    console.error("재고 조정 오류:", error);
    console.groupEnd();
    throw error;
  }
}
