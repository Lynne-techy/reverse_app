import type { MyStatistics } from "../api/stats";

interface StreakStartCardProps {
  statistics: MyStatistics | null;
  isLoading?: boolean;
}

/**
 * streakStart.date(YYYY-MM-DD)로부터 "N개월 전" / "지난달" / "이번 달" 같은
 * 사람이 읽기 좋은 상대 시점 문구를 만든다.
 *
 * TODO(human): 아래 함수 본문을 구현하세요.
 *  - 인자 `dateStr`은 "2026-05-24" 형태의 로컬 날짜 문자열.
 *  - 오늘과의 개월 수 차이를 계산해 "N개월 전"처럼 반환.
 *  - 힌트: 개월 수는 (올해-그해)*12 + (이번달-그달)로 구할 수 있고,
 *    0이면 "이번 달", 1이면 "지난달"처럼 특수 처리할지도 결정 사항.
 *    (Intl.RelativeTimeFormat("ko", { numeric: "auto" })을 써도 됨)
 */
function formatMonthsAgo(dateStr: string): string {
  const today = new Date();
  const lastDate = new Date(dateStr);

  const diff =
    (today.getFullYear() - lastDate.getFullYear()) * 12 + (today.getMonth() - lastDate.getMonth());

  if (diff <= 0) {
    return "이번 달";
  } else if (diff === 1) {
    return "지난달";
  } else {
    return `${diff}개월 전`;
  }
}

// 잔디 아래, 가로로 꽉 채운 카드. 현재 연속 기록과 그 시작점을 이야기하듯 보여준다.
function StreakStartCard({ statistics, isLoading }: StreakStartCardProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
        연속 기록을 불러오는 중…
      </section>
    );
  }

  // 통계가 없거나 아직 연속 기록이 시작되지 않은 경우의 폴백.
  if (!statistics || !statistics.streakStart || statistics.currentStreak <= 0) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-lg font-bold text-slate-800">아직 연속 기록이 없어요</p>
        <p className="mt-1 text-sm text-slate-600">오늘 한 절을 필사하면 새로운 흐름이 시작돼요.</p>
      </section>
    );
  }

  const { currentStreak, streakStart } = statistics;
  const when = formatMonthsAgo(streakStart.date);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-lg font-bold text-slate-800">🔥 {currentStreak}일 연속 기록 중!</p>
      <p className="mt-1 text-sm text-slate-600">
        {when} {streakStart.bookName} {streakStart.chapter}편으로 시작한 흐름이 이어지고 있어요.
      </p>
    </section>
  );
}

export default StreakStartCard;
