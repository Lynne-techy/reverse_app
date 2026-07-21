/* =====================================================================
 * Re:Verse — Figma 화면 전개도(하이파이) 생성 스크립트 (Scripter)
 * ---------------------------------------------------------------------
 * 실제 프론트 레포 라우트를 그대로 반영:
 *   온보딩(로그인 이전) · 로그인 · 홈(mainpage) · 필사 · 히트맵 · 추천 · 프로필
 * 각 화면을 모바일(390) + 데스크탑(1280, 다크 사이드바) 2벌로 생성.
 * 컴포넌트 인스턴스(01 Components) + 변수 바인딩으로 조합.
 * 선행: figma-build-components.js 실행(14종 존재).
 * 멱등: "03 Screens" 의 "Screen Flow" 보드를 지우고 다시 만듭니다.
 * ===================================================================== */

(async () => {
  const CPAGE = "01 Components", SPAGE = "03 Desktop";
  const compPage = figma.root.children.find((p) => p.name === CPAGE);
  if (!compPage) { figma.notify("먼저 figma-build-components.js 를 실행하세요"); return; }
  await figma.setCurrentPageAsync(compPage);

  const FAM = "Inter";
  for (const s of ["Regular", "Medium", "Semi Bold", "Bold", "Extra Bold"]) await figma.loadFontAsync({ family: FAM, style: s });

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  const Vof = (col, nm) => { const c = collections.find((x) => x.name === col); return allVars.find((v) => v.variableCollectionId === c.id && v.name === nm); };
  function hx(h) { h = h.replace("#", ""); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; }
  const isHex = (c) => typeof c === "string" && c[0] === "#";
  const boundPaint = (v) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v);
  const fillOf = (c) => isHex(c) ? { type: "SOLID", color: hx(c) } : boundPaint(Vof("Color", c));
  const setFill = (n, c) => { n.fills = [fillOf(c)]; };
  const setStroke = (n, c, w) => { n.strokes = [fillOf(c)]; if (w != null) n.strokeWeight = w; };
  const bindNum = (n, f, nm) => n.setBoundVariable(f, Vof("Number", nm));
  const radiusVar = (n, nm) => ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"].forEach((f) => bindNum(n, f, nm));
  function T(chars, style, size, color, lh) { const t = figma.createText(); t.fontName = { family: FAM, style }; t.characters = chars; t.fontSize = size; if (lh) t.lineHeight = { unit: "PERCENT", value: lh }; setFill(t, color); return t; }
  function fillText(t) { t.textAutoResize = "HEIGHT"; t.layoutSizingHorizontal = "FILL"; }
  function AL(dir, props) { const f = figma.createFrame(); f.layoutMode = dir; f.primaryAxisSizingMode = "AUTO"; f.counterAxisSizingMode = "AUTO"; f.fills = []; f.clipsContent = false; if (props) Object.assign(f, props); return f; }
  const FILL = (n) => { n.layoutSizingHorizontal = "FILL"; return n; };
  const GRAD_IDENTITY = { type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...hx("#3B82F6"), a: 1 } }, { position: .52, color: { ...hx("#6F9CF0"), a: 1 } }, { position: 1, color: { ...hx("#F4A187"), a: 1 } }] };
  const GRAD_SKY = { type: "GRADIENT_LINEAR", gradientTransform: [[0, 1, 0], [-1, 0, 1]], gradientStops: [{ position: 0, color: { ...hx("#DBEAFE"), a: 1 } }, { position: 1, color: { ...hx("#EEF6FF"), a: 1 } }] };
  const GRAD_BLUE = { type: "GRADIENT_LINEAR", gradientTransform: [[1, 0, 0], [0, 1, 0]], gradientStops: [{ position: 0, color: { ...hx("#2663EC"), a: 1 } }, { position: 1, color: { ...hx("#1E40B0"), a: 1 } }] };

  /* ---------- 컴포넌트 인스턴스 ---------- */
  const findSet = (name) => compPage.findOne((n) => n.type === "COMPONENT_SET" && n.name === name);
  const findSingle = (name) => compPage.findOne((n) => n.type === "COMPONENT" && n.name === name && (!n.parent || n.parent.type !== "COMPONENT_SET"));
  const instV = (setName, variantName) => findSet(setName).children.find((c) => c.name === variantName).createInstance();
  const instC = (name) => findSingle(name).createInstance();
  async function ov(inst, arr) {
    const texts = inst.findAll((n) => n.type === "TEXT");
    for (let i = 0; i < arr.length && i < texts.length; i++) { if (arr[i] == null) continue; const t = texts[i]; if (t.fontName !== figma.mixed) await figma.loadFontAsync(t.fontName); t.characters = arr[i]; }
    return inst;
  }

  /* ---------- 공통 파츠 ---------- */
  function wordmark(size, onDark) {
    const row = AL("HORIZONTAL", { itemSpacing: 0 }); row.counterAxisAlignItems = "CENTER";
    row.appendChild(T("Re", "Bold", size, onDark ? "#FFFFFF" : "ink")); row.appendChild(T(":", "Bold", size, "accent")); row.appendChild(T("Verse", "Bold", size, onDark ? "#FFFFFF" : "ink"));
    return row;
  }
  const eyebrow = (t) => T(t, "Bold", 12, "primary");
  function rowAL(box, gap, align) { const r = AL("HORIZONTAL", { itemSpacing: gap }); if (align) r.counterAxisAlignItems = align; box.appendChild(r); FILL(r); return r; }
  function cardBox(pad) { const c = AL("VERTICAL", { itemSpacing: 10, paddingTop: pad, paddingBottom: pad, paddingLeft: pad, paddingRight: pad }); radiusVar(c, "radius/xl"); setFill(c, "bg"); setStroke(c, "border", 1); return c; }
  function tag(txt, bg, tx) { const p = AL("HORIZONTAL", { paddingTop: 3, paddingBottom: 3, paddingLeft: 9, paddingRight: 9 }); p.cornerRadius = 999; setFill(p, bg); p.appendChild(T(txt, "Bold", 11, tx)); return p; }

  /* ---------- 페이지 콘텐츠 (box=vertical AL, wide=데스크탑) ---------- */
  async function pageHome(box, wide) {
    const hero = AL("HORIZONTAL", { itemSpacing: 12, paddingTop: 22, paddingBottom: 22, paddingLeft: 22, paddingRight: 22 });
    hero.primaryAxisAlignItems = "SPACE_BETWEEN"; hero.counterAxisAlignItems = "CENTER"; radiusVar(hero, "radius/xl"); setFill(hero, "primary-soft");
    box.appendChild(hero); FILL(hero);
    const gc = AL("VERTICAL", { itemSpacing: 4 }); hero.appendChild(gc);
    gc.appendChild(T("안녕하세요, 김현수님 👋", "Bold", wide ? 28 : 20, "ink"));
    gc.appendChild(T("오늘도 한 글자씩, 만나러 가볼까요.", "Regular", 13, "body"));
    hero.appendChild(await ov(instV("Button", "Style=primary, Size=" + (wide ? "md" : "sm")), ["오늘 필사 시작"]));
    const verse = instV("Card", "Kind=verse"); box.appendChild(verse); FILL(verse);
    if (wide) {
      const r = rowAL(box, 16, "MIN");
      const p = progressCard(); r.appendChild(p); FILL(p);
      const s = streakCard(); r.appendChild(s); s.layoutSizingHorizontal = "FIXED"; s.resize(300, s.height);
    } else {
      const p = progressCard(); box.appendChild(p); FILL(p);
      const s = streakCard(); box.appendChild(s); FILL(s);
    }
    box.appendChild(eyebrow("올해의 필사 잔디"));
    const j = instC("Jandi"); box.appendChild(j); if (wide) { } // 자연폭
    box.appendChild(T("최근 필사 기록", "Bold", 15, "ink"));
    records(box, wide);
  }
  function progressCard() {
    const c = cardBox(18);
    c.appendChild(T("전체 성경 필사 진척률", "Medium", 12, "sub"));
    c.appendChild(T("28.4%", "Extra Bold", 30, "ink"));
    const bar = instV("Progress", "Type=bar"); c.appendChild(bar); FILL(bar);
    c.appendChild(T("8,832 / 31,102절", "Regular", 11, "sub"));
    return c;
  }
  function streakCard() {
    const c = cardBox(18);
    const r = AL("HORIZONTAL", { itemSpacing: 8 }); r.counterAxisAlignItems = "CENTER"; c.appendChild(r); FILL(r);
    r.appendChild(T("🔥", "Regular", 20, "accent")); r.appendChild(T("연속 기록", "Semi Bold", 13, "ink"));
    c.appendChild(T("7일", "Extra Bold", 30, "ink"));
    c.appendChild(T("최장 연속 42일 · 이번 주 5/7", "Regular", 11, "sub"));
    return c;
  }
  function records(box, wide) {
    const r = rowAL(box, 12); const n = wide ? 4 : 3;
    const labels = ["시편 23편", "잠언 3장", "요한복음 1장", "로마서 8장"];
    for (let i = 0; i < n; i++) {
      const cell = AL("VERTICAL", { itemSpacing: 6 }); r.appendChild(cell); FILL(cell);
      const ph = figma.createFrame(); ph.resize(100, 72); radiusVar(ph, "radius/md"); setFill(ph, "fill");
      ph.layoutMode = "HORIZONTAL"; ph.primaryAxisAlignItems = "CENTER"; ph.counterAxisAlignItems = "CENTER"; ph.appendChild(T("📷", "Regular", 18, "sub"));
      cell.appendChild(ph); ph.layoutSizingHorizontal = "FILL"; ph.resize(ph.width, 72); ph.layoutSizingVertical = "FIXED";
      cell.appendChild(T(labels[i], "Medium", 11, "body"));
    }
  }

  async function pagePilsa(box, wide) {
    box.appendChild(tag("DAILY PILSA", "primary-soft", "primary-deep"));
    box.appendChild(T("성경 필사", "Bold", wide ? 30 : 24, "ink"));
    box.appendChild(T("한 글자씩 적으며 말씀을 마음에 새겨보세요.", "Regular", 13, "sub"));
    box.appendChild(instC("Steps"));
    const c1 = cardBox(16); box.appendChild(c1); FILL(c1);
    c1.appendChild(eyebrow("① 성경 선택")); const sel = instC("Select"); c1.appendChild(sel); FILL(sel);
    const c2 = cardBox(16); box.appendChild(c2); FILL(c2);
    c2.appendChild(eyebrow("③ 절 범위"));
    const vr = rowAL(c2, 8, "CENTER");
    const i1 = instV("Input", "State=default"); vr.appendChild(i1); FILL(i1);
    vr.appendChild(T("~", "Medium", 14, "sub"));
    const i2 = instV("Input", "State=default"); vr.appendChild(i2); FILL(i2);
    const rng = AL("VERTICAL", { itemSpacing: 4, paddingTop: 16, paddingBottom: 16, paddingLeft: 18, paddingRight: 18 }); radiusVar(rng, "radius/xl"); setFill(rng, "primary-soft");
    box.appendChild(rng); FILL(rng);
    rng.appendChild(T("선택한 범위", "Medium", 11, "primary-deep"));
    rng.appendChild(T("시편 23:1-6", "Extra Bold", 22, "primary-deep"));
    const acts = rowAL(box, 10); acts.primaryAxisAlignItems = "SPACE_BETWEEN";
    acts.appendChild(await ov(instV("Button", "Style=secondary, Size=md"), ["이전"]));
    const next = await ov(instV("Button", "Style=primary, Size=md"), ["다음"]); acts.appendChild(next);
  }

  async function pageHeatmap(box, wide) {
    box.appendChild(eyebrow("히트맵"));
    box.appendChild(T("필사 활동", "Bold", wide ? 30 : 24, "ink"));
    box.appendChild(T("최근 1년간 하루하루 채워온 기록이에요.", "Regular", 13, "sub"));
    const c = cardBox(18); box.appendChild(c); FILL(c);
    const j = instC("Jandi"); c.appendChild(j);
    const st = rowAL(box, wide ? 16 : 10);
    const d = [["256일", "기록한 날", "지난 1년"], ["7일", "현재 연속", "+1 오늘"], ["42일", "최장 연속", "개인 기록"]];
    for (const dd of d) { const s = await ov(instC("Stat"), dd); st.appendChild(s); FILL(s); }
  }

  async function pageRecommend(box, wide) {
    box.appendChild(eyebrow("말씀 추천"));
    box.appendChild(T("오늘 마음은 어떠신가요?", "Bold", wide ? 30 : 24, "ink"));
    box.appendChild(T("지금의 마음과 가까운 감정을 선택하면 필사하기 좋은 말씀을 추천해드려요.", "Regular", 13, "sub", 150));
    box.appendChild(T("내 마음 선택하기", "Semi Bold", 14, "ink"));
    const moods = [["😮‍💨", "지치고 힘들어요", true], ["😟", "마음이 불안해요", false], ["😊", "감사한 마음이에요", false], ["🌙", "외롭고 쓸쓸해요", false]];
    const mrow = AL("HORIZONTAL", { itemSpacing: 10 }); mrow.layoutWrap = "WRAP"; mrow.counterAxisSpacing = 10; box.appendChild(mrow); FILL(mrow); mrow.primaryAxisSizingMode = "FIXED"; mrow.counterAxisSizingMode = "AUTO";
    for (const [em, lb, on] of moods) {
      const p = AL("HORIZONTAL", { itemSpacing: 8, paddingTop: 12, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 }); p.counterAxisAlignItems = "CENTER"; p.cornerRadius = 999;
      setStroke(p, on ? "primary" : "border", on ? 1.5 : 1); setFill(p, on ? "primary-soft" : "bg");
      p.appendChild(T(em, "Regular", 16, "body")); p.appendChild(T(lb, "Medium", 13, on ? "primary-deep" : "body"));
      mrow.appendChild(p);
    }
    // 추천 그라디언트 카드
    const g = AL("VERTICAL", { itemSpacing: 0, paddingTop: 26, paddingBottom: 26, paddingLeft: 26, paddingRight: 26 }); radiusVar(g, "radius/xl"); g.fills = [GRAD_BLUE];
    box.appendChild(g); FILL(g);
    const gt = rowAL2(g); gt.primaryAxisAlignItems = "SPACE_BETWEEN";
    const gtag = AL("HORIZONTAL", { paddingTop: 3, paddingBottom: 3, paddingLeft: 9, paddingRight: 9 }); gtag.cornerRadius = 999; gtag.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.18 }]; gtag.appendChild(T("오늘의 추천 말씀", "Bold", 11, "#FFFFFF")); gt.appendChild(gtag);
    gt.appendChild(T("✦", "Regular", 22, "#FFFFFF"));
    const gap1 = spacer(g, 14);
    const gtitle = T("오늘은 잠시 쉬어가도 괜찮아요", "Bold", wide ? 26 : 20, "#FFFFFF"); g.appendChild(gtitle); fillText(gtitle);
    const gap2 = spacer(g, 12);
    const gq = T("“수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라.”", "Regular", wide ? 17 : 15, "#EAF1FF", 165); g.appendChild(gq); fillText(gq);
    const gap3 = spacer(g, 10);
    g.appendChild(T("마태복음 11장 28절", "Bold", 12, "#BFD4FF"));
    const gap4 = spacer(g, 18);
    const cbtn = AL("HORIZONTAL", { itemSpacing: 6, paddingTop: 12, paddingBottom: 12, paddingLeft: 18, paddingRight: 18 }); cbtn.counterAxisAlignItems = "CENTER"; radiusVar(cbtn, "radius/lg"); setFill(cbtn, "bg");
    cbtn.appendChild(T("✎ 이 말씀으로 필사하기", "Bold", 14, "primary-deep")); g.appendChild(cbtn);
    // 다른 추천
    box.appendChild(T("이런 말씀도 추천해요", "Bold", wide ? 20 : 17, "ink"));
    const recs = [["평안", "평안이 필요한 날", "여호와는 나의 목자시니 내게 부족함이 없으리로다.", "시편 23편 1-2절"], ["용기", "결정을 앞두고 있는 날", "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.", "잠언 3장 5-6절"], ["소망", "조금 더 힘을 내고 싶은 날", "소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며.", "로마서 12장 12절"]];
    if (wide) { const rr = rowAL(box, 16, "MIN"); for (const rc of recs) { const card = recCard(rc); rr.appendChild(card); FILL(card); } }
    else { for (const rc of recs) { const card = recCard(rc); box.appendChild(card); FILL(card); } }
  }
  function rowAL2(box) { const r = AL("HORIZONTAL", {}); r.counterAxisAlignItems = "CENTER"; box.appendChild(r); FILL(r); return r; }
  function spacer(box, h) { const s = AL("VERTICAL", {}); box.appendChild(s); FILL(s); s.resize(s.width || 10, h); s.layoutSizingVertical = "FIXED"; return s; }
  function recCard(rc) {
    const [tg, title, desc, ref] = rc;
    const c = cardBox(20);
    const top = rowAL2(c); top.primaryAxisAlignItems = "SPACE_BETWEEN";
    top.appendChild(tag(tg, "primary-soft", "primary-deep")); top.appendChild(T("♡", "Regular", 16, "border-strong"));
    const h = T(title, "Bold", 16, "ink"); c.appendChild(h); fillText(h);
    const d = T(desc, "Regular", 13, "body", 160); c.appendChild(d); fillText(d);
    c.appendChild(T(ref, "Bold", 11, "primary"));
    return c;
  }

  async function pageProfile(box, wide) {
    box.appendChild(eyebrow("마이페이지"));
    box.appendChild(T("프로필", "Bold", wide ? 30 : 24, "ink"));
    box.appendChild(T("나의 필사 기록과 계정 정보를 확인해보세요.", "Regular", 13, "sub"));
    const prof = instV("Card", "Kind=gradient"); box.appendChild(prof); FILL(prof);
    const st = rowAL(box, wide ? 16 : 10);
    for (const dd of [["128", "필사 기록", "누적"], ["28.4%", "진척률", "8,832절"], ["2", "완료한 성경", "창세기·룻기"]]) { const s = await ov(instC("Stat"), dd); st.appendChild(s); FILL(s); }
    const pc = progressCard(); box.appendChild(pc); FILL(pc);
    box.appendChild(T("나의 기록 뱃지", "Bold", wide ? 20 : 17, "ink"));
    const badges = [["🔥", "7일 연속 필사", "최장 연속 42일이에요."], ["✍️", "8,832절 필사", "지금까지 총 128번 필사했어요."], ["📖", "2권 완필", "전체 성경의 28.4%를 기록했어요."]];
    if (wide) { const rr = rowAL(box, 16, "MIN"); for (const b of badges) { const c = badgeCard(b); rr.appendChild(c); FILL(c); } }
    else { for (const b of badges) { const c = badgeCard(b); box.appendChild(c); FILL(c); } }
    const out = AL("HORIZONTAL", {}); out.primaryAxisAlignItems = "MAX"; box.appendChild(out); FILL(out);
    out.appendChild(T("로그아웃", "Semi Bold", 13, "sub"));
  }
  function badgeCard(b) {
    const [em, title, desc] = b; const c = cardBox(18);
    const ic = AL("HORIZONTAL", { paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10 }); ic.cornerRadius = 12; setFill(ic, "primary-soft"); ic.appendChild(T(em, "Regular", 20, "ink")); c.appendChild(ic);
    c.appendChild(T(title, "Bold", 14, "ink"));
    const d = T(desc, "Regular", 12, "sub", 150); c.appendChild(d); fillText(d);
    return c;
  }

  /* ---------- 셸 ---------- */
  const MW = 390, MH = 844, DW = 1280, DH = 900, SIDE = 240;
  function mobile(title, opts) {
    const frame = figma.createFrame(); frame.name = "M · " + title; frame.resize(MW, MH); setFill(frame, "surface"); frame.clipsContent = true;
    const content = AL("VERTICAL", { itemSpacing: 14, paddingTop: 16, paddingBottom: (opts && opts.tab) ? 88 : 24, paddingLeft: 16, paddingRight: 16 });
    frame.appendChild(content); content.x = 0; content.y = 0; content.layoutSizingHorizontal = "FIXED"; content.resize(MW, content.height); content.counterAxisSizingMode = "FIXED";
    return { frame, content };
  }
  function mobileTab(frame) { const t = instC("Tab Bar"); frame.appendChild(t); t.x = 16; t.y = MH - 72; t.resize(MW - 32, t.height); }

  function darkNav(icon, label, active) {
    const r = AL("HORIZONTAL", { itemSpacing: 12, paddingTop: 11, paddingBottom: 11, paddingLeft: 14, paddingRight: 14 }); r.counterAxisAlignItems = "CENTER"; radiusVar(r, "radius/lg");
    if (active) r.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.15 }]; else r.fills = [];
    r.appendChild(T(icon, "Regular", 16, "#FFFFFF"));
    const lb = T(label, active ? "Semi Bold" : "Regular", 14, "#FFFFFF"); if (!active) lb.opacity = 0.6; r.appendChild(lb);
    return r;
  }
  function desktop(title, active) {
    const frame = figma.createFrame(); frame.name = "D · " + title; frame.resize(DW, DH); setFill(frame, "surface"); frame.clipsContent = true;
    const side = AL("VERTICAL", { itemSpacing: 4, paddingTop: 28, paddingBottom: 24, paddingLeft: 16, paddingRight: 16 }); setFill(side, "ink");
    frame.appendChild(side); side.x = 0; side.y = 0; side.resize(SIDE, DH); side.primaryAxisSizingMode = "FIXED"; side.counterAxisSizingMode = "FIXED";
    const brand = AL("VERTICAL", { itemSpacing: 2, paddingLeft: 8, paddingBottom: 10 }); side.appendChild(brand); FILL(brand);
    brand.appendChild(wordmark(22, true));
    const tl = T("내가 적은 만큼 만나는 하나님", "Regular", 11, "#FFFFFF"); tl.opacity = 0.5; brand.appendChild(tl);
    const nav = AL("VERTICAL", { itemSpacing: 4, paddingTop: 12 }); side.appendChild(nav); FILL(nav);
    for (const [ic, lb] of [["⌂", "홈"], ["✎", "필사"], ["▦", "히트맵"], ["♡", "추천"], ["○", "프로필"]]) { const r = darkNav(ic, lb, lb === active); nav.appendChild(r); FILL(r); }
    const gap = AL("VERTICAL", {}); side.appendChild(gap); FILL(gap); gap.layoutSizingVertical = "FILL";
    const foot = AL("VERTICAL", { itemSpacing: 3, paddingTop: 14, paddingBottom: 14, paddingLeft: 14, paddingRight: 14 }); radiusVar(foot, "radius/lg"); foot.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }];
    side.appendChild(foot); FILL(foot); foot.appendChild(T("Re:Verse", "Bold", 12, "#FFFFFF"));
    const fp = T("오늘도 한 글자씩 기록해요.", "Regular", 11, "#FFFFFF"); fp.opacity = 0.6; foot.appendChild(fp);
    const div = figma.createRectangle(); div.resize(1, DH); setFill(div, "border"); frame.appendChild(div); div.x = SIDE; div.y = 0;
    const main = AL("VERTICAL", { itemSpacing: 20, paddingTop: 36, paddingBottom: 36, paddingLeft: 40, paddingRight: 40 });
    frame.appendChild(main); main.x = SIDE; main.y = 0; main.layoutSizingHorizontal = "FIXED"; main.resize(DW - SIDE, main.height); main.primaryAxisSizingMode = "AUTO"; main.counterAxisSizingMode = "FIXED";
    // 콘텐츠는 max 880 중앙 컬럼
    const col = AL("VERTICAL", { itemSpacing: 20 }); main.appendChild(col); col.layoutSizingHorizontal = "FIXED"; col.resize(Math.min(DW - SIDE - 80, 880), col.height);
    return { frame, main: col };
  }

  /* ---------- 온보딩 / 로그인 (풀블리드) ---------- */
  function onboarding(w, h, big) {
    const frame = figma.createFrame(); frame.name = (big ? "D · " : "M · ") + "온보딩(로그인 이전)"; frame.resize(w, h); frame.fills = [GRAD_SKY]; frame.clipsContent = true;
    const col = AL("VERTICAL", { itemSpacing: 14 }); col.counterAxisAlignItems = "CENTER"; frame.appendChild(col);
    col.layoutSizingHorizontal = "FIXED"; col.resize(Math.min(w - 48, 360), 10); col.x = (w - Math.min(w - 48, 360)) / 2; col.y = big ? 150 : 120;
    col.appendChild(wordmark(big ? 44 : 36));
    col.appendChild(T("내가 적은 만큼 만나는 하나님", "Medium", 14, "primary-deep"));
    col.appendChild(T("✍️", "Regular", 52, "ink"));
    const tt = T("성경을 읽지 말고, 쓰세요", "Bold", big ? 26 : 22, "ink"); col.appendChild(tt); tt.textAlignHorizontal = "CENTER"; fillText(tt);
    const dd = T("한 글자씩 손으로 옮겨 적을 때 비로소 보이는 것들이 있습니다. 가장 적극적인 성경 읽기.", "Regular", 14, "body", 160); col.appendChild(dd); dd.textAlignHorizontal = "CENTER"; fillText(dd);
    const dots = AL("HORIZONTAL", { itemSpacing: 6 }); col.appendChild(dots);
    for (let i = 0; i < 3; i++) { const d = figma.createEllipse(); d.resize(7, 7); setFill(d, i === 0 ? "primary" : "border-strong"); dots.appendChild(d); }
    return { frame, col };
  }
  async function onboardingFill(o, big) {
    const start = await ov(instV("Button", "Style=primary, Size=lg"), ["다음"]); o.col.appendChild(start); FILL(start);
    o.col.appendChild(T("건너뛰기", "Medium", 13, "sub"));
  }
  async function login(w, h, big) {
    const frame = figma.createFrame(); frame.name = (big ? "D · " : "M · ") + "로그인"; frame.resize(w, h); setFill(frame, "surface"); frame.clipsContent = true;
    const hero = figma.createFrame(); hero.resize(w, big ? 300 : 320); hero.fills = [GRAD_SKY]; hero.layoutMode = "VERTICAL"; hero.primaryAxisAlignItems = "CENTER"; hero.counterAxisAlignItems = "CENTER"; hero.itemSpacing = 8; hero.clipsContent = true;
    frame.appendChild(hero); hero.x = 0; hero.y = 0;
    hero.appendChild(wordmark(big ? 46 : 38)); hero.appendChild(T("내가 적은 만큼 만나는 하나님", "Medium", 14, "primary-deep"));
    const card = AL("VERTICAL", { itemSpacing: 14, paddingTop: 26, paddingBottom: 26, paddingLeft: 24, paddingRight: 24 }); radiusVar(card, "radius/xl"); setFill(card, "bg"); setStroke(card, "border", 1);
    card.effects = [{ type: "DROP_SHADOW", color: { r: .09, g: .196, b: .29, a: .1 }, offset: { x: 0, y: 10 }, radius: 30, spread: 0, visible: true, blendMode: "NORMAL" }];
    frame.appendChild(card); card.layoutSizingHorizontal = "FIXED"; card.resize(360, 10); card.x = (w - 360) / 2; card.y = big ? 220 : 250;
    const hc = AL("VERTICAL", { itemSpacing: 4 }); card.appendChild(hc); FILL(hc);
    hc.appendChild(T("환영합니다", "Bold", 20, "ink")); hc.appendChild(T("로그인하여 오늘의 말씀을 만나보세요.", "Regular", 13, "sub"));
    const g = await ov(instV("Button", "Style=primary, Size=lg"), ["🔵  Google로 시작하기"]); card.appendChild(g); FILL(g);
    const tm = T("계속 진행하면 이용약관 및 개인정보처리방침에 동의합니다.", "Regular", 11, "sub", 150); card.appendChild(tm); fillText(tm); tm.textAlignHorizontal = "CENTER";
    return frame;
  }

  /* ---------- 전용 페이지(03 Desktop)를 비우고 그 위에 생성 ---------- */
  let sp = figma.root.children.find((p) => p.name === SPAGE);
  if (!sp) { sp = figma.createPage(); sp.name = SPAGE; }
  for (const n of [...sp.children]) n.remove(); // 전용 페이지라 통째로 비움
  await figma.setCurrentPageAsync(sp);
  for (const n of [...compPage.children]) { const nm = n.name || ""; if (n.type === "INSTANCE" || nm.indexOf("M · ") === 0 || nm.indexOf("D · ") === 0 || nm.indexOf("Screen Flow") === 0) n.remove(); }
  const legacy = figma.root.children.find((p) => p.name === "03 Screens"); if (legacy && legacy !== sp) { try { legacy.remove(); } catch (e) {} } // 옛 통합 페이지 제거

  /* ---------- 보드 먼저, 화면을 완성 즉시 꽂기(증분 배치) ---------- */
  const board = AL("VERTICAL", { name: "Screen Flow — Desktop", itemSpacing: 16, paddingTop: 56, paddingBottom: 56, paddingLeft: 56, paddingRight: 56 });
  setFill(board, "fill"); sp.appendChild(board); board.x = 0; board.y = 0;
  board.appendChild(T("데스크탑 (1280, 다크 사이드바)", "Bold", 22, "ink"));
  const cells = AL("HORIZONTAL", { itemSpacing: 48 }); cells.counterAxisAlignItems = "MIN"; board.appendChild(cells);
  const errors = [];
  function place(frame) { const cell = AL("VERTICAL", { itemSpacing: 10 }); cell.counterAxisAlignItems = "MIN"; cell.appendChild(T(frame.name.replace(/^[MD] · /, ""), "Semi Bold", 13, "sub")); cell.appendChild(frame); cells.appendChild(cell); }
  async function build(label, fn) { try { const f = await fn(); if (f) place(f); } catch (e) { errors.push(label + " → " + (e && e.message ? e.message : String(e))); } }

  await build("온보딩", async () => { const o = onboarding(DW, DH, true); await onboardingFill(o, true); return o.frame; });
  await build("로그인", async () => await login(DW, DH, true));
  await build("홈", async () => { const s = desktop("홈", "홈"); await pageHome(s.main, true); return s.frame; });
  await build("필사", async () => { const s = desktop("필사", "필사"); await pagePilsa(s.main, true); return s.frame; });
  await build("히트맵", async () => { const s = desktop("히트맵", "히트맵"); await pageHeatmap(s.main, true); return s.frame; });
  await build("추천", async () => { const s = desktop("추천", "추천"); await pageRecommend(s.main, true); return s.frame; });
  await build("프로필", async () => { const s = desktop("프로필", "프로필"); await pageProfile(s.main, true); return s.frame; });

  if (errors.length) { const et = T("⚠ 빌드 에러 " + errors.length + "건\n- " + errors.join("\n- "), "Semi Bold", 15, "danger", 150); et.textAutoResize = "WIDTH_AND_HEIGHT"; board.insertChild(0, et); }
  await figma.setCurrentPageAsync(sp);
  figma.notify(errors.length ? ("데스크탑 v4 · 에러 " + errors.length + "건 — 보드 상단 확인") : ("데스크탑 v4 완료 — " + cells.children.length + "화면"));
  console.log("desktop v4 — " + cells.children.length + (errors.length ? ("\n" + errors.join("\n")) : ""));
})();
