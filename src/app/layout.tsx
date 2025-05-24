/**
 * @file layout.tsx
 * @description 애플리케이션 루트 레이아웃 컴포넌트
 *
 * 이 파일은 Next.js 애플리케이션의 기본 레이아웃을 정의합니다.
 * 모든 페이지에 공통으로 적용되는 메타데이터, 폰트, SEO 설정 등이 포함됩니다.
 *
 * 주요 기능:
 * 1. 메타데이터 및 SEO 최적화 설정
 * 2. 전역 폰트 (Geist) 적용
 * 3. 오픈그래프 및 트위터 카드 설정
 * 4. 다크/라이트 테마 관리
 * 5. 구조화된 데이터(JSON-LD) 적용
 * 6. 웹 앱 매니페스트 연결
 * 7. 인증 상태 관리 (AuthProvider)
 *
 * 구현 로직:
 * - Next.js 메타데이터 API를 사용한 SEO 최적화
 * - ThemeProvider를 통한 다크 모드 지원
 * - Geist 및 Geist Mono 폰트 통합
 * - 공유 가능한 siteConfig를 통한 일관된 메타데이터 관리
 * - Vercel Analytics 통합
 * - AuthProvider를 통한 인증 상태 전역 관리
 *
 * @dependencies
 * - next/font/google
 * - next
 * - @vercel/analytics/next
 * - @/components/ui/theme-provider
 * - @/components/seo/JsonLd
 * - @/utils/seo/constants
 * - @/components/auth/auth-provider
 */

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/utils/seo/constants";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#171717",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Aiden Ahn" }],
  creator: "Aiden Ahn",
  publisher: "demodev",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-256x256.png", type: "image/png", sizes: "256x256" },
      { url: "/icons/icon-384x384.png", type: "image/png", sizes: "384x384" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        rel: "apple-touch-icon",
      },
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        rel: "apple-touch-icon",
      },
    ],
    other: [
      {
        rel: "manifest",
        url: "/manifest.webmanifest",
      },
    ],
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      "ko-KR": siteConfig.url,
      // "en-US": `${siteConfig.url}/en`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
