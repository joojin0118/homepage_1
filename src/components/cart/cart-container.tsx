/**
 * @file cart-container.tsx
 * @description 장바구니 메인 컨테이너 컴포넌트
 *
 * 이 컴포넌트는 장바구니의 전체 레이아웃을 관리합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시
 * 2. 빈 장바구니 상태 처리
 * 3. 주문 요약 정보 표시
 * 4. 주문하기 버튼
 * 5. 장바구니 비우기 기능
 *
 * @dependencies
 * - @/components/cart: 장바구니 관련 컴포넌트
 * - @/actions/cart: 장바구니 관련 서버 액션 타입
 */

"use client";

import { CartItemList } from "./cart-item-list";
import { CartSummary } from "./cart-summary";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import type { CartSummary as CartSummaryType } from "@/actions/cart";

interface CartContainerProps {
  cartSummary: CartSummaryType;
}

export function CartContainer({ cartSummary }: CartContainerProps) {
  const { items, totalItems, totalAmount } = cartSummary;

  console.log("🛒 CartContainer 렌더링:", {
    아이템수: items.length,
    총수량: totalItems,
    총액: totalAmount,
  });

  // 빈 장바구니 상태
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">장바구니가 비어있습니다</h2>
          <p className="text-gray-600 mb-8">
            마음에 드는 상품을 장바구니에 담아보세요!
          </p>
          <Link href="/">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              상품 둘러보기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 장바구니 아이템이 있는 경우
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 장바구니 아이템 목록 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              장바구니 아이템 ({totalItems}개)
            </h2>
            
            {/* 장바구니 비우기 버튼 */}
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (confirm("장바구니를 모두 비우시겠습니까?")) {
                  try {
                    const { clearCart } = await import("@/actions/cart");
                    const result = await clearCart();
                    if (result.success) {
                      alert(result.message);
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error("장바구니 비우기 실패:", error);
                    alert("장바구니 비우기 중 오류가 발생했습니다.");
                  }
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              모두 삭제
            </Button>
          </div>

          <CartItemList items={items} />
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <CartSummary 
            totalItems={totalItems}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
} 