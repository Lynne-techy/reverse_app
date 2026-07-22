type LanguageMode = "ko" | "en";

interface LanguageStepProps {
  language: LanguageMode;
  setLanguage: (mode: LanguageMode) => void;
}

export function LanguageStep({ language, setLanguage }: LanguageStepProps) {
  const languageCard = (mode: LanguageMode, flag: string, title: string, desc: string) => {
    const selected = language === mode;
    return (
      <button
        type="button"
        onClick={() => setLanguage(mode)}
        className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition ${
          selected ? "border-brand bg-primary-soft" : "border-border bg-white"
        }`}
      >
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-fill text-2xl">
          {flag}
        </span>

        <span className="flex-1">
          <span className="block text-[15px] font-bold text-ink">{title}</span>
          <span className="block text-xs text-sub">{desc}</span>
        </span>

        {selected && <span className="text-base font-bold text-brand">✓</span>}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {languageCard("ko", "🇰🇷", "한국어", "우리말 성경으로 필사")}
      {languageCard("en", "🇺🇸", "English", "NIV / ESV 필사")}
    </div>
  );
}
