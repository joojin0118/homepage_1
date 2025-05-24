/**
 * @file constants.ts
 * @description SEO 관련 상수 및 설정 파일
 *
 * 이 파일은 애플리케이션 전체에서 사용되는 SEO 관련 상수와 유틸리티 함수를 정의합니다.
 * 메타데이터, 오픈그래프, 트위터 카드 등에 사용되는 값들을 중앙 집중식으로 관리합니다.
 *
 * 주요 기능:
 * 1. 사이트 기본 정보 (이름, 설명, URL) 정의
 * 2. SEO 관련 메타 데이터 설정 (키워드, 로케일)
 * 3. 소셜 미디어 공유용 설정 (OG 이미지, 트위터 핸들)
 * 4. 경로 유틸리티 함수 제공
 *
 * 구현 로직:
 * - 환경 변수를 통한 사이트 URL 설정 (개발/프로덕션 환경 구분)
 * - 사이트 전반에 사용되는 메타데이터를 객체로 묶어 일관성 유지
 * - 상대 경로를 절대 URL로 변환하는 유틸리티 함수 제공 (getAbsoluteUrl)
 *
 * @dependencies
 * - 없음 (독립적인 상수 파일)
 */

export const siteConfig = {
  name: "Next.js + Supabase 보일러플레이트",
  description:
    "최신 Next.js와 Supabase를 활용한 풀스택 개발을 위한 보일러플레이트",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  locale: "ko_KR",
  keywords: [
    "대모산개발단",
    "demodev",
    "Next.js",
    "Supabase",
    "Boilerplate",
    "보일러플레이트",
  ],
  twitterHandle: "@demodev",
};

export const getAbsoluteUrl = (path: string): string => {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
};
