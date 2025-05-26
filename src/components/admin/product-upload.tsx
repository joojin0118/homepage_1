/**
 * @file product-upload.tsx
 * @description 관리자용 상품 생성 및 파일 업로드 컴포넌트
 *
 * 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 UI
 * 2. 상품 정보 입력 (이름, 가격, 카테고리, 설명, 재고)
 * 3. 파일 업로드 및 상품 생성 통합 처리
 * 4. 업로드 성공/실패 메시지 표시
 *
 * 핵심 구현 로직:
 * - React Hook Form을 사용한 폼 관리
 * - 드래그앤드롭 이벤트 처리
 * - 서버 액션을 통한 파일 업로드 및 상품 생성
 * - 실시간 UI 상태 업데이트
 *
 * @dependencies
 * - react-hook-form: 폼 관리
 * - @/actions/upload: 파일 업로드 서버 액션
 * - @/actions/products: 상품 생성 서버 액션
 * - @/components/ui: ShadCN UI 컴포넌트들
 * - @/constants/categories: 카테고리 상수
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { uploadFile } from "@/actions/upload";
import { createProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  DollarSign,
  FileText,
  Hash,
} from "lucide-react";

type ProductUploadProps = {
  onProductCreated?: (productId: number) => void;
};

type UploadState = {
  isUploading: boolean;
  isDragActive: boolean;
  message: string;
  isSuccess: boolean;
  fileName?: string;
  productId?: number;
};

// 폼 데이터 타입
type ProductFormData = {
  file: FileList;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
};

export function ProductUpload({ onProductCreated }: ProductUploadProps) {
  console.log("🛍️ ProductUpload 컴포넌트 렌더링");

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    isDragActive: false,
    message: "",
    isSuccess: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock_quantity: 1,
    },
  });

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

  // 상품 생성 및 파일 업로드 처리
  const onSubmit = useCallback(
    async (data: ProductFormData) => {
      console.group("🛍️ 상품 생성 및 파일 업로드 시작");
      console.log("폼 데이터:", data);

      try {
        const fileList = data.file as FileList;
        if (!fileList || fileList.length === 0) {
          console.log("❌ 선택된 파일 없음");
          setUploadState((prev) => ({
            ...prev,
            message: "상품 이미지를 선택해주세요.",
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

        // 파일 타입 검증 (이미지만 허용)
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
          console.log("❌ 허용되지 않은 파일 타입:", file.type);
          setUploadState((prev) => ({
            ...prev,
            message: "상품 이미지는 JPG, PNG, GIF, WebP 형식만 지원합니다.",
            isSuccess: false,
          }));
          console.groupEnd();
          return;
        }

        // 파일 크기 검증 (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          console.log("❌ 파일 크기 초과:", file.size);
          setUploadState((prev) => ({
            ...prev,
            message: "이미지 크기는 5MB 이하여야 합니다.",
            isSuccess: false,
          }));
          console.groupEnd();
          return;
        }

        setUploadState((prev) => ({
          ...prev,
          isUploading: true,
          message: "상품을 등록하는 중...",
          isSuccess: false,
        }));

        // 1단계: 파일 업로드
        console.log("1️⃣ 파일 업로드 단계 시작...");
        const formData = new FormData();
        formData.append("file", file);

        let uploadResult;
        try {
          uploadResult = await uploadFile(formData);
          console.log("파일 업로드 결과:", uploadResult);
        } catch (uploadError) {
          console.error("❌ 파일 업로드 단계에서 오류:", uploadError);
          throw new Error(
            `파일 업로드 실패: ${uploadError instanceof Error ? uploadError.message : "알 수 없는 오류"}`,
          );
        }

        if (!uploadResult.success) {
          console.error("❌ 파일 업로드 실패:", uploadResult.error);
          throw new Error(uploadResult.error || "파일 업로드에 실패했습니다.");
        }

        // 2단계: 상품 생성
        console.log("2️⃣ 상품 생성 단계 시작...");
        console.log("상품 데이터:", {
          name: data.name,
          description: data.description,
          price: data.price,
          stock_quantity: data.stock_quantity,
          image_url: uploadResult.publicUrl,
        });

        const productFormData = new FormData();
        productFormData.append("name", data.name);
        productFormData.append("description", data.description || "");
        productFormData.append("price", data.price.toString());
        productFormData.append(
          "stock_quantity",
          data.stock_quantity.toString(),
        );
        productFormData.append("image_url", uploadResult.publicUrl || "");

        let productResult;
        try {
          productResult = await createProduct(productFormData);
          console.log("상품 생성 결과:", productResult);
        } catch (productError) {
          console.error("❌ 상품 생성 단계에서 오류:", productError);
          throw new Error(
            `상품 생성 실패: ${productError instanceof Error ? productError.message : "알 수 없는 오류"}`,
          );
        }

        if (productResult.success) {
          console.log("✅ 상품 생성 성공:", productResult.productId);
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            message: `상품 "${data.name}"이 성공적으로 등록되었습니다!`,
            isSuccess: true,
            fileName: uploadResult.fileName,
            productId: productResult.productId,
          }));

          // 폼 리셋
          reset();

          // 성공 콜백 호출
          if (onProductCreated && productResult.productId) {
            onProductCreated(productResult.productId);
          }
        } else {
          console.error("❌ 상품 생성 실패:", productResult.message);
          throw new Error(productResult.message || "상품 생성에 실패했습니다.");
        }
      } catch (error) {
        console.error("❌ 전체 프로세스에서 오류 발생:", error);

        // 에러 타입별로 구체적인 메시지 제공
        let errorMessage = "상품 등록 중 오류가 발생했습니다.";

        if (error instanceof Error) {
          errorMessage = error.message;
          console.error("오류 상세 정보:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        } else {
          console.error("알 수 없는 오류 타입:", typeof error, error);
        }

        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          message: errorMessage,
          isSuccess: false,
        }));
      } finally {
        console.groupEnd();
      }
    },
    [reset, onProductCreated],
  );

  // 메시지 닫기
  const clearMessage = useCallback(() => {
    setUploadState((prev) => ({ ...prev, message: "", isSuccess: false }));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 파일 업로드 영역 */}
        <div>
          <Label className="text-base font-medium text-gray-900 mb-3 block">
            상품 이미지 *
          </Label>
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
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
            <div className="space-y-3">
              {/* 아이콘 */}
              <div className="mx-auto w-10 h-10">
                {uploadState.isDragActive ? (
                  <Upload className="w-full h-full text-orange-500" />
                ) : (
                  <File className="w-full h-full text-gray-400" />
                )}
              </div>

              {/* 메시지 */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploadState.isDragActive
                    ? "이미지를 여기에 놓으세요"
                    : "이미지를 드래그하여 업로드"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  또는 클릭하여 파일을 선택하세요 (JPG, PNG, GIF, WebP / 최대
                  5MB)
                </p>
              </div>

              {/* 파일 선택 버튼 */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileSelect}
                disabled={uploadState.isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                이미지 선택
              </Button>

              {/* 선택된 파일 표시 */}
              {selectedFile && selectedFile.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    선택된 이미지: {selectedFile[0].name}
                  </p>
                  <p className="text-xs text-gray-600">
                    크기: {(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* 숨겨진 파일 input */}
              <input
                {...register("file", { required: "상품 이미지는 필수입니다" })}
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileInputChange}
              />
            </div>
          </div>
          {errors.file && (
            <p className="text-sm text-red-600 mt-1">{errors.file.message}</p>
          )}
        </div>

        {/* 상품 정보 입력 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 상품명 */}
          <div className="md:col-span-2">
            <Label
              htmlFor="name"
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Package className="w-4 h-4 mr-1" />
              상품명 *
            </Label>
            <Input
              id="name"
              {...register("name", { required: "상품명은 필수입니다" })}
              placeholder="상품명을 입력하세요"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 가격 */}
          <div>
            <Label
              htmlFor="price"
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              가격 *
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              {...register("price", {
                required: "가격은 필수입니다",
                min: { value: 0, message: "가격은 0원 이상이어야 합니다" },
              })}
              placeholder="0"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* 재고 */}
          <div>
            <Label
              htmlFor="stock_quantity"
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <Hash className="w-4 h-4 mr-1" />
              재고 수량 *
            </Label>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              {...register("stock_quantity", {
                required: "재고 수량은 필수입니다",
                min: { value: 0, message: "재고는 0개 이상이어야 합니다" },
              })}
              placeholder="1"
              className={errors.stock_quantity ? "border-red-500" : ""}
            />
            {errors.stock_quantity && (
              <p className="text-sm text-red-600 mt-1">
                {errors.stock_quantity.message}
              </p>
            )}
          </div>

          {/* 상품 설명 */}
          <div className="md:col-span-2">
            <Label
              htmlFor="description"
              className="flex items-center text-sm font-medium text-gray-900 mb-2"
            >
              <FileText className="w-4 h-4 mr-1" />
              상품 설명
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        {/* 등록 버튼 */}
        <Button
          type="submit"
          className="w-full"
          disabled={uploadState.isUploading}
          size="lg"
        >
          {uploadState.isUploading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              상품 등록 중...
            </>
          ) : (
            <>
              <Package className="w-4 h-4 mr-2" />
              상품 등록하기
            </>
          )}
        </Button>
      </form>

      {/* 상태 메시지 */}
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
