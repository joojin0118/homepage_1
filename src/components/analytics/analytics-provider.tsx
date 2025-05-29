/**
 * @file analytics-provider.tsx
 * @description Vercel Analytics를 위한 클라이언트 컴포넌트
 *
 * 이 컴포넌트는 Vercel Analytics의 설정을 클라이언트에서 처리합니다.
 * beforeSend 함수를 클라이언트에서 정의하여 서버-클라이언트 직렬화 문제를 해결합니다.
 *
 * @dependencies
 * - @vercel/analytics/next
 */

"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

export function AnalyticsProvider() {
  return (
    <Analytics
      debug={process.env.NODE_ENV === "development"}
      beforeSend={(event: BeforeSendEvent) => {
        // 민감한 경로나 개인정보가 포함된 URL 필터링
        if (event.url.includes("/admin") && event.url.includes("password")) {
          return null;
        }
        if (event.url.includes("/profile") && event.url.includes("token")) {
          return null;
        }
        // 이메일이나 기타 민감한 정보가 URL에 포함된 경우 필터링
        if (event.url.match(/[\w\.-]+@[\w\.-]+\.\w+/)) {
          return null;
        }
        return event;
      }}
    />
  );
}
