import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * 로그인한 유저만 통과시키는 라우트 가드.
 * 초기 세션 조회 중에는 판단을 미루고, 미로그인이면 /login으로 보낸다.
 */
function ProtectedRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="auth-loading">로딩 중…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
