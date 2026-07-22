import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 설정.
 * - 로컬 dev 서버(vite)를 자동 기동해 실제 브라우저로 핵심 플로우를 검증한다.
 * - 최초 1회 브라우저 설치 필요: `npx playwright install chromium`
 * - 실행: `npm run test:e2e`
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
