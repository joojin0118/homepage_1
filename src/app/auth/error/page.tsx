/**
 * @file page.tsx
 * @description 인증 오류 페이지 컴포넌트
 *
 * 이 파일은 인증 과정에서 발생하는 오류를 사용자에게 알리는 페이지를 정의합니다.
 * 주로 이메일 링크 인증 실패나 만료 등 인증 과정의 예외 상황을 처리합니다.
 *
 * 주요 기능:
 * 1. 인증 오류 메시지 표시
 * 2. 브라우저 호환성 관련 해결방안 안내
 * 3. 쿼리 파라미터 기반 구체적 오류 원인 표시
 * 4. 로그인 페이지 및 홈페이지로 이동 링크 제공
 * 5. 사용자 친화적인 오류 화면 제공
 *
 * 구현 로직:
 * - 클라이언트 컴포넌트로 구현하여 쿼리 파라미터 읽기
 * - ShadcnUI의 Card 컴포넌트를 활용한 오류 메시지 표시
 * - 로그인 페이지와 홈페이지로 이동할 수 있는 버튼 제공
 * - 반응형 디자인을 위한 Tailwind CSS 클래스 적용
 *
 * @dependencies
 * - next/link
 * - next/navigation (useSearchParams)
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/components/ui/alert
 * - lucide-react (아이콘)
 */

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Monitor, Mail, RefreshCw, Server } from "lucide-react";

// 오류 타입별 메시지 정의
const getErrorInfo = (reason: string | null) => {
  switch (reason) {
    case "browser_compatibility":
      return {
        title: "브라우저 호환성 문제",
        description: "인증 링크를 다른 브라우저에서 열었습니다.",
        icon: Monitor,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        solutions: [
          "로그인을 요청했던 브라우저에서 이메일 링크를 다시 클릭해주세요.",
          "또는 아래 버튼을 클릭하여 새로 로그인을 시도해주세요.",
        ],
      };
    case "magic_link":
      return {
        title: "매직 링크 오류",
        description: "매직 링크 인증에 실패했습니다.",
        icon: Mail,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        solutions: [
          "이메일 링크가 만료되었을 수 있습니다.",
          "동일한 브라우저에서 링크를 클릭해주세요.",
          "새로운 매직 링크를 요청해주세요.",
        ],
      };
    case "code_exchange":
      return {
        title: "OAuth 인증 오류",
        description: "소셜 로그인 인증에 실패했습니다.",
        icon: RefreshCw,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        solutions: [
          "소셜 로그인을 다시 시도해주세요.",
          "또는 이메일 로그인을 사용해주세요.",
        ],
      };
    case "server_error":
      return {
        title: "서버 오류",
        description: "서버에서 문제가 발생했습니다.",
        icon: Server,
        color: "text-red-600",
        bgColor: "bg-red-100",
        solutions: [
          "잠시 후 다시 시도해주세요.",
          "문제가 지속되면 고객센터에 문의해주세요.",
        ],
      };
    case "missing_params":
      return {
        title: "인증 파라미터 누락",
        description: "필요한 인증 정보가 없습니다.",
        icon: AlertTriangle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        solutions: [
          "이메일 링크를 다시 클릭해주세요.",
          "또는 새로 로그인을 시도해주세요.",
        ],
      };
    default:
      return {
        title: "인증 오류",
        description: "인증 과정에서 문제가 발생했습니다.",
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        solutions: [
          "이메일 링크가 만료되었거나 유효하지 않을 수 있습니다.",
          "다시 로그인하거나 회원가입을 시도해주세요.",
        ],
      };
  }
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const errorInfo = getErrorInfo(reason);
  const ErrorIcon = errorInfo.icon;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-2 ${errorInfo.bgColor} rounded-full`}>
              <ErrorIcon className={`h-8 w-8 ${errorInfo.color}`} />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-center">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 주요 원인 안내 */}
          <Alert>
            <Monitor className="h-4 w-4" />
            <AlertDescription>
              <strong>가장 일반적인 원인:</strong> 인증 링크를 다른 브라우저나
              기기에서 열었습니다.
            </AlertDescription>
          </Alert>

          {/* 해결방법 안내 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">해결 방법:</h3>

            <div className="space-y-3">
              {errorInfo.solutions.map((solution, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-blue-900">{solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 일반적인 해결방법 */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <RefreshCw className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">새로운 인증 요청</p>
                <p className="text-sm text-green-700">
                  아래 버튼을 클릭하여 새로 로그인을 시도해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 기타 원인들 */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>기타 가능한 원인:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>인증 링크가 만료되었습니다 (24시간 유효)</li>
              <li>이미 사용된 인증 링크입니다</li>
              <li>잘못된 인증 링크입니다</li>
              <li>네트워크 연결 문제</li>
            </ul>
          </div>

          {/* 디버깅 정보 (개발 환경에서만) */}
          {process.env.NODE_ENV === "development" && reason && (
            <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p>
                <strong>디버깅 정보:</strong> 오류 코드 - {reason}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full">새로 로그인하기</Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              홈으로 돌아가기
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
