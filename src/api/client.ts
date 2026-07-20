// 토큰을 포함한 공통 백엔드 요청

import { supabase } from "../lib/supabase";

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API 요청에 실패했습니다. (${response.status})`,
    );
  }

  return (await response.json()) as T;
}