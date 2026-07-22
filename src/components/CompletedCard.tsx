import type { MyStatistics } from "../api/stats";
import type { UserProgress } from "../api/users";
import { Sticker, PencilSparkles } from 'lucide-react';

interface CompletedCardProps {
  progress: UserProgress | null;
  statistics: MyStatistics | null;
  isLoading: boolean;
}

function CompletedCard({
  progress,
  statistics,
  isLoading,
}: CompletedCardProps) {
  if (isLoading) {
    return (
      <section className="home-card home-stat-card home-stat-card--lavender home-card--loading">
        완료 기록을 불러오는 중...
      </section>
    );
  }

  if (!progress || !statistics) {
    return (
      <section className="home-card home-stat-card home-stat-card--lavender home-card--loading">
        완료 기록을 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="home-card home-stat-card home-stat-card--lavender">
      <div className="home-stat-card__header">
        <span className="home-stat-icon--lavender" aria-hidden="true">
          <Sticker size={25} />
        </span>
        <h2>완료한 필사</h2>
      </div>

      <div className="home-stat-card__metric">
        <strong>{progress.completedBooks}권</strong>
        <p>총 {statistics.totalCount.toLocaleString()}회</p>
      </div>

      <div className="home-stat-card__visual home-stat-card__visual--check" aria-hidden="true">
        <span><PencilSparkles size={50} /></span>
      </div>
    </section>
  );
}

export default CompletedCard;
