import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_API_BASE_URL || "http://localhost:3000"; // 포트 6333일지 확인하기

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // 포트를 고정해 Supabase Redirect URLs 등록 주소를 예측 가능하게 유지.
      port: 5173,
      strictPort: true,
      // 브라우저의 /api 요청을 로컬 백엔드로 프록시 → 동일 출처라 CORS 불필요.
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      css: false,
    },
  };
});
