import { useMemo } from "react";
import { buildWeeksFromActivity } from "../lib/contribution";
import type { JandiLevel, Week } from "../data/dummy";
import type { DailyActivity } from "../api/stats";
import Skeleton from "./Skeleton";

const WEEKS = 53;

interface ContributionGraphProps {
  activity: DailyActivity[];
  isLoading?: boolean;
}

/** 레벨 → Tailwind 클래스 (literal로 적어야 Tailwind가 스캔함) */
const LEVEL_CLASS: Record<JandiLevel, string> = {
  0: "bg-jandi-0",
  1: "bg-jandi-1",
  2: "bg-jandi-2",
  3: "bg-jandi-3",
  4: "bg-jandi-4",
};

const WEEKDAY_LABELS = ["", "월", "", "수", "", "금", ""];
const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

function formatDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${m}.${day}`;
}

/** 각 주 컬럼 상단에 표시할 월 라벨 (달이 바뀌는 컬럼에만) */
function monthLabels(weeks: Week[]): (string | null)[] {
  let prevMonth = -1;
  return weeks.map((week) => {
    const firstReal = week.find((c): c is NonNullable<typeof c> => c !== null);
    if (!firstReal) return null;
    const month = firstReal.date.getMonth();
    if (month !== prevMonth) {
      prevMonth = month;
      return MONTHS[month];
    }
    return null;
  });
}

export default function ContributionGraph({ activity, isLoading = false }: ContributionGraphProps) {
  const weeks = useMemo(() => buildWeeksFromActivity(activity, new Date(), WEEKS), [activity]);
  const labels = useMemo(() => monthLabels(weeks), [weeks]);

  const totalDays = weeks.reduce(
    (sum, week) => sum + week.filter((c) => c !== null && c.count > 0).length,
    0,
  );

  if (isLoading) {
    return (
      <section
        role="status"
        aria-label="필사 잔디밭 불러오는 중"
        className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="mb-5 text-lg font-bold text-gray-900">필사 잔디밭</h2>
        <Skeleton height={140} radius={12} />
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">필사 잔디밭</h2>
          <p className="mt-1 text-sm text-gray-600">최근 1년 동안 {totalDays}일을 적었어요.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* 카드가 그리드보다 넓으면 가운데 정렬, 좁으면 좌측부터 스크롤(margin-auto). */}
        <div className="mx-auto w-max">
          {/* 월 라벨 */}
          <div className="flex pl-7">
            {labels.map((label, i) => (
              <div key={i} className="w-[15px] shrink-0 text-[10px] text-gray-600">
                {label}
              </div>
            ))}
          </div>

          {/* 요일 라벨 + 그리드 */}
          <div className="mt-1 flex">
            <div className="mr-1 flex flex-col">
              {WEEKDAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="flex h-[15px] w-6 items-center justify-end pr-1 text-[10px] text-gray-600"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="flex">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col">
                  {week.map((cell, di) => {
                    if (!cell) {
                      return <div key={di} className="h-[15px] w-[15px]" />;
                    }
                    return (
                      <div key={di} className="p-[1.5px]">
                        <div
                          className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASS[cell.level]}`}
                          title={`${formatDate(cell.date)} · ${cell.count}회 필사`}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-gray-600">
        <span>적게</span>
        {([0, 1, 2, 3, 4] as JandiLevel[]).map((level) => (
          <span key={level} className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASS[level]}`} />
        ))}
        <span>많이</span>
      </div>
    </section>
  );
}
