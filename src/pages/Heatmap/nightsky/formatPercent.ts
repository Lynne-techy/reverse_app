// 진척 퍼센트 표기 유틸 — 씬(NightSkyScene)과 2D 폴백(NightSkyFallback)이 공유한다.
// ⚠️ three를 끌어오는 NightSkyScene에서 import 하지 말 것(청크 분리 유지) — 그래서 별도 파일.

/**
 * covered/total을 퍼센트 문자열로. 성경 전체(3만여 절)처럼 분모가 크면 초반 진척이
 * 반올림에 0%로 뭉개지므로, 1% 미만은 소수 자리를 살려 "차오르기 시작했음"이 보이게 한다.
 * 반대로 아직 미완인데 반올림으로 100%가 되는 것도 막는다(99로 고정).
 */
export function formatPercent(covered: number, total: number): string {
  if (total <= 0 || covered <= 0) return "0";

  const pct = (covered / total) * 100;
  if (pct < 0.01) return "0.01"; // 표시상 최소 — 0보다 크면 0으로 보이지 않게
  if (pct < 0.1) return pct.toFixed(2);
  if (pct < 1) return pct.toFixed(1);

  const rounded = Math.round(pct);
  return String(covered < total && rounded === 100 ? 99 : rounded);
}
