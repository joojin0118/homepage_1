/**
 * @file page.tsx
 * @description ShopMall 홈페이지
 *
 * 주요 기능:
 * 1. 상품 목록 표시 (서버 사이드 렌더링)
 * 2. 장바구니 추가 기능
 * 3. 카테고리별 필터링
 * 4. 검색 및 정렬 기능
 * 5. 반응형 그리드 레이아웃
 * 6. 상품 상세 페이지로 이동 링크
 * 7. 관리자 전용 링크 (관리자에게만 표시)
 *
 * @dependencies
 * - @/actions/products: 상품 관련 서버 액션
 * - @/components/products: 상품 관련 컴포넌트
 * - @/components/nav/navbar: 네비게이션 바
 * - @/utils/supabase/server: 서버 컴포넌트용 Supabase 클라이언트
 * - @/constants/categories: 카테고리 상수
 */

import { Suspense } from "react";
import { HomePageClient } from "@/components/pages/home-page-client";
import { Navbar } from "@/components/nav/navbar";

// 메인 홈페이지 컴포넌트 (서버 컴포넌트)
export default function HomePage() {
  console.log("🏠 ShopMall 홈페이지 렌더링");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <HomePageClient />
        </Suspense>
      </main>
    </div>
  );
}
