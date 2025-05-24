/**
 * @file upload.ts
 * @description Supabase Storage 파일 업로드 서버 액션 (인증 불필요)
 *
 * 누구나 파일을 업로드할 수 있습니다. 업로드 성공 시 파일 경로를 반환합니다.
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const UploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "파일 크기는 10MB 이하여야 합니다.",
    )
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file.type),
      "지원되지 않는 파일 형식입니다.",
    ),
  bucketName: z.string().min(1),
});

export async function uploadFile(formData: FormData) {
  try {
    // 인증 없이 Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();
    const file = formData.get("file") as File;
    let bucketName = formData.get("bucketName") as string;
    if (!bucketName) {
      bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";
    }

    const validationResult = UploadSchema.safeParse({ file, bucketName });
    if (!validationResult.success) {
      return { error: validationResult.error.message };
    }

    // 파일명 중복 방지: timestamp + 랜덤값
    const ext = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueName, file, {
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage upload error:", error);
      return { error: error.message };
    }
    return { success: true, path: uniqueName };
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 업로드 URL을 생성하는 서버 액션
 * 클라이언트에서 직접 업로드할 때 진행률을 추적하기 위해 사용
 */
export async function getUploadUrl(
  fileName: string,
  fileType: string,
  bucketName: string,
) {
  if (!fileName) {
    return { error: "파일 이름이 필요합니다." };
  }

  if (!fileType) {
    return { error: "파일 타입이 필요합니다." };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 버킷 이름 기본값 설정
    if (!bucketName) {
      bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";
    }

    // 유효한 파일 타입 확인
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return { error: "지원되지 않는 파일 형식입니다." };
    }

    // 업로드 URL 생성 (루트 경로에 직접 업로드)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(fileName);

    if (error) {
      console.error("Signed URL creation error:", error);
      return { error: error.message };
    }

    if (!data || !data.signedUrl) {
      return { error: "업로드 URL 생성에 실패했습니다." };
    }

    return {
      url: data.signedUrl,
      token: data.token,
      path: fileName,
    };
  } catch (error) {
    console.error("Get upload URL error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "업로드 URL 생성 중 오류가 발생했습니다.",
    };
  }
}
