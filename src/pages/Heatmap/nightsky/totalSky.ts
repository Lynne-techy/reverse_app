// 전체(66권) 밤하늘 — 성경 전체 진척을 100개 노드 점묘화 "말씀의 은하"로 보여준다.
// 별 하나 = 전체의 1%. 황금각 나선(피보나치 배치)이라 어느 진척률에서도 고르게 차 보이고,
// 필사가 진행되면 은하 중심(1번)부터 바깥으로 별이 점등된다.
// 개별 경전 별자리(constellations.ts)와 같은 ConstellationConfig 형태를 쓰므로
// NightSkyScene/ConstellationStars/NightSkyFallback을 그대로 재사용한다.

import { Orbit } from "lucide-react";

import type { EmotionCode } from "../../../data/emotions";
import type { AnchorNode, ConstellationConfig } from "./constellations";

export const TOTAL_ANCHOR_COUNT = 100;

/**
 * 결정적 의사난수(0~1) — 좌표 지터·별 크기용. Math.random 대신 해시를 써서
 * 리렌더·세션이 바뀌어도 은하 모양이 항상 같게 한다.
 */
function jitter(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈ 137.5°

function makeGalaxyAnchors(): AnchorNode[] {
  const anchors: AnchorNode[] = [];
  const RADIUS = 2.55; // 개별 별자리들과 같은 좌표계(±2.5 안팎)에 맞춘 은하 반경

  for (let i = 0; i < TOTAL_ANCHOR_COUNT; i++) {
    // sqrt 분포 → 면적 균등(안쪽 밀집 없이 고른 점묘). +0.5는 첫 별이 정중앙에 뭉치는 것 방지.
    const r = RADIUS * Math.sqrt((i + 0.5) / TOTAL_ANCHOR_COUNT);
    const theta = i * GOLDEN_ANGLE;

    anchors.push({
      index: i + 1,
      pos: [
        r * Math.cos(theta) + (jitter(i, 1) - 0.5) * 0.18,
        // y를 0.8배로 눌러 살짝 타원 은하 — 위아래 오버레이(캡션·문구)와 간섭을 줄인다.
        (r * Math.sin(theta) + (jitter(i, 2) - 0.5) * 0.18) * 0.8,
        (jitter(i, 3) - 0.5) * 1.2, // 회전 시 깊이감용 z 산포
      ],
      size: 0.45 + jitter(i, 4) * 0.45, // 점묘화 느낌의 크기 편차
    });
  }
  return anchors;
}

export const TOTAL_SKY_CONFIG: ConstellationConfig = {
  bookNo: 0, // 특정 경전이 아닌 전체 뷰 표식
  bookName: "성경 전체",
  symbol: Orbit,
  symbolLabel: "말씀의 은하",
  caption: "말씀의 은하 · 성경 전체",
  phrase: {
    ref: "시편 119:105",
    text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다",
  },
  anchors: makeGalaxyAnchors(),
  edges: [], // 점묘화 — 선 없이 점의 밀도로 형태를 만든다
};

/** 전체 뷰는 감정 보석 별 레이어를 쓰지 않는다(모두 무채색 별빛). */
export const TOTAL_SKY_EMOTIONS: (EmotionCode | null)[] = new Array<EmotionCode | null>(
  TOTAL_ANCHOR_COUNT,
).fill(null);

/**
 * 전체 진척률을 100개 노드의 개별 fraction(0~1)으로 전개 — 중심(1번)부터 차오른다.
 * 예: 3.4% → 1~3번 완전 점등 + 4번이 40% 밝기.
 */
export function totalFractions(covered: number, total: number, demo: boolean): number[] {
  const ratio = demo ? 1 : total > 0 ? Math.min(1, covered / total) : 0;
  const filled = ratio * TOTAL_ANCHOR_COUNT;

  return Array.from({ length: TOTAL_ANCHOR_COUNT }, (_, i) => Math.min(1, Math.max(0, filled - i)));
}
