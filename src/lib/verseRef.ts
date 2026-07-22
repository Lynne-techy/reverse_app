import type { Verse } from "../api/verses";

/**
 * 구절 출처(reference) 표기 공통 모듈.
 * bookName/chapter/verseNo는 모두 서버 `verses` 테이블에서 오는 값이다.
 * 화면마다 "11장 28절"(추천) vs "11:28"(오늘의 말씀)로 갈리던 표기를 여기로 통일한다.
 * 포맷 정책을 바꾸려면 이 함수 한 줄만 고치면 전 화면에 반영된다.
 *
 * 기본 정책: "책 N장 N절" (더 읽기 쉬운 한국어 표기). 콜론("책 N:N")이 정책이면 아래 한 줄만 교체.
 * (정책 확정은 디자인/기획 합의 — 지금은 추천 페이지가 쓰던 장/절로 통일.)
 */
export function formatVerseRef(verse: Pick<Verse, "bookName" | "chapter" | "verseNo">): string {
  return `${verse.bookName} ${verse.chapter}장 ${verse.verseNo}절`;
}
