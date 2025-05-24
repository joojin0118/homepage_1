/**
 * @file file-list.tsx
 * @description Supabase Storage 파일 목록 컴포넌트
 *
 * 저장된 파일 목록을 표시하고 삭제 기능을 제공합니다.
 * 이미지 파일인 경우 썸네일을 보여주고, 그 외의 경우 파일 아이콘을 표시합니다.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Trash2,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { deleteFile, getPublicUrl, listFiles } from "@/utils/supabase/storage";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FileListProps = {
  files: Array<{ id?: string; name: string; metadata?: any }>;
  onDelete?: (path: string) => void;
  onRefresh?: () => void;
};

export function FileList({
  files: initialFiles,
  onDelete,
  onRefresh,
}: FileListProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [filesToShow, setFilesToShow] = useState(initialFiles);

  // 컴포넌트 마운트 시 및 파일 목록 변경 시 이미지 URL 생성
  useEffect(() => {
    const urls: Record<string, string> = {};

    filesToShow.forEach((file) => {
      if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && file.metadata) {
        urls[file.name] = getPublicUrl(file.name);
      }
    });

    setImageUrls(urls);
  }, [filesToShow]);

  // 파일 목록 새로고침
  const refreshFileList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedFiles = await listFiles();
      setFilesToShow(fetchedFiles);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "파일 목록을 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 타입에 따른 아이콘 선택
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (["pdf", "doc", "docx", "txt", "md"].includes(ext || "")) {
      return <FileTextIcon className="w-5 h-5" />;
    }

    return <FileIcon className="w-5 h-5" />;
  };

  // 파일 삭제 확인 다이얼로그 열기
  const openDeleteConfirm = (path: string) => {
    setCurrentFile(path);
    setConfirmDialogOpen(true);
  };

  // 파일 삭제 실행
  const handleDelete = async () => {
    if (!currentFile) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteFile(currentFile);

      if (!result.success) {
        throw new Error(result.error || "파일 삭제 중 오류가 발생했습니다.");
      }

      // 삭제 후 상위 컴포넌트에 알림
      if (onDelete) {
        onDelete(currentFile);
      } else {
        refreshFileList();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "파일 삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
    }
  };

  // 리스트 새로고침
  const handleRefresh = () => {
    setError(null);
    if (onRefresh) {
      onRefresh();
    } else {
      refreshFileList();
    }
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  // 파일이 없는 경우
  if (!filesToShow.length) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">파일 목록</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            title="새로고침"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">파일이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">파일 목록</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          title="새로고침"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filesToShow.map((file) => {
          const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const publicUrl = imageUrls[file.name] || getPublicUrl(file.name);

          return (
            <div
              key={file.id}
              className="group border rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div className="aspect-square relative bg-muted rounded-md mb-2 overflow-hidden">
                {isImage ? (
                  <>
                    {publicUrl ? (
                      <Image
                        src={publicUrl}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getFileIcon(file.name)}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start gap-2">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.metadata?.size
                      ? `${(file.metadata.size / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="새 탭에서 열기"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => openDeleteConfirm(file.name)}
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 삭제</DialogTitle>
            <DialogDescription>
              이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
