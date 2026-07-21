import type { DailyActivity } from "../api/stats";
import type { JandiLevel, Week } from "../data/dummy";

// 잔디 그리드 계산(실데이터). 그리드 규칙(주=일요일 시작, 미래=null)은
// data/dummy.ts의 buildContributionWeeks(더미)와 동일하되, count를 실제 활동에서 채운다.

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** 사용자 로컬 날짜 기준 YYYY-MM-DD (활동 API의 date 키와 동일 포맷). */
function formatKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 그날 필사 통과 횟수 → 잔디 레벨(0~4). */
function levelOf(count: number): JandiLevel {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * 실제 활동(DailyActivity[])으로 `weeks`주 × 7일 잔디 그리드를 만든다.
 * 컬럼 = 주(일요일 시작), 행 = 요일. 미래 날짜는 null.
 */
export function buildWeeksFromActivity(
  activity: DailyActivity[],
  today: Date,
  weeks: number,
): Week[] {
  const countByDate = new Map<string, number>();
  for (const a of activity) countByDate.set(a.date, a.count);

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
      const count = countByDate.get(formatKey(cellDate)) ?? 0;
      week.push({ date: cellDate, count, level: levelOf(count) });
    }
    result.push(week);
  }
  return result;
}
