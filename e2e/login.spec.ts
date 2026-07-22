import { test, expect } from "@playwright/test";

/**
 * 인증 게이트 + 로그인 화면 E2E.
 * 백엔드/OAuth 없이도 성립하는 클라이언트 측 플로우 — CI에서 그대로 실행 가능.
 */
test.describe("인증 게이트 & 로그인 화면", () => {
  test("미로그인 상태에서 보호 라우트 접근 시 /login으로 리다이렉트된다", async ({ page }) => {
    await page.goto("/mainpage");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("루트(/)는 /login으로 보낸다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("온보딩 → 건너뛰기 → 구글 로그인 버튼이 노출된다", async ({ page }) => {
    await page.goto("/login");

    // 온보딩 첫 슬라이드
    await expect(page.getByText("성경을 읽지 말고, 쓰세요")).toBeVisible();

    // 건너뛰기 → 로그인 카드
    await page.getByRole("button", { name: "건너뛰기" }).click();
    await expect(page.getByText("환영합니다")).toBeVisible();
    await expect(page.getByRole("button", { name: /Google로 시작하기/ })).toBeVisible();
  });
});
