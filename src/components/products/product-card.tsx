/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 이 컴포넌트는 상품 목록에서 각 상품을 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지 표시 (Next.js Image 최적화)
 * 2. 상품 정보 표시 (이름, 가격, 재고)
 * 3. 상품 상세 페이지로 이동 링크
 * 4. 재고 부족 시 시각적 표시
 * 5. 반응형 디자인 지원
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/link: 클라이언트 사이드 라우팅
 * - @/components/ui: ShadcnUI 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package } from "lucide-react";
import type { Product } from "@/actions/products";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  onAddToCart?: (productId: number) => void;
}

export function ProductCard({ 
  product, 
  showAddToCart = true,
  onAddToCart 
}: ProductCardProps) {
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

  console.log("🃏 ProductCard 렌더링:", product.name);

  // 장바구니 추가 핸들러
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 이벤트 방지
    console.log("🛒 장바구니 추가:", product.name);
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product.id);
    }
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <CardContent className="p-0">
          {/* 상품 이미지 */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* 재고 상태 배지 */}
            {isOutOfStock && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 left-2"
              >
                품절
              </Badge>
            )}
            {isLowStock && (
              <Badge 
                variant="outline" 
                className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 border-yellow-200"
              >
                재고 부족
              </Badge>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="p-4 space-y-3">
            {/* 상품명 */}
            <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[3rem]">
              {product.name}
            </h3>

            {/* 가격 정보 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}원
                </span>
                <span className="text-sm text-gray-500">
                  재고 {product.stock_quantity}개
                </span>
              </div>
            </div>

            {/* 장바구니 담기 버튼 */}
            {showAddToCart && (
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isOutOfStock ? "품절" : "장바구니 담기"}
              </Button>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
} 