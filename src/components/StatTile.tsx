interface StatTileProps {
  /** 카드 위쪽 라벨 (예: "현재 연속") */
  label: string;
  /** 서버 데이터로 채우는 값 (예: "58일") */
  value: string;
  /** 값 아래 보조 설명 (선택) */
  caption?: string;
}

// 세로 정렬 스탯 카드: 위 라벨 → 큰 값 → (선택) 보조 설명.
// 데이터 소스를 모르는 순수 프레젠테이션 컴포넌트 — props만 받는다.
function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
      {caption ? <p className="mt-1 text-xs text-slate-400">{caption}</p> : null}
    </div>
  );
}

export default StatTile;
