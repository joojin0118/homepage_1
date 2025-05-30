/**
 * @file navbar.tsx
 * @description 메인 네비게이션 바 컴포넌트
 *
 * 이 컴포넌트는 반응형 디자인에 맞게 데스크탑과 모바일 뷰를 통합합니다.
 * - 모바일: 햄버거 메뉴와 로고만 표시
 * - 데스크탑: 전체 네비게이션 메뉴와 사용자 정보 표시
 */

"use client";

import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import DesktopMenu from "./desktop-menu";

export function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-brand-title text-xl text-gray-900">SHOP</span>
          </Link>
        </div>

        {/* 데스크탑 메뉴 */}
        <DesktopMenu />
      </div>
    </header>
  );
}
