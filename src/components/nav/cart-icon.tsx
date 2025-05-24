/**
 * @file cart-icon.tsx
 * @description 네비게이션 바 장바구니 아이콘 컴포넌트 (TanStack Query 최적화)
 *
 * 이 컴포넌트는 헤더에 표시되는 장바구니 아이콘과 아이템 수 배지를 제공합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이콘 표시
 * 2. 아이템 수 배지 표시 (0개일 때는 숨김)
 * 3. 클릭 시 장바구니 페이지로 이동
 * 4. 로딩 상태 표시
 * 5. 반응형 디자인
 * 6. TanStack Query 기반 실시간 업데이트
 *
 * @dependencies
 * - @/hooks/use-cart: 최적화된 장바구니 hooks
 * - @/components/ui/button: ShadcnUI 버튼 컴포넌트
 * - lucide-react: 쇼핑카트 아이콘
 * - next/link: 페이지 네비게이션
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCartCount } from "@/hooks/use-cart";

export function CartIcon() {
  const { data: count = 0, isLoading } = useCartCount();

  console.log("🛒 CartIcon 렌더링 (최적화):", { count, isLoading });

  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      asChild
    >
      <Link href="/cart" aria-label="장바구니">
        <ShoppingCart className="h-5 w-5" />
        
        {/* 아이템 수 배지 */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[1.25rem] animate-in fade-in zoom-in-75 duration-200">
            {count > 99 ? '99+' : count}
          </span>
        )}

        {/* 로딩 상태 표시 */}
        {isLoading && count === 0 && (
          <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full h-3 w-3 animate-pulse" />
        )}
      </Link>
    </Button>
  );
} 