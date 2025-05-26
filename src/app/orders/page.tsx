/**
 * @file orders/page.tsx
 * @description 주문 내역 페이지
 *
 * 주요 기능:
 * 1. 사용자별 주문 목록 표시
 * 2. 주문 상태별 필터링
 * 3. 페이지네이션
 * 4. 주문 상세 보기 링크
 * 5. 주문 상태 표시
 * 6. 반응형 레이아웃
 *
 * @dependencies
 * - @/actions/orders: 주문 서버 액션
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/auth-provider";
import { getOrders, type OrderWithItems } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/nav/navbar";
import {
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  Eye,
  Filter,
  ShoppingBag,
  Home,
} from "lucide-react";

// 주문 상태 설정
const ORDER_STATUSES = [
  { value: "", label: "전체" },
  { value: "pending", label: "주문 접수" },
  { value: "confirmed", label: "주문 확인" },
  { value: "shipping", label: "배송 중" },
  { value: "delivered", label: "배송 완료" },
  { value: "cancelled", label: "주문 취소" },
];

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
      icon: AlertCircle,
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

// 주문 카드 컴포넌트
function OrderCard({ order }: { order: OrderWithItems }) {
  const orderDate = new Date(order.created_at);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">주문번호</p>
            <p className="font-mono font-semibold">#{order.id}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주문 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">주문일시</p>
            <p>
              {orderDate.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">결제금액</p>
            <p className="font-bold text-orange-600">
              {formatPrice(order.total_amount)}원
            </p>
          </div>
        </div>

        {/* 주문 상품 미리보기 */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            주문 상품 ({order.order_items.length}개)
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {order.order_items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex-shrink-0">
                <div className="relative h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {order.order_items.length > 3 && (
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">
                  +{order.order_items.length - 3}
                </span>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {order.order_items[0]?.product.name}
            {order.order_items.length > 1 &&
              ` 외 ${order.order_items.length - 1}개`}
          </div>
        </div>

        {/* 주문 상세 보기 버튼 */}
        <Link href={`/order-success/${order.id}`}>
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            주문 상세 보기
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// 주문 목록 스켈레톤
function OrderListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-20" />
            ))}
          </div>
        </div>

        {/* 주문 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-12" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 주문 내역 페이지 컴포넌트
function OrdersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");

  console.log("📦 주문 내역 페이지 렌더링");

  // URL 파라미터에서 필터 상태 가져오기
  useEffect(() => {
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    setSelectedStatus(status);
    setCurrentPage(page);
  }, [searchParams]);

  // 주문 목록 조회
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 주문 목록 조회", {
        page: currentPage,
        status: selectedStatus,
      });

      const result = await getOrders(currentPage, 8);

      // 상태 필터링 (클라이언트 측)
      let filteredOrders = result.orders;
      if (selectedStatus) {
        filteredOrders = result.orders.filter(
          (order) => order.status === selectedStatus,
        );
      }

      setOrders(filteredOrders);
      setTotalPages(result.totalPages);

      console.log("📦 주문 조회 완료:", {
        전체주문: result.orders.length,
        필터링된주문: filteredOrders.length,
        페이지: currentPage,
        총페이지: result.totalPages,
      });
    } catch (error) {
      console.error("주문 조회 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "주문 내역 조회 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedStatus]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [currentPage, selectedStatus, authLoading, user, fetchOrders]);

  // 상태 필터 변경
  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", "1");

    router.push(`/orders?${params.toString()}`);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (selectedStatus) params.set("status", selectedStatus);
    params.set("page", page.toString());

    router.push(`/orders?${params.toString()}`);
  };

  // 로딩 상태
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <OrderListSkeleton />
        </main>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">
                주문 내역을 불러올 수 없습니다
              </h1>
              <p className="text-gray-600 mb-6">
                {error.includes("로그인")
                  ? "로그인이 필요합니다."
                  : "잠시 후 다시 시도해주세요."}
              </p>
              <div className="space-y-3">
                {error.includes("로그인") ? (
                  <Link href="/login">
                    <Button>로그인하러 가기</Button>
                  </Link>
                ) : (
                  <Button onClick={() => window.location.reload()}>
                    다시 시도
                  </Button>
                )}
                <div>
                  <Link href="/">
                    <Button variant="outline">홈으로 가기</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
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
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                <h1 className="text-2xl font-bold">주문 내역</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 내역 내용 */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 상태 필터 */}
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    selectedStatus === status.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusFilter(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>

            {/* 주문 목록 */}
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  주문 내역이 없습니다
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedStatus
                    ? `${ORDER_STATUSES.find((s) => s.value === selectedStatus)?.label} 상태의 주문이 없습니다.`
                    : "아직 주문하신 상품이 없습니다."}
                </p>
                <div className="space-y-3">
                  {selectedStatus && (
                    <Button
                      variant="outline"
                      onClick={() => handleStatusFilter("")}
                    >
                      전체 주문 보기
                    </Button>
                  )}
                  <div>
                    <Link href="/">
                      <Button>
                        <Home className="h-4 w-4 mr-2" />
                        쇼핑하러 가기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  이전
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, index) => {
                    const page = Math.max(1, currentPage - 2) + index;
                    if (page > totalPages) return null;

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  },
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// 서버 컴포넌트 래퍼 (Suspense로 감싸기)
export default function OrdersPage() {
  return (
    <Suspense fallback={<OrderListSkeleton />}>
      <OrdersPageClient />
    </Suspense>
  );
}
