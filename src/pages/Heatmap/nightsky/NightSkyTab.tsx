// 밤하늘 탭 셸 (2D) — 경전 선택(BookCombobox) + 미리보기 토글 + 범례 + 3D 씬(lazy).
// ⚠️ 이 파일은 three/@react-three/*를 "정적 import 하지 않는다". 씬은 아래 lazy import로만 로드해
//    three.js가 별도 async 청크로 분리되게 한다(메인/히트맵 번들 영향 0).

import { lazy, Suspense, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import Skeleton from "../../../components/Skeleton";
import { bookName } from "../../../data/books";
import { EMOTIONS } from "../../../data/emotions";
import { BookCombobox } from "../../Pilsa/steps/BookCombobox";
import { CONSTELLATIONS, getConstellation, type ConstellationConfig } from "./constellations";
import { genreTheme } from "./themes";
import { isWebGLAvailable } from "./webglSupport";
import { useBookProgress } from "./useBookProgress";
import SceneErrorBoundary from "./SceneErrorBoundary";
import NightSkyFallback from "./NightSkyFallback";

// three.js를 끌어오는 유일한 지점 — 밤하늘을 열 때만 청크를 받는다.
const NightSkyScene = lazy(() => import("./NightSkyScene"));

/** 별자리가 준비된 경전 — 전부면 "모든 경전", 4곳 이하면 이름 나열, 그 사이는 개수 요약. */
const READY_BOOKS = Object.values(CONSTELLATIONS).map((c) => c.bookName);
const READY_BOOK_NAMES =
  READY_BOOKS.length >= 66
    ? "모든 경전"
    : READY_BOOKS.length <= 4
      ? READY_BOOKS.join(", ")
      : `${READY_BOOKS.length}개 경전`;

/** 첫 화면에 보여줄 경전 = 별자리가 준비된 경전 중 정경 순서가 가장 빠른 것. */
const DEFAULT_BOOK_NO = Math.min(...Object.keys(CONSTELLATIONS).map(Number));

export default function NightSkyTab() {
  const [bookNo, setBookNo] = useState(DEFAULT_BOOK_NO);
  const [demo, setDemo] = useState(false);

  const config = getConstellation(bookNo);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* 경전 선택 */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">경전 선택</div>
        <p className="mt-1 text-sm text-sub">지금은 {READY_BOOK_NAMES}의 밤하늘이 준비돼 있어요.</p>
        <BookCombobox bookNo={bookNo} setBookNo={setBookNo} />
      </div>

      {config ? (
        <ConstellationView config={config} demo={demo} setDemo={setDemo} />
      ) : (
        <ComingSoon bookName={bookName(bookNo)} />
      )}
    </div>
  );
}

/** 별자리 config가 있는 경전 전용 뷰 — 진행도 훅은 여기서만 실행된다. */
function ConstellationView({
  config,
  demo,
  setDemo,
}: {
  config: ConstellationConfig;
  demo: boolean;
  setDemo: (updater: (prev: boolean) => boolean) => void;
}) {
  const { anchorFractions, anchorEmotions, coveredCount, totalVerses, isLoading, isError } =
    useBookProgress(config.bookNo, config.anchors.length, demo);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const SymbolIcon = config.symbol;
  const genre = genreTheme(config.bookNo);

  // 이 경전의 보석 별에 실제로 등장하는 감정만 색 범례로 보여준다 (EMOTIONS 순서 유지).
  const presentEmotions = useMemo(
    () => EMOTIONS.filter((emotion) => anchorEmotions.includes(emotion.code)),
    [anchorEmotions],
  );

  const percent = totalVerses > 0 ? Math.round((coveredCount / totalVerses) * 100) : 0;

  const progressLabel = demo
    ? "완성형 미리보기"
    : isError
      ? "진행도를 불러오지 못했어요"
      : isLoading
        ? "진행도 불러오는 중…"
        : `${coveredCount}/${totalVerses}절 필사 완료 · ${percent}%`;

  return (
    <div className="flex flex-col gap-3">
      {/* 범례 + 미리보기(데모) 토글 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-body">
          <SymbolIcon size={20} className="flex-none text-brand" aria-hidden="true" />
          <span>
            <b className="text-ink">{config.symbolLabel}</b> · 필사한 만큼 별이 켜져요
          </span>
          {/* 장르 톤 — 이 경전의 별빛이 왜 이 색인지 알려준다. */}
          <span className="inline-flex items-center gap-1.5 text-xs text-sub">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: genre.glow, boxShadow: `0 0 6px ${genre.glow}` }}
            />
            {genre.name} 톤
          </span>
        </div>

        <button
          type="button"
          aria-pressed={demo}
          onClick={() => setDemo((prev) => !prev)}
          className={`flex-none rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition ${
            demo ? "border-brand bg-primary-soft text-brand" : "border-border bg-white text-sub"
          }`}
        >
          미리보기
        </button>
      </div>

      <p className="px-1 text-sm text-sub">{progressLabel}</p>

      {/* 보석 별 색 범례 — 감정이 큐레이션된 절이 든 경전에서만 보인다. */}
      {presentEmotions.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-1 text-xs text-sub">
          <span>감정이 담긴 절의 별은 그 감정의 빛깔로 빛나요 —</span>
          {presentEmotions.map((emotion) => (
            <span key={emotion.code} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: emotion.starColor,
                  boxShadow: `0 0 6px ${emotion.starColor}`,
                }}
              />
              {emotion.shortLabel}
            </span>
          ))}
        </div>
      )}

      {webglOk ? (
        <SceneErrorBoundary
          fallback={
            <NightSkyFallback
              config={config}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          }
        >
          <Suspense fallback={<Skeleton height="70vh" radius={16} />}>
            <NightSkyScene
              config={config}
              anchorFractions={anchorFractions}
              anchorEmotions={anchorEmotions}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <NightSkyFallback config={config} coveredCount={coveredCount} totalVerses={totalVerses} />
      )}
    </div>
  );
}

/** 아직 밤하늘이 없는 경전용 "준비 중" 카드. */
function ComingSoon({ bookName }: { bookName: string }) {
  return (
    <div className="relative flex h-[60vh] min-h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#070a1a] px-6 text-center">
      <Sparkles size={48} strokeWidth={1.5} className="text-white/50" aria-hidden="true" />
      <p className="mt-4 text-base font-bold text-white/85">
        {bookName || "이 경전"}의 밤하늘은 준비 중이에요
      </p>
      <p className="mt-2 text-sm text-white/55">
        지금은 <b className="text-amber-200/80">{READY_BOOK_NAMES}</b>의 밤하늘을 볼 수 있어요.
      </p>
    </div>
  );
}
