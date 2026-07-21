import { useQuery } from "@tanstack/react-query";

import {
  getWritingSession,
  isTerminalStatus,
  type WritingSession,
} from "../api/writingSessions";

/** 폴링 간격(ms). 검사는 보통 수 초 내 끝나므로 짧게. */
export const POLL_INTERVAL_MS = 1500;

/**
 * 필사 세션의 유사도 검사 상태를 폴링한다.
 * complete 직후 processing → 이 훅이 GET /writing-sessions/:id 를 POLL_INTERVAL_MS 간격으로
 * 재요청하고, completed/failed(terminal)가 되면 refetchInterval이 false를 반환해 자동으로 멈춘다.
 *
 * SSE 대신 폴링을 쓰는 이유: 1회성 상태 전이(짧은 대기) + 기존 엔드포인트·Bearer 인증 재사용,
 * nginx/Cloudflare 롱-리브드 연결·EventSource 헤더 제약을 피함(인프라 변경 0).
 *
 * @param sessionId 폴링할 세션 id. null이면 비활성(요청 안 함).
 */
export function useWritingSessionStatus(sessionId: string | null) {
  return useQuery<WritingSession>({
    queryKey: ["writingSession", sessionId],
    queryFn: ({ signal }) => getWritingSession(sessionId as string, signal),
    enabled: Boolean(sessionId),
    staleTime: 0, // 폴링 중엔 항상 최신 확인
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isTerminalStatus(status) ? false : POLL_INTERVAL_MS;
    },
  });
}
