// 전체(66권) 밤하늘 진행도 훅 — GET /users/me/progress 하나로 성경 전체 절 수와
// 필사(통과)한 절 수를 받아 100노드 은하의 점등 fraction을 계산한다.
// queryKey를 MainPage와 동일하게 ["progress"]로 두어 캐시를 공유한다.
// - demo=true면 전 절을 채운 것으로 취급(완성형 미리보기).

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getUserProgress } from "../../../api/users";
import { totalFractions } from "./totalSky";

export interface TotalProgress {
  /** 노드별 채움 정도(0~1). index 0 = 은하 중심. 로딩 전엔 전부 0. */
  anchorFractions: number[];
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

  const anchorFractions = useMemo(
    () => totalFractions(covered, total, demo),
    [covered, total, demo],
  );

  return {
    anchorFractions,
    // 미리보기는 경전별 뷰(useBookProgress)와 같은 규칙 — 전 절을 채운 것으로 표기한다.
    coveredCount: demo ? total : covered,
    totalVerses: total,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
