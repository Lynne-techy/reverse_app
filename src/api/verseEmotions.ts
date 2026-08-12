// 경전의 감정 큐레이션 절 조회 (밤하늘 "보석 별" 색용)
//
// GET /verses/emotions?book=<bookNo>
//   → 해당 경전에서 감정이 태깅된 절들의 (chapter, verseNo, emotion). 없으면 빈 배열.
// 감정 코드는 추천 기능과 같은 emotion_tags.code 8종(data/emotions.ts와 1:1).

import { apiRequest } from "./client";
import type { EmotionCode } from "../data/emotions";

export interface VerseEmotionTag {
  chapter: number;
  verseNo: number;
  emotion: EmotionCode;
}

export function getVerseEmotions(book: number, signal?: AbortSignal) {
  const query = new URLSearchParams({ book: String(book) });

  return apiRequest<VerseEmotionTag[]>(`/verses/emotions?${query.toString()}`, { signal });
}
