import type { Verse } from "../api/verses";
import { formatVerseRef } from "../lib/verseRef";

interface TodayVerseProps {
  verse: Verse | null;
  isLoading: boolean;
}

function TodayVerse({ verse, isLoading }: TodayVerseProps) {
  if (isLoading) {
    return (
      <section className="home-card home-card--loading">
        오늘의 말씀을 불러오는 중...
      </section>
    );
  }

  if (!verse) {
    return (
      <section className="home-card home-card--loading">
        오늘의 말씀을 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="home-card home-verse-card">
      <div className="home-verse-card__icon" aria-hidden="true">
        ✦
      </div>

      <div className="home-verse-card__content">
        <div className="home-verse-card__header">
          <h2>오늘의 말씀</h2>
          <span>{formatVerseRef(verse)}</span>
        </div>

        <blockquote>{verse.text}</blockquote>

        <p>{formatVerseRef(verse)}</p>
      </div>
    </section>
  );
}

export default TodayVerse;
