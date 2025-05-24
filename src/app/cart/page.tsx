/**
 * @file cart/page.tsx
 * @description 장바구니 페이지 (TanStack Query 최적화)
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시
 * 2. 수량 변경 기능 (Optimistic Updates)
 * 3. 개별 아이템 삭제 (Optimistic Updates)
 * 4. 장바구니 비우기
 * 5. 총액 계산 및 표시
 * 6. 주문하기 버튼
 * 7. 실시간 데이터 동기화
 *
 * @dependencies
 * - @/hooks/use-cart: 최적화된 장바구니 hooks
 * - @/components/cart: 장바구니 관련 컴포넌트
 * - @/components/nav/navbar: 네비게이션 바
 */

"use client";

import { useCartItems } from "@/hooks/use-cart";
import { CartContainer } from "@/components/cart/cart-container";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

// 장바구니 스켈레톤 로더
function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 장바구니 아이템 스켈레톤 */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
        
        {/* 주문 요약 스켈레톤 */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 장바구니 페이지 컴포넌트
export default function CartPage() {
  console.log("🛒 장바구니 페이지 렌더링 (최적화)");

  const { data: cartData, isLoading, error } = useCartItems();
  const { user, isLoading: authLoading } = useAuth();

  console.log("🛒 장바구니 페이지 상태:", {
    user: user ? { id: user.id, email: user.email } : null,
    authLoading,
    cartLoading: isLoading,
    cartError: !!error,
    아이템수: cartData?.items?.length || 0,
    총수량: cartData?.totalItems || 0,
    총액: cartData?.totalAmount || 0,
  });

  if (error) {
    console.error("🛒 장바구니 에러:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* 헤더 */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  계속 쇼핑하기
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <h1 className="text-2xl font-bold">장바구니</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 장바구니 내용 */}
        {isLoading ? (
          <CartSkeleton />
        ) : error ? (
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="mb-4">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">장바구니를 불러올 수 없습니다</h2>
              <p className="text-gray-600 mb-6">
                {error instanceof Error && error.message.includes("로그인") 
                  ? "로그인이 필요합니다." 
                  : "잠시 후 다시 시도해주세요."}
              </p>
              <div className="space-x-4">
                {error instanceof Error && error.message.includes("로그인") ? (
                  <Link href="/login">
                    <Button>로그인하러 가기</Button>
                  </Link>
                ) : (
                  <Button onClick={() => window.location.reload()}>
                    다시 시도
                  </Button>
                )}
                <Link href="/">
                  <Button variant="outline">계속 쇼핑하기</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : cartData ? (
          <CartContainer cartSummary={cartData} />
        ) : null}
      </main>
    </div>
  );
} 