/**
 * @file page.tsx
 * @description 인증 오류 페이지 컴포넌트
 *
 * 이 파일은 인증 과정에서 발생하는 오류를 사용자에게 알리는 페이지를 정의합니다.
 * 주로 이메일 링크 인증 실패나 만료 등 인증 과정의 예외 상황을 처리합니다.
 *
 * 주요 기능:
 * 1. 인증 오류 메시지 표시
 * 2. 로그인 페이지 및 홈페이지로 이동 링크 제공
 * 3. 사용자 친화적인 오류 화면 제공
 *
 * 구현 로직:
 * - 정적 페이지로 구현 (별도의 서버 데이터 요청 없음)
 * - ShadcnUI의 Card 컴포넌트를 활용한 오류 메시지 표시
 * - 로그인 페이지와 홈페이지로 이동할 수 있는 버튼 제공
 * - 반응형 디자인을 위한 Tailwind CSS 클래스 적용
 *
 * @dependencies
 * - next/link
 * - @/components/ui/button
 * - @/components/ui/card
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">인증 오류</CardTitle>
          <CardDescription className="text-center">
            인증 과정에서 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="mb-4">
              이메일 링크가 만료되었거나 유효하지 않을 수 있습니다.
            </p>
            <p>다시 로그인하거나 회원가입을 시도해주세요.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/login">
            <Button>로그인 페이지로</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">홈으로</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
