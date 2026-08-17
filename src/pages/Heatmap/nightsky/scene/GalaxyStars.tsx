// 말씀의 은하 렌더 — 66권을 6개 나선 팔(경전 타입)로 그리는 전체 밤하늘 레이어.
//
// 별 900여 개를 개별 mesh로 그리면 드로우콜이 폭발하므로 THREE.Points 하나 + 커스텀 셰이더로 그린다.
// 아직 안 켜진 별은 흐린 남색 먼지로 남아 은하의 형태(밑그림)를 계속 보여준다.
//
// 색은 경전별 별자리 뷰와 같은 언어를 쓴다: 별빛의 바탕은 크림빛(BASE_GLOW)이고
// 경전 타입 색은 그 위에 얹는 옅은 물빛이다. 두 뷰가 따로 놀지 않으려면
// "별은 흰빛, 색은 악센트"라는 규칙이 양쪽에서 같아야 한다.
// 대신 범례에서 한 타입을 짚으면 그 팔만 제 색이 진해져 색-카테고리는 그대로 읽힌다.

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { BOOK_GENRES, type GenreCode } from "../../../../data/bookGenres";
import { GALAXY_RADIUS, GALAXY_STARS, GENRE_ARM_CENTERS, starLitLevels } from "../galaxy";
import { getGlowTexture } from "./glowTexture";

/** 아직 켜지지 않은 별 — 밤하늘에 잠긴 흐린 남색(별자리 뷰의 미점등 색과 같은 톤). */
const UNLIT_COLOR = new THREE.Color("#6274a8");
/** 별빛의 바탕색 — 별자리 뷰의 BASE_GLOW와 같은 촛불빛 크림. */
const STAR_WHITE = new THREE.Color("#f4ecdc");
/** 평상시 경전 타입 색이 섞이는 정도 — 낮을수록 은은하다. */
const TINT_IDLE = 0.4;
/** 범례에서 그 타입을 짚었을 때 섞이는 정도 — 색-카테고리를 또렷이 잇는 순간. */
const TINT_FOCUSED = 0.85;

/** 점등 연출(중심 → 바깥으로 번지는 시간, 초). */
const REVEAL_SECONDS = 1.8;

/** 숨 한 번에 걸리는 시간(초) — 게이밍 기기 breathing LED보다 한참 느리게. */
const BREATH_PERIOD = 6.4;
/** 호흡이 중심에서 바깥으로 번지는 지연(주기 비율/월드 단위) — 은하가 통째로 깜빡이지 않게. */
const BREATH_TRAVEL = 0.055;

/** 원반을 눕히는 각도(rad) — 3/4 시점에서 두께와 휨이 드러난다. */
const TILT = -0.78;
/** 하단 문구 오버레이를 피해 은하를 살짝 위로 띄우는 양(월드 단위). */
const LIFT = 0.55;
/** 화면 밖으로 살짝 흘려보내는 여유 — 바깥 테두리는 별이 성기므로 조금 넘쳐야 꽉 차 보인다. */
const BLEED = 1.06;
/** 자전 속도(rad/s) — 한 바퀴에 2분 넘게 걸리는, 눈치채기 직전의 느림. */
const SPIN_SPEED = 0.045;

/** 셰이더와 스프라이트가 같은 호흡을 쓰도록 공유하는 파형(0~1). */
function breathAt(time: number, radius: number): number {
  const wave = 0.5 - 0.5 * Math.cos((time / BREATH_PERIOD - radius * BREATH_TRAVEL) * Math.PI * 2);
  return wave * wave * (3 - 2 * wave);
}

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScale;      // 픽셀 크기 환산 계수(캔버스 높이/fov 기준)
  uniform float uHighlight;  // 강조할 장르 index (-1이면 강조 없음)
  uniform float uReveal;     // 0→1 점등 진행
  uniform float uMotion;     // 1=움직임 허용, 0=reduced-motion(호흡 정지)
  uniform float uSpread;     // 캔버스에 맞춘 은하 배율 — 별 크기도 같이 따라가게
  uniform float uHover;      // 커서가 올라간 권의 bookNo (-1이면 없음)

  attribute float aSize;
  attribute float aPhase;
  attribute float aLit;      // 이 별의 점등 정도(0~1)
  attribute float aGenre;
  attribute float aBook;     // 이 별이 속한 권(bookNo) — 호버한 성단만 떠오르게
  attribute float aDelay;    // 중심에서 먼 별일수록 늦게 켜지는 연출용
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);

    float reveal = smoothstep(aDelay, aDelay + 0.35, uReveal);
    float lit = aLit * reveal;

    // 숨 — 중심에서 바깥으로 천천히 번지는 파동. cos를 한 번 더 완만하게 깎아
    // 들이쉬고 내쉬는 끝에서 잠시 머무는, 사람 숨결에 가까운 리듬을 만든다.
    float wave = 0.5 - 0.5 * cos(
      (uTime / ${BREATH_PERIOD.toFixed(2)} - length(position.xy) * ${BREATH_TRAVEL.toFixed(3)}) * 6.2831
    );
    float breath = mix(0.5, wave * wave * (3.0 - 2.0 * wave), uMotion);

    // 반짝임은 켜진 별에만 — 꺼진 먼지까지 깜빡이면 산만하다.
    // 숨보다 빠르면 리듬이 어지러워지므로 트윙클은 잔물결 수준으로 줄였다.
    float twinkle = 0.92 + 0.08 * sin(uTime * 0.55 + aPhase * 6.2831);
    float size = aSize * (0.72 + 0.75 * lit) * mix(1.0, twinkle * (0.9 + 0.2 * breath), lit);

    // 커서가 올라간 성단(권)은 통째로 부풀어 "이 무리가 그 경전"임이 눈으로 잡힌다.
    float hovered = step(0.0, uHover) * step(abs(uHover - aBook), 0.5);
    size *= 1.0 + 0.5 * hovered;

    // 은하가 작게 접힌 화면(모바일)에서는 별도 조금 작게 — 완전 비례로 줄이면
    // 좁은 화면에서 별이 너무 사그라들어, 배율을 절반쯤만 따라간다.
    gl_PointSize = min(size * mix(1.0, uSpread, 0.6) * uScale / max(-mv.z, 0.1), 70.0);

    // 범례에서 한 타입을 짚으면 그 팔은 아직 안 켜진 별까지 제 색으로 떠오르고
    // (색 = 카테고리가 눈으로 이어지게) 나머지 팔은 뒤로 물러난다.
    float highlighting = step(0.0, uHighlight);
    float focused = step(abs(uHighlight - aGenre), 0.5);

    // 켜진 별빛 = 크림빛 바탕 + 옅은 타입 색. 짚거나 커서를 올린 무리만 색이 진해진다.
    float tint = max(
      ${TINT_IDLE.toFixed(2)} + (${TINT_FOCUSED.toFixed(2)} - ${TINT_IDLE.toFixed(2)}) * highlighting * focused,
      hovered * ${TINT_FOCUSED.toFixed(2)}
    );
    vec3 litColor = mix(
      vec3(${STAR_WHITE.r.toFixed(3)}, ${STAR_WHITE.g.toFixed(3)}, ${STAR_WHITE.b.toFixed(3)}),
      aColor,
      tint
    );

    vec3 unlitColor = mix(
      vec3(${UNLIT_COLOR.r.toFixed(3)}, ${UNLIT_COLOR.g.toFixed(3)}, ${UNLIT_COLOR.b.toFixed(3)}),
      aColor * 0.7,
      max(highlighting * focused, hovered)
    );
    // 꺼진 별도 먼지로 남겨 은하의 형태(밑그림)가 늘 보이게 한다.
    vColor = mix(unlitColor, litColor, smoothstep(0.0, 0.55, lit));
    // 숨은 켜진 별빛에만 실린다 — 꺼진 먼지는 가만히 있어야 "필사한 만큼이 숨쉰다"로 읽힌다.
    vAlpha = (0.28 + 0.62 * lit) * mix(1.0, 0.76 + 0.38 * breath, lit)
      * mix(1.0, mix(0.1, 1.3, focused), highlighting)
      * (1.0 + 0.6 * hovered);

    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.18, 0.0, d);
    float alpha = (halo * halo * 0.7 + core * 0.8) * vAlpha;

    // 중심은 흰빛으로 타고 가장자리만 제 색으로 번지게 — 형광 점이 아니라 별빛으로 읽히게 한다.
    vec3 color = mix(vColor * 0.85, vec3(1.0), core * 0.6);

    gl_FragColor = vec4(color, alpha);
  }
`;

/** 장르 색 성운의 기본 짙기 — 렌더와 호흡 애니메이션이 같은 식을 쓰도록 한 곳에 둔다. */
function hazeOpacity(fraction: number, focused: boolean): number {
  return (0.04 + 0.24 * fraction) * (focused ? 1 : 0.12);
}

/** 드래그와 클릭을 가르는 거리(px) — 은하를 돌리다 손을 뗐을 뿐인데 이동하면 안 된다. */
const CLICK_SLOP = 6;

/** 별을 집는 반경(월드 단위) — three 기본값 1은 은하 반경(≈4)에 견줘 굵어서 엉뚱한 별이 잡힌다. */
const PICK_RADIUS = 0.12;

interface GalaxyStarsProps {
  /** 권별 채움 비율(0~1). index 0 = 창세기. */
  bookFractions: number[];
  /** 장르별 채움 비율(0~1) — BOOK_GENRES 순서. 색 성운의 짙기에 쓴다. */
  genreFractions: number[];
  /** 범례에서 짚고 있는 장르(없으면 null) — 그 팔만 남기고 나머지를 죽인다. */
  highlight: GenreCode | null;
  /** 커서가 올라간 성단(권)을 알린다 — 툴팁은 캔버스 밖(NightSkyScene)에서 그린다. */
  onHoverBook: (hover: { bookNo: number; x: number; y: number } | null) => void;
  /** 성단을 누르면 그 경전의 별자리로 이동. */
  onSelectBook: (bookNo: number) => void;
  reducedMotion: boolean;
}

export default function GalaxyStars({
  bookFractions,
  genreFractions,
  highlight,
  onHoverBook,
  onSelectBook,
  reducedMotion,
}: GalaxyStarsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const viewport = useThree((state) => state.viewport);
  const gl = useThree((state) => state.gl);
  const raycaster = useThree((state) => state.raycaster);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const spinRef = useRef<THREE.Group>(null);
  const coreRefs = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const hazeRefs = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const revealRef = useRef(0);
  /** 별빛이 한 번이라도 들어왔는지 — 점등 연출을 데이터 도착 시점에 맞추기 위한 표식. */
  const everLitRef = useRef(false);
  /** 지금 커서가 올라간 권 — 같은 성단 위를 움직이는 동안 툴팁이 떨지 않게 기억해 둔다. */
  const hoveredRef = useRef(-1);
  /** 누르기 시작한 좌표 — 드래그(은하 회전)와 클릭(이동)을 가르는 기준. */
  const pressRef = useRef<{ x: number; y: number } | null>(null);

  // 별 좌표·색·크기는 고정 — 한 번만 만든다.
  const attributes = useMemo(() => {
    const count = GALAXY_STARS.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const genres = new Float32Array(count);
    const books = new Float32Array(count);
    const delays = new Float32Array(count);

    const colorByGenre = new Map<GenreCode, THREE.Color>(
      BOOK_GENRES.map((genre) => [genre.code, new THREE.Color(genre.starColor)]),
    );

    GALAXY_STARS.forEach((star, i) => {
      positions[i * 3] = star.pos[0];
      positions[i * 3 + 1] = star.pos[1];
      positions[i * 3 + 2] = star.pos[2];

      const color = colorByGenre.get(star.genre)!;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = star.size;
      phases[i] = star.phase;
      genres[i] = star.genreIndex;
      books[i] = star.bookNo;

      const radius = Math.hypot(star.pos[0], star.pos[1]);
      delays[i] = Math.min(0.65, radius / 4.4);
    });

    return { positions, colors, sizes, phases, genres, books, delays };
  }, []);

  const litLevels = useMemo(() => starLitLevels(bookFractions), [bookFractions]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 600 },
      uHighlight: { value: -1 },
      uReveal: { value: 0 },
      uMotion: { value: 1 },
      uSpread: { value: 1 },
      uHover: { value: -1 },
    }),
    [],
  );

  // 캔버스가 가로로 넓든(데스크톱) 세로로 길든(모바일) 은하가 화면을 꽉 채우도록 크기를 맞춘다.
  // 고정 배율이면 넓은 화면에서 가운데 작게 뜨고, 좁은 화면에서는 팔 끝이 잘렸다.
  const fitScale = useMemo(() => {
    const byWidth = ((viewport.width / 2) * BLEED) / GALAXY_RADIUS;
    // 세로는 원반이 누운 만큼(cos) 납작해지고, 위로 띄운 만큼 여유가 줄어든다.
    const byHeight = ((viewport.height / 2 - LIFT) * BLEED) / (GALAXY_RADIUS * Math.cos(TILT));
    return Math.max(0.35, Math.min(byWidth, byHeight, 1.55));
  }, [viewport.width, viewport.height]);

  // 진행도가 바뀌면 점등 attribute만 갈아끼운다(지오메트리 재생성 없이).
  useEffect(() => {
    const attribute = geometryRef.current?.getAttribute("aLit") as
      THREE.BufferAttribute | undefined;
    if (!attribute) return;

    (attribute.array as Float32Array).set(litLevels);
    attribute.needsUpdate = true;

    // 진행도는 마운트보다 늦게(쿼리 응답 후) 도착한다 — 별빛이 처음 들어오는 순간
    // 점등 연출을 다시 시작해야 중심에서 바깥으로 번지는 게 보인다.
    if (!reducedMotion && !everLitRef.current && litLevels.some((level) => level > 0)) {
      everLitRef.current = true;
      revealRef.current = 0;
    }

    invalidate();
  }, [litLevels, reducedMotion, invalidate]);

  useEffect(() => {
    uniforms.uHighlight.value = highlight
      ? BOOK_GENRES.findIndex((genre) => genre.code === highlight)
      : -1;
    invalidate();
  }, [highlight, uniforms, invalidate]);

  // 모션을 끈 사용자는 연출(점등·호흡·자전) 없이 완성 상태로 바로 보여준다.
  useEffect(() => {
    uniforms.uMotion.value = reducedMotion ? 0 : 1;
    if (!reducedMotion) return;
    revealRef.current = 1;
    uniforms.uReveal.value = 1;
    invalidate();
  }, [reducedMotion, uniforms, invalidate]);

  useEffect(() => {
    const previous = raycaster.params.Points.threshold;
    raycaster.params.Points.threshold = PICK_RADIUS;
    return () => {
      raycaster.params.Points.threshold = previous;
    };
  }, [raycaster]);

  // 커서가 별에서 벗어나거나 뷰가 사라질 때 커서 모양·툴팁을 반드시 되돌린다.
  const clearHover = useCallback(() => {
    if (hoveredRef.current === -1) return;
    hoveredRef.current = -1;
    uniforms.uHover.value = -1;
    gl.domElement.style.cursor = "";
    onHoverBook(null);
    invalidate();
  }, [uniforms, gl, onHoverBook, invalidate]);

  useEffect(() => clearHover, [clearHover]);

  // 같은 성단 위를 훑는 동안에는 갱신하지 않는다 — 툴팁이 커서를 따라 떨면 읽기 어렵다.
  const handleHover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    // 버튼을 누른 채 움직이는 중이면 은하를 돌리는 것 — 그때 이름표가 따라 뜨면 방해만 된다.
    if (event.nativeEvent.buttons !== 0) return;

    const bookNo = event.index === undefined ? undefined : GALAXY_STARS[event.index]?.bookNo;
    if (!bookNo || bookNo === hoveredRef.current) return;

    hoveredRef.current = bookNo;
    uniforms.uHover.value = bookNo;
    gl.domElement.style.cursor = "pointer";
    onHoverBook({ bookNo, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
    invalidate();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;

    // 은하를 돌리려고 끌다가 손을 뗀 것이면 이동하지 않는다.
    const moved = Math.hypot(
      event.nativeEvent.clientX - press.x,
      event.nativeEvent.clientY - press.y,
    );
    if (moved > CLICK_SLOP) return;

    const bookNo = event.index === undefined ? undefined : GALAXY_STARS[event.index]?.bookNo;
    if (!bookNo) return;

    event.stopPropagation();
    clearHover();
    onSelectBook(bookNo);
  };

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const pixelHeight = state.size.height * state.gl.getPixelRatio();
    uniforms.uScale.value = pixelHeight / (2 * Math.tan((camera.fov * Math.PI) / 360));
    uniforms.uSpread.value = fitScale;

    if (reducedMotion) return;

    const time = state.clock.elapsedTime;
    uniforms.uTime.value = time;

    // 은하가 제 축을 중심으로 돈다 — 카메라를 흔드는 대신 원반이 도는 쪽이
    // 휨·두께와 맞물려 실제로 도는 입체로 읽힌다.
    if (spinRef.current) spinRef.current.rotation.z -= delta * SPIN_SPEED;

    // 중심 팽대부와 색 성운도 같은 숨을 쉰다 — 별만 호흡하면 코어가 굳어 보인다.
    const coreBreath = breathAt(time, 0);
    coreRefs.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = (index === 0 ? 0.22 : 0.5) * (0.78 + 0.36 * coreBreath);
    });

    hazeRefs.current.forEach((material, index) => {
      if (!material) return;
      const arm = GENRE_ARM_CENTERS[index];
      const breath = breathAt(time, Math.hypot(arm.pos[0], arm.pos[1]));
      const focused = highlight === null || highlight === arm.genre;
      material.opacity = hazeOpacity(genreFractions[index] ?? 0, focused) * (0.72 + 0.5 * breath);
    });

    if (revealRef.current < 1) {
      revealRef.current = Math.min(1, revealRef.current + delta / REVEAL_SECONDS);
      uniforms.uReveal.value = revealRef.current;
    }
  });

  const tex = useMemo(getGlowTexture, []);

  return (
    // 바깥 group: 원반을 눕혀(3/4 시점) 두께와 휨이 드러나게 하고, 캔버스 크기에 맞춰 키운다.
    // 안쪽 group: 원반 자체가 제 축(z)을 중심으로 자전한다.
    <group position={[0, LIFT, 0]} rotation={[TILT, 0, 0]} scale={fitScale}>
      <group ref={spinRef}>
        {/* 은하 중심 팽대부 — 소용돌이의 중심을 잡아주는 따뜻한 코어(안쪽은 진하게, 넓게 한 겹 더) */}
        <sprite position={[0, 0, -0.25]} scale={3.2}>
          <spriteMaterial
            ref={(material) => {
              coreRefs.current[0] = material;
            }}
            map={tex}
            color="#ffdca8"
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
        <sprite position={[0, 0, -0.2]} scale={1.35}>
          <spriteMaterial
            ref={(material) => {
              coreRefs.current[1] = material;
            }}
            map={tex}
            color="#fff2d8"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>

        {/* 장르 색 성운 — 그 타입을 필사할수록 팔 주변 색안개가 짙어진다. */}
        {GENRE_ARM_CENTERS.map(({ genre, pos }, index) => {
          const fraction = genreFractions[index] ?? 0;
          const focused = highlight === null || highlight === genre;

          return (
            <sprite key={genre} position={pos} scale={2.6 + 0.9 * fraction}>
              <spriteMaterial
                ref={(material) => {
                  hazeRefs.current[index] = material;
                }}
                map={tex}
                color={BOOK_GENRES[index].starColor}
                transparent
                opacity={hazeOpacity(fraction, focused)}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </sprite>
          );
        })}

        <points
          onPointerMove={handleHover}
          onPointerOut={clearHover}
          onPointerDown={(event) => {
            pressRef.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY };
          }}
          onClick={handleClick}
        >
          <bufferGeometry ref={geometryRef}>
            <bufferAttribute attach="attributes-position" args={[attributes.positions, 3]} />
            <bufferAttribute attach="attributes-aColor" args={[attributes.colors, 3]} />
            <bufferAttribute attach="attributes-aSize" args={[attributes.sizes, 1]} />
            <bufferAttribute attach="attributes-aPhase" args={[attributes.phases, 1]} />
            <bufferAttribute attach="attributes-aGenre" args={[attributes.genres, 1]} />
            <bufferAttribute attach="attributes-aBook" args={[attributes.books, 1]} />
            <bufferAttribute attach="attributes-aDelay" args={[attributes.delays, 1]} />
            <bufferAttribute attach="attributes-aLit" args={[litLevels, 1]} />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}
