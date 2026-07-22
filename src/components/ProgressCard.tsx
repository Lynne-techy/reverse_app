// import { progress } from "../data/dummy";

// export default function ProgressCard() {
//   const percent = progress.ratio * 100;

//   return (
//     <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
//       <p className="text-sm font-medium text-gray-500">전체 진척률</p>
//       <p className="mt-2 text-3xl font-extrabold text-gray-900">{percent.toFixed(1)}%</p>
//       <p className="mt-1 text-xs text-gray-400">
//         {progress.written.toLocaleString()} / {progress.total.toLocaleString()} 절
//       </p>

//       <div className="mt-auto pt-5">
//         <div className="h-2.5 w-full overflow-hidden rounded-full bg-jandi-0">
//           <div
//             className="h-full rounded-full bg-brand transition-all"
//             style={{ width: `${percent}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

import type { CSSProperties } from "react";
import type { UserProgress } from "../api/users";
import { Trophy } from 'lucide-react';

interface ProgressCardProps {
  progress: UserProgress | null;
  isLoading: boolean;
}

function ProgressCard({
  progress,
  isLoading,
}: ProgressCardProps) {
  if (isLoading) {
    return (
      <section className="home-card home-stat-card home-stat-card--blue home-card--loading">
        진척률을 불러오는 중...
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="home-card home-stat-card home-stat-card--blue home-card--loading">
        진척률을 불러오지 못했습니다.
      </section>
    );
  }

  const progressRate = Math.min(
    Math.max(progress.progressRate, 0),
    100,
  );

  const progressStyle = {
    "--progress-rate": `${progressRate * 3.6}deg`,
  } as CSSProperties;

  return (
    <section className="home-card home-stat-card home-stat-card--blue">
      <div className="home-stat-card__header">
        <span className="home-stat-card__eyebrow-icon" aria-hidden="true">
          <Trophy size={25} />
        </span>
        <h2>전체 필사 진척률</h2>
      </div>

      <div className="home-progress-card__body">
        <div className="home-progress-ring" style={progressStyle}>
          <div>
            <strong>{progressRate.toFixed(1)}%</strong>
          </div>
        </div>

        <div className="home-stat-card__details">
          <strong>
            {progress.coveredVerses.toLocaleString()} /{" "}
            {progress.totalVerses.toLocaleString()}절
          </strong>

          <p>
            하나님의 말씀을
            <br />
            차곡차곡 써 내려가요.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProgressCard;
