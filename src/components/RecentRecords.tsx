import { recentRecords } from "../data/dummy";

export default function RecentRecords() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">최근 필사 기록</h2>
        <a href="#" className="text-sm font-medium text-brand hover:underline">
          전체 보기 →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {recentRecords.map((record) => (
          <article
            key={record.id}
            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div
              className="flex aspect-[4/3] items-end p-3 transition-transform duration-200 group-hover:scale-[1.03]"
              style={{ background: record.thumb }}
            >
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                필사 사진
              </span>
            </div>
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-gray-900">{record.reference}</p>
              <p className="mt-0.5 text-xs text-gray-400">{record.date}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
