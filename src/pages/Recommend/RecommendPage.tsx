import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/Skeleton";
import ErrorState from "../../components/ErrorState";
import { getRecommendations } from "../../api/recommend";
import type { Verse } from "../../api/verses";
import { formatVerseRef } from "../../lib/verseRef";
import { EMOTIONS, type EmotionCode } from "../../data/emotions";

function RecommendPage() {
  const navigate = useNavigate();
  // 항상 하나는 선택돼 있도록 첫 감정을 기본값으로 둔다(→ 진입 즉시 추천이 뜬다).
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCode>(EMOTIONS[0].code);

  const activeEmotion = EMOTIONS.find((emotion) => emotion.code === selectedEmotion) ?? EMOTIONS[0];

  // 감정별로 캐시를 나눈다(queryKey에 감정 포함).
  // staleTime: Infinity → 같은 감정으로 되돌아와도 재요청 없이 캐시를 재사용.
  // "무작위 6개"가 왔다 갔다 할 때마다 바뀌면 혼란스러우므로, 새 무작위는 오직
  // "다시 추천받기"(refetch)로만 뽑는다.
  // placeholderData: keepPreviousData → 감정을 바꿔 새 쿼리가 나가는 동안, 화면을
  // 스켈레톤으로 비우지 않고 "이전 감정의 구절"을 그대로 유지한다. 새 데이터가 도착하면
  // 그 자리에서 교체돼 위아래 출렁임(layout shift)이 사라진다.
  // isPlaceholderData=true 인 순간이 "옛 데이터를 보여주며 새로 불러오는 중" 이다.
  const {
    data: verses,
    isPending,
    isError,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery({
    queryKey: ["recommendations", selectedEmotion],
    queryFn: () => getRecommendations(selectedEmotion),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  // 선택한 구절을 필사 페이지로 전달하며 이동한다.
  // state로 넘기므로 PilsaPage는 useLocation().state.verse 로 받는다.
  // (PilsaPage에서 실제로 받아 쓰는 배선은 후속 작업.)
  function goToPilsa(verse: Verse) {
    navigate("/pilsa", { state: { verse } });
  }

  const heroVerse = verses?.[0] ?? null;
  const restVerses = verses?.slice(1) ?? [];
  // verses는 첫 성공/placeholder 전까진 undefined. keepPreviousData 덕에 에러가 나도
  // 이전 감정의 추천이 남아 있으면 그대로 보여준다(전면 에러는 "보여줄 게 아예 없을 때"만).
  const hasData = verses !== undefined;
  const showFullError = isError && !hasData;

  return (
    <main className="w-full max-w-6xl px-6 py-8">
      {/* 페이지 제목 */}
      <section>
        <p className="m-0 text-sm font-semibold text-brand">말씀 추천</p>
        <h1 className="mb-0 mt-2 text-3xl font-bold text-slate-900">오늘 마음은 어떠신가요?</h1>
        <p className="mb-0 mt-3 text-sm leading-6 text-slate-500">
          지금의 마음과 가까운 감정을 선택하면 필사하기 좋은 말씀을 추천해드려요.
        </p>
      </section>

      {/* 감정 선택 */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-slate-900">내 마음 선택하기</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {EMOTIONS.map((emotion) => {
            const isSelected = selectedEmotion === emotion.code;
            return (
              <button
                key={emotion.code}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedEmotion(emotion.code)}
                className={[
                  "flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition",
                  isSelected
                    ? "border-brand bg-blue-50 text-brand"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50",
                ].join(" ")}
              >
                <span className="text-lg">{emotion.emoji}</span>
                <span>{emotion.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 첫 로드 실패(보여줄 데이터 없음) → 공통 에러 상태 화면 */}
      {showFullError && (
        <ErrorState
          className="mt-8"
          message="추천 말씀을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."
          onRetry={() => refetch()}
        />
      )}

      {/* 재요청·감정 전환은 실패했지만 이전 추천이 남아 있으면
          → 콘텐츠를 버리지 않고 유지 + 비파괴적 인라인 배너 */}
      {isError && !showFullError && (
        <div
          role="alert"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-600"
        >
          <span>새 말씀을 불러오지 못했어요 — 이전 추천을 그대로 보여드릴게요.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto shrink-0 font-semibold underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 히어로 추천 카드 (6개 중 첫 구절 강조) */}
      {!showFullError && (
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-blue-700 text-white shadow-lg shadow-blue-100">
          <div className="p-7 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                오늘의 추천 말씀
              </span>
              <span aria-hidden="true" className="text-3xl">
                ✦
              </span>
            </div>

            {/* 격려 카피는 감정별 정적 문구 */}
            <h2 className="mb-0 mt-7 text-2xl font-bold leading-snug md:text-3xl">
              {activeEmotion.heroCopy}
            </h2>

            {isPending ? (
              <div className="mt-6 space-y-3">
                <Skeleton width="80%" height={20} className="!bg-white/25" />
                <Skeleton width="55%" height={20} className="!bg-white/25" />
              </div>
            ) : heroVerse ? (
              <div className={`transition-opacity ${isPlaceholderData ? "opacity-50" : ""}`}>
                <blockquote className="mb-0 mt-6 flex min-h-[6rem] max-w-3xl items-center text-base leading-8 text-white/90 md:text-lg">
                  “{heroVerse.text}”
                </blockquote>
                <p className="mb-0 mt-4 text-sm font-semibold text-blue-100">
                  {formatVerseRef(heroVerse)}
                </p>
                <button
                  type="button"
                  onClick={() => goToPilsa(heroVerse)}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand transition hover:bg-blue-50"
                >
                  <span aria-hidden="true">✎</span>이 말씀으로 필사하기
                </button>
              </div>
            ) : (
              <p className="mb-0 mt-6 text-sm text-white/70">
                이 감정으로 추천할 말씀이 아직 없어요.
              </p>
            )}
          </div>
        </section>
      )}

      {/* 나머지 5개 구절 — 로딩 중이거나 결과가 있을 때만(빈 결과 dangling 섹션 방지) */}
      {!showFullError && (isPending || restVerses.length > 0) && (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="m-0 text-xl font-bold text-slate-900">이런 말씀도 추천해요</h2>
              <p className="mb-0 mt-2 text-sm text-slate-500">
                오늘 천천히 읽고 기록하기 좋은 말씀들이에요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-brand disabled:opacity-50"
            >
              {isFetching ? "불러오는 중…" : "↻ 다시 추천받기"}
            </button>
          </div>

          <div
            className={`mt-5 grid grid-cols-1 gap-4 transition-opacity lg:grid-cols-3 ${
              isPlaceholderData ? "opacity-50" : ""
            }`}
          >
            {isPending
              ? Array.from({ length: 5 }).map((_, index) => (
                  <article key={index} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <Skeleton width="30%" height={18} />
                    <Skeleton width="90%" height={16} className="mt-5" />
                    <Skeleton width="70%" height={16} className="mt-2" />
                  </article>
                ))
              : restVerses.map((verse) => (
                  <article
                    key={verse.id}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
                  >
                    <p className="m-0 text-xs font-semibold text-brand">{formatVerseRef(verse)}</p>
                    <p className="mb-0 mt-3 line-clamp-4 flex-1 text-sm leading-6 text-slate-600">
                      {verse.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => goToPilsa(verse)}
                      className="mt-5 self-start text-sm font-bold text-brand hover:underline"
                    >
                      ✎ 필사하기
                    </button>
                  </article>
                ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default RecommendPage;
