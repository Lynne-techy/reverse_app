import { useState } from "react";

import type { JandiLevel } from "../data/dummy";
import type { DailyActivity } from "../api/stats";

// 커스텀 툴팁 상태 — 셀 hover 시 즉시 뜨는 말풍선의 내용과 화면 좌표.
interface TooltipState {
  text: string;
  x: number; // 셀 가로 중앙(뷰포트 기준)
  y: number; // 셀 상단(뷰포트 기준)
}

interface HeatmapDay {
  date: Date;
  count: number | null; // null = no data for this cell (padding)
}

interface HeatmapProps {
  // API 응답(GET /stats/activity)과 동일한 형태 — { date: "YYYY-MM-DD", count }[].
  // prop이 없어도 크래시하지 않도록 optional + 기본값([]) 처리.
  activity?: DailyActivity[];

  // 표시 범위(잔디밭의 첫날/마지막날). GitHub 잔디처럼 기록 유무와 무관하게 이 창을 항상 그린다.
  // 생략하면 activity의 실제 min/max로 fallback(데이터가 있을 때만).
  startDate?: Date | string;
  endDate?: Date | string;

  // 카드 상단에 표시할 제목. 디자인 시안(index.html)의 "최근 6개월"과 동일한 자리.
  title?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["", "월", "", "수", "", "금", ""]; // GitHub식 히트맵처럼 3개만 표기

/** 레벨 → Tailwind 클래스 (literal로 적어야 Tailwind가 스캔함) */
const LEVEL_CLASS: Record<JandiLevel, string> = {
  0: "bg-jandi-0",
  1: "bg-jandi-1",
  2: "bg-jandi-2",
  3: "bg-jandi-3",
  4: "bg-jandi-4",
};

const getLevel = (count: number): JandiLevel => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 8) return 3;
  return 4;
};

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Date → "YYYY-MM-DD" 로컬 키. API의 date 문자열과 같은 포맷으로 맞춰 맵 조회에 쓴다. */
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface IndexedActivity {
  countByDate: Map<string, number>; // "YYYY-MM-DD" → count
  firstDataDate: Date; // 데이터가 있는 가장 이른 날 (startOfDay)
  lastDataDate: Date; // 데이터가 있는 가장 늦은 날 (startOfDay)
}

/**
 * activity({ date, count }[])를 그리드 조립에 쓰기 좋게 정리한다.
 * 호출부(buildCalendarDays)는 이 결과의 맵으로 각 셀을 채우고, min/max로 그리드 범위를 잡는다.
 *
 * TODO(human): 아래 함수 본문을 구현하세요. activity.length > 0이 보장됩니다.
 *  - countByDate: activity를 순회하며 date → count 로 채운 Map.
 *  - firstDataDate / lastDataDate: 등장한 날짜 중 가장 이른/늦은 날(startOfDay 적용).
 *  - 주의: activity는 순서가 뒤섞여 있을 수 있으니 [0]/[length-1]을 그대로 믿지 말 것.
 *    날짜 비교는 new Date(a.date) 로 Date를 만들어 getTime()으로 비교하면 됩니다.
 */
function indexActivity(activity: DailyActivity[]): IndexedActivity {
  let earliest = activity[0].date;
  let latest = activity[0].date;
  const countByDate = new Map<string, number>();
  activity.forEach((item: DailyActivity) => {
    countByDate.set(item.date, item.count);
    if (earliest > item.date) earliest = item.date;
    if (latest < item.date) latest = item.date;
  });

  return {
    countByDate,
    firstDataDate: startOfDay(new Date(earliest)),
    lastDataDate: startOfDay(new Date(latest)),
  };
}

function buildCalendarDays(
  activity: DailyActivity[],
  startDate?: Date | string,
  endDate?: Date | string,
): HeatmapDay[] {
  const hasData = activity.length > 0;

  // 표시 범위를 못 정하면(명시 범위도, 데이터도 없음) 그릴 게 없다.
  if (!hasData && (!startDate || !endDate)) return [];

  // 데이터가 있을 때만 맵/데이터범위를 뽑는다. 명시 startDate/endDate가 있으면 그쪽이 우선.
  const indexed = hasData ? indexActivity(activity) : null;
  const countByDate = indexed?.countByDate ?? new Map<string, number>();
  const firstDataDate = startDate ? startOfDay(new Date(startDate)) : indexed!.firstDataDate;
  const lastDataDate = endDate ? startOfDay(new Date(endDate)) : indexed!.lastDataDate;

  // 그리드 정렬: 첫날이 속한 주의 일요일 ~ 마지막날이 속한 주의 토요일
  const gridStart = new Date(firstDataDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDataDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: HeatmapDay[] = [];
  for (let t = gridStart.getTime(); t <= gridEnd.getTime(); t += DAY_MS) {
    const date = new Date(t);
    // 데이터 범위 밖(앞뒤 패딩)은 null, 범위 안 결손일은 0으로 채운다.
    const isWithinData = date >= firstDataDate && date <= lastDataDate;
    days.push({ date, count: isWithinData ? (countByDate.get(formatDateKey(date)) ?? 0) : null });
  }
  return days;
}

function chunkIntoWeeks(days: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

// 셀 hover 툴팁(title) / 스크린리더(aria-label)용 — "2026년 7월 22일"처럼 연도까지 표기.
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Heatmap({ activity = [], startDate, endDate, title = "최근 6개월" }: HeatmapProps) {
  const days = buildCalendarDays(activity, startDate, endDate);
  const [tip, setTip] = useState<TooltipState | null>(null);
  const weeks = chunkIntoWeeks(days);

  let lastLabeledMonth = -1;
  const monthLabels = weeks.map((week) => {
    const firstDay = week[0].date;
    const month = firstDay.getMonth();
    if (month !== lastLabeledMonth) {
      lastLabeledMonth = month;
      return firstDay.toLocaleDateString("ko-KR", { month: "short" });
    }
    return "";
  });

  return (
    <div className="rounded-2xl bg-white p-4 text-slate-800 shadow-sm md:p-5">
      {title ? <div className="mb-4 text-sm font-semibold text-slate-800">{title}</div> : null}

      <div className="flex flex-col items-center overflow-x-auto pb-1">
        {/* 주 컬럼마다 하나씩 놓는 월 라벨 행 — 잔디 본체와 동일한 격자(11px 컬럼 + 3px gap)로
            정렬해야 라벨 시작점이 해당 주 열 위에 온다. 왼쪽 여백은 요일라벨(24px)+flex gap(3px). */}
        <div
          className="mb-1 ml-[27px] grid grid-flow-col gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 11px)` }}
        >
          {monthLabels.map((label, i) => (
            <span key={i} className="whitespace-nowrap text-[11px] text-slate-500">
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {/* 왼쪽 요일 라벨 */}
          <div className="grid w-6 grid-rows-[repeat(7,11px)] gap-[3px]">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="text-[10px] leading-[11px] text-slate-500">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-flow-col gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div className="grid grid-rows-[repeat(7,11px)] gap-[3px]" key={weekIndex}>
                {week.map((day) => {
                  const hasData = day.count !== null;
                  const level = hasData ? getLevel(day.count as number) : null;
                  const label = hasData
                    ? `${formatDateLabel(day.date)} · ${day.count}회 필사`
                    : `${formatDateLabel(day.date)} · 기록 없음`;

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={`h-[11px] w-[11px] rounded-[3px] ${
                        level !== null ? LEVEL_CLASS[level] : "bg-transparent"
                      }`}
                      role="img"
                      aria-label={label}
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setTip({ text: label, x: r.left + r.width / 2, y: r.top });
                      }}
                      onMouseLeave={() => setTip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-slate-500">
        <span>적음</span>
        {([0, 1, 2, 3, 4] as JandiLevel[]).map((level) => (
          <span key={level} className={`h-[11px] w-[11px] rounded-[3px] ${LEVEL_CLASS[level]}`} />
        ))}
        <span>많음</span>
      </div>

      {/* 커스텀 툴팁 — overflow 컨테이너에 잘리지 않도록 fixed(뷰포트 기준)로 띄운다.
          pointer-events-none로 마우스를 가로채지 않아 hover가 끊기지 않는다. */}
      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg"
          style={{ left: tip.x, top: tip.y - 6 }}
          role="status"
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}

export default Heatmap;
