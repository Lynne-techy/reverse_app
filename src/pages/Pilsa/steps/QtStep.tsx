import { bookName } from "../../../data/books";
import type { Verse } from "../../../api/verses";

type LanguageMode = "ko" | "en";

interface QtStepProps {
  meditation: string;
  setMeditation: (v: string) => void;
  application: string;
  setApplication: (v: string) => void;
  prayer: string;
  setPrayer: (v: string) => void;
  rangeLabel: string;
  language: LanguageMode;
  selectedKeyVerse: Verse | null;
  bookNo: number;
  chapter: number;
}

export function QtStep({
  meditation,
  setMeditation,
  application,
  setApplication,
  prayer,
  setPrayer,
  rangeLabel,
  language,
  selectedKeyVerse,
  bookNo,
  chapter,
}: QtStepProps) {
  const qtField = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="text-base font-bold text-ink">{label}</div>

      <textarea
        className="mt-2.5 min-h-[120px] w-full resize-y rounded-xl border border-border bg-surface p-4 text-base leading-7 text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {qtField(
        "묵상 (Meditation)",
        "오늘 말씀을 통해 느낀 점을 자유롭게 적어보세요.",
        meditation,
        setMeditation,
      )}
      {qtField(
        "적용 (Application)",
        "이 말씀을 삶에 어떻게 적용하시겠어요?",
        application,
        setApplication,
      )}
      {qtField("기도 (Prayer)", "오늘의 기도를 적어보세요.", prayer, setPrayer)}

      <div className="rounded-2xl bg-primary-soft p-5">
        <h3 className="text-base font-bold text-primary-deep">오늘의 필사 요약</h3>

        <div className="mt-2.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-body">범위</span>
            <strong className="text-sm font-bold text-ink">{rangeLabel}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-body">언어</span>
            <strong className="text-sm font-bold text-ink">
              {language === "ko" ? "한국어" : "영어"}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-body">Key Verse</span>
            <strong className="text-sm font-bold text-ink">
              {selectedKeyVerse
                ? `${bookName(bookNo)} ${chapter}:${selectedKeyVerse.verseNo}`
                : "-"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
