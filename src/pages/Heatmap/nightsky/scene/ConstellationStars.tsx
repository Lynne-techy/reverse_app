// 발자국 별자리 — 절 하나가 별 하나. 채워진 절은 밝은 코어 + 부드러운 글로우(스프라이트) +
// 주변을 감싸는 별무리 파티클로 "반짝이는 성단"처럼 보인다(불투명 전구 느낌 배제).
// 아직 안 채워진 절은 흐린 점. 별을 잇는 선(edges)은 상시 은은히 표시.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

import type { ConstellationConfig, StarNode } from "../constellations";

/** 방사형 그라디언트 소프트 글로우 텍스처(별 글로우·파티클 공용). 한 번만 만들어 캐시. */
let glowTexture: THREE.Texture | null = null;
function getGlowTexture(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,248,224,1)");
  grad.addColorStop(0.18, "rgba(255,232,186,0.6)");
  grad.addColorStop(0.45, "rgba(255,210,140,0.2)");
  grad.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  glowTexture = tex;
  return tex;
}

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

function Star({
  node,
  lit,
  reducedMotion,
}: {
  node: StarNode;
  lit: boolean;
  reducedMotion: boolean;
}) {
  const glowRef = useRef<THREE.Sprite>(null);
  const clusterRef = useRef<THREE.Points>(null);
  const size = node.size ?? 1;
  const coreR = 0.045 + size * 0.03;

  const tex = useMemo(getGlowTexture, []);
  const cluster = useMemo(() => (lit ? makeCluster(size) : null), [lit, size]);
  const glowBase = 0.7 + size * 0.45;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (glowRef.current) {
      const twinkle = reducedMotion ? 1 : 0.85 + Math.sin(t * 1.4 + node.verseNo) * 0.15;
      glowRef.current.scale.setScalar(glowBase * twinkle);
    }

    if (clusterRef.current && !reducedMotion) {
      clusterRef.current.rotation.z = t * 0.05 + node.verseNo;
      const mat = clusterRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.55 + Math.sin(t * 2 + node.verseNo) * 0.2;
    }
  });

  return (
    <group position={node.pos}>
      {/* 코어 — 작고 또렷한 빛점 */}
      <mesh>
        <sphereGeometry args={[coreR, 12, 12]} />
        <meshBasicMaterial
          color={lit ? "#fffdf5" : "#6274a8"}
          toneMapped={false}
          transparent
          opacity={lit ? 1 : 0.55}
        />
      </mesh>

      {lit && (
        <>
          {/* 부드러운 글로우(스프라이트) — 카메라를 향하는 방사형 그라디언트 */}
          <sprite ref={glowRef}>
            <spriteMaterial
              map={tex}
              color="#ffe7bc"
              transparent
              opacity={0.9}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>

          {/* 별무리 — 소프트 파티클로 감싼다 */}
          <points ref={clusterRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[cluster!, 3]} />
            </bufferGeometry>
            <pointsMaterial
              map={tex}
              size={0.16}
              color="#fff1cf"
              sizeAttenuation
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              alphaTest={0.01}
              toneMapped={false}
            />
          </points>
        </>
      )}
    </group>
  );
}

interface ConstellationStarsProps {
  config: ConstellationConfig;
  covered: Set<number>;
  /** 실제 절 수 — 이 이상의 앵커는 그리지 않는다. */
  verseCount: number;
  reducedMotion: boolean;
}

export default function ConstellationStars({
  config,
  covered,
  verseCount,
  reducedMotion,
}: ConstellationStarsProps) {
  const starByVerse = useMemo(() => new Map(config.stars.map((s) => [s.verseNo, s])), [config]);

  const visibleStars = config.stars.filter((s) => s.verseNo <= verseCount);

  const edges = config.edges.filter(
    ([a, b]) => a <= verseCount && b <= verseCount && starByVerse.has(a) && starByVerse.has(b),
  );

  return (
    // 문구 위에 뜨도록 위로 올리고(+y), 좌우 여백·문구와의 간격 확보를 위해 축소.
    <group position={[0, 0.8, 0]} scale={0.82}>
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[starByVerse.get(a)!.pos, starByVerse.get(b)!.pos]}
          color="#c7d4ff"
          lineWidth={2}
          transparent
          opacity={0.55}
        />
      ))}

      {visibleStars.map((s) => (
        <Star key={s.verseNo} node={s} lit={covered.has(s.verseNo)} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}
