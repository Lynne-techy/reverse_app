// 밤하늘 별자리 config — 경전마다 서로 다른 별자리를 정의한다.
// 파일럿은 요한삼서(bookNo 63)만. 이후 경전을 추가하려면 CONSTELLATIONS에 항목을 더 넣으면 된다.
//
// 진행도 모델: "절(verse) 하나 = 별(star) 하나". 필사한 절이 밝아지고 별무리가 자란다.
// 실제 절 수는 백엔드에서 런타임에 확정하고(useJohn3Progress), 여기 stars는 넉넉히 15개를
// 잡아둔다. verseNo가 실제 절 수를 넘는 앵커는 켜지지 않고 외곽선 장식으로만 남는다.

import { DoorOpen } from "lucide-react";
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
 * 요한삼서 = 열린 문 별자리. 손님을 맞아들이는 "환대"(1:5~8) 테마.
 * 문틀(직사각 개구부, z=0) + 앞으로 열린 문짝(경첩=왼쪽 기둥, 자유변이 +z로 튀어나옴) + 손잡이.
 * 3D 깊이(z)를 써서 회전 시 문이 열려 있는 게 드러난다.
 */
export const JOHN3_CONSTELLATION: ConstellationConfig = {
  bookNo: 64,
  bookName: "요한삼서",
  symbol: DoorOpen,
  symbolLabel: "열린 문",
  chapter: 1,
  phrase: {
    ref: "요한삼서 1:4",
    text: "내가 내 자녀들이 진리 안에서 행한다 함을 듣는 것보다 더 기쁜 일이 없도다",
  },
  stars: [
    // 문틀(개구부) — z=0 평면의 직사각형
    { verseNo: 1, pos: [-1.0, -2.2, 0], size: 0.9 }, // 좌하 (경첩 아래)
    { verseNo: 2, pos: [-1.0, 0.0, 0], size: 0.7 }, // 좌중 (경첩 중간)
    { verseNo: 3, pos: [-1.0, 2.2, 0], size: 0.9 }, // 좌상 (경첩 위)
    { verseNo: 4, pos: [0.0, 2.35, 0], size: 0.75 }, // 상인방 중앙
    { verseNo: 5, pos: [1.0, 2.2, 0], size: 0.9 }, // 우상
    { verseNo: 6, pos: [1.0, 0.0, 0], size: 0.7 }, // 우중
    { verseNo: 7, pos: [1.0, -2.2, 0], size: 0.9 }, // 우하
    { verseNo: 8, pos: [0.0, -2.3, 0], size: 0.7 }, // 문지방 중앙
    // 열린 문짝 — 왼쪽 기둥에 경첩, 자유변이 앞(+z)으로 열림
    { verseNo: 9, pos: [0.2, 2.0, 1.7], size: 0.75 }, // 문짝 상단 자유변
    { verseNo: 10, pos: [0.35, 0.0, 1.85], size: 0.7 }, // 문짝 중단 자유변
    { verseNo: 11, pos: [0.2, -2.0, 1.7], size: 0.75 }, // 문짝 하단 자유변
    { verseNo: 12, pos: [-0.45, 2.05, 0.9], size: 0.6 }, // 문짝 상단 원근 중간
    { verseNo: 13, pos: [-0.45, -2.05, 0.9], size: 0.6 }, // 문짝 하단 원근 중간
    { verseNo: 14, pos: [0.62, 0.05, 1.8], size: 0.5 }, // 손잡이
  ],
  edges: [
    // 문틀 외곽
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 1],
    // 문짝 윗변(경첩 위 → 자유변 상단)
    [3, 12],
    [12, 9],
    // 문짝 아랫변(경첩 아래 → 자유변 하단)
    [1, 13],
    [13, 11],
    // 문짝 자유변(세로)
    [9, 10],
    [10, 11],
    // 손잡이
    [10, 14],
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
