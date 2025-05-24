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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Truck, 
  Gift,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  totalItems: number;
  totalAmount: number;
}

export function CartSummary({ totalItems, totalAmount }: CartSummaryProps) {
  console.log("💰 CartSummary 렌더링:", {
    totalItems,
    totalAmount,
  });

  // 배송비 계산 (50,000원 이상 무료배송)
  const shippingThreshold = 50000;
  const shippingFee = totalAmount >= shippingThreshold ? 0 : 3000;
  const finalAmount = totalAmount + shippingFee;

  // 무료배송까지 필요한 금액
  const amountForFreeShipping = shippingThreshold - totalAmount;

  return (
    <div className="space-y-4">
      {/* 주문 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            주문 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 상품 정보 */}
          <div className="flex justify-between text-sm">
            <span>상품 ({totalItems}개)</span>
            <span>{formatPrice(totalAmount)}원</span>
          </div>

          {/* 배송비 */}
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              배송비
            </span>
            <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
              {shippingFee === 0 ? "무료" : `${formatPrice(shippingFee)}원`}
            </span>
          </div>

          {/* 무료배송 혜택 안내 */}
          {shippingFee > 0 && amountForFreeShipping > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Gift className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">
                    {formatPrice(amountForFreeShipping)}원 더 담으면 무료배송!
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    50,000원 이상 주문 시 배송비 무료
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 무료배송 달성 */}
          {shippingFee === 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  무료배송 혜택 적용!
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* 총 결제 금액 */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">총 결제 금액</span>
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(finalAmount)}원
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 주문하기 버튼 */}
      <div className="space-y-3">
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
          size="lg"
          asChild
        >
          <Link href="/checkout">
            <CreditCard className="h-5 w-5 mr-2" />
            주문하기
          </Link>
        </Button>

        <Button 
          variant="outline" 
          className="w-full h-10"
          asChild
        >
          <Link href="/">
            계속 쇼핑하기
          </Link>
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
            <Gift className="h-6 w-6 mx-auto mb-1" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            회원가입하고 추가 혜택을 받아보세요!
          </p>
          <Badge variant="outline" className="text-xs">
            첫 주문 시 5% 할인 (준비 중)
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
} 