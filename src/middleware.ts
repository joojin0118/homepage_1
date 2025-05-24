/**
 * @file middleware.ts
 * @description Next.js 미들웨어 설정 파일
 *
 * 이 파일은 Next.js 애플리케이션의 라우팅 미들웨어를 정의합니다.
 * 모든 요청에 대해 Supabase 세션을 업데이트하는 미들웨어를 적용합니다.
 *
 * 주요 기능:
 * 1. 모든 요청에 대해 Supabase 세션 업데이트
 * 2. 세션 쿠키 관리
 * 3. 인증 상태 유지
 *
 * 구현 로직:
 * - 모든 요청에 대해 updateSession 함수를 실행
 * - 정적 파일, 이미지 최적화, favicon 등 특정 경로는 미들웨어 처리에서 제외
 *
 * @dependencies
 * - next/server
 * - @/utils/supabase/middleware
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public file paths with file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
