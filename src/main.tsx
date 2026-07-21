import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./auth/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";
// React Query(QueryClientProvider)는 인증 화면에서만 필요 → MainLayout(지연 로드)로 이동.
// 로그인/온보딩/콜백 초기 번들에서 @tanstack/react-query 제외(미사용 JS 감축).

// Pretendard 자체 호스팅 — 동적 import로 Vite가 woff2를 same-origin 번들(해시·장기 캐시)로 묶는다.
// jsdelivr 제거 → 크리티컬 패스 단축·CSP 서드파티/소스맵 이슈 소멸·preconnect 불필요.
// 동적 import라 렌더 비차단(폴백 폰트로 즉시 페인트) + 패키지 CSS에 font-display:swap 내장.
void import("pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css");

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
