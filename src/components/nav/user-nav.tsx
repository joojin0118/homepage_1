/**
 * @file user-nav.tsx
 * @description 사용자 프로필 메뉴 컴포넌트
 *
 * 이 컴포넌트는 사용자 인증 상태에 따라 로그인 버튼 또는
 * 프로필 드롭다운 메뉴를 표시합니다.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/buttons";
import { useAuth } from "@/components/auth/auth-provider";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

export default function UserNav() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Supabase 클라이언트를 메모이제이션
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  // 관리자 권한 확인 함수를 useCallback으로 메모이제이션
  const checkAdminStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      console.log("🔍 프로필 조회 시작:", user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      if (error) {
        console.error("프로필 조회 오류:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setIsAdmin(false);
        return;
      }

      // 프로필이 존재하지 않는 경우 새로 생성
      if (!profile) {
        console.log("프로필이 존재하지 않음. 새 프로필 생성 중...");

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              name: user.user_metadata?.name || null,
              is_admin: false,
            },
          ])
          .select("is_admin")
          .single();

        if (insertError) {
          console.error("프로필 생성 오류:", {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          });
          setIsAdmin(false);
          return;
        }

        console.log("새 프로필 생성 완료:", newProfile);
        setIsAdmin(newProfile?.is_admin || false);
      } else {
        console.log("프로필 조회 완료:", profile);
        setIsAdmin(profile?.is_admin || false);
      }
    } catch (error) {
      console.error("관리자 권한 확인 중 예외:", {
        error: error instanceof Error ? error.message : JSON.stringify(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setIsAdmin(false);
    }
  }, [user, supabase]); // user 전체를 의존성으로 추가

  // 관리자 권한 확인
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            로그인
          </Button>
        </Link>
        <Link href="/login?mode=signup">
          <Button size="sm">회원가입</Button>
        </Link>
      </div>
    );
  }

  // 사용자 이메일에서 첫 번째 문자 추출
  const userInitials = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" alt={user.email || "사용자"} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">내 계정</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0 focus:bg-transparent">
            <Button
              variant="ghost"
              className="px-2 py-1.5 w-full justify-start h-8 font-normal"
              asChild
            >
              <Link href="/orders">주문 내역</Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 focus:bg-transparent">
            <Button
              variant="ghost"
              className="px-2 py-1.5 w-full justify-start h-8 font-normal"
              asChild
            >
              <Link href="/profile">프로필</Link>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* 관리자 메뉴 */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0 focus:bg-transparent">
                <Button
                  variant="ghost"
                  className="px-2 py-1.5 w-full justify-start h-8 font-normal text-blue-600"
                  asChild
                >
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    관리자 대시보드
                  </Link>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <LogoutButton className="px-2 py-1.5 w-full justify-start h-8 font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
