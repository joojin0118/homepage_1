import { createMetadata } from "@/utils/seo/metadata";

/**
 * 프로필 페이지 메타데이터
 * 개인 정보를 담고 있는 페이지라 개인화된 설명 제공
 */
export const metadata = createMetadata({
  title: "프로필",
  description: "사용자 프로필 정보를 확인하고 관리할 수 있는 페이지입니다.",
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
