import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";
// React Query(QueryClientProvider)는 인증 화면에서만 필요 → MainLayout(지연 로드)로 이동.
// 로그인/온보딩/콜백 초기 번들에서 @tanstack/react-query 제외(미사용 JS 감축).

// Pretendard를 렌더 비차단으로 로드: 초기 페인트는 폴백(system-ui/Noto Sans KR)으로 즉시,
// 폰트가 준비되면 스왑된다(FOUT). CSS @import(렌더 차단)와 서드파티 크리티컬 체인을 제거.
// CSP 'self' 스크립트라 안전하고, style-src/font-src는 이미 jsdelivr 허용.
const pretendardCss = document.createElement("link");
pretendardCss.rel = "stylesheet";
pretendardCss.href =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
document.head.appendChild(pretendardCss);

// Sentry: DSN이 설정된 경우에만 동적 로드 (미설정이면 번들·런타임 영향 0).
if (import.meta.env.VITE_SENTRY_DSN) {
  void import("./lib/sentry").then((m) => m.initSentry());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
