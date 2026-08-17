// 밤하늘 탭 셸 (2D) — 범위 선택(전체 은하/경전별 별자리) + 경전 선택(BookCombobox) +
// 미리보기 토글 + 범례 + 3D 씬(lazy).
// ⚠️ 이 파일은 three/@react-three/*를 "정적 import 하지 않는다". 씬은 아래 lazy import로만 로드해
//    three.js가 별도 async 청크로 분리되게 한다(메인/히트맵 번들 영향 0).

import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import Skeleton from "../../../components/Skeleton";
import { bookName } from "../../../data/books";
import { BOOK_GENRES, type GenreCode } from "../../../data/bookGenres";
import { EMOTIONS } from "../../../data/emotions";
import { BookCombobox } from "../../Pilsa/steps/BookCombobox";
import type { GenreProgress } from "./bookCoverage";
import { CONSTELLATIONS, getConstellation, type ConstellationConfig } from "./constellations";
import { formatPercent } from "./formatPercent";
import { isWebGLAvailable } from "./webglSupport";
import { useBookProgress } from "./useBookProgress";
import { useGenreProgress } from "./useGenreProgress";
import { useKeyVerse } from "./useKeyVerse";
import { useTotalProgress } from "./useTotalProgress";
import { TOTAL_SKY_META } from "./totalSky";
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

  // 은하에서 성단을 누르면 그 경전의 별자리로 — 범위와 경전 선택을 한 번에 옮긴다.
  const openBook = useCallback((selected: number) => {
    setBookNo(selected);
    setScope("book");
  }, []);

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
            성경 66권이 경전 타입별로 여섯 갈래의 은하를 이뤄요 — 경전 하나가 성단 하나예요.
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
        <TotalSkyView demo={demo} setDemo={setDemo} onSelectBook={openBook} />
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

/**
 * 전체(66권) 뷰 — 경전 타입 6종이 여섯 갈래 팔을 이루는 "말씀의 은하".
 * 하단 큰 진척 수치는 서버 집계(useTotalProgress), 별빛 색·카테고리 진행도는 useGenreProgress가 낸다.
 */
function TotalSkyView({
  demo,
  setDemo,
  onSelectBook,
}: {
  demo: boolean;
  setDemo: (updater: (prev: boolean) => boolean) => void;
  /** 은하에서 성단을 눌렀을 때 — 그 경전의 별자리로 넘어간다. */
  onSelectBook: (bookNo: number) => void;
}) {
  const { coveredCount, totalVerses, isError } = useTotalProgress(demo);
  const { bookFractions, genres, isError: isGenreError } = useGenreProgress(demo);
  const [highlight, setHighlight] = useState<GenreCode | null>(null);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const genreFractions = useMemo(() => genres.map((genre) => genre.fraction), [genres]);
  const SymbolIcon = TOTAL_SKY_META.symbol;

  // 짚고 있는 타입이 있으면 캡션도 그 타입으로 바꿔 색-이름을 한 번 더 이어 준다.
  const focused = highlight ? BOOK_GENRES.find((genre) => genre.code === highlight) : null;
  const meta = focused
    ? { ...TOTAL_SKY_META, caption: `${focused.label} · ${focused.range}` }
    : TOTAL_SKY_META;

  return (
    <div className="flex flex-col gap-3">
      {/* 상단 요약 + 미리보기(데모) 토글 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-body">
          <SymbolIcon size={20} className="flex-none text-brand" aria-hidden="true" />
          <span>
            <b className="text-ink">{TOTAL_SKY_META.symbolLabel}</b> · 별에 커서를 올리면 어느
            경전인지 보이고, 누르면 그 별자리로 가요
          </span>
        </div>

        <DemoToggle demo={demo} setDemo={setDemo} />
      </div>

      {/* 진행도 숫자는 씬(NightSkyScene) 하단 오버레이에서 보여준다 — 여기선 실패했을 때만 알린다. */}
      {isError && !demo && <p className="px-1 text-sm text-sub">진행도를 불러오지 못했어요</p>}

      <GenreLegend
        genres={genres}
        highlight={highlight}
        setHighlight={setHighlight}
        isError={isGenreError && !demo}
      />

      {webglOk ? (
        <SceneErrorBoundary
          fallback={
            <NightSkyFallback meta={meta} coveredCount={coveredCount} totalVerses={totalVerses} />
          }
        >
          <Suspense fallback={<Skeleton height="70vh" radius={16} />}>
            <NightSkyScene
              variant="galaxy"
              meta={meta}
              bookFractions={bookFractions}
              genreFractions={genreFractions}
              highlight={highlight}
              onSelectBook={onSelectBook}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <NightSkyFallback meta={meta} coveredCount={coveredCount} totalVerses={totalVerses} />
      )}
    </div>
  );
}

/**
 * 경전 타입 색 범례 — "이 색이 어떤 카테고리인지"를 은하 밖에서 읽게 한다.
 * 칩을 누르면 그 타입의 팔만 남기고 나머지 별빛이 물러나 색-카테고리가 눈으로 이어진다.
 * (경전별 뷰의 감정색 범례와 같은 역할 — 축만 감정 → 경전 타입으로 다르다.)
 */
function GenreLegend({
  genres,
  highlight,
  setHighlight,
  isError,
}: {
  genres: GenreProgress[];
  highlight: GenreCode | null;
  setHighlight: (genre: GenreCode | null) => void;
  isError: boolean;
}) {
  const focusedIndex = highlight ? BOOK_GENRES.findIndex((g) => g.code === highlight) : -1;
  const focusedGenre = focusedIndex >= 0 ? BOOK_GENRES[focusedIndex] : null;
  const focusedProgress = focusedIndex >= 0 ? genres[focusedIndex] : null;

  return (
    <div className="rounded-2xl border border-border bg-white px-4 py-3">
      <div className="text-sm text-body">
        <b className="text-ink">색은 경전의 타입</b> · 필사한 만큼 그 타입의 별빛이 켜져요
      </div>

      <div role="group" aria-label="경전 타입 색 범례" className="mt-2.5 flex flex-wrap gap-2">
        {BOOK_GENRES.map((genre, index) => {
          const progress = genres[index];
          const active = highlight === genre.code;

          return (
            <button
              key={genre.code}
              type="button"
              aria-pressed={active}
              onClick={() => setHighlight(active ? null : genre.code)}
              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${
                active ? "text-ink" : "border-border text-sub hover:text-ink"
              }`}
              style={
                active
                  ? { borderColor: genre.starColor, backgroundColor: `${genre.starColor}26` }
                  : undefined
              }
            >
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 flex-none rounded-full"
                style={{
                  backgroundColor: genre.starColor,
                  boxShadow: `0 0 6px ${genre.starColor}`,
                }}
              />
              {genre.label}
              {progress && (
                <span className="tabular-nums font-bold">
                  {formatPercent(progress.covered, progress.total)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 짚은 타입의 상세 — 어떤 권들이 이 색인지, 얼마나 필사했는지. */}
      {focusedGenre && focusedProgress && (
        <p className="mt-2.5 text-xs text-sub">
          <b className="text-ink">{focusedGenre.label}</b> · {focusedGenre.range} ·{" "}
          <span className="tabular-nums">
            {focusedProgress.covered.toLocaleString()}/{focusedProgress.total.toLocaleString()}절
          </span>
        </p>
      )}

      {isError && (
        <p className="mt-2.5 text-xs text-sub">
          타입별 진행도를 불러오지 못했어요 — 별빛이 아직 켜지지 않아요
        </p>
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
  const keyVerse = useKeyVerse(config.bookNo);
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  const SymbolIcon = config.symbol;

  // 유저가 필사하며 고른 대표절이 있으면 고정 대표 문구 대신 그 절을 띄운다 — "나의 밤하늘"답게.
  const displayConfig = useMemo(
    () =>
      keyVerse
        ? {
            ...config,
            phrase: {
              ref: `${keyVerse.bookName} ${keyVerse.chapter}:${keyVerse.verseNo}`,
              text: keyVerse.text,
            },
          }
        : config,
    [config, keyVerse],
  );

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
              meta={displayConfig}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          }
        >
          <Suspense fallback={<Skeleton height="70vh" radius={16} />}>
            <NightSkyScene
              variant="constellation"
              meta={displayConfig}
              config={displayConfig}
              anchorFractions={anchorFractions}
              anchorEmotions={anchorEmotions}
              coveredCount={coveredCount}
              totalVerses={totalVerses}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <NightSkyFallback
          meta={displayConfig}
          coveredCount={coveredCount}
          totalVerses={totalVerses}
        />
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
