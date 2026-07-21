import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 키보드/스크린리더 사용자용 본문 바로가기 — 평소 숨김, 포커스 시 노출 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sidebar focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        본문 바로가기
      </a>

      <Sidebar />

      <div id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
