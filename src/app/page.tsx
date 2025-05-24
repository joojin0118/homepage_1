/**
 * @file page.tsx
 * @description Supabase Storage 드롭박스 스타일 업로드/리스트 페이지
 *
 * - 파일 업로드 후 즉시 리스트에 반영
 * - 진입 시 파일 목록 조회
 * - 이미지/문서 미리보기 및 다운로드 링크 제공
 * - 누구나 업로드/조회 가능 (공개 버킷)
 */

"use client";

import { useEffect, useState } from "react";
import { listFiles } from "@/utils/supabase/storage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/components/nav/navbar";
import { FileUploader } from "@/components/storage/file-uploader";
import { FileList } from "@/components/storage/file-list";

const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "test-bucket";

export default function UploadPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 파일 목록 조회
  const fetchFiles = async () => {
    setIsLoading(true);
    setError("");

    try {
      const fileList = await listFiles();
      setFiles(fileList);
    } catch (err) {
      console.error("파일 목록 조회 오류:", err);
      setError("파일 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 파일 목록 조회
  useEffect(() => {
    fetchFiles();
  }, []);

  // 업로드 성공 핸들러
  const handleUploadSuccess = () => {
    fetchFiles(); // 파일 목록 새로고침
  };

  // 업로드 오류 핸들러
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 파일 삭제 핸들러
  const handleFileDeleted = () => {
    fetchFiles(); // 파일 목록 새로고침
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h1 className="text-3xl font-bold mb-6">파일 업로드</h1>

            <FileUploader
              bucketName={BUCKET_NAME}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </section>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <section className="pt-4">
            {isLoading ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center animate-pulse">
                <p className="text-muted-foreground">
                  파일 목록을 불러오는 중...
                </p>
              </div>
            ) : (
              <FileList
                files={files}
                onDelete={handleFileDeleted}
                onRefresh={fetchFiles}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
