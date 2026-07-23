import { bookName } from "../../../data/books";
import type { Verse } from "../../../api/verses";

interface KeyVerseStepProps {
  rangeVerses: Verse[] | undefined;
  rangeError: boolean;
  rangeFetching: boolean;
  refetchRange: () => void;
  keyVerseId: number | null;
  setKeyVerseId: (id: number) => void;
  selectedKeyVerse: Verse | null;
  bookNo: number;
  chapter: number;
}

export function KeyVerseStep({
  rangeVerses,
  rangeError,
  rangeFetching,
  refetchRange,
  keyVerseId,
  setKeyVerseId,
  selectedKeyVerse,
  bookNo,
  chapter,
}: KeyVerseStepProps) {
  const renderList = () => {
    if (rangeError && !rangeVerses) {
      return (
        <div className="flex flex-col items-center gap-3.5 px-3 py-7 text-center text-base leading-7 text-sub">
          <p>말씀을 불러오지 못했어요.</p>

          <button
            type="button"
            className="h-12 w-32 rounded-xl border border-border bg-white text-base font-semibold text-ink transition hover:bg-surface"
            onClick={() => refetchRange()}
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (!rangeVerses && rangeFetching) {
      return <p className="px-3 py-7 text-center text-base leading-7 text-sub">말씀을 불러오는 중…</p>;
    }

    if (!rangeVerses || rangeVerses.length === 0) {
      return (
        <p className="px-3 py-7 text-center text-base leading-7 text-sub">
          이 범위에 해당하는 말씀이 없어요. 범위를 다시 확인해 주세요.
        </p>
      );
    }

    return (
      <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto [scrollbar-gutter:stable] pr-1">
        {rangeVerses.map((verse) => {
          const selected = keyVerseId === verse.id;
          return (
            <button
              key={verse.id}
              type="button"
              className={`flex w-full flex-col gap-1.5 rounded-xl border px-3.5 py-3 text-left transition ${
                selected
                  ? "border-brand bg-primary-soft"
                  : "border-border bg-surface hover:border-brand"
              }`}
              onClick={() => setKeyVerseId(verse.id)}
            >
              <strong className={`text-sm ${selected ? "text-primary-deep" : "text-brand"}`}>
                {verse.verseNo}절
              </strong>
              <span
                className={`text-base leading-7 ${
                  selected ? "font-semibold text-primary-deep" : "font-medium text-body"
                }`}
              >
                {verse.text}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-ink">마음에 남은 말씀</div>

        <div className="mt-3">{renderList()}</div>
      </div>

      <div className="rounded-2xl bg-primary-soft px-5 py-5">
        <p className="text-sm font-semibold text-primary-deep">선택한 Key Verse</p>

        <p className="mt-1.5 text-2xl font-extrabold leading-tight text-primary-deep">
          {selectedKeyVerse
            ? `${bookName(bookNo)} ${chapter}:${selectedKeyVerse.verseNo}`
            : "말씀을 선택해주세요"}
        </p>
      </div>
    </div>
  );
}
