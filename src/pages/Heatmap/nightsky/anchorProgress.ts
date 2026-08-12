// 앵커-구간 진행도 모델 (순수 계산 — three/react 무관).
//
// 별자리의 앵커 별 N개는 경전 전체(모든 장을 이어붙인 절 시퀀스, 총 T절)를 N등분한
// 연속 구간을 하나씩 대표한다. "절 하나 = 별 하나"가 아니라 "구간 하나 = 별 하나"라서
// 요한삼서(14절)든 시편(2,461절)이든 같은 앵커 수(12~24개)의 동일한 시각 언어를 갖는다.
//
// 계산: 절 하나를 전역 0-based 인덱스 g의 길이 1 구간 [g, g+1)로 보고, 앵커 k(1..N)의
// 담당 범위 [(k-1)·T/N, k·T/N)와 겹치는 길이의 비율을 앵커의 채움 정도(fraction 0~1)로 쓴다.
// 이 연속(overlap) 모델 덕분에:
// - T가 N으로 나누어떨어지지 않아도 경계 절이 이웃 앵커에 비례 배분된다.
// - T < N(앵커보다 절이 적은 초소형 경전)이어도 모든 앵커가 자연히 채워진다.
// - 전 절 필사 시 모든 앵커가 정확히 1이 된다.

export interface AnchorProgress {
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1. */
  fractions: number[];
  /** 필사한 절 수(경전 전체 기준, 범위 밖 기록 제외). */
  coveredCount: number;
  /** 경전 전체 절 수(장별 절 수의 합). */
  totalVerses: number;
}

/**
 * @param anchorCount 별자리 앵커 수 N
 * @param chapterVerseCounts 장별 절 수 (index 0 = 1장)
 * @param coveredByChapter 장 번호 → 필사한 절 번호 집합
 */
export function computeAnchorProgress(
  anchorCount: number,
  chapterVerseCounts: readonly number[],
  coveredByChapter: ReadonlyMap<number, ReadonlySet<number>>,
): AnchorProgress {
  const totalVerses = chapterVerseCounts.reduce((sum, n) => sum + n, 0);
  const fractions: number[] = new Array<number>(anchorCount).fill(0);

  if (anchorCount === 0 || totalVerses === 0) {
    return { fractions, coveredCount: 0, totalVerses };
  }

  const segmentLength = totalVerses / anchorCount;
  let coveredCount = 0;
  let chapterOffset = 0; // 이 장 1절의 전역 0-based 인덱스

  chapterVerseCounts.forEach((count, i) => {
    const covered = coveredByChapter.get(i + 1);
    if (covered) {
      for (const verseNo of covered) {
        if (verseNo < 1 || verseNo > count) continue; // 범위 밖 기록 방어
        coveredCount++;

        // 절 구간 [g, g+1)이 걸치는 앵커들에 겹친 길이만큼 배분.
        const g = chapterOffset + (verseNo - 1);
        const first = Math.floor(g / segmentLength);
        const last = Math.min(anchorCount - 1, Math.floor((g + 1) / segmentLength));
        for (let k = first; k <= last; k++) {
          const lo = Math.max(g, k * segmentLength);
          const hi = Math.min(g + 1, (k + 1) * segmentLength);
          if (hi > lo) fractions[k] += (hi - lo) / segmentLength;
        }
      }
    }
    chapterOffset += count;
  });

  // 부동소수 누적 오차 클램프 — 구간을 다 채웠으면 정확히 1로.
  for (let k = 0; k < anchorCount; k++) {
    if (fractions[k] > 1 - 1e-9) fractions[k] = 1;
  }

  return { fractions, coveredCount, totalVerses };
}

/**
 * (chapter, verseNo)가 속한 앵커 번호(1..N). 경계에 걸친 절은 시작점 기준으로 배정한다.
 * 장·절이 범위를 벗어나거나 절 수를 아직 모르면 null. 감정 "보석 별" 색 배정 등에 쓴다.
 */
export function anchorIndexFor(
  anchorCount: number,
  chapterVerseCounts: readonly number[],
  chapter: number,
  verseNo: number,
): number | null {
  const totalVerses = chapterVerseCounts.reduce((sum, n) => sum + n, 0);
  if (anchorCount === 0 || totalVerses === 0) return null;
  if (chapter < 1 || chapter > chapterVerseCounts.length) return null;
  if (verseNo < 1 || verseNo > chapterVerseCounts[chapter - 1]) return null;

  let chapterOffset = 0;
  for (let c = 0; c < chapter - 1; c++) chapterOffset += chapterVerseCounts[c];

  const g = chapterOffset + (verseNo - 1);
  const segmentLength = totalVerses / anchorCount;
  return Math.min(anchorCount - 1, Math.floor(g / segmentLength)) + 1;
}
