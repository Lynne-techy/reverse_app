// 발자국 별자리 — 절 하나가 별 하나. 채워진 절은 밝은 별 + 헤일로 + 별무리(satellite points),
// 아직 안 채워진 절은 흐린 점. 별을 잇는 선(edges)은 상시 은은히 표시해 미완성이어도 형태가 읽힌다.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

import type { ConstellationConfig, StarNode } from "../constellations";

/** 별 주변에 흩뿌릴 별무리(작은 점들) 좌표. */
function makeCluster(size: number, count = 9): Float32Array {
  const arr = new Float32Array(count * 3);
  const radius = 0.16 + size * 0.12;
  for (let i = 0; i < count; i++) {
    const r = radius * (0.3 + Math.random() * 0.7);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.5;
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
  const haloRef = useRef<THREE.Mesh>(null);
  const size = node.size ?? 1;
  const coreR = 0.06 + size * 0.055;

  const cluster = useMemo(() => (lit ? makeCluster(size) : null), [lit, size]);

  useFrame((state) => {
    if (!haloRef.current) return;
    const t = state.clock.elapsedTime;
    const twinkle = reducedMotion ? 1 : 0.8 + Math.sin(t * 1.6 + node.verseNo) * 0.2;
    haloRef.current.scale.setScalar(1 + twinkle * 0.5);
  });

  return (
    <group position={node.pos}>
      {/* 별 코어 */}
      <mesh>
        <sphereGeometry args={[coreR, 16, 16]} />
        <meshBasicMaterial
          color={lit ? "#fff3d0" : "#5a6ba0"}
          toneMapped={false}
          transparent
          opacity={lit ? 1 : 0.5}
        />
      </mesh>

      {/* 헤일로(발광) — 채워진 별만. additive 누적으로 탁해지지 않게 옅고 작게. */}
      {lit && (
        <mesh ref={haloRef}>
          <sphereGeometry args={[coreR * 2.0, 16, 16]} />
          <meshBasicMaterial
            color="#ffe9c2"
            toneMapped={false}
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 별무리 */}
      {cluster && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[cluster, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color="#fff0c0"
            toneMapped={false}
            sizeAttenuation
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
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
    <group>
      {edges.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[starByVerse.get(a)!.pos, starByVerse.get(b)!.pos]}
          color="#41528a"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      {visibleStars.map((s) => (
        <Star key={s.verseNo} node={s} lit={covered.has(s.verseNo)} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}
