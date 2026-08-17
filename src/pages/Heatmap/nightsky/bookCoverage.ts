// 필사 기록 → 권별/카테고리별 진행도로 접는 순수 함수들 (전체 밤하늘 "말씀의 은하" 입력).
//
// 백엔드 GET /writing-sessions는 통과(passed=true)한 세션만 최신순으로 주므로,
// 그 범위들을 절 단위로 펼쳐 중복을 제거하면 곧 "내가 필사한 절"이 된다
// (백엔드 progress-calculator.ts가 진척률을 내는 방식과 같다).

import type { WritingRecord } from "../../../api/writingSessions";
import { BOOK_GENRES, booksOfGenre, type GenreCode } from "../../../data/bookGenres";
import { BOOK_VERSE_COUNTS, verseCountOf } from "../../../data/bookVerseCounts";

/** 한 세션이 한 번에 담을 수 있는 절 수의 안전 상한 — 이상 데이터가 집계를 폭주시키지 않게. */
const MAX_VERSES_PER_RECORD = 200;

/**
 * 권별 필사 절 수(고유 절 기준). 반환 배열 index 0 = 창세기(bookNo 1), 길이 66.
 * 같은 절을 여러 번 필사해도 한 번만 센다.
 */
export function coveredVersesByBook(records: WritingRecord[]): number[] {
  const seen = new Map<number, Set<string>>();

  for (const record of records) {
    const { bookNo, chapter, startVerseNo, endVerseNo } = record;
    if (bookNo < 1 || bookNo > BOOK_VERSE_COUNTS.length) continue;
    if (chapter < 1 || endVerseNo < startVerseNo) continue;

    let verses = seen.get(bookNo);
    if (!verses) {
      verses = new Set<string>();
      seen.set(bookNo, verses);
    }

    const end = Math.min(endVerseNo, startVerseNo + MAX_VERSES_PER_RECORD - 1);
    for (let verseNo = startVerseNo; verseNo <= end; verseNo++) {
      verses.add(`${chapter}:${verseNo}`);
    }
  }

  return BOOK_VERSE_COUNTS.map((total, i) => Math.min(total, seen.get(i + 1)?.size ?? 0));
}

/**
 * 권별 채움 비율(0~1). index 0 = 창세기.
 * 분모는 정적 절 수 표라 번역본에 따라 몇 절 어긋날 수 있어 1로 클램프한다.
 */
export function bookFractions(coveredByBook: number[]): number[] {
  return BOOK_VERSE_COUNTS.map((total, i) => {
    const covered = coveredByBook[i] ?? 0;
    return total > 0 ? Math.min(1, covered / total) : 0;
  });
}

export interface GenreProgress {
  code: GenreCode;
  /** 이 카테고리에서 필사한 절 수. */
  covered: number;
  /** 이 카테고리 전체 절 수. */
  total: number;
  /** covered / total (0~1). */
  fraction: number;
}

/** 카테고리(경전 타입)별 진행도 — 범례에 "율법서 12%"로 뜨는 값. */
export function genreProgress(coveredByBook: number[]): GenreProgress[] {
  return BOOK_GENRES.map((genre) => {
    let covered = 0;
    let total = 0;

    for (const bookNo of booksOfGenre(genre)) {
      covered += coveredByBook[bookNo - 1] ?? 0;
      total += verseCountOf(bookNo);
    }

    return {
      code: genre.code,
      covered,
      total,
      fraction: total > 0 ? Math.min(1, covered / total) : 0,
    };
  });
}
