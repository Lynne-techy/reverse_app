import * as Sentry from "@sentry/react";

/**
 * 에러 추적 초기화. VITE_SENTRY_DSN이 설정된 경우에만 호출한다
 * (main.tsx에서 동적 import → DSN 미설정 시 번들·런타임 영향 0).
 * 필사 원문 등 민감정보 유출을 막기 위해 sendDefaultPii는 끈다.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
