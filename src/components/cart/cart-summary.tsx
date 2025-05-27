/**
 * @file cart-summary.tsx
 * @description 장바구니 주문 요약 컴포넌트
 *
 * 이 컴포넌트는 장바구니의 총 금액과 주문 정보를 요약하여 표시합니다.
 *
 * 주요 기능:
 * 1. 총 아이템 수 표시
 * 2. 상품 총액 계산 및 표시
 * 3. 배송비 정보 (무료배송)
 * 4. 최종 결제 금액 계산
 * 5. 주문하기 버튼
 * 6. 할인 혜택 정보 (향후 확장)
 *
 * @dependencies
 * - @/components/ui: ShadcnUI 컴포넌트
 * - lucide-react: 아이콘
 * - next/link: 페이지 네비게이션
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Package, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface CartSummaryProps {
  totalItems: number;
  totalAmount: number;
}

export function CartSummary({ totalItems, totalAmount }: CartSummaryProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  console.log("💰 CartSummary 렌더링:", {
    totalItems,
    totalAmount,
    isNavigating,
  });

  // 배송비 계산 (50,000원 이상 무료배송)
  const shippingThreshold = 50000;
  const shippingFee = totalAmount >= shippingThreshold ? 0 : 3000;
  const finalAmount = totalAmount + shippingFee;

  // 주문하기 버튼 클릭 핸들러
  const handleCheckoutClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // 페이지 전환이 완료되면 상태 리셋 (보험용)
    setTimeout(() => {
      setIsNavigating(false);
    }, 3000);
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">주문 요약</h3>

        {/* 총 상품 정보 */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">총 상품</span>
            <span className="font-medium">{totalItems}개</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">상품 총액</span>
            <span className="font-medium">{formatPrice(totalAmount)}원</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">배송비</span>
            <span className="text-green-600 font-medium">무료</span>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          <div className="flex justify-between text-lg">
            <span className="font-semibold">총 결제금액</span>
            <span className="font-bold text-orange-600">
              {formatPrice(finalAmount)}원
            </span>
          </div>
        </div>

        {/* 혜택 정보 */}
        <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">무료배송 혜택</span>
          </div>
          <p className="text-xs text-green-600 mt-1">전 상품 배송비 무료!</p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            disabled={isNavigating}
            onClick={handleCheckoutClick}
            asChild={!isNavigating}
          >
            {isNavigating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                주문서 준비 중...
              </div>
            ) : (
              <Link href="/checkout">
                <CreditCard className="h-5 w-5 mr-2" />
                주문하기
              </Link>
            )}
          </Button>

          <Button variant="outline" className="w-full h-10" asChild>
            <Link href="/">계속 쇼핑하기</Link>
          </Button>
        </div>

        {/* 혜택 안내 */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 text-gray-900">이용 안내</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 50,000원 이상 주문 시 무료배송</li>
              <li>• 평일 오후 2시 이전 주문 시 당일 발송</li>
              <li>• 배송기간: 1-2일 (공휴일 제외)</li>
              <li>• 제주도/도서산간 지역 추가 배송비 발생</li>
            </ul>
          </CardContent>
        </Card>

        {/* 추가 혜택 (향후 확장용) */}
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-4 text-center">
            <div className="text-gray-500 mb-2">
              <Package className="h-6 w-6 mx-auto mb-1" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              회원가입하고 추가 혜택을 받아보세요!
            </p>
            <Badge variant="outline" className="text-xs">
              첫 주문 시 5% 할인 (준비 중)
            </Badge>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
