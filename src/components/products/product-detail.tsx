/**
 * @file product-detail.tsx
 * @description 상품 상세 정보 컴포넌트
 *
 * 이 컴포넌트는 상품의 상세 정보를 표시하고 장바구니 담기, 바로 구매하기 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지 표시 (Next.js Image 최적화)
 * 2. 상품 정보 표시 (이름, 설명, 가격, 재고)
 * 3. 수량 선택 기능
 * 4. 장바구니 담기 기능
 * 5. 바로 구매하기 기능 (장바구니 거치지 않고 즉시 결제)
 * 6. 재고 상태 표시
 * 7. 반응형 레이아웃
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - next/navigation: 라우터 기능
 * - @/components/ui: ShadcnUI 컴포넌트
 * - lucide-react: 아이콘
 * - @/actions/products: 상품 타입
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Package,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import type { Product } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import { triggerCartUpdate } from "@/hooks/use-cart-count";

interface ProductDetailContainerProps {
  product: Product;
}

export function ProductDetailContainer({
  product,
}: ProductDetailContainerProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const router = useRouter();

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

  console.log("🛍️ ProductDetail 렌더링:", product.name);

  // 수량 증가
  const increaseQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  // 수량 감소
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // 장바구니 담기
  const handleAddToCart = async () => {
    if (!quantity || isLoading) return;

    console.log("🛒 장바구니 추가", product.name, "수량:", quantity);
    setIsLoading(true);

    try {
      const { addToCart } = await import("@/actions/cart");
      const result = await addToCart(product.id, quantity);

      if (result.success) {
        alert(result.message);

        // 수량 초기화
        setQuantity(1);

        // 장바구니 업데이트 이벤트 발생
        triggerCartUpdate();
      }
    } catch (error) {
      console.error("장바구니 추가 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "장바구니 추가 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 바로 구매하기
  const handleBuyNow = async () => {
    if (!quantity || isBuyingNow) return;

    console.group("💳 바로 구매하기");
    console.log(
      "상품:",
      product.name,
      "수량:",
      quantity,
      "가격:",
      product.price,
    );

    setIsBuyingNow(true);

    try {
      // 임시 주문 정보를 세션 스토리지에 저장
      const tempOrderData = {
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            product_image: product.image_url,
            quantity: quantity,
            price: product.price,
            total: product.price * quantity,
          },
        ],
        total_amount: product.price * quantity,
        is_direct_purchase: true, // 바로 구매 플래그
        timestamp: Date.now(),
      };

      sessionStorage.setItem(
        "direct_purchase_data",
        JSON.stringify(tempOrderData),
      );

      console.log("임시 주문 데이터 저장 완료");
      console.log("체크아웃 페이지로 이동...");
      console.groupEnd();

      // 체크아웃 페이지로 이동
      router.push("/checkout?direct=true");
    } catch (error) {
      console.error("바로 구매하기 실패:", error);
      console.groupEnd();

      const errorMessage =
        error instanceof Error
          ? error.message
          : "바로 구매하기 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}

                {/* 재고 상태 배지 */}
                {isOutOfStock && (
                  <Badge
                    variant="destructive"
                    className="absolute top-4 left-4"
                  >
                    품절
                  </Badge>
                )}
                {isLowStock && (
                  <Badge
                    variant="outline"
                    className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 border-yellow-200"
                  >
                    재고 부족
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 상품 특징 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Truck className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">무료배송</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">품질보증</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <RotateCcw className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600">교환/환불</p>
            </div>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {/* 상품명 */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* 평점 (임시) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(0개 리뷰)</span>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}원
              </span>
            </div>
            <p className="text-sm text-gray-600">
              재고: {product.stock_quantity}개 남음
            </p>
          </div>

          <Separator />

          {/* 상품 설명 */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">상품 설명</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {/* 수량 선택 */}
          {!isOutOfStock && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">수량 선택</h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="px-3"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock_quantity}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <span className="text-sm text-gray-600">
                  최대 {product.stock_quantity}개까지 선택 가능
                </span>
              </div>

              {/* 총 가격 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">총 가격</span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatPrice(product.price * quantity)}원
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 구매 버튼들 */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 h-12 text-lg"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isLoading
                ? "장바구니에 추가 중..."
                : isOutOfStock
                  ? "품절"
                  : "장바구니 담기"}
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isBuyingNow}
              variant="outline"
              className="w-full h-12 text-lg border-orange-500 text-orange-600 hover:bg-orange-50"
              size="lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {isBuyingNow
                ? "주문 처리 중..."
                : isOutOfStock
                  ? "품절"
                  : "바로 구매하기"}
            </Button>
          </div>

          {/* 배송 정보 */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="font-semibold mb-2 text-blue-900">배송 정보</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 무료배송 (제주도 및 도서산간 지역 추가 배송비 발생)</li>
              <li>• 평일 오후 2시 이전 주문 시 당일 발송</li>
              <li>• 배송기간: 1-2일 (공휴일 제외)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
