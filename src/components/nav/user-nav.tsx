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
import Link from "next/link";
import { LogoutButton } from "@/components/auth/buttons";
import { useAuth } from "@/components/auth/auth-provider";

export default function UserNav() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link href="/login">
        <Button>로그인</Button>
      </Link>
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
              <Link href="/profile">프로필</Link>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <LogoutButton className="px-2 py-1.5 w-full justify-start h-8 font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
