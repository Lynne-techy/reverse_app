import { todayVerse } from "../data/dummy";

export default function TodayVerse() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-jandi-4 px-7 py-9 text-white shadow-sm sm:px-10 sm:py-12">
      <p className="text-sm font-medium text-white/70">오늘의 말씀 · {todayVerse.reference}</p>

      <blockquote className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
        “{todayVerse.text}”
      </blockquote>

      <p className="mt-6 text-sm text-white/80">
        내가 적은 만큼 만나는 하나님 — 오늘의 한 절을 손으로 적어보세요.
      </p>

      <button
        type="button"
        className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand transition-transform hover:-translate-y-0.5"
      >
        오늘의 필사 시작하기 →
      </button>
    </section>
  );
}
