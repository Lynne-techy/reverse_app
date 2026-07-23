import { BIBLE_BOOKS } from "../../../data/books";

interface RangeStepProps {
  bookNo: number;
  setBookNo: (n: number) => void;
  chapter: number;
  setChapter: (n: number) => void;
  startVerse: number;
  setStartVerse: (n: number) => void;
  endVerse: number;
  setEndVerse: (n: number) => void;
  rangeLabel: string;
}

export function RangeStep({
  bookNo,
  setBookNo,
  chapter,
  setChapter,
  startVerse,
  setStartVerse,
  endVerse,
  setEndVerse,
  rangeLabel,
}: RangeStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">① 성경 선택</div>

        <select
          className="mt-3 h-12 w-full rounded-xl border border-border-strong bg-white px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          aria-label="성경 선택"
          value={bookNo}
          onChange={(e) => setBookNo(Number(e.target.value))}
        >
          {BIBLE_BOOKS.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">② 장 선택</div>

        <input
          className="mt-3 h-12 w-full rounded-xl border border-border-strong bg-white px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          type="number"
          min={1}
          aria-label="장 선택"
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">③ 절 범위</div>

        <div className="mt-3 flex items-center gap-3">
          <input
            className="h-12 w-full rounded-xl border border-border-strong bg-white px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            type="number"
            min={1}
            aria-label="시작 절"
            value={startVerse}
            onChange={(e) => setStartVerse(Number(e.target.value))}
          />

          <span className="text-base font-medium text-sub">~</span>

          <input
            className="h-12 w-full rounded-xl border border-border-strong bg-white px-4 text-lg text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            type="number"
            min={1}
            aria-label="끝 절"
            value={endVerse}
            onChange={(e) => setEndVerse(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-primary-soft px-5 py-5">
        <p className="text-sm font-semibold text-primary-deep">선택한 범위</p>

        <p className="mt-1.5 text-[28px] font-extrabold leading-tight text-primary-deep">{rangeLabel}</p>
      </div>
    </div>
  );
}
