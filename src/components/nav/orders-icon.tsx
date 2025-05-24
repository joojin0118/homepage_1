/**
 * @file orders-icon.tsx
 * @description 주문 내역 아이콘 컴포넌트
 *
 * 이 컴포넌트는 사용자가 주문 내역 페이지에 쉽게 접근할 수 있도록 네비게이션에 표시되는 주문 내역 아이콘을 제공합니다.
 *
 * 주요 기능:
 * 1. 주문 내역 페이지로의 링크 제공
 * 2. 인증된 사용자에게만 표시
 * 3. 직관적인 주문 아이콘과 툴팁 제공
 * 4. 반응형 디자인 (모바일/데스크탑)
 *
 * @dependencies
 * - lucide-react: Receipt 아이콘
 * - @/components/ui/button: 버튼 컴포넌트
 * - @/components/ui/tooltip: 툴팁 컴포넌트
 * - @/components/auth/auth-provider: 인증 상태 확인
 * - next/link: 페이지 이동
 */

"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/components/auth/auth-provider";

export function OrdersIcon() {
  const { user } = useAuth();

  // 로그인하지 않은 사용자에게는 표시하지 않음
  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders" className="relative">
              <Receipt className="h-5 w-5" />
              <span className="sr-only">주문 내역</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>주문 내역</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
