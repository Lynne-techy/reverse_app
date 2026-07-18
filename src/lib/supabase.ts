import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 개발 편의를 위한 조기 경고 — .env.local에 값이 비어 있으면 로그인이 동작하지 않는다.
  console.error(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env.local을 확인하세요.",
  );
}

// 클라이언트는 anon(공개) 키만 사용합니다. service_role 키(백엔드 전용)를 절대 넣지 마세요.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // OAuth 콜백으로 돌아왔을 때 URL의 토큰을 자동 파싱해 세션에 저장.
    detectSessionInUrl: true,
    // access_token 만료 전 refresh_token으로 자동 갱신.
    autoRefreshToken: true,
    // 새로고침해도 로그인 유지 (localStorage).
    persistSession: true,
  },
});
