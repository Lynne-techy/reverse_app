// 전체(66권) 밤하늘 = "말씀의 은하"의 이름표.
//
// 형태(별 좌표)는 galaxy.ts, 색은 bookGenres.ts, 진행도는 useGenreProgress.ts가 맡고
// 이 파일은 캡션·상징·대표 문구만 갖는다.

import { Orbit } from "lucide-react";

import type { SkyMeta } from "./constellations";

export const TOTAL_SKY_META: SkyMeta = {
  bookName: "성경 전체",
  symbol: Orbit,
  symbolLabel: "말씀의 은하",
  caption: "말씀의 은하 · 성경 전체",
  phrase: {
    ref: "시편 119:105",
    text: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다",
  },
};
