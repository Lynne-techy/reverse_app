// 임시 플레이스홀더 — 실제 추천 페이지는 팀원이 작성 예정.
// App.tsx가 default import로 라우팅 중이라, 빌드 통과를 위해 최소 default export만 제공한다.
import { useState } from "react";
import { Link } from "react-router-dom";

type MoodId =
  | "tired"
  | "anxious"
  | "grateful"
  | "lonely";

type Mood = {
  id: MoodId;
  emoji: string;
  label: string;
};

type VerseRecommendation = {
  mood: MoodId;
  title: string;
  reference: string;
  verse: string;
  description: string;
};

const moods: Mood[] = [
  {
    id: "tired",
    emoji: "😮‍💨",
    label: "지치고 힘들어요",
  },
  {
    id: "anxious",
    emoji: "😟",
    label: "마음이 불안해요",
  },
  {
    id: "grateful",
    emoji: "😊",
    label: "감사한 마음이에요",
  },
  {
    id: "lonely",
    emoji: "🌙",
    label: "외롭고 쓸쓸해요",
  },
];

const recommendations: VerseRecommendation[] = [
  {
    mood: "tired",
    title: "오늘은 잠시 쉬어가도 괜찮아요",
    reference: "마태복음 11장 28절",
    verse:
      "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라.",
    description:
      "지친 하루를 보내고 있다면, 모든 짐을 혼자 감당하지 않아도 된다는 말씀을 만나보세요.",
  },
  {
    mood: "anxious",
    title: "불안한 마음을 맡겨보세요",
    reference: "빌립보서 4장 6-7절",
    verse:
      "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로 너희 구할 것을 감사함으로 하나님께 아뢰라.",
    description:
      "앞일이 걱정될 때, 염려를 기도로 바꾸는 시간을 가져보세요.",
  },
  {
    mood: "grateful",
    title: "감사하는 마음을 기록해보세요",
    reference: "데살로니가전서 5장 18절",
    verse:
      "범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라.",
    description:
      "오늘 발견한 작은 감사들을 떠올리며 말씀을 천천히 적어보세요.",
  },
  {
    mood: "lonely",
    title: "혼자가 아니라는 말씀을 만나보세요",
    reference: "이사야 41장 10절",
    verse:
      "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라.",
    description:
      "외로운 순간에도 함께하신다는 약속을 마음에 담아보세요.",
  },
];

const additionalVerses = [
  {
    reference: "시편 23편 1-2절",
    title: "평안이 필요한 날",
    description:
      "여호와는 나의 목자시니 내게 부족함이 없으리로다.",
    tag: "평안",
  },
  {
    reference: "잠언 3장 5-6절",
    title: "결정을 앞두고 있는 날",
    description:
      "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.",
    tag: "용기",
  },
  {
    reference: "로마서 12장 12절",
    title: "조금 더 힘을 내고 싶은 날",
    description:
      "소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며.",
    tag: "소망",
  },
];

function RecommendPage() {
  const [selectedMood, setSelectedMood] =
    useState<MoodId>("tired");

  const selectedRecommendation =
    recommendations.find(
      (recommendation) =>
        recommendation.mood === selectedMood,
    ) ?? recommendations[0];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* 페이지 제목 */}
      <section>
        <p className="m-0 text-sm font-semibold text-brand">
          말씀 추천
        </p>

        <h1 className="mb-0 mt-2 text-3xl font-bold text-slate-900">
          오늘 마음은 어떠신가요?
        </h1>

        <p className="mb-0 mt-3 text-sm leading-6 text-slate-500">
          지금의 마음과 가까운 감정을 선택하면
          필사하기 좋은 말씀을 추천해드려요.
        </p>
      </section>

      {/* 감정 선택 버튼 */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-slate-900">
          내 마음 선택하기
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {moods.map((mood) => {
            const isSelected =
              selectedMood === mood.id;

            return (
              <button
                key={mood.id}
                type="button"
                onClick={() =>
                  setSelectedMood(mood.id)
                }
                className={[
                  "flex items-center gap-2 rounded-full border px-4 py-3",
                  "text-sm font-medium transition",
                  isSelected
                    ? "border-brand bg-blue-50 text-brand"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
                ].join(" ")}
              >
                <span className="text-lg">
                  {mood.emoji}
                </span>

                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 선택된 추천 말씀 */}
      <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-blue-700 text-white shadow-lg shadow-blue-100">
        <div className="p-7 md:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              오늘의 추천 말씀
            </span>

            <span
              aria-hidden="true"
              className="text-3xl"
            >
              ✦
            </span>
          </div>

          <h2 className="mb-0 mt-7 text-2xl font-bold leading-snug md:text-3xl">
            {selectedRecommendation.title}
          </h2>

          <blockquote className="mb-0 mt-6 max-w-3xl text-base leading-8 text-white/90 md:text-lg">
            “{selectedRecommendation.verse}”
          </blockquote>

          <p className="mb-0 mt-4 text-sm font-semibold text-blue-100">
            {selectedRecommendation.reference}
          </p>

          <p className="mb-0 mt-6 max-w-2xl text-sm leading-6 text-white/70">
            {selectedRecommendation.description}
          </p>

          <Link
            to="/pilsa"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand no-underline transition hover:bg-blue-50"
          >
            <span aria-hidden="true">✎</span>
            이 말씀으로 필사하기
          </Link>
        </div>
      </section>

      {/* 다른 추천 말씀 */}
      <section className="mt-10">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">
            이런 말씀도 추천해요
          </h2>

          <p className="mb-0 mt-2 text-sm text-slate-500">
            오늘 천천히 읽고 기록하기 좋은
            말씀들이에요.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {additionalVerses.map((verse) => (
            <article
              key={verse.reference}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
                  {verse.tag}
                </span>

                <span
                  aria-hidden="true"
                  className="text-slate-300"
                >
                  ♡
                </span>
              </div>

              <h3 className="mb-0 mt-5 text-lg font-bold text-slate-900">
                {verse.title}
              </h3>

              <p className="mb-0 mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {verse.description}
              </p>

              <p className="mb-0 mt-5 text-xs font-semibold text-brand">
                {verse.reference}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default RecommendPage;
