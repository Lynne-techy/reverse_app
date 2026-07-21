// 감정 기반 말씀 추천
//
// GET /verses/recommendations?emotion=<code>
//   → 해당 감정에 매칭된 구절을 무작위 6개 반환 (Verse[])
// 응답 아이템은 기존 verses.ts의 Verse 타입과 동일해 재사용한다.

import { apiRequest } from "./client";
import type { Verse } from "./verses";
import type { EmotionCode } from "../data/emotions";

export function getRecommendations(emotion: EmotionCode) {
  const query = new URLSearchParams({ emotion });

  return apiRequest<Verse[]>(`/verses/recommendations?${query.toString()}`);
}
