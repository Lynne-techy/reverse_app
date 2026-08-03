// 성운(가스) 배경 — 이미지 에셋 없이 셰이더로 몽환적 색감을 만든다.
// 내향(BackSide) 스피어에 fbm 노이즈 그라디언트(딥블루/퍼플/틸)를 그리고,
// 그 위로 additive 파티클(먼지 별)을 느리게 회전시켜 깊이감을 준다.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p){
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec3 dir = normalize(vPos);
    float t = uTime * 0.02;
    float n = fbm(dir * 2.5 + vec3(t, t * 0.5, -t));
    float n2 = fbm(dir * 5.0 - vec3(t * 0.3));
    float cloud = smoothstep(0.35, 0.95, n * 0.7 + n2 * 0.4);

    float g = dir.y * 0.5 + 0.5;               // 세로 그라디언트
    vec3 col = mix(uColorA * 0.5, uColorA, g); // 베이스 남색
    col = mix(col, uColorB, cloud * 0.8);      // 보라 구름
    col = mix(col, uColorC, pow(cloud, 3.0) * 0.5); // 틸 하이라이트
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** 반경 shell 안에 무작위로 흩뿌린 먼지 별 좌표(Float32Array xyz). */
function makeDust(count: number, inner: number, outer: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = inner + Math.random() * (outer - inner);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

export default function Nebula({ reducedMotion }: { reducedMotion: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dustRef = useRef<THREE.Points>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#0a1230") },
      uColorB: { value: new THREE.Color("#3a2a6b") },
      uColorC: { value: new THREE.Color("#1f6b6b") },
    }),
    [],
  );

  const dust = useMemo(() => makeDust(2600, 14, 38), []);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (dustRef.current) dustRef.current.rotation.y += delta * 0.008;
  });

  return (
    <>
      <mesh scale={40}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#cdd6ff"
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
