/**
 * @file signup-form.tsx
 * @description 회원가입 폼 컴포넌트
 *
 * 이 파일은 사용자가 이메일, 비밀번호로 회원가입하는 폼 UI를 제공합니다.
 * 서버 액션을 통해 회원가입을 처리하고, 유효성 검사 오류 및 서버 응답을 표시합니다.
 * 비밀번호 요구사항 실시간 검증 및 소셜 로그인 옵션도 포함합니다.
 *
 * 주요 기능:
 * 1. 이메일 및 비밀번호 입력 필드
 * 2. 폼 제출 (서버 액션 연동)
 * 3. 유효성 검사 및 서버 오류 메시지 표시
 * 4. 회원가입 로딩 상태 표시
 * 5. 비밀번호 요구사항 실시간 검증 UI 제공
 * 6. 카카오 소셜 로그인 버튼 및 구분선 포함
 * 7. 로그인 모드로 전환하는 버튼 제공
 *
 * 구현 로직:
 * - React 상태(`useState`, `useActionState`)를 사용하여 폼 상태 및 서버 액션 상태 관리 (비밀번호, 회원가입 상태 등)
 * - `useRouter`를 사용하여 인증 성공 후 페이지 리다이렉트
 * - Props (`email`, `onEmailChange`, `onModeChange`)를 통해 이메일 값, 이메일 상태 변경 핸들러, 모드 전환 핸들러 전달받음
 * - 비밀번호 요구사항 충족 여부를 실시간 검증 (`isPasswordValid`)
 * - `@/components/auth/buttons`에서 `SignupButton` 및 `KakaoButton` 컴포넌트 활용
 * - 인라인으로 소셜 로그인 구분선 구현 (다크 모드 대응 포함)
 *
 * @dependencies
 * - react
 * - next/navigation
 * - react/server (useActionState)
 * - @/components/ui/* (ShadcnUI)
 * - @/components/auth/buttons
 * - @/components/auth/password-requirements
 * - @/actions/auth (signup 서버 액션)
 */

"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SignupButton, KakaoButton } from "@/components/auth/buttons";
import {
  PasswordRequirements,
  isPasswordValid,
} from "@/components/auth/password-requirements";
import { signup } from "@/actions/auth";

// 초기 상태 정의
const initialState = {
  error: null,
  success: null,
  fieldErrors: {},
};

interface SignupFormProps {
  email: string;
  onModeChange: () => void;
  onEmailChange: (value: string) => void;
}

export function SignupForm({
  email,
  onModeChange,
  onEmailChange,
}: SignupFormProps) {
  const [password, setPassword] = useState("");
  const [isPasswordRequirementsMet, setIsPasswordRequirementsMet] =
    useState(false);
  const router = useRouter();
  const [signupState, signupAction] = useActionState(signup, initialState);
  const [isSignupSuccessful, setIsSignupSuccessful] = useState(false);

  // 리다이렉트 처리
  useEffect(() => {
    if (signupState?.shouldRedirect && signupState?.redirectTo) {
      router.replace(signupState.redirectTo);
    }
  }, [signupState, router]);

  // 비밀번호 요구사항 검증
  useEffect(() => {
    setIsPasswordRequirementsMet(isPasswordValid(password));
  }, [password]);

  // 회원가입 성공 여부 감지
  useEffect(() => {
    if (signupState?.success) {
      setIsSignupSuccessful(true);
    }
  }, [signupState]);

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // 폼 제출 핸들러
  const handleSignupSubmit = (formData: FormData) => {
    formData.set("email", email);
    formData.set("password", password);
    signupAction(formData);
  };

  return (
    <form action={handleSignupSubmit} className="space-y-4 sm:space-y-6">
      {signupState.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-destructive-foreground">
            {signupState.error}
          </AlertDescription>
        </Alert>
      )}

      {signupState.success && (
        <Alert>
          <AlertDescription className="text-green-600 dark:text-green-400">
            {signupState.success}
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
          aria-invalid={!!signupState.fieldErrors?.email}
          value={email}
          onChange={handleEmailChange}
          disabled={isSignupSuccessful}
        />
        {signupState.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {signupState.fieldErrors.email}
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
          aria-invalid={!!signupState.fieldErrors?.password}
          onChange={handlePasswordChange}
          value={password}
          disabled={isSignupSuccessful}
        />
        {signupState.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {signupState.fieldErrors.password}
          </p>
        )}

        {/* 회원가입 모드일 때만 비밀번호 요구사항 표시 */}
        <PasswordRequirements password={password} />
      </div>

      <SignupButton
        isPasswordValid={isPasswordRequirementsMet}
        isSignupSuccessful={isSignupSuccessful}
      />

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

      <div
        className={isSignupSuccessful ? "opacity-50 pointer-events-none" : ""}
      >
        <KakaoButton />
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onModeChange}
          className="text-sm sm:text-base"
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </div>
    </form>
  );
}
