/**
 * @file storage.ts
 * @description Supabase Storage 유틸리티 함수 (공개 버킷)
 */

import { createBrowserSupabaseClient } from "./client";

// 환경변수에서 버킷 이름을 읽음
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

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
 * 버킷 내 파일 목록을 조회합니다.
 * @returns 파일 목록 또는 빈 배열
 */
export async function listFiles() {
  try {
    const supabase = createBrowserSupabaseClient();

    // 루트 경로에서 파일 목록 가져오기
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { sortBy: { column: "name", order: "asc" } });

    if (error) {
      console.error("Storage listFiles error:", error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error("Storage listFiles exception:", err);
    return [];
  }
}

/**
 * 공개 버킷의 파일에 대한 public URL을 반환합니다.
 * @param path 파일 경로
 * @returns 파일의 공개 URL
 */
export function getPublicUrl(path: string): string {
  try {
    if (!path) return "";

    const supabase = createBrowserSupabaseClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return data?.publicUrl || "";
  } catch (err) {
    console.error("Storage getPublicUrl exception:", err);
    return "";
  }
}

/**
 * 버킷에 파일을 업로드합니다.
 * @param file 업로드할 파일
 * @param fileName 저장할 파일명 (선택사항, 지정하지 않으면 원본 파일명 사용)
 * @returns 업로드 결과와 공개 URL
 */
export async function uploadFile(
  file: File,
  fileName?: string,
): Promise<{
  success: boolean;
  error?: string;
  fileName?: string;
  publicUrl?: string;
}> {
  try {
    if (!file) {
      return { success: false, error: "업로드할 파일이 없습니다." };
    }

    const supabase = createBrowserSupabaseClient();

    // 파일명 설정 (타임스탬프 + 안전한 파일명)
    const safeFileName = sanitizeFileName(file.name);
    const finalFileName = fileName || `${Date.now()}-${safeFileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(finalFileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Storage uploadFile error:", error.message);
      return { success: false, error: error.message };
    }

    // 공개 URL 생성
    const publicUrl = getPublicUrl(finalFileName);

    return {
      success: true,
      fileName: finalFileName,
      publicUrl,
    };
  } catch (err) {
    console.error("Storage uploadFile exception:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "파일 업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 버킷에서 파일을 삭제합니다.
 * @param path 삭제할 파일 경로
 * @returns 성공 여부와 오류 메시지
 */
export async function deleteFile(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path) {
      return { success: false, error: "삭제할 파일 경로가 필요합니다." };
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    if (error) {
      console.error("Storage deleteFile error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Storage deleteFile exception:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "파일 삭제 중 오류가 발생했습니다.",
    };
  }
}
