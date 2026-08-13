// 경전별 대표절 훅 — 유저가 그 권에서 대표절(key_verse)로 지정한 절 중 하나(서버 랜덤).
// 순수 장식 레이어: 실패하거나 지정한 대표절이 없으면(null) 밤하늘을 막지 않고
// 별자리 config의 고정 대표 문구로 폴백한다.

import { useQuery } from "@tanstack/react-query";

import { getBookKeyVerse } from "../../../api/users";
import type { Verse } from "../../../api/verses";

export function useKeyVerse(bookNo: number): Verse | null {
  const query = useQuery({
    queryKey: ["nightsky", "keyVerse", bookNo],
    queryFn: ({ signal }) => getBookKeyVerse(bookNo, signal).catch(() => ({ keyVerse: null })),
    // 세션 내에서는 한 번 뽑힌 절을 유지한다 — 창 포커스마다 문구가 바뀌는 산만함 방지.
    staleTime: Infinity,
  });

  return query.data?.keyVerse ?? null;
}
