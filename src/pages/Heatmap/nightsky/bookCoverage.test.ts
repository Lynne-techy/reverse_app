import { describe, expect, it } from "vitest";

import type { WritingRecord } from "../../../api/writingSessions";
import { bookFractions, coveredVersesByBook, genreProgress } from "./bookCoverage";

function record(
  bookNo: number,
  chapter: number,
  startVerseNo: number,
  endVerseNo: number,
): WritingRecord {
  return {
    id: `${bookNo}-${chapter}-${startVerseNo}`,
    bookNo,
    chapter,
    startVerseNo,
    endVerseNo,
    language: "ko",
    clientDate: null,
    meditation: null,
    keyVerse: null,
    completedAt: null,
  };
}

describe("coveredVersesByBook", () => {
  it("기록이 없으면 전부 0", () => {
    const covered = coveredVersesByBook([]);
    expect(covered).toHaveLength(66);
    expect(covered.every((count) => count === 0)).toBe(true);
  });

  it("범위를 절 단위로 펼쳐 센다", () => {
    const covered = coveredVersesByBook([record(1, 1, 1, 10)]);
    expect(covered[0]).toBe(10);
  });

  it("같은 절을 여러 번 필사해도 한 번만 센다", () => {
    const covered = coveredVersesByBook([record(1, 1, 1, 10), record(1, 1, 5, 12)]);
    expect(covered[0]).toBe(12);
  });

  it("장이 다르면 같은 절 번호라도 따로 센다", () => {
    const covered = coveredVersesByBook([record(1, 1, 1, 3), record(1, 2, 1, 3)]);
    expect(covered[0]).toBe(6);
  });

  it("이상한 범위(끝 < 시작)나 범위 밖 bookNo는 무시한다", () => {
    const covered = coveredVersesByBook([
      record(1, 1, 9, 2),
      record(99, 1, 1, 5),
      record(0, 1, 1, 5),
    ]);
    expect(covered.every((count) => count === 0)).toBe(true);
  });

  it("권 전체 절 수를 넘겨 세지 않는다(번역본 절 구분 차이 방어)", () => {
    // 요한이서(bookNo 63)는 13절 — 한 기록이 30절을 주장해도 13으로 클램프된다.
    const covered = coveredVersesByBook([record(63, 1, 1, 30)]);
    expect(covered[62]).toBe(13);
  });
});

describe("bookFractions", () => {
  it("권별 채움 비율을 0~1로 낸다", () => {
    const covered = coveredVersesByBook([record(63, 1, 1, 13)]); // 요한이서 완필
    const fractions = bookFractions(covered);

    expect(fractions[62]).toBe(1);
    expect(fractions[0]).toBe(0);
  });
});

describe("genreProgress", () => {
  it("카테고리별로 접어 합산한다", () => {
    const covered = coveredVersesByBook([record(1, 1, 1, 31)]); // 창세기 1장 = 율법서
    const byGenre = Object.fromEntries(genreProgress(covered).map((g) => [g.code, g]));

    expect(byGenre.law.covered).toBe(31);
    expect(byGenre.law.total).toBe(5852);
    expect(byGenre.law.fraction).toBeCloseTo(31 / 5852);
    expect(byGenre.poetry.covered).toBe(0);
  });

  it("카테고리 총 절 수의 합은 성경 전체 절 수", () => {
    const total = genreProgress(coveredVersesByBook([])).reduce((sum, g) => sum + g.total, 0);
    expect(total).toBe(31102);
  });
});
