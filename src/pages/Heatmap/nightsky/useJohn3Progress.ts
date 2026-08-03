// 요한삼서(bookNo 63) 밤하늘 진행도 훅.
// - 실제 필사 이력에서 요한삼서 1장의 "채워진 절" 집합을 구한다.
// - 실제 절 수는 백엔드 verses 응답 길이로 런타임 확정(하드코딩 회피, 실패 시 14로 폴백).
// - demo=true면 진행도와 무관하게 전체 절을 채워진 것으로 취급(완성형 미리보기).

import { useQuery } from "@tanstack/react-query";

import { getVersesInRange } from "../../../api/verses";
import { getWritingRecordsPage } from "../../../api/writingSessions";

const JOHN3_BOOK_NO = 64; // 요한삼서 (개역개정 정경 순서 64번째)
const JOHN3_CHAPTER = 1;
const DEFAULT_VERSE_COUNT = 14; // 개역개정 요한삼서 1장 = 14절 (백엔드 응답이 우선)
const PAGE_SIZE = 50;

/** 요한삼서 1장에서 사용자가 필사한 절 번호 집합. */
async function fetchCoveredVerses(signal?: AbortSignal): Promise<Set<number>> {
  const covered = new Set<number>();
  let offset = 0;

  // 최신순 페이징. 요한삼서 1장 기록만 골라 start~end 절을 전개한다.
  for (;;) {
    const records = await getWritingRecordsPage(PAGE_SIZE, offset, signal);

    for (const record of records) {
      if (record.bookNo === JOHN3_BOOK_NO && record.chapter === JOHN3_CHAPTER) {
        for (let v = record.startVerseNo; v <= record.endVerseNo; v++) {
          covered.add(v);
        }
      }
    }

    if (records.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return covered;
}

/** 요한삼서 1장의 실제 절 수(백엔드 기준). */
async function fetchVerseCount(signal?: AbortSignal): Promise<number> {
  const verses = await getVersesInRange(
    { book: JOHN3_BOOK_NO, chapter: JOHN3_CHAPTER, from: 1, to: 25 },
    signal,
  );
  return verses.length > 0 ? verses.length : DEFAULT_VERSE_COUNT;
}

export interface John3Progress {
  /** 켜져야 할 절 번호 집합(demo면 1..verseCount 전체). */
  coveredVerses: Set<number>;
  /** 실제 절 수. */
  verseCount: number;
  isLoading: boolean;
  isError: boolean;
}

export function useJohn3Progress(demo: boolean): John3Progress {
  // 절 수는 사실상 불변이라 오래 캐시.
  const countQuery = useQuery({
    queryKey: ["nightsky", "john3", "verseCount"],
    queryFn: ({ signal }) => fetchVerseCount(signal),
    staleTime: 24 * 60 * 60_000,
  });

  // demo일 땐 실제 진행도 요청 자체를 하지 않는다.
  const progressQuery = useQuery({
    queryKey: ["nightsky", "john3", "progress"],
    queryFn: ({ signal }) => fetchCoveredVerses(signal),
    enabled: !demo,
  });

  const verseCount = countQuery.data ?? DEFAULT_VERSE_COUNT;

  const coveredVerses = demo
    ? new Set<number>(Array.from({ length: verseCount }, (_, i) => i + 1))
    : (progressQuery.data ?? new Set<number>());

  return {
    coveredVerses,
    verseCount,
    isLoading: countQuery.isLoading || (!demo && progressQuery.isLoading),
    isError: countQuery.isError || (!demo && progressQuery.isError),
  };
}
