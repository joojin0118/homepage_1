/**
 * @file cart-item-card.tsx
 * @description 장바구니 개별 아이템 카드 컴포넌트 (TanStack Query 최적화)
 *
 * 이 컴포넌트는 장바구니에 담긴 개별 상품의 정보를 표시하고 관리하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지 및 정보 표시
 * 2. 수량 변경 기능 (+, - 버튼) - Optimistic Updates
 * 3. 개별 아이템 삭제 - Optimistic Updates
 * 4. 총 가격 계산 표시
 * 5. 재고 부족 경고
 * 6. 로딩 상태 처리
 * 7. 즉각적인 UI 반응 (전체 페이지 새로고침 없음)
 *
 * @dependencies
 * - next/image: 이미지 최적화
 * - @/components/ui: ShadcnUI 컴포넌트
 * - @/hooks/use-cart: 최적화된 장바구니 hooks
 * - lucide-react: 아이콘
 */

"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Minus, 
  Plus, 
  Trash2, 
  Package,
  AlertTriangle,
  Loader2
} from "lucide-react";
import type { CartItem } from "@/actions/cart";
import { formatPrice } from "@/lib/utils";
import { useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/use-cart";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { product, quantity } = item;
  const totalPrice = product.price * quantity;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;
  const isOutOfStock = product.stock_quantity <= 0;

  // TanStack Query mutations
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeItemMutation = useRemoveFromCart();

  console.log("🛒 CartItemCard 렌더링 (최적화):", product.name, "수량:", quantity);

  // 수량 증가
  const increaseQuantity = () => {
    if (quantity >= product.stock_quantity) {
      console.warn(`재고가 부족합니다. (최대 ${product.stock_quantity}개)`);
      return;
    }

    console.log("🔼 수량 증가:", product.name, quantity, "→", quantity + 1);
    updateQuantityMutation.mutate(
      { itemId: item.id, newQuantity: quantity + 1 },
      {
        onSuccess: () => {
          console.log("✅ 수량 변경 성공");
        },
        onError: (error) => {
          console.error("❌ 수량 변경 실패:", error.message);
          alert("수량 변경에 실패했습니다: " + error.message);
        },
      }
    );
  };

  // 수량 감소
  const decreaseQuantity = () => {
    if (quantity <= 1) {
      console.warn("최소 수량은 1개입니다.");
      return;
    }

    console.log("🔽 수량 감소:", product.name, quantity, "→", quantity - 1);
    updateQuantityMutation.mutate(
      { itemId: item.id, newQuantity: quantity - 1 },
      {
        onSuccess: () => {
          console.log("✅ 수량 변경 성공");
        },
        onError: (error) => {
          console.error("❌ 수량 변경 실패:", error.message);
          alert("수량 변경에 실패했습니다: " + error.message);
        },
      }
    );
  };

  // 아이템 삭제
  const removeItem = () => {
    const confirmMessage = `${product.name}을(를) 장바구니에서 제거하시겠습니까?`;
    if (!confirm(confirmMessage)) return;

    console.log("🗑️ 아이템 삭제:", product.name);
    removeItemMutation.mutate(item.id, {
      onSuccess: () => {
        console.log("✅ 상품 삭제 성공");
      },
      onError: (error) => {
        console.error("❌ 상품 삭제 실패:", error.message);
        alert("상품 제거에 실패했습니다: " + error.message);
      },
    });
  };

  const isUpdating = updateQuantityMutation.isPending;
  const isRemoving = removeItemMutation.isPending;
  const isProcessing = isUpdating || isRemoving;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 상품 이미지 */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">
                  개당 {formatPrice(product.price)}원
                </p>
                
                {/* 재고 상태 */}
                <div className="mt-1">
                  {isOutOfStock && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      품절
                    </Badge>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      재고 부족 ({product.stock_quantity}개 남음)
                    </Badge>
                  )}
                </div>
              </div>

              {/* 총 가격 */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(totalPrice)}원
                </div>
                {quantity > 1 && (
                  <div className="text-sm text-gray-500">
                    {formatPrice(product.price)} × {quantity}
                  </div>
                )}
              </div>
            </div>

            {/* 수량 조절 및 삭제 버튼 */}
            <div className="flex items-center justify-between mt-4">
              {/* 수량 조절 */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isProcessing}
                  className="h-8 w-8 p-0"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
                
                <span className="mx-3 min-w-[2rem] text-center font-medium">
                  {quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock_quantity || isProcessing || isOutOfStock}
                  className="h-8 w-8 p-0"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* 삭제 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={removeItem}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                {isRemoving ? "삭제 중..." : "삭제"}
              </Button>
            </div>

            {/* 재고 부족 경고 */}
            {isOutOfStock && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                이 상품은 현재 품절 상태입니다. 주문 시 제외됩니다.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 