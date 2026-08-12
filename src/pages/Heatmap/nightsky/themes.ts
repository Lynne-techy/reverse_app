// 장르별 밤하늘 톤 — 66권이 한 하늘에 모여도 장르가 색으로 읽히도록 글로우 틴트를 나눈다.
// (CONSTELLATIONS_PLAN.md "장르 테마" 절 참고. 코어·연결선은 전 경전 공통으로 통일감 유지,
//  글로우/별무리만 장르 틴트를 입는다. 감정 보석 별은 이 틴트보다 우선한다.)

interface GenreTheme {
  /** bookNo 범위 [from, to] (정경 순서). */
  from: number;
  to: number;
  name: string;
  /** 글로우·별무리 틴트. */
  glow: string;
}

const GENRE_THEMES: GenreTheme[] = [
  { from: 1, to: 5, name: "모세오경", glow: "#ffe7bc" }, // 여명 호박 (기존 기본색)
  { from: 6, to: 17, name: "역사서", glow: "#ffdda0" }, // 성벽 금
  { from: 18, to: 22, name: "시가서", glow: "#dcc9ff" }, // 은보라
  { from: 23, to: 27, name: "대선지서", glow: "#cfe2ff" }, // 청백
  { from: 28, to: 39, name: "소선지서", glow: "#eef2ff" }, // 또렷한 백
  { from: 40, to: 44, name: "복음서·행전", glow: "#ffedcb" }, // 새벽 금백
  { from: 45, to: 57, name: "바울서신", glow: "#f5ead2" }, // 백금
  { from: 58, to: 65, name: "일반서신", glow: "#e3eaf8" }, // 은백
  { from: 66, to: 66, name: "계시록", glow: "#fff3c0" }, // 찬란한 금백
];

const DEFAULT_GLOW = "#ffe7bc";

/** bookNo → 장르 글로우 틴트. 범위를 벗어나면 기본 호박색. */
export function genreGlow(bookNo: number): string {
  return GENRE_THEMES.find((t) => bookNo >= t.from && bookNo <= t.to)?.glow ?? DEFAULT_GLOW;
}
