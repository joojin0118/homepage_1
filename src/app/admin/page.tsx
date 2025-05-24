/**
 * @file admin/page.tsx
 * @description 관리자 대시보드 메인 페이지
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 및 접근 제어
 * 2. 대시보드 통계 정보 표시
 * 3. 상품/주문 관리로 이동하는 카드들을 포함합니다.
 * 4. 빠른 액션 바로가기
 * 5. 반응형 레이아웃
 *
 * @dependencies
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 * - @/components/auth/auth-provider: 인증 컨텍스트
 */

"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/actions/products";
import { getOrdersForAdmin } from "@/actions/orders";
import { Navbar } from "@/components/nav/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  ShoppingCart,
  Package,
  Eye,
  AlertCircle,
  BarChart3,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

// 대시보드 통계 타입
interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  lowStockProducts: number;
}

// 대시보드 스켈레톤 로더
function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* 헤더 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* 통계 카드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 관리 메뉴 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// 관리자 대시보드 컴포넌트
export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  console.log("🔧 관리자 대시보드 렌더링");

  // 관리자 권한 및 통계 데이터 조회
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📊 대시보드 데이터 조회 시작");

      // 상품 및 주문 데이터 병렬 조회
      const [productsResult, ordersResult] = await Promise.all([
        getProducts(1, 1000), // 모든 상품 조회 (통계용)
        getOrdersForAdmin(1, 1000), // 모든 주문 조회 (통계용)
      ]);

      // 통계 계산
      const totalProducts = productsResult.totalCount;
      const lowStockProducts = productsResult.products.filter(
        (p) => p.stock_quantity <= 5,
      ).length;

      const totalOrders = ordersResult.totalCount;
      const pendingOrders = ordersResult.orders.filter(
        (o) => o.status === "pending",
      ).length;
      const confirmedOrders = ordersResult.orders.filter(
        (o) => o.status === "confirmed",
      ).length;

      const dashboardStats: DashboardStats = {
        totalProducts,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        lowStockProducts,
      };

      setStats(dashboardStats);
      setIsAdmin(true);

      console.log("📊 대시보드 통계:", dashboardStats);
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error);

      if (error instanceof Error && error.message.includes("관리자 권한")) {
        setIsAdmin(false);
        setError("관리자 권한이 필요합니다.");
      } else {
        setError("대시보드 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      setError("로그인이 필요합니다.");
      setIsLoading(false);
    }
  }, [authLoading, user]);

  // 로딩 상태
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  // 에러 상태 또는 권한 없음
  if (error || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
              <p className="text-gray-600 mb-6">
                {error || "관리자만 접근할 수 있는 페이지입니다."}
              </p>
              <div className="space-y-3">
                {error?.includes("로그인") ? (
                  <Link href="/login">
                    <Button>로그인하러 가기</Button>
                  </Link>
                ) : (
                  <Link href="/">
                    <Button>홈으로 가기</Button>
                  </Link>
                )}
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
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold">관리자 대시보드</h1>
              </div>
              <Badge variant="secondary">관리자</Badge>
            </div>
            <p className="text-gray-600 mt-2">
              ShopMall 운영 현황을 확인하고 관리하세요.
            </p>
          </div>
        </div>

        {/* 대시보드 내용 */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* 통계 카드 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">운영 현황</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 총 상품 수 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">
                        총 상품
                      </p>
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.totalProducts || 0}
                    </div>
                    <p className="text-xs text-gray-500">등록된 상품 수</p>
                  </CardContent>
                </Card>

                {/* 총 주문 수 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">
                        총 주문
                      </p>
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.totalOrders || 0}
                    </div>
                    <p className="text-xs text-gray-500">전체 주문 건수</p>
                  </CardContent>
                </Card>

                {/* 대기 중인 주문 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">
                        대기 주문
                      </p>
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats?.pendingOrders || 0}
                    </div>
                    <p className="text-xs text-gray-500">처리 대기 중</p>
                  </CardContent>
                </Card>

                {/* 재고 부족 상품 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">
                        재고 부족
                      </p>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.lowStockProducts || 0}
                    </div>
                    <p className="text-xs text-gray-500">재고 5개 이하</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 관리 메뉴 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">관리 메뉴</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 상품 관리 */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-blue-600" />
                      상품 관리
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      상품 등록, 수정, 삭제 및 재고 관리
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Link href="/admin/products" className="flex-1">
                        <Button className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          상품 목록 관리
                        </Button>
                      </Link>
                      <Link href="/admin/products/new">
                        <Button variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* 주문 관리 */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6 text-green-600" />
                      주문 관리
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      주문 현황 확인 및 상태 관리
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin/orders">
                      <Button className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        주문 목록 관리
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 빠른 액션 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">빠른 액션</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/products/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />새 상품 등록
                  </Button>
                </Link>

                <Link href="/admin/orders?status=pending">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    대기 주문 확인
                  </Button>
                </Link>

                <Link href="/admin/products?filter=low_stock">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    재고 부족 상품
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    쇼핑몰 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
