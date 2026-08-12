// 경전 단위 밤하늘 진행도 훅 — (bookNo, anchorCount)만 주면 어떤 경전이든 동작한다.
// - 장별 절 수: 백엔드 verses 응답 길이로 런타임 확정(하드코딩 회피 — 장 "수"만 정적 테이블).
// - 필사 이력: writing-sessions 전체 페이징에서 해당 경전 기록만 골라 장→절 집합으로 집계.
// - demo=true면 전 절을 채운 것으로 취급(완성형 미리보기)하고 이력 요청은 생략.
//
// ⚠️ 규모 주의: 장별 절 수를 장마다 1요청으로 세므로, 장이 많은 대형 경전(시편 150장 등)을
//    CONSTELLATIONS에 추가하기 전에는 백엔드 집계 엔드포인트(예: 장별 절 수 + 장별 필사 절 수
//    한 번에 응답)로 교체해야 한다. 현재 등록된 요한삼서(1장)는 기존과 동일하게 요청 1개.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getVersesInRange } from "../../../api/verses";
import { getWritingRecordsPage } from "../../../api/writingSessions";
import { chapterCount } from "../../../data/bibleChapters";
import { computeAnchorProgress } from "./anchorProgress";

const PAGE_SIZE = 50;
const MAX_VERSES_PER_CHAPTER = 200; // 개역개정 최다 절 = 시편 119편 176절 → 여유 있게 200

/** 경전의 장별 절 수(index 0 = 1장). 백엔드 verses 응답 길이 기준. */
async function fetchChapterVerseCounts(bookNo: number, signal?: AbortSignal): Promise<number[]> {
  const chapters = chapterCount(bookNo);
  return Promise.all(
    Array.from({ length: chapters }, (_, i) =>
      getVersesInRange(
        { book: bookNo, chapter: i + 1, from: 1, to: MAX_VERSES_PER_CHAPTER },
        signal,
      ).then((verses) => verses.length),
    ),
  );
}

/** 해당 경전에서 사용자가 필사한 절: 장 번호 → 절 번호 집합. */
async function fetchCoveredByChapter(
  bookNo: number,
  signal?: AbortSignal,
): Promise<Map<number, Set<number>>> {
  const covered = new Map<number, Set<number>>();
  let offset = 0;

  // 최신순 페이징. 해당 경전 기록만 골라 start~end 절을 전개한다.
  for (;;) {
    const records = await getWritingRecordsPage(PAGE_SIZE, offset, signal);

    for (const record of records) {
      if (record.bookNo !== bookNo) continue;

      let verses = covered.get(record.chapter);
      if (!verses) {
        verses = new Set<number>();
        covered.set(record.chapter, verses);
      }
      for (let v = record.startVerseNo; v <= record.endVerseNo; v++) {
        verses.add(v);
      }
    }

    if (records.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return covered;
}

export interface BookProgress {
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1. 로딩 전엔 전부 0. */
  anchorFractions: number[];
  /** 필사한 절 수(경전 전체). */
  coveredCount: number;
  /** 경전 전체 절 수(로딩 전 0). */
  totalVerses: number;
  isLoading: boolean;
  isError: boolean;
}

export function useBookProgress(bookNo: number, anchorCount: number, demo: boolean): BookProgress {
  // 장별 절 수는 사실상 불변이라 오래 캐시.
  const countsQuery = useQuery({
    queryKey: ["nightsky", "chapterVerseCounts", bookNo],
    queryFn: ({ signal }) => fetchChapterVerseCounts(bookNo, signal),
    staleTime: 24 * 60 * 60_000,
  });

  // demo일 땐 실제 진행도 요청 자체를 하지 않는다.
  const progressQuery = useQuery({
    queryKey: ["nightsky", "progress", bookNo],
    queryFn: ({ signal }) => fetchCoveredByChapter(bookNo, signal),
    enabled: !demo,
  });

  const chapterVerseCounts = countsQuery.data;
  const coveredData = progressQuery.data;

  const { fractions, coveredCount, totalVerses } = useMemo(() => {
    const counts = chapterVerseCounts ?? [];
    const coveredByChapter = demo
      ? new Map(
          counts.map((count, i) => [
            i + 1,
            new Set(Array.from({ length: count }, (_, v) => v + 1)),
          ]),
        )
      : (coveredData ?? new Map<number, Set<number>>());

    return computeAnchorProgress(anchorCount, counts, coveredByChapter);
  }, [demo, anchorCount, chapterVerseCounts, coveredData]);

  return {
    anchorFractions: fractions,
    coveredCount,
    totalVerses,
    isLoading: countsQuery.isLoading || (!demo && progressQuery.isLoading),
    isError: countsQuery.isError || (!demo && progressQuery.isError),
  };
}
