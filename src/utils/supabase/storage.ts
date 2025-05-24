/**
 * @file storage.ts
 * @description Supabase Storage 유틸리티 함수 (공개 버킷)
 */

import { createBrowserSupabaseClient } from "./client";

// 환경변수에서 버킷 이름을 읽음
const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

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
