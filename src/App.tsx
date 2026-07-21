import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import { heatmapActivity } from "./data/dummy";

// 라우트 코드 스플리팅 — 초기 번들에서 로그인 외 페이지를 분리(지연 로드).
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

export default function App() {
  return (
    <BrowserRouter>
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
              <Route
                path="/heatmap"
                element={<HeatmapPage activity={heatmapActivity} />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/recommend" element={<RecommendPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
