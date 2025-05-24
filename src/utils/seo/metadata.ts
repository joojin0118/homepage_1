/**
 * @file metadata.ts
 * @description 메타데이터 생성 유틸리티
 *
 * 이 파일은 Next.js의 메타데이터 API와 함께 사용할 수 있는 일관된 메타데이터를
 * 생성하는 유틸리티 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지별 메타데이터 생성 유틸리티
 * 2. 타이틀, 설명, 오픈그래프, 트위터 카드 설정
 * 3. 검색 엔진 색인 관리 (noIndex 옵션)
 * 4. 사이트 기본 설정과 페이지별 설정 병합
 *
 * 구현 로직:
 * - 페이지별 고유 메타데이터와 siteConfig의 기본값 통합
 * - Next.js Metadata 타입 시스템 활용
 * - 검색 엔진 최적화를 위한 robots 설정
 * - 소셜 미디어 공유 최적화 (OG 이미지, 트위터 카드)
 * - 일관된 메타데이터 형식 제공
 *
 * @dependencies
 * - next (Metadata 타입)
 * - ./constants (사이트 기본 설정)
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */

import { siteConfig } from "./constants";
import type { Metadata } from "next";

export function createMetadata({
  title,
  description,
  noIndex = false,
  ogImage,
}: {
  title?: string;
  description?: string;
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const finalTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const finalDescription = description || siteConfig.description;
  const finalOgImage = ogImage || siteConfig.ogImage;

  return {
    title: title, // 템플릿 사용을 위해 title만 전달 (루트 레이아웃에서 template 설정)
    description: finalDescription,
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      type: "website",
      locale: siteConfig.locale,
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [finalOgImage],
      creator: siteConfig.twitterHandle,
    },
  };
}
