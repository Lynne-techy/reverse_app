// 방사형 그라디언트 소프트 글로우 텍스처 — 별 글로우·파티클·성운이 공유한다. 한 번만 만들어 캐시.
// ⚠️ 반드시 무채색(흰색)으로 굽는다 — 색은 material color(감정색/장르색)가 입힌다.
// 텍스처에 색을 구우면 곱연산 때문에 모든 별이 그 색 기운(과거: 주황)으로 쏠린다.

import * as THREE from "three";

let cached: THREE.Texture | null = null;

export function getGlowTexture(): THREE.Texture {
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.6)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cached = tex;

  return tex;
}
