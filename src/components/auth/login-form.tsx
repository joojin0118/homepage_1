/**
 * @file login-form.tsx
 * @description 로그인 폼 컴포넌트
 *
 * 이 파일은 사용자가 이메일과 비밀번호로 로그인하거나 매직 링크로 로그인하는 폼 UI를 제공합니다.
 * 서버 액션을 통해 인증을 처리하고, 유효성 검사 오류 및 서버 응답을 표시합니다.
 * 소셜 로그인 옵션도 포함합니다.
 *
 * 주요 기능:
 * 1. 이메일 및 비밀번호 입력 필드 (일반 로그인)
 * 2. 매직 링크 이메일 로그인
 * 3. 폼 제출 (서버 액션 연동)
 * 4. 유효성 검사 및 서버 오류 메시지 표시
 * 5. 로그인 로딩 상태 표시
 * 6. 카카오 소셜 로그인 버튼 및 구분선 포함
 * 7. 회원가입 모드로 전환하는 버튼 제공
 * 8. 브라우저 간 호환성 안내 메시지
 * 9. 인증 상태는 revalidatePath와 onAuthStateChange를 통해 자동으로 갱신됨
 *
 * 구현 로직:
 * - React 상태(`useState`, `useActionState`)를 사용하여 폼 상태 및 서버 액션 상태 관리
 * - `useRouter`를 사용하여 인증 성공 후 페이지 리다이렉트
 * - Props를 통해 이메일 값 및 상태 변경 핸들러, 모드 전환 핸들러 전달받음
 * - `@/components/auth/buttons`에서 `LoginButton` 및 `KakaoButton` 컴포넌트 활용
 * - 인라인으로 소셜 로그인 구분선 구현 (다크 모드 대응 포함)
 * - 탭 형태로 일반 로그인과 매직 링크 로그인 구분
 *
 * @dependencies
 * - react
 * - next/navigation
 * - react/server (useActionState)
 * - @/components/ui/* (ShadcnUI)
 * - @/components/auth/buttons
 * - @/actions/auth (login, sendMagicLink 서버 액션)
 */

"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginButton, KakaoButton } from "@/components/auth/buttons";
import { login, sendMagicLink } from "@/actions/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { Mail, Lock, Zap, AlertTriangle } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("password");
  const router = useRouter();
  const [loginState, loginAction] = useActionState(login, initialState);
  const [magicLinkState, magicLinkAction] = useActionState(
    sendMagicLink,
    initialState,
  );
  const { user, refreshUser } = useAuth();

  // 리다이렉트 처리 - AuthProvider의 상태와 동기화
  useEffect(() => {
    if (loginState?.shouldRedirect && loginState?.redirectTo) {
      console.log("[LoginForm] Login success, redirecting...");

      // 로그인 성공 시 AuthProvider 상태를 수동으로 갱신한 후 리다이렉트
      const handleRedirect = async () => {
        try {
          // AuthProvider의 상태를 강제로 갱신
          console.log("[LoginForm] Refreshing auth state...");
          await refreshUser();

          // 상태 업데이트 완료 후 리다이렉트
          console.log(
            "[LoginForm] User refreshed, redirecting to:",
            loginState.redirectTo,
          );
          router.replace(loginState.redirectTo!);
        } catch (error) {
          console.error("[LoginForm] 인증 상태 갱신 실패:", error);
          // refreshUser 실패해도 로그인은 성공했으므로 리다이렉트 진행
          // AuthProvider의 onAuthStateChange가 상태를 업데이트할 것임
          console.log(
            "[LoginForm] Proceeding with redirect despite refresh error",
          );
          router.replace(loginState.redirectTo!);
        }
      };

      handleRedirect();
    }
  }, [loginState, router, refreshUser]);

  // 이미 로그인된 사용자라면 즉시 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  // 일반 로그인 폼 제출 핸들러
  const handleLoginSubmit = (formData: FormData) => {
    formData.set("email", email);
    formData.set("password", password);
    loginAction(formData);
  };

  // 매직 링크 폼 제출 핸들러
  const handleMagicLinkSubmit = (formData: FormData) => {
    formData.set("email", email);
    magicLinkAction(formData);
  };

  return (
    <div className="space-y-6">
      {/* 로그인 방식 선택 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            비밀번호 로그인
          </TabsTrigger>
          <TabsTrigger value="magic-link" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            매직 링크
          </TabsTrigger>
        </TabsList>

        {/* 비밀번호 로그인 */}
        <TabsContent value="password" className="space-y-4">
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
                placeholder="비밀번호를 입력하세요"
                required
                className="h-10 sm:h-12 text-sm sm:text-base"
                aria-invalid={!!loginState.fieldErrors?.password}
                value={password}
                onChange={handlePasswordChange}
              />
              {loginState.fieldErrors?.password && (
                <p className="text-sm text-destructive">
                  {loginState.fieldErrors.password}
                </p>
              )}
            </div>

            <LoginButton />
          </form>
        </TabsContent>

        {/* 매직 링크 로그인 */}
        <TabsContent value="magic-link" className="space-y-4">
          <form
            action={handleMagicLinkSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {magicLinkState.error && (
              <Alert variant="destructive">
                <AlertDescription className="text-destructive-foreground">
                  {magicLinkState.error}
                </AlertDescription>
              </Alert>
            )}

            {magicLinkState.success && (
              <Alert>
                <AlertDescription className="text-green-600 dark:text-green-400 whitespace-pre-line">
                  {magicLinkState.success}
                </AlertDescription>
              </Alert>
            )}

            {/* 브라우저 호환성 경고 */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>중요:</strong> 매직 링크는 이메일을 요청한
                브라우저에서만 작동합니다. 다른 브라우저나 기기에서 링크를
                클릭하면 인증에 실패할 수 있습니다.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="magic-email" className="text-sm sm:text-base">
                이메일
              </Label>
              <Input
                id="magic-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-10 sm:h-12 text-sm sm:text-base"
                aria-invalid={!!magicLinkState.fieldErrors?.email}
                value={email}
                onChange={handleEmailChange}
              />
              {magicLinkState.fieldErrors?.email && (
                <p className="text-sm text-destructive">
                  {magicLinkState.fieldErrors.email}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
            >
              <Mail className="h-4 w-4 mr-2" />
              로그인 링크 보내기
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* 소셜 로그인 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            또는 소셜 로그인
          </span>
        </div>
      </div>

      {/* 소셜 로그인 버튼 */}
      <KakaoButton />

      {/* 회원가입 안내 */}
      <div className="text-center text-sm text-muted-foreground">
        아직 계정이 없으신가요?{" "}
        <button
          type="button"
          onClick={onModeChange}
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
