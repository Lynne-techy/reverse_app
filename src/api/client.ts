// 토큰을 포함한 공통 백엔드 요청 (timeout · 외부 취소 결합 · 재시도)

import { supabase } from "../lib/supabase";

const DEFAULT_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiOptions extends RequestInit {
  /** 요청당 타임아웃(ms). 기본 15초. 무한 대기 방지. */
  timeoutMs?: number;
  /**
   * 네트워크/5xx 실패 시 추가 재시도 횟수. 4xx는 재시도 안 함.
   * 미지정 시 멱등(GET/HEAD)만 1회 재시도, 그 외(POST/PUT/DELETE)는 0
   * — 응답 유실 시 재전송으로 인한 중복 제출을 막는다.
   */
  retries?: number;
  /** 화면 이탈 등으로 요청을 취소하기 위한 외부 signal (AbortController). */
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries,
    signal: externalSignal,
    headers,
    ...init
  } = options;

  const method = (init.method ?? "GET").toUpperCase();
  const isIdempotent = method === "GET" || method === "HEAD";
  const maxRetries = retries ?? (isIdempotent ? 1 : 0);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session) throw new ApiError(401, "로그인이 필요합니다.");

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 외부 취소가 이미 발생했으면 즉시 중단.
    if (externalSignal?.aborted) throw new DOMException("Aborted", "AbortError");

    // timeout용 컨트롤러 + 외부 signal 결합 (iOS 15 호환 위해 수동 구성).
    const controller = new AbortController();
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort, { once: true });
    const timer = setTimeout(
      () => controller.abort(new DOMException("Timeout", "TimeoutError")),
      timeoutMs,
    );

    try {
      const response = await fetch(`/api${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          ...headers,
        },
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      const apiError = new ApiError(
        response.status,
        `API 요청에 실패했습니다. (${response.status})`,
      );
      // 4xx는 재시도해도 같은 결과 → 즉시 던짐. 5xx만 재시도 대상.
      if (response.status < 500 || attempt === maxRetries) throw apiError;
      lastError = apiError;
    } catch (err) {
      // 외부 취소(화면 이탈 등)면 재시도하지 않고 전파.
      if (externalSignal?.aborted) throw err;
      // 마지막 시도였으면 전파.
      if (attempt === maxRetries) throw err;
      lastError = err;
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }

    // 지수 백오프 후 재시도.
    await sleep(300 * (attempt + 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new ApiError(0, "API 요청에 실패했습니다.");
}
