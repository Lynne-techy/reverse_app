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


import type { UserProgress } from "../api/users";

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
      <section className="rounded-2xl bg-white p-6">
        진척률을 불러오는 중...
      </section>
    );
  }

  if (!progress) {
    return (
      <section className="rounded-2xl bg-white p-6">
        진척률을 불러오지 못했습니다.
      </section>
    );
  }

  const progressRate = Math.min(
    Math.max(progress.progressRate, 0),
    100,
  );

  return (
    <section className="stat-card">
      <p className="text-sm text-slate-500">
        전체 필사 진척률
      </p>

      <strong className="mt-2 block text-3xl text-slate-800">
        {progressRate.toFixed(1)}%
      </strong>

      <div className="progress">
      <span
        style={{
          width: `${Math.max(progressRate, 1.5)}%`,
        }}
      />
      </div>

      <div className="mt-4 flex justify-between text-sm">
        <span>
          {progress.coveredVerses.toLocaleString()} /{" "}
          {progress.totalVerses.toLocaleString()}절
        </span>

        <span>완료 {progress.completedBooks}권</span>
      </div>
    </section>
  );
}

export default ProgressCard;