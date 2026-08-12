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

// 색상환에서 서로 확실히 떨어진 9색 — 텍스처가 무채색이라 이 값이 그대로 화면 색이 된다.
// 웜톤은 기원(모세오경)·왕국(역사서)·성육신(복음)·완성(계시록) 네 축만 남기고
// 나머지는 보라·파랑·백·민트·은청으로 벌려 "대부분 주황" 쏠림을 없앤다.
const GENRE_THEMES: GenreTheme[] = [
  { from: 1, to: 5, name: "모세오경", glow: "#ffd9a0" }, // 여명 호박
  { from: 6, to: 17, name: "역사서", glow: "#ffdf70" }, // 성벽 금
  { from: 18, to: 22, name: "시가서", glow: "#c9a8ff" }, // 보라
  { from: 23, to: 27, name: "대선지서", glow: "#8fc1ff" }, // 파랑
  { from: 28, to: 39, name: "소선지서", glow: "#eef2ff" }, // 또렷한 백
  { from: 40, to: 44, name: "복음서·행전", glow: "#ffbfa8" }, // 새벽 살구
  { from: 45, to: 57, name: "바울서신", glow: "#9fe8d0" }, // 생명의 민트
  { from: 58, to: 65, name: "일반서신", glow: "#bcd0f5" }, // 은청
  { from: 66, to: 66, name: "계시록", glow: "#fff3c0" }, // 찬란한 금백
];

const DEFAULT_GLOW = "#ffd9a0";

export interface GenreTone {
  name: string;
  glow: string;
}

/** bookNo → 장르 톤(이름+틴트). UI 범례("시가서 톤")와 씬이 함께 쓴다. */
export function genreTheme(bookNo: number): GenreTone {
  const found = GENRE_THEMES.find((t) => bookNo >= t.from && bookNo <= t.to);
  return found ? { name: found.name, glow: found.glow } : { name: "밤하늘", glow: DEFAULT_GLOW };
}

/** bookNo → 장르 글로우 틴트. */
export function genreGlow(bookNo: number): string {
  return genreTheme(bookNo).glow;
}
