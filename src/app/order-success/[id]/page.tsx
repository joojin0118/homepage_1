/**
 * @file order-success/[id]/page.tsx
 * @description 주문 완료 페이지
 *
 * 주요 기능:
 * 1. 주문 번호 및 완료 메시지 표시
 * 2. 주문 상세 정보 확인
 * 3. 주문 상품 목록 표시
 * 4. 배송 정보 안내
 * 5. 주문 내역으로 이동 링크
 * 6. SEO 최적화된 메타데이터
 *
 * @dependencies
 * - @/actions/orders: 주문 서버 액션
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrder } from "@/actions/orders";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Package,
  Clock,
  Truck,
  ShoppingBag,
  CreditCard,
  Calendar,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: OrderSuccessPageProps): Promise<Metadata> {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return {
      title: "주문 완료 - ShopMall",
      description: "주문이 완료되었습니다.",
    };
  }

  return {
    title: `주문 완료 #${orderId} - ShopMall`,
    description: `주문 #${orderId}이 성공적으로 완료되었습니다.`,
  };
}

// 주문 상태 배지 컴포넌트
function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      label: "주문 접수",
      variant: "outline" as const,
      icon: Clock,
    },
    confirmed: {
      label: "주문 확인",
      variant: "secondary" as const,
      icon: CheckCircle2,
    },
    shipping: {
      label: "배송 중",
      variant: "default" as const,
      icon: Truck,
    },
    delivered: {
      label: "배송 완료",
      variant: "secondary" as const,
      icon: Package,
    },
    cancelled: {
      label: "주문 취소",
      variant: "destructive" as const,
      icon: Clock,
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// 주문 상세 스켈레톤
function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 성공 메시지 스켈레톤 */}
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 mx-auto rounded-full" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        {/* 주문 정보 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 주문 상품 스켈레톤 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-20 w-20" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 주문 완료 내용
async function OrderSuccessContent({ orderId }: { orderId: number }) {
  try {
    const order = await getOrder(orderId);

    const orderDate = new Date(order.created_at);
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3); // 3일 후 배송 예정

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 주문 완료 메시지 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                주문이 완료되었습니다!
              </h1>
              <p className="text-gray-600">
                주문번호{" "}
                <span className="font-mono font-semibold">#{order.id}</span>로
                주문이 접수되었습니다.
              </p>
            </div>
          </div>

          {/* 주문 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                주문 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    주문번호
                  </h3>
                  <p className="font-mono font-semibold">#{order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    주문상태
                  </h3>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    주문일시
                  </h3>
                  <p>
                    {orderDate.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    결제금액
                  </h3>
                  <p className="text-lg font-bold text-orange-600">
                    {formatPrice(order.total_amount)}원
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 배송 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                배송 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    배송 예정일
                  </h3>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {estimatedDelivery.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    배송비
                  </h3>
                  <p className="text-green-600 font-medium">무료배송</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주문 상품 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                주문 상품 ({order.order_items.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {item.product.name}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>수량: {item.quantity}개</p>
                        <p>단가: {formatPrice(item.price_at_time)}원</p>
                        <p className="font-medium text-gray-900">
                          소계:{" "}
                          {formatPrice(item.price_at_time * item.quantity)}원
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">총 결제금액</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatPrice(order.total_amount)}원
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 안내 메시지 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-medium">📦 배송 안내</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>주문 확인 후 1-2일 내에 배송이 시작됩니다.</li>
                  <li>배송 정보는 SMS 또는 이메일로 안내드립니다.</li>
                  <li>배송 조회는 주문 내역에서 확인 가능합니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="h-4 w-4 mr-2" />
                주문 내역 보기
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                계속 쇼핑하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("주문 조회 실패:", error);
    notFound();
  }
}

// 주문 완료 페이지 컴포넌트
export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { id } = await params;
  const orderId = parseInt(id);

  console.group("🎉 주문 완료 페이지");
  console.log("주문 ID:", orderId);

  // 유효하지 않은 ID 체크
  if (isNaN(orderId)) {
    console.error("유효하지 않은 주문 ID:", id);
    console.groupEnd();
    notFound();
  }

  console.groupEnd();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        <Suspense fallback={<OrderDetailSkeleton />}>
          <OrderSuccessContent orderId={orderId} />
        </Suspense>
      </main>
    </div>
  );
}
