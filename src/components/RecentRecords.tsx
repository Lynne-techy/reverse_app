// import { recentRecords } from "../data/dummy";

// export default function RecentRecords() {
//   return (
//     <section>
//       <div className="mb-4 flex items-center justify-between">
//         <h2 className="text-lg font-bold text-gray-900">최근 필사 기록</h2>
//         <a href="#" className="text-sm font-medium text-brand hover:underline">
//           전체 보기 →
//         </a>
//       </div>

//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
//         {recentRecords.map((record) => (
//           <article
//             key={record.id}
//             className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
//           >
//             <div
//               className="flex aspect-[4/3] items-end p-3 transition-transform duration-200 group-hover:scale-[1.03]"
//               style={{ background: record.thumb }}
//             >
//               <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
//                 필사 사진
//               </span>
//             </div>
//             <div className="px-3 py-2.5">
//               <p className="truncate text-sm font-semibold text-gray-900">{record.reference}</p>
//               <p className="mt-0.5 text-xs text-gray-400">{record.date}</p>
//             </div>
//           </article>
//         ))}
//       </div>
//     </section>
//   );
// }

import type { WritingRecord } from "../api/writingSessions";

interface RecentRecordsProps {
  records: WritingRecord[];
  isLoading: boolean;
}

function RecentRecords({
  records,
  isLoading,
}: RecentRecordsProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-6">
        최근 기록을 불러오는 중...
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-800">
        최근 필사 기록
      </h2>

      {records.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          아직 필사 기록이 없습니다.
        </p>
      ) : (
        <ul className="record-list">
          {records.map((record) => (
            <li
              key={record.id}
              className="record-card"
            >
              <p className="font-semibold text-slate-800">
                {record.bookNo}권 {record.chapter}장
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {record.startVerseNo}절 ~{" "}
                {record.endVerseNo}절
              </p>

              {record.clientDate && (
                <p className="mt-1 text-xs text-slate-400">
                  {record.clientDate}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentRecords;