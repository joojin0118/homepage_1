/**
 * @file admin/users/page.tsx
 * @description 관리자 사용자 관리 페이지
 *
 * 주요 기능:
 * 1. 사용자 목록 조회
 * 2. 사용자 권한 관리 (관리자 권한 부여/제거)
 * 3. 사용자 검색 기능
 * 4. 사용자 정보 표시
 *
 * @dependencies
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 * - @/utils/supabase/server: 서버 Supabase 클라이언트
 */

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Crown, Calendar } from "lucide-react";
import Link from "next/link";

// 사용자 타입 정의 (email 제거)
interface UserProfile {
  id: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
}

// 관리자 권한 확인
async function checkAdminAccess(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    return profile?.is_admin === true;
  } catch (error) {
    console.error("관리자 권한 확인 오류:", error);
    return false;
  }
}

// 사용자 목록 조회 (간소화)
async function getUsers(): Promise<UserProfile[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        name,
        is_admin,
        created_at
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("사용자 목록 조회 오류:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("사용자 목록 조회 중 예외:", error);
    return [];
  }
}

// 권한 배지 컴포넌트
function RoleBadge({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Crown className="h-3 w-3" />
        관리자
      </Badge>
    );
  }
  return <Badge variant="secondary">일반 사용자</Badge>;
}

// 날짜 포맷팅 함수
function formatDate(dateString: string | null): string {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 메인 사용자 관리 페이지
export default async function AdminUsersPage() {
  console.log("👥 사용자 관리 페이지 렌더링 시작");

  // 관리자 권한 확인
  const isAdmin = await checkAdminAccess();

  if (!isAdmin) {
    console.log("❌ 관리자 권한 없음 - 홈으로 리다이렉트");
    redirect("/");
  }

  // 사용자 목록 조회
  const users = await getUsers();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* 헤더 */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드로
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold">사용자 관리</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 사용자 관리 내용 */}
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    전체 사용자
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}명</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    관리자
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter((user) => user.is_admin).length}명
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    일반 사용자
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter((user) => !user.is_admin).length}명
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사용자 테이블 */}
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  사용자가 없습니다
                </h2>
                <p className="text-gray-600">등록된 사용자가 없습니다.</p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>사용자 목록 ({users.length}명)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>사용자 정보</TableHead>
                          <TableHead>권한</TableHead>
                          <TableHead>가입일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.name
                                    ? user.name[0].toUpperCase()
                                    : user.id[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {user.name || "이름 없음"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {user.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge isAdmin={user.is_admin} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {formatDate(user.created_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
