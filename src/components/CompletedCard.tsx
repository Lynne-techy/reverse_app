import { PencilSparkles, Sticker } from "lucide-react";

interface CompletedCardProps {
  meditationCount: number | null;
  isLoading: boolean;
}

function CompletedCard({ meditationCount, isLoading }: CompletedCardProps) {
  if (isLoading) {
    return (
      <section className="home-card home-stat-card home-stat-card--lavender home-card--loading">
        기록을 불러오는 중...
      </section>
    );
  }

  if (meditationCount === null) {
    return (
      <section className="home-card home-stat-card home-stat-card--lavender home-card--loading">
        기록을 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="home-card home-stat-card home-stat-card--lavender">
      <div className="home-stat-card__header">
        <span className="home-stat-icon--lavender" aria-hidden="true">
          <Sticker size={25} />
        </span>
        <h2>차곡차곡 쌓인 기록</h2>
      </div>

      <div className="home-stat-card__content">
        <div className="home-stat-block">
          <span className="home-stat-block__label">최근 30일</span>
          <strong className="home-stat-block__value">
            {meditationCount.toLocaleString()}회
          </strong>
        </div>

        <p className="home-stat-card__description">
          필사하며 마음에 남은
          <br />생각을 모았어요.
        </p>
      </div>

      <div
        className="home-stat-card__visual home-stat-card__visual--check"
        aria-hidden="true"
      >
        <PencilSparkles size={50} />
      </div>
    </section>
  );
}

export default CompletedCard;
