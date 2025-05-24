/**
 * @file login-form.tsx
 * @description 로그인 폼 컴포넌트
 *
 * 이 파일은 사용자가 이메일과 비밀번호로 로그인하는 폼 UI를 제공합니다.
 * 서버 액션을 통해 인증을 처리하고, 유효성 검사 오류 및 서버 응답을 표시합니다.
 * 소셜 로그인 옵션도 포함합니다.
 *
 * 주요 기능:
 * 1. 이메일 및 비밀번호 입력 필드
 * 2. 폼 제출 (서버 액션 연동)
 * 3. 유효성 검사 및 서버 오류 메시지 표시
 * 4. 로그인 로딩 상태 표시
 * 5. 카카오 소셜 로그인 버튼 및 구분선 포함
 * 6. 회원가입 모드로 전환하는 버튼 제공
 * 7. 인증 상태는 revalidatePath와 onAuthStateChange를 통해 자동으로 갱신됨
 *
 * 구현 로직:
 * - React 상태(`useState`, `useActionState`)를 사용하여 폼 상태 및 서버 액션 상태 관리
 * - `useRouter`를 사용하여 인증 성공 후 페이지 리다이렉트
 * - Props를 통해 이메일 값 및 상태 변경 핸들러, 모드 전환 핸들러 전달받음
 * - `@/components/auth/buttons`에서 `LoginButton` 및 `KakaoButton` 컴포넌트 활용
 * - 인라인으로 소셜 로그인 구분선 구현 (다크 모드 대응 포함)
 *
 * @dependencies
 * - react
 * - next/navigation
 * - react/server (useActionState)
 * - @/components/ui/* (ShadcnUI)
 * - @/components/auth/buttons
 * - @/actions/auth (login 서버 액션)
 */

"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginButton, KakaoButton } from "@/components/auth/buttons";
import { login } from "@/actions/auth";

// 초기 상태 정의
const initialState = {
  error: null,
  success: null,
  fieldErrors: {},
};

interface LoginFormProps {
  email: string;
  onModeChange: () => void;
  onEmailChange: (value: string) => void;
}

export function LoginForm({
  email,
  onModeChange,
  onEmailChange,
}: LoginFormProps) {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loginState, loginAction] = useActionState(login, initialState);

  // 리다이렉트 처리
  useEffect(() => {
    if (loginState?.shouldRedirect && loginState?.redirectTo) {
      // login 서버 액션에서 revalidatePath를 호출하여 인증 상태를 전체 레이아웃에 반영
      // Supabase의 onAuthStateChange 이벤트도 발생하여 AuthProvider 상태 갱신
      router.replace(loginState.redirectTo);
    }
  }, [loginState, router]);

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // 폼 제출 핸들러
  const handleLoginSubmit = (formData: FormData) => {
    formData.set("email", email);
    formData.set("password", password);
    loginAction(formData);
  };

  return (
    <form action={handleLoginSubmit} className="space-y-4 sm:space-y-6">
      {loginState.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive-foreground">
            {loginState.error}
          </AlertDescription>
        </Alert>
      )}

      {loginState.success && !loginState.shouldRedirect && (
        <Alert>
          <AlertDescription className="text-green-600 dark:text-green-400">
            {loginState.success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="email" className="text-sm sm:text-base">
          이메일
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          className="h-10 sm:h-12 text-sm sm:text-base"
          aria-invalid={!!loginState.fieldErrors?.email}
          value={email}
          onChange={handleEmailChange}
        />
        {loginState.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {loginState.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Label htmlFor="password" className="text-sm sm:text-base">
          비밀번호
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="h-10 sm:h-12 text-sm sm:text-base"
          aria-invalid={!!loginState.fieldErrors?.password}
          onChange={handlePasswordChange}
          value={password}
        />
        {loginState.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {loginState.fieldErrors.password}
          </p>
        )}
      </div>

      <LoginButton />

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-card text-muted-foreground">
            또는 소셜 계정으로 가입
          </span>
        </div>
      </div>

      <KakaoButton />

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onModeChange}
          className="text-sm sm:text-base"
        >
          계정이 없으신가요? 회원가입
        </Button>
      </div>
    </form>
  );
}
