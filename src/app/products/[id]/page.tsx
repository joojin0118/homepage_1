/**
 * @file products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 주요 기능:
 * 1. 상품 상세 정보 표시 (서버 사이드 렌더링)
 * 2. 상품 이미지 표시
 * 3. 수량 선택 기능
 * 4. 장바구니 담기 기능
 * 5. 관련 상품 추천 (향후 추가)
 * 6. SEO 최적화된 메타데이터
 *
 * @dependencies
 * - @/actions/products: 상품 관련 서버 액션
 * - @/components/products: 상품 관련 컴포넌트
 * - next/image: 이미지 최적화
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/actions/products";
import { ProductDetailContainer } from "@/components/products/product-detail";
import { ProductList } from "@/components/products/product-list";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const productId = parseInt(id);
  
  if (isNaN(productId)) {
    return {
      title: "상품을 찾을 수 없습니다 - ShopMall",
      description: "요청하신 상품을 찾을 수 없습니다.",
    };
  }

  try {
    const product = await getProduct(productId);
    
    if (!product) {
      return {
        title: "상품을 찾을 수 없습니다 - ShopMall",
        description: "요청하신 상품을 찾을 수 없습니다.",
      };
    }

    return {
      title: `${product.name} - ShopMall`,
      description: product.description || `${product.name} 상품 정보를 확인하세요.`,
      openGraph: {
        title: product.name,
        description: product.description || `${product.name} 상품 정보`,
        images: product.image_url ? [{ url: product.image_url }] : [],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 오류:", error);
    return {
      title: "상품 상세 - ShopMall",
      description: "상품 상세 정보를 확인하세요.",
    };
  }
}

// 관련 상품 섹션
async function RelatedProducts({ currentProductId }: { currentProductId: number }) {
  try {
    console.log("🔗 관련 상품 조회 시작");
    
    const { products } = await getProducts(1, 4);
    
    // 현재 상품 제외
    const relatedProducts = products.filter(product => product.id !== currentProductId);
    
    if (relatedProducts.length === 0) {
      return null;
    }

    console.log("🔗 관련 상품 수:", relatedProducts.length);

    return (
      <section className="py-12 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            다른 상품도 둘러보세요
          </h2>
          <ProductList products={relatedProducts.slice(0, 4)} />
        </div>
      </section>
    );
  } catch (error) {
    console.error("관련 상품 조회 실패:", error);
    return null;
  }
}

// 관련 상품 스켈레톤
function RelatedProductsSkeleton() {
  return (
    <section className="py-12 border-t">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 상품 상세 페이지 컴포넌트
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id);

  console.group("🛍️ 상품 상세 페이지");
  console.log("상품 ID:", productId);

  // 유효하지 않은 ID 체크
  if (isNaN(productId)) {
    console.error("유효하지 않은 상품 ID:", id);
    console.groupEnd();
    notFound();
  }

  try {
    // 상품 정보 조회
    const product = await getProduct(productId);

    if (!product) {
      console.error("상품을 찾을 수 없음:", productId);
      console.groupEnd();
      notFound();
    }

    console.log("상품 조회 성공:", product.name);
    console.groupEnd();

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-grow">
          {/* 뒤로가기 버튼 */}
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                상품 목록으로 돌아가기
              </Button>
            </Link>
          </div>

          {/* 상품 상세 정보 */}
          <ProductDetailContainer product={product} />

          {/* 관련 상품 */}
          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProducts currentProductId={product.id} />
          </Suspense>
        </main>
      </div>
    );
  } catch (error) {
    console.error("상품 상세 페이지 오류:", error);
    console.groupEnd();
    throw error;
  }
} 