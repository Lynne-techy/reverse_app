// 밤하늘 탭 셸 (2D) — 경전 선택(BookCombobox) + 미리보기 토글 + 범례 + 3D 씬(lazy).
// ⚠️ 이 파일은 three/@react-three/*를 "정적 import 하지 않는다". 씬은 아래 lazy import로만 로드해
//    three.js가 별도 async 청크로 분리되게 한다(메인/히트맵 번들 영향 0).

import { lazy, Suspense, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import Skeleton from "../../../components/Skeleton";
import { bookName } from "../../../data/books";
import { BookCombobox } from "../../Pilsa/steps/BookCombobox";
import { getConstellation, type ConstellationConfig } from "./constellations";
import { isWebGLAvailable } from "./webglSupport";
import { useJohn3Progress } from "./useJohn3Progress";
import SceneErrorBoundary from "./SceneErrorBoundary";
import NightSkyFallback from "./NightSkyFallback";

// three.js를 끌어오는 유일한 지점 — 밤하늘을 열 때만 청크를 받는다.
const NightSkyScene = lazy(() => import("./NightSkyScene"));

const JOHN3_BOOK_NO = 64; // 요한삼서

export default function NightSkyTab() {
  const [bookNo, setBookNo] = useState(JOHN3_BOOK_NO);
  const [demo, setDemo] = useState(false);

  const config = getConstellation(bookNo);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* 경전 선택 */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="text-base font-bold text-brand">경전 선택</div>
        <p className="mt-1 text-sm text-sub">지금은 요한삼서만 밤하늘이 준비돼 있어요.</p>
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

/** 별자리 config가 있는 경전(파일럿=요한삼서) 전용 뷰 — 진행도 훅은 여기서만 실행된다. */
function ConstellationView({
  config,
  demo,
  setDemo,
}: {
  config: ConstellationConfig;
  demo: boolean;
  setDemo: (updater: (prev: boolean) => boolean) => void;
}) {
  const { coveredVerses, verseCount, isLoading, isError } = useJohn3Progress(demo);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const litCount = useMemo(
    () => Array.from(coveredVerses).filter((v) => v <= verseCount).length,
    [coveredVerses, verseCount],
  );

  const SymbolIcon = config.symbol;

  const progressLabel = demo
    ? "완성형 미리보기"
    : isError
      ? "진행도를 불러오지 못했어요"
      : isLoading
        ? "진행도 불러오는 중…"
        : `${litCount}/${verseCount}절 필사 완료`;

  return (
    <div className="flex flex-col gap-3">
      {/* 범례 + 미리보기(데모) 토글 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-body">
          <SymbolIcon size={20} className="flex-none text-brand" aria-hidden="true" />
          <span>
            <b className="text-ink">{config.symbolLabel}</b> · 절 하나가 별 하나예요
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

      {webglOk ? (
        <SceneErrorBoundary
          fallback={
            <NightSkyFallback config={config} litCount={litCount} verseCount={verseCount} />
          }
        >
          <Suspense fallback={<Skeleton height="70vh" radius={16} />}>
            <NightSkyScene config={config} coveredVerses={coveredVerses} verseCount={verseCount} />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <NightSkyFallback config={config} litCount={litCount} verseCount={verseCount} />
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
        지금은 <b className="text-amber-200/80">요한삼서</b>만 볼 수 있어요.
      </p>
    </div>
  );
}
