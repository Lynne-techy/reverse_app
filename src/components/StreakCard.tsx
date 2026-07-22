// import { STREAK_DAYS, THIS_WEEK_COUNT } from "../data/dummy";

// export default function StreakCard() {
//   return (
//     <>
//       <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
//         <p className="text-sm font-medium text-gray-500">연속 기록</p>
//         <p className="mt-2 flex items-baseline gap-1.5">
//           <span className="text-3xl font-extrabold text-brand">{STREAK_DAYS}</span>
//           <span className="text-sm font-medium text-gray-400">일째</span>
//         </p>
//         <p className="mt-auto pt-5 text-xs text-gray-400">🔥 매일 한 절씩, 끊기지 않게</p>
//       </div>

//       <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
//         <p className="text-sm font-medium text-gray-500">이번 주 필사</p>
//         <p className="mt-2 flex items-baseline gap-1.5">
//           <span className="text-3xl font-extrabold text-gray-900">{THIS_WEEK_COUNT}</span>
//           <span className="text-sm font-medium text-gray-400">회</span>
//         </p>
//         <p className="mt-auto pt-5 text-xs text-gray-400">최근 7일 누적 기록</p>
//       </div>
//     </>
//   );
// }

import type { MyStatistics } from "../api/stats";
import { Flame, CalendarRange } from 'lucide-react';

interface StreakCardProps {
  statistics: MyStatistics | null;
  isLoading: boolean;
}

function StreakCard({
  statistics,
  isLoading,
}: StreakCardProps) {
  if (isLoading) {
    return (
      <section className="home-card home-stat-card home-stat-card--mint home-card--loading">
        스트릭을 불러오는 중...
      </section>
    );
  }

  if (!statistics) {
    return (
      <section className="home-card home-stat-card home-stat-card--mint home-card--loading">
        스트릭을 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="home-card home-stat-card home-stat-card--mint">
      <div className="home-stat-card__header">
        <span className="home-stat-card__eyebrow-icon" aria-hidden="true">
          <Flame size={25} />
        </span>
        <h2>현재 연속 필사</h2>
      </div>

      <div className="home-stat-card__metric">
        <strong>{statistics.currentStreak}일</strong>
        <p>최장 {statistics.longestStreak}일</p>
      </div>

      <div className="home-stat-card__visual home-stat-card__visual--calendar" aria-hidden="true">
        <CalendarRange size={50} />
      </div>
    </section>
  );
}

export default StreakCard;
