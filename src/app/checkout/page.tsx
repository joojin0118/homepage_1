/**
 * @file checkout/page.tsx
 * @description 주문서 작성 페이지
 *
 * 주요 기능:
 * 1. 장바구니 아이템 확인 (기본 모드)
 * 2. 바로 구매 아이템 확인 (바로 구매 모드)
 * 3. 주문자 정보 입력 폼
 * 4. 총 주문 금액 계산 및 표시
 * 5. 주문 완료 처리
 * 6. 로딩 상태 관리
 * 7. 에러 핸들링
 *
 * @dependencies
 * - @/hooks/use-cart: 장바구니 hooks
 * - @/actions/orders: 주문 서버 액션
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 * - next/navigation: useRouter, useSearchParams
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartItems } from "@/hooks/use-cart";
import { createOrder } from "@/actions/orders";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

// 바로 구매 데이터 타입
interface DirectPurchaseItem {
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  total: number;
}

interface DirectPurchaseData {
  items: DirectPurchaseItem[];
  total_amount: number;
  is_direct_purchase: boolean;
  timestamp: number;
}

// 주문서 스켈레톤 로더
function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문자 정보 스켈레톤 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 주문 요약 스켈레톤 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
              <Skeleton className="h-px w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 주문서 작성 페이지 컴포넌트
export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  const {
    data: cartData,
    isLoading: cartLoading,
    error: cartError,
  } = useCartItems();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [directPurchaseData, setDirectPurchaseData] =
    useState<DirectPurchaseData | null>(null);
  const [isDirectMode, setIsDirectMode] = useState(false);

  console.group("🛒 주문서 페이지 렌더링");

  // 바로 구매 모드 확인
  useEffect(() => {
    const isDirect = searchParams.get("direct") === "true";
    setIsDirectMode(isDirect);

    console.log("주문 모드:", isDirect ? "바로 구매" : "장바구니");

    if (isDirect) {
      // 세션 스토리지에서 바로 구매 데이터 가져오기
      try {
        const directData = sessionStorage.getItem("direct_purchase_data");
        if (directData) {
          const parsedData: DirectPurchaseData = JSON.parse(directData);

          // 데이터 유효성 검사 (1시간 유효)
          const now = Date.now();
          const hourInMs = 60 * 60 * 1000;

          if (now - parsedData.timestamp < hourInMs) {
            setDirectPurchaseData(parsedData);
            console.log("바로 구매 데이터 로드 완료:", parsedData);
          } else {
            console.warn("바로 구매 데이터가 만료됨");
            sessionStorage.removeItem("direct_purchase_data");
            router.push("/");
          }
        } else {
          console.warn("바로 구매 데이터를 찾을 수 없음");
          router.push("/");
        }
      } catch (error) {
        console.error("바로 구매 데이터 파싱 오류:", error);
        router.push("/");
      }
    }

    console.groupEnd();
  }, [searchParams, router]);

  // 폼 제출 처리
  const handleSubmit = async (formData: FormData) => {
    console.group("📦 주문 처리 시작");
    console.log("주문 모드:", isDirectMode ? "바로 구매" : "장바구니");

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (isDirectMode && directPurchaseData) {
        // 바로 구매 데이터를 FormData에 추가
        formData.append("is_direct_purchase", "true");
        formData.append(
          "direct_purchase_data",
          JSON.stringify(directPurchaseData),
        );
        console.log("바로 구매 데이터 첨부");
      }

      await createOrder(formData);

      // 바로 구매 모드인 경우 세션 스토리지 정리
      if (isDirectMode) {
        sessionStorage.removeItem("direct_purchase_data");
        console.log("바로 구매 데이터 정리 완료");
      }

      console.groupEnd();
      // createOrder에서 성공 시 자동으로 리다이렉트됨
    } catch (error) {
      console.error("주문 처리 실패:", error);
      console.groupEnd();

      const errorMessage =
        error instanceof Error
          ? error.message
          : "주문 처리 중 오류가 발생했습니다.";
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 현재 주문 데이터 결정
  const orderData = isDirectMode ? directPurchaseData : cartData;
  const isOrderLoading = isDirectMode ? !directPurchaseData : cartLoading;
  const orderError = isDirectMode
    ? !directPurchaseData
      ? new Error("바로 구매 데이터를 찾을 수 없습니다.")
      : null
    : cartError;

  // 로딩 상태
  if (isOrderLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <CheckoutSkeleton />
        </main>
      </div>
    );
  }

  // 에러 상태 또는 빈 주문
  if (
    orderError ||
    !orderData ||
    (isDirectMode
      ? directPurchaseData!.items.length === 0
      : cartData!.items.length === 0)
  ) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">주문할 수 없습니다</h1>
              <p className="text-gray-600 mb-6">
                {orderError?.message.includes("로그인")
                  ? "로그인이 필요합니다."
                  : isDirectMode
                    ? "바로 구매 데이터를 찾을 수 없습니다."
                    : "장바구니가 비어있거나 오류가 발생했습니다."}
              </p>
              <div className="space-y-3">
                {orderError?.message.includes("로그인") ? (
                  <Link href="/login">
                    <Button>로그인하러 가기</Button>
                  </Link>
                ) : (
                  <Link href={isDirectMode ? "/" : "/cart"}>
                    <Button>
                      {isDirectMode ? "상품 보러 가기" : "장바구니 확인하기"}
                    </Button>
                  </Link>
                )}
                <div>
                  <Link href="/">
                    <Button variant="outline">계속 쇼핑하기</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 바로 구매 모드용 아이템 렌더링
  const renderDirectPurchaseItems = () => {
    if (!directPurchaseData) return null;

    return directPurchaseData.items.map((item, index) => (
      <div key={index} className="flex gap-3">
        <div className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
          {item.product_image ? (
            <Image
              src={item.product_image}
              alt={item.product_name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm truncate">{item.product_name}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-600">
              {formatPrice(item.price)}원 × {item.quantity}
            </span>
            <span className="font-medium text-sm">
              {formatPrice(item.total)}원
            </span>
          </div>
        </div>
      </div>
    ));
  };

  // 장바구니 모드용 아이템 렌더링
  const renderCartItems = () => {
    if (!cartData) return null;

    return cartData.items.map((item) => {
      const product = item.product as NonNullable<typeof item.product>;
      return (
        <div key={item.id} className="flex gap-3">
          <div className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-sm truncate">{product.name}</h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-600">
                {formatPrice(product.price)}원 × {item.quantity}
              </span>
              <span className="font-medium text-sm">
                {formatPrice(product.price * item.quantity)}원
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  const totalAmount = isDirectMode
    ? directPurchaseData!.total_amount
    : cartData!.totalAmount;
  const backLink = isDirectMode ? "/" : "/cart";
  const backText = isDirectMode ? "상품으로 돌아가기" : "장바구니로 돌아가기";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* 헤더 */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href={backLink}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backText}
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <h1 className="text-2xl font-bold">주문서 작성</h1>
                {isDirectMode && (
                  <Badge variant="outline" className="ml-2">
                    바로 구매
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 주문서 내용 */}
        <div className="container mx-auto px-4 py-8">
          <form
            action={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* 주문자 정보 입력 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    주문자 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">이름 *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      placeholder="주문자 이름을 입력해주세요"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">연락처 *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      placeholder="연락 가능한 전화번호를 입력해주세요"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">배송 주소 *</Label>
                    <Textarea
                      id="customerAddress"
                      name="customerAddress"
                      placeholder="상세한 배송 주소를 입력해주세요"
                      required
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 에러 메시지 */}
              {formError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <span>{formError}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    주문 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 주문 아이템 목록 */}
                  <div className="space-y-3">
                    {isDirectMode
                      ? renderDirectPurchaseItems()
                      : renderCartItems()}
                  </div>

                  <Separator />

                  {/* 주문 금액 정보 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>상품 금액</span>
                      <span>{formatPrice(totalAmount)}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>배송비</span>
                      <span className="text-green-600">무료</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>총 결제 금액</span>
                      <span className="text-lg text-orange-600">
                        {formatPrice(totalAmount)}원
                      </span>
                    </div>
                  </div>

                  {/* 주문 완료 버튼 */}
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>주문 처리 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{formatPrice(totalAmount)}원 결제하기</span>
                      </div>
                    )}
                  </Button>

                  {/* 주문 안내 */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 주문 완료 후 취소/변경이 어려울 수 있습니다.</p>
                    <p>• 상품에 따라 배송일이 달라질 수 있습니다.</p>
                    <p>• 무료배송은 5만원 이상 주문 시 적용됩니다.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
