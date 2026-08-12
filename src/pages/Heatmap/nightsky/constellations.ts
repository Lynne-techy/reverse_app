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

import {
  DoorOpen,
  Fish,
  Footprints,
  Hand,
  Handshake,
  Mountain,
  Scale,
  SunMedium,
  Sunrise,
  Wheat,
} from "lucide-react";
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

/**
 * 룻기 = 보리 이삭 다발 별자리. 이삭줍기(2장)에서 시작해 다발로 거둬들여지는 은혜.
 * 묶음점에서 세 갈래 이삭이 위로 펼쳐지고, 바닥에 떨어진 낟알 두 알(이삭줍기)이 자유 별로 남는다.
 * 가운데 갈래는 +z, 좌우 갈래는 살짝 -z로 젖혀 다발의 부피감을 낸다.
 */
export const RUTH_CONSTELLATION: ConstellationConfig = {
  bookNo: 8,
  bookName: "룻기",
  symbol: Wheat,
  symbolLabel: "보리 이삭",
  phrase: {
    ref: "룻기 1:16",
    text: "어머니의 백성이 나의 백성이 되고 어머니의 하나님이 나의 하나님이 되시리니",
  },
  anchors: [
    { index: 1, pos: [0, -2.2, 0], size: 0.8 }, // 묶음점
    { index: 2, pos: [0, -1.2, 0], size: 0.6 }, // 줄기 중간
    { index: 3, pos: [0, -0.4, 0], size: 0.7 }, // 갈래점
    { index: 4, pos: [-0.6, 0.5, -0.15], size: 0.6 }, // 좌 이삭 줄기
    { index: 5, pos: [-0.9, 1.3, -0.2], size: 0.75 }, // 좌 이삭 알
    { index: 6, pos: [-1.05, 1.9, -0.25], size: 0.55 }, // 좌 이삭 끝
    { index: 7, pos: [0, 0.7, 0.3], size: 0.6 }, // 중앙 이삭 줄기 (+z)
    { index: 8, pos: [0.05, 1.6, 0.4], size: 0.8 }, // 중앙 이삭 알
    { index: 9, pos: [0.1, 2.3, 0.45], size: 0.6 }, // 중앙 이삭 끝
    { index: 10, pos: [0.6, 0.45, -0.1], size: 0.6 }, // 우 이삭 줄기
    { index: 11, pos: [0.95, 1.25, -0.15], size: 0.75 }, // 우 이삭 알
    { index: 12, pos: [1.1, 1.85, -0.2], size: 0.55 }, // 우 이삭 끝
    { index: 13, pos: [-0.35, -1.6, 0.2], size: 0.45 }, // 떨어진 낟알 (이삭줍기)
    { index: 14, pos: [0.4, -1.75, 0.25], size: 0.45 }, // 떨어진 낟알
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [3, 7],
    [7, 8],
    [8, 9],
    [3, 10],
    [10, 11],
    [11, 12],
  ],
};

/**
 * 예레미야애가 = 아침마다 새로운 새벽 별자리. 어두운 지평선 위 여명 호,
 * 그리고 홀로 크게 또렷한 샛별 — 밤(애가)에서 아침(인자와 긍휼)으로의 반전을 그대로 그린다.
 */
export const LAMENTATIONS_CONSTELLATION: ConstellationConfig = {
  bookNo: 25,
  bookName: "예레미야애가",
  symbol: Sunrise,
  symbolLabel: "아침마다 새로운 새벽",
  phrase: {
    ref: "예레미야애가 3:23",
    text: "이것들이 아침마다 새로우니 주의 성실하심이 크시도소이다",
  },
  anchors: [
    // 지평선 (어두운 밤의 끝)
    { index: 1, pos: [-1.15, -1.0, 0], size: 0.6 },
    { index: 2, pos: [-0.6, -1.05, 0], size: 0.5 },
    { index: 3, pos: [0, -1.1, 0], size: 0.6 },
    { index: 4, pos: [0.6, -1.05, 0], size: 0.5 },
    { index: 5, pos: [1.15, -1.0, 0], size: 0.6 },
    // 여명 호
    { index: 6, pos: [-0.7, -0.5, 0.1], size: 0.6 },
    { index: 7, pos: [0, -0.25, 0.15], size: 0.7 },
    { index: 8, pos: [0.7, -0.5, 0.1], size: 0.6 },
    // 샛별 + 광채
    { index: 9, pos: [0, 1.3, 0.3], size: 1.0 }, // 샛별 (크게)
    { index: 10, pos: [-0.4, 1.7, 0.25], size: 0.5 },
    { index: 11, pos: [0.4, 1.7, 0.25], size: 0.5 },
    { index: 12, pos: [0, 2.15, 0.3], size: 0.55 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 8],
    [7, 9],
    [9, 10],
    [9, 11],
    [9, 12],
  ],
};

/**
 * 오바댜 = 시온 산 별자리. 우뚝한 봉우리와 정상의 큰 별, 산 중턱을 감아 오르는 피난 길(+z).
 * 21절 초미니 경전 — 앵커(12개)와 절 수가 비슷한 T≈N 경계 케이스 검증을 겸한다.
 */
export const OBADIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 31,
  bookName: "오바댜",
  symbol: Mountain,
  symbolLabel: "시온 산",
  phrase: {
    ref: "오바댜 1:17",
    text: "오직 시온 산에서 피할 자가 있으리니 그 산이 거룩할 것이요",
  },
  anchors: [
    { index: 1, pos: [-1.1, -2.0, 0], size: 0.8 }, // 좌측 기슭
    { index: 2, pos: [-0.6, -0.9, 0], size: 0.7 }, // 좌사면 하
    { index: 3, pos: [-0.35, 0.2, 0], size: 0.7 }, // 좌사면 중
    { index: 4, pos: [-0.15, 1.2, 0], size: 0.7 }, // 좌사면 상
    { index: 5, pos: [0, 1.9, 0], size: 0.9 }, // 정상
    { index: 6, pos: [0.25, 1.0, 0], size: 0.7 }, // 우사면 상
    { index: 7, pos: [0.55, -0.1, 0], size: 0.7 }, // 우사면 중
    { index: 8, pos: [0.9, -1.1, 0], size: 0.7 }, // 우사면 하
    { index: 9, pos: [1.15, -2.0, 0], size: 0.8 }, // 우측 기슭
    { index: 10, pos: [0.1, -1.6, 0.5], size: 0.55 }, // 피난길 초입 (+z)
    { index: 11, pos: [-0.35, -0.6, 0.7], size: 0.55 }, // 피난길 중턱
    { index: 12, pos: [0, 2.35, 0.2], size: 0.85 }, // 정상 위 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 1],
    [10, 11],
    [11, 4],
    [5, 12],
  ],
};

/**
 * 아모스 = 다림줄 별자리. 위에서 잡은 손과 곧게 내려오는 추 — 완전한 수직선이
 * 옆의 기울어진 벽과 대비된다. 우하단에는 "물 같이 흐르는 정의"의 물결.
 */
export const AMOS_CONSTELLATION: ConstellationConfig = {
  bookNo: 30,
  bookName: "아모스",
  symbol: Scale,
  symbolLabel: "다림줄",
  phrase: {
    ref: "아모스 5:24",
    text: "오직 정의를 물 같이, 공의를 마르지 않는 강 같이 흐르게 할지어다",
  },
  anchors: [
    { index: 1, pos: [-0.15, 2.2, 0.2], size: 0.8 }, // 다림줄을 잡은 손
    { index: 2, pos: [0.15, 2.1, 0.25], size: 0.6 }, // 손가락 끝
    { index: 3, pos: [0, 1.4, 0.1], size: 0.5 }, // 줄
    { index: 4, pos: [0, 0.6, 0.1], size: 0.5 }, // 줄
    { index: 5, pos: [0, -0.2, 0.1], size: 0.5 }, // 줄
    { index: 6, pos: [0, -1.0, 0.1], size: 0.5 }, // 줄
    { index: 7, pos: [0, -1.7, 0.15], size: 0.9 }, // 추
    { index: 8, pos: [0, -2.2, 0.15], size: 0.6 }, // 추 끝
    { index: 9, pos: [-1.1, -2.0, -0.3], size: 0.6 }, // 기울어진 벽 (아래)
    { index: 10, pos: [-0.85, -0.9, -0.35], size: 0.55 }, // 기울어진 벽
    { index: 11, pos: [-0.7, 0.1, -0.4], size: 0.55 }, // 기울어진 벽 (위)
    { index: 12, pos: [0.7, -1.9, 0.2], size: 0.55 }, // 정의의 물결
    { index: 13, pos: [1.05, -1.5, 0.25], size: 0.55 }, // 정의의 물결
  ],
  edges: [
    [1, 2],
    [1, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [9, 10],
    [10, 11],
    [12, 13],
  ],
};

/**
 * 말라기 = 치료하는 광선의 해 별자리. 좌우로 날개를 편 "공의로운 해"(4:2)가
 * 아래로 치료의 광선을 내린다. 창세기(첫 해)와 수미상관 — 구약의 마지막 밤하늘.
 */
export const MALACHI_CONSTELLATION: ConstellationConfig = {
  bookNo: 39,
  bookName: "말라기",
  symbol: SunMedium,
  symbolLabel: "공의로운 해",
  phrase: {
    ref: "말라기 4:2",
    text: "내 이름을 경외하는 너희에게는 공의로운 해가 떠올라서 치료하는 광선을 비추리니",
  },
  anchors: [
    { index: 1, pos: [0, 0.6, 0.2], size: 1.0 }, // 해 중심
    { index: 2, pos: [-0.5, 0.95, 0.1], size: 0.6 }, // 해 테두리 좌
    { index: 3, pos: [0, 1.25, 0.1], size: 0.6 }, // 해 테두리 상
    { index: 4, pos: [0.5, 0.95, 0.1], size: 0.6 }, // 해 테두리 우
    { index: 5, pos: [-0.75, 0.55, 0.15], size: 0.65 }, // 좌 날개 죽지
    { index: 6, pos: [-1.15, 0.75, 0.1], size: 0.6 }, // 좌 날개 끝(위)
    { index: 7, pos: [-1.0, 0.3, 0.2], size: 0.5 }, // 좌 날개 끝(아래)
    { index: 8, pos: [0.75, 0.55, 0.15], size: 0.65 }, // 우 날개 죽지
    { index: 9, pos: [1.15, 0.75, 0.1], size: 0.6 }, // 우 날개 끝(위)
    { index: 10, pos: [1.0, 0.3, 0.2], size: 0.5 }, // 우 날개 끝(아래)
    { index: 11, pos: [-0.5, -0.6, 0.25], size: 0.5 }, // 치료 광선 좌
    { index: 12, pos: [0, -0.9, 0.3], size: 0.55 }, // 치료 광선 중앙
    { index: 13, pos: [0.5, -0.6, 0.25], size: 0.5 }, // 치료 광선 우
    { index: 14, pos: [0, -1.9, 0.15], size: 0.6 }, // 광선이 닿는 땅의 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
    [1, 5],
    [5, 6],
    [5, 7],
    [1, 8],
    [8, 9],
    [8, 10],
    [1, 11],
    [1, 13],
    [1, 12],
    [12, 14],
  ],
};

/**
 * 빌레몬서 = 맞잡은 손 별자리. 좌우에서 마주 뻗은 두 팔이 가운데서 손을 맞잡고(+z),
 * 그 위에 "형제 됨"의 별이 뜬다. 종이 아니라 형제로 다시 만나는 순간. (25절 미니 경전)
 */
export const PHILEMON_CONSTELLATION: ConstellationConfig = {
  bookNo: 57,
  bookName: "빌레몬서",
  symbol: Handshake,
  symbolLabel: "맞잡은 손",
  phrase: {
    ref: "빌레몬서 1:16",
    text: "이후로는 종과 같이 대하지 아니하고 종 이상으로 곧 사랑 받는 형제로 둘 자라",
  },
  anchors: [
    { index: 1, pos: [-1.15, -0.9, 0], size: 0.8 }, // 좌팔 어깨
    { index: 2, pos: [-0.7, -0.55, 0.2], size: 0.7 }, // 좌 팔꿈치
    { index: 3, pos: [-0.3, -0.25, 0.35], size: 0.7 }, // 좌 손목
    { index: 4, pos: [0, -0.1, 0.5], size: 1.0 }, // 맞잡은 손 (+z, 크게)
    { index: 5, pos: [0.3, -0.25, 0.35], size: 0.7 }, // 우 손목
    { index: 6, pos: [0.7, -0.55, 0.2], size: 0.7 }, // 우 팔꿈치
    { index: 7, pos: [1.15, -0.9, 0], size: 0.8 }, // 우팔 어깨
    { index: 8, pos: [0, 1.0, 0.2], size: 0.85 }, // 형제 됨의 별
    { index: 9, pos: [-0.2, 0.35, 0.4], size: 0.5 }, // 빛줄기 좌
    { index: 10, pos: [0.2, 0.35, 0.4], size: 0.5 }, // 빛줄기 우
    { index: 11, pos: [-1.0, -1.7, 0], size: 0.6 }, // 좌 소매
    { index: 12, pos: [1.0, -1.7, 0], size: 0.6 }, // 우 소매
  ],
  edges: [
    [11, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 12],
    [4, 9],
    [9, 8],
    [4, 10],
    [10, 8],
  ],
};

/**
 * 요한이서 = 진리 안에 행하는 발자국 별자리. 좌우 번갈아 위로 이어지는 발자국 다섯 걸음이
 * 길 끝의 별을 향한다. 요한삼서 초기 시안이던 발자국 컨셉의 재활용 — 요이·요삼이 자매 별자리.
 * (13절 초미니 — T≈N 경계 케이스)
 */
export const JOHN2_CONSTELLATION: ConstellationConfig = {
  bookNo: 63,
  bookName: "요한이서",
  symbol: Footprints,
  symbolLabel: "진리의 발자국",
  phrase: {
    ref: "요한이서 1:6",
    text: "사랑은 우리가 그 계명을 따라 행하는 것이요",
  },
  anchors: [
    { index: 1, pos: [-0.45, -2.1, 0], size: 0.7 }, // 첫걸음 뒤꿈치 (좌)
    { index: 2, pos: [-0.35, -1.75, 0.05], size: 0.5 }, // 첫걸음 발끝
    { index: 3, pos: [0.4, -1.3, 0.1], size: 0.7 }, // 둘째 걸음 (우)
    { index: 4, pos: [0.5, -0.95, 0.15], size: 0.5 },
    { index: 5, pos: [-0.4, -0.5, 0.2], size: 0.7 }, // 셋째 걸음 (좌)
    { index: 6, pos: [-0.3, -0.15, 0.25], size: 0.5 },
    { index: 7, pos: [0.35, 0.3, 0.3], size: 0.7 }, // 넷째 걸음 (우)
    { index: 8, pos: [0.45, 0.65, 0.35], size: 0.5 },
    { index: 9, pos: [-0.35, 1.1, 0.4], size: 0.7 }, // 다섯째 걸음 (좌)
    { index: 10, pos: [-0.25, 1.45, 0.45], size: 0.5 },
    { index: 11, pos: [0.05, 2.1, 0.5], size: 0.9 }, // 길 끝의 별
    { index: 12, pos: [0.35, 1.9, 0.5], size: 0.5 }, // 동반 별
  ],
  edges: [
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
    [11, 12],
  ],
};

/**
 * 유다서 = 붙드시는 손 별자리. 아래에서 위로 받쳐 든 큰 손바닥 위에 흠 없이 선 별 하나,
 * 그 별을 두른 영광의 광선. "능히 너희를 보호하사 거침이 없게 하시고"(1:24). (25절 미니 경전)
 */
export const JUDE_CONSTELLATION: ConstellationConfig = {
  bookNo: 65,
  bookName: "유다서",
  symbol: Hand,
  symbolLabel: "붙드시는 손",
  phrase: {
    ref: "유다서 1:24",
    text: "능히 너희를 보호하사 거침이 없게 하시고 그 영광 앞에 흠이 없이 기쁨으로 서게 하실 이",
  },
  anchors: [
    { index: 1, pos: [-0.8, -1.2, 0.2], size: 0.7 }, // 손바닥 호 좌
    { index: 2, pos: [-0.4, -1.45, 0.35], size: 0.7 },
    { index: 3, pos: [0, -1.5, 0.4], size: 0.8 }, // 손바닥 중앙
    { index: 4, pos: [0.4, -1.45, 0.35], size: 0.7 },
    { index: 5, pos: [0.8, -1.2, 0.2], size: 0.7 }, // 손바닥 호 우
    { index: 6, pos: [0, -2.2, 0.2], size: 0.75 }, // 손목
    { index: 7, pos: [0, 0.2, 0.3], size: 1.0 }, // 흠 없이 선 별 (크게)
    { index: 8, pos: [-0.85, 0.9, 0.1], size: 0.55 }, // 영광 광선 좌
    { index: 9, pos: [-0.3, 1.35, 0.15], size: 0.55 },
    { index: 10, pos: [0.3, 1.35, 0.15], size: 0.55 },
    { index: 11, pos: [0.85, 0.9, 0.1], size: 0.55 }, // 영광 광선 우
    { index: 12, pos: [0, -0.55, 0.35], size: 0.6 }, // 받쳐 든 빛 (손→별)
    { index: 13, pos: [0, 1.7, 0.2], size: 0.6 }, // 정점 광선
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [3, 6],
    [3, 12],
    [12, 7],
    [7, 8],
    [7, 9],
    [7, 10],
    [7, 11],
    [7, 13],
  ],
};

/** bookNo → 별자리 config (정경 순서). */
export const CONSTELLATIONS: Record<number, ConstellationConfig> = {
  8: RUTH_CONSTELLATION,
  25: LAMENTATIONS_CONSTELLATION,
  30: AMOS_CONSTELLATION,
  31: OBADIAH_CONSTELLATION,
  32: JONAH_CONSTELLATION,
  39: MALACHI_CONSTELLATION,
  57: PHILEMON_CONSTELLATION,
  63: JOHN2_CONSTELLATION,
  64: JOHN3_CONSTELLATION,
  65: JUDE_CONSTELLATION,
};

/** 해당 경전의 별자리 config. 없으면 null(밤하늘 "준비 중"). */
export function getConstellation(bookNo: number): ConstellationConfig | null {
  return CONSTELLATIONS[bookNo] ?? null;
}
