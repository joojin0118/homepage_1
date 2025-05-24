/**
 * @file auth-provider.tsx
 * @description 인증 상태 관리를 위한 컨텍스트 프로바이더
 *
 * 이 컴포넌트는 Supabase 인증 상태를 전역적으로 관리하고 공유하기 위한
 * React 컨텍스트 프로바이더입니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 저장 및 제공
 * 2. 인증 상태 변경 이벤트 구독
 * 3. 로딩 및 오류 상태 관리
 * 4. 인증 상태 수동 갱신 기능 제공
 *
 * 구현 로직:
 * - 클라이언트 컴포넌트로 구현 ('use client' 지시문)
 * - createBrowserSupabaseClient를 통한 Supabase 클라이언트 생성
 * - useEffect를 통한 초기 사용자 정보 로드 및 이벤트 구독
 * - AuthContext를 통한 상태 공유
 * - useAuth 훅을 통한 인증 컨텍스트 접근 편의성 제공
 * - refreshUser 함수를 통한 인증 상태 수동 갱신 기능
 *
 * @dependencies
 * - react
 * - @supabase/supabase-js
 * - @/utils/supabase/client
 * - next/navigation
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const pathname = usePathname();
  const router = useRouter();

  // 인증 상태를 수동으로 갱신하는 함수
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      setUser(data.user);
    } catch (err) {
      console.error("사용자 정보 가져오기 오류:", err);
      setError("사용자 정보를 가져오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // 초기 사용자 정보 로드 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    refreshUser();
     
  }, [refreshUser]); // refreshUser는 useCallback으로 안정화되어 있으므로, 사실상 마운트 시 1회 실행

  // 인증 상태 변경 이벤트 구독 (별도의 useEffect로 분리)
  useEffect(() => {
    // 인증 상태 변경 이벤트 구독
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthProvider] Auth state changed:", event);

        // 인증 이벤트에 따른 처리
        if (
          event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "TOKEN_REFRESHED"
        ) {
          setUser(session?.user ?? null);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          // 로그아웃 시 홈으로 리디렉션 (필요한 경우)
          if (pathname !== "/" && pathname !== "/login") {
            router.push("/");
          }
        }

        setIsLoading(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
     
  }, [supabase, router, pathname]); // pathname은 SIGNED_OUT 시 리디렉션 조건에 사용되므로 포함

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
