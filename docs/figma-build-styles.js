/* =====================================================================
 * Re:Verse - Figma 스타일 자동 생성 스크립트 (Plugin API)
 * 사용법: Figma 데스크탑 -> 플러그인 "Scripter" 설치 -> 새 스크립트에
 *        이 파일 전체를 붙여넣고 Run. 색/타입/그림자 스타일이 생성됩니다.
 * 참고: design-tokens.json 과 동일한 값. 폰트는 FAMILY 상수로 교체 가능.
 * 주의: 인라인 주석을 쓰지 않음(붙여넣기 줄바꿈 뭉개짐 방지). 전체 async 래핑.
 * ===================================================================== */

(async () => {
  const FAMILY = "Inter";
  const INK = { r: 23 / 255, g: 50 / 255, b: 74 / 255 };

  function hx(h) {
    h = h.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    };
  }

  /* 1) Paint styles (색) */
  const COLORS = {
    "blue/50": "#E8F1FF",
    "blue/100": "#BFDBFE",
    "blue/300": "#93C5FD",
    "blue/500 primary": "#3B82F6",
    "blue/600 deep": "#2663EC",
    "blue/700": "#1E40B0",
    "grey/50 surface": "#F9FAFB",
    "grey/100 fill": "#F2F4F6",
    "grey/200 border": "#E5E8EB",
    "grey/300": "#D1D6DB",
    "grey/400": "#9AA4B0",
    "grey/500 sub": "#8B95A1",
    "grey/600": "#6B7684",
    "grey/700 body": "#4E5968",
    "grey/800": "#334155",
    "grey/900 ink": "#17324A",
    "semantic/accent": "#F97E62",
    "semantic/success": "#03B26C",
    "semantic/danger": "#F04452",
    "semantic/warning": "#FE9800",
    "jandi/0": "#EDF1F5",
    "jandi/1": "#BFDBFE",
    "jandi/2": "#93C5FD",
    "jandi/3": "#3B82F6",
    "jandi/4": "#1E40B0",
  };
  const colorKeys = Object.keys(COLORS);
  for (let i = 0; i < colorKeys.length; i++) {
    const key = colorKeys[i];
    const ps = figma.createPaintStyle();
    ps.name = key;
    ps.paints = [{ type: "SOLID", color: hx(COLORS[key]) }];
  }

  /* 2) Gradient styles (그라디언트) */
  function grad(gname, stops) {
    const gs = figma.createPaintStyle();
    gs.name = gname;
    const gradientStops = stops.map((st) => {
      const c = hx(st[0]);
      return { position: st[1], color: { r: c.r, g: c.g, b: c.b, a: 1 } };
    });
    gs.paints = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: gradientStops,
    }];
  }
  grad("gradient/greet", [["#DBEAFE", 0], ["#EEF6FF", 1]]);
  grad("gradient/identity", [["#3B82F6", 0], ["#6F9CF0", 0.52], ["#F4A187", 1]]);
  grad("gradient/range", [["#2F8FD8", 0], ["#1E6FB1", 1]]);

  /* 3) Text styles (타이포). 항목: [이름, size, lineHeight%, weight, letterSpacing%] */
  const TEXT = [
    ["Display", 40, 110, "Bold", -3],
    ["H1", 32, 115, "Bold", -2],
    ["H2 number", 24, 120, "Extra Bold", -1],
    ["H3", 20, 130, "Bold", 0],
    ["Verse", 20, 185, "Medium", -0.5],
    ["Body", 16, 160, "Regular", 0],
    ["Caption", 13, 140, "Medium", 0],
  ];
  for (let i = 0; i < TEXT.length; i++) {
    const row = TEXT[i];
    const tname = row[0], size = row[1], lh = row[2], weight = row[3], tr = row[4];
    try {
      await figma.loadFontAsync({ family: FAMILY, style: weight });
      const ts = figma.createTextStyle();
      ts.name = tname;
      ts.fontName = { family: FAMILY, style: weight };
      ts.fontSize = size;
      ts.lineHeight = { value: lh, unit: "PERCENT" };
      ts.letterSpacing = { value: tr, unit: "PERCENT" };
    } catch (e) {
      console.log("텍스트 스타일 실패:", tname, "폰트 웨이트 없음:", weight, String(e));
    }
  }

  /* 4) Effect styles (그림자). 항목: [이름, offsetY, blur, alpha] */
  const SHADOW = [
    ["elevation/sm", 1, 2, 0.06],
    ["elevation/md", 6, 18, 0.08],
    ["elevation/lg", 14, 34, 0.11],
  ];
  for (let i = 0; i < SHADOW.length; i++) {
    const row = SHADOW[i];
    const es = figma.createEffectStyle();
    es.name = row[0];
    es.effects = [{
      type: "DROP_SHADOW",
      color: { r: INK.r, g: INK.g, b: INK.b, a: row[3] },
      offset: { x: 0, y: row[1] },
      radius: row[2],
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  }

  figma.notify("Re:Verse 스타일 생성 완료 - 색 " + colorKeys.length + " / 그라디언트 3 / 텍스트 " + TEXT.length + " / 그림자 3");
  console.log("done");
})();
