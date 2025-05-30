/**
 * @file admin/products/page.tsx
 * @description 관리자 상품 관리 페이지
 *
 * 주요 기능:
 * 1. 관리자 상품 목록 조회 (페이지네이션)
 * 2. 상품 정보 테이블 형태 표시
 * 3. 상품 추가, 수정, 삭제 기능
 * 4. 재고 부족 상품 필터링
 * 5. 상품 검색 기능
 * 6. 반응형 레이아웃
 *
 * @dependencies
 * - @/actions/products: 상품 서버 액션
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProducts,
  deleteProduct,
  adjustProductStock,
} from "@/actions/products";
import type { Product } from "@/actions/products";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  Plus,
  Minus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  Filter,
  MoreHorizontal,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

// 페이지당 상품 수
const PRODUCTS_PER_PAGE = 10;

// 상품 목록 스켈레톤
function ProductTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
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
                <Skeleton className="h-16 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
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

// 재고 상태 배지 컴포넌트
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge variant="destructive">품절</Badge>;
  } else if (stock <= 5) {
    return (
      <Badge variant="outline" className="border-orange-500 text-orange-700">
        재고 부족
      </Badge>
    );
  } else {
    return <Badge variant="secondary">재고 있음</Badge>;
  }
}

// 관리자 상품 관리 페이지
function AdminProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams?.get("page")) || 1,
  );
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low_stock">("all");
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adjustingStock, setAdjustingStock] = useState<Record<number, boolean>>(
    {},
  );
  const [totalCount, setTotalCount] = useState(0);

  console.log("🔧 관리자 상품 관리 페이지 렌더링");

  // URL 파라미터에서 필터 상태 가져오기
  useEffect(() => {
    const filter = (searchParams.get("filter") as "all" | "low_stock") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    setFilterType(filter);
    setCurrentPage(page);
  }, [searchParams]);

  // 상품 목록 조회
  const fetchProducts = useCallback(
    async (search?: string) => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        console.log("📦 상품 조회 시작:", {
          page: currentPage,
          category: filterType,
          search: search || searchTerm,
        });

        const result = await getProducts(
          currentPage,
          PRODUCTS_PER_PAGE,
          filterType,
          search || searchTerm,
        );

        setProducts(result.products);
        setTotalCount(result.totalCount);
        setTotalPages(
          Math.max(1, Math.ceil(result.totalCount / PRODUCTS_PER_PAGE)),
        );

        console.log("✅ 상품 조회 완료:", result.products.length, "개");
      } catch (error) {
        console.error("상품 조회 실패:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "상품을 조회하는 중 오류가 발생했습니다.";
        setError(errorMessage);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, filterType, searchTerm, user],
  );

  // 페이지 및 필터 변경 시 상품 조회
  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [currentPage, filterType, authLoading, user, fetchProducts]);

  // 검색어 변경 시 디바운스 처리
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!authLoading && user && !isLoading) {
        fetchProducts(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, authLoading, user, isLoading, fetchProducts]);

  // 상품 삭제
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    console.log("🗑️ 상품 삭제:", deleteProductId);
    setIsDeleting(true);

    try {
      const result = await deleteProduct(deleteProductId);

      if (result.success) {
        alert(result.message);
        fetchProducts(); // 목록 새로고침
        setDeleteProductId(null);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "상품 삭제 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // 재고 조정
  const handleStockAdjustment = async (
    productId: number,
    adjustment: number,
  ) => {
    console.log("📊 재고 조정:", productId, "조정량:", adjustment);

    // 진행 중인 조정이 있으면 중단
    if (adjustingStock[productId]) {
      console.warn("이미 재고 조정 중입니다.");
      return;
    }

    setAdjustingStock((prev) => ({ ...prev, [productId]: true }));

    try {
      const result = await adjustProductStock(productId, adjustment);

      if (result.success) {
        // 로컬 상태 업데이트 (Optimistic UI)
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  stock_quantity: result.newStock || product.stock_quantity,
                }
              : product,
          ),
        );

        console.log("✅ 재고 조정 성공:", result.message);
        // 성공 시 간단한 시각적 피드백 (선택적)
        // alert 대신 토스트나 더 subtle한 알림을 사용할 수 있음
      } else {
        alert(result.message);
        console.error("❌ 재고 조정 실패:", result.message);
      }
    } catch (error) {
      console.error("재고 조정 오류:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "재고 조정 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setAdjustingStock((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // 필터 변경
  const handleFilterChange = (filter: "all" | "low_stock") => {
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    params.set("page", "1");

    router.push(`/admin/products?${params.toString()}`);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (filterType !== "all") params.set("filter", filterType);
    params.set("page", page.toString());

    router.push(`/admin/products?${params.toString()}`);
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
              <ProductTableSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 에러 상태
  if (error && !products.length) {
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
                상품 목록을 불러올 수 없습니다
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
                <Package className="h-6 w-6" />
                <h1 className="text-2xl font-bold">상품 관리</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 관리 내용 */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="상품명 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                >
                  전체
                </Button>
                <Button
                  variant={filterType === "low_stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("low_stock")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  재고 부족
                </Button>
                <Link href="/admin/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    상품 추가
                  </Button>
                </Link>
              </div>
            </div>

            {/* 에러 메시지 (부분 에러) */}
            {error && products.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 상품 테이블 */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">상품이 없습니다</h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `"${searchTerm}" 검색 결과가 없습니다.`
                    : filterType === "low_stock"
                      ? "재고가 부족한 상품이 없습니다."
                      : "등록된 상품이 없습니다."}
                </p>
                <Link href="/admin/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />첫 상품 등록하기
                  </Button>
                </Link>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    상품 목록 (총 {totalCount}개 중 {products.length}개 표시)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>이미지</TableHead>
                          <TableHead>상품명</TableHead>
                          <TableHead>가격</TableHead>
                          <TableHead>재고</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>등록일</TableHead>
                          <TableHead className="w-[50px]">액션</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                {product.description && (
                                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(product.price)}원
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStockAdjustment(product.id, -1)
                                    }
                                    disabled={
                                      adjustingStock[product.id] ||
                                      product.stock_quantity <= 0
                                    }
                                    className="h-7 w-7 p-0"
                                    title="재고 1개 감소"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>

                                  <span className="min-w-[3rem] text-center font-medium">
                                    {product.stock_quantity}개
                                  </span>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStockAdjustment(product.id, 1)
                                    }
                                    disabled={adjustingStock[product.id]}
                                    className="h-7 w-7 p-0"
                                    title="재고 1개 증가"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StockBadge stock={product.stock_quantity} />
                            </TableCell>
                            <TableCell>
                              {product.created_at
                                ? new Date(
                                    product.created_at,
                                  ).toLocaleDateString("ko-KR")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Link href={`/products/${product.id}`}>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      상품 보기
                                    </DropdownMenuItem>
                                  </Link>
                                  <Link
                                    href={`/admin/products/${product.id}/edit`}
                                  >
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      수정
                                    </DropdownMenuItem>
                                  </Link>

                                  {/* 재고 조정 옵션들 */}
                                  <div className="border-t my-1" />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStockAdjustment(product.id, 10)
                                    }
                                    disabled={adjustingStock[product.id]}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    재고 +10
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStockAdjustment(product.id, 50)
                                    }
                                    disabled={adjustingStock[product.id]}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    재고 +50
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStockAdjustment(product.id, -10)
                                    }
                                    disabled={
                                      adjustingStock[product.id] ||
                                      product.stock_quantity < 10
                                    }
                                  >
                                    <Minus className="h-4 w-4 mr-2" />
                                    재고 -10
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStockAdjustment(product.id, -50)
                                    }
                                    disabled={
                                      adjustingStock[product.id] ||
                                      product.stock_quantity < 50
                                    }
                                  >
                                    <Minus className="h-4 w-4 mr-2" />
                                    재고 -50
                                  </DropdownMenuItem>

                                  <div className="border-t my-1" />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      setDeleteProductId(product.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    삭제
                                  </DropdownMenuItem>
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteProductId !== null}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 상품이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// 서버 컴포넌트 래퍼 (Suspense로 감싸기)
export default function AdminProductsPage() {
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
                <ProductTableSkeleton />
              </div>
            </div>
          </main>
        </div>
      }
    >
      <AdminProductsPageClient />
    </Suspense>
  );
}
