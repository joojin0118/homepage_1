/**
 * @file JsonLd.tsx
 * @description 구조화된 데이터(JSON-LD) 컴포넌트 모음
 *
 * 이 파일은 검색 엔진 최적화(SEO)를 위한 구조화된 데이터(Schema.org)를
 * JSON-LD 형식으로 제공하는 컴포넌트들을 정의합니다.
 *
 * 주요 기능:
 * 1. 웹사이트, 조직, 개인 등 다양한 엔티티 타입 지원
 * 2. 일관된 구조화 데이터 형식 제공
 * 3. SEO 및 리치 스니펫을 위한 메타데이터 주입
 * 4. 재사용 가능한 JSON-LD 컴포넌트 구조
 *
 * 구현 로직:
 * - 범용 JsonLd 컴포넌트를 통한 구조화된 데이터 렌더링
 * - script 태그와 application/ld+json 타입을 활용한 메타데이터 삽입
 * - 웹사이트 정보, 조직 정보, 개인 정보 등 특화된 컴포넌트 제공
 * - siteConfig를 활용한 일관된 메타데이터 관리
 *
 * @dependencies
 * - @/utils/seo/constants
 *
 * @see https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data
 */

import { siteConfig, getAbsoluteUrl } from "@/utils/seo/constants";

type JsonLdProps<T = any> = {
  item: T;
};

export function JsonLd<T>({ item }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      item={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
      }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      item={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "대모산개발단",
        url: siteConfig.url,
        logo: getAbsoluteUrl("/logo.png"),
        sameAs: [
          "https://www.demodev.io/",
          "https://www.youtube.com/@%EB%8C%80%EB%AA%A8%EC%82%B0%EA%B0%9C%EB%B0%9C%EB%8B%A8",
          "https://www.linkedin.com/company/demodevelop",
        ],
      }}
    />
  );
}

export function PersonJsonLd({
  name,
  image,
  url,
}: {
  name: string;
  image: string;
  url: string;
}) {
  return (
    <JsonLd
      item={{
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        image,
        url,
      }}
    />
  );
}
