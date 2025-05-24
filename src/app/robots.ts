/**
 * @file robots.ts
 * @description 검색 엔진 크롤링 제어 파일
 *
 * 이 파일은 검색 엔진 크롤러에게 웹사이트의 크롤링 규칙을 알려주는
 * robots.txt 파일을 생성합니다.
 *
 * 주요 기능:
 * 1. 크롤러의 접근 허용/차단 경로 설정
 * 2. 모든 검색 엔진에 대한 크롤링 규칙 정의
 * 3. sitemap.xml 위치 명시
 *
 * 구현 로직:
 * - Next.js의 MetadataRoute.Robots 타입을 사용하여 robots.txt 정의
 * - 모든 사용자 에이전트(*)에 대한 규칙 적용
 * - 루트 경로(/)에 대한 접근 허용
 * - API 및 인증 관련 경로(/api/, /auth/)에 대한 접근 제한
 * - siteConfig에서 정의된 URL과 함께 sitemap.xml 경로 제공
 *
 * @dependencies
 * - next
 * - @/utils/seo/constants
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/utils/seo/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
