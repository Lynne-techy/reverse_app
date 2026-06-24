import { STREAK_DAYS, THIS_WEEK_COUNT } from "../data/dummy";

export default function StreakCard() {
  return (
    <>
      <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">연속 기록</p>
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-brand">{STREAK_DAYS}</span>
          <span className="text-sm font-medium text-gray-400">일째</span>
        </p>
        <p className="mt-auto pt-5 text-xs text-gray-400">🔥 매일 한 절씩, 끊기지 않게</p>
      </div>

      <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">이번 주 필사</p>
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-gray-900">{THIS_WEEK_COUNT}</span>
          <span className="text-sm font-medium text-gray-400">회</span>
        </p>
        <p className="mt-auto pt-5 text-xs text-gray-400">최근 7일 누적 기록</p>
      </div>
    </>
  );
}
