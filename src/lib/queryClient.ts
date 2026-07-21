import { QueryClient } from "@tanstack/react-query";

/**
 * 서버 상태 캐시. 필사·통계·진척률 등은 자주 바뀌지 않으므로 staleTime을 넉넉히 둬
 * 화면 재진입/재마운트 시 불필요한 재요청을 줄인다. (client.ts의 요청 취소·재시도와 별개 레이어)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1분간 fresh
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
