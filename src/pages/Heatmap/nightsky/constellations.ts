// 밤하늘 별자리 config — 경전마다 서로 다른 별자리를 정의한다.
// 파일럿은 요한삼서(bookNo 63)만. 이후 경전을 추가하려면 CONSTELLATIONS에 항목을 더 넣으면 된다.
//
// 진행도 모델: "절(verse) 하나 = 별(star) 하나". 필사한 절이 밝아지고 별무리가 자란다.
// 실제 절 수는 백엔드에서 런타임에 확정하고(useJohn3Progress), 여기 stars는 넉넉히 15개를
// 잡아둔다. verseNo가 실제 절 수를 넘는 앵커는 켜지지 않고 외곽선 장식으로만 남는다.

import { Footprints } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** 별자리의 한 꼭지점(= 한 절). pos는 3D 좌표(약간의 z로 회전 시 깊이감). */
export interface StarNode {
  verseNo: number;
  pos: [number, number, number];
  /** 상대 크기(기본 1). 발가락은 작게, 뒤꿈치·발볼은 크게. */
  size?: number;
}

export interface ConstellationConfig {
  bookNo: number;
  bookName: string;
  /** 경전 상징 아이콘(범례·플레이스홀더용). 요한삼서 = 발자국. */
  symbol: LucideIcon;
  symbolLabel: string;
  chapter: number;
  /** 별자리 뒤에 은은히 떠 있는 대표 문구. */
  phrase: { ref: string; text: string };
  stars: StarNode[];
  /** 별을 잇는 선(verseNo 쌍). 미완성 상태에서도 형태가 읽히도록 상시 은은히 표시. */
  edges: [number, number][];
}

/**
 * 요한삼서 = 발자국 별자리. 오른발 실루엣을 XY 평면에 배치(뒤꿈치=아래, 발가락=위).
 * "진리 안에서 행함"(1:4) 테마와 발자국을 잇는다.
 */
export const JOHN3_CONSTELLATION: ConstellationConfig = {
  bookNo: 64,
  bookName: "요한삼서",
  symbol: Footprints,
  symbolLabel: "발자국",
  chapter: 1,
  phrase: {
    ref: "요한삼서 1:4",
    text: "내가 내 자녀들이 진리 안에서 행한다 함을 듣는 것보다 더 기쁜 일이 없도다",
  },
  stars: [
    // 뒤꿈치
    { verseNo: 1, pos: [0, -3.0, 0.1], size: 1.0 },
    { verseNo: 2, pos: [-0.7, -2.4, -0.1], size: 0.9 },
    { verseNo: 3, pos: [0.7, -2.5, 0.2], size: 0.9 },
    // 아치(중간, 좁아짐)
    { verseNo: 4, pos: [-0.95, -1.4, 0.0], size: 0.85 },
    { verseNo: 5, pos: [0.95, -1.6, -0.1], size: 0.85 },
    // 발볼(위로 넓어짐)
    { verseNo: 6, pos: [-1.05, -0.3, 0.15], size: 0.95 },
    { verseNo: 7, pos: [1.0, -0.5, -0.05], size: 0.95 },
    { verseNo: 8, pos: [-1.2, 0.6, 0.0], size: 1.0 },
    { verseNo: 9, pos: [1.2, 0.5, 0.1], size: 1.0 },
    // 발가락 5개(위, 작게)
    { verseNo: 10, pos: [-1.1, 1.8, 0.2], size: 0.6 },
    { verseNo: 11, pos: [-0.5, 2.05, 0.0], size: 0.55 },
    { verseNo: 12, pos: [0.1, 2.1, -0.1], size: 0.55 },
    { verseNo: 13, pos: [0.7, 1.95, 0.1], size: 0.55 },
    { verseNo: 14, pos: [1.2, 1.7, 0.0], size: 0.6 },
    // 발바닥 중앙 액센트(있으면 켜지고, 절 수가 14면 장식으로만 남음)
    { verseNo: 15, pos: [0, 0.35, -0.15], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [2, 4],
    [4, 6],
    [6, 8],
    [8, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 14],
    [14, 9],
    [9, 7],
    [7, 5],
    [5, 3],
    [3, 1],
    [8, 15],
    [9, 15],
  ],
};

/** bookNo → 별자리 config. 파일럿은 요한삼서(64)만. */
export const CONSTELLATIONS: Record<number, ConstellationConfig> = {
  64: JOHN3_CONSTELLATION,
};

/** 해당 경전의 별자리 config. 없으면 null(밤하늘 "준비 중"). */
export function getConstellation(bookNo: number): ConstellationConfig | null {
  return CONSTELLATIONS[bookNo] ?? null;
}
