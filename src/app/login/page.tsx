/**
 * @file page.tsx
 * @description 로그인 및 회원가입 페이지 컴포넌트
 *
 * 이 파일은 애플리케이션의 로그인 및 회원가입 기능을 제공하는 페이지 컴포넌트를 정의합니다.
 * 단일 컴포넌트 내에서 로그인/회원가입 모드 전환이 가능한 UI를 구현합니다.
 *
 * 주요 기능:
 * 1. 로그인/회원가입 모드 전환 기능
 * 2. Supabase 인증 연동 (서버 액션 활용)
 * 3. 폼 유효성 검사 및 오류 표시 (폼 컴포넌트 내부)
 * 4. 비밀번호 요구사항 실시간 검증 (회원가입 폼 컴포넌트 내부)
 * 5. 성공/실패 알림 및 리다이렉트 처리 (폼 컴포넌트 내부)
 * 6. 카카오 소셜 로그인 지원 (폼 컴포넌트 내부)
 *
 * 구현 로직:
 * - 로그인/회원가입 폼 컴포넌트를 분리하여 모듈화
 * - React 상태(`useState`)를 통한 로그인/회원가입 모드 전환
 * - 재사용 가능한 인증 관련 컴포넌트(`LoginForm`, `SignupForm`) 활용
 * - 이메일 상태는 페이지(`LoginPage`) 레벨에서 관리하여 모드 전환 시 이메일 값 유지
 *
 * @dependencies
 * - react
 * - next/link
 * - @/components/ui/* (ShadcnUI)
 * - @/components/auth/login-form
 * - @/components/auth/signup-form
 */

"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");

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
