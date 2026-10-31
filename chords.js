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
function diagram(c, o) {
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

// Parmak kaydırmalı geçiş grupları (aşama sırasıyla)
const GROUPS = [
  { st: 1, name: 'Do – La minör zinciri', chords: ['C', 'Am7', 'Am'],
    tip: 'C → Am7: yüzük parmağını kaldır, işaret ve orta yerinde kalır. Am7 → Am: yüzüğü sol teline koy. En kolay başlangıç zinciri.' },
  { st: 1, name: 'Mi ailesi (şekil kayar)', chords: ['Em', 'E', 'Am'],
    tip: 'Em → E: sadece işaret parmağını sol teline ekle. E → Am: üçlü şekil bir tel ince tarafa kayar, parmaklar birlikte hareket eder.' },
  { st: 1, name: 'Mi minör – Sol', chords: ['Em', 'Em7', 'G'],
    tip: 'Em ile G’de la telindeki orta parmak (2. perde) sabit kalır. Em → Em7 için tek parmak kalkar.' },
  { st: 1, name: 'Do – Fa maj7 – La minör 7', chords: ['C', 'Fmaj7', 'Am7'],
    tip: 'Si telinin 1. perdesindeki işaret parmağı üçünde de sabit. Diğer parmaklar bir tel ince tarafa kayar. F barre’ın kolay alternatifi.' },
  { st: 2, name: 'Re ailesi', chords: ['D', 'Dsus4', 'D', 'Dsus2'],
    tip: 'D’de işaret ve yüzük sabit; serçe eklenince Dsus4, orta parmak kalkınca Dsus2. Arpejde bu süslemeler melodi gibi duyulur.' },
  { st: 2, name: 'La süslemeleri', chords: ['A', 'Asus4', 'A', 'Asus2'],
    tip: 'A’nın üstüne serçe ekle (Asus4) ya da yüzüğü kaldır (Asus2). Pop baladlarda bekleme anlarını süsler.' },
  { st: 2, name: 'Re minör – La minör', chords: ['Dm', 'Dm7', 'Am'],
    tip: 'Dm → Dm7: yüzüğü kaldır, işaret si telinde 1. perdede kalır. Dm7 → Am: işaret si telinde sabit kalarak diğerleri yer değiştirir.' },
  { st: 2, name: 'Mi – La yedili bağ', chords: ['E', 'E7', 'A', 'A7'],
    tip: 'E → E7 ve A → A7 tek parmak kaldırmakla olur. Minör tonda (Am) E7 karara çeken akordur.' },
  { st: 2, name: 'Sol – Sol7 – Do', chords: ['G', 'G7', 'C'],
    tip: 'G → G7: serçeyi bırak, işaret ince Mi’yi 1. perdeden basar. G7 → C klasik çözülüş.' },
  { st: 2, name: 'İnen bas hattı (slash)', chords: ['C', 'G/B', 'Am', 'Am/G'],
    tip: 'Bas notası Do – Si – La – Sol diye adım adım iner. C → G/B’de sadece bas parmağı oynar; Am → Am/G’de bas 6. tele geçer. Arpejde p parmağı melodi çalar gibi.' },
  { st: 3, name: '1. perde barre ailesi', chords: ['F|E', 'Fm|E', 'Bb|A', 'Bbm|A'],
    tip: 'İşaret parmağı 1. perdede sabit. Mi şekli = F (I), La şekli = B♭ (IV). Aynı perdede iki şekil, tonun I ve IV akorunu verir.' },
  { st: 3, name: '2. perde barre ailesi', chords: ['F#m|E', 'Bm|A', 'B|A', 'F#|E'],
    tip: 'Barre 2. perdede kalır, sadece üstteki parmaklar değişir. Bm ↔ F♯m Türkçe slow pop’ta çok sık.' },
  { st: 3, name: '3. perde barre ailesi', chords: ['G|E', 'Gm|E', 'C|A', 'Cm|A'],
    tip: 'Sol ve Do’yu barre ile çalmak, aynı tonu farklı renkte duyurur. Gm ↔ Cm: Kürdi ve Nihavent ezgilerinde sık geçiş.' }
];
const STAGES = { 1: 'Aşama 1 · Açık akorlar, ortak parmak', 2: 'Aşama 2 · Süslemeler, yedili ve bas hatları', 3: 'Aşama 3 · Barre, sabit pozisyon' };

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
  { id: 'a11', name: 'Tutam (pinch) · p+c', steps: 'p+c . i m P+c . i m', unit: 0.5, tip: 'c: i-m-a birlikte, bas ile aynı anda. Dolgun ve vurgulu bir eşlik.' }
];
const TOKRE = /^(p|P|i|m|a|c|x|\.)(\+(p|P|i|m|a|c))*$/;
function parsePattern(txt) { const t = String(txt).trim().split(/\s+/).filter(Boolean); if (!t.length || t.length > 16) return null; return t.every(x => TOKRE.test(x)) ? t : null; }

const PROGS = [
  { name: 'Kolay zincir: Am – Am7 – C – Fmaj7', ch: ['Am', 'Am7', 'C', 'Fmaj7'] },
  { name: 'Pop vi–IV–I–V: Am – F – C – G', ch: ['Am', 'F', 'C', 'G'] },
  { name: 'Pop I–V–vi–IV: C – G – Am – F', ch: ['C', 'G', 'Am', 'F'] },
  { name: 'İnen bas: C – G/B – Am – Am/G', ch: ['C', 'G/B', 'Am', 'Am/G'] },
  { name: 'Minör kadans: Am – Dm – E – Am', ch: ['Am', 'Dm', 'E', 'Am'] },
  { name: 'Sol tonu: Em – C – G – D', ch: ['Em', 'C', 'G', 'D'] },
  { name: 'ii–V–I–vi: Dm7 – G7 – Cmaj7 – Am7', ch: ['Dm7', 'G7', 'Cmaj7', 'Am7'] },
  { name: 'Andaluz: Am – G – F – E', ch: ['Am', 'G', 'F', 'E'] },
  { name: 'Barre slow: Bm – G – D – A', ch: ['Bm', 'G', 'D', 'A'] },
  { name: 'Barre minör: F#m – D – A – E', ch: ['F#m', 'D', 'A', 'E'] }
];

g.CHORDS = CHORDS; g.CH = CH; g.FAMS = FAMS; g.GROUPS = GROUPS; g.STAGES = STAGES; g.PATTERNS = PATTERNS; g.PROGS = PROGS;
g.CHM = { bassIdx, altBass, diagram, transition, marksFor, barreChord, barreFret, SHAPES, getChord, baseName, parsePattern };
})(typeof window !== 'undefined' ? window : globalThis);
