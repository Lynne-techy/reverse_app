// 전체(66권) 밤하늘의 진척 수치 훅 — GET /users/me/progress 하나로 성경 전체 절 수와
// 필사(통과)한 절 수를 받는다. 화면 하단에 크게 뜨는 "1,108/31,102 · 3.6%"가 이 값이다.
// queryKey를 MainPage와 동일하게 ["progress"]로 두어 캐시를 공유한다.
// - demo=true면 전 절을 채운 것으로 취급(완성형 미리보기).
//
// 은하의 별빛 색·카테고리별 진행도는 useGenreProgress가 따로 맡는다.

import { useQuery } from "@tanstack/react-query";

import { getUserProgress } from "../../../api/users";

export interface TotalProgress {
  /** 필사한 절 수(성경 전체). */
  coveredCount: number;
  /** 성경 전체 절 수(로딩 전 0). */
  totalVerses: number;
  isLoading: boolean;
  isError: boolean;
}

export function useTotalProgress(demo: boolean): TotalProgress {
  const query = useQuery({ queryKey: ["progress"], queryFn: getUserProgress });

  const covered = query.data?.coveredVerses ?? 0;
  const total = query.data?.totalVerses ?? 0;

  return {
    // 미리보기는 경전별 뷰(useBookProgress)와 같은 규칙 — 전 절을 채운 것으로 표기한다.
    coveredCount: demo ? total : covered,
    totalVerses: total,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
