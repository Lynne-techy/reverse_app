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
  Amphora,
  Anchor,
  Archive,
  Baby,
  Bird,
  BrickWall,
  Castle,
  Cloud,
  CloudRain,
  CloudSun,
  Columns3,
  Cross,
  Crown,
  DoorOpen,
  Droplets,
  Fish,
  Flag,
  Flame,
  FlameKindling,
  Flashlight,
  Flower2,
  Footprints,
  Gem,
  Globe,
  Grape,
  Hammer,
  Hand,
  HandHeart,
  Handshake,
  HardHat,
  Heart,
  HeartHandshake,
  Lamp,
  Landmark,
  Leaf,
  MapPin,
  Megaphone,
  MoonStar,
  Mountain,
  Music,
  Music4,
  Orbit,
  PawPrint,
  Route,
  Sailboat,
  Scale,
  ScrollText,
  Shield,
  Ship,
  Sparkle,
  Sparkles,
  Star,
  Sun,
  SunMedium,
  Sunrise,
  Swords,
  Target,
  TowerControl,
  TreeDeciduous,
  Trophy,
  Unlink,
  Wand,
  Wheat,
  Wind,
  Zap,
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

/**
 * 밤하늘 한 화면의 "이름표" — 캡션·상징·대표 문구.
 * 별자리(경전별)와 은하(전체)가 같은 씬 셸(NightSkyScene)·폴백을 공유하기 위한 공통 부분이다.
 */
export interface SkyMeta {
  bookName: string;
  /** 경전 상징 아이콘(범례·플레이스홀더용). */
  symbol: LucideIcon;
  symbolLabel: string;
  /** 씬 좌상단 캡션 오버라이드 — 없으면 "{symbolLabel} 별자리"로 표기. */
  caption?: string;
  /** 별자리 뒤에 은은히 떠 있는 대표 문구. */
  phrase: { ref: string; text: string };
}

export interface ConstellationConfig extends SkyMeta {
  bookNo: number;
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
    text: "사랑은 이것이니 우리가 그 계명을 따라 행하는 것이요",
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
    text: "능히 너희를 보호하사 거침이 없게 하시고 너희로 그 영광 앞에 흠이 없이 기쁨으로 서게 하실 이",
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

/** 아가 = 골짜기의 백합(2:1). 줄기에서 여섯 꽃잎이 벌어지고 앞 꽃잎은 +z, 뒤 꽃잎은 -z로 겹. */
export const SONG_CONSTELLATION: ConstellationConfig = {
  bookNo: 22,
  bookName: "아가",
  symbol: Flower2,
  symbolLabel: "골짜기의 백합",
  phrase: {
    ref: "아가 8:7",
    text: "많은 물도 이 사랑을 끄지 못하겠고 홍수라도 삼키지 못하나니",
  },
  anchors: [
    { index: 1, pos: [0, -2.3, 0], size: 0.7 }, // 줄기 뿌리
    { index: 2, pos: [0, -1.4, 0], size: 0.55 }, // 줄기
    { index: 3, pos: [0, -0.6, 0], size: 0.65 }, // 꽃받침
    { index: 4, pos: [-0.7, -1.6, -0.15], size: 0.6 }, // 좌 잎
    { index: 5, pos: [0.7, -1.7, -0.15], size: 0.6 }, // 우 잎
    { index: 6, pos: [-0.5, 0.5, 0.35], size: 0.7 }, // 앞 꽃잎 좌 (+z)
    { index: 7, pos: [0.5, 0.5, 0.35], size: 0.7 }, // 앞 꽃잎 우 (+z)
    { index: 8, pos: [-0.95, 0.9, 0], size: 0.65 }, // 옆 꽃잎 좌
    { index: 9, pos: [0.95, 0.9, 0], size: 0.65 }, // 옆 꽃잎 우
    { index: 10, pos: [-0.35, 1.3, -0.25], size: 0.6 }, // 뒤 꽃잎 좌 (-z)
    { index: 11, pos: [0.35, 1.3, -0.25], size: 0.6 }, // 뒤 꽃잎 우 (-z)
    { index: 12, pos: [0, 1.0, 0.15], size: 0.85 }, // 꽃심
    { index: 13, pos: [0, 1.9, 0.2], size: 0.5 }, // 꽃가루 별
    { index: 14, pos: [0.55, 1.7, 0.1], size: 0.45 }, // 꽃가루 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 6],
    [3, 7],
    [3, 8],
    [3, 9],
    [3, 10],
    [3, 11],
    [3, 12],
    [12, 13],
  ],
};

/** 요엘 = 부어지는 영(2:28). 구름 띠에서 빗줄기 세 갈래가 쏟아지고 땅에서 새싹이 돋는다. */
export const JOEL_CONSTELLATION: ConstellationConfig = {
  bookNo: 29,
  bookName: "요엘",
  symbol: CloudRain,
  symbolLabel: "부어지는 영",
  phrase: {
    ref: "요엘 2:28",
    text: "내가 내 영을 만민에게 부어 주리니",
  },
  anchors: [
    { index: 1, pos: [-0.9, 1.8, 0], size: 0.7 }, // 구름
    { index: 2, pos: [-0.3, 2.0, 0.1], size: 0.75 }, // 구름
    { index: 3, pos: [0.35, 1.95, 0], size: 0.75 }, // 구름
    { index: 4, pos: [0.95, 1.75, -0.05], size: 0.7 }, // 구름
    { index: 5, pos: [-0.6, 0.9, 0.05], size: 0.5 }, // 좌 빗줄기
    { index: 6, pos: [-0.5, 0.0, 0.1], size: 0.5 },
    { index: 7, pos: [0, 1.0, 0.25], size: 0.55 }, // 중앙 빗줄기 (+z)
    { index: 8, pos: [0.05, 0.0, 0.3], size: 0.55 },
    { index: 9, pos: [0.6, 0.85, 0.05], size: 0.5 }, // 우 빗줄기
    { index: 10, pos: [0.55, -0.05, 0.1], size: 0.5 },
    { index: 11, pos: [-0.35, -1.5, 0.15], size: 0.6 }, // 새싹
    { index: 12, pos: [0.45, -1.6, 0.15], size: 0.6 }, // 새싹
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 5],
    [5, 6],
    [2, 7],
    [7, 8],
    [4, 9],
    [9, 10],
    [6, 11],
    [10, 12],
  ],
};

/** 미가 = 베들레헴 위의 별(5:2). 작은 마을 지붕들 위에 큰 별이 빛줄기를 내린다. */
export const MICAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 33,
  bookName: "미가",
  symbol: MapPin,
  symbolLabel: "베들레헴 위의 별",
  phrase: {
    ref: "미가 6:8",
    text: "정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐",
  },
  anchors: [
    { index: 1, pos: [-1.1, -1.8, 0], size: 0.6 }, // 마을 처마
    { index: 2, pos: [-0.7, -1.4, 0], size: 0.6 }, // 지붕 꼭지
    { index: 3, pos: [-0.3, -1.8, 0], size: 0.55 },
    { index: 4, pos: [0.15, -1.35, 0], size: 0.6 }, // 지붕 꼭지
    { index: 5, pos: [0.6, -1.8, 0], size: 0.55 },
    { index: 6, pos: [1.05, -1.5, 0], size: 0.6 },
    { index: 7, pos: [0, 1.4, 0.25], size: 1.0 }, // 큰 별
    { index: 8, pos: [-0.5, 1.0, 0.2], size: 0.5 }, // 별 광선
    { index: 9, pos: [0.5, 1.0, 0.2], size: 0.5 },
    { index: 10, pos: [0, 2.0, 0.25], size: 0.55 },
    { index: 11, pos: [0, 0.35, 0.2], size: 0.5 }, // 내려오는 빛줄기
    { index: 12, pos: [0, -0.5, 0.15], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [7, 8],
    [7, 9],
    [7, 10],
    [7, 11],
    [11, 12],
    [12, 4],
  ],
};

/** 나훔 = 환난 날의 산성(1:7). 바위 위 요새 탑과 흉벽, 탑으로 피해 다가오는 작은 별(+z). */
export const NAHUM_CONSTELLATION: ConstellationConfig = {
  bookNo: 34,
  bookName: "나훔",
  symbol: Castle,
  symbolLabel: "환난 날의 산성",
  phrase: {
    ref: "나훔 1:7",
    text: "여호와는 선하시며 환난 날에 산성이시라 그는 자기에게 피하는 자들을 아시느니라",
  },
  anchors: [
    { index: 1, pos: [-0.9, -2.1, 0], size: 0.7 }, // 바위 기반
    { index: 2, pos: [0, -2.3, 0], size: 0.7 },
    { index: 3, pos: [0.9, -2.1, 0], size: 0.7 },
    { index: 4, pos: [-0.55, -1.0, 0], size: 0.65 }, // 탑 하단
    { index: 5, pos: [0.55, -1.0, 0], size: 0.65 },
    { index: 6, pos: [-0.55, 0.6, 0], size: 0.65 }, // 탑 상단
    { index: 7, pos: [0.55, 0.6, 0], size: 0.65 },
    { index: 8, pos: [-0.55, 1.2, 0], size: 0.6 }, // 흉벽(총안)
    { index: 9, pos: [-0.18, 1.05, 0], size: 0.5 },
    { index: 10, pos: [0.18, 1.2, 0], size: 0.6 },
    { index: 11, pos: [0.55, 1.05, 0], size: 0.5 },
    { index: 12, pos: [0, -1.5, 0.4], size: 0.6 }, // 성문 (+z)
    { index: 13, pos: [0.9, 0.2, 0.5], size: 0.7 }, // 피해 오는 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [1, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [6, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 7],
    [4, 12],
    [12, 5],
    [13, 7],
  ],
};

/** 하박국 = 파수대(2:1). 높은 기둥 위 망대에서 먼 곳(+z)의 응답 별을 바라본다. */
export const HABAKKUK_CONSTELLATION: ConstellationConfig = {
  bookNo: 35,
  bookName: "하박국",
  symbol: TowerControl,
  symbolLabel: "파수대",
  phrase: {
    ref: "하박국 3:18",
    text: "나는 여호와로 말미암아 즐거워하며 나의 구원의 하나님으로 말미암아 기뻐하리로다",
  },
  anchors: [
    { index: 1, pos: [0, -2.3, 0], size: 0.7 }, // 기둥 뿌리
    { index: 2, pos: [0, -1.3, 0], size: 0.5 }, // 기둥
    { index: 3, pos: [0, -0.3, 0], size: 0.5 },
    { index: 4, pos: [0, 0.6, 0], size: 0.6 }, // 기둥 꼭대기
    { index: 5, pos: [-0.6, 0.9, 0], size: 0.65 }, // 망대 플랫폼
    { index: 6, pos: [0.6, 0.9, 0], size: 0.65 },
    { index: 7, pos: [-0.45, 1.6, 0], size: 0.6 }, // 망대 지붕
    { index: 8, pos: [0.45, 1.6, 0], size: 0.6 },
    { index: 9, pos: [0, 2.1, 0], size: 0.7 }, // 지붕 꼭대기
    { index: 10, pos: [0.9, 1.9, 0.8], size: 0.8 }, // 먼 곳의 응답 별 (+z)
    { index: 11, pos: [0.45, 1.85, 0.45], size: 0.45 }, // 시선
    { index: 12, pos: [-0.5, -2.1, 0], size: 0.55 }, // 버팀돌
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [4, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 9],
    [9, 11],
    [11, 10],
    [1, 12],
  ],
};

/** 스바냐 = 기쁨의 노래(3:17). 품는 팔의 호 위로 음표 셋이 흩날리며 올라간다. */
export const ZEPHANIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 36,
  bookName: "스바냐",
  symbol: Music4,
  symbolLabel: "기쁨의 노래",
  phrase: {
    ref: "스바냐 3:17",
    text: "너의 하나님 여호와가 너의 가운데에 계시니 그는 구원을 베푸실 전능자이시라",
  },
  anchors: [
    { index: 1, pos: [-1.1, -1.2, 0], size: 0.7 }, // 품는 호 (팔 벌림)
    { index: 2, pos: [-0.6, -1.7, 0.1], size: 0.65 },
    { index: 3, pos: [0, -1.85, 0.15], size: 0.7 },
    { index: 4, pos: [0.6, -1.7, 0.1], size: 0.65 },
    { index: 5, pos: [1.1, -1.2, 0], size: 0.7 },
    { index: 6, pos: [-0.5, -0.3, 0.2], size: 0.7 }, // 음표 1 머리
    { index: 7, pos: [-0.35, 0.35, 0.2], size: 0.45 }, // 음표 1 꼬리
    { index: 8, pos: [0.15, 0.5, 0.3], size: 0.75 }, // 음표 2 머리
    { index: 9, pos: [0.3, 1.15, 0.3], size: 0.45 },
    { index: 10, pos: [0.75, 1.4, 0.2], size: 0.7 }, // 음표 3 머리
    { index: 11, pos: [0.9, 2.0, 0.2], size: 0.45 },
    { index: 12, pos: [0.3, 2.2, 0.25], size: 0.6 }, // 정점 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
    [7, 8],
    [9, 10],
    [11, 12],
  ],
};

/** 학개 = 다시 세우는 성전 골조(2:9). 두 기둥과 보, 미완성 지붕 골조 — 완성돼 가는 과정 자체가 메시지. */
export const HAGGAI_CONSTELLATION: ConstellationConfig = {
  bookNo: 37,
  bookName: "학개",
  symbol: HardHat,
  symbolLabel: "성전 골조",
  phrase: {
    ref: "학개 2:9",
    text: "이 성전의 나중 영광이 이전 영광보다 크리라",
  },
  anchors: [
    { index: 1, pos: [-0.8, -2.0, 0], size: 0.75 }, // 좌 기둥 뿌리
    { index: 2, pos: [-0.8, -0.6, 0], size: 0.6 },
    { index: 3, pos: [-0.8, 0.8, 0], size: 0.7 }, // 좌 기둥 머리
    { index: 4, pos: [0.8, -2.0, 0], size: 0.75 }, // 우 기둥 뿌리
    { index: 5, pos: [0.8, -0.6, 0], size: 0.6 },
    { index: 6, pos: [0.8, 0.8, 0], size: 0.7 }, // 우 기둥 머리
    { index: 7, pos: [0, 0.85, 0.1], size: 0.6 }, // 보(수평재)
    { index: 8, pos: [-0.45, 1.5, 0.1], size: 0.6 }, // 지붕 골조 좌
    { index: 9, pos: [0.45, 1.5, 0.1], size: 0.6 }, // 지붕 골조 우
    { index: 10, pos: [0, 2.05, 0.15], size: 0.8 }, // 마룻대
    { index: 11, pos: [0, -2.15, 0.2], size: 0.65 }, // 기초석
    { index: 12, pos: [0, 1.15, 0.45], size: 0.6 }, // 나중 영광의 별 (+z 안쪽)
  ],
  edges: [
    [1, 2],
    [2, 3],
    [4, 5],
    [5, 6],
    [3, 7],
    [7, 6],
    [3, 8],
    [8, 10],
    [6, 9],
    [9, 10],
    [1, 11],
    [11, 4],
  ],
};

/** 갈라디아서 = 끊어진 사슬(5:1 자유). 위아래 사슬이 가운데서 끊어지고 그 사이로 새가 난다. */
export const GALATIANS_CONSTELLATION: ConstellationConfig = {
  bookNo: 48,
  bookName: "갈라디아서",
  symbol: Unlink,
  symbolLabel: "끊어진 사슬",
  phrase: {
    ref: "갈라디아서 2:20",
    text: "이제는 내가 사는 것이 아니요 오직 내 안에 그리스도께서 사시는 것이라",
  },
  anchors: [
    { index: 1, pos: [0, 2.2, 0], size: 0.6 }, // 위 사슬
    { index: 2, pos: [0, 1.5, 0.05], size: 0.6 },
    { index: 3, pos: [0, 0.8, 0.1], size: 0.7 }, // 끊어진 위 고리
    { index: 4, pos: [-0.35, 0.45, 0.35], size: 0.55 }, // 끊어진 단면 (+z 튐)
    { index: 5, pos: [0, -0.8, 0.1], size: 0.7 }, // 끊어진 아래 고리
    { index: 6, pos: [0, -1.5, 0.05], size: 0.6 },
    { index: 7, pos: [0, -2.2, 0], size: 0.6 }, // 아래 사슬
    { index: 8, pos: [0.35, -0.45, 0.35], size: 0.55 }, // 끊어진 단면 (+z 튐)
    { index: 9, pos: [0.15, 0.05, 0.5], size: 0.8 }, // 사이로 나는 새 (몸)
    { index: 10, pos: [-0.4, 0.3, 0.55], size: 0.55 }, // 좌 날개
    { index: 11, pos: [0.7, 0.3, 0.55], size: 0.55 }, // 우 날개
    { index: 12, pos: [0.05, -0.25, 0.5], size: 0.45 }, // 꼬리
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [7, 6],
    [6, 5],
    [5, 8],
    [10, 9],
    [9, 11],
    [9, 12],
  ],
};

/** 에베소서 = 전신 갑주(6장). 투구·호심경·방패·검이 위에서 아래로 세로 배치 — 부위별로 켜지며 무장이 완성된다. */
export const EPHESIANS_CONSTELLATION: ConstellationConfig = {
  bookNo: 49,
  bookName: "에베소서",
  symbol: Shield,
  symbolLabel: "전신 갑주",
  phrase: {
    ref: "에베소서 2:8",
    text: "너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라",
  },
  anchors: [
    { index: 1, pos: [0, 2.1, 0], size: 0.75 }, // 구원의 투구
    { index: 2, pos: [-0.35, 1.75, 0], size: 0.55 },
    { index: 3, pos: [0.35, 1.75, 0], size: 0.55 },
    { index: 4, pos: [0, 1.15, 0.1], size: 0.7 }, // 의의 호심경
    { index: 5, pos: [-0.55, 0.45, 0.2], size: 0.7 }, // 믿음의 방패 상단
    { index: 6, pos: [0.55, 0.45, 0.2], size: 0.7 },
    { index: 7, pos: [-0.65, -0.4, 0.2], size: 0.65 }, // 방패 옆
    { index: 8, pos: [0.65, -0.4, 0.2], size: 0.65 },
    { index: 9, pos: [0, -1.05, 0.25], size: 0.75 }, // 방패 하단 꼭지
    { index: 10, pos: [0, -0.2, 0.35], size: 0.8 }, // 방패 중심 보스 (+z)
    { index: 11, pos: [0.9, -1.5, 0.35], size: 0.6 }, // 성령의 검 자루
    { index: 12, pos: [0.65, -1.75, 0.45], size: 0.55 }, // 코등이
    { index: 13, pos: [0.05, -2.35, 0.6], size: 0.7 }, // 칼끝 (+z)
  ],
  edges: [
    [2, 1],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
    [4, 6],
    [5, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 9],
    [11, 12],
    [12, 13],
  ],
};

/** 빌립보서 = 푯대를 향하여(3:14). 지그재그 달음질 궤적이 위로 올라 깃발 푯대와 부름의 상에 닿는다. */
export const PHILIPPIANS_CONSTELLATION: ConstellationConfig = {
  bookNo: 50,
  bookName: "빌립보서",
  symbol: Flag,
  symbolLabel: "푯대",
  phrase: {
    ref: "빌립보서 4:13",
    text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라",
  },
  anchors: [
    { index: 1, pos: [-0.6, -2.2, 0], size: 0.6 }, // 달음질 시작
    { index: 2, pos: [0.3, -1.6, 0.05], size: 0.5 },
    { index: 3, pos: [-0.4, -0.9, 0.1], size: 0.5 },
    { index: 4, pos: [0.35, -0.25, 0.15], size: 0.5 },
    { index: 5, pos: [-0.25, 0.45, 0.2], size: 0.55 },
    { index: 6, pos: [0.15, 1.05, 0.25], size: 0.6 },
    { index: 7, pos: [0.15, 1.9, 0.25], size: 0.65 }, // 깃대
    { index: 8, pos: [0.6, 1.75, 0.2], size: 0.6 }, // 깃발 끝
    { index: 9, pos: [0.55, 1.45, 0.2], size: 0.5 },
    { index: 10, pos: [0.15, 2.35, 0.3], size: 0.9 }, // 부름의 상 (면류관 별)
    { index: 11, pos: [-0.8, 1.4, 0], size: 0.45 }, // 응원 별
    { index: 12, pos: [0.9, 0.6, 0], size: 0.45 },
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
    [9, 7],
    [7, 10],
  ],
};

/** 골로새서 = 뿌리 깊은 나무(2:7). 뿌리 세 갈래에서 줄기를 지나 가지 끝 별들로 — 가운데 가지는 위의 것(+z)을 향한다. */
export const COLOSSIANS_CONSTELLATION: ConstellationConfig = {
  bookNo: 51,
  bookName: "골로새서",
  symbol: TreeDeciduous,
  symbolLabel: "뿌리 깊은 나무",
  phrase: {
    ref: "골로새서 3:23",
    text: "무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라",
  },
  anchors: [
    { index: 1, pos: [-0.7, -2.2, 0.1], size: 0.6 }, // 뿌리 좌
    { index: 2, pos: [0, -2.35, 0.15], size: 0.65 }, // 뿌리 중
    { index: 3, pos: [0.7, -2.2, 0.1], size: 0.6 }, // 뿌리 우
    { index: 4, pos: [0, -1.5, 0], size: 0.7 }, // 뿌리목
    { index: 5, pos: [0, -0.5, 0], size: 0.65 }, // 줄기
    { index: 6, pos: [0, 0.3, 0], size: 0.7 }, // 가지 갈래
    { index: 7, pos: [-0.75, 0.9, -0.1], size: 0.6 }, // 좌 가지
    { index: 8, pos: [-1.05, 1.5, -0.15], size: 0.65 }, // 좌 가지 끝 별
    { index: 9, pos: [0.05, 1.1, 0.2], size: 0.6 }, // 중앙 가지 (+z)
    { index: 10, pos: [0.1, 1.9, 0.25], size: 0.8 }, // 위의 것을 향한 별
    { index: 11, pos: [0.75, 0.85, -0.1], size: 0.6 }, // 우 가지
    { index: 12, pos: [1.05, 1.45, -0.15], size: 0.65 }, // 우 가지 끝 별
    { index: 13, pos: [-0.45, 1.85, 0], size: 0.45 }, // 잎 별
  ],
  edges: [
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [6, 9],
    [9, 10],
    [6, 11],
    [11, 12],
  ],
};

/** 데살로니가전서 = 재림의 나팔과 구름(4:16). 구름을 뚫고 내려오는 나팔, 들려 올라가는 별들(+z 상승). */
export const THESSALONIANS1_CONSTELLATION: ConstellationConfig = {
  bookNo: 52,
  bookName: "데살로니가전서",
  symbol: Cloud,
  symbolLabel: "재림의 나팔",
  phrase: {
    ref: "데살로니가전서 5:16-18",
    text: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라",
  },
  anchors: [
    { index: 1, pos: [-0.85, 1.6, 0], size: 0.7 }, // 구름 띠
    { index: 2, pos: [-0.2, 1.85, 0.05], size: 0.75 },
    { index: 3, pos: [0.5, 1.7, 0], size: 0.7 },
    { index: 4, pos: [1.0, 1.45, -0.05], size: 0.6 },
    { index: 5, pos: [0, 1.1, 0.15], size: 0.6 }, // 나팔 입구
    { index: 6, pos: [-0.4, 0.2, 0.3], size: 0.75 }, // 나팔 벌어진 끝
    { index: 7, pos: [-0.6, -0.1, 0.35], size: 0.5 }, // 나팔 테
    { index: 8, pos: [0.5, -1.9, 0.2], size: 0.55 }, // 들려 올라가는 별
    { index: 9, pos: [0.15, -1.1, 0.3], size: 0.6 },
    { index: 10, pos: [0.65, -0.5, 0.4], size: 0.65 },
    { index: 11, pos: [0.3, 0.3, 0.5], size: 0.7 }, // 가장 높이 오른 별 (+z)
    { index: 12, pos: [-0.7, -2.1, 0], size: 0.5 }, // 땅 지평
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [2, 5],
    [5, 6],
    [6, 7],
    [8, 9],
    [9, 10],
    [10, 11],
    [12, 8],
  ],
};

/** 데살로니가후서 = 굳게 선 기둥(3:3). 흔들리는 물결 위에 곧게 선 기둥과 그 위의 등불. */
export const THESSALONIANS2_CONSTELLATION: ConstellationConfig = {
  bookNo: 53,
  bookName: "데살로니가후서",
  symbol: Columns3,
  symbolLabel: "굳게 선 기둥",
  phrase: {
    ref: "데살로니가후서 3:3",
    text: "주는 미쁘사 너희를 굳건하게 하시고 악한 자에게서 지키시리라",
  },
  anchors: [
    { index: 1, pos: [-1.1, -1.7, 0], size: 0.55 }, // 물결
    { index: 2, pos: [-0.55, -1.9, 0.05], size: 0.5 },
    { index: 3, pos: [0, -1.75, 0], size: 0.55 },
    { index: 4, pos: [0.55, -1.95, 0.05], size: 0.5 },
    { index: 5, pos: [1.1, -1.8, 0], size: 0.55 },
    { index: 6, pos: [0, -1.4, 0.1], size: 0.75 }, // 기둥 기단
    { index: 7, pos: [0, -0.5, 0.1], size: 0.6 }, // 기둥
    { index: 8, pos: [0, 0.5, 0.1], size: 0.6 },
    { index: 9, pos: [0, 1.4, 0.1], size: 0.75 }, // 기둥 머리
    { index: 10, pos: [0, 2.0, 0.15], size: 0.9 }, // 등불
    { index: 11, pos: [-0.9, 0.9, -0.2], size: 0.45 }, // 스치는 바람
    { index: 12, pos: [0.85, 1.1, -0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
  ],
};

/** 디모데전서 = 선한 싸움의 검(6:12). 맞잡은 손이 치켜든 검 — 칼끝이 가장 밝은 별(+z). */
export const TIMOTHY1_CONSTELLATION: ConstellationConfig = {
  bookNo: 54,
  bookName: "디모데전서",
  symbol: Swords,
  symbolLabel: "선한 싸움의 검",
  phrase: {
    ref: "디모데전서 6:12",
    text: "믿음의 선한 싸움을 싸우라 영생을 취하라",
  },
  anchors: [
    { index: 1, pos: [-0.3, -2.0, 0.2], size: 0.65 }, // 맞잡은 손
    { index: 2, pos: [0.3, -2.05, 0.2], size: 0.65 },
    { index: 3, pos: [0, -1.6, 0.15], size: 0.7 }, // 자루
    { index: 4, pos: [-0.55, -1.15, 0.1], size: 0.6 }, // 코등이 좌
    { index: 5, pos: [0.55, -1.15, 0.1], size: 0.6 }, // 코등이 우
    { index: 6, pos: [0, -1.2, 0.15], size: 0.55 }, // 코등이 중심
    { index: 7, pos: [0, -0.4, 0.2], size: 0.5 }, // 검신
    { index: 8, pos: [0, 0.5, 0.25], size: 0.5 },
    { index: 9, pos: [0, 1.4, 0.3], size: 0.55 },
    { index: 10, pos: [0, 2.2, 0.4], size: 0.9 }, // 칼끝 별 (+z)
    { index: 11, pos: [-0.25, 0.05, 0.2], size: 0.4 }, // 검신의 빛
    { index: 12, pos: [0.25, 0.95, 0.25], size: 0.4 },
  ],
  edges: [
    [1, 3],
    [2, 3],
    [3, 6],
    [4, 6],
    [6, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
  ],
};

/** 디모데후서 = 의의 면류관(4:8). 좌우로 감아 올라가는 월계관이 꼭대기 별에서 만나고, 아래엔 결승선. */
export const TIMOTHY2_CONSTELLATION: ConstellationConfig = {
  bookNo: 55,
  bookName: "디모데후서",
  symbol: Trophy,
  symbolLabel: "의의 면류관",
  phrase: {
    ref: "디모데후서 4:7",
    text: "나는 선한 싸움을 싸우고 나의 달려갈 길을 마치고 믿음을 지켰으니",
  },
  anchors: [
    { index: 1, pos: [-0.85, -0.9, 0.1], size: 0.6 }, // 월계관 좌
    { index: 2, pos: [-1.05, -0.1, 0.05], size: 0.6 },
    { index: 3, pos: [-0.85, 0.7, 0], size: 0.6 },
    { index: 4, pos: [-0.45, 1.3, 0], size: 0.6 },
    { index: 5, pos: [0.85, -0.9, 0.1], size: 0.6 }, // 월계관 우
    { index: 6, pos: [1.05, -0.1, 0.05], size: 0.6 },
    { index: 7, pos: [0.85, 0.7, 0], size: 0.6 },
    { index: 8, pos: [0.45, 1.3, 0], size: 0.6 },
    { index: 9, pos: [0, 1.7, 0.15], size: 0.95 }, // 꼭대기 별
    { index: 10, pos: [-0.7, -1.9, 0], size: 0.55 }, // 결승선
    { index: 11, pos: [0, -1.95, 0.05], size: 0.5 },
    { index: 12, pos: [0.7, -1.9, 0], size: 0.55 },
    { index: 13, pos: [0, -1.1, 0.2], size: 0.6 }, // 리본 매듭
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 9],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [10, 11],
    [11, 12],
    [1, 13],
    [13, 5],
  ],
};

/** 디도서 = 씻는 샘(3:5 중생의 씻음). 수반에서 솟는 물기둥과 좌우로 흘러내리는 물줄기, 튀는 물방울(+z). */
export const TITUS_CONSTELLATION: ConstellationConfig = {
  bookNo: 56,
  bookName: "디도서",
  symbol: Droplets,
  symbolLabel: "씻는 샘",
  phrase: {
    ref: "디도서 3:5",
    text: "오직 그의 긍휼하심을 따라 중생의 씻음과 성령의 새롭게 하심으로 하셨나니",
  },
  anchors: [
    { index: 1, pos: [-0.7, -1.6, 0.1], size: 0.65 }, // 수반
    { index: 2, pos: [0, -1.8, 0.15], size: 0.7 },
    { index: 3, pos: [0.7, -1.6, 0.1], size: 0.65 },
    { index: 4, pos: [0, -0.9, 0.2], size: 0.6 }, // 솟는 물기둥
    { index: 5, pos: [0, 0.0, 0.25], size: 0.65 },
    { index: 6, pos: [0, 0.9, 0.3], size: 0.7 }, // 분출 정점
    { index: 7, pos: [-0.5, 0.4, 0.2], size: 0.5 }, // 좌 물줄기
    { index: 8, pos: [-0.8, -0.4, 0.15], size: 0.5 },
    { index: 9, pos: [0.5, 0.35, 0.2], size: 0.5 }, // 우 물줄기
    { index: 10, pos: [0.8, -0.45, 0.15], size: 0.5 },
    { index: 11, pos: [-0.3, 1.5, 0.45], size: 0.45 }, // 물방울 (+z)
    { index: 12, pos: [0.35, 1.55, 0.45], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [2, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [6, 9],
    [9, 10],
    [6, 11],
    [6, 12],
  ],
};

/** 야고보서 = 배의 키(3:4). 큰 배를 움직이는 아주 작은 키(+z) — 작은 것의 능력. */
export const JAMES_CONSTELLATION: ConstellationConfig = {
  bookNo: 59,
  bookName: "야고보서",
  symbol: Ship,
  symbolLabel: "배의 키",
  phrase: {
    ref: "야고보서 1:5",
    text: "누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라",
  },
  anchors: [
    { index: 1, pos: [-1.1, 0.9, 0], size: 0.7 }, // 뱃머리 위
    { index: 2, pos: [-1.0, -0.1, 0], size: 0.65 },
    { index: 3, pos: [-0.75, -1.0, 0], size: 0.7 }, // 선체 바닥
    { index: 4, pos: [0.1, -1.35, 0], size: 0.65 },
    { index: 5, pos: [0.9, -1.2, 0], size: 0.7 }, // 선미
    { index: 6, pos: [0.75, -0.2, 0], size: 0.6 }, // 갑판선
    { index: 7, pos: [1.05, -1.0, 0.35], size: 0.75 }, // 작은 키 축 (+z)
    { index: 8, pos: [1.25, -1.7, 0.45], size: 0.6 }, // 키 날
    { index: 9, pos: [0.6, -1.9, 0.2], size: 0.5 }, // 물살
    { index: 10, pos: [-0.1, -2.1, 0.15], size: 0.5 },
    { index: 11, pos: [-0.8, -2.0, 0.1], size: 0.45 },
    { index: 12, pos: [0.3, 1.3, 0.2], size: 0.7 }, // 지혜의 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 1],
    [5, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [6, 12],
  ],
};

/** 베드로전서 = 산 돌로 지어지는 집(2:5). 모퉁잇돌 위로 층층이 쌓여 올라가는 돌들 — 채워질수록 집이 선다. */
export const PETER1_CONSTELLATION: ConstellationConfig = {
  bookNo: 60,
  bookName: "베드로전서",
  symbol: Gem,
  symbolLabel: "산 돌",
  phrase: {
    ref: "베드로전서 5:7",
    text: "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라",
  },
  anchors: [
    { index: 1, pos: [0, -2.1, 0.15], size: 0.9 }, // 모퉁잇돌 (크게)
    { index: 2, pos: [-0.75, -1.5, 0], size: 0.65 }, // 1층
    { index: 3, pos: [0.75, -1.5, 0], size: 0.65 },
    { index: 4, pos: [-0.45, -0.8, 0.05], size: 0.6 }, // 2층
    { index: 5, pos: [0.45, -0.8, 0.05], size: 0.6 },
    { index: 6, pos: [0, -0.15, 0.1], size: 0.65 }, // 3층
    { index: 7, pos: [-0.6, 0.5, 0], size: 0.55 }, // 벽
    { index: 8, pos: [0.6, 0.5, 0], size: 0.55 },
    { index: 9, pos: [-0.45, 1.2, 0], size: 0.6 }, // 지붕
    { index: 10, pos: [0.45, 1.2, 0], size: 0.6 },
    { index: 11, pos: [0, 1.8, 0.1], size: 0.75 }, // 마룻돌
    { index: 12, pos: [0, 0.6, 0.3], size: 0.5 }, // 창의 빛 (+z)
    { index: 13, pos: [0.95, 0.0, 0.4], size: 0.5 }, // 놓이는 중인 돌 (+z)
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 6],
    [4, 7],
    [5, 8],
    [7, 9],
    [8, 10],
    [9, 11],
    [10, 11],
  ],
};

/** 베드로후서 = 마음에 떠오르는 샛별(1:19). 어스름 지평선 위 샛별과 그 빛이 이어지는 아래 등불. */
export const PETER2_CONSTELLATION: ConstellationConfig = {
  bookNo: 61,
  bookName: "베드로후서",
  symbol: MoonStar,
  symbolLabel: "샛별",
  phrase: {
    ref: "베드로후서 1:19",
    text: "날이 새어 샛별이 너희 마음에 떠오르기까지 너희가 이것을 주의하는 것이 옳으니라",
  },
  anchors: [
    { index: 1, pos: [-1.1, -1.3, 0], size: 0.6 }, // 어스름 지평선
    { index: 2, pos: [-0.35, -1.4, 0], size: 0.5 },
    { index: 3, pos: [0.4, -1.35, 0], size: 0.5 },
    { index: 4, pos: [1.1, -1.25, 0], size: 0.6 },
    { index: 5, pos: [0, 1.2, 0.3], size: 1.0 }, // 샛별 (크게)
    { index: 6, pos: [-0.55, 1.2, 0.25], size: 0.5 }, // 십자 광선
    { index: 7, pos: [0.55, 1.2, 0.25], size: 0.5 },
    { index: 8, pos: [0, 1.85, 0.3], size: 0.55 },
    { index: 9, pos: [0, 0.55, 0.3], size: 0.5 },
    { index: 10, pos: [0, -0.6, 0.2], size: 0.7 }, // 마음의 등불
    { index: 11, pos: [-0.3, -1.0, 0.15], size: 0.45 }, // 등불 받침
    { index: 12, pos: [0.3, -1.0, 0.15], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [5, 7],
    [5, 8],
    [5, 9],
    [9, 10],
    [11, 10],
    [10, 12],
  ],
};

/** 요한일서 = 빛 가운데의 사귐(1:7). 큰 빛에서 내리는 빛기둥 안에 손잡고 나란히 선 두 사람. */
export const JOHN1_CONSTELLATION: ConstellationConfig = {
  bookNo: 62,
  bookName: "요한일서",
  symbol: HandHeart,
  symbolLabel: "빛 가운데의 사귐",
  phrase: {
    ref: "요한일서 4:19",
    text: "우리가 사랑함은 그가 먼저 우리를 사랑하셨음이라",
  },
  anchors: [
    { index: 1, pos: [0, 2.1, 0], size: 0.95 }, // 위의 큰 빛
    { index: 2, pos: [-0.55, 1.2, 0.05], size: 0.5 }, // 빛기둥 경계
    { index: 3, pos: [0.55, 1.2, 0.05], size: 0.5 },
    { index: 4, pos: [-0.75, 0.2, 0.1], size: 0.5 },
    { index: 5, pos: [0.75, 0.2, 0.1], size: 0.5 },
    { index: 6, pos: [-0.35, -0.6, 0.2], size: 0.7 }, // 사람 A
    { index: 7, pos: [-0.35, -1.4, 0.2], size: 0.6 },
    { index: 8, pos: [-0.35, -2.1, 0.2], size: 0.5 },
    { index: 9, pos: [0.35, -0.55, 0.25], size: 0.7 }, // 사람 B
    { index: 10, pos: [0.35, -1.35, 0.25], size: 0.6 },
    { index: 11, pos: [0.35, -2.05, 0.25], size: 0.5 },
    { index: 12, pos: [0, -1.0, 0.3], size: 0.75 }, // 잡은 손 (+z)
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [6, 7],
    [7, 8],
    [9, 10],
    [10, 11],
    [7, 12],
    [12, 10],
  ],
};

/** 여호수아 = 양각 나팔(6장 여리고). 취구에서 위로 휘어 벌어지는 쇼파르, 나팔 끝의 소리 파문(+z)과 무너진 성벽 조각(-z). */
export const JOSHUA_CONSTELLATION: ConstellationConfig = {
  bookNo: 6,
  bookName: "여호수아",
  symbol: Megaphone,
  symbolLabel: "양각 나팔",
  phrase: {
    ref: "여호수아 1:9",
    text: "강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라",
  },
  anchors: [
    { index: 1, pos: [-0.6, -2.2, 0], size: 0.7 }, // 취구
    { index: 2, pos: [-0.75, -1.4, 0.05], size: 0.55 }, // 관 곡선
    { index: 3, pos: [-0.7, -0.6, 0.1], size: 0.55 },
    { index: 4, pos: [-0.45, 0.2, 0.15], size: 0.6 },
    { index: 5, pos: [-0.05, 0.9, 0.2], size: 0.6 },
    { index: 6, pos: [0.45, 1.5, 0.2], size: 0.7 }, // 벌어지는 나팔
    { index: 7, pos: [0.25, 2.05, 0.25], size: 0.65 }, // 나팔 테 위
    { index: 8, pos: [0.85, 1.15, 0.25], size: 0.65 }, // 나팔 테 아래
    { index: 9, pos: [0.9, 2.0, 0.5], size: 0.5 }, // 소리 파문 (+z)
    { index: 10, pos: [1.15, 1.6, 0.6], size: 0.5 },
    { index: 11, pos: [1.2, 2.25, 0.4], size: 0.45 },
    { index: 12, pos: [0.5, -1.5, -0.2], size: 0.5 }, // 무너진 성벽 조각 (-z)
    { index: 13, pos: [0.95, -1.8, -0.25], size: 0.5 },
    { index: 14, pos: [0.7, -2.2, -0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [6, 8],
    [7, 8],
    [7, 9],
    [8, 10],
    [9, 11],
    [12, 13],
    [13, 14],
  ],
};

/** 사사기 = 기드온의 횃불(7장). 깨진 항아리에서 솟아난 횃불 — 조각은 -z로 흩어지고 불꽃은 위로 타오른다. */
export const JUDGES_CONSTELLATION: ConstellationConfig = {
  bookNo: 7,
  bookName: "사사기",
  symbol: Flashlight,
  symbolLabel: "기드온의 횃불",
  phrase: {
    ref: "사사기 5:31",
    text: "주를 사랑하는 자들은 해가 힘 있게 돋음 같게 하시옵소서",
  },
  anchors: [
    { index: 1, pos: [0, -2.2, 0], size: 0.7 }, // 항아리 바닥
    { index: 2, pos: [-0.6, -1.7, 0], size: 0.6 }, // 깨진 항아리 좌
    { index: 3, pos: [0.6, -1.7, 0], size: 0.6 }, // 깨진 항아리 우
    { index: 4, pos: [-0.95, -2.1, -0.25], size: 0.5 }, // 흩어진 조각 (-z)
    { index: 5, pos: [1.0, -2.05, -0.25], size: 0.5 },
    { index: 6, pos: [0, -1.2, 0.1], size: 0.6 }, // 횃불 막대
    { index: 7, pos: [0, -0.3, 0.1], size: 0.55 },
    { index: 8, pos: [0, 0.5, 0.15], size: 0.85 }, // 불꽃 심
    { index: 9, pos: [-0.4, 1.1, 0.1], size: 0.6 }, // 좌 불꽃 혀
    { index: 10, pos: [0.45, 1.2, 0.15], size: 0.6 }, // 우 불꽃 혀
    { index: 11, pos: [0.05, 1.9, 0.2], size: 0.7 }, // 꼭대기 혀
    { index: 12, pos: [0.5, 2.25, 0.25], size: 0.45 }, // 불티
    { index: 13, pos: [-0.35, 1.75, 0.2], size: 0.45 },
  ],
  edges: [
    [2, 1],
    [1, 3],
    [6, 7],
    [7, 8],
    [8, 9],
    [8, 10],
    [8, 11],
    [11, 12],
    [9, 13],
  ],
};

/** 사무엘하 = 다윗의 왕관(7장 다윗 언약). 다섯 봉우리 왕관과 띠의 보석들 — 좌우 봉우리는 -z로 살짝 돌려 입체. */
export const SAMUEL2_CONSTELLATION: ConstellationConfig = {
  bookNo: 10,
  bookName: "사무엘하",
  symbol: Crown,
  symbolLabel: "다윗의 왕관",
  phrase: {
    ref: "사무엘하 7:16",
    text: "네 집과 네 나라가 내 앞에서 영원히 보전되고 네 왕위가 영원히 견고하리라",
  },
  anchors: [
    { index: 1, pos: [-1.0, -0.8, 0], size: 0.7 }, // 띠
    { index: 2, pos: [-0.5, -1.0, 0.1], size: 0.6 },
    { index: 3, pos: [0, -1.05, 0.15], size: 0.65 },
    { index: 4, pos: [0.5, -1.0, 0.1], size: 0.6 },
    { index: 5, pos: [1.0, -0.8, 0], size: 0.7 },
    { index: 6, pos: [-0.95, 0.4, -0.1], size: 0.7 }, // 봉우리 (좌외, -z)
    { index: 7, pos: [-0.5, 0.9, 0.05], size: 0.7 },
    { index: 8, pos: [0, 1.6, 0.15], size: 0.9 }, // 중앙 봉우리
    { index: 9, pos: [0.5, 0.9, 0.05], size: 0.7 },
    { index: 10, pos: [0.95, 0.4, -0.1], size: 0.7 }, // 봉우리 (우외, -z)
    { index: 11, pos: [0, 2.15, 0.2], size: 0.6 }, // 중앙 봉우리 위 별
    { index: 12, pos: [-0.5, -0.55, 0.2], size: 0.5 }, // 띠 보석
    { index: 13, pos: [0.5, -0.55, 0.2], size: 0.5 },
    { index: 14, pos: [0, -0.5, 0.25], size: 0.55 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 5],
    [8, 11],
  ],
};

/** 열왕기상 = 솔로몬 성전(6~8장). 야긴·보아스 두 기둥(머리 장식 +z)과 지붕, 그 위 영광의 별. */
export const KINGS1_CONSTELLATION: ConstellationConfig = {
  bookNo: 11,
  bookName: "열왕기상",
  symbol: Landmark,
  symbolLabel: "솔로몬 성전",
  phrase: {
    ref: "열왕기상 8:27",
    text: "하늘과 하늘들의 하늘이라도 주를 용납하지 못하겠거든 하물며 내가 건축한 이 성전이오리이까",
  },
  anchors: [
    { index: 1, pos: [-1.0, -2.0, 0], size: 0.7 }, // 기단 좌
    { index: 2, pos: [1.0, -2.0, 0], size: 0.7 }, // 기단 우
    { index: 3, pos: [-0.7, -1.6, 0.05], size: 0.65 }, // 야긴 기둥
    { index: 4, pos: [-0.7, -0.2, 0.05], size: 0.6 },
    { index: 5, pos: [-0.7, 0.7, 0.25], size: 0.7 }, // 야긴 머리 장식 (+z)
    { index: 6, pos: [0.7, -1.6, 0.05], size: 0.65 }, // 보아스 기둥
    { index: 7, pos: [0.7, -0.2, 0.05], size: 0.6 },
    { index: 8, pos: [0.7, 0.7, 0.25], size: 0.7 }, // 보아스 머리 장식 (+z)
    { index: 9, pos: [0, 0.85, 0.1], size: 0.6 }, // 상인방
    { index: 10, pos: [-0.85, 1.1, 0], size: 0.6 }, // 지붕 밑변
    { index: 11, pos: [0.85, 1.1, 0], size: 0.6 },
    { index: 12, pos: [0, 1.9, 0.1], size: 0.85 }, // 지붕 정점
    { index: 13, pos: [0, -1.3, 0.3], size: 0.6 }, // 성소 문
    { index: 14, pos: [0, 2.35, 0.15], size: 0.55 }, // 영광의 별
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 6],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 8],
    [5, 9],
    [9, 8],
    [5, 10],
    [8, 11],
    [10, 12],
    [11, 12],
    [12, 14],
  ],
};

/** 에스라 = 다시 놓는 성전 기초(3장). 기초석 줄에서 계단형으로 쌓여 올라 머릿돌 별(+z)에 이른다. */
export const EZRA_CONSTELLATION: ConstellationConfig = {
  bookNo: 15,
  bookName: "에스라",
  symbol: Hammer,
  symbolLabel: "성전 기초",
  phrase: {
    ref: "에스라 7:10",
    text: "에스라가 여호와의 율법을 연구하여 준행하며 율례와 규례를 이스라엘에게 가르치기로 결심하였었더라",
  },
  anchors: [
    { index: 1, pos: [-1.0, -1.9, 0], size: 0.7 }, // 기초석 줄
    { index: 2, pos: [-0.33, -1.95, 0.05], size: 0.65 },
    { index: 3, pos: [0.33, -1.9, 0.05], size: 0.65 },
    { index: 4, pos: [1.0, -1.85, 0], size: 0.7 },
    { index: 5, pos: [-0.66, -1.2, 0.05], size: 0.6 }, // 2단
    { index: 6, pos: [0, -1.25, 0.1], size: 0.6 },
    { index: 7, pos: [0.66, -1.2, 0.05], size: 0.6 },
    { index: 8, pos: [-0.33, -0.5, 0.1], size: 0.55 }, // 3단
    { index: 9, pos: [0.33, -0.5, 0.1], size: 0.55 },
    { index: 10, pos: [0, 0.3, 0.15], size: 0.6 }, // 쌓는 중인 단
    { index: 11, pos: [0, 1.3, 0.35], size: 0.9 }, // 머릿돌 별 (+z)
    { index: 12, pos: [0.85, 0.8, 0.2], size: 0.5 }, // 율법 두루마리 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7],
    [8, 9],
    [1, 5],
    [5, 8],
    [8, 10],
    [4, 7],
    [7, 9],
    [9, 10],
    [10, 11],
  ],
};

/** 느헤미야 = 성벽과 성문(52일 재건). 톱니 성벽 가운데 아치 성문 — 문짝은 +z로 열려 요한삼서(문)와 호응. */
export const NEHEMIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 16,
  bookName: "느헤미야",
  symbol: BrickWall,
  symbolLabel: "성벽과 성문",
  phrase: {
    ref: "느헤미야 8:10",
    text: "여호와로 인하여 기뻐하는 것이 너희의 힘이니라",
  },
  anchors: [
    { index: 1, pos: [-1.15, -0.9, 0], size: 0.65 }, // 좌 성벽
    { index: 2, pos: [-0.85, -0.55, 0], size: 0.55 }, // 톱니
    { index: 3, pos: [-0.6, -0.9, 0], size: 0.55 },
    { index: 4, pos: [-0.35, -1.3, 0], size: 0.65 }, // 성문 좌 기둥
    { index: 5, pos: [0, -0.45, 0.1], size: 0.7 }, // 아치 정점
    { index: 6, pos: [0.35, -1.3, 0], size: 0.65 }, // 성문 우 기둥
    { index: 7, pos: [0.6, -0.9, 0], size: 0.55 }, // 우 성벽
    { index: 8, pos: [0.85, -0.55, 0], size: 0.55 },
    { index: 9, pos: [1.15, -0.9, 0], size: 0.65 },
    { index: 10, pos: [-0.85, 0.4, 0], size: 0.65 }, // 좌 망대
    { index: 11, pos: [0.85, 0.45, 0], size: 0.65 }, // 우 망대
    { index: 12, pos: [0.2, -0.9, 0.45], size: 0.6 }, // 열린 문짝 (+z)
    { index: 13, pos: [0, 0.9, 0.15], size: 0.7 }, // 기뻐하는 별
    { index: 14, pos: [0, 1.7, 0.2], size: 0.55 },
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
    [2, 10],
    [8, 11],
    [6, 12],
    [5, 13],
    [13, 14],
  ],
};

/** 에스더 = 내밀어진 금 규(5:2). 대각선 홀 끝의 보석 별(+z)과, 그 앞으로 다가가는 에스더의 자취. */
export const ESTHER_CONSTELLATION: ConstellationConfig = {
  bookNo: 17,
  bookName: "에스더",
  symbol: Wand,
  symbolLabel: "금 규",
  phrase: {
    ref: "에스더 4:14",
    text: "네가 왕후의 자리를 얻은 것이 이 때를 위함이 아닌지 누가 알겠느냐",
  },
  anchors: [
    { index: 1, pos: [-0.9, -1.9, 0], size: 0.7 }, // 홀 손잡이
    { index: 2, pos: [-0.5, -1.1, 0.1], size: 0.5 }, // 홀 대
    { index: 3, pos: [-0.1, -0.3, 0.2], size: 0.5 },
    { index: 4, pos: [0.3, 0.5, 0.3], size: 0.55 },
    { index: 5, pos: [0.7, 1.3, 0.4], size: 0.9 }, // 홀 끝 보석 (+z)
    { index: 6, pos: [0.35, 1.8, 0.35], size: 0.5 }, // 보석 광채
    { index: 7, pos: [1.1, 1.7, 0.35], size: 0.5 },
    { index: 8, pos: [-0.6, 0.9, 0.15], size: 0.7 }, // 다가가는 에스더 별
    { index: 9, pos: [-0.85, 0.3, 0.1], size: 0.45 }, // 자취
    { index: 10, pos: [-1.05, -0.3, 0.05], size: 0.4 },
    { index: 11, pos: [0.05, 2.2, 0.3], size: 0.55 }, // "이 때를 위함" 별
    { index: 12, pos: [1.15, 0.7, 0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [5, 7],
    [6, 11],
    [10, 9],
    [9, 8],
  ],
};

/** 전도서 = 해 아래 도는 바람(1:6). 위의 큰 해 아래를 크게 도는 바람의 순환 고리 — 시작과 끝이 맞물린다. */
export const ECCLESIASTES_CONSTELLATION: ConstellationConfig = {
  bookNo: 21,
  bookName: "전도서",
  symbol: Wind,
  symbolLabel: "해 아래 도는 바람",
  phrase: {
    ref: "전도서 3:11",
    text: "하나님이 모든 것을 지으시되 때를 따라 아름답게 하셨고",
  },
  anchors: [
    { index: 1, pos: [0, 1.8, 0], size: 0.95 }, // 해
    { index: 2, pos: [-0.55, 2.15, 0], size: 0.45 }, // 해 광선
    { index: 3, pos: [0.55, 2.15, 0], size: 0.45 },
    { index: 4, pos: [0.9, 0.4, 0.2], size: 0.6 }, // 바람 고리
    { index: 5, pos: [0.55, -0.5, 0.35], size: 0.55 },
    { index: 6, pos: [0, -1.0, 0.4], size: 0.6 }, // 고리 하단 (+z)
    { index: 7, pos: [-0.6, -0.55, 0.35], size: 0.55 },
    { index: 8, pos: [-0.95, 0.35, 0.2], size: 0.6 },
    { index: 9, pos: [-0.5, 0.9, 0.05], size: 0.55 },
    { index: 10, pos: [0.15, 1.0, 0], size: 0.55 },
    { index: 11, pos: [0.95, 1.0, 0.1], size: 0.5 }, // 맞물림(시작=끝)
    { index: 12, pos: [-0.3, -1.8, 0.2], size: 0.5 }, // 바다로 흐르는 강
    { index: 13, pos: [0.4, -2.1, 0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 4],
    [6, 12],
    [12, 13],
  ],
};

/** 다니엘 = 굴 속의 사자(6장). 입을 다물고 엎드린 사자 — 실제 사자자리(Leo)의 낫 모양 갈기를 참조. 위에서 빛이 내린다. */
export const DANIEL_CONSTELLATION: ConstellationConfig = {
  bookNo: 27,
  bookName: "다니엘",
  symbol: PawPrint,
  symbolLabel: "굴 속의 사자",
  phrase: {
    ref: "다니엘 12:3",
    text: "많은 사람을 옳은 데로 돌아오게 한 자는 별과 같이 영원토록 빛나리라",
  },
  anchors: [
    { index: 1, pos: [-0.45, 0.9, 0], size: 0.7 }, // 갈기 (낫 모양)
    { index: 2, pos: [-0.75, 0.55, 0], size: 0.6 },
    { index: 3, pos: [-0.8, 0.05, 0], size: 0.6 },
    { index: 4, pos: [-0.5, -0.3, 0.05], size: 0.65 }, // 다문 입
    { index: 5, pos: [-0.15, 0.55, 0.05], size: 0.75 }, // 정수리
    { index: 6, pos: [0.2, 0.35, 0], size: 0.6 }, // 등 곡선
    { index: 7, pos: [0.7, 0.25, -0.05], size: 0.6 },
    { index: 8, pos: [1.05, -0.1, -0.05], size: 0.65 }, // 엉덩이
    { index: 9, pos: [1.2, -0.75, 0], size: 0.5 }, // 꼬리
    { index: 10, pos: [0.95, -1.25, 0.05], size: 0.55 }, // 꼬리 술
    { index: 11, pos: [-0.35, -1.1, 0.1], size: 0.55 }, // 앞다리
    { index: 12, pos: [0.75, -1.05, 0], size: 0.55 }, // 뒷다리
    { index: 13, pos: [0, 2.1, 0.2], size: 0.7 }, // 내리는 빛
    { index: 14, pos: [0, 1.5, 0.15], size: 0.45 },
  ],
  edges: [
    [5, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [4, 11],
    [8, 12],
    [13, 14],
    [14, 5],
  ],
};

/** 호세아 = 다시 맞잡은 두 손(3장 고멜을 다시 사옴). 위에서 내려오는 손과 아래서 올라가는 손(+z)이 만나는 지점의 큰 별. */
export const HOSEA_CONSTELLATION: ConstellationConfig = {
  bookNo: 28,
  bookName: "호세아",
  symbol: HeartHandshake,
  symbolLabel: "다시 맞잡은 손",
  phrase: {
    ref: "호세아 6:3",
    text: "우리가 여호와를 알자 힘써 여호와를 알자 그의 나타나심은 새벽 빛 같이 어김없나니",
  },
  anchors: [
    { index: 1, pos: [0.15, 2.2, 0], size: 0.65 }, // 위 팔
    { index: 2, pos: [0.05, 1.5, 0.1], size: 0.6 }, // 위 손목
    { index: 3, pos: [0, 0.8, 0.2], size: 0.7 }, // 위 손끝
    { index: 4, pos: [-0.15, -2.2, 0.1], size: 0.65 }, // 아래 팔
    { index: 5, pos: [-0.05, -1.5, 0.2], size: 0.6 }, // 아래 손목
    { index: 6, pos: [0, -0.7, 0.35], size: 0.7 }, // 아래 손끝 (+z)
    { index: 7, pos: [0, 0.05, 0.3], size: 1.0 }, // 맞잡는 지점 (크게)
    { index: 8, pos: [-0.8, 1.2, 0], size: 0.5 }, // 새벽 빛
    { index: 9, pos: [0.8, 1.15, 0], size: 0.5 },
    { index: 10, pos: [-0.95, -0.9, 0], size: 0.45 },
    { index: 11, pos: [0.95, -1.0, 0], size: 0.45 },
    { index: 12, pos: [0.55, 0.05, 0.35], size: 0.5 }, // 언약의 고리
    { index: 13, pos: [-0.55, 0.05, 0.35], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 7],
    [4, 5],
    [5, 6],
    [6, 7],
    [13, 7],
    [7, 12],
  ],
};

/** 스가랴 = 순금 등잔대와 두 감람나무(4장). 일곱 불꽃이 호를 그리고 좌우에 감람나무 — 완필 시 일곱 불이 모두 켜진다. */
export const ZECHARIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 38,
  bookName: "스가랴",
  symbol: Leaf,
  symbolLabel: "등잔대와 감람나무",
  phrase: {
    ref: "스가랴 4:6",
    text: "이는 힘으로 되지 아니하며 능력으로 되지 아니하고 오직 나의 영으로 되느니라",
  },
  anchors: [
    { index: 1, pos: [0, -2.0, 0], size: 0.7 }, // 등잔대 받침
    { index: 2, pos: [0, -1.0, 0], size: 0.6 }, // 기둥
    { index: 3, pos: [-0.85, -0.35, 0], size: 0.55 }, // 좌 가지살
    { index: 4, pos: [0.85, -0.35, 0], size: 0.55 }, // 우 가지살
    { index: 5, pos: [-0.9, 0.45, 0], size: 0.55 }, // 일곱 불꽃
    { index: 6, pos: [-0.6, 0.55, 0.03], size: 0.55 },
    { index: 7, pos: [-0.3, 0.62, 0.06], size: 0.55 },
    { index: 8, pos: [0, 0.7, 0.1], size: 0.75 }, // 중앙 불꽃
    { index: 9, pos: [0.3, 0.62, 0.06], size: 0.55 },
    { index: 10, pos: [0.6, 0.55, 0.03], size: 0.55 },
    { index: 11, pos: [0.9, 0.45, 0], size: 0.55 },
    { index: 12, pos: [-1.15, -1.0, -0.15], size: 0.65 }, // 좌 감람나무
    { index: 13, pos: [1.15, -1.0, -0.15], size: 0.65 }, // 우 감람나무
    { index: 14, pos: [0, 1.5, 0.15], size: 0.5 }, // 위의 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [2, 4],
    [3, 5],
    [4, 11],
    [2, 8],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [12, 3],
    [13, 4],
    [8, 14],
  ],
};

/** 마가복음 = 풍랑 위의 배(4장). 파도 위 돛단배 — 돛 위로 풍랑을 잔잔케 하신 별이 뜬다. */
export const MARK_CONSTELLATION: ConstellationConfig = {
  bookNo: 41,
  bookName: "마가복음",
  symbol: Sailboat,
  symbolLabel: "풍랑 위의 배",
  phrase: {
    ref: "마가복음 10:45",
    text: "인자가 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고 자기 목숨을 많은 사람의 대속물로 주려 함이니라",
  },
  anchors: [
    { index: 1, pos: [-1.15, -1.5, 0], size: 0.6 }, // 파도
    { index: 2, pos: [-0.6, -1.2, 0.05], size: 0.55 },
    { index: 3, pos: [0, -1.55, 0.05], size: 0.6 },
    { index: 4, pos: [0.6, -1.25, 0.05], size: 0.55 },
    { index: 5, pos: [1.15, -1.6, 0], size: 0.6 },
    { index: 6, pos: [-0.75, -0.7, 0.1], size: 0.7 }, // 선체 좌현
    { index: 7, pos: [0, -1.0, 0.15], size: 0.6 }, // 선체 바닥
    { index: 8, pos: [0.75, -0.75, 0.1], size: 0.7 }, // 선체 우현
    { index: 9, pos: [0, -0.1, 0.1], size: 0.55 }, // 돛대 밑
    { index: 10, pos: [-0.55, 0.65, 0.1], size: 0.6 }, // 돛 좌
    { index: 11, pos: [0, 1.5, 0.15], size: 0.7 }, // 돛 꼭대기
    { index: 12, pos: [0.55, 0.7, 0.1], size: 0.6 }, // 돛 우
    { index: 13, pos: [0, 2.1, 0.2], size: 0.8 }, // 잔잔케 하신 별
    { index: 14, pos: [-0.9, 1.3, 0], size: 0.45 }, // 바닷새
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 8],
    [6, 8],
    [7, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 9],
    [11, 13],
  ],
};

/** 누가복음 = 구유(2장). X자 다리 구유에 뉘인 아기와 그 위의 큰 별, 다가오는 목자 별들(+z). */
export const LUKE_CONSTELLATION: ConstellationConfig = {
  bookNo: 42,
  bookName: "누가복음",
  symbol: Baby,
  symbolLabel: "구유",
  phrase: {
    ref: "누가복음 19:10",
    text: "인자가 온 것은 잃어버린 자를 찾아 구원하려 함이니라",
  },
  anchors: [
    { index: 1, pos: [-0.8, -1.9, 0], size: 0.65 }, // X 다리 좌
    { index: 2, pos: [0.8, -1.9, 0], size: 0.65 }, // X 다리 우
    { index: 3, pos: [-0.7, -0.9, 0.05], size: 0.6 }, // 구유 통 좌
    { index: 4, pos: [0.7, -0.9, 0.05], size: 0.6 }, // 구유 통 우
    { index: 5, pos: [-0.3, -0.55, 0.15], size: 0.6 }, // 포대기
    { index: 6, pos: [0, -0.45, 0.2], size: 0.75 }, // 아기 머리
    { index: 7, pos: [0.35, -0.6, 0.15], size: 0.6 }, // 포대기
    { index: 8, pos: [0, 1.6, 0.25], size: 0.95 }, // 큰 별
    { index: 9, pos: [0, 0.7, 0.2], size: 0.5 }, // 빛줄기
    { index: 10, pos: [-0.4, 2.0, 0.2], size: 0.45 }, // 별 광선
    { index: 11, pos: [0.4, 2.0, 0.2], size: 0.45 },
    { index: 12, pos: [-0.95, 0.6, 0.35], size: 0.5 }, // 다가오는 목자 별 (+z)
    { index: 13, pos: [0.95, 0.55, 0.35], size: 0.5 },
  ],
  edges: [
    [1, 4],
    [2, 3],
    [3, 4],
    [5, 6],
    [6, 7],
    [8, 9],
    [9, 6],
    [8, 10],
    [8, 11],
  ],
};

/** 요한복음 = 포도나무와 가지(15장). 원줄기에 붙은 가지마다 포도송이 — "붙어 있으면 열매 맺는다"가 앵커 점등과 동형. */
export const JOHN_CONSTELLATION: ConstellationConfig = {
  bookNo: 43,
  bookName: "요한복음",
  symbol: Grape,
  symbolLabel: "포도나무",
  phrase: {
    ref: "요한복음 3:16",
    text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라",
  },
  anchors: [
    { index: 1, pos: [0, -2.3, 0], size: 0.75 }, // 원줄기 뿌리
    { index: 2, pos: [0, -1.3, 0], size: 0.65 },
    { index: 3, pos: [0, -0.3, 0], size: 0.65 },
    { index: 4, pos: [0, 0.7, 0], size: 0.65 },
    { index: 5, pos: [0, 1.7, 0], size: 0.7 }, // 줄기 꼭대기
    { index: 6, pos: [-0.6, -0.9, 0.1], size: 0.55 }, // 가지 1 (좌하)
    { index: 7, pos: [-1.0, -1.3, 0.15], size: 0.75 }, // 포도송이
    { index: 8, pos: [0.6, 0.1, 0.1], size: 0.55 }, // 가지 2 (우중)
    { index: 9, pos: [1.0, -0.3, 0.15], size: 0.75 }, // 포도송이
    { index: 10, pos: [-0.6, 1.1, 0.1], size: 0.55 }, // 가지 3 (좌상)
    { index: 11, pos: [-1.0, 0.75, 0.15], size: 0.75 }, // 포도송이
    { index: 12, pos: [0.55, 1.5, 0.1], size: 0.5 }, // 새 가지 잎
    { index: 13, pos: [-1.15, -1.7, 0.15], size: 0.45 }, // 열매 알
    { index: 14, pos: [1.15, -0.7, 0.15], size: 0.45 },
    { index: 15, pos: [0.35, 2.1, 0.05], size: 0.5 }, // 꼭대기 새순
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [2, 6],
    [6, 7],
    [7, 13],
    [3, 8],
    [8, 9],
    [9, 14],
    [4, 10],
    [10, 11],
    [5, 12],
    [5, 15],
  ],
};

/** 로마서 = 십자가. 교차점이 가장 밝고 사방으로 글로우 광선 — 복음의 중심답게 단순하고 큰 형태. */
export const ROMANS_CONSTELLATION: ConstellationConfig = {
  bookNo: 45,
  bookName: "로마서",
  symbol: Cross,
  symbolLabel: "십자가",
  phrase: {
    ref: "로마서 8:28",
    text: "하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라",
  },
  anchors: [
    { index: 1, pos: [0, -2.1, 0], size: 0.7 }, // 세로대 아래
    { index: 2, pos: [0, -1.0, 0], size: 0.55 },
    { index: 3, pos: [0, 0.2, 0.05], size: 0.85 }, // 교차점
    { index: 4, pos: [0, 1.4, 0], size: 0.6 },
    { index: 5, pos: [0, 2.2, 0], size: 0.7 }, // 세로대 위
    { index: 6, pos: [-1.0, 0.2, 0], size: 0.7 }, // 가로대 좌
    { index: 7, pos: [-0.5, 0.2, 0.05], size: 0.55 },
    { index: 8, pos: [0.5, 0.2, 0.05], size: 0.55 },
    { index: 9, pos: [1.0, 0.2, 0], size: 0.7 }, // 가로대 우
    { index: 10, pos: [-0.6, 0.9, 0.2], size: 0.45 }, // 글로우 광선
    { index: 11, pos: [0.65, 0.9, 0.2], size: 0.45 },
    { index: 12, pos: [0.6, -0.5, 0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 3],
    [3, 8],
    [8, 9],
    [3, 10],
    [3, 11],
    [3, 12],
  ],
};

/** 고린도전서 = 그 중의 제일(13:13). 하트 외곽 안에 믿음·소망·사랑 세 별 — 가운데 사랑 별이 가장 크다. */
export const CORINTHIANS1_CONSTELLATION: ConstellationConfig = {
  bookNo: 46,
  bookName: "고린도전서",
  symbol: Heart,
  symbolLabel: "그 중의 제일",
  phrase: {
    ref: "고린도전서 13:13",
    text: "믿음, 소망, 사랑, 이 세 가지는 항상 있을 것인데 그 중의 제일은 사랑이라",
  },
  anchors: [
    { index: 1, pos: [0, -1.9, 0], size: 0.75 }, // 하트 아래 꼭지
    { index: 2, pos: [-0.85, -0.9, 0], size: 0.6 },
    { index: 3, pos: [-1.05, 0.1, 0], size: 0.65 },
    { index: 4, pos: [-0.55, 0.95, 0.05], size: 0.7 }, // 좌 봉우리
    { index: 5, pos: [0, 0.45, 0.05], size: 0.6 }, // 골
    { index: 6, pos: [0.55, 0.95, 0.05], size: 0.7 }, // 우 봉우리
    { index: 7, pos: [1.05, 0.1, 0], size: 0.65 },
    { index: 8, pos: [0.85, -0.9, 0], size: 0.6 },
    { index: 9, pos: [-0.4, -0.2, 0.2], size: 0.6 }, // 믿음 별
    { index: 10, pos: [0.4, -0.2, 0.2], size: 0.6 }, // 소망 별
    { index: 11, pos: [0, -0.7, 0.3], size: 1.0 }, // 사랑 별 (가장 크게, +z)
    { index: 12, pos: [0, 1.6, 0.1], size: 0.5 }, // 위의 별
    { index: 13, pos: [0.3, -1.15, 0.25], size: 0.4 }, // 사랑의 광채
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 1],
    [9, 10],
    [10, 11],
    [11, 9],
  ],
};

/** 고린도후서 = 질그릇 속의 보배(4:7). 금 간 항아리 안의 보배 별 — 갈라진 틈과 입구로 빛이 새어 나온다(+z). */
export const CORINTHIANS2_CONSTELLATION: ConstellationConfig = {
  bookNo: 47,
  bookName: "고린도후서",
  symbol: Amphora,
  symbolLabel: "질그릇 속의 보배",
  phrase: {
    ref: "고린도후서 12:9",
    text: "내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이라",
  },
  anchors: [
    { index: 1, pos: [-0.5, -1.9, 0], size: 0.6 }, // 항아리 바닥
    { index: 2, pos: [0.5, -1.9, 0], size: 0.6 },
    { index: 3, pos: [-0.85, -0.9, 0], size: 0.65 }, // 몸통
    { index: 4, pos: [0.85, -0.9, 0], size: 0.65 },
    { index: 5, pos: [-0.6, 0.1, 0], size: 0.6 }, // 어깨
    { index: 6, pos: [0.6, 0.1, 0], size: 0.6 },
    { index: 7, pos: [-0.35, 0.7, 0], size: 0.55 }, // 입구
    { index: 8, pos: [0.35, 0.7, 0], size: 0.55 },
    { index: 9, pos: [0.15, -0.6, 0.1], size: 0.45 }, // 금(갈라진 틈)
    { index: 10, pos: [0, -0.5, 0.25], size: 0.9 }, // 보배 별 (안)
    { index: 11, pos: [0.7, -1.4, 0.4], size: 0.5 }, // 틈으로 새는 빛 (+z)
    { index: 12, pos: [0, 1.5, 0.2], size: 0.65 }, // 입구 위로 솟는 빛
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 7],
    [6, 8],
    [7, 8],
    [9, 11],
    [10, 12],
  ],
};

/** 히브리서 = 영혼의 닻(6:19). 고리·자루·두 갈고리의 닻과, 휘장 안(위쪽 +z)으로 이어지는 밧줄. */
export const HEBREWS_CONSTELLATION: ConstellationConfig = {
  bookNo: 58,
  bookName: "히브리서",
  symbol: Anchor,
  symbolLabel: "영혼의 닻",
  phrase: {
    ref: "히브리서 6:19",
    text: "우리가 이 소망을 가지고 있는 것은 영혼의 닻 같아서 튼튼하고 견고하여",
  },
  anchors: [
    { index: 1, pos: [0, 2.2, 0], size: 0.7 }, // 고리
    { index: 2, pos: [-0.65, 1.5, 0], size: 0.6 }, // 자루(가로대) 좌
    { index: 3, pos: [0.65, 1.5, 0], size: 0.6 }, // 자루 우
    { index: 4, pos: [0, 1.5, 0], size: 0.5 }, // 자루 중심
    { index: 5, pos: [0, 0.6, 0], size: 0.5 }, // 축
    { index: 6, pos: [0, -0.4, 0], size: 0.55 },
    { index: 7, pos: [0, -1.3, 0.05], size: 0.7 }, // 크라운
    { index: 8, pos: [-0.7, -0.9, 0.05], size: 0.65 }, // 좌 갈고리
    { index: 9, pos: [-0.95, -0.35, 0.1], size: 0.55 }, // 좌 갈고리 끝
    { index: 10, pos: [0.7, -0.95, 0.05], size: 0.65 }, // 우 갈고리
    { index: 11, pos: [0.95, -0.4, 0.1], size: 0.55 }, // 우 갈고리 끝
    { index: 12, pos: [0.5, 1.9, 0.25], size: 0.5 }, // 휘장 안으로 가는 밧줄 (+z)
    { index: 13, pos: [0.95, 2.3, 0.35], size: 0.5 },
  ],
  edges: [
    [2, 4],
    [4, 3],
    [1, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [7, 10],
    [10, 11],
    [1, 12],
    [12, 13],
  ],
};

/** 요한계시록 = 일곱 별과 일곱 촛대(1장). 위의 별 호와 아래의 촛대 불꽃 줄이 짝을 이루고, 가운데 알파와 오메가. */
export const REVELATION_CONSTELLATION: ConstellationConfig = {
  bookNo: 66,
  bookName: "요한계시록",
  symbol: Sparkles,
  symbolLabel: "일곱 별과 일곱 촛대",
  phrase: {
    ref: "요한계시록 22:13",
    text: "나는 알파와 오메가요 처음과 마지막이요 시작과 마침이라",
  },
  anchors: [
    { index: 1, pos: [-1.05, 1.35, 0], size: 0.6 }, // 일곱 별 호
    { index: 2, pos: [-0.7, 1.6, 0.05], size: 0.6 },
    { index: 3, pos: [-0.35, 1.78, 0.1], size: 0.6 },
    { index: 4, pos: [0, 1.85, 0.15], size: 0.75 }, // 가운데 별
    { index: 5, pos: [0.35, 1.78, 0.1], size: 0.6 },
    { index: 6, pos: [0.7, 1.6, 0.05], size: 0.6 },
    { index: 7, pos: [1.05, 1.35, 0], size: 0.6 },
    { index: 8, pos: [-1.05, -0.8, 0], size: 0.55 }, // 일곱 촛대 불꽃
    { index: 9, pos: [-0.7, -0.85, 0.03], size: 0.55 },
    { index: 10, pos: [-0.35, -0.9, 0.06], size: 0.55 },
    { index: 11, pos: [0, -0.95, 0.15], size: 0.7 }, // 가운데 촛대 (+z)
    { index: 12, pos: [0.35, -0.9, 0.06], size: 0.55 },
    { index: 13, pos: [0.7, -0.85, 0.03], size: 0.55 },
    { index: 14, pos: [1.05, -0.8, 0], size: 0.55 },
    { index: 15, pos: [0, -1.9, 0.1], size: 0.65 }, // 촛대 받침
    { index: 16, pos: [0, 0.4, 0.25], size: 0.95 }, // 알파와 오메가 (촛대 사이에 다니시는 이)
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 14],
    [11, 15],
    [4, 16],
    [16, 11],
  ],
};

/** 창세기 = 떠오르는 해(1:3 "빛이 있으라"). 지평선 위로 솟는 반원 해와 첫 새벽의 방사 광선. */
export const GENESIS_CONSTELLATION: ConstellationConfig = {
  bookNo: 1,
  bookName: "창세기",
  symbol: Sun,
  symbolLabel: "떠오르는 해",
  phrase: {
    ref: "창세기 1:1",
    text: "태초에 하나님이 천지를 창조하시니라",
  },
  anchors: [
    { index: 1, pos: [-1.15, -1.2, 0], size: 0.6 }, // 지평선
    { index: 2, pos: [-0.55, -1.25, 0], size: 0.5 },
    { index: 3, pos: [0, -1.3, 0], size: 0.6 },
    { index: 4, pos: [0.55, -1.25, 0], size: 0.5 },
    { index: 5, pos: [1.15, -1.2, 0], size: 0.6 },
    { index: 6, pos: [-0.7, -0.75, 0.05], size: 0.6 }, // 반원 해 호
    { index: 7, pos: [-0.35, -0.35, 0.1], size: 0.6 },
    { index: 8, pos: [0, -0.2, 0.15], size: 0.9 }, // 해 정점
    { index: 9, pos: [0.35, -0.35, 0.1], size: 0.6 },
    { index: 10, pos: [0.7, -0.75, 0.05], size: 0.6 },
    { index: 11, pos: [-1.0, 0.4, 0.2], size: 0.5 }, // 방사 광선 (+z)
    { index: 12, pos: [-0.4, 0.9, 0.25], size: 0.55 },
    { index: 13, pos: [0.05, 1.5, 0.3], size: 0.7 }, // 첫 빛
    { index: 14, pos: [0.5, 0.9, 0.25], size: 0.55 },
    { index: 15, pos: [1.0, 0.45, 0.2], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [6, 11],
    [7, 12],
    [8, 13],
    [9, 14],
    [10, 15],
  ],
};

/** 출애굽기 = 불기둥(13:21). 아래에서 위로 타오르는 지그재그 불꽃 기둥과 상단의 구름. */
export const EXODUS_CONSTELLATION: ConstellationConfig = {
  bookNo: 2,
  bookName: "출애굽기",
  symbol: Flame,
  symbolLabel: "불기둥",
  phrase: {
    ref: "출애굽기 14:14",
    text: "여호와께서 너희를 위하여 싸우시리니 너희는 가만히 있을지니라",
  },
  anchors: [
    { index: 1, pos: [0, -2.3, 0], size: 0.8 }, // 기둥 뿌리
    { index: 2, pos: [-0.35, -1.6, 0.05], size: 0.6 }, // 지그재그 불꽃
    { index: 3, pos: [0.3, -1.0, 0.1], size: 0.65 },
    { index: 4, pos: [-0.3, -0.35, 0.1], size: 0.6 },
    { index: 5, pos: [0.35, 0.3, 0.15], size: 0.65 },
    { index: 6, pos: [-0.25, 0.95, 0.15], size: 0.6 },
    { index: 7, pos: [0.1, 1.55, 0.2], size: 0.7 }, // 불꽃 끝 (+z)
    { index: 8, pos: [-0.6, -0.75, 0.2], size: 0.5 }, // 좌 불혀
    { index: 9, pos: [0.65, -0.4, 0.2], size: 0.5 }, // 우 불혀
    { index: 10, pos: [-0.55, 2.0, 0], size: 0.65 }, // 구름
    { index: 11, pos: [0, 2.25, 0.05], size: 0.7 },
    { index: 12, pos: [0.6, 2.0, 0], size: 0.65 },
    { index: 13, pos: [0.55, 1.1, 0.25], size: 0.45 }, // 불티
    { index: 14, pos: [-0.5, 1.5, 0.2], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [3, 8],
    [5, 9],
    [10, 11],
    [11, 12],
    [7, 11],
  ],
};

/** 레위기 = 번제단(1장). 사다리꼴 제단과 네 뿔, 위로 감아 오르는 향연기 나선(+z). */
export const LEVITICUS_CONSTELLATION: ConstellationConfig = {
  bookNo: 3,
  bookName: "레위기",
  symbol: FlameKindling,
  symbolLabel: "번제단",
  phrase: {
    ref: "레위기 19:2",
    text: "너희는 거룩하라 이는 나 여호와 너희 하나님이 거룩함이니라",
  },
  anchors: [
    { index: 1, pos: [-1.0, -2.0, 0], size: 0.7 }, // 제단 하단
    { index: 2, pos: [1.0, -2.0, 0], size: 0.7 },
    { index: 3, pos: [-0.7, -0.9, 0], size: 0.65 }, // 제단 상단
    { index: 4, pos: [0.7, -0.9, 0], size: 0.65 },
    { index: 5, pos: [-0.85, -0.55, 0.1], size: 0.55 }, // 앞 두 뿔
    { index: 6, pos: [0.85, -0.55, 0.1], size: 0.55 },
    { index: 7, pos: [-0.5, -0.7, -0.2], size: 0.45 }, // 뒤 두 뿔 (-z)
    { index: 8, pos: [0.5, -0.7, -0.2], size: 0.45 },
    { index: 9, pos: [0, -0.5, 0.15], size: 0.8 }, // 제단 불
    { index: 10, pos: [0.15, 0.3, 0.25], size: 0.55 }, // 향연기 나선 (+z)
    { index: 11, pos: [-0.2, 1.0, 0.35], size: 0.55 },
    { index: 12, pos: [0.15, 1.7, 0.45], size: 0.55 },
    { index: 13, pos: [-0.1, 2.3, 0.5], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [3, 5],
    [4, 6],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
  ],
};

/** 민수기 = 광야의 구불길. S자로 굽이치는 길이 위의 큰 별(약속의 땅)에 닿고, 굽이 옆에 진영 별들. */
export const NUMBERS_CONSTELLATION: ConstellationConfig = {
  bookNo: 4,
  bookName: "민수기",
  symbol: Route,
  symbolLabel: "광야의 길",
  phrase: {
    ref: "민수기 6:24",
    text: "여호와는 네게 복을 주시고 너를 지키시기를 원하며",
  },
  anchors: [
    { index: 1, pos: [-0.7, -2.2, 0], size: 0.7 }, // 출애굽 시작점
    { index: 2, pos: [0.2, -1.8, 0.05], size: 0.5 },
    { index: 3, pos: [0.75, -1.2, 0.05], size: 0.55 },
    { index: 4, pos: [0.3, -0.6, 0.1], size: 0.5 },
    { index: 5, pos: [-0.5, -0.2, 0.1], size: 0.55 },
    { index: 6, pos: [-0.75, 0.5, 0.15], size: 0.5 },
    { index: 7, pos: [-0.2, 1.0, 0.15], size: 0.55 },
    { index: 8, pos: [0.5, 1.4, 0.2], size: 0.5 },
    { index: 9, pos: [0.15, 2.2, 0.25], size: 0.95 }, // 약속의 땅 별
    { index: 10, pos: [-1.05, -1.6, 0], size: 0.45 }, // 진영 별
    { index: 11, pos: [1.1, -0.6, 0], size: 0.45 },
    { index: 12, pos: [-1.1, 1.1, 0], size: 0.45 },
    { index: 13, pos: [0.9, 0.6, 0.3], size: 0.5 }, // 동행하는 구름 기둥
    { index: 14, pos: [0.8, 2.0, 0.2], size: 0.45 },
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
    [13, 14],
  ],
};

/** 신명기 = 두 돌판(쉐마). 위가 둥근 두 돌판 — 우판을 +z로 살짝 젖혀 펼쳐 든 모양. */
export const DEUTERONOMY_CONSTELLATION: ConstellationConfig = {
  bookNo: 5,
  bookName: "신명기",
  symbol: ScrollText,
  symbolLabel: "두 돌판",
  phrase: {
    ref: "신명기 6:5",
    text: "너는 마음을 다하고 뜻을 다하고 힘을 다하여 네 하나님 여호와를 사랑하라",
  },
  anchors: [
    { index: 1, pos: [-1.0, -1.4, -0.05], size: 0.65 }, // 좌판 (살짝 -z)
    { index: 2, pos: [-0.15, -1.4, -0.05], size: 0.6 },
    { index: 3, pos: [-1.0, 0.9, -0.05], size: 0.65 },
    { index: 4, pos: [-0.15, 0.9, -0.05], size: 0.6 },
    { index: 5, pos: [-0.57, 1.4, -0.05], size: 0.7 }, // 좌판 아치 정점
    { index: 6, pos: [0.15, -1.35, 0.15], size: 0.6 }, // 우판 (+z 젖힘)
    { index: 7, pos: [1.0, -1.35, 0.1], size: 0.65 },
    { index: 8, pos: [0.15, 0.95, 0.2], size: 0.6 },
    { index: 9, pos: [1.0, 0.95, 0.15], size: 0.65 },
    { index: 10, pos: [0.57, 1.45, 0.2], size: 0.7 }, // 우판 아치 정점
    { index: 11, pos: [-0.57, 0.1, 0], size: 0.5 }, // 좌판 글줄 별
    { index: 12, pos: [-0.57, -0.6, 0], size: 0.5 },
    { index: 13, pos: [0.57, 0.15, 0.2], size: 0.5 }, // 우판 글줄 별
    { index: 14, pos: [0.57, -0.55, 0.2], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [3, 5],
    [5, 4],
    [4, 2],
    [6, 7],
    [6, 8],
    [8, 10],
    [10, 9],
    [9, 7],
  ],
};

/** 사무엘상 = 물매와 다섯 돌(17장). 크게 감아 도는 물매 궤적 끝에서 돌 하나가 날아가고(+z), 아래에 남은 돌들. */
export const SAMUEL1_CONSTELLATION: ConstellationConfig = {
  bookNo: 9,
  bookName: "사무엘상",
  symbol: Target,
  symbolLabel: "물매와 다섯 돌",
  phrase: {
    ref: "사무엘상 16:7",
    text: "사람은 외모를 보거니와 나 여호와는 중심을 보느니라",
  },
  anchors: [
    { index: 1, pos: [-0.9, -1.6, 0], size: 0.6 }, // 물매 궤적
    { index: 2, pos: [-1.1, -0.6, 0.05], size: 0.55 },
    { index: 3, pos: [-0.85, 0.4, 0.1], size: 0.55 },
    { index: 4, pos: [-0.25, 1.1, 0.15], size: 0.6 },
    { index: 5, pos: [0.5, 1.35, 0.2], size: 0.6 },
    { index: 6, pos: [1.05, 0.9, 0.3], size: 0.65 }, // 궤적 끝
    { index: 7, pos: [1.15, 1.6, 0.5], size: 0.8 }, // 날아가는 돌 (+z)
    { index: 8, pos: [-0.5, -2.1, 0.1], size: 0.55 }, // 남은 매끄러운 돌들
    { index: 9, pos: [-0.1, -2.2, 0.12], size: 0.55 },
    { index: 10, pos: [0.3, -2.1, 0.14], size: 0.55 },
    { index: 11, pos: [0.65, -1.95, 0.1], size: 0.55 },
    { index: 12, pos: [0.95, 0.55, 0.25], size: 0.5 }, // 물매 주머니
    { index: 13, pos: [-0.55, -1.95, 0], size: 0.6 }, // 물매 손잡이
  ],
  edges: [
    [13, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 12],
    [12, 7],
  ],
};

/** 열왕기하 = 불병거(2:11, 6:17). 두 바퀴(앞바퀴 +z 원근)와 위로 날리는 불꽃 갈기. */
export const KINGS2_CONSTELLATION: ConstellationConfig = {
  bookNo: 12,
  bookName: "열왕기하",
  symbol: Zap,
  symbolLabel: "불병거",
  phrase: {
    ref: "열왕기하 6:16",
    text: "두려워하지 말라 우리와 함께 한 자가 그들과 함께 한 자보다 많으니라",
  },
  anchors: [
    { index: 1, pos: [-0.55, -1.2, 0], size: 0.7 }, // 뒷바퀴 축
    { index: 2, pos: [-1.0, -1.0, 0], size: 0.5 }, // 뒷바퀴 테
    { index: 3, pos: [-0.55, -0.75, 0], size: 0.5 },
    { index: 4, pos: [-0.1, -1.05, 0], size: 0.5 },
    { index: 5, pos: [-0.6, -1.7, 0], size: 0.5 },
    { index: 6, pos: [0.6, -1.1, 0.35], size: 0.75 }, // 앞바퀴 축 (+z 원근)
    { index: 7, pos: [0.95, -0.75, 0.4], size: 0.5 }, // 앞바퀴 테
    { index: 8, pos: [0.25, -0.7, 0.4], size: 0.5 },
    { index: 9, pos: [-0.7, -0.3, 0.05], size: 0.6 }, // 수레 몸체
    { index: 10, pos: [0.5, -0.15, 0.15], size: 0.6 },
    { index: 11, pos: [-0.3, 0.5, 0.1], size: 0.6 }, // 불꽃 갈기
    { index: 12, pos: [0.3, 0.9, 0.15], size: 0.65 },
    { index: 13, pos: [-0.1, 1.5, 0.2], size: 0.7 },
    { index: 14, pos: [0.4, 2.1, 0.25], size: 0.6 },
  ],
  edges: [
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 2],
    [1, 3],
    [6, 7],
    [7, 8],
    [8, 6],
    [3, 9],
    [9, 10],
    [10, 8],
    [9, 11],
    [11, 12],
    [12, 13],
    [13, 14],
  ],
};

/** 역대상 = 언약궤(13~16장). 궤와 채, 속죄소 위에서 마주 닿는 그룹 날개(끝 +z), 그 위 임재의 빛. */
export const CHRONICLES1_CONSTELLATION: ConstellationConfig = {
  bookNo: 13,
  bookName: "역대상",
  symbol: Archive,
  symbolLabel: "언약궤",
  phrase: {
    ref: "역대상 16:34",
    text: "여호와께 감사하라 그는 선하시며 그의 인자하심이 영원함이로다",
  },
  anchors: [
    { index: 1, pos: [-0.8, -1.3, 0], size: 0.65 }, // 궤 몸체
    { index: 2, pos: [0.8, -1.3, 0], size: 0.65 },
    { index: 3, pos: [-0.8, -0.4, 0], size: 0.6 },
    { index: 4, pos: [0.8, -0.4, 0], size: 0.6 },
    { index: 5, pos: [-1.2, -1.05, 0.15], size: 0.5 }, // 좌 채(운반 막대)
    { index: 6, pos: [1.2, -1.05, 0.15], size: 0.5 }, // 우 채
    { index: 7, pos: [0, -0.3, 0.1], size: 0.6 }, // 속죄소
    { index: 8, pos: [-0.5, 0.2, 0.05], size: 0.6 }, // 좌 그룹 날개 죽지
    { index: 9, pos: [-0.9, 0.9, 0.25], size: 0.7 }, // 좌 날개 끝 (+z)
    { index: 10, pos: [0.5, 0.2, 0.05], size: 0.6 }, // 우 그룹 날개 죽지
    { index: 11, pos: [0.9, 0.95, 0.25], size: 0.7 }, // 우 날개 끝 (+z)
    { index: 12, pos: [0, 0.9, 0.15], size: 0.65 }, // 마주 닿는 날개
    { index: 13, pos: [0, 1.7, 0.2], size: 0.8 }, // 임재의 빛
    { index: 14, pos: [0, 2.3, 0.2], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 7],
    [7, 4],
    [5, 1],
    [2, 6],
    [7, 8],
    [8, 9],
    [9, 12],
    [7, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 14],
  ],
};

/** 역대하 = 성전에 임한 영광 구름(7:1-3). 작은 성전 위를 덮는 큰 구름과 내려오는 불 광선. */
export const CHRONICLES2_CONSTELLATION: ConstellationConfig = {
  bookNo: 14,
  bookName: "역대하",
  symbol: CloudSun,
  symbolLabel: "영광의 구름",
  phrase: {
    ref: "역대하 7:14",
    text: "스스로 낮추고 기도하여 내 얼굴을 찾으면 내가 하늘에서 듣고 그들의 죄를 사하고 그들의 땅을 고칠지라",
  },
  anchors: [
    { index: 1, pos: [-0.7, -2.1, 0], size: 0.6 }, // 성전 실루엣
    { index: 2, pos: [0.7, -2.1, 0], size: 0.6 },
    { index: 3, pos: [-0.7, -1.4, 0], size: 0.55 },
    { index: 4, pos: [0.7, -1.4, 0], size: 0.55 },
    { index: 5, pos: [0, -1.0, 0.05], size: 0.65 }, // 성전 지붕
    { index: 6, pos: [-0.95, 0.6, 0], size: 0.7 }, // 큰 구름
    { index: 7, pos: [-0.35, 0.95, 0.1], size: 0.8 },
    { index: 8, pos: [0.3, 1.0, 0.05], size: 0.8 },
    { index: 9, pos: [0.9, 0.65, 0], size: 0.7 },
    { index: 10, pos: [0, 0.45, 0.15], size: 0.65 }, // 구름 배
    { index: 11, pos: [-0.45, -0.3, 0.2], size: 0.55 }, // 내려오는 불 광선
    { index: 12, pos: [0, -0.45, 0.25], size: 0.6 },
    { index: 13, pos: [0.45, -0.35, 0.2], size: 0.55 },
    { index: 14, pos: [0, 1.8, 0.1], size: 0.75 }, // 구름 위 영광 별
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [6, 10],
    [10, 9],
    [10, 12],
    [12, 5],
    [7, 11],
    [8, 13],
    [8, 14],
  ],
};

/** 욥기 = 묘성(플레이아데스, 38:31). 실제 성단 배치를 본뜬 별무리와 그 둘레의 폭풍 자락 — 밤하늘 기능과 가장 직결되는 경전. */
export const JOB_CONSTELLATION: ConstellationConfig = {
  bookNo: 18,
  bookName: "욥기",
  symbol: Sparkle,
  symbolLabel: "묘성",
  phrase: {
    ref: "욥기 38:31",
    text: "네가 묘성을 매어 묶을 수 있으며 삼성의 띠를 풀 수 있겠느냐",
  },
  anchors: [
    // 플레이아데스 실측 배치 근사 (알키오네가 중심)
    { index: 1, pos: [0.15, 0.35, 0], size: 0.85 }, // 알키오네
    { index: 2, pos: [0.9, -0.3, 0], size: 0.7 }, // 아틀라스
    { index: 3, pos: [0.95, -0.05, 0.05], size: 0.5 }, // 플레이오네
    { index: 4, pos: [-0.25, -0.4, 0], size: 0.65 }, // 메로페
    { index: 5, pos: [-0.8, -0.05, 0], size: 0.65 }, // 엘렉트라
    { index: 6, pos: [-0.8, 0.5, 0], size: 0.45 }, // 켈라이노
    { index: 7, pos: [-0.9, 1.0, 0], size: 0.6 }, // 타이게타
    { index: 8, pos: [-0.3, 1.0, 0], size: 0.65 }, // 마이아
    { index: 9, pos: [-0.5, 1.45, 0], size: 0.45 }, // 아스테로페
    { index: 10, pos: [1.1, 1.4, 0.3], size: 0.5 }, // 폭풍 자락 (둘레)
    { index: 11, pos: [0.2, 1.9, 0.35], size: 0.5 },
    { index: 12, pos: [-1.0, 1.5, 0.3], size: 0.5 },
    { index: 13, pos: [-1.15, -1.5, 0.25], size: 0.45 },
    { index: 14, pos: [0.9, -1.8, 0.25], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [1, 8],
    [8, 7],
    [8, 9],
    [10, 11],
    [11, 12],
    [13, 14],
  ],
};

/** 시편 = 다윗의 수금(리라). 울림통에서 두 팔이 위로 벌어져 가로대에서 만나고, 그 사이 현이 걸린다. */
export const PSALMS_CONSTELLATION: ConstellationConfig = {
  bookNo: 19,
  bookName: "시편",
  symbol: Music,
  symbolLabel: "다윗의 수금",
  phrase: {
    ref: "시편 23:1",
    text: "여호와는 나의 목자시니 내게 부족함이 없으리로다",
  },
  anchors: [
    { index: 1, pos: [-0.5, -2.0, 0], size: 0.7 }, // 울림통
    { index: 2, pos: [0.5, -2.0, 0], size: 0.7 },
    { index: 3, pos: [0, -2.3, 0.05], size: 0.6 },
    { index: 4, pos: [-0.7, -1.2, 0], size: 0.6 }, // 좌 팔
    { index: 5, pos: [-0.85, -0.3, 0.05], size: 0.6 },
    { index: 6, pos: [-0.8, 0.7, 0.1], size: 0.65 },
    { index: 7, pos: [-0.6, 1.5, 0.1], size: 0.7 },
    { index: 8, pos: [0.7, -1.2, 0.1], size: 0.6 }, // 우 팔 (+z)
    { index: 9, pos: [0.85, -0.3, 0.2], size: 0.6 },
    { index: 10, pos: [0.8, 0.7, 0.25], size: 0.65 },
    { index: 11, pos: [0.6, 1.5, 0.3], size: 0.7 },
    { index: 12, pos: [0, 1.7, 0.2], size: 0.65 }, // 가로대
    { index: 13, pos: [-0.25, 0.2, 0.1], size: 0.45 }, // 현 위의 별
    { index: 14, pos: [0.25, 0.25, 0.15], size: 0.45 },
    { index: 15, pos: [0, 2.3, 0.2], size: 0.6 }, // 다윗의 별
    { index: 16, pos: [0, -1.5, 0.05], size: 0.5 }, // 울림 구멍
  ],
  edges: [
    [1, 3],
    [3, 2],
    [1, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 12],
    [2, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 16],
    [12, 14],
    [14, 16],
    [12, 15],
  ],
};

/** 잠언 = 지혜의 등불(6:23). 기름 등잔의 불꽃에서 위로 퍼지는 빛 — 명령은 등불이요 법은 빛이라. */
export const PROVERBS_CONSTELLATION: ConstellationConfig = {
  bookNo: 20,
  bookName: "잠언",
  symbol: Lamp,
  symbolLabel: "지혜의 등불",
  phrase: {
    ref: "잠언 3:5",
    text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라",
  },
  anchors: [
    { index: 1, pos: [-0.6, -2.0, 0], size: 0.6 }, // 받침
    { index: 2, pos: [0.6, -2.0, 0], size: 0.6 },
    { index: 3, pos: [0, -1.7, 0.05], size: 0.6 },
    { index: 4, pos: [-0.7, -1.1, 0], size: 0.65 }, // 등잔 몸통
    { index: 5, pos: [0.7, -1.1, 0], size: 0.65 },
    { index: 6, pos: [1.0, -0.85, 0.1], size: 0.6 }, // 부리
    { index: 7, pos: [1.05, -0.3, 0.15], size: 0.85 }, // 불꽃
    { index: 8, pos: [0.5, 0.5, 0.25], size: 0.55 }, // 퍼지는 빛 (+z)
    { index: 9, pos: [0.9, 1.2, 0.3], size: 0.5 },
    { index: 10, pos: [0.1, 1.3, 0.3], size: 0.55 },
    { index: 11, pos: [-0.4, 2.0, 0.35], size: 0.5 },
    { index: 12, pos: [0.6, 2.1, 0.35], size: 0.5 },
    { index: 13, pos: [-1.0, -0.7, 0], size: 0.5 }, // 손잡이 고리
  ],
  edges: [
    [1, 3],
    [3, 2],
    [4, 3],
    [3, 5],
    [5, 6],
    [4, 13],
    [6, 7],
    [7, 8],
    [8, 10],
    [10, 11],
    [7, 9],
    [9, 12],
  ],
};

/** 이사야 = 날개 치며 오르는 독수리(40:31). 위로 비상하는 몸통과 크게 편 두 날개(한쪽 +z 선회). */
export const ISAIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 23,
  bookName: "이사야",
  symbol: Bird,
  symbolLabel: "비상하는 독수리",
  phrase: {
    ref: "이사야 40:31",
    text: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요",
  },
  anchors: [
    { index: 1, pos: [0, -1.9, 0], size: 0.65 }, // 꼬리
    { index: 2, pos: [0, -1.0, 0.05], size: 0.7 }, // 몸통
    { index: 3, pos: [0, -0.1, 0.1], size: 0.75 }, // 가슴
    { index: 4, pos: [0.15, 0.7, 0.15], size: 0.7 }, // 머리
    { index: 5, pos: [0.35, 1.0, 0.15], size: 0.5 }, // 부리
    { index: 6, pos: [-0.5, 0.3, 0], size: 0.65 }, // 좌 날개 죽지 (-z 젖힘)
    { index: 7, pos: [-1.0, 0.8, -0.15], size: 0.6 },
    { index: 8, pos: [-1.2, 1.4, -0.25], size: 0.65 }, // 좌 끝깃
    { index: 9, pos: [-0.85, 1.5, -0.2], size: 0.5 },
    { index: 10, pos: [0.55, 0.35, 0.2], size: 0.65 }, // 우 날개 죽지 (+z)
    { index: 11, pos: [1.0, 0.9, 0.35], size: 0.6 },
    { index: 12, pos: [1.15, 1.5, 0.45], size: 0.65 }, // 우 끝깃
    { index: 13, pos: [0.8, 1.6, 0.4], size: 0.5 },
    { index: 14, pos: [-0.3, -2.2, 0], size: 0.5 }, // 꼬리깃
    { index: 15, pos: [0.3, -2.25, 0], size: 0.5 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [3, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [3, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [1, 14],
    [1, 15],
  ],
};

/** 예레미야 = 토기장이의 물레(18장). 도는 원반 위에 빚어지는(한쪽이 일그러진) 그릇과 토기장이의 손(+z). */
export const JEREMIAH_CONSTELLATION: ConstellationConfig = {
  bookNo: 24,
  bookName: "예레미야",
  symbol: Amphora,
  symbolLabel: "토기장이의 물레",
  phrase: {
    ref: "예레미야 29:11",
    text: "너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라",
  },
  anchors: [
    { index: 1, pos: [-0.9, -1.6, 0], size: 0.6 }, // 물레 원반
    { index: 2, pos: [0, -1.9, 0.1], size: 0.65 },
    { index: 3, pos: [0.9, -1.6, 0], size: 0.6 },
    { index: 4, pos: [0, -1.3, 0.05], size: 0.55 }, // 원반 뒤
    { index: 5, pos: [-0.45, -1.0, 0.05], size: 0.55 }, // 그릇 바닥
    { index: 6, pos: [0.45, -1.0, 0.05], size: 0.55 },
    { index: 7, pos: [-0.6, -0.2, 0.05], size: 0.6 }, // 그릇 몸통
    { index: 8, pos: [0.6, -0.15, 0.05], size: 0.6 },
    { index: 9, pos: [-0.3, 0.5, 0.05], size: 0.55 }, // 목
    { index: 10, pos: [0.5, 0.6, 0.1], size: 0.6 }, // 일그러진 쪽
    { index: 11, pos: [0.05, 0.9, 0.1], size: 0.6 }, // 입구
    { index: 12, pos: [0.8, 0.15, 0.35], size: 0.65 }, // 토기장이의 손 (+z)
    { index: 13, pos: [-0.75, 0.3, 0.3], size: 0.6 },
    { index: 14, pos: [0, 1.8, 0.2], size: 0.75 }, // 새로 지으시는 소망의 별
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 1],
    [5, 6],
    [5, 7],
    [6, 8],
    [7, 9],
    [8, 10],
    [9, 11],
    [10, 11],
    [11, 14],
  ],
};

/** 에스겔 = 바퀴 안의 바퀴(1장). 직교하며 맞물린 두 원환 — 회전 시 가장 극적인 3D. */
export const EZEKIEL_CONSTELLATION: ConstellationConfig = {
  bookNo: 26,
  bookName: "에스겔",
  symbol: Orbit,
  symbolLabel: "바퀴 안의 바퀴",
  phrase: {
    ref: "에스겔 36:26",
    text: "새 영을 너희 속에 두고 새 마음을 너희에게 주되",
  },
  anchors: [
    { index: 1, pos: [0, 1.6, 0], size: 0.7 }, // 정면 원환 (z=0)
    { index: 2, pos: [0.81, 1.13, 0], size: 0.55 },
    { index: 3, pos: [1.15, 0, 0], size: 0.7 },
    { index: 4, pos: [0.81, -1.13, 0], size: 0.55 },
    { index: 5, pos: [0, -1.6, 0], size: 0.7 },
    { index: 6, pos: [-0.81, -1.13, 0], size: 0.55 },
    { index: 7, pos: [-1.15, 0, 0], size: 0.7 },
    { index: 8, pos: [-0.81, 1.13, 0], size: 0.55 },
    { index: 9, pos: [0, 1.13, 0.64], size: 0.55 }, // 직교 원환 (yz 평면)
    { index: 10, pos: [0, 0, 0.9], size: 0.7 },
    { index: 11, pos: [0, -1.13, 0.64], size: 0.55 },
    { index: 12, pos: [0, -1.13, -0.64], size: 0.55 },
    { index: 13, pos: [0, 0, -0.9], size: 0.7 },
    { index: 14, pos: [0, 1.13, -0.64], size: 0.55 },
    { index: 15, pos: [0.6, 0.6, 0.5], size: 0.45 }, // 둘레의 눈
    { index: 16, pos: [-0.55, -0.65, -0.45], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 1],
    [1, 9],
    [9, 10],
    [10, 11],
    [11, 5],
    [5, 12],
    [12, 13],
    [13, 14],
    [14, 1],
  ],
};

/** 마태복음 = 동방의 별(2:2). 긴 꼬리 광선이 베들레헴 지붕까지 내려오고, 동방박사 별 셋이 따라온다(+z). */
export const MATTHEW_CONSTELLATION: ConstellationConfig = {
  bookNo: 40,
  bookName: "마태복음",
  symbol: Star,
  symbolLabel: "동방의 별",
  phrase: {
    ref: "마태복음 11:28",
    text: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
  },
  anchors: [
    { index: 1, pos: [0, 1.7, 0.2], size: 1.0 }, // 큰 별
    { index: 2, pos: [-0.6, 1.7, 0.15], size: 0.5 }, // 십자 광선
    { index: 3, pos: [0.6, 1.7, 0.15], size: 0.5 },
    { index: 4, pos: [0, 2.3, 0.2], size: 0.55 },
    { index: 5, pos: [0.15, 1.0, 0.15], size: 0.5 }, // 긴 꼬리 광선
    { index: 6, pos: [0.3, 0.2, 0.1], size: 0.5 },
    { index: 7, pos: [0.45, -0.6, 0.05], size: 0.5 },
    { index: 8, pos: [0.6, -1.4, 0], size: 0.55 },
    { index: 9, pos: [-0.9, -1.3, 0.3], size: 0.6 }, // 동방박사 별 (+z)
    { index: 10, pos: [-0.55, -1.6, 0.35], size: 0.55 },
    { index: 11, pos: [-0.15, -1.85, 0.4], size: 0.5 },
    { index: 12, pos: [0.35, -1.9, 0], size: 0.55 }, // 베들레헴 지붕
    { index: 13, pos: [0.85, -1.75, 0], size: 0.55 },
    { index: 14, pos: [1.1, -2.1, 0], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [9, 10],
    [10, 11],
    [12, 13],
    [13, 14],
    [8, 13],
  ],
};

/** 사도행전 = 땅끝으로 퍼지는 빛(1:8). 예루살렘 한 점에서 위로 부챗살처럼 퍼지는 다섯 빛줄기. */
export const ACTS_CONSTELLATION: ConstellationConfig = {
  bookNo: 44,
  bookName: "사도행전",
  symbol: Globe,
  symbolLabel: "땅끝으로 퍼지는 빛",
  phrase: {
    ref: "사도행전 1:8",
    text: "오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라",
  },
  anchors: [
    { index: 1, pos: [0, -2.1, 0.1], size: 0.85 }, // 예루살렘
    { index: 2, pos: [-0.9, -1.0, 0], size: 0.5 }, // 부챗살 (좌외)
    { index: 3, pos: [-1.15, 0.3, -0.1], size: 0.65 },
    { index: 4, pos: [-0.45, -0.8, 0.1], size: 0.5 }, // 좌중
    { index: 5, pos: [-0.6, 0.9, 0.15], size: 0.65 },
    { index: 6, pos: [0, -0.7, 0.2], size: 0.55 }, // 중앙
    { index: 7, pos: [0, 1.3, 0.3], size: 0.75 },
    { index: 8, pos: [0.45, -0.8, 0.1], size: 0.5 }, // 우중
    { index: 9, pos: [0.6, 0.9, 0.15], size: 0.65 },
    { index: 10, pos: [0.9, -1.0, 0], size: 0.5 }, // 우외
    { index: 11, pos: [1.15, 0.3, -0.1], size: 0.65 },
    { index: 12, pos: [0, -1.5, 0.25], size: 0.6 }, // 성령의 불
    { index: 13, pos: [0.15, 2.1, 0.25], size: 0.5 }, // 땅끝 별
    { index: 14, pos: [-0.85, 1.6, 0.1], size: 0.45 },
    { index: 15, pos: [0.95, 1.5, 0.1], size: 0.45 },
  ],
  edges: [
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [1, 6],
    [6, 7],
    [1, 8],
    [8, 9],
    [1, 10],
    [10, 11],
    [1, 12],
    [7, 13],
    [5, 14],
    [9, 15],
  ],
};

/** bookNo → 별자리 config (정경 순서). 66권 전체. */
export const CONSTELLATIONS: Record<number, ConstellationConfig> = {
  1: GENESIS_CONSTELLATION,
  2: EXODUS_CONSTELLATION,
  3: LEVITICUS_CONSTELLATION,
  4: NUMBERS_CONSTELLATION,
  5: DEUTERONOMY_CONSTELLATION,
  6: JOSHUA_CONSTELLATION,
  7: JUDGES_CONSTELLATION,
  8: RUTH_CONSTELLATION,
  9: SAMUEL1_CONSTELLATION,
  10: SAMUEL2_CONSTELLATION,
  11: KINGS1_CONSTELLATION,
  12: KINGS2_CONSTELLATION,
  13: CHRONICLES1_CONSTELLATION,
  14: CHRONICLES2_CONSTELLATION,
  15: EZRA_CONSTELLATION,
  16: NEHEMIAH_CONSTELLATION,
  17: ESTHER_CONSTELLATION,
  18: JOB_CONSTELLATION,
  19: PSALMS_CONSTELLATION,
  20: PROVERBS_CONSTELLATION,
  21: ECCLESIASTES_CONSTELLATION,
  22: SONG_CONSTELLATION,
  23: ISAIAH_CONSTELLATION,
  24: JEREMIAH_CONSTELLATION,
  25: LAMENTATIONS_CONSTELLATION,
  26: EZEKIEL_CONSTELLATION,
  27: DANIEL_CONSTELLATION,
  28: HOSEA_CONSTELLATION,
  29: JOEL_CONSTELLATION,
  30: AMOS_CONSTELLATION,
  31: OBADIAH_CONSTELLATION,
  32: JONAH_CONSTELLATION,
  33: MICAH_CONSTELLATION,
  34: NAHUM_CONSTELLATION,
  35: HABAKKUK_CONSTELLATION,
  36: ZEPHANIAH_CONSTELLATION,
  37: HAGGAI_CONSTELLATION,
  38: ZECHARIAH_CONSTELLATION,
  39: MALACHI_CONSTELLATION,
  40: MATTHEW_CONSTELLATION,
  41: MARK_CONSTELLATION,
  42: LUKE_CONSTELLATION,
  43: JOHN_CONSTELLATION,
  44: ACTS_CONSTELLATION,
  45: ROMANS_CONSTELLATION,
  46: CORINTHIANS1_CONSTELLATION,
  47: CORINTHIANS2_CONSTELLATION,
  48: GALATIANS_CONSTELLATION,
  49: EPHESIANS_CONSTELLATION,
  50: PHILIPPIANS_CONSTELLATION,
  51: COLOSSIANS_CONSTELLATION,
  52: THESSALONIANS1_CONSTELLATION,
  53: THESSALONIANS2_CONSTELLATION,
  54: TIMOTHY1_CONSTELLATION,
  55: TIMOTHY2_CONSTELLATION,
  56: TITUS_CONSTELLATION,
  57: PHILEMON_CONSTELLATION,
  58: HEBREWS_CONSTELLATION,
  59: JAMES_CONSTELLATION,
  60: PETER1_CONSTELLATION,
  61: PETER2_CONSTELLATION,
  62: JOHN1_CONSTELLATION,
  63: JOHN2_CONSTELLATION,
  64: JOHN3_CONSTELLATION,
  65: JUDE_CONSTELLATION,
  66: REVELATION_CONSTELLATION,
};

/** 해당 경전의 별자리 config. 없으면 null(밤하늘 "준비 중"). */
export function getConstellation(bookNo: number): ConstellationConfig | null {
  return CONSTELLATIONS[bookNo] ?? null;
}
