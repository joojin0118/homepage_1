/**
 * @file file-upload.tsx
 * @description 관리자용 드래그앤드롭 파일 업로드 컴포넌트
 *
 * 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 UI
 * 2. 파일 선택 버튼
 * 3. 업로드 성공/실패 메시지 표시
 * 4. 파일 타입 및 크기 제한 표시
 *
 * 핵심 구현 로직:
 * - React Hook Form을 사용한 폼 관리
 * - 드래그앤드롭 이벤트 처리
 * - 서버 액션을 통한 파일 업로드
 * - 실시간 UI 상태 업데이트
 *
 * @dependencies
 * - react-hook-form: 폼 관리
 * - @/actions/upload: 파일 업로드 서버 액션
 * - @/components/ui: ShadCN UI 컴포넌트들
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { uploadFile } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";

type FileUploadProps = {
  onUploadSuccess?: (fileName: string) => void;
};

type UploadState = {
  isUploading: boolean;
  isDragActive: boolean;
  message: string;
  isSuccess: boolean;
  fileName?: string;
};

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  console.log("📤 FileUpload 컴포넌트 렌더링");

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isDragActive: false,
    message: "",
    isSuccess: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const selectedFile = watch("file");

  // 드래그앤드롭 이벤트 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🎯 파일 드래그 진입");
    setUploadState((prev) => ({ ...prev, isDragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 드롭 영역을 완전히 벗어났을 때만 비활성화
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      console.log("🎯 파일 드래그 이탈");
      setUploadState((prev) => ({ ...prev, isDragActive: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log("📁 파일 드롭됨");
      setUploadState((prev) => ({ ...prev, isDragActive: false }));

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        console.log(
          "선택된 파일:",
          file.name,
          "크기:",
          file.size,
          "타입:",
          file.type,
        );

        // FileList 형태로 setValue에 전달
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        setValue("file", dataTransfer.files);

        console.log("✅ 파일이 폼에 설정됨");
      }
    },
    [setValue],
  );

  // 파일 선택 버튼 클릭
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 파일 input 변경 핸들러
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        console.log(
          "파일 선택 버튼으로 선택된 파일:",
          file.name,
          "크기:",
          file.size,
          "타입:",
          file.type,
        );
        setValue("file", files);
        console.log("✅ 파일이 폼에 설정됨 (버튼 선택)");
      }
    },
    [setValue],
  );

  // 파일 업로드 처리
  const onSubmit = useCallback(
    async (data: any) => {
      console.group("📤 파일 업로드 시작");
      console.log("폼 데이터:", data);

      const fileList = data.file as FileList;
      if (!fileList || fileList.length === 0) {
        console.log("❌ 선택된 파일 없음");
        setUploadState((prev) => ({
          ...prev,
          message: "파일을 선택해주세요.",
          isSuccess: false,
        }));
        console.groupEnd();
        return;
      }

      const file = fileList[0];
      console.log("업로드할 파일:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      // 파일 타입 검증 (클라이언트 측)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        console.log("❌ 허용되지 않은 파일 타입:", file.type);
        setUploadState((prev) => ({
          ...prev,
          message:
            "지원하지 않는 파일 형식입니다. (이미지, PDF, 문서 파일만 가능)",
          isSuccess: false,
        }));
        console.groupEnd();
        return;
      }

      // 파일 크기 검증 (클라이언트 측)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.log("❌ 파일 크기 초과:", file.size);
        setUploadState((prev) => ({
          ...prev,
          message: "파일 크기는 10MB 이하여야 합니다.",
          isSuccess: false,
        }));
        console.groupEnd();
        return;
      }

      setUploadState((prev) => ({
        ...prev,
        isUploading: true,
        message: "파일을 업로드하는 중...",
        isSuccess: false,
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);

        console.log("FormData 생성 완료, 서버 액션 호출 중...");

        const result = await uploadFile(formData);

        console.log("서버 액션 결과:", result);

        if (result.success) {
          console.log("✅ 업로드 성공:", result.fileName);
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            message: `파일 업로드 완료: ${result.fileName}`,
            isSuccess: true,
            fileName: result.fileName,
          }));

          // 폼 리셋
          reset();

          // 성공 콜백 호출
          if (onUploadSuccess && result.fileName) {
            onUploadSuccess(result.fileName);
          }
        } else {
          console.log("❌ 업로드 실패:", result.error);
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            message: result.error || "업로드에 실패했습니다.",
            isSuccess: false,
          }));
        }
      } catch (error) {
        console.error("업로드 중 오류:", error);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          message: `업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
          isSuccess: false,
        }));
      }

      console.groupEnd();
    },
    [reset, onUploadSuccess],
  );

  // 메시지 닫기
  const clearMessage = useCallback(() => {
    setUploadState((prev) => ({ ...prev, message: "", isSuccess: false }));
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 드래그앤드롭 영역 */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${
              uploadState.isDragActive
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${uploadState.isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {/* 아이콘 */}
            <div className="mx-auto w-12 h-12">
              {uploadState.isDragActive ? (
                <Upload className="w-full h-full text-orange-500" />
              ) : (
                <File className="w-full h-full text-gray-400" />
              )}
            </div>

            {/* 메시지 */}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploadState.isDragActive
                  ? "파일을 여기에 놓으세요"
                  : "파일을 드래그하여 업로드"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                또는 클릭하여 파일을 선택하세요
              </p>
            </div>

            {/* 파일 선택 버튼 */}
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={uploadState.isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              파일 선택
            </Button>

            {/* 선택된 파일 표시 */}
            {selectedFile && selectedFile.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">
                  선택된 파일: {selectedFile[0].name}
                </p>
                <p className="text-xs text-gray-600">
                  크기: {(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* 숨겨진 파일 input */}
            <input
              {...register("file")}
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
              onChange={handleFileInputChange}
            />
          </div>
        </div>

        {/* 파일 제한 안내 */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 지원 형식: JPG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX</p>
          <p>• 최대 크기: 10MB</p>
        </div>

        {/* 업로드 버튼 */}
        <Button
          type="submit"
          className="w-full"
          disabled={
            uploadState.isUploading ||
            !selectedFile ||
            selectedFile.length === 0
          }
        >
          {uploadState.isUploading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              업로드 중...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              업로드
            </>
          )}
        </Button>
      </form>

      {/* 업로드 상태 메시지 */}
      {uploadState.message && (
        <Alert
          className={`mt-4 ${uploadState.isSuccess ? "border-green-200 bg-green-50" : ""}`}
          variant={uploadState.isSuccess ? "default" : "destructive"}
        >
          {uploadState.isSuccess ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span>{uploadState.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessage}
              className="h-auto p-1 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
