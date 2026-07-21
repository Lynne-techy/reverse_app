/* =====================================================================
 * Re:Verse — DS 토큰 대비(contrast) 근본 수정 (Scripter)
 * ---------------------------------------------------------------------
 * WCAG AA 미달 semantic 색을 상향. design-tokens.json과 동일하게 맞춘다.
 *   sub          #8B95A1(2.8:1) → #5B6B7A (~4.9:1)
 *   primary      blue.500(#3B82F6, 3.7:1) → blue.600(#2663EC)
 *   primary-deep blue.600 → blue.700(#1E40B0)
 * Color 컬렉션의 Light 모드 값을 수정. 프리미티브(blue/600·blue/700)가 있으면
 * alias로, 없으면 직접 RGB로 세팅. 결과 리포트를 반환한다.
 * ===================================================================== */

(async () => {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const colorCol = collections.find((c) => c.name === "Color");
  if (!colorCol) return { error: "Color 컬렉션을 찾지 못함", collections: collections.map((c) => c.name) };
  const primCol = collections.find((c) => c.name === "Primitives");
  const allVars = await figma.variables.getLocalVariablesAsync();
  const modeId = colorCol.modes[0].modeId; // Light

  function hx(h) { h = h.replace("#", ""); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; }
  const colorVar = (name) => allVars.find((v) => v.variableCollectionId === colorCol.id && v.name === name);
  const primVar = (name) => primCol && allVars.find((v) => v.variableCollectionId === primCol.id && v.name === name);
  const aliasOrHex = (primName, hex) => { const p = primVar(primName); return p ? { type: "VARIABLE_ALIAS", id: p.id } : hx(hex); };

  const targets = [
    { name: "sub", value: hx("#5B6B7A"), note: "직접값(#5B6B7A)" },
    { name: "primary", value: aliasOrHex("blue/600", "#2663EC"), note: "blue/600" },
    { name: "primary-deep", value: aliasOrHex("blue/700", "#1E40B0"), note: "blue/700" },
  ];

  const report = [];
  for (const t of targets) {
    const v = colorVar(t.name);
    if (!v) { report.push(`✗ '${t.name}' 변수 없음`); continue; }
    v.setValueForMode(modeId, t.value);
    report.push(`✓ ${t.name} → ${t.note}`);
  }
  figma.notify("DS 대비 토큰 수정: " + report.join(" · "));
  return { updated: report, colorVars: allVars.filter((v) => v.variableCollectionId === colorCol.id).map((v) => v.name) };
})();
