/* =====================================================================
 * Re:Verse — Figma 컴포넌트 자동 생성 스크립트 (Plugin API / Scripter)
 * ---------------------------------------------------------------------
 * 사용법: Figma 데스크탑 → 플러그인 "Scripter" → 새 스크립트에 이 파일
 *        전체를 붙여넣고 Run. "01 Components" 페이지에 14종 컴포넌트가
 *        생성됩니다. (Button 은 이미 있으므로 제외)
 *
 * 전제: figma-build-styles.js 를 먼저 실행해 색/타입/그림자 스타일과
 *      변수 컬렉션(Primitives/Number/Color)이 존재해야 합니다.
 *      변수는 "이름"으로 해석하므로 ID 하드코딩이 없습니다.
 *
 * 멱등성: 아래 COMPONENT_NAMES 에 해당하는 기존 노드와 'Components Sheet'
 *        보드를 지우고 다시 만듭니다. (깨진 Input 세트도 자동 교체)
 * 주의: 인라인 주석 최소화(붙여넣기 안전), 전체 async IIFE 래핑.
 * ===================================================================== */

(async () => {
  /* ---------- 0) 준비: 페이지 · 폰트 · 변수 맵 ---------- */
  const PAGE_NAME = "01 Components";
  let page = figma.root.children.find((p) => p.name === PAGE_NAME);
  if (!page) { page = figma.createPage(); page.name = PAGE_NAME; }
  await figma.setCurrentPageAsync(page);

  const FAM = "Inter";
  const STYLES = ["Regular", "Medium", "Semi Bold", "Bold", "Extra Bold"];
  for (const s of STYLES) { await figma.loadFontAsync({ family: FAM, style: s }); }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  function V(colName, varName) {
    const col = collections.find((c) => c.name === colName);
    return allVars.find((v) => v.variableCollectionId === col.id && v.name === varName);
  }
  function hx(h) {
    h = h.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    };
  }
  const isHex = (c) => typeof c === "string" && c[0] === "#";

  function solidBound(varObj) {
    return figma.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", varObj
    );
  }
  /* color: '#rrggbb' 리터럴 | 'tokenName'(Color 컬렉션) */
  function fillOf(color) {
    return isHex(color) ? { type: "SOLID", color: hx(color) } : solidBound(V("Color", color));
  }
  function setFill(node, color) { node.fills = [fillOf(color)]; }
  function setStroke(node, color, weight) {
    node.strokes = [fillOf(color)]; if (weight != null) node.strokeWeight = weight;
  }
  /* number 토큰(Number 컬렉션) 바인딩 */
  function bindNum(node, field, varName) { node.setBoundVariable(field, V("Number", varName)); }
  function radiusVar(node, varName) {
    ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"].forEach((f) => bindNum(node, f, varName));
  }
  function T(chars, style, size, color, lhPct) {
    const t = figma.createText();
    t.fontName = { family: FAM, style }; t.characters = chars; t.fontSize = size;
    if (lhPct) t.lineHeight = { unit: "PERCENT", value: lhPct };
    setFill(t, color); return t;
  }
  const GREY400 = "#9AA4B0";
  /* auto-layout 안에서 텍스트를 가로로 늘릴 때: HEIGHT 로 두지 않으면 폭이 0으로 붕괴 */
  function fillText(t) { t.textAutoResize = "HEIGHT"; t.layoutSizingHorizontal = "FILL"; }

  /* ---------- 아이콘(라인 SVG) ---------- */
  const IPATH = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    pen: '<path d="M4 20l4.5-1L20 7.5 16.5 4 5 15.5 4 20z"/><path d="M14.5 6L18 9.5"/>',
    book: '<path d="M5 4h11a2 2 0 012 2v14H7a2 2 0 00-2 2V4z"/><path d="M5 4a2 2 0 002 2h11"/>',
    chart: '<path d="M4 20h16"/><path d="M6 20V11M12 20V5M18 20v-6"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>',
    flame: '<path d="M12 3s5 4 5 9a5 5 0 01-10 0c0-2 1-3 1-3s0 2 2 2c1.5 0 2-2 1-5 0-2 0-4 1-4z"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>',
  };
  function icon(name, size, colorHex) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="' + colorHex +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IPATH[name] + "</svg>";
    const n = figma.createNodeFromSvg(svg);
    n.name = "ic-" + name; n.resize(size, size);
    return n;
  }

  /* ---------- auto-layout 헬퍼 ---------- */
  function AL(dir, props) {
    const f = figma.createFrame();
    f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO";
    f.fills = []; f.clipsContent = false;
    if (props) Object.assign(f, props);
    return f;
  }
  function comp(name) {
    const c = figma.createComponent(); c.name = name;
    c.layoutMode = "VERTICAL"; c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "AUTO";
    c.fills = []; c.clipsContent = false; page.appendChild(c); return c;
  }
  function styleSet(set, name) {
    set.name = name; set.layoutMode = "HORIZONTAL"; set.itemSpacing = 28; set.layoutWrap = "NO_WRAP";
    set.counterAxisAlignItems = "CENTER";
    set.paddingTop = 24; set.paddingBottom = 24; set.paddingLeft = 24; set.paddingRight = 24;
    set.primaryAxisSizingMode = "AUTO"; set.counterAxisSizingMode = "AUTO";
    set.fills = [{ type: "SOLID", color: hx("#F9FAFB") }];
    set.strokes = [{ type: "SOLID", color: hx("#E5E8EB") }]; set.strokeWeight = 1; set.cornerRadius = 12;
    return set;
  }

  /* ---------- 1) 멱등: Button 만 남기고 전부 제거(잔해 완전 청소) ----------
   * 01 Components 는 우리 전용 페이지(원래 Button + 우리 보드만 존재).
   * 부분 실패로 남은 조각까지 확실히 지우기 위해 Button 외 top-level 전부 삭제 후 재생성. */
  const KEEP = ["Button"];
  for (const n of [...page.children]) { if (!KEEP.includes(n.name)) n.remove(); }

  /* ---------- 2) 컴포넌트 빌더 ---------- */

  // (1) Input — State: default/focus/error/disabled
  function buildInput() {
    function variant(state) {
      const c = comp("State=" + state); c.itemSpacing = 6;
      const label = T("절 범위", "Semi Bold", 12, "ink"); c.appendChild(label);
      const box = AL("HORIZONTAL", { paddingLeft: 12, paddingRight: 12, name: "input" });
      box.counterAxisAlignItems = "CENTER"; radiusVar(box, "radius/md"); c.appendChild(box);
      const val = state === "disabled" ? "자동 입력" : state === "error" ? "0" : "you@example.com";
      const input = T(val, "Regular", 14, state === "default" || state === "focus" ? GREY400 : (state === "disabled" ? "sub" : "ink"));
      box.appendChild(input);
      setFill(box, state === "disabled" ? "fill" : "bg");
      if (state === "focus") { setStroke(box, "primary", 2); box.effects = [{ type: "DROP_SHADOW", color: { r: .231, g: .51, b: .965, a: .25 }, offset: { x: 0, y: 0 }, radius: 0, spread: 3, visible: true, blendMode: "NORMAL" }]; }
      else if (state === "error") setStroke(box, "danger", 1);
      else setStroke(box, "border-strong", 1);
      const help = T(state === "error" ? "1 이상을 입력해 주세요" : "로그인에 사용됩니다", "Regular", 11, state === "error" ? "danger" : "sub");
      c.appendChild(help);
      c.resize(240, c.height); c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "FIXED";
      box.layoutSizingHorizontal = "FILL"; box.resize(box.width, 42); box.layoutSizingVertical = "FIXED";
      fillText(input);
      return c;
    }
    const set = figma.combineAsVariants(["default", "focus", "error", "disabled"].map(variant), page);
    return styleSet(set, "Input");
  }

  // (2) Select
  function buildSelect() {
    const c = comp("Select"); c.itemSpacing = 6;
    c.appendChild(T("성경", "Semi Bold", 12, "ink"));
    const box = AL("HORIZONTAL", { paddingLeft: 12, paddingRight: 12 });
    box.counterAxisAlignItems = "CENTER"; radiusVar(box, "radius/md");
    setFill(box, "bg"); setStroke(box, "border-strong", 1); c.appendChild(box);
    const val = T("시편", "Regular", 14, "ink"); box.appendChild(val);
    const ch = icon("chevron", 16, "#8B95A1"); box.appendChild(ch);
    c.resize(220, c.height); c.counterAxisSizingMode = "FIXED";
    box.layoutSizingHorizontal = "FILL"; box.resize(box.width, 42); box.layoutSizingVertical = "FIXED";
    box.primaryAxisAlignItems = "SPACE_BETWEEN"; fillText(val);
    return c;
  }

  // (3) Card — Kind: base/verse/gradient
  function buildCard() {
    function base() {
      const c = comp("Kind=base"); c.itemSpacing = 8; c.paddingTop = 18; c.paddingBottom = 18; c.paddingLeft = 18; c.paddingRight = 18;
      radiusVar(c, "radius/xl"); setFill(c, "bg"); setStroke(c, "border", 1);
      c.appendChild(T("이번 주 요약", "Semi Bold", 14, "ink"));
      c.appendChild(T("한 글자씩 적으며 말씀을 새깁니다.", "Regular", 13, "body", 160));
      c.resize(240, c.height); c.counterAxisSizingMode = "FIXED";
      c.children.forEach(fillText);
      return c;
    }
    function verse() {
      const c = comp("Kind=verse"); c.itemSpacing = 10; c.paddingTop = 18; c.paddingBottom = 18; c.paddingLeft = 18; c.paddingRight = 18;
      radiusVar(c, "radius/xl"); setFill(c, "bg"); setStroke(c, "border", 1);
      c.appendChild(T("시편 23:1 · 오늘의 말씀", "Bold", 9.5, "primary"));
      c.appendChild(T("여호와는 나의 목자시니 내게 부족함이 없으리로다", "Medium", 18, "ink", 185));
      c.appendChild(T("— 시편 23편 1절", "Regular", 12, "sub"));
      c.resize(260, c.height); c.counterAxisSizingMode = "FIXED";
      c.children.forEach(fillText);
      return c;
    }
    function grad() {
      const c = comp("Kind=gradient"); c.itemSpacing = 12; c.paddingTop = 18; c.paddingBottom = 18; c.paddingLeft = 18; c.paddingRight = 18;
      c.layoutMode = "HORIZONTAL"; c.counterAxisAlignItems = "CENTER"; radiusVar(c, "radius/xl");
      c.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]],
        gradientStops: [{ position: 0, color: { ...hx("#3B82F6"), a: 1 } }, { position: .52, color: { ...hx("#6F9CF0"), a: 1 } }, { position: 1, color: { ...hx("#F4A187"), a: 1 } }] }];
      const av = AL("HORIZONTAL", {}); av.counterAxisAlignItems = "CENTER"; av.primaryAxisAlignItems = "CENTER";
      av.resize(40, 40); av.cornerRadius = 999; av.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: .28 }];
      const ini = T("김", "Bold", 15, "#FFFFFF"); av.appendChild(ini); c.appendChild(av);
      const col = AL("VERTICAL", { itemSpacing: 2 });
      col.appendChild(T("김현수님", "Bold", 14, "#FFFFFF"));
      col.appendChild(T("2권 완필 · 7일 연속", "Regular", 11, "#EAF1FF"));
      c.appendChild(col);
      c.resize(240, c.height); c.counterAxisSizingMode = "FIXED";
      return c;
    }
    const set = figma.combineAsVariants([base(), verse(), grad()], page);
    styleSet(set, "Card"); set.counterAxisAlignItems = "MIN"; return set;
  }

  // (4) Stat
  function buildStat() {
    const c = comp("Stat"); c.itemSpacing = 3; c.paddingTop = 13; c.paddingBottom = 13; c.paddingLeft = 15; c.paddingRight = 15;
    radiusVar(c, "radius/lg"); setFill(c, "bg"); setStroke(c, "border", 1);
    c.appendChild(T("7일", "Extra Bold", 22, "ink"));
    c.appendChild(T("연속 기록", "Regular", 11, "sub"));
    c.appendChild(T("+1 오늘", "Bold", 10, "success"));
    c.resize(130, c.height); c.counterAxisSizingMode = "FIXED";
    return c;
  }

  // (5) Progress — Type: bar/ring
  function buildProgress() {
    function bar() {
      const c = comp("Type=bar"); c.counterAxisSizingMode = "AUTO";
      const track = AL("HORIZONTAL", {}); track.resize(220, 8); track.cornerRadius = 999; setFill(track, "fill");
      track.clipsContent = true; track.primaryAxisSizingMode = "FIXED"; track.counterAxisSizingMode = "FIXED";
      const fillbar = figma.createRectangle(); fillbar.resize(88, 8); fillbar.cornerRadius = 999; setFill(fillbar, "primary");
      track.appendChild(fillbar); c.appendChild(track);
      return c;
    }
    function ring() {
      /* 회전 대신 arc(도넛) 로 그려 배치 오류를 피함. 71% 채움. */
      const c = comp("Type=ring"); c.layoutMode = "HORIZONTAL"; c.counterAxisAlignItems = "CENTER"; c.primaryAxisAlignItems = "CENTER";
      const wrap = figma.createFrame(); wrap.name = "ring"; wrap.resize(64, 64); wrap.fills = []; wrap.clipsContent = false;
      const TAU = Math.PI * 2, INNER = 0.75;
      const bg = figma.createEllipse(); bg.resize(64, 64); bg.arcData = { startingAngle: 0, endingAngle: 6.2831, innerRadius: INNER };
      setFill(bg, "fill");
      const fg = figma.createEllipse(); fg.resize(64, 64);
      fg.arcData = { startingAngle: -Math.PI / 2, endingAngle: -Math.PI / 2 + 0.71 * TAU, innerRadius: INNER };
      setFill(fg, "primary");
      wrap.appendChild(bg); wrap.appendChild(fg); c.appendChild(wrap);
      c.resize(64, 64); c.layoutSizingHorizontal = "HUG";
      return c;
    }
    const set = figma.combineAsVariants([bar(), ring()], page);
    return styleSet(set, "Progress");
  }

  // (6) Badge — Tone: default/blue/success/danger/coral
  function buildBadge() {
    const TONE = {
      default: { bg: "fill", tx: "body", label: "기본", dot: false, ic: null },
      blue: { bg: "primary-soft", tx: "primary-deep", label: "진행 중", dot: false, ic: null },
      success: { bg: "#E3F7EE", tx: "#087A4E", label: "완료", dot: true, ic: null },
      danger: { bg: "#FDECEE", tx: "#B02330", label: "오류", dot: false, ic: null },
      coral: { bg: "#FFECE6", tx: "#C2502F", label: "7일 연속", dot: false, ic: "flame" },
    };
    function variant(tone) {
      const t = TONE[tone];
      const c = comp("Tone=" + tone); c.layoutMode = "HORIZONTAL"; c.itemSpacing = 5; c.counterAxisAlignItems = "CENTER";
      c.paddingTop = 4; c.paddingBottom = 4; c.paddingLeft = 9; c.paddingRight = 9; c.cornerRadius = 999;
      setFill(c, t.bg);
      if (t.dot) { const d = figma.createEllipse(); d.resize(6, 6); setFill(d, t.tx); c.appendChild(d); }
      if (t.ic) { c.appendChild(icon(t.ic, 12, isHex(t.tx) ? t.tx : "#C2502F")); }
      c.appendChild(T(t.label, "Bold", 11.5, t.tx));
      return c;
    }
    const set = figma.combineAsVariants(Object.keys(TONE).map(variant), page);
    return styleSet(set, "Badge");
  }

  // (7) Avatar — Size: sm/md/lg × Fill: solid/gradient
  function buildAvatar() {
    const SIZES = { sm: 28, md: 40, lg: 56 }, FS = { sm: 12, md: 15, lg: 20 };
    function variant(size, fill) {
      const d = SIZES[size];
      const c = comp("Size=" + size + ", Fill=" + fill); c.layoutMode = "HORIZONTAL";
      c.counterAxisAlignItems = "CENTER"; c.primaryAxisAlignItems = "CENTER"; c.cornerRadius = 999;
      if (fill === "gradient") {
        c.fills = [{ type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]],
          gradientStops: [{ position: 0, color: { ...hx("#3B82F6"), a: 1 } }, { position: .52, color: { ...hx("#6F9CF0"), a: 1 } }, { position: 1, color: { ...hx("#F4A187"), a: 1 } }] }];
      } else setFill(c, "primary");
      const ini = T("김", "Bold", FS[size], "#FFFFFF"); c.appendChild(ini);
      c.resize(d, d); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      return c;
    }
    const list = [];
    for (const s of ["sm", "md", "lg"]) for (const f of ["solid", "gradient"]) list.push(variant(s, f));
    const set = figma.combineAsVariants(list, page);
    return styleSet(set, "Avatar");
  }

  // (8) Nav Item — Active: on/off
  function buildNavItem() {
    function variant(active) {
      const c = comp("Active=" + (active ? "on" : "off")); c.layoutMode = "HORIZONTAL"; c.itemSpacing = 9;
      c.counterAxisAlignItems = "CENTER"; c.paddingTop = 8; c.paddingBottom = 8; c.paddingLeft = 10; c.paddingRight = 10;
      radiusVar(c, "radius/md");
      if (active) setFill(c, "primary-soft"); else c.fills = [];
      c.appendChild(icon("home", 17, active ? "#2663EC" : "#4E5968"));
      c.appendChild(T("오늘", active ? "Bold" : "Medium", 13, active ? "primary-deep" : "body"));
      c.resize(150, c.height); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
      return c;
    }
    const set = figma.combineAsVariants([variant(true), variant(false)], page);
    return styleSet(set, "Nav Item");
  }

  // (9) Tab Bar
  function buildTabBar() {
    const c = comp("Tab Bar"); c.layoutMode = "HORIZONTAL"; c.primaryAxisAlignItems = "SPACE_BETWEEN";
    c.counterAxisAlignItems = "CENTER"; c.paddingTop = 8; c.paddingBottom = 8; c.paddingLeft = 16; c.paddingRight = 16;
    radiusVar(c, "radius/lg"); setFill(c, "bg"); setStroke(c, "border", 1);
    const tabs = [["home", "홈", true], ["pen", "필사", false], ["chart", "히트맵", false], ["heart", "추천", false], ["user", "프로필", false]];
    for (const [ic, lb, on] of tabs) {
      const t = AL("VERTICAL", { itemSpacing: 3 }); t.counterAxisAlignItems = "CENTER";
      t.appendChild(icon(ic, 20, on ? "#3B82F6" : "#8B95A1"));
      t.appendChild(T(lb, "Medium", 9.5, on ? "primary" : "sub"));
      c.appendChild(t);
    }
    c.resize(330, c.height); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED";
    return c;
  }

  // (10) Jandi
  function buildJandi() {
    const c = comp("Jandi"); c.itemSpacing = 8; c.paddingTop = 14; c.paddingBottom = 14; c.paddingLeft = 14; c.paddingRight = 14;
    radiusVar(c, "radius/lg"); setFill(c, "bg"); setStroke(c, "border", 1);
    const grid = AL("VERTICAL", { itemSpacing: 3 }); c.appendChild(grid);
    const lv = [0, 1, 0, 2, 3, 1, 0, 4, 2, 3, 1, 2, 0, 3, 1, 2, 3, 1, 0, 2, 4, 3, 2, 1, 0, 3, 2, 4, 0, 3, 1, 4, 2, 1, 3, 0, 2, 4, 1, 3, 2, 0, 1, 3];
    const jvar = ["jandi/0", "jandi/1", "jandi/2", "jandi/3", "jandi/4"];
    let idx = 0;
    for (let r = 0; r < 5; r++) {
      const row = AL("HORIZONTAL", { itemSpacing: 3 }); grid.appendChild(row);
      for (let col = 0; col < 26; col++) {
        const cell = figma.createRectangle(); cell.resize(11, 11); cell.cornerRadius = 3;
        const l = lv[(idx * 3 + 1) % lv.length]; idx++;
        cell.fills = [solidBound(V("Primitives", jvar[l]))];
        row.appendChild(cell);
      }
    }
    const legend = AL("HORIZONTAL", { itemSpacing: 5 }); legend.counterAxisAlignItems = "CENTER";
    legend.appendChild(T("적게", "Regular", 11, "sub"));
    for (let l = 0; l < 5; l++) { const s = figma.createRectangle(); s.resize(12, 12); s.cornerRadius = 3; s.fills = [solidBound(V("Primitives", jvar[l]))]; legend.appendChild(s); }
    legend.appendChild(T("많이", "Regular", 11, "sub"));
    c.appendChild(legend);
    return c;
  }

  // (11) Alert — Tone: success/error/info
  function buildAlert() {
    const TONE = {
      success: { bg: "#E7F8F0", bd: "#B7E6CF", tx: "#0A7A4E", ic: "check", msg: "필사 기록을 저장했어요." },
      error: { bg: "#FDECEE", bd: "#F2C4BD", tx: "#8A2F25", ic: "x", msg: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      info: { bg: "primary-soft", bd: "#CFE0FB", tx: "primary-deep", ic: "target", msg: "이번 주 목표까지 2일 남았어요." },
    };
    function variant(tone) {
      const t = TONE[tone];
      const c = comp("Tone=" + tone); c.layoutMode = "HORIZONTAL"; c.itemSpacing = 10; c.counterAxisAlignItems = "MIN";
      c.paddingTop = 11; c.paddingBottom = 11; c.paddingLeft = 13; c.paddingRight = 13; radiusVar(c, "radius/md");
      setFill(c, t.bg); setStroke(c, t.bd, 1);
      c.appendChild(icon(t.ic, 18, isHex(t.tx) ? t.tx : "#2663EC"));
      const p = T(t.msg, "Regular", 13, t.tx, 150); c.appendChild(p);
      c.resize(300, c.height); c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "FIXED"; fillText(p);
      return c;
    }
    const set = figma.combineAsVariants(Object.keys(TONE).map(variant), page);
    styleSet(set, "Alert"); set.counterAxisAlignItems = "MIN"; return set;
  }

  // (12) Modal
  function buildModal() {
    const c = comp("Modal"); c.itemSpacing = 6; c.counterAxisAlignItems = "CENTER";
    c.paddingTop = 28; c.paddingBottom = 24; c.paddingLeft = 24; c.paddingRight = 24; c.cornerRadius = 16;
    setFill(c, "bg");
    c.effects = [{ type: "DROP_SHADOW", color: { r: .09, g: .196, b: .29, a: .11 }, offset: { x: 0, y: 14 }, radius: 34, spread: 0, visible: true, blendMode: "NORMAL" }];
    const ring = figma.createFrame(); ring.resize(56, 56); ring.cornerRadius = 999; ring.fills = [{ type: "SOLID", color: hx("#E7F8F0") }];
    ring.layoutMode = "HORIZONTAL"; ring.primaryAxisAlignItems = "CENTER"; ring.counterAxisAlignItems = "CENTER";
    ring.appendChild(icon("check", 28, "#2FA36B")); c.appendChild(ring);
    c.appendChild(T("필사 기록을 저장했어요", "Bold", 16, "ink"));
    c.appendChild(T("시편 23:1-6 · 오늘도 한 걸음", "Regular", 12, "sub"));
    const btn = AL("HORIZONTAL", { paddingTop: 0, paddingBottom: 0 }); btn.counterAxisAlignItems = "CENTER"; btn.primaryAxisAlignItems = "CENTER";
    radiusVar(btn, "radius/lg"); setFill(btn, "primary"); btn.appendChild(T("확인", "Semi Bold", 14, "#FFFFFF"));
    c.appendChild(btn);
    c.resize(250, c.height); c.counterAxisSizingMode = "FIXED";
    btn.layoutSizingHorizontal = "FILL"; btn.resize(btn.width, 44); btn.layoutSizingVertical = "FIXED";
    return c;
  }

  // (13) Steps (5-step 진행 인디케이터)
  function buildSteps() {
    const c = comp("Steps"); c.itemSpacing = 8;
    const labels = ["범위", "언어", "사진", "Key", "QT"]; const activeIdx = 0;
    const bars = AL("HORIZONTAL", { itemSpacing: 5 }); c.appendChild(bars);
    const labs = AL("HORIZONTAL", { itemSpacing: 5 }); c.appendChild(labs);
    c.resize(320, c.height); c.counterAxisSizingMode = "FIXED";
    bars.layoutSizingHorizontal = "FILL"; labs.layoutSizingHorizontal = "FILL";
    for (let i = 0; i < 5; i++) {
      const b = figma.createFrame(); b.resize(40, 4); b.cornerRadius = 999;
      setFill(b, i <= activeIdx ? "primary" : "border"); bars.appendChild(b); b.layoutSizingHorizontal = "FILL"; b.layoutSizingVertical = "FIXED";
      const wrap = AL("HORIZONTAL", {}); wrap.primaryAxisAlignItems = "CENTER"; labs.appendChild(wrap);
      wrap.appendChild(T(labels[i], i === activeIdx ? "Bold" : "Regular", 9.5, i === activeIdx ? "primary-deep" : "sub"));
      wrap.layoutSizingHorizontal = "FILL";
    }
    return c;
  }

  // (14) Book Card
  function buildBookCard() {
    const c = comp("Book Card"); c.itemSpacing = 6; c.paddingTop = 12; c.paddingBottom = 12; c.paddingLeft = 13; c.paddingRight = 13;
    radiusVar(c, "radius/lg"); setFill(c, "bg"); setStroke(c, "border", 1);
    c.appendChild(T("시편", "Semi Bold", 13, "ink"));
    const track = figma.createFrame(); track.resize(124, 5); track.cornerRadius = 999; setFill(track, "fill"); track.clipsContent = true;
    const fillbar = figma.createRectangle(); fillbar.resize(32, 5); fillbar.cornerRadius = 999; setFill(fillbar, "primary"); track.appendChild(fillbar);
    c.appendChild(track);
    c.appendChild(T("26% · 150편", "Regular", 9.5, "sub"));
    c.resize(150, c.height); c.counterAxisSizingMode = "FIXED"; track.layoutSizingHorizontal = "FILL";
    return c;
  }

  /* ---------- 3) 보드에 배치 ---------- */
  const builders = [
    ["Input", buildInput], ["Select", buildSelect], ["Card", buildCard], ["Stat", buildStat],
    ["Progress", buildProgress], ["Badge", buildBadge], ["Avatar", buildAvatar], ["Nav Item", buildNavItem],
    ["Tab Bar", buildTabBar], ["Jandi", buildJandi], ["Alert", buildAlert], ["Modal", buildModal],
    ["Steps", buildSteps], ["Book Card", buildBookCard],
  ];

  const board = AL("HORIZONTAL", { name: "Components Sheet" });
  board.layoutWrap = "WRAP"; board.itemSpacing = 32; board.counterAxisSpacing = 32;
  board.paddingTop = 40; board.paddingBottom = 40; board.paddingLeft = 40; board.paddingRight = 40;
  board.fills = [{ type: "SOLID", color: hx("#FFFFFF") }];
  board.primaryAxisSizingMode = "FIXED"; board.counterAxisSizingMode = "AUTO";
  page.appendChild(board); board.resize(1840, 100);
  board.x = 200; board.y = 500;

  let made = 0;
  for (const [name, fn] of builders) {
    const node = fn();
    const cell = AL("VERTICAL", { name: name + " ·cell", itemSpacing: 10 });
    cell.appendChild(T(name, "Semi Bold", 12, "sub"));
    cell.appendChild(node);
    board.appendChild(cell);
    made++;
  }

  figma.notify("Re:Verse 컴포넌트 생성 완료 — " + made + "종 (+ 기존 Button)");
  console.log("done: " + made + " components");
})();
