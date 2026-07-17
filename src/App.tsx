import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Login/LoginPage";
import MainPage from "./pages/MainPage/MainPage";
import PilsaPage from "./pages/Pilsa/PilsaPage";
import HeatmapPage from "./pages/Heatmap/HeatmapPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import RecommendPage from "./pages/Recommend/RecommendPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/mainpage" element={<MainPage />} />
          <Route path="/pilsa" element={<PilsaPage />} />
          <Route path="/heatmap" element={<HeatmapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/recommend" element={<RecommendPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
