/**
 * @file sitemap.ts
 * @description 사이트맵 생성 파일
 *
 * 이 파일은 검색 엔진 최적화(SEO)를 위한 sitemap.xml 파일을 생성합니다.
 * 웹사이트의 모든 중요 URL을 검색 엔진에 알려주는 역할을 합니다.
 *
 * 주요 기능:
 * 1. 정적 페이지 URL 목록 제공
 * 2. 각 URL의 마지막 수정일, 변경 빈도, 우선순위 설정
 * 3. 동적 데이터 URL 처리를 위한 확장 가능한 구조 제공
 *
 * 구현 로직:
 * - Next.js의 MetadataRoute.Sitemap 타입을 사용하여 사이트맵 정의
 * - 비동기 함수로 구현하여 동적 데이터 가져오기 가능
 * - 정적 페이지(홈, 프로필)에 대한 기본 URL 정의
 * - 각 URL에 대한 우선순위 및 변경 빈도 설정
 *
 * @dependencies
 * - next
 * - @/utils/seo/constants
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/utils/seo/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 정적 페이지들
  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/profile`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  return staticPages;
}
