import { describe, expect, it } from "vitest";

import { formatPercent } from "./formatPercent";

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
