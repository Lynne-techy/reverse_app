import { Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import MobileTabBar from "../components/MobileTabBar";
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

        {/* min-w-0: 플렉스 자식이 콘텐츠 최소폭에 갇히지 않고 줄어들게(사이드바와 분리 방지).
            overflow-x-clip: 페이지가 실수로 뷰포트보다 넓어져도 셸(사이드바+본문)이 가로로
            벌어지지 않게 가둔다. 정말 넓은 위젯(잔디/히트맵)은 각자 overflow-x-auto로 내부 스크롤. */}
        <div
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-x-clip pb-16 md:pb-0"
        >
          <Outlet />
        </div>

        {/* 모바일 전용 하단 탭바(데스크탑은 Sidebar). 콘텐츠는 위 pb-16으로 가림 방지 */}
        <MobileTabBar />
      </div>
    </QueryClientProvider>
  );
}

export default MainLayout;
