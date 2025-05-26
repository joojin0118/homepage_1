/**
 * @file home-page-client.tsx
 * @description 홈페이지 클라이언트 컴포넌트 (카테고리 필터링 포함)
 *
 * 주요 기능:
 * 1. 카테고리별 상품 필터링
 * 2. 상품 목록 표시
 * 3. 검색 및 정렬 기능
 * 4. 관리자 링크 (권한 확인)
 * 5. 헤로 섹션
 *
 * @dependencies
 * - @/actions/products: 상품 관련 서버 액션
 * - @/components/products: 상품 관련 컴포넌트
 * - @/constants/categories: 카테고리 상수
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/actions/products";
import { ProductList } from "@/components/products/product-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { PRODUCT_CATEGORIES, getCategoryLabel } from "@/constants/categories";
import {
  AlertCircle,
  Store,
  Search,
  Shield,
  Settings,
  Grid3X3,
  ArrowUpDown,
} from "lucide-react";
import type { Tables } from "@/../../database.types";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

type Product = Tables<"products">;

// 홈페이지 헤로 섹션
function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">ShopMall</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            최고의 상품을 최저 가격으로 만나보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100"
              onClick={() => {
                document.getElementById("products-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Store className="h-5 w-5 mr-2" />
              쇼핑 시작하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-orange-600"
            >
              <Search className="h-5 w-5 mr-2" />
              상품 검색
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// 관리자 링크 섹션
function AdminLinkSection() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.is_admin === true);
      } catch (error) {
        console.error("관리자 권한 확인 실패:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <section className="bg-blue-50 border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">관리자 메뉴</h3>
              <p className="text-sm text-gray-600">
                파일 업로드 및 관리 기능을 사용할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                관리자 페이지
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// 카테고리 필터 컴포넌트
interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">카테고리</h3>
      <div className="flex flex-wrap gap-2">
        {PRODUCT_CATEGORIES.map((category) => (
          <Badge
            key={category.value}
            variant={
              selectedCategory === category.value ? "default" : "outline"
            }
            className={`cursor-pointer transition-colors ${
              selectedCategory === category.value
                ? "bg-orange-500 hover:bg-orange-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onCategoryChange(category.value)}
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            {category.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// 상품 섹션 헤더
interface ProductSectionHeaderProps {
  selectedCategory: string;
  totalCount: number;
  onSortChange: () => void;
}

function ProductSectionHeader({
  selectedCategory,
  totalCount,
  onSortChange,
}: ProductSectionHeaderProps) {
  const categoryLabel = getCategoryLabel(selectedCategory);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedCategory === "all" ? "전체 상품" : categoryLabel}
        </h2>
        <p className="text-gray-600">
          {totalCount > 0 ? `${totalCount}개의 상품` : "상품을 불러오는 중..."}
        </p>
      </div>

      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button variant="outline" size="sm" onClick={onSortChange}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          정렬
        </Button>
      </div>
    </div>
  );
}

// 메인 홈페이지 클라이언트 컴포넌트
export function HomePageClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || "all",
  );

  // 상품 데이터 로드
  const loadProducts = async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      console.group("🏷️ 카테고리별 상품 로드");
      console.log("선택된 카테고리:", category);

      // TODO: getProducts 함수에 카테고리 필터 추가 필요
      const { products: data, totalCount: count } = await getProducts(
        1,
        12,
        category === "all" ? undefined : category,
      );

      console.log("로드된 상품 수:", data.length);
      console.log("전체 상품 수:", count);
      console.groupEnd();

      setProducts(data);
      setTotalCount(count);
    } catch (err) {
      console.error("상품 로드 실패:", err);
      setError("상품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 변경 시 상품 재로드
  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // URL 업데이트 (옵션)
    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.replaceState({}, "", url.toString());
  };

  // 정렬 변경 핸들러 (추후 구현)
  const handleSortChange = () => {
    console.log("정렬 기능 - 추후 구현 예정");
  };

  return (
    <>
      {/* 헤로 섹션 */}
      <HeroSection />

      {/* 관리자 링크 섹션 */}
      <AdminLinkSection />

      {/* 상품 목록 섹션 */}
      <section id="products-section" className="py-12">
        <div className="container mx-auto px-4">
          {/* 카테고리 필터 */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* 상품 섹션 헤더 */}
          <ProductSectionHeader
            selectedCategory={selectedCategory}
            totalCount={totalCount}
            onSortChange={handleSortChange}
          />

          {/* 에러 표시 */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 상품 목록 */}
          {loading ? (
            <ProductList products={[]} isLoading={true} />
          ) : products.length > 0 ? (
            <>
              <ProductList products={products} />

              {/* 전체 상품 수 표시 */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  총 {totalCount}개의 상품이 있습니다
                </p>
                <Button
                  variant="outline"
                  onClick={() => loadProducts(selectedCategory)}
                >
                  새로고침
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "상품 준비 중입니다"
                  : `${getCategoryLabel(selectedCategory)} 상품이 없습니다`}
              </h3>
              <p className="text-gray-600">
                {selectedCategory === "all"
                  ? "곧 멋진 상품들을 만나보실 수 있습니다!"
                  : "다른 카테고리를 선택해보세요."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// useSearchParams를 Suspense로 감싸는 래퍼 컴포넌트
export default function HomePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
