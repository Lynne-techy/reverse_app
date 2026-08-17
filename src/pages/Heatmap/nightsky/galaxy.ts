// 전체 밤하늘 "말씀의 은하" 기하 — 66권을 6개 나선 팔(경전 타입)로 배치한 별 좌표를 만든다.
//
// 왜 이 모양인가: 예전 전체 뷰는 황금각으로 고르게 흩뿌린 100개 점이라 밀도가 균일해
// "인공신경망 노드"처럼 보였다. 은하답게 보이려면 밀도와 크기가 불균일해야 한다 —
//   · 팔(arm) 6개 = 경전 타입 6종. 팔마다 색이 다르므로 색이 곧 카테고리다.
//   · 권마다 성단 하나, 별 개수 ∝ 절 수(별 하나 ≈ 60절). 시편은 큰 성단, 오바댜는 작은 반짝임.
//   · 한 권 안에서는 안쪽 → 바깥쪽 순서로 켜진다(필사가 앞에서 뒤로 진행되는 방향).
//   · 평면이 아니라 두께와 휨을 가진 원반 — 중심은 공처럼 부풀고 바깥은 접시처럼 휜다.
//     은하가 자전할 때 이 z 구조가 있어야 "기울어진 종잇장"이 아니라 입체로 읽힌다.
//
// 좌표는 결정적(해시 기반)이라 리렌더·세션이 바뀌어도 은하 모양이 늘 같다.

import { BOOK_GENRES, booksOfGenre, type GenreCode } from "../../../data/bookGenres";
import { verseCountOf } from "../../../data/bookVerseCounts";

/** 별 하나가 대표하는 절 수 — 성단 크기를 절 수에 비례시키는 기준. */
const VERSES_PER_STAR = 34;
/** 아무리 짧은 권도 성단으로 읽히도록 하는 최소 별 수(요한이서 13절 등). */
const MIN_STARS_PER_BOOK = 4;

const ARM_INNER_RADIUS = 0.32;
const ARM_OUTER_RADIUS = 3.5;
/** 팔이 감기는 각도(rad) — 클수록 소용돌이가 강해진다. */
const ARM_SWEEP = 2.9;

/**
 * 원반 두께(z 방향 표준편차 비슷한 값). 중심 팽대부는 공처럼 두툼하고 바깥 원반은 얇다.
 * 이 두께가 없으면 별이 한 평면에 붙어 있어서 은하를 돌려도 "종잇장이 기울었다"로만 읽힌다.
 */
function diskThickness(t: number): number {
  return 0.42 * Math.exp(-t * 3.4) + 0.05 + 0.1 * t;
}

/** 원반의 휨(warp) 최대치 — 실제 은하도 바깥 원반이 접시처럼 휘어 있다. */
const WARP_AMPLITUDE = 0.62;

/**
 * 원반 휨 — 바깥으로 갈수록 한쪽 반원은 위로, 반대쪽은 아래로 들린다.
 * 자전할 때 팔이 화면 앞뒤로 오르내려서 깊이가 눈에 보이게 만드는 장치.
 */
function diskWarp(angle: number, t: number): number {
  return Math.sin(angle - 0.9) * t * t * WARP_AMPLITUDE;
}

export interface GalaxyStar {
  pos: [number, number, number];
  /** 월드 단위 별 크기(포인트 스프라이트 반경 기준). */
  size: number;
  genre: GenreCode;
  /** BOOK_GENRES에서의 위치 — 셰이더에서 "이 팔만 강조" 판정에 쓴다. */
  genreIndex: number;
  bookNo: number;
  /** 이 권 성단에서 몇 번째로 켜지는 별인지(0부터). */
  slot: number;
  /** 이 권 성단의 별 개수. */
  slotCount: number;
  /** 트윙클 위상(0~1) — 별마다 반짝임이 어긋나게. */
  phase: number;
}

/** 결정적 의사난수(0~1). Math.random 대신 써서 은하 모양을 고정한다. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** 대략 정규분포(-1.5~1.5) — 성단이 선이 아니라 구름처럼 퍼지게. */
function gauss(seed: number): number {
  return rand(seed) + rand(seed + 7.3) + rand(seed + 19.1) - 1.5;
}

/** 이 권을 그릴 별 개수 — 절 수에 비례하되 최소치를 보장. */
export function starCountOf(bookNo: number): number {
  return Math.max(MIN_STARS_PER_BOOK, Math.round(verseCountOf(bookNo) / VERSES_PER_STAR));
}

function buildGalaxy(): GalaxyStar[] {
  const stars: GalaxyStar[] = [];
  let seed = 1;

  BOOK_GENRES.forEach((genre, genreIndex) => {
    // 팔은 원 둘레에 균등 배치. 0.4는 첫 팔이 정면 위쪽으로 오게 하는 오프셋.
    const armPhase = (genreIndex / BOOK_GENRES.length) * Math.PI * 2 + 0.4;

    const books = booksOfGenre(genre);
    const genreVerses = books.reduce((sum, bookNo) => sum + verseCountOf(bookNo), 0);

    // 권은 정경 순서대로 팔의 안쪽 → 바깥쪽을 절 수 비율만큼 나눠 가진다.
    let cursor = 0;
    for (const bookNo of books) {
      const verses = verseCountOf(bookNo);
      const tStart = genreVerses > 0 ? cursor / genreVerses : 0;
      cursor += verses;
      const tEnd = genreVerses > 0 ? cursor / genreVerses : 1;

      const slotCount = starCountOf(bookNo);
      for (let slot = 0; slot < slotCount; slot++) {
        seed += 1;

        // 팔을 따라가는 위치(0=중심, 1=바깥). 권 구간 안에서 slot 순서대로 놓여
        // "앞 절부터 켜진다"는 진행 방향이 형태로 드러난다. 위치를 slot 간격만큼 흔들어
        // 일정 간격으로 꿴 구슬처럼 보이지 않게 한다(등간격 = 인공물처럼 읽힘).
        const span = tEnd - tStart;
        const t = tStart + span * ((slot + 0.5 + gauss(seed) * 0.4) / slotCount);
        const tt = Math.min(1, Math.max(0, t));

        const radius =
          ARM_INNER_RADIUS + (ARM_OUTER_RADIUS - ARM_INNER_RADIUS) * Math.pow(tt, 0.82);
        const theta = armPhase + ARM_SWEEP * Math.pow(tt, 0.95);

        // 바깥으로 갈수록 팔이 두꺼워지게(안쪽은 조밀, 바깥은 성글게) 흩뿌린다.
        // 폭이 넓어야 선이 아니라 "성운을 품은 팔"로 보인다.
        const radialSpread = gauss(seed + 0.5) * (0.1 + 0.4 * tt);
        const arcSpread = (gauss(seed + 1.5) * (0.1 + 0.4 * tt)) / Math.max(0.5, radius);

        const r = Math.max(0.08, radius + radialSpread);
        const a = theta + arcSpread;

        // 6%는 눈에 띄게 큰 별 — 크기 편차가 커야 "격자"가 아니라 밤하늘로 읽힌다.
        const bright = rand(seed + 3.7) < 0.06;
        const size = (0.055 + rand(seed + 5.1) * 0.055) * (bright ? 2.3 : 1);

        // z는 "원반 두께 + 휨" — 중심은 공처럼 부풀고 바깥은 접시처럼 휜다.
        const z = diskWarp(a, tt) + gauss(seed + 2.5) * diskThickness(tt);

        stars.push({
          pos: [r * Math.cos(a), r * Math.sin(a), z],
          size,
          genre: genre.code,
          genreIndex,
          bookNo,
          slot,
          slotCount,
          phase: rand(seed + 11.3),
        });
      }
    }
  });

  return stars;
}

/** 은하 전체 별 목록(모듈 로드 시 1회 생성). */
export const GALAXY_STARS: GalaxyStar[] = buildGalaxy();

/**
 * 가장 바깥 별까지의 반경 — 렌더러가 캔버스 크기에 맞춰 은하를 키울 때 기준으로 쓴다.
 * (자전하므로 어느 방향으로든 이 반경만큼 뻗는다고 봐야 한다.)
 */
export const GALAXY_RADIUS: number = GALAXY_STARS.reduce(
  (max, star) => Math.max(max, Math.hypot(star.pos[0], star.pos[1])),
  0,
);

/**
 * 권별 채움 비율(bookCoverage.bookFractions) → 별별 점등 정도(0~1).
 * 한 권의 별을 slot 순서로 채우고 경계 별만 부분 점등한다.
 * 예: 5개 별짜리 권이 50%면 별 1·2는 완전 점등, 별 3은 0.5, 나머지는 꺼짐.
 */
export function starLitLevels(bookFractions: number[]): Float32Array {
  const levels = new Float32Array(GALAXY_STARS.length);

  GALAXY_STARS.forEach((star, i) => {
    const fraction = bookFractions[star.bookNo - 1] ?? 0;
    const filled = fraction * star.slotCount;
    levels[i] = Math.min(1, Math.max(0, filled - star.slot));
  });

  return levels;
}

/** 팔 중간 지점 — 장르 색 성운(haze)을 띄울 자리. */
export const GENRE_ARM_CENTERS: { genre: GenreCode; pos: [number, number, number] }[] =
  BOOK_GENRES.map((genre, genreIndex) => {
    const armPhase = (genreIndex / BOOK_GENRES.length) * Math.PI * 2 + 0.4;
    const t = 0.52;
    const radius = ARM_INNER_RADIUS + (ARM_OUTER_RADIUS - ARM_INNER_RADIUS) * Math.pow(t, 0.82);
    const theta = armPhase + ARM_SWEEP * Math.pow(t, 0.95);

    return {
      genre: genre.code,
      // 성운은 별보다 살짝 뒤(-0.12)에 깔되 팔과 같은 높이로 휘어야 원반에 얹힌 것처럼 보인다.
      pos: [radius * Math.cos(theta), radius * Math.sin(theta), diskWarp(theta, t) - 0.12] as [
        number,
        number,
        number,
      ],
    };
  });
