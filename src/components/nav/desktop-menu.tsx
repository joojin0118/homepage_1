/**
 * @file desktop-menu.tsx
 * @description 데스크탑 네비게이션 메뉴 컴포넌트
 *
 * 이 파일은 데스크탑 화면에서 표시되는 우측 네비게이션 메뉴를 정의합니다.
 * 사용자 인증 상태에 따라 사용자 정보와 드롭다운 메뉴를 표시합니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태에 따른 정보 표시
 * 2. 사용자 프로필 드롭다운 메뉴 통합
 * 3. 테마 전환 기능 제공
 * 4. 미디어 쿼리를 통한 반응형 표시
 *
 * 구현 로직:
 * - md 이상 화면 크기에서만 표시되도록 설계
 * - 사용자 인증 상태에 따른 조건부 렌더링
 * - 사용자 이메일에서 ID 부분 추출하여 표시
 * - UserNav 컴포넌트를 통한 사용자 드롭다운 메뉴 통합
 * - ThemeToggle 컴포넌트를 통한 테마 전환 기능 제공
 * - useAuth 훅을 통한 인증 상태 접근
 *
 * @dependencies
 * - ./user-nav (사용자 네비게이션 컴포넌트)
 * - @/components/ui/theme-toggle (테마 전환 컴포넌트)
 * - @/components/auth/auth-provider (인증 컨텍스트)
 */

"use client";

import UserNav from "./user-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";

export default function DesktopMenu() {
  const { user } = useAuth();

  return (
    <div className="hidden md:flex items-center gap-4">
      {user && (
        <div className="text-sm mr-2">
          <span className="hidden md:inline">환영합니다, </span>
          <span className="font-medium">{user.email?.split("@")[0]}</span>님
        </div>
      )}

      <UserNav />
      <ThemeToggle />
    </div>
  );
}
