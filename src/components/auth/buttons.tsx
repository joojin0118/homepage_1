/**
 * @file buttons.tsx
 * @description 인증 관련 버튼 컴포넌트 모음
 *
 * 이 파일은 로그인, 회원가입, 로그아웃 등 인증 과정에서 사용되는 다양한 버튼 컴포넌트를 정의합니다.
 * 각 버튼은 Supabase 인증 상태 및 폼 상태와 연동됩니다.
 *
 * 주요 컴포넌트:
 * 1. LoginButton: 로그인 폼 제출 버튼 (로딩 상태 포함)
 * 2. SignupButton: 회원가입 폼 제출 버튼 (로딩 상태 및 비밀번호 유효성 검사 연동)
 * 3. LogoutButton: 로그아웃 버튼
 * 4. KakaoButton: 카카오 소셜 로그인 버튼
 *
 * 구현 로직:
 * - `useFormStatus` 훅을 사용하여 폼 제출 상태 관리 (LoginButton, SignupButton)
 * - `createBrowserSupabaseClient`를 사용하여 클라이언트 측 Supabase 인증 로직 수행 (LogoutButton, KakaoButton)
 * - `signInWithOAuth` 메서드를 사용하여 소셜 로그인 처리 (KakaoButton)
 * - 라우팅 처리를 위해 `next/navigation`의 `useRouter` 사용
 * - 인증 상태는 AuthProvider의 onAuthStateChange 이벤트에 의해 관리됨
 *
 * @dependencies
 * - react
 * - next/navigation
 * - react-dom (useFormStatus)
 * - @/components/ui/button (ShadcnUI Button)
 * - @/utils/supabase/client
 * - @supabase/supabase-js (signInWithOAuth)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { useFormStatus } from "react-dom";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full h-12 text-lg" disabled={pending}>
      {pending ? "로그인 중..." : "로그인"}
    </Button>
  );
}

// 회원가입 버튼 컴포넌트
export function SignupButton({
  isPasswordValid,
  isSignupSuccessful,
}: {
  isPasswordValid: boolean;
  isSignupSuccessful?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full h-12 text-lg"
      disabled={!isPasswordValid || isSignupSuccessful || pending}
    >
      {pending
        ? "처리 중..."
        : isSignupSuccessful
          ? "회원가입 완료! 이메일을 확인해주세요."
          : "회원가입"}
    </Button>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();

      // onAuthStateChange 이벤트가 SIGNED_OUT 이벤트를 발생시키므로
      // AuthProvider에서 자동으로 사용자 상태를 업데이트함
      // 로그인 페이지로 직접 이동
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
}

export function KakaoButton() {
  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
      setLoading(true);
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleKakaoLogin}
      disabled={loading}
      className="
        w-full
        h-12
        rounded-md
        bg-[#FEE500]
        hover:bg-[#F2D900]
        text-[#191919]
        font-medium
        flex
        items-center
        justify-center
        transition-colors
        duration-200
        border-0
        relative
        px-0
        py-0
      "
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>로그인 중...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <svg width="18" height="18" viewBox="0 0 18 18" className="mr-2">
            <g fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 0.5C4.30375 0.5 0.5 3.4375 0.5 7.0625C0.5 9.3 2.05687 11.2688 4.32937 12.25C4.17625 12.7781 3.68937 14.3938 3.6025 14.8187C3.49812 15.3781 3.78062 15.3719 4.00187 15.2219C4.18 15.1 5.94937 13.85 6.59312 13.3781C7.35375 13.5062 8.15875 13.625 9 13.625C13.6962 13.625 17.5 10.6875 17.5 7.0625C17.5 3.4375 13.6962 0.5 9 0.5Z"
                fill="#191919"
              />
            </g>
          </svg>
          <span className="text-[15px] leading-[1.4]">카카오 로그인</span>
        </div>
      )}
    </Button>
  );
}
