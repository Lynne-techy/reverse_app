// 밤하늘 3D 씬 — three.js/r3f/drei를 import 하는 "유일한" 모듈.
// NightSkyTab에서 React.lazy로 로드돼 별도 async 청크로 분리된다(메인/히트맵 번들 영향 0).

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import type { ConstellationConfig } from "./constellations";
import Nebula from "./scene/Nebula";
import ConstellationStars from "./scene/ConstellationStars";

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

interface NightSkySceneProps {
  config: ConstellationConfig;
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1 (useBookProgress.anchorFractions). */
  anchorFractions: number[];
  /** 필사한 절 수 / 경전 전체 절 수 — 스크린리더 라벨용. */
  coveredCount: number;
  totalVerses: number;
}

export default function NightSkyScene({
  config,
  anchorFractions,
  coveredCount,
  totalVerses,
}: NightSkySceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const frameloop: "always" | "demand" = reducedMotion ? "demand" : "always";

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
        <ConstellationStars
          config={config}
          fractions={anchorFractions}
          reducedMotion={reducedMotion}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.25}
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.4}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
        />
      </Canvas>

      {/* 대표 문구 — 별자리 밑에 은은히 떠 있는 오버레이 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#070a1a] via-[#070a1a]/70 to-transparent px-6 pb-6 pt-16 text-center">
        <p className="mx-auto max-w-md text-[15px] font-medium leading-7 text-white/85">
          “{config.phrase.text}”
        </p>
        <p className="mt-2 text-xs font-semibold tracking-wide text-amber-200/70">
          — {config.phrase.ref}
        </p>
      </div>

      <span className="sr-only">
        {config.bookName} {config.symbolLabel} 별자리, {coveredCount}/{totalVerses}절 완료
      </span>
    </div>
  );
}
