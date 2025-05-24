/**
 * @file query-client-provider.tsx
 * @description TanStack Query QueryClient Provider 설정
 *
 * 이 컴포넌트는 전역적으로 TanStack Query의 캐싱과 데이터 fetching 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. QueryClient 인스턴스 생성 및 설정
 * 2. 전역 캐싱 옵션 설정
 * 3. 에러 처리 및 재시도 로직
 * 4. Stale 시간 및 캐시 시간 최적화
 * 5. 개발 환경에서 DevTools 제공
 *
 * @dependencies
 * - @tanstack/react-query: 데이터 fetching 및 캐싱
 * - @tanstack/react-query-devtools: 개발 도구
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5분간 데이터를 fresh로 간주
            staleTime: 5 * 60 * 1000,
            // 30분간 캐시 유지
            gcTime: 30 * 60 * 1000,
            // 백그라운드에서 자동 새로고침 활성화
            refetchOnWindowFocus: true,
            // 재시도 설정
            retry: (failureCount, error) => {
              // 네트워크 에러나 서버 에러가 아닌 경우 재시도하지 않음
              if (error instanceof Error && error.message.includes('404')) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            // 뮤테이션 실패 시 1회 재시도
            retry: 1,
            // 뮤테이션 캐시 시간
            gcTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
} 