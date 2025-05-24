/**
 * @file route.ts
 * @description Supabase 인증 콜백 처리 API 라우트
 *
 * 이 파일은 Supabase 인증 프로세스의 콜백을 처리하는 API 라우트입니다.
 * OAuth 로그인 또는 이메일 OTP 확인 후 Supabase가 리다이렉트하는 엔드포인트로,
 * 인증 코드나 토큰을 검증하고 사용자 세션을 설정합니다.
 *
 * 주요 기능:
 * 1. 이메일 OTP 인증 토큰 검증 또는 인증 코드를 세션으로 교환 (`exchangeCodeForSession` 또는 `verifyOtp`)
 * 2. `@/utils/supabase/server`의 `createServerSupabaseClient` 함수를 사용하여 서버 측 Supabase 클라이언트 생성 및 쿠키 관리
 * 3. 인증 성공 시 `next` 쿼리 파라미터로 지정된 페이지로 리다이렉트 (기본값: `/`)
 * 4. 인증 실패 시 `/auth/error` 페이지로 리다이렉트
 * 5. revalidatePath를 통한 전체 앱 레이아웃 캐시 무효화로 인증 상태 즉시 반영
 *
 * 구현 로직:
 * - Next.js의 API 라우트 핸들러 (GET 메서드) 사용
 * - URL 쿼리 파라미터 (`token_hash`, `type`, `code`, `next`) 추출
 * - `code` 파라미터가 있는 경우 `exchangeCodeForSession` 메서드로 세션 교환 (주로 OAuth 콜백)
 * - `token_hash`와 `type` 파라미터가 있는 경우 `verifyOtp` 메서드로 OTP 검증 (주로 이메일 OTP 확인)
 * - 검증 결과를 바탕으로 성공 또는 실패 페이지로 리다이렉트
 * - revalidatePath를 사용하여 전체 앱의 캐시를 무효화하고 인증 상태 변경 즉시 반영
 *
 * @dependencies
 * - next/server
 * - next/cache
 * - @supabase/supabase-js
 * - @/utils/supabase/server (createServerSupabaseClient 함수)
 */

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // 응답 객체 생성 - 쿠키를 설정할 수 있도록 만듦
  const redirectUrl = new URL(next, request.url);

  // Supabase 클라이언트 생성
  const supabase = await createServerSupabaseClient();

  // code가 있으면 OTP 검증 대신 코드를 세션으로 교환
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Code exchange error:", error);
      return NextResponse.redirect(new URL("/auth/error", request.url));
    }

    // 전체 앱 레이아웃 캐시 무효화하여 인증 상태 변경 즉시 반영
    // 이를 통해 AuthProvider의 onAuthStateChange 이벤트 발생 전에도 UI가 인증 상태를 인식함
    revalidatePath("/", "layout");

    // 사용자를 지정된 리다이렉트 URL로 이동
    return NextResponse.redirect(redirectUrl);
  }

  // token_hash와 type으로 OTP 검증하는 경우
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // 전체 앱 레이아웃 캐시 무효화
      revalidatePath("/", "layout");

      return NextResponse.redirect(redirectUrl);
    }
  }

  // 에러 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/auth/error", request.url));
}
