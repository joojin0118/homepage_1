/**
 * @file upload.ts
 * @description 관리자 전용 파일 업로드 서버 액션
 *
 * 주요 기능:
 * 1. 관리자 권한 확인
 * 2. 파일 업로드 (Supabase Storage)
 * 3. 파일 삭제
 * 4. 파일 목록 조회
 *
 * 핵심 구현 로직:
 * - 서버 액션에서 사용자 인증 상태 확인
 * - profiles 테이블의 is_admin 필드로 관리자 권한 검증
 * - Supabase Storage를 사용한 파일 업로드/삭제
 * - 파일 타입 및 크기 제한 (최대 10MB, 이미지/문서 파일만)
 *
 * @dependencies
 * - @/utils/supabase/server: 서버 컴포넌트용 Supabase 클라이언트
 * - @/utils/supabase/storage: Storage 유틸리티 함수
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 파일 업로드 결과 타입
type UploadResult = {
  success: boolean;
  error?: string;
  fileName?: string;
  publicUrl?: string;
};

// 파일 삭제 결과 타입
type DeleteResult = {
  success: boolean;
  error?: string;
};

// 허용되는 파일 타입
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 파일명을 안전한 형태로 변환하는 함수
 * 한글, 특수문자, 공백 등을 제거하고 영문, 숫자, 하이픈, 언더스코어만 허용
 */
function sanitizeFileName(fileName: string): string {
  // 파일명과 확장자 분리
  const lastDotIndex = fileName.lastIndexOf(".");
  const name =
    lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";

  // 파일명 정리: 한글, 특수문자 제거 후 영문/숫자/하이픈/언더스코어만 유지
  const sanitizedName = name
    .replace(/[^\w\s-]/g, "") // 영문, 숫자, 공백, 하이픈, 언더스코어만 유지
    .replace(/\s+/g, "_") // 공백을 언더스코어로 변경
    .replace(/_{2,}/g, "_") // 연속된 언더스코어를 하나로 합침
    .toLowerCase(); // 소문자로 변환

  // 빈 문자열인 경우 기본값 설정
  const finalName = sanitizedName || "file";

  return finalName + extension.toLowerCase();
}

/**
 * 현재 사용자가 관리자인지 확인
 */
async function checkAdminPermission(): Promise<{
  isAdmin: boolean;
  error?: string;
}> {
  try {
    console.group("🔐 관리자 권한 확인");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ 인증되지 않은 사용자");
      console.groupEnd();
      return { isAdmin: false, error: "로그인이 필요합니다." };
    }

    console.log("✅ 사용자 인증 확인:", user.id);

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("❌ 프로필 조회 실패:", profileError.message);
      console.groupEnd();
      return { isAdmin: false, error: "사용자 정보를 확인할 수 없습니다." };
    }

    const isAdmin = profile?.is_admin === true;
    console.log("관리자 권한:", isAdmin ? "✅ 있음" : "❌ 없음");
    console.groupEnd();

    return {
      isAdmin,
      error: isAdmin ? undefined : "관리자 권한이 필요합니다.",
    };
  } catch (error) {
    console.error("관리자 권한 확인 중 오류:", error);
    console.groupEnd();
    return { isAdmin: false, error: "권한 확인 중 오류가 발생했습니다." };
  }
}

/**
 * 파일 업로드 서버 액션
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  try {
    console.group("📤 파일 업로드 시작");

    // 관리자 권한 확인
    const { isAdmin, error: permissionError } = await checkAdminPermission();
    if (!isAdmin) {
      console.log("❌ 권한 없음:", permissionError);
      console.groupEnd();
      return { success: false, error: permissionError };
    }

    // 파일 추출
    const file = formData.get("file") as File;
    if (!file) {
      console.log("❌ 파일이 선택되지 않음");
      console.groupEnd();
      return { success: false, error: "파일을 선택해주세요." };
    }

    console.log(
      "선택된 파일:",
      file.name,
      "크기:",
      file.size,
      "타입:",
      file.type,
    );

    // 파일 타입 검증
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.log("❌ 허용되지 않은 파일 타입:", file.type);
      console.groupEnd();
      return {
        success: false,
        error: "지원하지 않는 파일 형식입니다. (이미지, PDF, 문서 파일만 가능)",
      };
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      console.log("❌ 파일 크기 초과:", file.size);
      console.groupEnd();
      return {
        success: false,
        error: "파일 크기는 10MB 이하여야 합니다.",
      };
    }

    // 파일명 생성 (타임스탬프 + 안전한 파일명)
    const timestamp = Date.now();
    const safeFileName = sanitizeFileName(file.name);
    const fileName = `${timestamp}-${safeFileName}`;

    console.log("원본 파일명:", file.name);
    console.log("안전한 파일명:", safeFileName);
    console.log("최종 업로드 파일명:", fileName);

    // Supabase Storage에 업로드
    const supabase = await createServerSupabaseClient();
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.log("❌ Storage 업로드 실패:", error.message);
      console.groupEnd();
      return { success: false, error: `업로드 실패: ${error.message}` };
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log("✅ 업로드 성공:", fileName);
    console.log("공개 URL:", urlData.publicUrl);
    console.groupEnd();

    // 관리자 페이지 캐시 재검증
    revalidatePath("/admin");

    return {
      success: true,
      fileName,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("파일 업로드 중 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 파일 삭제 서버 액션
 */
export async function deleteFile(fileName: string): Promise<DeleteResult> {
  try {
    console.group("🗑️ 파일 삭제 시작");
    console.log("삭제할 파일:", fileName);

    // 관리자 권한 확인
    const { isAdmin, error: permissionError } = await checkAdminPermission();
    if (!isAdmin) {
      console.log("❌ 권한 없음:", permissionError);
      console.groupEnd();
      return { success: false, error: permissionError };
    }

    if (!fileName) {
      console.log("❌ 파일명이 제공되지 않음");
      console.groupEnd();
      return { success: false, error: "삭제할 파일을 지정해주세요." };
    }

    // Supabase Storage에서 삭제
    const supabase = await createServerSupabaseClient();
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.log("❌ Storage 삭제 실패:", error.message);
      console.groupEnd();
      return { success: false, error: `삭제 실패: ${error.message}` };
    }

    console.log("✅ 삭제 성공:", fileName);
    console.groupEnd();

    // 관리자 페이지 캐시 재검증
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("파일 삭제 중 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 파일 목록 조회 서버 액션
 */
export async function getFileList(): Promise<{
  success: boolean;
  files?: any[];
  error?: string;
}> {
  try {
    console.group("📋 파일 목록 조회");

    // 관리자 권한 확인
    const { isAdmin, error: permissionError } = await checkAdminPermission();
    if (!isAdmin) {
      console.log("❌ 권한 없음:", permissionError);
      console.groupEnd();
      return { success: false, error: permissionError };
    }

    const supabase = await createServerSupabaseClient();
    const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

    const { data, error } = await supabase.storage.from(bucketName).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      console.log("❌ 파일 목록 조회 실패:", error.message);
      console.groupEnd();
      return { success: false, error: `조회 실패: ${error.message}` };
    }

    // 파일에 대한 공개 URL 추가
    const filesWithUrls =
      data?.map((file) => {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);

        return {
          ...file,
          publicUrl: urlData.publicUrl,
        };
      }) || [];

    console.log("✅ 파일 목록 조회 성공:", filesWithUrls.length, "개");
    console.groupEnd();

    return { success: true, files: filesWithUrls };
  } catch (error) {
    console.error("파일 목록 조회 중 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "목록 조회 중 오류가 발생했습니다.",
    };
  }
}
