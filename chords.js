(function (g) {
'use strict';
// fr: 6. telden 1. tele perde (-1 = çalınmaz), fg: parmak (0 = boş tel), ab: alternatif bas [tel, perde]
const C = (n, fam, fr, fg, ab) => ({ n, fam, fr, fg, ab });
const CHORDS = [
  C('Am', 'min', [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0], [0, 0]),
  C('Em', 'min', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),
  C('Dm', 'min', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1], [1, 0]),
  C('Bm', 'min', [-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1], [0, 2]),
  C('C', 'maj', [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], [0, 3]),
  C('G', 'maj', [3, 2, 0, 0, 0, 3], [3, 2, 0, 0, 0, 4], [2, 0]),
  C('D', 'maj', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], [1, 0]),
  C('A', 'maj', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0], [0, 0]),
  C('E', 'maj', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
  C('F', 'maj', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1]),
  C('Am7', 'sev', [-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0], [0, 0]),
  C('Em7', 'sev', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]),
  C('Dm7', 'sev', [-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1], [1, 0]),
  C('Bm7', 'sev', [-1, 2, 0, 2, 0, 2], [0, 1, 0, 2, 0, 3], [0, 2]),
  C('Cmaj7', 'sev', [-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0], [0, 3]),
  C('Fmaj7', 'sev', [-1, -1, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0], [1, 3]),
  C('E7', 'sev', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
  C('G7', 'sev', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1], [2, 0]),
  C('D7', 'sev', [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3], [1, 0]),
  C('A7', 'sev', [-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0], [0, 0]),
  C('B7', 'sev', [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4], [0, 2]),
  C('Asus2', 'sus', [-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0], [0, 0]),
  C('Asus4', 'sus', [-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0], [0, 0]),
  C('Dsus2', 'sus', [-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0], [1, 0]),
  C('Dsus4', 'sus', [-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4], [1, 0]),
  C('Esus4', 'sus', [0, 2, 2, 2, 0, 0], [0, 2, 3, 4, 0, 0]),
  C('Cadd9', 'sus', [-1, 3, 2, 0, 3, 3], [0, 2, 1, 0, 3, 4], [0, 3]),
  C('G/B', 'sla', [-1, 2, 0, 0, 3, 3], [0, 1, 0, 0, 3, 4], [2, 0]),
  C('D/F#', 'sla', [2, -1, 0, 2, 3, 2], [1, 0, 0, 2, 4, 3], [2, 0]),
  C('Am/G', 'sla', [3, -1, 2, 2, 1, 0], [4, 0, 2, 3, 1, 0]),
  C('C/E', 'sla', [0, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0])
];
const FAMS = [['maj', 'Açık majör'], ['min', 'Açık minör'], ['sev', '7’li akorlar'], ['sus', 'sus ve add'], ['sla', 'Slash (bas notalı)']];
const CH = {};
CHORDS.forEach(c => { CH[c.n] = c; });

// Taşınabilir barre kalıpları
const SHAPES = {
  E: { openPc: 4,
    '': { rel: [0, 2, 2, 1, 0, 0], fg: [1, 3, 4, 2, 1, 1] },
    m: { rel: [0, 2, 2, 0, 0, 0], fg: [1, 3, 4, 1, 1, 1] },
    '7': { rel: [0, 2, 0, 1, 0, 0], fg: [1, 3, 1, 2, 1, 1] },
    m7: { rel: [0, 2, 0, 0, 0, 0], fg: [1, 3, 1, 1, 1, 1] } },
  A: { openPc: 9,
    '': { rel: [-1, 0, 2, 2, 2, 0], fg: [0, 1, 2, 3, 4, 1] },
    m: { rel: [-1, 0, 2, 2, 1, 0], fg: [0, 1, 3, 4, 2, 1] },
    '7': { rel: [-1, 0, 2, 0, 2, 0], fg: [0, 1, 3, 1, 4, 1] },
    m7: { rel: [-1, 0, 2, 0, 1, 0], fg: [0, 1, 3, 1, 2, 1] },
    maj7: { rel: [-1, 0, 2, 1, 2, 0], fg: [0, 1, 3, 2, 4, 1] } }
};
function barreFret(shape, rootPc) { return ((rootPc - SHAPES[shape].openPc) % 12 + 12) % 12; }
function barreChord(shape, q, n, name) {
  const d = SHAPES[shape][q]; if (!d) return null;
  return { n: name || (shape + q + '@' + n), fam: 'bar', shape, fr: d.rel.map(x => x < 0 ? -1 : x + n), fg: n === 0 ? d.rel.map((x, i) => x > 0 ? d.fg[i] - 1 : 0) : d.fg.slice(), barre: n };
}
const GEN = {};
// "F#m", "Bb7", "F|E" (Mi şekli barre), "C|A" (La şekli barre)
function getChord(spec) {
  if (CH[spec]) return CH[spec];
  if (GEN[spec]) return GEN[spec];
  const m = String(spec).match(/^([A-G][#b]?)(m7|maj7|m|7|)(?:\|([EA]))?$/);
  if (!m) return null;
  const pc = M.pcOf(m[1]), q = m[2];
  let shape = m[3];
  if (!shape) {
    const opts = ['E', 'A'].filter(s => SHAPES[s][q]).map(s => ({ s, n: barreFret(s, pc) })).filter(o => o.n > 0);
    if (!opts.length) return null;
    opts.sort((a, b) => a.n - b.n); shape = opts[0].s;
  }
  if (!SHAPES[shape][q]) return null;
  const c = barreChord(shape, q, barreFret(shape, pc), spec);
  GEN[spec] = c; return c;
}
const baseName = spec => String(spec).split('|')[0];

function bassIdx(c) { for (let i = 0; i < 6; i++) if (c.fr[i] >= 0) return i; return 0; }
function altBass(c) {
  if (c.ab) return c.ab;
  for (let i = bassIdx(c) + 1; i < 6; i++) if (c.fr[i] >= 0) return [i, c.fr[i]];
  const b = bassIdx(c); return [b, c.fr[b]];
}
function posSet(c) { const s = new Set(); c.fr.forEach((f, i) => { if (f > 0) s.add(i + ':' + f); }); return s; }
function transition(a, b) {
  const A = posSet(a), B = posSet(b);
  return { stay: [...A].filter(x => B.has(x)), leave: [...A].filter(x => !B.has(x)), arrive: [...B].filter(x => !A.has(x)) };
}
function marksFor(t, side) {
  const m = {};
  t.stay.forEach(k => { m[k] = 'stay'; });
  (side === 'a' ? t.leave : t.arrive).forEach(k => { m[k] = side === 'a' ? 'leave' : 'arrive'; });
  return m;
}

// Akor diyagramı (SVG)
function diagramV(c, o) {
  o = o || {};
  const fr = c.fr, fg = c.fg || [];
  const pl = fr.filter(x => x > 0);
  const ex = o.extra && o.extra[1] > 0 ? [o.extra[1]] : [];
  const all = pl.concat(ex);
  const maxF = all.length ? Math.max.apply(null, all) : 0, minF = all.length ? Math.min.apply(null, all) : 0;
  const base = maxF > 5 ? minF : 1;
  const W = 120, H = 146, x0 = 24, dx = 15, y0 = 30, dy = 22, rows = 5;
  const hot = o.hot == null ? [] : [].concat(o.hot);
  const marks = o.marks || {};
  const rootPc = o.root === false ? null : (() => { const p = M.chordParse(baseName(c.n)); return p ? M.pcOf(p.bass || p.root) : null; })();
  let s = `<svg class="dg${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="akor şeması">`;
  for (let r = 0; r <= rows; r++) s += `<line x1="${x0}" x2="${x0 + 5 * dx}" y1="${y0 + r * dy}" y2="${y0 + r * dy}" class="${r === 0 && base === 1 ? 'nut' : 'fl'}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x0 + i * dx}" x2="${x0 + i * dx}" y1="${y0}" y2="${y0 + rows * dy}" class="${hot.includes(i) ? 'str hot' : 'str'}"/>`;
  if (base > 1) s += `<text x="${x0 - 6}" y="${y0 + dy / 2 + 4}" class="bl" text-anchor="end">${base}</text>`;
  for (let i = 0; i < 6; i++) {
    const x = x0 + i * dx;
    if (fr[i] < 0) s += `<text x="${x}" y="${y0 - 8}" class="mx" text-anchor="middle">×</text>`;
    else if (fr[i] === 0) s += `<circle cx="${x}" cy="${y0 - 12}" r="4.2" class="${rootPc != null && (M.OPEN[i] % 12) === rootPc && i === bassIdx(c) ? 'op rt' : 'op'}"/>`;
  }
  const byF = {};
  fr.forEach((f, i) => { if (f > 0 && fg[i] > 0) { (byF[fg[i] + ':' + f] = byF[fg[i] + ':' + f] || []).push(i); } });
  Object.keys(byF).forEach(k => {
    const a = byF[k];
    if (a.length >= 2) {
      const f = +k.split(':')[1];
      const cy = y0 + (f - base + 0.5) * dy;
      const xa = x0 + Math.min.apply(null, a) * dx, xb = x0 + Math.max.apply(null, a) * dx;
      if (f - base + 1 >= 1 && f - base + 1 <= rows) s += `<rect x="${xa - 7}" y="${cy - 7}" width="${xb - xa + 14}" height="14" rx="7" class="dot br"/>`;
    }
  });
  for (let i = 0; i < 6; i++) {
    const f = fr[i];
    if (f > 0 && f - base + 1 >= 1 && f - base + 1 <= rows) {
      const cx = x0 + i * dx, cy = y0 + (f - base + 0.5) * dy;
      const mk = marks[i + ':' + f] || '';
      const isRoot = rootPc != null && (M.OPEN[i] + f) % 12 === rootPc && !mk;
      s += `<circle cx="${cx}" cy="${cy}" r="7" class="dot ${mk}${isRoot ? ' rt' : ''}"/>`;
      if (fg[i] > 0) s += `<text x="${cx}" y="${cy + 3.6}" class="fn" text-anchor="middle">${fg[i]}</text>`;
    }
  }
  if (o.extra) {
    const [es, ef] = o.extra; const cx = x0 + es * dx;
    if (ef > 0 && fr[es] !== ef) s += `<circle cx="${cx}" cy="${y0 + (ef - base + 0.5) * dy}" r="7" class="dot ab"/>`;
  }
  return s + '</svg>';
}

// Yatay şema: ince Mi üstte, kalın Mi altta (sap çizimiyle aynı), eşik solda
function diagramH(c, o) {
  o = o || {};
  const fr = c.fr, fg = c.fg || [];
  const pl = fr.filter(x => x > 0);
  const ex = o.extra && o.extra[1] > 0 ? [o.extra[1]] : [];
  const all = pl.concat(ex);
  const maxF = all.length ? Math.max.apply(null, all) : 0, minF = all.length ? Math.min.apply(null, all) : 0;
  const base = maxF > 5 ? minF : 1;
  const W = 164, H = 112, x0 = 30, dx = 25, y0 = 14, dy = 15, cols = 5;
  const ys = i => y0 + (5 - i) * dy;
  const hot = o.hot == null ? [] : [].concat(o.hot);
  const marks = o.marks || {};
  const rootPc = o.root === false ? null : (() => { const p = M.chordParse(baseName(c.n)); return p ? M.pcOf(p.bass || p.root) : null; })();
  let s = `<svg class="dg h${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="akor şeması">`;
  for (let k = 0; k <= cols; k++) s += `<line y1="${y0}" y2="${y0 + 5 * dy}" x1="${x0 + k * dx}" x2="${x0 + k * dx}" class="${k === 0 && base === 1 ? 'nut' : 'fl'}"/>`;
  for (let i = 0; i < 6; i++) s += `<line y1="${ys(i)}" y2="${ys(i)}" x1="${x0}" x2="${x0 + cols * dx}" class="${hot.includes(i) ? 'str hot' : 'str'}"/>`;
  if (base > 1) s += `<text x="${x0 + dx / 2}" y="${H - 4}" class="bl" text-anchor="middle">${base}</text>`;
  for (let i = 0; i < 6; i++) {
    const y = ys(i);
    if (fr[i] < 0) s += `<text x="${x0 - 12}" y="${y + 4.5}" class="mx" text-anchor="middle">×</text>`;
    else if (fr[i] === 0) s += `<circle cx="${x0 - 12}" cy="${y}" r="4.2" class="${rootPc != null && (M.OPEN[i] % 12) === rootPc && i === bassIdx(c) ? 'op rt' : 'op'}"/>`;
  }
  const byF = {};
  fr.forEach((f, i) => { if (f > 0 && fg[i] > 0) { (byF[fg[i] + ':' + f] = byF[fg[i] + ':' + f] || []).push(i); } });
  Object.keys(byF).forEach(k => {
    const a = byF[k];
    if (a.length >= 2) {
      const f = +k.split(':')[1]; const cx = x0 + (f - base + 0.5) * dx;
      const ya = ys(Math.max.apply(null, a)), yb = ys(Math.min.apply(null, a));
      if (f - base + 1 >= 1 && f - base + 1 <= cols) s += `<rect x="${cx - 7}" y="${ya - 7}" width="14" height="${yb - ya + 14}" rx="7" class="dot br"/>`;
    }
  });
  for (let i = 0; i < 6; i++) {
    const f = fr[i];
    if (f > 0 && f - base + 1 >= 1 && f - base + 1 <= cols) {
      const cx = x0 + (f - base + 0.5) * dx, cy = ys(i);
      const mk = marks[i + ':' + f] || '';
      const isRoot = rootPc != null && (M.OPEN[i] + f) % 12 === rootPc && !mk;
      s += `<circle cx="${cx}" cy="${cy}" r="7" class="dot ${mk}${isRoot ? ' rt' : ''}"/>`;
      if (fg[i] > 0) s += `<text x="${cx}" y="${cy + 3.6}" class="fn" text-anchor="middle">${fg[i]}</text>`;
    }
  }
  if (o.extra) { const [es, ef] = o.extra; if (ef > 0 && fr[es] !== ef) s += `<circle cx="${x0 + (ef - base + 0.5) * dx}" cy="${ys(es)}" r="7" class="dot ab"/>`; }
  return s + '</svg>';
}
const CHM_ = { orient: 'h' };
function diagram(c, o) { return CHM_.orient === 'v' ? diagramV(c, o) : diagramH(c, o); }

// Farklı akorlar arası geçiş grupları (tonlara göre, pop'ta en sık kullanılanlar önce)
const GROUPS = [
  { id: 'kG', st: 1, name: 'Sol tonu', chords: ['G', 'C', 'D', 'Em'], tip: 'Pop’un en sık tonu. G–C–D–Em ile yüzlerce şarkı çalınır. G’yi 3-2-0-0-0-3 (yüzük-orta-serçe) basarsan C’ye ve Em’e geçişte orta parmak rehber olur.' },
  { id: 'kC', st: 1, name: 'Do tonu', chords: ['C', 'G', 'Am', 'F'], tip: 'I–V–vi–IV’ün evi. C → Am’de işaret ve orta yerinde kalır. F barre zorlarsa önce Fmaj7 ile başla, sonra tam barre’a geç.' },
  { id: 'kAm', st: 1, name: 'La minör', chords: ['Am', 'Dm', 'E', 'G', 'C'], tip: 'Türkçe slow pop ve Nihavent rengi. Am ↔ E aynı şeklin bir tel kaymasıdır; Dm → E en zor geçiş, ona yavaş başla.' },
  { id: 'kEm', st: 1, name: 'Mi minör', chords: ['Em', 'Am', 'B7', 'C', 'D'], tip: 'Barış Manço ve halk-rock tonu. B7 → Em karara iniş; Em → Am’de şekil aynı kalıp bir tel kayar.' },
  { id: 'kD', st: 2, name: 'Re tonu', chords: ['D', 'G', 'A', 'Bm'], tip: 'Bm ilk barre’ın; 2. perdede La şekli. D → Bm ve A → Bm geçişlerini çok tekrarla.' },
  { id: 'kA', st: 2, name: 'La tonu', chords: ['A', 'D', 'E', 'F#m'], tip: 'F♯m = 2. perdede Mi şekli minör barre. A → F♯m pop baladlarda çok sık.' },
  { id: 'kE', st: 2, name: 'Mi tonu', chords: ['E', 'A', 'B7', 'C#m'], tip: 'C♯m = 4. perdede La şekli minör barre. E → C♯m (I → vi) pop’un klasik geçişi.' },
  { id: 'k7', st: 2, name: 'Yedili renkler', chords: ['Am7', 'Dm7', 'G7', 'Cmaj7', 'Fmaj7', 'E7'], tip: 'Slow pop ve caz rengi. Dm7 → G7 → Cmaj7 = ii–V–I. Çoğu yedili, temel akordan bir parmak kalkınca oluşur.' },
  { id: 'kS', st: 2, name: 'İnen bas (slash)', chords: ['C', 'G/B', 'Am', 'Am/G', 'F'], tip: 'Bas notası Do – Si – La – Sol – Fa diye iner. Arpejde p parmağı melodi çalar gibi duyulur.' },
  { id: 'b1', st: 3, name: '1. perde barre ailesi', chords: ['F|E', 'Fm|E', 'Bb|A', 'Bbm|A'], tip: 'İşaret parmağı 1. perdede sabit. Mi şekli = F (I), La şekli = B♭ (IV): aynı perdede iki şekil, tonun I ve IV akoru.' },
  { id: 'b2', st: 3, name: '2. perde barre ailesi', chords: ['F#m|E', 'Bm|A', 'B|A', 'F#|E'], tip: 'Barre 2. perdede kalır, sadece üstteki parmaklar değişir. Bm ↔ F♯m Türkçe slow pop’ta çok sık.' },
  { id: 'b3', st: 3, name: '3. perde barre ailesi', chords: ['G|E', 'Gm|E', 'C|A', 'Cm|A'], tip: 'Gm ↔ Cm: Kürdi ve Nihavent ezgilerinde sık geçiş. G ↔ C barre ile pop’ta parlak ses.' }
];
const STAGES = { 1: 'Temel pop tonları', 2: 'Genişleme: barre’lı tonlar, yedili ve bas hatları', 3: 'Aynı perdede barre aileleri (şekil değişir, barre sabit)' };

// Sağ el desenleri: bir desen = bir ölçü. p bas, P alternatif bas, i m a teller, c = i+m+a, x vuruş, . sus
const PATTERNS = [
  { id: 'a1', name: 'p-i-m-a (dörtlük)', steps: 'p i m a', unit: 1, tip: 'Akorun notalarını tek tek tanımak için. Her vuruşta bir nota.' },
  { id: 'a3', name: 'Sekizlik akış · p-i-m-i-a-i-m-i', steps: 'p i m i a i m i', unit: 0.5, tip: 'Pop baladların temel arpeji. 4/4 sekizlik.' },
  { id: 'a2', name: '6/8 · p-i-m-a-m-i', steps: 'p i m a m i', unit: 0.5, click: [0, 3], tip: 'Vals/balad hissi; Giuliani’deki klasik altılı kalıp. Canlı müzikte 6/8 parçalar için.' },
  { id: 'a7', name: '12/8 slow · p-i-m-a-m-i ×2', steps: 'p i m a m i P i m a m i', unit: 1 / 3, click: [0, 3, 6, 9], tip: 'Slow pop’un çoğu 12/8 hissiyle akar. Her vuruş üç nota; ikinci yarıda alternatif bas.' },
  { id: 'a4', name: 'Alternatif bas · p-i-m-i-P-i-m-i', steps: 'p i m i P i m i', unit: 0.5, tip: 'Bas kök ile beşli arasında gider (P). Akorun bas hattı canlanır.' },
  { id: 'a8', name: 'Ters arpej · p-a-m-i', steps: 'p a m i p a m i', unit: 0.5, tip: 'Yukarıdan aşağı akış. Giuliani’nin ters kalıplarına benzer.' },
  { id: 'a9', name: 'Giuliani tarzı · p-i-m-a-m-a-m-i', steps: 'p i m a m a m i', unit: 0.5, tip: 'Üst tellerde dalgalanma; sağ elin bağımsızlığını geliştirir.' },
  { id: 'a5', name: '3+3+2 · modern', steps: 'p i m P i m P i', unit: 0.5, tip: 'Bas vurguları 1, 4 ve 7. sekizlikte. Akustik pop’ta sinkoplu his.' },
  { id: 'a6', name: 'Melodi + bas · p+a', steps: 'p+a i m i P i m+a i', unit: 0.5, tip: 'Üst telde melodi notası bas ile birlikte (p+a). Melodi + arpej hazırlığı.' },
  { id: 'a10', name: 'Perküsif · p-i-x-i', steps: 'p i x i P i x i', unit: 0.5, tip: 'x: 2. ve 4. vuruşta sağ el ayasıyla tellere hafifçe vur. Arpejle ritim arasında köprü.' },
  { id: 'a11', name: 'Tutam (pinch) · p+c', steps: 'p+c . i m P+c . i m', unit: 0.5, tip: 'c: i-m-a birlikte, bas ile aynı anda. Dolgun ve vurgulu bir eşlik.' },
  { id: 'a12', name: 'Travis · alternatif başparmak', steps: 'p m P i p m P i', unit: 0.5, tip: 'Başparmak kök ve beşli arasında her vuruşta gider, i ve m araya düşer. Akustik pop ve folk eşliğinin temeli.' },
  { id: 'a13', name: 'Romanza üçlemesi · p+a m i', steps: 'p+a m i a m i a m i', unit: 1 / 3, tip: '3/4 içinde üçlemeler; ilk notada bas ve melodi birlikte. “Romance” tarzı.' },
  { id: 'a14', name: 'Tremolo · p a m i', steps: 'p a1 m1 i1 P a1 m1 i1', unit: 0.25, tip: 'a-m-i aynı telde (1. tel) tekrar eder, p bası çalar. Recuerdos hazırlığı; yavaş ve eşit başla.' },
  { id: 'a15', name: '16’lık dalga · p i m a m i m i', steps: 'p i m a m i m i', unit: 0.25, tip: 'Klasik pop baladın akıcı 16’lık arpeji.' },
  { id: 'a16', name: 'Gidip gelen · p m i m', steps: 'p m i m P m i m', unit: 0.5, tip: 'Orta parmak merkezde; bas her yarımda değişir.' },
  { id: 'a17', name: 'Kaskad · p a m i', steps: 'p a m i P a m i', unit: 0.5, tip: 'Yukarıdan aşağı akan arpej; ters Giuliani kalıplarına hazırlık.' },
  { id: 'a18', name: 'Üçlü akış · p i m', steps: 'p i m p i m P i m P i m', unit: 1 / 3, tip: 'Carulli tarzı üçlü arpej; her vuruşta bas.' },
  { id: 'a19', name: 'Bas melodisi · p i p m', steps: 'p i p4 m P i p4 m', unit: 0.5, tip: 'Başparmak iki ayrı bas teli arasında melodi gibi gezer.' },
  { id: 'a20', name: 'Tutam + akış · p+m i P+m i', steps: 'p+m i P+m i p+a i P+m i', unit: 0.5, tip: 'Bas ile üst tel birlikte, araya i. Fingerstyle pop.' },
  { id: 'a21', name: '6/8 vuruşlu · p i m x m i', steps: 'p i m x m i', unit: 0.5, click: [0, 3], tip: '6/8 balad, 4. sekizlikte perküsif vuruş.' },
  { id: 'r1', name: 'Ritim · dörtlük aşağı (D D D D)', steps: 'D D D D', unit: 1, tip: 'D: aşağı vuruş (başparmak ya da pena). Önce akor değişimini oturtmak için.' },
  { id: 'r2', name: 'Ritim · pop klasiği (D . D U . U D U)', steps: 'D . D U . U D U', unit: 0.5, tip: 'Pop’un en çok kullanılan vuruşu. El aşağı-yukarı hiç durmadan sallanır; noktalarda tellere değmeden geçer.' },
  { id: 'r3', name: 'Ritim · sekizlik (D U D U D U D U)', steps: 'D U D U D U D U', unit: 0.5, tip: 'Hareketli şarkılar için düz sekizlik.' },
  { id: 'r4', name: 'Ritim · 6/8 slow (D . U D U .)', steps: 'D . U D U .', unit: 0.5, click: [0, 3], tip: 'Türkçe slow ve 6/8 parçalar için.' },
  { id: 'r5', name: 'Ritim · vuruşlu (D . x U . U x U)', steps: 'D . x U . U x U', unit: 0.5, tip: 'x: 2 ve 4’te tellere avuçla vuruş (chunk). Modern akustik pop.' },
  { id: 'r6', name: 'Ritim · bossa (p . c . c p . c)', steps: 'p . c . c p . c', unit: 0.5, tip: 'Bas ve akor ayrı: başparmak bası, i-m-a birlikte akoru çalar. Senkoplu bossa hissi.' },
];
const TOKRE = /^([pPimacxDU.]\d?)(\+([pPimac]\d?))*$/;
function parsePattern(txt) { const t = String(txt).trim().split(/\s+/).filter(Boolean); if (!t.length || t.length > 16) return null; return t.every(x => TOKRE.test(x)) ? t : null; }

const PROGS = [
  { name: 'Kolay zincir: Am – Am7 – C – Fmaj7', ch: ['Am', 'Am7', 'C', 'Fmaj7'] },
  { name: 'Pop vi–IV–I–V: Am – F – C – G', ch: ['Am', 'F', 'C', 'G'] },
  { name: 'Pop I–V–vi–IV: C – G – Am – F', ch: ['C', 'G', 'Am', 'F'] },
  { name: 'Pop I–V–vi–IV (Sol): G – D – Em – C', ch: ['G', 'D', 'Em', 'C'] },
  { name: '50’ler I–vi–IV–V: C – Am – F – G', ch: ['C', 'Am', 'F', 'G'] },
  { name: 'I–IV–V–IV: G – C – D – C', ch: ['G', 'C', 'D', 'C'] },
  { name: 'i–VI–III–VII: Em – C – G – D', ch: ['Em', 'C', 'G', 'D'] },
  { name: 'i–VII–VI–VII: Am – G – F – G', ch: ['Am', 'G', 'F', 'G'] },
  { name: 'iv–VII–III–VI: Dm – G – C – F', ch: ['Dm', 'G', 'C', 'F'] },
  { name: 'Minör kadans: Am – Dm – E – Am', ch: ['Am', 'Dm', 'E', 'Am'] },
  { name: 'Andaluz: Am – G – F – E', ch: ['Am', 'G', 'F', 'E'] },
  { name: 'İnen bas: C – G/B – Am – Am/G', ch: ['C', 'G/B', 'Am', 'Am/G'] },
  { name: 'ii–V–I–vi: Dm7 – G7 – Cmaj7 – Am7', ch: ['Dm7', 'G7', 'Cmaj7', 'Am7'] },
  { name: 'Pachelbel: D – A – Bm – F#m – G – D – G – A', ch: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'] },
  { name: 'Barre slow: Bm – G – D – A', ch: ['Bm', 'G', 'D', 'A'] },
  { name: 'Barre minör: F#m – D – A – E', ch: ['F#m', 'D', 'A', 'E'] },
  { name: 'Kürdi (Mi): Em – F – Em – Dm', ch: ['Em', 'F', 'Em', 'Dm'] },
  { name: 'Hicaz (La): A – Bb – A – Gm', ch: ['A', 'Bb', 'A', 'Gm'] },
  { name: '12 ölçü blues (La): A7 ×4 – D7 ×2 – A7 ×2 – E7 – D7 – A7 – E7', ch: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'] }
];

g.CHORDS = CHORDS; g.CH = CH; g.FAMS = FAMS; g.GROUPS = GROUPS; g.STAGES = STAGES; g.PATTERNS = PATTERNS; g.PROGS = PROGS;
g.CHM = { set orient(v) { CHM_.orient = v; }, get orient() { return CHM_.orient; }, bassIdx, altBass, diagram, transition, marksFor, barreChord, barreFret, SHAPES, getChord, baseName, parsePattern };
})(typeof window !== 'undefined' ? window : globalThis);
