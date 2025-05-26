/**
 * @file admin/orders/page.tsx
 * @description 관리자 주문 관리 페이지
 *
 * 주요 기능:
 * 1. 전체 주문 목록 조회 (페이지네이션)
 * 2. 주문 상태별 필터링
 * 3. 주문 상태 변경 (관리자 전용)
 * 4. 주문 상세 정보 표시
 * 5. 주문자 정보 확인
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
import { getOrdersForAdmin, updateOrderStatus } from "@/actions/orders";
import type { OrderWithItems } from "@/actions/orders";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

// 주문 상태 설정
const ORDER_STATUSES = [
  { value: "", label: "전체" },
  { value: "pending", label: "주문 접수" },
  { value: "confirmed", label: "주문 확인" },
  { value: "shipping", label: "배송 중" },
  { value: "delivered", label: "배송 완료" },
  { value: "cancelled", label: "주문 취소" },
];

// 주문 상태 변경 옵션
const STATUS_ACTIONS = [
  { value: "pending", label: "주문 접수", icon: Clock },
  { value: "confirmed", label: "주문 확인", icon: CheckCircle2 },
  { value: "shipping", label: "배송 중", icon: Truck },
  { value: "delivered", label: "배송 완료", icon: Package },
  { value: "cancelled", label: "주문 취소", icon: AlertCircle },
];

// 주문 목록 스켈레톤
function OrderTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
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

// 주문 상세 다이얼로그
function OrderDetailDialog({
  order,
  isOpen,
  onClose,
}: {
  order: OrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>주문 상세 정보 #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 주문 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">주문 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호:</span>
                  <span className="font-mono">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문일시:</span>
                  <span>
                    {new Date(order.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주문상태:</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 결제금액:</span>
                  <span className="font-bold text-orange-600">
                    {formatPrice(order.total_amount)}원
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">주문자 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">사용자 ID:</span>
                  <span className="font-mono">{order.user_id}</span>
                </div>
                {(order as any).profiles?.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span>{(order as any).profiles.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 주문 상품 목록 */}
          <div>
            <h3 className="font-semibold mb-3">
              주문 상품 ({order.order_items.length}개)
            </h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
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
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>수량: {item.quantity}개</p>
                      <p>단가: {formatPrice(item.price_at_time)}원</p>
                      <p className="font-medium text-gray-900">
                        소계: {formatPrice(item.price_at_time * item.quantity)}
                        원
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 관리자 주문 관리 페이지
function AdminOrdersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<
    (OrderWithItems & { profiles: { name: string | null } | null })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  console.log("🔧 관리자 주문 관리 페이지 렌더링");

  // URL 파라미터에서 필터 상태 가져오기
  useEffect(() => {
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    setFilterStatus(status);
    setCurrentPage(page);
  }, [searchParams]);

  // 주문 목록 조회
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📦 관리자 주문 목록 조회", {
        page: currentPage,
        status: filterStatus,
      });

      const result = await getOrdersForAdmin(currentPage, 10);

      // 필터링 적용
      let filteredOrders = result.orders;
      if (filterStatus) {
        filteredOrders = result.orders.filter((o) => o.status === filterStatus);
      }

      // 검색어 필터링 (주문 ID나 사용자명)
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(
          (o) =>
            o.id.toString().includes(searchTerm) ||
            o.user_id.includes(searchTerm) ||
            (o.profiles?.name &&
              o.profiles.name.toLowerCase().includes(searchTerm.toLowerCase())),
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
          : "주문 목록 조회 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [currentPage, filterStatus, authLoading, user, fetchOrders]);

  // 검색어 변경 처리
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchOrders, isLoading]);

  // 주문 상태 변경 처리
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setIsUpdatingStatus(orderId);
      console.log("📦 주문 상태 변경:", orderId, "→", newStatus);

      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        await fetchOrders(); // 목록 새로고침
        console.log("✅ 주문 상태 변경 완료");
      } else {
        setError("주문 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("주문 상태 변경 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "주문 상태 변경 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // 필터 변경
  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", "1");

    router.push(`/admin/orders?${params.toString()}`);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    params.set("page", page.toString());

    router.push(`/admin/orders?${params.toString()}`);
  };

  // 로딩 상태
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
              </div>
              <OrderTableSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 에러 상태
  if (error && !orders.length) {
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
                주문 목록을 불러올 수 없습니다
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Button onClick={() => window.location.reload()}>
                  다시 시도
                </Button>
                <div>
                  <Link href="/admin">
                    <Button variant="outline">관리자 대시보드로 가기</Button>
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
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드로
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <h1 className="text-2xl font-bold">주문 관리</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 관리 내용 */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="주문 번호 또는 사용자 정보로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {ORDER_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      filterStatus === status.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleFilterChange(status.value)}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 에러 메시지 (부분 에러) */}
            {error && orders.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 주문 테이블 */}
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">주문이 없습니다</h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `"${searchTerm}" 검색 결과가 없습니다.`
                    : filterStatus
                      ? `${ORDER_STATUSES.find((s) => s.value === filterStatus)?.label} 상태의 주문이 없습니다.`
                      : "등록된 주문이 없습니다."}
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>주문 목록 ({orders.length}개)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>주문번호</TableHead>
                          <TableHead>주문자</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>결제금액</TableHead>
                          <TableHead>상품수</TableHead>
                          <TableHead>주문일시</TableHead>
                          <TableHead className="w-[50px]">액션</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">
                              #{order.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">
                                    {order.profiles?.name || "익명"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 font-mono">
                                  {order.user_id.substring(0, 8)}...
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(order.total_amount)}원
                            </TableCell>
                            <TableCell>{order.order_items.length}개</TableCell>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString(
                                "ko-KR",
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isUpdatingStatus === order.id}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    상세 보기
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <Edit className="h-4 w-4 mr-2" />
                                      상태 변경
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      {STATUS_ACTIONS.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                          <DropdownMenuItem
                                            key={action.value}
                                            onClick={() =>
                                              handleStatusUpdate(
                                                order.id,
                                                action.value,
                                              )
                                            }
                                            disabled={
                                              order.status === action.value
                                            }
                                          >
                                            <Icon className="h-4 w-4 mr-2" />
                                            {action.label}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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

      {/* 주문 상세 다이얼로그 */}
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

// 서버 컴포넌트 래퍼 (Suspense로 감싸기)
export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-grow">
            <div className="container mx-auto px-4 py-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <OrderTableSkeleton />
              </div>
            </div>
          </main>
        </div>
      }
    >
      <AdminOrdersPageClient />
    </Suspense>
  );
}
