/**
 * @file file-list-client.tsx
 * @description 파일 목록 표시 및 관리 클라이언트 컴포넌트
 *
 * 주요 기능:
 * 1. 업로드된 파일 목록 표시 (그리드 레이아웃)
 * 2. 파일 삭제 기능
 * 3. 이미지 파일 미리보기
 * 4. 파일 정보 표시 (이름, 크기, 업로드 날짜)
 * 5. 파일 다운로드 링크
 *
 * 핵심 구현 로직:
 * - 클라이언트 컴포넌트에서 파일 삭제 인터랙션 처리
 * - 이미지 파일과 문서 파일 구분하여 다른 UI 표시
 * - 삭제 확인 다이얼로그
 * - 실시간 파일 목록 업데이트
 *
 * @dependencies
 * - @/actions/upload: 파일 삭제 서버 액션
 * - @/components/ui: ShadCN UI 컴포넌트들
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useCallback } from "react";
import { deleteFile } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  File,
  FileText,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  HardDrive,
} from "lucide-react";
import Image from "next/image";

// 파일 타입
type FileItem = {
  name: string;
  id: string;
  created_at: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
  publicUrl: string;
};

type FileListClientProps = {
  initialFiles: FileItem[];
};

export function FileListClient({ initialFiles }: FileListClientProps) {
  console.log(
    "📋 FileListClient 컴포넌트 렌더링, 파일 수:",
    initialFiles.length,
  );

  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // 파일 타입 확인
  const getFileType = useCallback((fileName: string): "image" | "document" => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const fileExtension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));
    return imageExtensions.includes(fileExtension) ? "image" : "document";
  }, []);

  // 파일 크기 포맷팅
  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return "알 수 없음";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // 날짜 포맷팅
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "날짜 불명";
    }
  }, []);

  // 파일 삭제 처리
  const handleDeleteFile = useCallback(async (fileName: string) => {
    console.group("🗑️ 파일 삭제 시작");
    console.log("삭제할 파일:", fileName);

    setDeletingFiles((prev) => new Set(prev.add(fileName)));
    setMessage(null);

    try {
      const result = await deleteFile(fileName);

      if (result.success) {
        console.log("✅ 파일 삭제 성공");

        // 파일 목록에서 제거
        setFiles((prev) => prev.filter((file) => file.name !== fileName));

        setMessage({
          text: `파일 "${fileName}"이 삭제되었습니다.`,
          type: "success",
        });
      } else {
        console.log("❌ 파일 삭제 실패:", result.error);
        setMessage({
          text: result.error || "파일 삭제에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("파일 삭제 중 오류:", error);
      setMessage({
        text: "파일 삭제 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }

    console.groupEnd();
  }, []);

  // 메시지 자동 숨김 처리
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  // 파일이 없는 경우
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <File className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          업로드된 파일이 없습니다
        </h3>
        <p className="text-gray-600">
          위에서 파일을 업로드하면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상태 메시지 */}
      {message && (
        <Alert
          className={
            message.type === "success" ? "border-green-200 bg-green-50" : ""
          }
          variant={message.type === "success" ? "default" : "destructive"}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span>{message.text}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessage}
              className="h-auto p-1 ml-2"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 파일 통계 */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>총 {files.length}개의 파일</span>
        <div className="flex items-center space-x-4">
          <span>
            이미지:{" "}
            {files.filter((f) => getFileType(f.name) === "image").length}개
          </span>
          <span>
            문서:{" "}
            {files.filter((f) => getFileType(f.name) === "document").length}개
          </span>
        </div>
      </div>

      {/* 파일 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => {
          const fileType = getFileType(file.name);
          const isDeleting = deletingFiles.has(file.name);

          return (
            <Card
              key={file.name}
              className={`overflow-hidden ${isDeleting ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* 파일 미리보기/아이콘 */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {fileType === "image" ? (
                      <Image
                        src={file.publicUrl}
                        alt={file.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("이미지 로드 실패:", file.name);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 파일 정보 */}
                  <div className="space-y-1">
                    <h3
                      className="font-medium text-sm truncate"
                      title={file.name}
                    >
                      {file.name}
                    </h3>

                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <HardDrive className="h-3 w-3" />
                      <span>{formatFileSize(file.metadata?.size)}</span>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(file.created_at)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    {/* 다운로드 버튼 */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                      disabled={isDeleting}
                    >
                      <a
                        href={file.publicUrl}
                        download={file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        다운로드
                      </a>
                    </Button>

                    {/* 삭제 버튼 */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {isDeleting ? (
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>파일 삭제 확인</AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{file.name}&quot; 파일을 삭제하시겠습니까?
                            <br />
                            삭제된 파일은 복구할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFile(file.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
