/**
 * @file page.tsx
 * @description 로그인 및 회원가입 페이지 컴포넌트
 *
 * 이 파일은 애플리케이션의 로그인 및 회원가입 기능을 제공하는 페이지 컴포넌트를 정의합니다.
 * 단일 컴포넌트 내에서 로그인/회원가입 모드 전환이 가능한 UI를 구현합니다.
 *
 * 주요 기능:
 * 1. 로그인/회원가입 모드 전환 기능
 * 2. URL 쿼리 파라미터로 회원가입 모드 직접 진입 지원 (?mode=signup)
 * 3. Supabase 인증 연동 (서버 액션 활용)
 * 4. 폼 유효성 검사 및 오류 표시 (폼 컴포넌트 내부)
 * 5. 비밀번호 요구사항 실시간 검증 (회원가입 폼 컴포넌트 내부)
 * 6. 성공/실패 알림 및 리다이렉트 처리 (폼 컴포넌트 내부)
 * 7. 카카오 소셜 로그인 지원 (폼 컴포넌트 내부)
 *
 * 구현 로직:
 * - 로그인/회원가입 폼 컴포넌트를 분리하여 모듈화
 * - React 상태(`useState`)를 통한 로그인/회원가입 모드 전환
 * - useSearchParams를 사용하여 URL 쿼리 파라미터 기반 초기 모드 설정
 * - 재사용 가능한 인증 관련 컴포넌트(`LoginForm`, `SignupForm`) 활용
 * - 이메일 상태는 페이지(`LoginPage`) 레벨에서 관리하여 모드 전환 시 이메일 값 유지
 *
 * @dependencies
 * - react
 * - next/link
 * - next/navigation (useSearchParams)
 * - @/components/ui/* (ShadcnUI)
 * - @/components/auth/login-form
 * - @/components/auth/signup-form
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

// 클라이언트 컴포넌트 (useSearchParams 사용)
function LoginPageClient() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");

  // URL 쿼리 파라미터에 따른 초기 모드 설정
  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup") {
      setMode("signup");
    } else {
      setMode("login");
    }
  }, [searchParams]);

  // 이메일 변경 핸들러
  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  // 로그인 모드 전환 핸들러
  const handleToggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-12 bg-muted/10">
      <Card className="w-full max-w-screen-sm shadow-md">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl text-center">
            {mode === "login" ? "로그인" : "회원가입"}
          </CardTitle>
          <CardDescription className="text-center text-base sm:text-lg">
            {mode === "login"
              ? "계정에 로그인하세요."
              : "새 계정을 만들어보세요."}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {mode === "login" ? (
            <LoginForm
              onModeChange={handleToggleMode}
              email={email}
              onEmailChange={handleEmailChange}
            />
          ) : (
            <SignupForm
              onModeChange={handleToggleMode}
              email={email}
              onEmailChange={handleEmailChange}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-center py-4 px-4 sm:px-6">
          <Link
            href="/"
            className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// 로딩 상태 컴포넌트
function LoginPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-12 bg-muted/10">
      <Card className="w-full max-w-screen-sm shadow-md">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl text-center">
            로그인
          </CardTitle>
          <CardDescription className="text-center text-base sm:text-lg">
            로딩 중...
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center py-4 px-4 sm:px-6">
          <Link
            href="/"
            className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// 기본 export - Suspense로 감싸기
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageClient />
    </Suspense>
  );
}
