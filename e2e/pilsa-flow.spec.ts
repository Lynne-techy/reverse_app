import { test, expect } from "@playwright/test";

/**
 * 핵심 플로우 E2E: (로그인 세션 시드) → 홈 → 필사 → 저장 성공.
 *
 * Google OAuth는 E2E에서 실제로 통과시킬 수 없으므로, 두 가지를 조합한다:
 *  1) Supabase 세션을 localStorage에 주입해 ProtectedRoute를 통과(프론트는 세션 "존재"만 확인).
 *  2) 백엔드 호출은 page.route로 목킹(서명 검증 없이 프론트 플로우만 검증).
 *
 * ⚠️ 활성화 전 확인 필요(이 환경에서 브라우저 실행 검증 못 함):
 *  - `E2E_SUPABASE_REF`(프로젝트 ref) 설정 — 세션 저장 키 `sb-<ref>-auth-token` 계산용.
 *  - @supabase/supabase-js v2 저장 포맷(세션 객체 직렬화)이 아래와 맞는지.
 *  - PilsaPage 단계 게이팅(사진 업로드 단계에서 '다음' 조건) — 필요 시 setInputFiles 추가.
 * 그때까지는 skip으로 두어 CI를 깨지 않는다.
 */
const SUPABASE_REF = process.env.E2E_SUPABASE_REF;

test.describe("핵심 플로우: 홈 → 필사 → 저장", () => {
  test.skip(
    !SUPABASE_REF,
    "E2E_SUPABASE_REF 미설정 — 세션 시드 불가. 설정 후 활성화(상단 주석 참고).",
  );

  test.beforeEach(async ({ page }) => {
    // 1) 만료 안 된 가짜 세션 주입 → AuthContext.getSession()이 로그인 상태로 인식.
    await page.addInitScript((ref) => {
      const now = Math.floor(Date.now() / 1000);
      const session = {
        access_token: "e2e-fake-access-token",
        refresh_token: "e2e-fake-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: now + 3600,
        user: {
          id: "e2e-user",
          aud: "authenticated",
          email: "e2e@example.com",
          app_metadata: { provider: "google" },
          user_metadata: {},
        },
      };
      window.localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(session));
    }, SUPABASE_REF);

    // 2) 모든 백엔드 호출 목킹(빈 200) — 프론트 플로우만 검증.
    await page.route("**/api/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      }),
    );
  });

  test("필사 페이지에서 저장하면 성공 피드백이 뜬다", async ({ page }) => {
    await page.goto("/pilsa");
    await expect(page.getByRole("heading", { name: "성경 필사" })).toBeVisible();

    // 마지막 단계까지 진행(필요 시 사진 업로드 단계에서 setInputFiles 추가).
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "다음" }).click();
    }

    await page.getByRole("button", { name: "저장하기" }).click();
    await expect(page.getByText("필사 기록을 저장했어요")).toBeVisible();
  });
});
