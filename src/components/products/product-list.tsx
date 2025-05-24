/**
 * @file product-list.tsx
 * @description 상품 목록 컴포넌트
 *
 * 이 컴포넌트는 상품들을 그리드 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 상품 그리드 레이아웃 (반응형)
 * 2. 로딩 상태 표시 (스켈레톤 UI)
 * 3. 빈 상태 처리
 * 4. 에러 상태 처리
 * 5. 장바구니 추가 기능 연동
 *
 * @dependencies
 * - @/components/products/product-card: 상품 카드 컴포넌트
 * - @/components/ui: ShadcnUI 컴포넌트
 * - lucide-react: 아이콘
 */

import { ProductCard } from "./product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertCircle } from "lucide-react";
import type { Product } from "@/actions/products";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  error?: string;
  onAddToCart?: (productId: number) => void;
}

export function ProductList({ 
  products, 
  isLoading = false, 
  error,
  onAddToCart 
}: ProductListProps) {
  console.group("📋 상품 목록 렌더링");
  console.log("상품 수:", products.length);
  console.log("로딩 상태:", isLoading);
  console.log("에러:", error);
  console.groupEnd();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 빈 상태
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          상품이 없습니다
        </h3>
        <p className="text-gray-500 max-w-md">
          아직 등록된 상품이 없습니다. 관리자가 상품을 등록하면 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  // 상품 목록
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

// 상품 카드 스켈레톤 컴포넌트
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* 이미지 스켈레톤 */}
        <Skeleton className="aspect-square w-full" />
        
        {/* 상품 정보 스켈레톤 */}
        <div className="p-4 space-y-3">
          {/* 상품명 스켈레톤 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* 가격 정보 스켈레톤 */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          {/* 버튼 스켈레톤 */}
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
} 