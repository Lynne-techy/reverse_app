// 말씀 관련

import { apiRequest } from "./client";

export interface Verse {
  id: number;
  translationCode: string;
  bookNo: number;
  bookName: string;
  chapter: number;
  verseNo: number;
  text: string;
  createdAt: string;
}

export function getTodayVerse(date: string) {
  const query = new URLSearchParams({ date });

  return apiRequest<Verse>(`/verses/today?${query.toString()}`);
}

export interface VerseRangeQuery {
  /** 성경 책 번호 (1~66) */
  book: number;
  chapter: number;
  /** 시작 절 */
  from: number;
  /** 종료 절 (from 이상) */
  to: number;
}

/**
 * 같은 책·장 안에서 from~to 절을 오름차순으로 조회한다 (Key Verse 후보 목록).
 * GET /verses?book=&chapter=&from=&to=
 * GET이라 apiRequest가 멱등 재시도(1회)를 자동 적용한다.
 */
export function getVersesInRange(
  { book, chapter, from, to }: VerseRangeQuery,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    book: String(book),
    chapter: String(chapter),
    from: String(from),
    to: String(to),
  });

  return apiRequest<Verse[]>(`/verses?${query.toString()}`, { signal });
}
