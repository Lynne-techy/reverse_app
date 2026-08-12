// 경전 단위 밤하늘 진행도 훅 — (bookNo, anchorCount)만 주면 어떤 경전이든 동작한다.
// 백엔드 집계 GET /writing-sessions/book-progress 한 번으로 장별 절 수 + 통과 필사 범위를
// 받아 앵커-구간 진행도(anchorProgress.ts)를 계산한다. 본문(text)을 싣지 않는 집계라
// 시편(150장 2,461절) 같은 대형 경전도 요청 1회로 가볍게 처리된다.
// - demo=true면 전 절을 채운 것으로 취급(완성형 미리보기).
// - 감정 "보석 별" 태그는 별도 쿼리(GET /verses/emotions) — 장식 레이어라 실패해도 무시.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getVerseEmotions } from "../../../api/verseEmotions";
import { getBookProgress } from "../../../api/writingSessions";
import type { EmotionCode } from "../../../data/emotions";
import { anchorIndexFor, computeAnchorProgress } from "./anchorProgress";

export interface BookProgress {
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1. 로딩 전엔 전부 0. */
  anchorFractions: number[];
  /**
   * 앵커별 "보석 별" 감정색 코드(index 0 = 앵커 1). 감정이 큐레이션된 절이 든 앵커만 값이 있고
   * 나머지는 null. 한 앵커에 여러 태그가 겹치면 절 순서가 빠른 태그가 이긴다.
   */
  anchorEmotions: (EmotionCode | null)[];
  /** 필사한 절 수(경전 전체). */
  coveredCount: number;
  /** 경전 전체 절 수(로딩 전 0). */
  totalVerses: number;
  isLoading: boolean;
  isError: boolean;
}

export function useBookProgress(bookNo: number, anchorCount: number, demo: boolean): BookProgress {
  // 장별 절 수 + 필사 범위를 집계 1회로. demo여도 절 수가 필요하므로 같은 쿼리를 쓴다.
  const progressQuery = useQuery({
    queryKey: ["nightsky", "bookProgress", bookNo],
    queryFn: ({ signal }) => getBookProgress(bookNo, signal),
  });

  // 감정 보석 별은 순수 장식 레이어 — 실패해도 밤하늘 전체를 막지 않도록 빈 배열로 삼킨다
  // (백엔드가 아직 이 엔드포인트를 배포하지 않았을 때도 그냥 무채색으로 동작).
  const emotionsQuery = useQuery({
    queryKey: ["nightsky", "verseEmotions", bookNo],
    queryFn: ({ signal }) => getVerseEmotions(bookNo, signal).catch(() => []),
    staleTime: 24 * 60 * 60_000,
  });

  const progress = progressQuery.data;
  const emotionTags = emotionsQuery.data;

  const { fractions, coveredCount, totalVerses } = useMemo(() => {
    const counts = progress?.chapterVerseCounts ?? [];

    // 병합 범위(or demo의 전체 범위)를 장→절 집합으로 전개한다.
    const coveredByChapter = new Map<number, Set<number>>();
    if (demo) {
      counts.forEach((count, i) => {
        coveredByChapter.set(i + 1, new Set(Array.from({ length: count }, (_, v) => v + 1)));
      });
    } else {
      for (const { chapter, ranges } of progress?.covered ?? []) {
        const verses = new Set<number>();
        for (const [start, end] of ranges) {
          for (let v = start; v <= end; v++) verses.add(v);
        }
        coveredByChapter.set(chapter, verses);
      }
    }

    return computeAnchorProgress(anchorCount, counts, coveredByChapter);
  }, [demo, anchorCount, progress]);

  // 감정 태그 → 앵커 배정. 절 순서가 빠른 태그가 먼저 자리를 잡는다.
  const anchorEmotions = useMemo(() => {
    const result: (EmotionCode | null)[] = new Array<EmotionCode | null>(anchorCount).fill(null);
    const counts = progress?.chapterVerseCounts ?? [];
    if (!emotionTags || counts.length === 0) return result;

    const sorted = [...emotionTags].sort((a, b) => a.chapter - b.chapter || a.verseNo - b.verseNo);
    for (const tag of sorted) {
      const index = anchorIndexFor(anchorCount, counts, tag.chapter, tag.verseNo);
      if (index !== null && result[index - 1] === null) {
        result[index - 1] = tag.emotion;
      }
    }
    return result;
  }, [anchorCount, progress, emotionTags]);

  return {
    anchorFractions: fractions,
    anchorEmotions,
    coveredCount,
    totalVerses,
    isLoading: progressQuery.isLoading,
    isError: progressQuery.isError,
  };
}
