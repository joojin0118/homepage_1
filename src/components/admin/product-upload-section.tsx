/**
 * @file product-upload-section.tsx
 * @description 관리자 페이지의 상품 업로드 섹션
 *
 * 주요 기능:
 * 1. 상품 생성 및 파일 업로드 통합 UI
 * 2. 섹션 헤더 및 설명
 * 3. 상품 생성 성공 시 콜백 처리
 *
 * @dependencies
 * - @/components/admin/product-upload: 상품 업로드 컴포넌트
 * - @/components/ui: ShadCN UI 컴포넌트들
 * - lucide-react: 아이콘
 */

"use client";

import { useState } from "react";
import { ProductUpload } from "@/components/admin/product-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ProductUploadSection() {
  const [lastCreatedProduct, setLastCreatedProduct] = useState<{
    id: number;
    timestamp: Date;
  } | null>(null);

  // 상품 생성 성공 콜백
  const handleProductCreated = (productId: number) => {
    console.log("✅ 상품 생성 완료 콜백:", productId);
    setLastCreatedProduct({
      id: productId,
      timestamp: new Date(),
    });

    // 5초 후 알림 자동 제거
    setTimeout(() => {
      setLastCreatedProduct(null);
    }, 10000);
  };

  return (
    <section className="bg-white rounded-lg border p-6">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">새 상품 등록</h2>
            <p className="text-gray-600 mt-1">
              이미지와 함께 상품 정보를 입력하여 새로운 상품을 등록하세요.
            </p>
          </div>
        </div>

        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            상품 관리
          </Button>
        </Link>
      </div>

      {/* 최근 생성된 상품 알림 */}
      {lastCreatedProduct && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800">
              상품이 성공적으로 등록되었습니다! (상품 ID:{" "}
              {lastCreatedProduct.id})
            </span>
            <div className="flex space-x-2">
              <Link href={`/products/${lastCreatedProduct.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:text-green-900"
                >
                  상품 보기
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:text-green-900"
                >
                  관리 페이지
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 상품 업로드 폼 */}
      <ProductUpload onProductCreated={handleProductCreated} />

      {/* 도움말 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          💡 상품 등록 도움말
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • 고화질 이미지를 사용하면 더 좋은 판매 효과를 얻을 수 있습니다
          </li>
          <li>• 상품명은 검색에서 중요하므로 구체적으로 작성해주세요</li>
          <li>• 카테고리를 정확히 선택하면 고객이 쉽게 찾을 수 있습니다</li>
          <li>• 상품 설명에 재료, 사이즈, 사용법 등을 포함해주세요</li>
        </ul>
      </div>
    </section>
  );
}
