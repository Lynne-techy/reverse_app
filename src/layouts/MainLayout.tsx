import { Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import { queryClient } from "../lib/queryClient";

// 인증 이후 레이아웃. React Query 컨텍스트를 여기서 제공해 로그인 경로 초기 번들에서
// @tanstack/react-query를 제외한다(MainLayout은 App에서 지연 로드).
function MainLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default MainLayout;
