// WebGL 불가/씬 예외 시 보여줄 2D 폴백 — three 없이 심볼 아이콘 + 대표 문구만.

import type { ConstellationConfig } from "./constellations";

interface NightSkyFallbackProps {
  config: ConstellationConfig;
  /** 필사한 절 수 / 경전 전체 절 수. */
  coveredCount: number;
  totalVerses: number;
}

export default function NightSkyFallback({
  config,
  coveredCount,
  totalVerses,
}: NightSkyFallbackProps) {
  const Symbol = config.symbol;

  return (
    <div className="relative flex h-[70vh] min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#070a1a] px-6 text-center">
      <Symbol size={64} strokeWidth={1.5} className="text-amber-200/80" aria-hidden="true" />

      <p className="mt-5 max-w-md text-[15px] font-medium leading-7 text-white/85">
        “{config.phrase.text}”
      </p>
      <p className="mt-2 text-xs font-semibold tracking-wide text-amber-200/70">
        — {config.phrase.ref}
      </p>

      <p className="mt-6 text-sm text-white/60">
        {coveredCount}/{totalVerses}절 · 3D를 표시할 수 없어 간단 화면으로 보여드려요
      </p>
    </div>
  );
}
