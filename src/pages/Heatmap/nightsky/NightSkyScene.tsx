// 밤하늘 3D 씬 — three.js/r3f/drei를 import 하는 "유일한" 모듈.
// NightSkyTab에서 React.lazy로 로드돼 별도 async 청크로 분리된다(메인/히트맵 번들 영향 0).
//
// 두 종류의 하늘이 이 셸을 공유한다:
//   · variant="constellation" — 경전 하나의 별자리. 색 = 절의 감정.
//   · variant="galaxy"        — 66권 전체의 은하. 색 = 경전 타입.

import { useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { bookName } from "../../../data/books";
import { GENRE_BY_CODE, genreOf, type GenreCode } from "../../../data/bookGenres";
import type { EmotionCode } from "../../../data/emotions";
import type { ConstellationConfig, SkyMeta } from "./constellations";
import { formatPercent } from "./formatPercent";
import Nebula from "./scene/Nebula";
import ConstellationStars from "./scene/ConstellationStars";
import GalaxyStars from "./scene/GalaxyStars";

/** prefers-reduced-motion 구독 — 켜져 있으면 자동회전·트윈클을 끈다. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

interface SharedProps {
  /** 캡션·상징·대표 문구. */
  meta: SkyMeta;
  /** 필사한 절 수 / 전체 절 수 — 하단 진행도 표기·스크린리더 라벨용. */
  coveredCount: number;
  totalVerses: number;
}

interface ConstellationVariant {
  variant: "constellation";
  config: ConstellationConfig;
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1 (useBookProgress.anchorFractions). */
  anchorFractions: number[];
  /** 앵커별 보석 별 감정색 코드(없으면 null) — useBookProgress.anchorEmotions. */
  anchorEmotions: (EmotionCode | null)[];
}

interface GalaxyVariant {
  variant: "galaxy";
  /** 권별 채움 비율(0~1). index 0 = 창세기. */
  bookFractions: number[];
  /** 장르별 채움 비율(0~1) — BOOK_GENRES 순서. */
  genreFractions: number[];
  /** 범례에서 짚고 있는 경전 타입(없으면 null). */
  highlight: GenreCode | null;
  /** 성단(권)을 누르면 그 경전의 별자리로 — 호출 측이 범위·경전 선택을 바꾼다. */
  onSelectBook: (bookNo: number) => void;
}

type NightSkySceneProps = SharedProps & (ConstellationVariant | GalaxyVariant);

/** 커서가 올라간 성단 — 어느 권인지와 캔버스 안에서의 위치(px). */
interface HoveredBook {
  bookNo: number;
  x: number;
  y: number;
}

export default function NightSkyScene(props: NightSkySceneProps) {
  const { meta, coveredCount, totalVerses } = props;
  const reducedMotion = usePrefersReducedMotion();
  const frameloop: "always" | "demand" = reducedMotion ? "demand" : "always";
  const galaxy = props.variant === "galaxy";
  const [hovered, setHovered] = useState<HoveredBook | null>(null);
  // 호버 상태는 씬 전체를 리렌더하므로, 콜백 신원을 고정해 GalaxyStars가 헛돌지 않게 한다.
  const handleHoverBook = useCallback((next: HoveredBook | null) => setHovered(next), []);

  return (
    <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-2xl bg-[#070a1a]">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#070a1a"]} />
        <ambientLight intensity={0.5} />
        <Nebula reducedMotion={reducedMotion} />

        {props.variant === "galaxy" ? (
          <GalaxyStars
            bookFractions={props.bookFractions}
            genreFractions={props.genreFractions}
            highlight={props.highlight}
            onHoverBook={handleHoverBook}
            onSelectBook={props.onSelectBook}
            reducedMotion={reducedMotion}
          />
        ) : (
          <ConstellationStars
            config={props.config}
            fractions={props.anchorFractions}
            emotions={props.anchorEmotions}
            reducedMotion={reducedMotion}
          />
        )}

        {/* 회전은 "살짝 흔들리는 밤하늘" 정도로 — 별자리는 정면 실루엣 기준이라 크게 돌면 읽기 어렵다.
            은하는 원반이 제 축으로 자전하므로(GalaxyStars) 카메라 자동회전은 끄고,
            대신 사용자가 직접 돌려볼 수 있는 범위를 넓게 열어 원반의 두께를 살펴보게 한다. */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reducedMotion && !galaxy}
          autoRotateSpeed={0.16}
          minPolarAngle={Math.PI / 2 - (galaxy ? 0.55 : 0.25)}
          maxPolarAngle={Math.PI / 2 + (galaxy ? 0.5 : 0.25)}
          minAzimuthAngle={galaxy ? -0.9 : -0.35}
          maxAzimuthAngle={galaxy ? 0.9 : 0.35}
        />
      </Canvas>

      {/* 성단 툴팁 — 은하에서 커서가 올라간 별이 어느 경전인지, 얼마나 필사했는지. */}
      {props.variant === "galaxy" && hovered && (
        <BookTooltip hovered={hovered} fraction={props.bookFractions[hovered.bookNo - 1] ?? 0} />
      )}

      {/* 별자리/은하 이름 캡션 — 무엇을 그린 형태인지 한눈에 알려준다. */}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/75 backdrop-blur-sm">
        {meta.caption ?? `${meta.symbolLabel} 별자리`}
      </div>

      {/* 대표 문구 + 진행도 — 별자리 밑에 은은히 떠 있는 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070a1a] via-[#070a1a]/70 to-transparent px-6 pb-6 pt-16 text-center">
        {/* 진행도는 문장 없이 분수·퍼센트 숫자로만 (로딩·실패로 절 수를 모르면 숨긴다) */}
        {totalVerses > 0 && (
          <p className="mb-3 text-sm font-semibold tabular-nums tracking-wide text-white/70">
            {coveredCount}/{totalVerses} · {formatPercent(coveredCount, totalVerses)}%
          </p>
        )}
        <p className="mx-auto max-w-md text-[15px] font-medium leading-7 text-white/85">
          “{meta.phrase.text}”
        </p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-amber-200/70">
          — {meta.phrase.ref}
        </p>
      </div>

      <span className="sr-only">
        {meta.bookName} {meta.symbolLabel}, {coveredCount}/{totalVerses}절 완료
      </span>
    </div>
  );
}

/**
 * 은하에서 커서가 올라간 성단의 이름표.
 * 캔버스 안쪽 좌표(px)에 붙이되 clamp로 가장자리를 넘지 않게 한다(컨테이너가 overflow-hidden이라 잘린다).
 */
function BookTooltip({ hovered, fraction }: { hovered: HoveredBook; fraction: number }) {
  const genreCode = genreOf(hovered.bookNo);
  const genre = genreCode ? GENRE_BY_CODE[genreCode] : null;

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl border border-white/15 bg-[#0b1024]/85 px-3 py-2 text-center shadow-lg backdrop-blur-sm"
      style={{
        left: `clamp(6rem, ${hovered.x}px, calc(100% - 6rem))`,
        top: `clamp(4rem, ${hovered.y - 14}px, calc(100% - 1rem))`,
      }}
    >
      <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-white/90">
        {genre && (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 flex-none rounded-full"
            style={{ backgroundColor: genre.starColor, boxShadow: `0 0 6px ${genre.starColor}` }}
          />
        )}
        {bookName(hovered.bookNo)}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold tracking-wide text-white/55">
        {genre ? `${genre.label} · ` : ""}
        <span className="tabular-nums">{formatPercent(fraction, 1)}%</span>
      </div>
      <div className="mt-1 text-[11px] font-semibold text-amber-200/70">눌러서 별자리 보기</div>
    </div>
  );
}
