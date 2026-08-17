// 별자리 렌더 — 앵커 별 하나가 경전의 한 구간(anchorProgress.ts). 구간을 채운 비율(fraction)에
// 따라 별이 서서히 밝아지고, 다 채우면(=1) 밝은 코어 + 부드러운 글로우(스프라이트) +
// 별무리 파티클로 "반짝이는 성단"처럼 완성된다(불투명 전구 느낌 배제).
// 아직 안 채워진 앵커는 흐린 점. 앵커를 잇는 선(edges)은 상시 은은히 보이되,
// 양끝이 완성된 선은 더 또렷해져 형태의 완성이 선에서도 읽힌다.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

import { EMOTION_STAR_COLORS, type EmotionCode } from "../../../../data/emotions";
import type { ConstellationConfig, AnchorNode } from "../constellations";
import { getGlowTexture } from "./glowTexture";

/** 별 주변 별무리 파티클 좌표(중심에 몰리도록 분포). */
function makeCluster(size: number, count = 30): Float32Array {
  const arr = new Float32Array(count * 3);
  const maxR = 0.32 + size * 0.24;
  for (let i = 0; i < count; i++) {
    const r = maxR * Math.pow(Math.random(), 1.5); // pow>1 → 중심 밀집
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.6;
  }
  return arr;
}

const UNLIT_COLOR = new THREE.Color("#6274a8");
const LIT_COLOR = new THREE.Color("#fffdf5");

/**
 * 일반 별의 글로우 — 촛불 같은 은은한 별빛 하나로 통일한다.
 * 색은 오직 "구절의 감정"(보석 별)만 말하게 해서 색 언어를 감정 단일 축으로 유지한다
 * (과거 장르별 틴트는 감정색과 두 축이 겹쳐 혼란스럽다는 피드백으로 제거).
 */
const BASE_GLOW = "#f4ecdc";

function Star({
  node,
  fraction,
  glowColor,
  jewel,
  reducedMotion,
}: {
  node: AnchorNode;
  /** 이 앵커가 대표하는 구간의 채움 정도(0~1). 1이면 완성. */
  fraction: number;
  /** 글로우·별무리 틴트 — 장르 톤, 또는 감정 보석 별이면 감정색. */
  glowColor: string;
  /** 감정이 큐레이션된 절이 든 "보석 별" 여부 — 글로우를 살짝 크게 특별 취급. */
  jewel: boolean;
  reducedMotion: boolean;
}) {
  const glowRef = useRef<THREE.Sprite>(null);
  const clusterRef = useRef<THREE.Points>(null);
  const size = node.size ?? 1;
  const coreR = 0.045 + size * 0.03;

  const complete = fraction >= 1;

  const tex = useMemo(getGlowTexture, []);
  // 별무리는 구간 완성의 보상 — 완성 앵커에만 두른다.
  const cluster = useMemo(() => (complete ? makeCluster(size) : null), [complete, size]);
  const glowBase = (0.7 + size * 0.45) * (jewel ? 1.15 : 1);

  // 코어 색: 진행도에 따라 흐린 남색 → 따뜻한 흰색으로.
  const coreColor = useMemo(() => UNLIT_COLOR.clone().lerp(LIT_COLOR, fraction), [fraction]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (glowRef.current) {
      const twinkle = reducedMotion ? 1 : 0.85 + Math.sin(t * 1.4 + node.index) * 0.15;
      // 진행 중인 앵커의 글로우는 채운 만큼만 자란다.
      glowRef.current.scale.setScalar(glowBase * (0.55 + 0.45 * fraction) * twinkle);
    }

    if (clusterRef.current && !reducedMotion) {
      clusterRef.current.rotation.z = t * 0.05 + node.index;
      const mat = clusterRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.55 + Math.sin(t * 2 + node.index) * 0.2;
    }
  });

  return (
    <group position={node.pos}>
      {/* 코어 — 작고 또렷한 빛점. 진행도만큼 밝아진다. */}
      <mesh>
        <sphereGeometry args={[coreR, 12, 12]} />
        <meshBasicMaterial
          color={coreColor}
          toneMapped={false}
          transparent
          opacity={0.55 + 0.45 * fraction}
        />
      </mesh>

      {/* 부드러운 글로우(스프라이트) — 카메라를 향하는 방사형 그라디언트 */}
      {fraction > 0 && (
        <sprite ref={glowRef}>
          <spriteMaterial
            map={tex}
            color={glowColor}
            transparent
            opacity={0.9 * (0.3 + 0.7 * fraction)}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      )}

      {/* 별무리 — 완성된 구간을 소프트 파티클로 감싼다 */}
      {complete && (
        <points ref={clusterRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[cluster!, 3]} />
          </bufferGeometry>
          <pointsMaterial
            map={tex}
            size={0.16}
            color={glowColor}
            sizeAttenuation
            transparent
            opacity={0.7}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            alphaTest={0.01}
            toneMapped={false}
          />
        </points>
      )}
    </group>
  );
}

interface ConstellationStarsProps {
  config: ConstellationConfig;
  /** 앵커별 채움 정도(0~1). index 0 = 앵커 1 (useBookProgress.anchorFractions). */
  fractions: number[];
  /** 앵커별 보석 별 감정색 코드(없으면 null) — useBookProgress.anchorEmotions. */
  emotions: (EmotionCode | null)[];
  reducedMotion: boolean;
}

export default function ConstellationStars({
  config,
  fractions,
  emotions,
  reducedMotion,
}: ConstellationStarsProps) {
  const anchorByIndex = useMemo(() => new Map(config.anchors.map((a) => [a.index, a])), [config]);

  const fractionOf = (index: number) => fractions[index - 1] ?? 0;
  const emotionOf = (index: number) => emotions[index - 1] ?? null;

  const edges = config.edges.filter(([a, b]) => anchorByIndex.has(a) && anchorByIndex.has(b));

  return (
    // 문구 위에 뜨도록 위로 올리고(+y), 좌우 여백·문구와의 간격 확보를 위해 축소.
    // z만 0.5로 압축: 형태는 정면 실루엣 기준으로 그려졌으므로, 깊이를 살짝만 남겨
    // 회전 시 입체감은 유지하되 실루엣이 일그러지지 않게 한다(가독성 우선).
    <group position={[0, 0.8, 0]} scale={[0.82, 0.82, 0.41]}>
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[anchorByIndex.get(a)!.pos, anchorByIndex.get(b)!.pos]}
          color="#c7d4ff"
          lineWidth={2.5}
          transparent
          // 밑그림이 형태 이해의 핵심 — 미완성도 실루엣이 또렷이 읽히게 기본을 올리고,
          // 양끝이 완성된 선은 더 밝힌다.
          opacity={0.5 + 0.35 * Math.min(fractionOf(a), fractionOf(b))}
        />
      ))}

      {config.anchors.map((a) => {
        const emotion = emotionOf(a.index);
        return (
          <Star
            key={a.index}
            node={a}
            fraction={fractionOf(a.index)}
            glowColor={emotion ? EMOTION_STAR_COLORS[emotion] : BASE_GLOW}
            jewel={emotion !== null}
            reducedMotion={reducedMotion}
          />
        );
      })}
    </group>
  );
}
