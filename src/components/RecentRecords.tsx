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

function RecentRecords({ records, isLoading }: RecentRecordsProps) {
  if (isLoading) {
    return (
      <section className="home-card home-records-card home-card--loading">
        최근 기록을 불러오는 중...
      </section>
    );
  }

  return (
    <section className="home-card home-records-card">
      <div className="home-records-card__header">
        <div className="home-section-heading">
          <span aria-hidden="true">◷</span>
          <h2>최근 필사 기록</h2>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="home-records-card__empty">
          <span aria-hidden="true">✎</span>
          <p>아직 필사 기록이 없습니다.</p>
          <small>오늘의 말씀을 기록하면 이곳에 표시돼요.</small>
        </div>
      ) : (
        <ul className="home-record-list">
          {records.slice(0, 5).map((record, index) => (
            <li key={record.id} className="home-record-item">
              <span
                className={`home-record-item__icon home-record-item__icon--${(index % 4) + 1}`}
                aria-hidden="true"
              >
                †
              </span>

              <div className="home-record-item__content">
                <p>
                  {record.bookNo}권 {record.chapter}장 {record.startVerseNo}-
                  {record.endVerseNo}절
                </p>

                {record.clientDate && <small>{record.clientDate}</small>}
              </div>

              <span className="home-record-item__count">
                {Math.max(record.endVerseNo - record.startVerseNo + 1, 1)}절
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecentRecords;
