// 밤하늘 별자리 config — 경전마다 서로 다른 별자리를 정의한다.
//
// 진행도 모델: "앵커 별 하나 = 경전을 N등분한 구간 하나"(anchorProgress.ts 참고).
// 절 수와 무관하게 모든 경전이 12~24개 앵커라는 동일한 시각 언어를 가지므로,
// 요한삼서(14절)든 시편(2,461절)이든 같은 시스템으로 표현된다.
// 필사가 진행되면 해당 구간의 앵커가 채운 비율만큼 밝아지고, 구간을 다 채우면 완전 점등된다.
//
// 새 경전 추가 방법 (진행도 집계·구간 매핑은 useBookProgress가 자동 처리):
// 1) 경전의 상징 형태를 앵커 12~24개로 디자인해 CONSTELLATIONS에 추가.
//    pos는 3D 좌표 — 약간의 z를 줘서 회전 시 깊이감이 드러나게 한다.
// 2) 대표 문구(phrase)와 심볼 아이콘(symbol)을 정한다.
// 3) edges로 앵커를 이어 미완성 상태에서도 형태가 읽히게 한다.

import { DoorOpen, Fish } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** 별자리의 한 꼭지점(= 경전의 한 구간). pos는 3D 좌표(약간의 z로 회전 시 깊이감). */
export interface AnchorNode {
  /** 앵커 번호(1..N, 빈틈없이 연속). 경전 진행 순서와 일치 — 절 번호가 아니다. */
  index: number;
  pos: [number, number, number];
  /** 상대 크기(기본 1). 형태의 골격은 크게, 장식 꼭지점은 작게. */
  size?: number;
}

export interface ConstellationConfig {
  bookNo: number;
  bookName: string;
  /** 경전 상징 아이콘(범례·플레이스홀더용). */
  symbol: LucideIcon;
  symbolLabel: string;
  /** 별자리 뒤에 은은히 떠 있는 대표 문구. */
  phrase: { ref: string; text: string };
  anchors: AnchorNode[];
  /** 앵커를 잇는 선(index 쌍). 미완성 상태에서도 형태가 읽히도록 상시 은은히 표시. */
  edges: [number, number][];
}

/**
 * 요한삼서 = 열린 문 별자리. 손님을 맞아들이는 "환대"(1:5~8) 테마.
 * 문틀(직사각 개구부, z=0) + 앞으로 열린 문짝(경첩=왼쪽 기둥, 자유변이 +z로 튀어나옴) + 손잡이.
 * 3D 깊이(z)를 써서 회전 시 문이 열려 있는 게 드러난다.
 * 앵커 순서는 필사 진행 순서(문틀 → 문짝 → 손잡이)와 일치시킨다.
 */
export const JOHN3_CONSTELLATION: ConstellationConfig = {
  bookNo: 64,
  bookName: "요한삼서",
  symbol: DoorOpen,
  symbolLabel: "열린 문",
  phrase: {
    ref: "요한삼서 1:4",
    text: "내가 내 자녀들이 진리 안에서 행한다 함을 듣는 것보다 더 기쁜 일이 없도다",
  },
  anchors: [
    // 문틀(개구부) — z=0 평면의 직사각형
    { index: 1, pos: [-1.0, -2.2, 0], size: 0.9 }, // 좌하 (경첩 아래)
    { index: 2, pos: [-1.0, 0.0, 0], size: 0.7 }, // 좌중 (경첩 중간)
    { index: 3, pos: [-1.0, 2.2, 0], size: 0.9 }, // 좌상 (경첩 위)
    { index: 4, pos: [0.0, 2.35, 0], size: 0.75 }, // 상인방 중앙
    { index: 5, pos: [1.0, 2.2, 0], size: 0.9 }, // 우상
    { index: 6, pos: [1.0, 0.0, 0], size: 0.7 }, // 우중
    { index: 7, pos: [1.0, -2.2, 0], size: 0.9 }, // 우하
    { index: 8, pos: [0.0, -2.3, 0], size: 0.7 }, // 문지방 중앙
    // 열린 문짝 — 왼쪽 기둥에 경첩, 자유변이 앞(+z)으로 열림
    { index: 9, pos: [0.2, 2.0, 1.7], size: 0.75 }, // 문짝 상단 자유변
    { index: 10, pos: [0.35, 0.0, 1.85], size: 0.7 }, // 문짝 중단 자유변
    { index: 11, pos: [0.2, -2.0, 1.7], size: 0.75 }, // 문짝 하단 자유변
    { index: 12, pos: [-0.45, 2.05, 0.9], size: 0.6 }, // 문짝 상단 원근 중간
    { index: 13, pos: [-0.45, -2.05, 0.9], size: 0.6 }, // 문짝 하단 원근 중간
    { index: 14, pos: [0.62, 0.05, 1.8], size: 0.5 }, // 손잡이
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

/**
 * 요나 = 큰 물고기 별자리. 깊은 바다로 머리부터 뛰어드는 모습(1:17 "여호와께서 이미
 * 큰 물고기를 예비하사 요나를 삼키게 하셨으므로") — 코가 아래, 꼬리지느러미가 위로 펼쳐진다.
 * 다장 경전(4장 48절) 첫 사례: 앵커 14개가 경전 전체를 균등 분할한 구간을 대표한다.
 * 가슴지느러미(+z)와 살짝 뒤로 젖힌 꼬리(-z)로 회전 시 깊이감이 드러난다.
 * 앵커 순서는 필사 진행 순서(코=삼켜짐 → 몸통 → 꼬리 → 반대편 몸통 → 눈·지느러미)와 일치.
 */
export const JONAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 32,
  bookName: "요나",
  symbol: Fish,
  symbolLabel: "큰 물고기",
  phrase: {
    ref: "요나 2:9",
    text: "구원은 여호와께 속하였나이다",
  },
  anchors: [
    // 몸통 외곽 — 코(아래)에서 오른쪽으로 올라가 꼬리로, 왼쪽으로 내려와 닫는 유선형
    { index: 1, pos: [0, -2.3, 0], size: 0.9 }, // 코 (다이빙 머리)
    { index: 2, pos: [0.85, -1.4, 0], size: 0.75 }, // 우하 몸통
    { index: 3, pos: [1.0, -0.25, 0], size: 0.8 }, // 우중 몸통 (가장 불룩한 곳)
    { index: 4, pos: [0.65, 0.85, 0], size: 0.75 }, // 우상 몸통
    { index: 5, pos: [0.3, 1.45, 0.15], size: 0.7 }, // 꼬리 연결부 우
    { index: 6, pos: [1.0, 2.25, -0.35], size: 0.85 }, // 꼬리지느러미 우측 끝 (살짝 뒤로)
    { index: 7, pos: [0, 1.75, -0.15], size: 0.6 }, // 꼬리 갈라짐(노치)
    { index: 8, pos: [-1.0, 2.25, -0.35], size: 0.85 }, // 꼬리지느러미 좌측 끝 (살짝 뒤로)
    { index: 9, pos: [-0.3, 1.45, 0.15], size: 0.7 }, // 꼬리 연결부 좌
    { index: 10, pos: [-0.65, 0.85, 0], size: 0.75 }, // 좌상 몸통
    { index: 11, pos: [-1.0, -0.25, 0], size: 0.8 }, // 좌중 몸통
    { index: 12, pos: [-0.85, -1.4, 0], size: 0.75 }, // 좌하 몸통
    { index: 13, pos: [0.4, -1.55, 0.3], size: 0.55 }, // 눈
    { index: 14, pos: [0.45, -0.55, 0.85], size: 0.6 }, // 가슴지느러미 (+z, 앞으로)
  ],
  edges: [
    // 몸통 외곽 (꼬리 연결부에서 5-9로 가로질러 닫는다)
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 1],
    // 꼬리지느러미 (연결부 → 끝 → 노치 → 끝 → 연결부)
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    // 눈 (코에서)
    [1, 13],
    // 가슴지느러미 (우중 몸통에서 앞으로)
    [3, 14],
  ],
};

/** bookNo → 별자리 config. 준비된 경전: 요나(32), 요한삼서(64). */
export const CONSTELLATIONS: Record<number, ConstellationConfig> = {
  32: JONAH_CONSTELLATION,
  64: JOHN3_CONSTELLATION,
};

/** 해당 경전의 별자리 config. 없으면 null(밤하늘 "준비 중"). */
export function getConstellation(bookNo: number): ConstellationConfig | null {
  return CONSTELLATIONS[bookNo] ?? null;
}
