import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
  /** 현재 Supabase 세션 (미로그인 시 null) */
  session: Session | null;
  /** 현재 로그인 유저 (미로그인 시 null) */
  user: User | null;
  /** 백엔드 호출에 쓸 access_token (미로그인 시 null) */
  accessToken: string | null;
  /** 초기 세션 조회가 끝나기 전 true — 이 동안은 라우팅 판단을 미룬다. */
  isLoading: boolean;
  /** 구글 OAuth 로그인 시작 */
  signInWithGoogle: () => Promise<void>;
  /** 로그아웃 */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1) 앱 시작 시 저장된 세션 복원 (새로고침 대응)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // 2) 이후 로그인/로그아웃/토큰갱신/OAuth 콜백을 실시간 반영
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      isLoading,
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            // 로그인 후 돌아올 앱 주소. Supabase 대시보드 Redirect URLs에 등록돼 있어야 함.
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 <AuthProvider> 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
