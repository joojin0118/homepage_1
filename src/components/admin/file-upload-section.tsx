/**
 * @file file-upload-section.tsx
 * @description 관리자 파일 업로드 섹션 클라이언트 컴포넌트
 *
 * 주요 기능:
 * 1. 파일 업로드 섹션 UI
 * 2. 업로드 성공 후 페이지 리프레시 처리
 *
 * 핵심 구현 로직:
 * - 클라이언트 컴포넌트에서 이벤트 핸들러 정의
 * - FileUpload 컴포넌트와 연동
 * - 업로드 성공 시 페이지 새로고침
 *
 * @dependencies
 * - @/components/admin/file-upload: 드래그앤드롭 업로드 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { FileUpload } from "./file-upload";
import { Upload } from "lucide-react";

export function FileUploadSection() {
  // 업로드 성공 핸들러 (클라이언트 컴포넌트 내부에서 정의)
  const handleUploadSuccess = (fileName: string) => {
    console.log("📤 파일 업로드 성공 콜백:", fileName);
    // 페이지 새로고침으로 파일 목록 업데이트
    window.location.reload();
  };

  return (
    <section className="bg-white rounded-lg border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Upload className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">파일 업로드</h2>
      </div>

      <div className="max-w-2xl">
        <p className="text-gray-600 mb-6">
          이미지, 문서 등의 파일을 업로드하고 관리할 수 있습니다.
          드래그앤드롭으로 간편하게 업로드해보세요.
        </p>

        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>
    </section>
  );
}
