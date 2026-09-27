/* SAHNE 1 — TAKSİ (0–10 s)  Açılış 20 TL, km başına 5 TL.
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  /** text with exponents written as ^{…}, centred at x */
  function pw(ctx, str, x, y, size, o = {}) {
    const a = o.alpha ?? 1; if (a <= 0) return;
    const parts = []; let rest = str;
    while (rest.length) { const i = rest.indexOf('^{'); if (i < 0) { parts.push([rest, false]); break; } if (i > 0) parts.push([rest.slice(0, i), false]); const j = rest.indexOf('}', i); parts.push([rest.slice(i + 2, j), true]); rest = rest.slice(j + 1); }
    const W = F().width, ws = parts.map(([s, sup]) => W(ctx, s, sup ? size * 0.6 : size)), tot = ws.reduce((p, q) => p + q, 0);
    let left = x - tot / 2;
    if (o.halo !== false) { ctx.fillStyle = `rgba(${LI.PAPER_RGB},${0.85 * a})`; ctx.fillRect(left - 14, y - size * 0.75, tot + 28, size * 1.35); }
    parts.forEach(([s, sup], i) => { A.text(ctx, s, left, sup ? y - size * 0.38 : y, { size: sup ? size * 0.6 : size, alpha: a, align: 'left', color: o.color }); left += ws[i]; });
  }
  function eqs(ctx, env, t, rows) {
    const E = KD.L(env).EQ;
    rows.forEach(([t0, t1, s, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) pw(ctx, s, E.x, E.y[i], E.s * (hot ? 1.05 : 0.9), { alpha: al, color: hot ? A.amber : undefined }); });
  }
  const G = (env, x, y) => { const g = KD.L(env).GF; return [g.x + x * g.kx, g.y - y * g.ky]; };
  function graphAxes(ctx, env, a) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    ctx.strokeStyle = `rgba(${LI.INK_RGB},${a * 0.12})`; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = 0; x <= 10; x++) { const p = G(env, x, 0), q = G(env, x, 80); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    for (let y = 0; y <= 80; y += 10) { const p = G(env, 0, y), q = G(env, 10, y); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
    ctx.stroke();
    const O = G(env, 0, 0), X = G(env, 10.6, 0), Y = G(env, 0, 86);
    Ink.path(ctx, [O, X], { w: 3, alpha: a, seed: 1900, taper: [0, 0] }); Ink.path(ctx, [O, Y], { w: 3, alpha: a, seed: 1901, taper: [0, 0] });
    for (let x = 2; x <= 10; x += 2) { const q = G(env, x, 0); F().T(ctx, String(x), q[0], q[1] + 20, { size: s * 0.5, alpha: a, halo: true }); }
    for (let y = 20; y <= 80; y += 20) { const q = G(env, 0, y); F().T(ctx, String(y), q[0] - 24, q[1], { size: s * 0.5, alpha: a, halo: true }); }
    F().T(ctx, 'km', X[0] + 20, X[1] + 20, { size: s * 0.55, alpha: a, halo: true }); F().T(ctx, 'TL', Y[0] + 24, Y[1], { size: s * 0.55, alpha: a, halo: true });
  }
  function line(ctx, env, m, b, a, k, seed, color, x1 = 10) { if (a <= 0 || k <= 0) return; const p = G(env, 0, b), q = G(env, x1 * k, b + m * x1 * k); Ink.path(ctx, [p, q], { w: 4.5, alpha: a, seed, taper: [0, 0], color }); }
  function dot(ctx, env, x, y, a, label, color, dx = 30, dy = -24) { if (a <= 0) return; const q = G(env, x, y), s = KD.L(env).G.s; ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, 7); ctx.fillStyle = color ? `rgba(${color},${a})` : amber(a); ctx.fill(); if (label) F().T(ctx, label, q[0] + dx, q[1] + dy, { size: s * 0.58, alpha: a, halo: true, color: color ? undefined : A.amber }); }
  function table(ctx, env, t, a) {
    if (a <= 0) return; const T = KD.L(env).TB, s = KD.L(env).G.s, V = env.V, rows = [['km', 'TL'], [0, 20], [1, 25], [2, 30], [3, 35], [4, 40]];
    rows.forEach(([x, y], i) => {
      const k = a * seg(t, 11.4 + i * 0.5, 11.8 + i * 0.5); if (k <= 0) return;
      const pos = V ? [[T.x[i], T.y[0]], [T.x[i], T.y[1]]] : [[T.x[0], T.y[i]], [T.x[1], T.y[i]]];
      F().T(ctx, String(x), pos[0][0], pos[0][1], { size: s * 0.72, alpha: k, halo: true, color: i ? undefined : A.amber });
      F().T(ctx, String(y), pos[1][0], pos[1][1], { size: s * 0.72, alpha: k, halo: true, color: i ? undefined : A.amber });
    });
  }

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Taksi: açılış 20 TL, her km 5 TL'],
      [10.6, 27.8, 'Tablo, grafik ve cebirsel ifade'],
      [28.4, 45.8, 'Hangi soruya hangi temsil?'],
      [46.4, 63.8, 'İki taksiyi karşılaştıralım'],
      [64.4, 79.8, 'Temsilleri değerlendirelim'],
    ]);
  }

  function figure(ctx, env, t) {
    const a = END(t), aG = a * win(t, 10.8, 79.8);
    const m = a * win(t, 5.0, 10.2);
    if (m > 0) {
      const km = Math.min(4, Math.floor(seg(t, 5.8, 9.6) * 5)), c = G(env, 5, 45), s = KD.L(env).G.s, w = s * 7.5, h = s * 2.6;
      ctx.fillStyle = `rgba(${LI.PAPER_RGB},${m})`; ctx.fillRect(c[0] - w / 2, c[1] - h / 2, w, h);
      Ink.path(ctx, [[c[0] - w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] + h / 2], [c[0] - w / 2, c[1] + h / 2], [c[0] - w / 2, c[1] - h / 2]], { w: 4, alpha: m, seed: 1950, taper: [0, 0] });
      F().T(ctx, 'TAKSİMETRE', c[0], c[1] - h * 0.28, { size: s * 0.55, alpha: m });
      F().T(ctx, `${km} km  ·  ${20 + 5 * km} TL`, c[0], c[1] + h * 0.14, { size: s * 1.05, alpha: m, color: A.amber });
    }
    graphAxes(ctx, env, aG * seg(t, 11.0, 11.6));
    table(ctx, env, t, a * win(t, 10.8, 27.8));
    [[0, 20], [1, 25], [2, 30], [3, 35], [4, 40]].forEach(([x, y], i) => dot(ctx, env, x, y, aG * seg(t, 14.4 + i * 0.4, 14.8 + i * 0.4) * (t < 46 ? 1 : 0.5), null, LI.INK_RGB));
    line(ctx, env, 5, 20, aG, seg(t, 17.2, 18.6), 1910, LI.AMBER_RGB);
    const eq = aG * seg(t, 19.4, 19.8);
    if (eq > 0) { const q = G(env, 7.2, 62), s = KD.L(env).G.s; F().T(ctx, 'y = 5x + 20', q[0], q[1] - 30, { size: s * 0.8, alpha: eq, halo: true, color: A.amber }); }
    // S3: which representation for which question
    const q1 = a * win(t, 29.4, 45.8);
    dot(ctx, env, 8, 60, q1 * seg(t, 36.2, 36.6), '(8, 60)', null, 44, 22);
    if (q1 > 0) { const k = seg(t, 35.0, 36.2), A_ = G(env, 0, 60), B_ = G(env, 8, 60), C_ = G(env, 8, 0); if (k > 0) { Ink.path(ctx, [A_, [lerp(A_[0], B_[0], Math.min(1, k * 2)), A_[1]]], { w: 2.5, alpha: q1 * 0.8, seed: 1920, taper: [0, 0], color: LI.AMBER_RGB }); if (k > 0.5) Ink.path(ctx, [B_, [B_[0], lerp(B_[1], C_[1], (k - 0.5) * 2)]], { w: 2.5, alpha: q1 * 0.8, seed: 1921, taper: [0, 0], color: LI.AMBER_RGB }); } }
    tally(ctx, env, t, [[29.6, 45.8, '12 km? Cebirsel: 5 · 12 + 20 = 80 TL'], [33.0, 45.8, '60 TL ile kaç km? Grafikten oku'], [37.0, 45.8, 'Kontrol: 5 · 8 + 20 = 60 ✓'], [39.4, 45.8, 'İlk km’ler? Tablo yeter', true]]);
    // S4: a second taxi
    const a4 = a * win(t, 46.8, 79.8);
    line(ctx, env, 7, 10, a4, seg(t, 47.4, 48.8), 1930, LI.INK_RGB);
    const lb = a4 * seg(t, 48.8, 49.2); if (lb > 0) { const q = G(env, 9.2, 74), s = KD.L(env).G.s; F().T(ctx, 'B: y = 7x + 10', q[0] - 60, q[1] - 36, { size: s * 0.66, alpha: lb, halo: true }); const r = G(env, 9.6, 68); F().T(ctx, 'A', r[0] + 20, r[1] + 10, { size: s * 0.66, alpha: lb, halo: true, color: A.amber }); }
    dot(ctx, env, 5, 45, a4 * seg(t, 51.0, 51.4) * win(t, 50.8, 63.8), '(5, 45)', null, -50, -24);
    tally(ctx, env, t, [[49.4, 63.8, 'A: 5x + 20 · B: 7x + 10'], [51.4, 63.8, '5 km’de ikisi de 45 TL'], [53.4, 63.8, '5 km’den kısa: B ucuz · uzun: A ucuz', true], [56.4, 63.8, 'Grafik farkı bir bakışta gösterdi']]);
    tally(ctx, env, t, [[65.4, 79.8, 'Tablo: birkaç değer, hızlı bakış'], [67.4, 79.8, 'Grafik: eğilim ve karşılaştırma'], [69.4, 79.8, 'Cebirsel ifade: her değer, kesin sonuç'], [72.4, 79.8, 'Soruya göre en kullanışlısını seç', true]]);
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.6, 10.2, 'Ücret, gidilen yola bağlı'],
      [11.4, 27.8, 'Tablo: her km’de 5 TL artıyor'],
      [29.4, 45.8, 'Soruya göre temsil seçelim, gerekirse geçiş yapalım'],
      [47.4, 63.8, 'B taksisi: açılış 10 TL, km başına 7 TL'],
      [65.4, 79.8, 'Hangi temsil ne zaman daha ekonomik?']]);
    exprs(ctx, t, at(W, 1), [[7.6, 10.2, 'Gidilen yol x, ücret y'], [18.4, 27.8, 'Noktalar bir doğru üzerinde: doğrusal fonksiyon'],
      [41.0, 45.8, 'Grafikten okuduğumuzu cebirle doğruladık'],
      [58.0, 63.8, 'Tablo ile bunu görmek için çok satır gerekirdi'],
      [75.0, 79.8, 'Aynı durum, üç temsil, farklı kolaylıklar']]);
    exprs(ctx, t, at(W, 2), [[9.0, 10.2, 'Bu ilişkiyi nasıl gösterelim?', true], [22.0, 27.8, 'Tablo, grafik, y = 5x + 20: aynı ilişki', true],
      [43.0, 45.8, 'Her temsilin güçlü olduğu yer farklı', true], [60.0, 63.8, 'Karşılaştırmada grafik kullanışlı', true], [77.0, 79.8, 'Kararı soruya göre ver', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['Doğrusal ilişki: sabit artış', 80.6], ['Tablo, grafik, cebirsel ifade', 81.6], ['Gerekince temsiller arasında geç', 82.6], ['Soruya en uygun temsili seç!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'A taxi', nameTr: 'Taksi', concept: '20 TL + 5 TL/km', conceptTr: '20 TL + 5 TL/km', render });
})(window.LI = window.LI || {});
