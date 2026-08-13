// 밤하늘 탭 셸 (2D) — 범위 선택(전체 은하/경전별 별자리) + 경전 선택(BookCombobox) +
// 미리보기 토글 + 범례 + 3D 씬(lazy).
// ⚠️ 이 파일은 three/@react-three/*를 "정적 import 하지 않는다". 씬은 아래 lazy import로만 로드해
//    three.js가 별도 async 청크로 분리되게 한다(메인/히트맵 번들 영향 0).

import { lazy, Suspense, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import Skeleton from "../../../components/Skeleton";
import { bookName } from "../../../data/books";
import { EMOTIONS } from "../../../data/emotions";
import { BookCombobox } from "../../Pilsa/steps/BookCombobox";
import { CONSTELLATIONS, getConstellation, type ConstellationConfig } from "./constellations";
import { isWebGLAvailable } from "./webglSupport";
import { useBookProgress } from "./useBookProgress";
import { useTotalProgress } from "./useTotalProgress";
import { TOTAL_SKY_CONFIG, TOTAL_SKY_EMOTIONS } from "./totalSky";
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

/** 밤하늘 범위 — 전체(66권 은하) 또는 경전별 별자리. */
type SkyScope = "total" | "book";

export default function NightSkyTab() {
  const [scope, setScope] = useState<SkyScope>("total");
  const [bookNo, setBookNo] = useState(DEFAULT_BOOK_NO);
  const [demo, setDemo] = useState(false);

  const config = getConstellation(bookNo);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* 범위 선택: 전체(66권) / 경전별 */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">밤하늘 선택</div>

        <div role="group" aria-label="밤하늘 범위" className="mt-3 flex gap-2">
          <ScopeButton active={scope === "total"} onClick={() => setScope("total")}>
            전체
          </ScopeButton>
          <ScopeButton active={scope === "book"} onClick={() => setScope("book")}>
            경전별
          </ScopeButton>
        </div>

        {scope === "total" ? (
          <p className="mt-3 text-sm text-sub">
            성경 전체(66권)의 진척이 별 100개의 은하로 차올라요 — 별 하나가 전체의 1%예요.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-sub">
              지금은 {READY_BOOK_NAMES}의 밤하늘이 준비돼 있어요.
            </p>
            <BookCombobox bookNo={bookNo} setBookNo={setBookNo} />
          </>
        )}
      </div>

      {scope === "total" ? (
        <TotalSkyView demo={demo} setDemo={setDemo} />
      ) : config ? (
        <ConstellationView config={config} demo={demo} setDemo={setDemo} />
      ) : (
        <ComingSoon bookName={bookName(bookNo)} />
      )}
    </div>
  );
}

/** 범위 선택 버튼 — HeatmapPage 탭 스위처와 같은 시각 언어. */
function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
        active ? "border-brand bg-primary-soft text-brand" : "border-border bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/** 미리보기(완성형 데모) 토글 — 전체/경전별 뷰가 공유한다. */
function DemoToggle({
  demo,
  setDemo,
}: {
  demo: boolean;
  setDemo: (updater: (prev: boolean) => boolean) => void;
}) {
  return (
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
  );
}

/** 전체(66권) 뷰 — 성경 전체 진척을 100노드 은하로. 진행도 훅은 여기서만 실행된다. */
function TotalSkyView({
  demo,
  setDemo,
}: {
  demo: boolean;
  setDemo: (updater: (prev: boolean) => boolean) => void;
}) {
  const { anchorFractions, coveredCount, totalVerses, isError } = useTotalProgress(demo);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const SymbolIcon = TOTAL_SKY_CONFIG.symbol;

  return (
    <div className="flex flex-col gap-3">
      {/* 범례 + 미리보기(데모) 토글 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-body">
          <SymbolIcon size={20} className="flex-none text-brand" aria-hidden="true" />
          <span>
            <b className="text-ink">{TOTAL_SKY_CONFIG.symbolLabel}</b> · 필사한 만큼 은하가 차올라요
          </span>
        </div>

        <DemoToggle demo={demo} setDemo={setDemo} />
      </div>

      {/* 진행도 숫자는 씬(NightSkyScene) 하단 오버레이에서 보여준다 — 여기선 실패했을 때만 알린다. */}
      {isError && !demo && <p className="px-1 text-sm text-sub">진행도를 불러오지 못했어요</p>}

      {webglOk ? (
        <SceneErrorBoundary
          fallback={
            <NightSkyFallback
              config={TOTAL_SKY_CONFIG}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          }
        >
          <Suspense fallback={<Skeleton height="70vh" radius={16} />}>
            <NightSkyScene
              config={TOTAL_SKY_CONFIG}
              anchorFractions={anchorFractions}
              anchorEmotions={TOTAL_SKY_EMOTIONS}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <NightSkyFallback
          config={TOTAL_SKY_CONFIG}
          coveredCount={coveredCount}
          totalVerses={totalVerses}
        />
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
  const { anchorFractions, anchorEmotions, coveredCount, totalVerses, isError } = useBookProgress(
    config.bookNo,
    config.anchors.length,
    demo,
  );
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const SymbolIcon = config.symbol;

  // 이 경전의 보석 별에 실제로 등장하는 감정만 색 범례로 보여준다 (EMOTIONS 순서 유지).
  const presentEmotions = useMemo(
    () => EMOTIONS.filter((emotion) => anchorEmotions.includes(emotion.code)),
    [anchorEmotions],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 범례 + 미리보기(데모) 토글 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-body">
          <SymbolIcon size={20} className="flex-none text-brand" aria-hidden="true" />
          <span>
            <b className="text-ink">{config.symbolLabel}</b> · 필사한 만큼 별이 켜져요
          </span>
        </div>

        <DemoToggle demo={demo} setDemo={setDemo} />
      </div>

      {/* 진행도 숫자는 씬(NightSkyScene) 하단 오버레이에서 보여준다 — 여기선 실패했을 때만 알린다. */}
      {isError && !demo && <p className="px-1 text-sm text-sub">진행도를 불러오지 못했어요</p>}

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
