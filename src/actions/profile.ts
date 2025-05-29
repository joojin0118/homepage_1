/**
 * @file profile.ts
 * @description 사용자 프로필 관련 서버 액션
 *
 * 주요 기능:
 * 1. 프로필 조회
 * 2. 프로필 업데이트 (이름 수정)
 * 3. 프로필 생성 (자동)
 *
 * @dependencies
 * - @/utils/supabase/server: 서버 Supabase 클라이언트
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 프로필 업데이트 스키마
const ProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "이름은 최소 1글자 이상이어야 합니다.")
    .max(50, "이름은 50글자를 초과할 수 없습니다."),
});

// 프로필 타입
export interface ProfileData {
  id: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
}

/**
 * 현재 사용자의 프로필 조회
 */
export async function getCurrentProfile(): Promise<{
  profile: ProfileData | null;
  error?: string;
}> {
  try {
    console.log("🔍 프로필 조회 시작");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ 인증되지 않은 사용자");
      return { profile: null, error: "로그인이 필요합니다." };
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, is_admin, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("프로필 조회 오류:", profileError);
      return { profile: null, error: "프로필 조회 중 오류가 발생했습니다." };
    }

    // 프로필이 존재하지 않는 경우 자동 생성
    if (!profile) {
      console.log("프로필이 존재하지 않음. 새 프로필 생성 중...");

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            name: user.user_metadata?.name || null,
            is_admin: false,
          },
        ])
        .select("id, name, is_admin, created_at")
        .single();

      if (insertError) {
        console.error("프로필 생성 오류:", insertError);
        return { profile: null, error: "프로필 생성 중 오류가 발생했습니다." };
      }

      console.log("새 프로필 생성 완료:", newProfile);
      return { profile: newProfile };
    }

    console.log("프로필 조회 완료:", profile);
    return { profile };
  } catch (error) {
    console.error("프로필 조회 중 예외:", error);
    return {
      profile: null,
      error:
        error instanceof Error
          ? error.message
          : "프로필 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필 업데이트 (이름 수정)
 */
export async function updateProfile(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  profile?: ProfileData;
}> {
  try {
    console.log("✏️ 프로필 업데이트 시작");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ 인증되지 않은 사용자");
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 폼 데이터 파싱 및 검증
    const name = formData.get("name") as string;

    const validationResult = ProfileUpdateSchema.safeParse({ name });
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.errors[0]?.message ||
        "입력값이 올바르지 않습니다.";
      console.log("❌ 유효성 검사 실패:", errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log("업데이트할 이름:", name);

    // 프로필 업데이트
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ name: validationResult.data.name })
      .eq("id", user.id)
      .select("id, name, is_admin, created_at")
      .single();

    if (updateError) {
      console.error("프로필 업데이트 오류:", updateError);
      return {
        success: false,
        error: "프로필 업데이트 중 오류가 발생했습니다.",
      };
    }

    console.log("프로필 업데이트 완료:", updatedProfile);

    // 페이지 캐시 재검증
    revalidatePath("/profile");

    return {
      success: true,
      profile: updatedProfile,
    };
  } catch (error) {
    console.error("프로필 업데이트 중 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 업데이트 중 오류가 발생했습니다.",
    };
  }
}
