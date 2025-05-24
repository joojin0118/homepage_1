/**
 * @file use-cart-count.ts
 * @description 장바구니 아이템 수 조회 훅
 *
 * 이 훅은 현재 사용자의 장바구니에 담긴 아이템 수를 실시간으로 조회합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 수 실시간 조회
 * 2. 로딩 상태 관리
 * 3. 에러 상태 처리
 * 4. 자동 새로고침 (30초마다)
 * 5. 인증 상태에 따른 조건부 실행
 * 6. 실시간 업데이트 이벤트 리스너
 *
 * @dependencies
 * - @/actions/cart: 장바구니 조회 서버 액션
 * - @/components/auth/auth-provider: 인증 상태 확인
 * - react: useState, useEffect 훅
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export function useCartCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCartCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { getCartItems } = await import("@/actions/cart");
      const cartSummary = await getCartItems();
      setCount(cartSummary.totalItems);
    } catch (err) {
      console.error("장바구니 수량 조회 실패:", err);
      setError(err instanceof Error ? err.message : "장바구니 조회 중 오류가 발생했습니다.");
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 초기 로드 및 사용자 변경 시 실행
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // 실시간 업데이트 이벤트 리스너
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log("🔄 장바구니 업데이트 이벤트 감지");
      fetchCartCount();
    };

    // 커스텀 이벤트 리스너 등록
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCartCount]);

  // 30초마다 자동 새로고침 (선택적)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchCartCount();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, [user, fetchCartCount]);

  // 수동 새로고침 함수
  const refresh = () => {
    fetchCartCount();
  };

  return {
    count,
    isLoading,
    error,
    refresh,
  };
}

// 다른 컴포넌트에서 장바구니 업데이트를 알릴 때 사용하는 유틸리티 함수
export function triggerCartUpdate() {
  console.log("🔔 장바구니 업데이트 이벤트 발생");
  const event = new CustomEvent('cartUpdated');
  window.dispatchEvent(event);
} 