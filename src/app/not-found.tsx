/**
 * @file not-found.tsx
 * @description 404 페이지 컴포넌트
 *
 * 이 파일은 존재하지 않는 경로에 접근할 때 표시되는 404 오류 페이지를 정의합니다.
 * Next.js의 not-found 페이지 규칙에 따라 구현되었습니다.
 *
 * 주요 기능:
 * 1. 사용자 친화적인 404 오류 메시지 표시
 * 2. 홈페이지로 돌아가는 링크 제공
 * 3. 검색 엔진 색인 방지 (noIndex 설정)
 * 4. 일관된 디자인 시스템 적용
 *
 * 구현 로직:
 * - Next.js의 정적 페이지로 구현
 * - createMetadata 함수를 사용한 페이지 메타데이터 설정
 * - ShadcnUI의 Card 컴포넌트를 활용한 오류 메시지 표시
 * - 홈페이지로 돌아가는 버튼 제공
 * - 반응형 디자인을 위한 Tailwind CSS 클래스 적용
 *
 * @dependencies
 * - next/link
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/utils/seo/metadata
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createMetadata } from "@/utils/seo/metadata";

/**
 * 404 페이지 메타데이터
 * 검색 엔진에 노출되지 않도록 noIndex를 true로 설정
 */
export const metadata = createMetadata({
  title: "페이지를 찾을 수 없음",
  description: "요청하신 페이지를 찾을 수 없습니다.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-muted/10">
      <Card className="shadow-md max-w-md w-full">
        <CardHeader className="pb-4 sm:pb-6 text-center">
          <CardTitle className="text-4xl sm:text-5xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Link href="/">
            <Button variant="default" className="w-full sm:w-auto">
              홈으로 돌아가기
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
