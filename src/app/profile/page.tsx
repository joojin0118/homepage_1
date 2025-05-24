/**
 * @file page.tsx
 * @description 사용자 프로필 페이지 컴포넌트
 *
 * 이 파일은 로그인한 사용자의 프로필 정보를 표시하는 페이지를 정의합니다.
 * 인증된 사용자만 접근 가능한 보호된 라우트로 구현되어 있습니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 확인 및 리다이렉트 처리
 * 2. 사용자 이메일 및 계정 정보 표시
 * 3. 사용자 ID 및 계정 업데이트 시간 표시
 * 4. 네비게이션 바 통합
 *
 * 구현 로직:
 * - 서버 컴포넌트로 구현 ('use server' 지시문)
 * - Supabase 클라이언트를 사용하여 현재 사용자 확인
 * - 로그인되지 않은 경우 로그인 페이지로 리다이렉트
 * - 사용자 정보를 카드 형태로 표시
 * - ShadcnUI 컴포넌트를 활용한 UI 구현
 * - 홈 페이지로 돌아가는 버튼 제공
 *
 * @dependencies
 * - next/navigation
 * - @/utils/supabase/server
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/components/nav
 */

"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Navbar } from "@/components/nav";

export default async function Profile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto py-6 px-4 sm:px-6 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">프로필</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl">프로필 정보</CardTitle>
            <CardDescription className="text-sm">
              현재 로그인한 사용자 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                이메일
              </p>
              <p className="text-base sm:text-lg truncate">{user.email}</p>
            </div>
            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                ID
              </p>
              <p className="text-base sm:text-lg truncate">{user.id}</p>
            </div>
            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                최종 업데이트
              </p>
              <p className="text-base sm:text-lg">
                {new Date(user.updated_at || "").toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center sm:text-left">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
