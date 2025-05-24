/**
 * @file file-uploader.tsx
 * @description 드래그 앤 드롭 파일 업로드 컴포넌트
 *
 * 파일을 드래그 앤 드롭하거나 파일 선택 다이얼로그를 통해 업로드할 수 있는 UI를 제공합니다.
 * 진행률 표시와 오류 처리 기능을 포함합니다.
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUploadUrl } from "@/actions/storage";

type FileUploaderProps = {
  onUploadSuccess?: (path: string) => void;
  onUploadError?: (error: string) => void;
  bucketName?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
};

export function FileUploader({
  onUploadSuccess,
  onUploadError,
  bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket",
  allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ],
  maxFileSize = 10 * 1024 * 1024, // 10MB 기본값
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      if (!allowedFileTypes.includes(file.type)) {
        setError("지원되지 않는 파일 형식입니다.");
        return false;
      }

      if (file.size > maxFileSize) {
        setError(
          `파일 크기는 ${maxFileSize / (1024 * 1024)}MB 이하여야 합니다.`,
        );
        return false;
      }

      return true;
    },
    [allowedFileTypes, maxFileSize, setError],
  );

  const uploadWithProgress = useCallback(
    async (file: File) => {
      if (!validateFile(file)) {
        return;
      }

      resetState();
      setIsUploading(true);

      try {
        // 서버에서 서명된 URL 가져오기
        const ext = file.name.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const uploadUrlResult = await getUploadUrl(
          uniqueName,
          file.type,
          bucketName,
        );

        if (uploadUrlResult.error || !uploadUrlResult.url) {
          throw new Error(
            uploadUrlResult.error || "업로드 URL을 생성하지 못했습니다.",
          );
        }

        // XHR을 사용하여 업로드 진행률 추적
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrlResult.url);
        xhr.setRequestHeader("Content-Type", file.type);

        // 업로드 진행률 이벤트 리스너
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setProgress(percentage);
          }
        });

        // 업로드 완료 및 오류 처리
        return new Promise<void>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(100);
              onUploadSuccess?.(uploadUrlResult.path);
              resolve();
            } else {
              reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("네트워크 오류가 발생했습니다."));
          };

          xhr.send(file);
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.";
        setError(errorMessage);
        onUploadError?.(errorMessage);
      } finally {
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      }
    },
    [
      bucketName,
      onUploadError,
      onUploadSuccess,
      resetState,
      setIsUploading,
      setProgress,
      validateFile,
    ],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length) {
        uploadWithProgress(files[0]);
      }
    },
    [uploadWithProgress],
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadWithProgress(files[0]);
      }
      // 동일한 파일 재선택 허용을 위해 value 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadWithProgress],
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={allowedFileTypes.join(",")}
      />

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors min-h-32 flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <Upload className="w-10 h-10 mb-2 text-muted-foreground" />
        <p className="text-sm text-center text-muted-foreground">
          파일을 여기에 끌어다 놓거나{" "}
          <span className="font-medium text-primary">파일 선택</span>
        </p>
        <p className="mt-1 text-xs text-center text-muted-foreground">
          최대 {maxFileSize / (1024 * 1024)}MB,{" "}
          {allowedFileTypes
            .map((type) => type.replace("image/", "."))
            .join(", ")}{" "}
          형식
        </p>

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <Progress value={progress} className="w-3/4 h-2 mb-2" />
            <p className="text-sm font-medium">{progress}% 업로드 중...</p>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
