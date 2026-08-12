import { describe, it, expect } from "vitest";

import { computeAnchorProgress } from "./anchorProgress";

/** 장 번호 → 절 집합 커버리지 헬퍼. */
function coverage(entries: [number, number[]][]): Map<number, Set<number>> {
  return new Map(entries.map(([chapter, verses]) => [chapter, new Set(verses)]));
}

/** 1..n 절을 전부 채운 커버리지. */
function fullCoverage(chapterVerseCounts: number[]): Map<number, Set<number>> {
  return coverage(
    chapterVerseCounts.map((count, i) => [i + 1, Array.from({ length: count }, (_, v) => v + 1)]),
  );
}

describe("computeAnchorProgress", () => {
  it("T=N이면 절 하나가 앵커 하나에 정확히 대응한다 (요한삼서 파일럿 동작 보존)", () => {
    const { fractions, coveredCount, totalVerses } = computeAnchorProgress(
      14,
      [14],
      coverage([[1, [1, 2, 3, 4, 5, 6, 7]]]),
    );

    expect(totalVerses).toBe(14);
    expect(coveredCount).toBe(7);
    expect(fractions.slice(0, 7)).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(fractions.slice(7)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("T가 N으로 나누어떨어지지 않아도 전 절 필사 시 모든 앵커가 정확히 1이 된다", () => {
    const { fractions } = computeAnchorProgress(14, [15], fullCoverage([15]));

    expect(fractions).toHaveLength(14);
    for (const f of fractions) expect(f).toBe(1);
  });

  it("구간의 절반만 채우면 앵커도 절반만 밝아진다", () => {
    // T=28, N=14 → 앵커 하나가 2절 구간. 1절만 채우면 0.5.
    const { fractions } = computeAnchorProgress(14, [28], coverage([[1, [1]]]));

    expect(fractions[0]).toBeCloseTo(0.5, 10);
    expect(fractions.slice(1).every((f) => f === 0)).toBe(true);
  });

  it("여러 장을 이어붙인 전역 인덱스로 앵커를 배정한다", () => {
    // 장별 [2, 3]절, N=5 → 구간 길이 1. 2장 1절 = 전역 3번째 절 → 앵커 3.
    const { fractions, coveredCount } = computeAnchorProgress(5, [2, 3], coverage([[2, [1]]]));

    expect(coveredCount).toBe(1);
    expect(fractions).toEqual([0, 0, 1, 0, 0]);
  });

  it("앵커보다 절이 적은 경전도 모든 앵커가 자연히 채워진다", () => {
    // T=2, N=4 → 절 하나가 앵커 두 개를 완전히 덮는다.
    const partial = computeAnchorProgress(4, [2], coverage([[1, [1]]]));
    expect(partial.fractions).toEqual([1, 1, 0, 0]);

    const full = computeAnchorProgress(4, [2], fullCoverage([2]));
    expect(full.fractions).toEqual([1, 1, 1, 1]);
  });

  it("장의 실제 절 수를 벗어난 기록은 무시한다", () => {
    const { fractions, coveredCount } = computeAnchorProgress(4, [5], coverage([[1, [6, 0]]]));

    expect(coveredCount).toBe(0);
    expect(fractions).toEqual([0, 0, 0, 0]);
  });

  it("절 수를 아직 모르거나(총 0절) 앵커가 없으면 0으로 안전하게 응답한다", () => {
    expect(computeAnchorProgress(14, [], coverage([]))).toEqual({
      fractions: new Array(14).fill(0),
      coveredCount: 0,
      totalVerses: 0,
    });
    expect(computeAnchorProgress(0, [14], coverage([])).fractions).toEqual([]);
  });
});
