/**
 * @file page.tsx
 * @description 사용자 프로필 페이지 컴포넌트
 *
 * 이 파일은 로그인한 사용자의 프로필 정보를 표시하는 페이지를 정의합니다.
 * 인증된 사용자만 접근 가능한 보호된 라우트로 구현되어 있습니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 확인 및 리다이렉트 처리
 * 2. 사용자 프로필 정보 표시 (이름, 권한, 가입일)
 * 3. 이름 수정 기능
 * 4. 사용자 이메일 및 계정 정보 표시
 * 5. 네비게이션 바 통합
 *
 * 구현 로직:
 * - 서버 컴포넌트에서 프로필 데이터 조회
 * - 클라이언트 컴포넌트에서 이름 수정 인터랙션
 * - 로그인되지 않은 경우 로그인 페이지로 리다이렉트
 * - 프로필이 없는 경우 자동 생성
 * - ShadcnUI 컴포넌트를 활용한 UI 구현
 *
 * @dependencies
 * - next/navigation
 * - @/utils/supabase/server
 * - @/actions/profile
 * - @/components/profile/profile-form
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/components/nav
 */

"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getCurrentProfile } from "@/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { Navbar } from "@/components/nav";
import { Mail, Calendar, Hash, AlertCircle } from "lucide-react";

export default async function Profile() {
  console.log("👤 프로필 페이지 렌더링 시작");

  // 사용자 인증 확인
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log("❌ 인증되지 않은 사용자 - 로그인 페이지로 리다이렉트");
    redirect("/login");
  }

  console.log("✅ 사용자 인증 확인:", user.email);

  // 프로필 데이터 조회
  const { profile, error: profileError } = await getCurrentProfile();

  if (profileError || !profile) {
    console.error("❌ 프로필 조회 실패:", profileError);

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="container mx-auto py-6 px-4 sm:px-6 sm:py-8 flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">프로필</h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              프로필 정보를 불러올 수 없습니다: {profileError}
            </AlertDescription>
          </Alert>

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

  console.log("✅ 프로필 조회 완료:", profile.name);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto py-6 px-4 sm:px-6 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">프로필</h1>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* 프로필 정보 및 수정 폼 */}
          <ProfileForm initialProfile={profile} />

          {/* 계정 정보 (읽기 전용) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl">계정 정보</CardTitle>
              <CardDescription className="text-sm">
                Supabase 계정 정보입니다. (수정 불가)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    이메일
                  </p>
                </div>
                <p className="text-base sm:text-lg truncate">{user.email}</p>
              </div>

              <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    사용자 ID
                  </p>
                </div>
                <p className="text-base sm:text-lg truncate font-mono text-sm">
                  {user.id}
                </p>
              </div>

              <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    계정 최종 업데이트
                  </p>
                </div>
                <p className="text-base sm:text-lg">
                  {new Date(user.updated_at || "").toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
