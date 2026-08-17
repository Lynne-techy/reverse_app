// 경전 타입(장르) 6종 — 전체 밤하늘("말씀의 은하")의 색 언어.
//
// 색 축이 두 개다:
//   · 전체 뷰(은하)   = 경전 타입 색 (이 파일)
//   · 경전별 뷰(별자리) = 절의 감정 색 (emotions.ts)
// 한 화면에서 두 축이 섞이지 않으므로(전체 뷰엔 감정 보석 별이 없다) 혼란이 생기지 않는다.
//
// 분류는 CONSTELLATIONS_PLAN.md의 묶음을 따르되, 색을 6개로 줄이기 위해
// 대선지서+소선지서 → 예언서, 바울서신+일반서신 → 서신서로 합치고
// 사도행전은 역사서, 요한계시록은 예언서에 넣었다(전통적 분류와 일치).

export type GenreCode = "law" | "history" | "poetry" | "prophecy" | "gospel" | "epistle";

export interface BookGenre {
  code: GenreCode;
  /** 범례에 보이는 이름. */
  label: string;
  /** 범례 보조 설명 — 이 색이 어느 권들인지 한 줄로. */
  range: string;
  /**
   * 은하 별빛 색. 어두운 배경(#070a1a) 위에서 빛나야 하므로 밝은 파스텔 계열,
   * 서로 색상환에서 30° 이상 떨어뜨려 나란히 놓아도 구분되게 잡았다.
   */
  starColor: string;
  /** 이 장르에 속한 bookNo 범위 목록([시작, 끝] 포함). */
  books: [number, number][];
}

// 배열 순서 = 범례 표시 순서 = 은하 팔(arm)이 놓이는 순서.
export const BOOK_GENRES: BookGenre[] = [
  {
    code: "law",
    label: "율법서",
    range: "창세기–신명기",
    starColor: "#f4c86a", // 언약의 금빛
    books: [[1, 5]],
  },
  {
    code: "history",
    label: "역사서",
    range: "여호수아–에스더 · 사도행전",
    starColor: "#4fd8a8", // 흘러가는 시간의 청록
    books: [
      [6, 17],
      [44, 44],
    ],
  },
  {
    code: "poetry",
    label: "시가서",
    range: "욥기–아가",
    starColor: "#ff9ec4", // 노래의 로즈
    books: [[18, 22]],
  },
  {
    code: "prophecy",
    label: "예언서",
    range: "이사야–말라기 · 요한계시록",
    starColor: "#b28bff", // 환상의 보라
    books: [
      [23, 39],
      [66, 66],
    ],
  },
  {
    code: "gospel",
    label: "복음서",
    range: "마태–요한복음",
    starColor: "#6cc3ff", // 새벽 하늘빛
    books: [[40, 43]],
  },
  {
    code: "epistle",
    label: "서신서",
    range: "로마서–유다서",
    starColor: "#a9e069", // 자라나는 교회의 연둣빛
    books: [[45, 65]],
  },
];

/** code → 장르. */
export const GENRE_BY_CODE: Record<GenreCode, BookGenre> = Object.fromEntries(
  BOOK_GENRES.map((g) => [g.code, g]),
) as Record<GenreCode, BookGenre>;

/** code → 별빛 색. */
export const GENRE_STAR_COLORS: Record<GenreCode, string> = Object.fromEntries(
  BOOK_GENRES.map((g) => [g.code, g.starColor]),
) as Record<GenreCode, string>;

/** bookNo(1~66) → 장르 코드. 66권을 빠짐없이 덮으므로 유효 범위면 항상 값이 있다. */
const GENRE_OF_BOOK: (GenreCode | undefined)[] = (() => {
  const table: (GenreCode | undefined)[] = new Array<GenreCode | undefined>(67).fill(undefined);
  for (const genre of BOOK_GENRES) {
    for (const [start, end] of genre.books) {
      for (let bookNo = start; bookNo <= end; bookNo++) table[bookNo] = genre.code;
    }
  }
  return table;
})();

export function genreOf(bookNo: number): GenreCode | null {
  return GENRE_OF_BOOK[bookNo] ?? null;
}

/** 장르에 속한 bookNo 목록(정경 순서). */
export function booksOfGenre(genre: BookGenre): number[] {
  const books: number[] = [];
  for (const [start, end] of genre.books) {
    for (let bookNo = start; bookNo <= end; bookNo++) books.push(bookNo);
  }
  return books;
}
