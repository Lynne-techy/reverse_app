import { describe, expect, it } from "vitest";

import { BIBLE_BOOKS } from "./books";
import { BOOK_GENRES, booksOfGenre, genreOf } from "./bookGenres";
import { BOOK_VERSE_COUNTS, TOTAL_VERSE_COUNT } from "./bookVerseCounts";

describe("BOOK_VERSE_COUNTS", () => {
  it("66권 전부에 절 수가 있다", () => {
    expect(BOOK_VERSE_COUNTS).toHaveLength(BIBLE_BOOKS.length);
    expect(BOOK_VERSE_COUNTS.every((count) => count > 0)).toBe(true);
  });

  it("합계가 표준 절 수(31,102)와 일치한다", () => {
    expect(TOTAL_VERSE_COUNT).toBe(31102);
  });

  it("대표적인 권의 절 수가 맞다", () => {
    expect(BOOK_VERSE_COUNTS[18]).toBe(2461); // 시편
    expect(BOOK_VERSE_COUNTS[62]).toBe(13); // 요한이서
    expect(BOOK_VERSE_COUNTS[65]).toBe(404); // 요한계시록
  });
});

describe("BOOK_GENRES", () => {
  it("66권을 빠짐없이, 한 번씩만 덮는다", () => {
    const assigned = BOOK_GENRES.flatMap(booksOfGenre);

    expect(assigned).toHaveLength(66);
    expect(new Set(assigned).size).toBe(66);
    for (let bookNo = 1; bookNo <= 66; bookNo++) {
      expect(genreOf(bookNo)).not.toBeNull();
    }
  });

  it("범위 밖 bookNo는 장르가 없다", () => {
    expect(genreOf(0)).toBeNull();
    expect(genreOf(67)).toBeNull();
  });

  it("전통적 분류대로 사도행전은 역사서, 요한계시록은 예언서", () => {
    expect(genreOf(44)).toBe("history");
    expect(genreOf(66)).toBe("prophecy");
    expect(genreOf(1)).toBe("law");
    expect(genreOf(19)).toBe("poetry");
    expect(genreOf(43)).toBe("gospel");
    expect(genreOf(45)).toBe("epistle");
  });

  it("타입마다 서로 다른 별빛 색을 쓴다", () => {
    const colors = BOOK_GENRES.map((genre) => genre.starColor);
    expect(new Set(colors).size).toBe(BOOK_GENRES.length);
  });
});
