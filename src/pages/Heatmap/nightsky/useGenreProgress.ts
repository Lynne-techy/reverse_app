// 전체 밤하늘(말씀의 은하)의 색 데이터 — 권별·카테고리별 진행도.
//
// 화면 하단에 크게 뜨는 진척 수치는 서버 집계(useTotalProgress)를 그대로 쓰고,
// 이 훅은 "어느 타입의 경전이 얼마나 켜졌는지"만 담당한다.
// 백엔드에 카테고리별 집계 API가 없어 통과한 필사 기록을 받아 프론트에서 접는다
// (GET /writing-sessions는 passed=true만 반환 — bookCoverage.ts 참고).

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAllWritingRecords } from "../../../api/writingSessions";
import { BOOK_VERSE_COUNTS } from "../../../data/bookVerseCounts";
import {
  bookFractions,
  coveredVersesByBook,
  genreProgress,
  type GenreProgress,
} from "./bookCoverage";

const ALL_COVERED = BOOK_VERSE_COUNTS.map((count) => count);
const NONE_COVERED = BOOK_VERSE_COUNTS.map(() => 0);

export interface GenreProgressState {
  /** 권별 채움 비율(0~1). index 0 = 창세기. */
  bookFractions: number[];
  /** 카테고리별 진행도 — 범례 순서(BOOK_GENRES)와 같다. */
  genres: GenreProgress[];
  isLoading: boolean;
  isError: boolean;
}

export function useGenreProgress(demo: boolean): GenreProgressState {
  const query = useQuery({
    queryKey: ["nightsky", "genreProgress"],
    queryFn: ({ signal }) => getAllWritingRecords(signal),
    // 필사 한 건이 은하를 크게 바꾸지 않으므로 자주 다시 받지 않는다.
    staleTime: 5 * 60_000,
  });

  return useMemo(() => {
    // 미리보기는 경전별 뷰와 같은 규칙 — 전 절을 채운 것으로 취급한다.
    const covered = demo
      ? ALL_COVERED
      : query.data
        ? coveredVersesByBook(query.data)
        : NONE_COVERED;

    return {
      bookFractions: bookFractions(covered),
      genres: genreProgress(covered),
      isLoading: query.isLoading,
      isError: query.isError,
    };
  }, [demo, query.data, query.isLoading, query.isError]);
}
