import { describe, expect, it } from "vitest";

import { BOOK_GENRES } from "../../../data/bookGenres";
import {
  GALAXY_RADIUS,
  GALAXY_STARS,
  GENRE_ARM_CENTERS,
  starCountOf,
  starLitLevels,
} from "./galaxy";

describe("GALAXY_STARS", () => {
  it("66권이 모두 성단을 갖는다", () => {
    const books = new Set(GALAXY_STARS.map((star) => star.bookNo));
    expect(books.size).toBe(66);
  });

  it("성단 크기는 절 수에 비례한다(시편 > 오바댜)", () => {
    expect(starCountOf(19)).toBeGreaterThan(starCountOf(31));
    expect(starCountOf(63)).toBeGreaterThanOrEqual(3); // 요한이서(13절)도 성단으로 보인다
  });

  it("slot은 권마다 0부터 연속이고 slotCount와 일치한다", () => {
    const slotsByBook = new Map<number, number[]>();
    for (const star of GALAXY_STARS) {
      const slots = slotsByBook.get(star.bookNo) ?? [];
      slots.push(star.slot);
      slotsByBook.set(star.bookNo, slots);
    }

    for (const [bookNo, slots] of slotsByBook) {
      const expected = starCountOf(bookNo);
      expect(slots).toHaveLength(expected);
      expect([...slots].sort((a, b) => a - b)).toEqual(
        Array.from({ length: expected }, (_, i) => i),
      );
      expect(
        GALAXY_STARS.filter((s) => s.bookNo === bookNo).every((s) => s.slotCount === expected),
      ).toBe(true);
    }
  });

  it("좌표가 씬 좌표계 안에 있고 GALAXY_RADIUS가 가장 바깥 별과 맞는다", () => {
    for (const { pos } of GALAXY_STARS) {
      expect(Math.hypot(pos[0], pos[1])).toBeLessThanOrEqual(GALAXY_RADIUS);
      expect(Math.abs(pos[2])).toBeLessThan(1.4);
    }
    expect(GALAXY_RADIUS).toBeGreaterThan(3);
    expect(GALAXY_RADIUS).toBeLessThan(4.6);
  });

  it("평면이 아니라 두께를 가진 원반이다 — 중심 팽대부가 바깥 원반보다 두껍다", () => {
    const spread = (stars: typeof GALAXY_STARS) => {
      const zs = stars.map((star) => star.pos[2]);
      return Math.max(...zs) - Math.min(...zs);
    };
    const radiusOf = (star: (typeof GALAXY_STARS)[number]) => Math.hypot(star.pos[0], star.pos[1]);

    const inner = GALAXY_STARS.filter((star) => radiusOf(star) < 0.9);
    // 휨(warp)이 섞이지 않도록 바깥은 같은 방위각 대역만 본다.
    const outer = GALAXY_STARS.filter((star) => {
      const angle = Math.atan2(star.pos[1], star.pos[0]);
      return radiusOf(star) > 3 && Math.abs(angle - 0.9) < 0.3;
    });

    expect(inner.length).toBeGreaterThan(0);
    expect(outer.length).toBeGreaterThan(0);
    expect(spread(inner)).toBeGreaterThan(0.4);
    expect(spread(inner)).toBeGreaterThan(spread(outer));
  });

  it("팔은 장르마다 하나씩", () => {
    expect(GENRE_ARM_CENTERS).toHaveLength(BOOK_GENRES.length);
    expect(GENRE_ARM_CENTERS.map((arm) => arm.genre)).toEqual(BOOK_GENRES.map((g) => g.code));
  });
});

describe("starLitLevels", () => {
  const NONE = new Array<number>(66).fill(0);

  it("진행도가 없으면 전부 꺼짐", () => {
    const levels = starLitLevels(NONE);
    expect(levels).toHaveLength(GALAXY_STARS.length);
    expect([...levels].every((level) => level === 0)).toBe(true);
  });

  it("완필이면 전부 점등", () => {
    const levels = starLitLevels(new Array<number>(66).fill(1));
    expect([...levels].every((level) => level === 1)).toBe(true);
  });

  it("한 권 안에서 앞 slot부터 채우고 경계 별만 부분 점등", () => {
    // 요한이서(bookNo 63)는 최소 크기 성단 — 별 개수의 2.5/N만큼 채우면
    // 앞의 두 별은 완전 점등, 세 번째 별이 절반만 켜진다.
    const slotCount = starCountOf(63);
    const fractions = [...NONE];
    fractions[62] = 2.5 / slotCount;

    const levels = starLitLevels(fractions);
    const bySlot = GALAXY_STARS.map((star, i) => ({ star, level: levels[i] }))
      .filter(({ star }) => star.bookNo === 63)
      .sort((a, b) => a.star.slot - b.star.slot)
      .map((s) => s.level);

    expect(bySlot[0]).toBe(1);
    expect(bySlot[1]).toBe(1);
    expect(bySlot[2]).toBeCloseTo(0.5);
    expect(bySlot[3]).toBe(0);
  });

  it("다른 권의 진행도는 서로 영향을 주지 않는다", () => {
    const fractions = [...NONE];
    fractions[0] = 1; // 창세기만 완필

    const levels = starLitLevels(fractions);
    const lit = GALAXY_STARS.filter((_, i) => levels[i] > 0);

    expect(lit.length).toBeGreaterThan(0);
    expect(lit.every((star) => star.bookNo === 1)).toBe(true);
  });
});
