import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/Login/LoginPage";
import CallbackPage from "./pages/Auth/CallbackPage";
import MainPage from "./pages/MainPage/MainPage";
import PilsaPage from "./pages/Pilsa/PilsaPage";
import HeatmapPage from "./pages/Heatmap/HeatmapPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import RecommendPage from "./pages/Recommend/RecommendPage";
import { heatmapActivity } from "./data/dummy";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
