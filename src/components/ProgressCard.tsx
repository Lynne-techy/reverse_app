import { progress } from "../data/dummy";

export default function ProgressCard() {
  const percent = progress.ratio * 100;

  return (
    <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">전체 진척률</p>
      <p className="mt-2 text-3xl font-extrabold text-gray-900">{percent.toFixed(1)}%</p>
      <p className="mt-1 text-xs text-gray-400">
        {progress.written.toLocaleString()} / {progress.total.toLocaleString()} 절
      </p>

      <div className="mt-auto pt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-jandi-0">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
