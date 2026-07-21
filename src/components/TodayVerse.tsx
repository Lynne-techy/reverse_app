import type { Verse } from "../api/verses";

interface TodayVerseProps {
  verse: Verse | null;
  isLoading: boolean;
}

function TodayVerse({ verse, isLoading }: TodayVerseProps) {
  if (isLoading) {
    return <section className="rounded-2xl bg-white p-6">오늘의 말씀을 불러오는 중...</section>;
  }

  if (!verse) {
    return (
      <section className="rounded-2xl bg-white p-6">오늘의 말씀을 불러오지 못했습니다.</section>
    );
  }

  return (
    <section className="hero-card">
      <p className="text-sm font-semibold text-blue-600">오늘의 말씀</p>

      <p className="mt-4 text-xl leading-relaxed text-slate-800">{verse.text}</p>

      <p className="mt-3 text-right text-sm text-slate-500">
        {verse.bookName} {verse.chapter}:{verse.verseNo}
      </p>
    </section>
  );
}

export default TodayVerse;
