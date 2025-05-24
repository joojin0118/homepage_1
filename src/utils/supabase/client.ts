/**
 * @file client.ts
 * @description Supabase 클라이언트 초기화 유틸리티
 *
 * 이 파일은 클라이언트 측에서 Supabase 서비스에 접근하기 위한 브라우저 클라이언트를 생성합니다.
 *
 * 주요 기능:
 * 1. 브라우저 환경에서 Supabase 클라이언트 인스턴스 생성
 * 2. 환경 변수를 통한 Supabase URL 및 익명 키 설정
 *
 * 구현 로직:
 * - @supabase/ssr 패키지의 createBrowserClient 함수를 사용하여 클라이언트 생성
 * - 환경 변수에서 Supabase URL과 익명 키를 가져와 클라이언트 구성
 *
 * @dependencies
 * - @supabase/ssr
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";

export const createBrowserSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
