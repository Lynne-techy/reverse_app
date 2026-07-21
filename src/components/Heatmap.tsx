import type { JandiLevel } from "../data/dummy";

interface HeatmapDay {
  date: Date;
  count: number | null; // null = no data for this cell (padding)
}

interface HeatmapProps {
  // 임시방편: prop이 없어도 크래시하지 않도록 optional + 기본값([]) 처리.
  activity?: number[];

  startDate?: Date | string;

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

function buildCalendarDays(activity: number[], startDate?: Date | string): HeatmapDay[] {
  const firstDataDate = startDate
    ? startOfDay(new Date(startDate))
    : startOfDay(new Date(Date.now() - (activity.length - 1) * DAY_MS));

  const lastDataDate = new Date(firstDataDate.getTime() + (activity.length - 1) * DAY_MS);

  const gridStart = new Date(firstDataDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDataDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days: HeatmapDay[] = [];
  for (let t = gridStart.getTime(); t <= gridEnd.getTime(); t += DAY_MS) {
    const date = new Date(t);
    const dayIndex = Math.round((date.getTime() - firstDataDate.getTime()) / DAY_MS);
    const isWithinData = dayIndex >= 0 && dayIndex < activity.length;
    days.push({ date, count: isWithinData ? activity[dayIndex] : null });
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

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
}

function Heatmap({ activity = [], startDate, title = "최근 6개월" }: HeatmapProps) {
  const days = buildCalendarDays(activity, startDate);
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

      <div className="overflow-x-auto pb-1">
        {/* 주 컬럼마다 하나씩 놓는 월 라벨 행 */}
        <div
          className="mb-1 ml-6 grid"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
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

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={`h-[11px] w-[11px] rounded-[3px] ${
                        level !== null ? LEVEL_CLASS[level] : "bg-transparent"
                      }`}
                      role="img"
                      aria-label={
                        hasData
                          ? `${formatDateLabel(day.date)} ${day.count}회 필사`
                          : `${formatDateLabel(day.date)} 기록 없음`
                      }
                      title={
                        hasData
                          ? `${formatDateLabel(day.date)} · ${day.count}회 필사`
                          : `${formatDateLabel(day.date)} · 기록 없음`
                      }
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
    </div>
  );
}

export default Heatmap;
