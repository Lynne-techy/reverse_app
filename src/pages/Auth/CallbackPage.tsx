import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

/**
 * 구글 OAuth 로그인 후 돌아오는 주소(/auth/callback).
 * Supabase SDK가 URL의 토큰을 자동 파싱해 세션에 저장하면 AuthContext가 갱신된다.
 * 세션이 잡히면 메인으로, 일정 시간 내 안 잡히면 로그인 화면으로 보낸다.
 */
function CallbackPage() {
  const { session, isLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (session) {
    return <Navigate to="/mainpage" replace />;
  }

  if (!isLoading && timedOut) {
    // 토큰 파싱 실패 등 — 로그인 화면으로 되돌린다.
    return <Navigate to="/login" replace />;
  }

  return <div className="auth-loading">로그인 처리 중…</div>;
}

export default CallbackPage;
