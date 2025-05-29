/**
 * @file page.tsx
 * @description 관리자 전용 페이지
 *
 * 주요 기능:
 * 1. 관리자 권한 확인
 * 2. 파일 업로드 (드래그앤드롭)
 * 3. 업로드된 파일 목록 표시
 * 4. 파일 삭제 기능
 * 5. 파일 미리보기 (이미지)
 *
 * 핵심 구현 로직:
 * - 서버 컴포넌트에서 관리자 권한 검증
 * - 클라이언트 컴포넌트에서 파일 업로드/삭제 인터랙션
 * - Supabase Storage의 파일 목록을 실시간으로 표시
 * - 반응형 그리드 레이아웃으로 파일 카드 표시
 *
 * @dependencies
 * - @/actions/upload: 파일 업로드/삭제/목록 조회 서버 액션
 * - @/components/admin/file-upload: 드래그앤드롭 업로드 컴포넌트
 * - @/components/nav/navbar: 네비게이션 바
 * - @/utils/supabase/server: 서버 컴포넌트용 Supabase 클라이언트
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getFileList } from "@/actions/upload";
import { ProductUploadSection } from "@/components/admin/product-upload-section";
import { FileListClient } from "@/components/admin/file-list-client";
import { AdminMenuCards } from "@/components/admin/admin-menu-cards";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FolderOpen, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

// 관리자 권한 확인 함수
async function checkAdminAccess(): Promise<{
  isAdmin: boolean;
  userName?: string;
}> {
  try {
    console.group("🔐 관리자 페이지 권한 확인");

    const supabase = await createServerSupabaseClient();

    // 현재 사용자 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ 인증되지 않은 사용자");
      console.groupEnd();
      return { isAdmin: false };
    }

    console.log("✅ 사용자 인증 확인:", user.email);

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin, name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("❌ 프로필 조회 실패:", profileError.message);
      console.groupEnd();
      return { isAdmin: false };
    }

    const isAdmin = profile?.is_admin === true;
    console.log("관리자 권한:", isAdmin ? "✅ 있음" : "❌ 없음");
    console.log("사용자 이름:", profile?.name);
    console.groupEnd();

    return {
      isAdmin,
      userName: profile?.name || user.email?.split("@")[0] || "관리자",
    };
  } catch (error) {
    console.error("관리자 권한 확인 중 오류:", error);
    console.groupEnd();
    return { isAdmin: false };
  }
}

// 페이지 헤더 컴포넌트
function AdminPageHeader({ userName }: { userName: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <p className="text-blue-100 mt-1">
                안녕하세요, {userName}님! 파일을 관리해보세요.
              </p>
            </div>
          </div>

          <Link href="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 파일 목록 컨테이너 (서버 컴포넌트)
async function FileListContainer() {
  try {
    console.group("📋 관리자 페이지 파일 목록 로드");

    const result = await getFileList();

    if (!result.success) {
      console.log("❌ 파일 목록 조회 실패:", result.error);
      console.groupEnd();

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            파일 목록을 불러오는 중 오류가 발생했습니다: {result.error}
          </AlertDescription>
        </Alert>
      );
    }

    const files = result.files || [];
    console.log("✅ 파일 목록 조회 성공:", files.length, "개");
    console.groupEnd();

    return <FileListClient initialFiles={files} />;
  } catch (error) {
    console.error("파일 목록 컨테이너 오류:", error);

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          파일 목록을 불러오는 중 예상치 못한 오류가 발생했습니다.
        </AlertDescription>
      </Alert>
    );
  }
}

// 메인 관리자 페이지 컴포넌트
export default async function AdminPage() {
  console.log("👑 관리자 페이지 렌더링 시작");

  // 관리자 권한 확인
  const { isAdmin, userName } = await checkAdminAccess();

  if (!isAdmin) {
    console.log("❌ 관리자 권한 없음 - 홈으로 리다이렉트");
    redirect("/");
  }

  console.log("✅ 관리자 권한 확인 완료");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* 페이지 헤더 */}
      <AdminPageHeader userName={userName || "관리자"} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 관리 메뉴 카드 섹션 */}
          <AdminMenuCards />

          {/* 파일 업로드 섹션 */}
          <ProductUploadSection />

          {/* 파일 목록 섹션 */}
          <section id="file-section" className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <FolderOpen className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                업로드된 파일
              </h2>
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    <span>파일 목록을 불러오는 중...</span>
                  </div>
                </div>
              }
            >
              <FileListContainer />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
}
