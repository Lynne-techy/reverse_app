import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import ProtectedRoute from "./auth/ProtectedRoute";

// 라우트 코드 스플리팅 — 초기 번들에서 로그인 외 페이지를 분리(지연 로드).
// MainLayout도 지연 로드 → React Query 컨텍스트가 인증 화면 청크에만 포함(로그인 초기 번들 감축).
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const CallbackPage = lazy(() => import("./pages/Auth/CallbackPage"));
const MainPage = lazy(() => import("./pages/MainPage/MainPage"));
const PilsaPage = lazy(() => import("./pages/Pilsa/PilsaPage"));
const HeatmapPage = lazy(() => import("./pages/Heatmap/HeatmapPage"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const RecommendPage = lazy(() => import("./pages/Recommend/RecommendPage"));

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        color: "#8b95a1",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      불러오는 중…
    </div>
  );
}

// SPA 라우트별 canonical 갱신 — 정적 root canonical이 비-홈 경로에서 오탐되지 않도록
// 현재 경로 URL로 rel=canonical을 맞춘다.
function CanonicalTag() {
  const { pathname } = useLocation();
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = window.location.origin + pathname;
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <CanonicalTag />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          {/* 로그인해야 접근 가능한 화면들 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/mainpage" element={<MainPage />} />
              <Route path="/pilsa" element={<PilsaPage />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/recommend" element={<RecommendPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
