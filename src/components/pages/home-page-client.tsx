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

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/actions/products";
import { ProductList } from "@/components/products/product-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { useAddToCart } from "@/hooks/use-cart";
import { PRODUCT_CATEGORIES, getCategoryLabel } from "@/constants/categories";
import {
  AlertCircle,
  Store,
  Search,
  Shield,
  Settings,
  Grid3X3,
  ArrowUpDown,
  X,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import type { Product } from "@/actions/products";

// 홈페이지 헤로 섹션
function HeroSection() {
  // 검색 섹션으로 스크롤하는 함수
  const scrollToSearch = () => {
    document.getElementById("search-section")?.scrollIntoView({
      behavior: "smooth",
    });
    // 검색 입력 필드에 포커스
    setTimeout(() => {
      const searchInput = document.getElementById("search-input");
      searchInput?.focus();
    }, 500);
  };

  return (
    <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Shop Mall</h1>
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
              onClick={scrollToSearch}
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

// 검색 섹션 컴포넌트
interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchClear: () => void;
  isLoading: boolean;
}

function SearchSection({
  searchTerm,
  onSearchChange,
  onSearchClear,
  isLoading,
}: SearchSectionProps) {
  return (
    <section id="search-section" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            원하는 상품을 찾아보세요
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search-input"
              type="text"
              placeholder="상품명 또는 설명으로 검색해보세요..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 py-4 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-lg"
              disabled={isLoading}
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                onClick={onSearchClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-center text-gray-600 mt-4">
              {searchTerm} 검색 결과
            </p>
          )}
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
  searchTerm: string;
  totalCount: number;
  onSortChange: () => void;
}

function ProductSectionHeader({
  selectedCategory,
  searchTerm,
  totalCount,
  onSortChange,
}: ProductSectionHeaderProps) {
  const categoryLabel = getCategoryLabel(selectedCategory);

  // 제목 생성
  const getTitle = () => {
    if (searchTerm) {
      if (selectedCategory !== "all") {
        return `${searchTerm} 검색 결과 (${categoryLabel})`;
      }
      return `${searchTerm} 검색 결과`;
    }

    if (selectedCategory === "all") {
      return "전체 상품";
    }

    return categoryLabel;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">
          {totalCount > 0
            ? `${totalCount}개의 상품`
            : searchTerm
              ? "검색 결과가 없습니다"
              : "상품을 불러오는 중..."}
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
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get("search") || "",
  );
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    searchParams?.get("search") || "",
  );

  // TanStack Query 장바구니 추가 mutation
  const addToCartMutation = useAddToCart();

  // 검색어 디바운싱 (500ms 지연)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // 상품 데이터 로드
  const loadProducts = useCallback(
    async (category: string, search: string = "") => {
      try {
        setLoading(true);
        setError(null);

        console.group("🏷️ 상품 로드");
        console.log("선택된 카테고리:", category);
        console.log("검색어:", search || "없음");

        const { products: data, totalCount: count } = await getProducts(
          1,
          12,
          category === "all" ? undefined : category,
          search || undefined,
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
    },
    [],
  );

  // 카테고리 또는 디바운싱된 검색어 변경 시 상품 재로드
  useEffect(() => {
    loadProducts(selectedCategory, debouncedSearchTerm);
  }, [selectedCategory, debouncedSearchTerm, loadProducts]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // URL 업데이트
    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.replaceState({}, "", url.toString());
  };

  // 검색 핸들러 (즉시 상태 업데이트, 디바운싱으로 API 호출)
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // URL 업데이트
    const url = new URL(window.location.href);
    if (term.trim()) {
      url.searchParams.set("search", term);
    } else {
      url.searchParams.delete("search");
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  // 검색 초기화 핸들러
  const handleSearchClear = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    // URL 업데이트
    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    window.history.replaceState({}, "", url.toString());
  };

  // 정렬 변경 핸들러 (추후 구현)
  const handleSortChange = () => {
    console.log("정렬 기능 - 추후 구현 예정");
  };

  // 장바구니 담기 핸들러
  const handleAddToCart = async (productId: number) => {
    console.log("🛒 장바구니 담기 시도:", productId);

    const product = products.find((p) => p.id === productId);
    if (!product) {
      console.error("상품을 찾을 수 없습니다:", productId);
      alert("상품을 찾을 수 없습니다.");
      return;
    }

    if (product.stock_quantity <= 0) {
      console.warn("재고가 없는 상품:", product.name);
      alert("재고가 없는 상품입니다.");
      return;
    }

    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: (result) => {
          console.log("✅ 장바구니 추가 성공:", result.message);
          alert(result.message);
        },
        onError: (error) => {
          console.error("❌ 장바구니 추가 실패:", error);
          alert(error.message || "장바구니 추가에 실패했습니다.");
        },
      },
    );
  };

  return (
    <>
      {/* 헤로 섹션 */}
      <HeroSection />

      {/* 관리자 링크 섹션 */}
      <AdminLinkSection />

      {/* 검색 섹션 */}
      <SearchSection
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        isLoading={loading}
      />

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
            searchTerm={searchTerm}
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
              <ProductList products={products} onAddToCart={handleAddToCart} />

              {/* 전체 상품 수 표시 */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  총 {totalCount}개의 상품이 있습니다
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    loadProducts(selectedCategory, debouncedSearchTerm)
                  }
                >
                  새로고침
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? `"${searchTerm}" 검색 결과가 없습니다`
                  : selectedCategory === "all"
                    ? "상품 준비 중입니다"
                    : `${getCategoryLabel(selectedCategory)} 상품이 없습니다`}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "다른 검색어를 시도해보거나 카테고리를 변경해보세요."
                  : selectedCategory === "all"
                    ? "곧 멋진 상품들을 만나보실 수 있습니다!"
                    : "다른 카테고리를 선택해보세요."}
              </p>
              {searchTerm && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={handleSearchClear}>
                    <X className="h-4 w-4 mr-2" />
                    검색 초기화
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCategoryChange("all")}
                    disabled={selectedCategory === "all"}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    전체 카테고리 보기
                  </Button>
                </div>
              )}
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
