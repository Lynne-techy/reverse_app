// 예시용 더미 데이터. 실제 API/DB 연동은 이후 단계에서 대체된다.

import type { MyStatistics } from "../api/stats";

// 진척률 분모. 백엔드가 실제로 시딩한 개역개정 66권 절 수(31,088)와 일치해야 한다.
// (31,102는 KJV 영어 전통 총 절 수라 이 앱 데이터와 무관 — 쓰면 100% 도달 불가.)
// 실제 API 연동 시엔 이 상수를 버리고 GET /users/me/progress 응답의 totalVerses를 쓸 것.
export const BIBLE_TOTAL_VERSES = 31_088;

/** 전체 진척률 (더미). 실제로는 GET /users/me/progress의 coveredVerses/totalVerses로 대체. */
export const progress = {
  written: 8_832,
  total: BIBLE_TOTAL_VERSES,
  get ratio() {
    return this.written / this.total;
  },
};

/** 연속 기록(streak). 최근 N일은 잔디밭에서도 기록 있음으로 강제된다. */
export const STREAK_DAYS = 47;

/** 이번 주(최근 7일) 필사 횟수 */
export const THIS_WEEK_COUNT = 12;

/** 오늘의 Key Verse */
export const todayVerse = {
  reference: "시편 23:1",
  text: "여호와는 나의 목자시니 내게 부족함이 없으리로다.",
};

export interface RecentRecord {
  id: string;
  reference: string;
  date: string;
  /** 플레이스홀더 썸네일 배경 (CSS gradient) */
  thumb: string;
}

export const recentRecords: RecentRecord[] = [
  {
    id: "r1",
    reference: "시편 23:1-6",
    date: "2026.06.24",
    thumb: "linear-gradient(135deg, #2663ec 0%, #1e40b0 100%)",
  },
  {
    id: "r2",
    reference: "로마서 8:28",
    date: "2026.06.23",
    thumb: "linear-gradient(135deg, #3b82f6 0%, #2663ec 100%)",
  },
  {
    id: "r3",
    reference: "빌립보서 4:6-7",
    date: "2026.06.22",
    thumb: "linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)",
  },
  {
    id: "r4",
    reference: "이사야 41:10",
    date: "2026.06.21",
    thumb: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)",
  },
];

// ───────────────────────── 잔디밭(contribution calendar) ─────────────────────────

export type JandiLevel = 0 | 1 | 2 | 3 | 4;

export interface DayCell {
  date: Date;
  count: number;
  level: JandiLevel;
}

/** null = 그리드 정렬용 빈 칸(범위 밖/미래) */
export type Week = (DayCell | null)[];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * 결정적 의사난수 0~1 (splitmix32 계열 정수 믹서) — 같은 날짜는 항상 같은 값.
 * 연속된 seed도 잘 분산되도록 finalizer 믹싱을 두 번 적용한다.
 */
function pseudoRandom(seed: number): number {
  let x = seed >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 0xffffffff;
}

function baseCount(date: Date): number {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const r = pseudoRandom(seed);
  if (r < 0.38) return 0; // 약 38%는 기록 없는 날
  return Math.min(9, Math.floor(((r - 0.38) / 0.62) * 9) + 1); // 1~9회
}

function levelOf(count: number): JandiLevel {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * 오늘을 마지막 주에 포함하는 `weeks`주 × 7일 그리드를 생성한다.
 * 컬럼 = 주(일요일 시작), 행 = 요일. 미래 날짜는 null.
 */
export function buildContributionWeeks(today: Date, weeks: number): Week[] {
  const todayStart = startOfDay(today);
  const currentWeekSunday = new Date(todayStart.getTime() - todayStart.getDay() * DAY_MS);
  const firstSunday = new Date(currentWeekSunday.getTime() - (weeks - 1) * 7 * DAY_MS);

  const result: Week[] = [];
  for (let w = 0; w < weeks; w++) {
    const week: Week = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(firstSunday.getTime() + (w * 7 + d) * DAY_MS);
      if (cellDate.getTime() > todayStart.getTime()) {
        week.push(null); // 미래
        continue;
      }
      const daysAgo = Math.round((todayStart.getTime() - cellDate.getTime()) / DAY_MS);
      let count = baseCount(cellDate);
      if (daysAgo < STREAK_DAYS && count === 0) count = 1; // 최근 streak 구간은 기록 보장
      week.push({ date: cellDate, count, level: levelOf(count) });
    }
    result.push(week);
  }
  return result;
}

/**
 * 히트맵(HeatmapPage)용 임시 더미 — 최근 365일 필사 횟수 배열(오래된→최신).
 * HeatmapPage는 flat `number[]`를 받으므로 별도로 생성한다. 실제 API 연동 시 대체.
 */
export const heatmapActivity: number[] = Array.from({ length: 365 }, (_, i) => {
  const cellDate = new Date(Date.now() - (364 - i) * DAY_MS);
  return baseCount(cellDate);
});

/**
 * 통계(HeatmapPage 스탯 카드 + 연속 시작 카드)용 임시 더미.
 * 실제 API 연동 시 GET /stats/me(getMyStatistics) 응답으로 그대로 대체한다.
 * streakStart.date는 "N개월 전" 표기를 확인할 수 있도록 58일 전으로 잡는다.
 */
export const dummyStatistics: MyStatistics = {
  userId: "dummy-user",
  currentStreak: 58,
  longestStreak: 63,
  totalCount: 832,
  lastWrittenDate: new Date().toISOString().slice(0, 10),
  freezeAvailable: 2,
  streakStart: {
    date: new Date(Date.now() - 58 * DAY_MS).toISOString().slice(0, 10),
    bookNo: 19,
    bookName: "시편",
    chapter: 1,
  },
};
