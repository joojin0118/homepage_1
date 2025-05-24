/**
 * @file manifest.ts
 * @description 웹 앱 매니페스트 생성 파일
 *
 * 이 파일은 PWA(Progressive Web App)를 위한 manifest.webmanifest 파일을 생성합니다.
 * 앱 이름, 아이콘, 테마 색상 등 PWA에 필요한 메타데이터를 정의합니다.
 *
 * 주요 기능:
 * 1. PWA 기본 정보 (이름, 설명, 시작 URL) 설정
 * 2. 디스플레이 모드 및 테마 색상 정의
 * 3. 다양한 크기의 앱 아이콘 설정
 * 4. maskable 아이콘 속성 설정
 *
 * 구현 로직:
 * - Next.js의 MetadataRoute.Manifest 타입을 사용하여 매니페스트 정의
 * - siteConfig에서 앱 이름 및 설명 재사용
 * - 다양한 크기의 아이콘 정의 (192x192, 256x256, 384x384, 512x512)
 * - 특정 아이콘(192x192, 512x512)에 maskable 속성 적용
 *
 * @dependencies
 * - next
 * - @/utils/seo/constants
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/utils/seo/constants";

/**
 * PWA를 위한 manifest.json 파일
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Next.js 보일러플레이트",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
