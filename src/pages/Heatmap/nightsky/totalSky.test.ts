import { describe, expect, it } from "vitest";

import { formatPercent } from "./formatPercent";
import { TOTAL_ANCHOR_COUNT, TOTAL_SKY_CONFIG, totalFractions } from "./totalSky";

describe("totalFractions", () => {
  it("로딩 전(total=0)에는 전부 0", () => {
    const fractions = totalFractions(0, 0, false);
    expect(fractions).toHaveLength(TOTAL_ANCHOR_COUNT);
    expect(fractions.every((f) => f === 0)).toBe(true);
  });

  it("진척률만큼 중심부터 차오르고 경계 노드는 부분 점등", () => {
    // 3.4% → 노드 1~3 완전 점등, 4번이 0.4, 나머지 0
    const fractions = totalFractions(34, 1000, false);
    expect(fractions[0]).toBe(1);
    expect(fractions[2]).toBe(1);
    expect(fractions[3]).toBeCloseTo(0.4);
    expect(fractions[4]).toBe(0);
  });

  it("완필(covered=total)이면 전부 1", () => {
    expect(totalFractions(31088, 31088, false).every((f) => f === 1)).toBe(true);
  });

  it("demo면 데이터와 무관하게 전부 1", () => {
    expect(totalFractions(0, 0, true).every((f) => f === 1)).toBe(true);
  });

  it("covered가 total을 넘어도 1로 클램프", () => {
    expect(totalFractions(2000, 1000, false).every((f) => f === 1)).toBe(true);
  });
});

describe("TOTAL_SKY_CONFIG", () => {
  it("노드 100개, index는 1..100 연속", () => {
    expect(TOTAL_SKY_CONFIG.anchors).toHaveLength(TOTAL_ANCHOR_COUNT);
    TOTAL_SKY_CONFIG.anchors.forEach((a, i) => expect(a.index).toBe(i + 1));
  });

  it("좌표가 기존 별자리 좌표계(±2.8) 안에 있다", () => {
    for (const { pos } of TOTAL_SKY_CONFIG.anchors) {
      expect(Math.abs(pos[0])).toBeLessThan(2.8);
      expect(Math.abs(pos[1])).toBeLessThan(2.8);
    }
  });
});

describe("formatPercent", () => {
  it("0 또는 분모 없음 → '0'", () => {
    expect(formatPercent(0, 31088)).toBe("0");
    expect(formatPercent(5, 0)).toBe("0");
  });

  it("1% 미만은 소수를 살려 0%로 뭉개지 않는다", () => {
    expect(formatPercent(9, 31088)).toBe("0.03"); // 0.0289...
    expect(formatPercent(1, 31088)).toBe("0.01"); // 0.0032... → 표시상 최소
    expect(formatPercent(150, 31088)).toBe("0.5"); // 0.482...
  });

  it("1% 이상은 정수 반올림", () => {
    expect(formatPercent(340, 1000)).toBe("34");
  });

  it("미완인데 반올림으로 100이 되면 99로 고정", () => {
    expect(formatPercent(999, 1000)).toBe("99"); // 99.9 → round 100이지만 미완
    expect(formatPercent(1000, 1000)).toBe("100");
  });
});
