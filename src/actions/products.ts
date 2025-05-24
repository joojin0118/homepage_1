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

// 상품 스키마 정의
const ProductSchema = z.object({
  name: z.string().min(1, "상품명은 필수입니다"),
  description: z.string().optional(),
  price: z.number().min(0, "가격은 0 이상이어야 합니다"),
  image_url: z.string().url("올바른 이미지 URL을 입력해주세요").optional(),
  stock_quantity: z.number().min(0, "재고는 0 이상이어야 합니다"),
});

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  created_by: string | null;
  created_at: string | null;
};

/**
 * 상품 목록 조회
 */
export async function getProducts(page: number = 1, limit: number = 12): Promise<{
  products: Product[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    console.group("📦 상품 목록 조회");
    console.log("페이지:", page, "제한:", limit);

    const supabase = await createServerSupabaseClient();
    const offset = (page - 1) * limit;

    // 전체 상품 수 조회
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // 상품 목록 조회
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("상품 목록 조회 오류:", error);
      throw new Error("상품 목록을 불러오는 중 오류가 발생했습니다.");
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log("조회된 상품 수:", products?.length || 0);
    console.log("전체 상품 수:", totalCount);
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
    const { data: { user } } = await supabase.auth.getUser();
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
    };

    console.log("상품 데이터:", productData);

    // 데이터 유효성 검사
    const validatedData = ProductSchema.parse(productData);

    // 상품 생성
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("상품 생성 오류:", error);
      throw new Error("상품 생성 중 오류가 발생했습니다.");
    }

    console.log("상품 생성 완료:", product.id);
    console.groupEnd();

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      success: true,
      message: "상품이 성공적으로 생성되었습니다.",
      productId: product.id,
    };
  } catch (error) {
    console.error("상품 생성 실패:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: `유효성 검사 실패: ${error.errors[0].message}`,
      };
    }
    return {
      success: false,
      message: "상품 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 상품 수정 (관리자만)
 */
export async function updateProduct(
  id: number,
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.group("✏️ 상품 수정");
    console.log("상품 ID:", id);

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
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
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

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