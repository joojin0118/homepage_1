import { createMetadata } from "@/utils/seo/metadata";

/**
 * 로그인 페이지 메타데이터
 * 검색 엔진 노출을 방지하기 위해 noIndex를 true로 설정
 */
export const metadata = createMetadata({
  title: "로그인",
  description: "계정에 로그인하거나 새 계정을 만들 수 있는 페이지입니다.",
  noIndex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
