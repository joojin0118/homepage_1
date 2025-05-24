/**
 * @file page.tsx
 * @description ShopMall 홈페이지
 *
 * 주요 기능:
 * 1. 상품 목록 표시 (서버 사이드 렌더링)
 * 2. 장바구니 추가 기능
 * 3. 검색 및 필터링 (향후 추가 예정)
 * 4. 반응형 그리드 레이아웃
 * 5. 상품 상세 페이지로 이동 링크
 *
 * @dependencies
 * - @/actions/products: 상품 관련 서버 액션
 * - @/components/products: 상품 관련 컴포넌트
 * - @/components/nav/navbar: 네비게이션 바
 */

import { Suspense } from "react";
import { getProducts } from "@/actions/products";
import { ProductList } from "@/components/products/product-list";
import { Navbar } from "@/components/nav/navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Store, Search, Filter } from "lucide-react";

// 홈페이지 헤로 섹션
function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ShopMall
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            최고의 상품을 최저 가격으로 만나보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-gray-100"
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

// 상품 섹션 헤더
function ProductSectionHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          전체 상품
        </h2>
        <p className="text-gray-600">
          다양한 카테고리의 프리미엄 상품들을 만나보세요
        </p>
      </div>
      
      <div className="flex gap-2 mt-4 sm:mt-0">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
        <Button variant="outline" size="sm">
          정렬
        </Button>
      </div>
    </div>
  );
}

// 상품 목록 컨테이너 (서버 컴포넌트)
async function ProductsContainer() {
  try {
    console.group("🏠 홈페이지 상품 목록 로드");
    console.log("상품 목록 조회 시작...");
    
    const { products, totalCount } = await getProducts(1, 12);
    
    console.log("조회된 상품 수:", products.length);
    console.log("전체 상품 수:", totalCount);
    console.groupEnd();

    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ProductSectionHeader />
          
          {products.length > 0 ? (
            <>
              <ProductList products={products} />
              
              {/* 전체 상품 수 표시 */}
              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">
                  총 {totalCount}개의 상품이 있습니다
                </p>
                <Button variant="outline">
                  더 많은 상품 보기
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                상품 준비 중입니다
              </h3>
              <p className="text-gray-600">
                곧 멋진 상품들을 만나보실 수 있습니다!
              </p>
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error("상품 목록 로드 실패:", error);
    
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              상품 목록을 불러오는 중 오류가 발생했습니다. 
              잠시 후 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
}

// 메인 홈페이지 컴포넌트
export default function HomePage() {
  console.log("🏠 ShopMall 홈페이지 렌더링");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* 헤로 섹션 */}
        <HeroSection />
        
        {/* 상품 목록 섹션 */}
        <Suspense 
          fallback={
            <section className="py-12">
              <div className="container mx-auto px-4">
                <ProductSectionHeader />
                <ProductList products={[]} isLoading={true} />
              </div>
            </section>
          }
        >
          <ProductsContainer />
        </Suspense>
      </main>
    </div>
  );
}
