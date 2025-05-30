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
import { useAuth } from "@/components/auth/auth-provider";

// 홈페이지 헤로 섹션
function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 추천 상품 데이터 로드 (신상품 + 인기상품)
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log("🌟 추천 상품 로드 중...");

        // 최신 등록 상품 4개 가져오기 (이미 created_at 내림차순으로 정렬됨)
        const { products } = await getProducts(1, 4);

        console.log("🌟 추천 상품 로드 완료:", products.length, "개");
        setFeaturedProducts(products);
      } catch (error) {
        console.error("❌ 추천 상품 로드 실패:", error);
        // 에러 시 빈 배열로 설정
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // 자동 슬라이드 기능 (상품이 있을 때만)
  useEffect(() => {
    if (featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000); // 5초마다 슬라이드 변경 (1초 늦춤)

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

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

  // 상품별 배지 생성 함수
  const getProductBadge = (product: Product, index: number) => {
    // 최신 상품일수록 "신상품", 오래된 상품은 "인기상품"
    if (index === 0) return "🔥 HOT";
    if (index === 1) return "✨ 신상품";
    if (index === 2) return "💎 베스트";
    return "🌟 추천";
  };

  // 상품별 그라데이션 색상
  const getProductGradient = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-red-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-purple-500",
      "bg-gradient-to-br from-green-500 to-teal-500",
      "bg-gradient-to-br from-orange-500 to-yellow-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-brand-title text-4xl md:text-5xl text-gray-900 leading-tight">
              새로운 스타일을
              <br />
              <span className="text-gray-600">발견하세요</span>
            </h1>
            <p className="text-body text-lg text-gray-600 leading-relaxed">
              트렌디하고 품질 좋은 제품들을 합리적인 가격에 만나보세요. 당신만의
              특별한 스타일을 완성해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3"
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
                variant="outline"
                className="border-gray-300 text-gray-700 px-8 py-3"
                onClick={scrollToSearch}
              >
                <Search className="h-5 w-5 mr-2" />
                상품 검색
              </Button>
            </div>
          </div>

          {/* 실제 상품 슬라이딩 배너 */}
          <div className="relative">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
              {loading ? (
                // 로딩 상태
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-400 border-t-transparent mx-auto mb-4"></div>
                    <p>추천 상품을 불러오는 중...</p>
                  </div>
                </div>
              ) : featuredProducts.length === 0 ? (
                // 상품이 없을 때
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Store className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      준비된 상품이 없습니다
                    </p>
                    <p className="text-sm">
                      곧 멋진 상품들을 만나보실 수 있습니다!
                    </p>
                  </div>
                </div>
              ) : (
                // 실제 상품들
                featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                      index === currentSlide
                        ? "transform translate-x-0"
                        : index < currentSlide
                          ? "transform -translate-x-full"
                          : "transform translate-x-full"
                    }`}
                  >
                    <div
                      className={`w-full h-full ${getProductGradient(index)} flex flex-col justify-between p-8 text-white relative overflow-hidden`}
                    >
                      {/* 배경 이미지 (있을 경우) */}
                      {product.image_url && (
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{
                            backgroundImage: `url(${product.image_url})`,
                          }}
                        />
                      )}

                      {/* 오버레이 */}
                      <div className="absolute inset-0 bg-black/20" />

                      {/* 콘텐츠 */}
                      <div className="relative z-10">
                        {/* 배지 */}
                        <div className="flex justify-between items-start">
                          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                            {getProductBadge(product, index)}
                          </span>
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Store className="w-8 h-8" />
                          </div>
                        </div>

                        {/* 상품 정보 */}
                        <div className="space-y-4 mt-auto">
                          <h3 className="text-2xl font-bold leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-white/90 text-sm line-clamp-2">
                            {product.description ||
                              "품질 좋은 상품을 합리적인 가격에 만나보세요"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">
                              {product.price.toLocaleString()}원
                            </span>
                            <Link href={`/products/${product.id}`}>
                              <Button
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 transition-all duration-200"
                                size="sm"
                              >
                                상세보기 →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 슬라이드 인디케이터 */}
            {featuredProducts.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}

            {/* 좌우 네비게이션 버튼 */}
            {featuredProducts.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === 0 ? featuredProducts.length - 1 : prev - 1,
                    )
                  }
                >
                  ←
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  onClick={() =>
                    setCurrentSlide(
                      (prev) => (prev + 1) % featuredProducts.length,
                    )
                  }
                >
                  →
                </button>
              </>
            )}
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
    <section className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="h-5 w-5 text-gray-600" />
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
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700"
              >
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
    <section id="search-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            원하는 상품을 찾아보세요
          </h2>
          <p className="text-gray-600 mb-8">
            상품명 또는 설명으로 검색하여 원하는 제품을 쉽게 찾아보세요
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search-input"
              type="text"
              placeholder="상품명 또는 설명으로 검색해보세요..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 py-4 text-lg border border-gray-200 focus:border-gray-900 rounded-lg bg-white"
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
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">카테고리</h3>
      <div className="flex flex-wrap gap-3">
        {PRODUCT_CATEGORIES.map((category) => (
          <Badge
            key={category.value}
            variant={
              selectedCategory === category.value ? "default" : "outline"
            }
            className={`cursor-pointer transition-colors px-4 py-2 text-sm ${
              selectedCategory === category.value
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
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
      return "인기 상품";
    }

    return categoryLabel;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
        <p className="text-gray-600">
          {totalCount > 0
            ? `${totalCount}개의 상품`
            : searchTerm
              ? "검색 결과가 없습니다"
              : "상품을 불러오는 중..."}
        </p>
      </div>

      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-700"
          onClick={onSortChange}
        >
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

      {/* 구분선 */}
      <div className="border-t border-gray-200"></div>

      {/* 관리자 링크 섹션 */}
      <AdminLinkSection />

      {/* 구분선 */}
      <div className="border-t border-gray-200"></div>

      {/* 검색 섹션 */}
      <SearchSection
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        isLoading={loading}
      />

      {/* 구분선 */}
      <div className="border-t border-gray-200"></div>

      {/* 상품 목록 섹션 */}
      <section id="products-section" className="py-16 bg-white">
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
