(function () {
'use strict';
const G = window.G, S = G.S;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ================= TAB MOTORU =================
// sütun: { n: [{s: tel indeksi (0 = 6. tel), f: perde}], top: üst etiket (p i m a / sol el parmağı), d: vuruş süresi, bar: ölçü çizgisi önce }
function tabSvg(cols, o) {
  o = o || {};
  const CW = 22, X0 = 26, Y0 = 26, SY = 14, W = X0 + cols.length * CW + 10, H = Y0 + 5 * SY + 16;
  const ys = s => Y0 + (5 - s) * SY;
  let h = `<svg class="tab" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
  ['e', 'B', 'G', 'D', 'A', 'E'].forEach((l, k) => { h += `<text x="6" y="${Y0 + k * SY + 4}" class="tl">${l}</text>`; });
  for (let s = 0; s < 6; s++) h += `<line x1="${X0 - 6}" x2="${W - 6}" y1="${ys(s)}" y2="${ys(s)}" class="tline"/>`;
  cols.forEach((c, i) => {
    const x = X0 + i * CW + CW / 2;
    if (c.bar && i > 0) h += `<line x1="${x - CW / 2}" x2="${x - CW / 2}" y1="${ys(5)}" y2="${ys(0)}" class="tbar"/>`;
    h += `<g class="tc" ${o.noact ? '' : `id="tc${(o.off || 0) + i}" data-a="tloop" `}data-i="${(o.off || 0) + i}"><rect x="${x - CW / 2 + 1}" y="${Y0 - 22}" width="${CW - 2}" height="${5 * SY + 30}" rx="5" class="tcr"/>`;
    if (c.top) h += `<text x="${x}" y="${Y0 - 9}" text-anchor="middle" class="ttop">${c.top}</text>`;
    c.n.forEach(nt => { h += `<rect x="${x - 7}" y="${ys(nt.s) - 7}" width="14" height="14" class="tbg"/><text x="${x}" y="${ys(nt.s) + 4}" text-anchor="middle" class="tf">${nt.f}</text>`; });
    h += '</g>';
  });
  return h + '</svg>';
}
let tplay = null;
const TP = { bpm: 60, ladder: false };
function stopTab(rec) {
  const s = tplay, lad = s && s.running && s.lad; if (s) s.stop(); tplay = null; G.playing = false;
  const b = $('#tplay'); if (b) b.textContent = '▶ Başla';
  document.querySelectorAll('.tc.cur').forEach(e => e.classList.remove('cur'));
  if (rec && lad) { const top = Math.max(s.lad.start, TP.bpm - 4); TP.bpm = s.lad.start; s.lad.save(top); const r = $('#tbpm'); if (r) { r.value = TP.bpm; $('#tbpmv').textContent = TP.bpm + ' bpm'; } G.modal(`<h3>Hız merdiveni</h3><p class="big">${top} bpm</p><p class="muted">Temiz çaldığın son tempo kaydedildi.</p>`); }
}
function startTab(cols, onSave) {
  if (tplay && tplay.running) { stopTab(true); return; }
  if (!Aud.init()) return;
  G.playing = true; $('#tplay').textContent = '■ Durdur';
  const snd = () => S.arp.snd; let lap = 0;
  const cumBeat = []; let acc = 0; cols.forEach(c => { cumBeat.push(acc); acc += c.d; });
  const ms = measures(cols);
  tplay = makeScheduler((i, t, api) => {
    const okLp = TP.lp && ms[TP.lp[0]] && ms[TP.lp[1]]; const R = okLp ? [ms[TP.lp[0]][0], ms[TP.lp[1]][1]] : [0, cols.length], len = Math.max(1, R[1] - R[0]);
    const k = R[0] + i % len; if (i % len === 0 && i > 0) { lap++; if (TP.ladder && lap % 2 === 0) { TP.bpm = Math.min(200, TP.bpm + 4); api.at(t, () => { const r = $('#tbpm'); if (r) { r.value = TP.bpm; $('#tbpmv').textContent = TP.bpm + ' bpm'; } }); } }
    const c = cols[k]; if (!c) return 60 / TP.bpm; const onBeat = Math.abs(cumBeat[k] - Math.round(cumBeat[k])) < 1e-6;
    if (snd() !== 'off' && onBeat && snd() === 'click') Aud.click(t, k === 0);
    if (snd() === 'arp') c.n.forEach((nt, j) => Aud.pluck(M.OPEN[nt.s] + nt.f, t + j * 0.006, c.n.length > 2 ? 0.34 : 0.5));
    api.at(t, () => { document.querySelectorAll('.tc.cur').forEach(p => p.classList.remove('cur')); const e = $('#tc' + k); if (e) { e.classList.add('cur'); if (k % 8 === 0 || (cols[k].bar)) e.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); } });
    return 60 / TP.bpm * (c ? c.d : 1);
  }, G.ci(() => 60 / TP.bpm));
  tplay.lad = TP.ladder ? { start: TP.bpm, save: top => { onSave(top); } } : null;
  tplay.start();
}
function playerCard(id, best) {
  const sb = (v, l) => `<button class="btn sm ${S.arp.snd === v ? 'on' : 'ghost'}" data-a="psnd" data-v="${v}">${l}</button>`;
  return `<div class="card"><div class="row"><span>Tempo</span><b id="tbpmv">${TP.bpm} bpm</b></div><input type="range" id="tbpm" min="30" max="200" value="${TP.bpm}" aria-label="tempo">
<div class="seg">${sb('arp', 'Ses')}${sb('click', 'Metronom')}${sb('off', 'Sessiz')}</div>
<div class="row g"><button class="btn" id="tplay" data-a="tabplay">▶ Başla</button><button class="btn ghost" data-a="tabclean">Temiz çaldım ✓</button><button class="btn sm ${TP.ladder ? 'on' : 'ghost'}" data-a="tablad">Hız merdiveni: ${TP.ladder ? 'açık' : 'kapalı'}</button></div>
<p class="muted" id="tbest">${best ? `Rekorun: ${best} bpm` : 'Yavaş başla (40–60). Temiz çalınca “Temiz çaldım”a bas; hız merdiveni her 2 turda 4 bpm artırır.'}</p></div>`;
}
let CUR = null; // { cols, save(bpm) }
function measures(cols) { const ms = []; let st = 0; cols.forEach((c, i) => { if (c.bar && i > 0) { ms.push([st, i]); st = i; } }); ms.push([st, cols.length]); return ms; }
// ölçü döngüsü: bir notaya dokun → başlangıç ölçüsü, ikinciye → bitiş, üçüncü → kaldır
G.actions.tloop = d => {
  if (!CUR) return; const ms = measures(CUR.cols), j = +d.i, m = ms.findIndex(x => j >= x[0] && j < x[1]);
  if (!TP.lp) { TP.lp = [m, m]; TP.lps = 1; } else if (TP.lps === 1) { TP.lp = [Math.min(TP.lp[0], m), Math.max(TP.lp[0], m)]; TP.lps = 2; } else { TP.lp = null; TP.lps = 0; }
  drawLoop();
};
function drawLoop() {
  const ms = CUR ? measures(CUR.cols) : []; const a = TP.lp ? ms[TP.lp[0]][0] : -1, b = TP.lp ? ms[TP.lp[1]][1] : -1;
  document.querySelectorAll('.tc').forEach(e => { const i = +e.dataset.i; e.classList.toggle('lp', i >= a && i < b); });
  const inf = $('#tlpi'); if (inf) inf.textContent = !TP.lp ? 'Döngü: bir ölçüye dokun, sonra bitiş ölçüsüne.' : TP.lps === 1 ? `Döngü: ${TP.lp[0] + 1}. ölçü · bitiş için başka bir ölçüye dokun` : `Döngü: ${TP.lp[0] + 1}–${TP.lp[1] + 1}. ölçüler · kaldırmak için bir notaya dokun`;
}
function bindTab() { const r = $('#tbpm'); if (r) r.oninput = () => { TP.bpm = +r.value; $('#tbpmv').textContent = TP.bpm + ' bpm'; }; G.onStop(() => stopTab(false)); }
G.actions.tabplay = () => { if (CUR) startTab(CUR.cols, CUR.save); };
G.actions.tablad = (d, el) => { TP.ladder = !TP.ladder; el.classList.toggle('on', TP.ladder); el.classList.toggle('ghost', !TP.ladder); el.textContent = 'Hız merdiveni: ' + (TP.ladder ? 'açık' : 'kapalı'); };
G.actions.tabclean = () => { if (!CUR) return; CUR.save(TP.bpm); const e = $('#tbest'); if (e) e.textContent = 'Kaydedildi: ' + TP.bpm + ' bpm'; };


// ================= NOTA (PORTE) =================
const LETS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SHP = [[0, ''], [0, '♯'], [1, ''], [1, '♯'], [2, ''], [3, ''], [3, '♯'], [4, ''], [4, '♯'], [5, ''], [5, '♯'], [6, '']];
const FLP = [[0, ''], [1, '♭'], [1, ''], [2, '♭'], [2, ''], [3, ''], [4, '♭'], [4, ''], [5, '♭'], [5, ''], [6, '♭'], [6, '']];
function staffSvg(cols, o) {
  o = o || {};
  const CW = 28, X0 = 58, TOP = 58, G2 = 4; // G2: yarım aralık (çizgi-boşluk)
  const BOT = TOP + 8 * G2; // alt çizgi (Mi4)
  const W = X0 + cols.length * CW + 18, H = 168;
  const yOf = midi => { const m = midi + 12; const sp = (o.flats ? FLP : SHP)[m % 12]; const dn = (Math.floor(m / 12) - 1) * 7 + sp[0]; return { y: BOT - (dn - 30) * G2, acc: sp[1] }; };
  let h = `<svg class="staff" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;
  for (let k = 0; k < 5; k++) h += `<line x1="8" x2="${W - 8}" y1="${TOP + k * 8}" y2="${TOP + k * 8}" class="sline"/>`;
  h += `<text x="10" y="${BOT + 6}" class="clef">𝄞</text><text x="24" y="${BOT + 30}" class="clef8">8</text>`;
  const anyUp = cols.some(c => c.n.some(n => n.v !== 'd'));
  const info = cols.map((c, i) => {
    const x = X0 + i * CW + CW / 2;
    const ns = c.n.map(n => Object.assign({ m: M.OPEN[n.s] + n.f }, n));
    let up = ns.filter(n => n.v === 'u' || (n.v !== 'd' && !(c.top || '').startsWith('p'))), dn = ns.filter(n => !up.includes(n));
    if (!anyUp) { up = ns; dn = []; }
    if (!ns.some(n => n.v) && (c.top || '').startsWith('p') && ns.length > 1) { const lo = ns.reduce((a, b) => a.m < b.m ? a : b); dn = [lo]; up = ns.filter(n => n !== lo); }
    return { x, c, up: up.map(n => Object.assign(n, yOf(n.m))), dn: dn.map(n => Object.assign(n, yOf(n.m))) };
  });
  let beat = 0; const beatOf = info.map(I => { const b = Math.floor(beat + 1e-6); beat += I.c.d; return b; });
  // gruplar: aynı vuruş içindeki üst ses sütunları
  const groups = []; let cur = null;
  info.forEach((I, i) => { if (!I.up.length || I.c.d >= 1) { cur = null; return; } if (cur && beatOf[i] === cur.b && !I.c.bar) cur.ix.push(i); else { cur = { b: beatOf[i], ix: [i] }; groups.push(cur); } });
  const stemTop = {};
  groups.forEach(g => { const top = Math.min.apply(null, g.ix.flatMap(i => info[i].up.map(n => n.y))) - 26; g.ix.forEach(i => { stemTop[i] = Math.min(top, BOT - 34); }); g.top = Math.min(top, BOT - 34); });
  info.forEach((I, i) => {
    const { x, c } = I;
    if (c.bar && i > 0) h += `<line x1="${x - CW / 2}" x2="${x - CW / 2}" y1="${TOP}" y2="${BOT}" class="sbar"/>`;
    h += `<g class="tc" ${o.noact ? '' : `id="tc${(o.off || 0) + i}" data-a="tloop" `}data-i="${(o.off || 0) + i}"><rect x="${x - CW / 2 + 1}" y="4" width="${CW - 2}" height="${H - 8}" rx="6" class="tcr"/>`;
    if (c.top) h += `<text x="${x}" y="16" text-anchor="middle" class="ttop">${c.top}</text>`;
    const head = (n, dx) => {
      let r = '';
      for (let ly = BOT + 8; ly <= n.y + 0.1; ly += 8) r += `<line x1="${x + dx - 8}" x2="${x + dx + 8}" y1="${ly}" y2="${ly}" class="sline"/>`;
      for (let ly = TOP - 8; ly >= n.y - 0.1; ly -= 8) r += `<line x1="${x + dx - 8}" x2="${x + dx + 8}" y1="${ly}" y2="${ly}" class="sline"/>`;
      if (n.acc) r += `<text x="${x + dx - 13}" y="${n.y + 4}" class="acc">${n.acc}</text>`;
      return r + `<ellipse cx="${x + dx}" cy="${n.y}" rx="4.8" ry="3.6" transform="rotate(-20 ${x + dx} ${n.y})" class="nh"/>`;
    };
    // aynı ses yüksekliğinde iki ses ayrı dursun
    I.up.forEach(n => { h += head(n, 0); });
    I.dn.forEach(n => { const clash = I.up.some(u => Math.abs(u.y - n.y) < 4); h += head(n, clash ? -9 : 0); });
    if (I.up.length) {
      const lo = Math.max.apply(null, I.up.map(n => n.y)), hi = Math.min.apply(null, I.up.map(n => n.y));
      const top = stemTop[i] != null ? stemTop[i] : hi - 26;
      h += `<line x1="${x + 4.5}" x2="${x + 4.5}" y1="${lo}" y2="${top}" class="stem"/>`;
      if (stemTop[i] == null && c.d < 1) { h += `<path d="M${x + 4.5} ${top} q8 6 6 16" class="flag"/>`; if (c.d <= 0.26) h += `<path d="M${x + 4.5} ${top + 6} q8 6 6 16" class="flag"/>`; }
    }
    if (I.dn.length) {
      const hi = Math.min.apply(null, I.dn.map(n => n.y)), lo = Math.max.apply(null, I.dn.map(n => n.y));
      h += `<line x1="${x - 4.5}" x2="${x - 4.5}" y1="${hi}" y2="${lo + 26}" class="stem"/>`;
    }
    if (!c.n.length) h += `<text x="${x}" y="${TOP + 20}" text-anchor="middle" class="rest">𝄽</text>`;
    h += '</g>';
  });
  groups.forEach(g => {
    if (g.ix.length < 2) { const i = g.ix[0], I = info[i]; const c = I.c; h += `<path d="M${I.x + 4.5} ${g.top} q8 6 6 16" class="flag"/>`; if (c.d <= 0.26) h += `<path d="M${I.x + 4.5} ${g.top + 6} q8 6 6 16" class="flag"/>`; return; }
    const xa = info[g.ix[0]].x + 4.5, xb = info[g.ix[g.ix.length - 1]].x + 4.5, d = info[g.ix[0]].c.d;
    h += `<rect x="${xa}" y="${g.top}" width="${xb - xa + 1}" height="3.4" class="beam"/>`;
    if (d <= 0.26) h += `<rect x="${xa}" y="${g.top + 6}" width="${xb - xa + 1}" height="3.4" class="beam"/>`;
    if (Math.abs(d - 1 / 3) < 0.01) h += `<text x="${(xa + xb) / 2}" y="${g.top - 4}" text-anchor="middle" class="tup">3</text>`;
  });
  h += o.last === false ? `<line x1="${W - 9}" x2="${W - 9}" y1="${TOP}" y2="${BOT}" class="sbar"/>` : `<line x1="${W - 14}" x2="${W - 14}" y1="${TOP}" y2="${BOT}" class="sbar"/><rect x="${W - 11}" y="${TOP}" width="3.5" height="${BOT - TOP}" class="beam"/>`;
  return h + '</svg>';
}
// ekrana sığacak şekilde ölçü sınırlarından satırlara böl (telefonda yatay kaydırma gerekmesin)
function lineSplit(cols, cw, fixed) {
  const app = document.querySelector('#app'); let avail = 600;
  if (app) { const cs = getComputedStyle(app); avail = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 36; }
  const per = Math.max(6, Math.floor((Math.max(240, avail) - fixed) / cw));
  const ms0 = []; let st = 0; cols.forEach((c, i) => { if (c.bar && i > 0) { ms0.push([st, i]); st = i; } }); ms0.push([st, cols.length]);
  // çok uzun ölçüleri vuruş sınırlarından böl
  const ms = []; ms0.forEach(([a, b]) => { if (b - a <= per) { ms.push([a, b]); return; } let acc = 0, s0 = a, lastCut = a; for (let i = a; i < b; i++) { if (Math.abs(acc - Math.round(acc)) < 1e-6 && i > s0) { if (i - s0 > per && lastCut > s0) { ms.push([s0, lastCut]); s0 = lastCut; } lastCut = i; } acc += cols[i].d; } if (b - s0 > per && lastCut > s0) { ms.push([s0, lastCut]); s0 = lastCut; } ms.push([s0, b]); });
  const lines = []; let cur = null;
  ms.forEach(m => { if (cur && m[1] - cur[0] <= per) cur[1] = m[1]; else { cur = [m[0], m[1]]; lines.push(cur); } });
  return lines;
}
function viewH(cols, o) {
  const v = S.set.view || 'nota'; o = o || {};
  const lines = v === 'tab' ? lineSplit(cols, 22, 36) : lineSplit(cols, 28, 76);
  const svgs = lines.map(([a, b], k) => { const sub = cols.slice(a, b); const oo = Object.assign({}, o, { off: a, last: k === lines.length - 1 }); return v === 'tab' ? tabSvg(sub, oo) : staffSvg(sub, oo); }).join('');
  TP.lp = null; TP.lps = 0;
  return `<div class="tabwrap${lines.length > 1 ? ' ml' : ''}">${svgs}</div><div class="muted lpinfo" id="tlpi">Döngü: bir ölçüye dokun, sonra bitiş ölçüsüne.</div><div class="seg sm vw"><button class="btn sm ${v === 'nota' ? 'on' : 'ghost'}" data-a="setview" data-v="nota">Nota görünümü</button><button class="btn sm ${v === 'tab' ? 'on' : 'ghost'}" data-a="setview" data-v="tab">Tab görünümü</button></div>`;
}
let lastW = innerWidth, rzT = 0;
addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(() => { if (Math.abs(innerWidth - lastW) > 30 && document.querySelector('.tabwrap') && !(tplay && tplay.running)) { lastW = innerWidth; G.rerender(); } else lastW = innerWidth; }, 250); });
G.actions.setview = d => { stopTab(false); S.set.view = d.v; G.save(); G.rerender(); };
G.staffSvg = staffSvg;
// ================= GIULIANI 120 =================
// Akor seslendirmesi (6. telden 1. tele). C ölçüsünde 6. tel Sol (bas için), G7: 3-2-0-0-3-1
const VOI = { C: [3, 3, 2, 0, 1, 0], G7: [3, 2, 0, 0, 3, 1] };
const BASS = { A: [5, 4, 3, 5], B: [5, 4, 5, 4], C: [5, 4, 3, 4], '-': [0, 0, 0, 0] };
const U = { q: 1, t: 1 / 3, e: 0.5, s: 0.25 };
// [no, seviye, birim, bas, gruplar]  · token: p = bas hattı, p4 = başparmak 4. tel, i3 = i 3. tel, + = aynı anda
const GD = [
  ['1', 'I', 'q', 'A', 'p+i2+m1'], ['2', 'I', 't', 'A', 'p i2 m1'], ['2b', 'I', 't', 'A', 'p m2 a1'], ['3', 'I', 't', 'A', 'p m1 i2'], ['3b', 'I', 't', 'A', 'p a1 m2'],
  ['4', 'I', 't', 'A', 'p i4 m3|p i3 m2|p i2 m1|p i2 m1'], ['5', 'I', 't', '-', 'm3 i4 p5|m2 i3 p4|m1 i2 p3|m1 i2 p5'], ['6', 'I', 't', 'A', 'p m3 i4|p m2 i3|p m1 i2|p m3 i4'],
  ['I-E1', 'I', 't', 'B', 'p i3 a1'], ['I-E2', 'I', 't', 'B', 'p i4 a2|p i3 a1'], ['I-E3', 'I', 't', 'B', 'p a1 i3'], ['I-E4', 'I', 't', 'B', 'p a2 i4|p a1 i3'],
  ['81', 'II', 's', 'A', 'p i2 m1 i2'], ['82', 'II', 's', 'A', 'p m1 i2 m1'],
  ['II-E1', 'II', 's', 'C', 'p i4 m3 i4|p i3 m2 i3|p i2 m1 i2|p i3 m2 i3'], ['II-E2', 'II', 's', 'C', 'p m3 i4 m3|p m2 i3 m2|p m1 i2 m1|p m2 i3 m2'],
  ['II-E3', 'II', 's', 'B', 'p i3 a1 i3'], ['II-E4', 'II', 's', 'B', 'p a1 i3 a1'], ['II-E5', 'II', 's', 'B', 'p i4 a2 i4|p i3 a1 i3'], ['II-E6', 'II', 's', 'B', 'p a2 i4 a2|p a1 i3 a1'],
  ['II-E7', 'II', 's', 'C', 'p m2 a1 m2'], ['II-E8', 'II', 's', 'C', 'p a1 m2 a1'], ['II-E9', 'II', 's', 'B', 'p m3 a2 m3|p m2 a1 m2'], ['II-E10', 'II', 's', 'B', 'p a2 m3 a2|p a1 m2 a1'],
  ['86', 'III', 's', 'B', 'p a1 i3 m2'], ['87', 'III', 's', 'B', 'p i3 m2 a1'], ['88', 'III', 's', 'B', 'p a1 m2 i3'],
  ['92', 'III', 's', '-', 'p6 i5 m4 a3|p5 i4 m3 a2|p4 i3 m2 a1|p5 i4 m3 a2'], ['93', 'III', 's', '-', 'a3 m4 i5 p6|a2 m3 i4 p5|a1 m2 i3 p4|a2 m3 i4 p5'],
  ['III-E1', 'III', 's', 'B', 'p m2 i3 a1'], ['III-E2', 'III', 's', 'B', 'p m2 a1 i3'], ['III-E3', 'III', 's', 'B', 'p i3 a1 m2'], ['III-E4', 'III', 's', 'B', 'p a2 i4 m3|p a1 i3 m2'],
  ['III-E5', 'III', 's', 'B', 'p m3 i4 a2|p m2 i3 a1'], ['III-E6', 'III', 's', 'B', 'p m3 a2 i4|p m2 a1 i3'], ['III-E7', 'III', 's', 'B', 'p i4 a2 m3|p i3 a1 m2'],
  ['7', 'IVa', 't', 'B', 'p i3 a1|p i3 m2'], ['8', 'IVa', 't', 'B', 'p a1 i3|p m2 i3'], ['10', 'IVa', 't', [5, 0, 4, 5], 'p m2 i3|a1 m2 i3|p m2 i3|p m2 i3'],
  ['16', 'IVa', 't', [5, 0, 5, 0], 'p m3 i4|a2 m3 i4|p m3 i4|a1 m3 i4'], ['85', 'IVa', 's', 'B', 'p i3 a1 i3|p i3 m2 i3'], ['89', 'IVa', 's', '-', 'p5 p4 i3 m2|a1 m2 i3 p4'],
  ['90', 'IVa', 's', 'B', 'p a1 m2 i3|p i3 m2 a1'], ['33', 'IVa', 's', 'B', 'p i3 a1 i3|p i3 m2 i3'],
  ['11', 'IVb', 't', 'B', 'p+i3 m2 a1'], ['12', 'IVb', 't', 'B', 'p+a1 m2 i3'], ['13', 'IVb', 't', 'B', 'p+i3 m2 a1|a1 m2 i3'], ['14', 'IVb', 't', 'B', 'p+m2 i3 a1'], ['15', 'IVb', 't', 'B', 'p+a1 i3 m2'],
  ['83', 'IVb', 's', 'B', 'p i3 m2 i3|p+a1 i3 m2 i3'], ['84', 'IVb', 's', 'B', 'p m2 i3 m2|p+a1 m2 i3 m2'],
  ['9', 'Va', 't', [5, 0, 4, 5], 'p i3 m2|a1 m2 i3|p i3 m2|p i3 m2'], ['17', 'Va', 't', '-', 'p5 i3 p4|m2 i3 a1|p4 m2 p5|i3 p4 m2'],
  ['25', 'Va', 's', 'A', 'p i2 m1 i2|p4 i2 m1 i2'], ['26', 'Va', 's', 'A', 'p m1 i2 m1|p4 m1 i2 m1'], ['28', 'Va', 's', 'A', 'p i3 a1 i3 m2 i3|p4 i3 a1 i3 m2 i3'],
  ['29', 'Va', 's', 'A', 'p i3 m2 i3 a1 i3|p4 i3 m2 i3 a1 i3'], ['30', 'Va', 's', '-', 'p5 i3 p4 m2 i3 a1|p4 a1 i3 m2 p5 i3'], ['31', 'Va', 's', 'A', 'p i3 m2 a1 m2 i3|p4 i3 m2 a1 m2 i3'],
  ['32', 'Va', 's', 'A', 'p a1 m2 i3 m2 a1|p4 a1 m2 i3 m2 a1'], ['34', 'Va', 's', '-', 'p5 i4 p4 i3 m2 a1|p4 i3 p5 i4 m2 a1'], ['35', 'Va', 's', 'A', 'p a1 m2 a1 m2 i3|p4 a1 m2 a1 m2 i3'],
  ['18', 'Vb', 't', [5, 5, 5, 5], 'p+m2+a1 p4 i3'], ['19', 'Vb', 't', [5, 5, 5, 5], 'p p4+m2+a1 i3'], ['20', 'Vb', 't', [5, 5, 5, 5], 'p p4 i3+m2+a1'], ['21', 'Vb', 't', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3'],
  ['22', 'Vb', 't', [5, 5, 5, 5], 'p p4+m2+a1 i3+m2+a1'], ['23', 'Vb', 't', [5, 5, 5, 5], 'p+m2+a1 p4 i3+m2+a1'], ['24', 'Vb', 't', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3+m2+a1'],
  ['66', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4 i3 p4'], ['67', 'Vb', 'e', [5, 5, 5, 5], 'p p4+m2+a1 i3 p4'], ['68', 'Vb', 'e', [5, 5, 5, 5], 'p p4 i3+m2+a1 p4'], ['69', 'Vb', 'e', [5, 5, 5, 5], 'p p4 i3 p4+m2+a1'],
  ['70', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3 p4'], ['71', 'Vb', 'e', [5, 5, 5, 5], 'p p4+m2+a1 i3+m2+a1 p4'], ['72', 'Vb', 'e', [5, 5, 5, 5], 'p p4 i3+m2+a1 p4+m2+a1'],
  ['73', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4 i3 p4+m2+a1'], ['74', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4 i3+m2+a1 p4'], ['75', 'Vb', 'e', [5, 5, 5, 5], 'p p4+m2+a1 i3 p4+m2+a1'],
  ['76', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3+m2+a1 p4'], ['77', 'Vb', 'e', [5, 5, 5, 5], 'p p4+m2+a1 i3+m2+a1 p4+m2+a1'], ['78', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4 i3+m2+a1 p4+m2+a1'],
  ['79', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3 p4+m2+a1'], ['80', 'Vb', 'e', [5, 5, 5, 5], 'p+m2+a1 p4+m2+a1 i3+m2+a1 p4+m2+a1'],
  ['91', 'VIa', 's', '-', 'p5 m2 a1 m2|i3 m2 p4 i3|p5 p4 i3 m2|a1 m2 i3 p4'], ['94', 'VIa', 's', '-', 'p5 m3 i4 p5|p4 m2 i3 p4|p3 m1 i2 p3|p4 m2 i3 p4'],
  ['100', 'VIa', 's', [5, 4, 3, 2], 'p a1 m1 i1'], ['110', 'VIa', 's', 'B', 'p a3 m3 i3'],
  ['36', 'VIb', 's', [5, 5, 5, 5], 'p+a1 i3 p4 i3'], ['37', 'VIb', 's', [5, 5, 5, 5], 'p i3+a1 p4 i3'], ['38', 'VIb', 's', [5, 5, 5, 5], 'p i3 p4+a1 i3'], ['39', 'VIb', 's', [5, 5, 5, 5], 'p i3 p4 i3+a1'],
  ['40', 'VIb', 's', [5, 5, 5, 5], 'p+m2+a1 i3 p4 i3'], ['41', 'VIb', 's', [5, 5, 5, 5], 'p i3+m2+a1 p4 i3'], ['42', 'VIb', 's', [5, 5, 5, 5], 'p i3 p4+m2+a1 i3'], ['43', 'VIb', 's', [5, 5, 5, 5], 'p+m1 i3 p4 i3+a1'],
  ['44', 'VIb', 's', [5, 5, 5, 5], 'p+a1 i3 p4+a1 i3'], ['45', 'VIb', 's', [5, 5, 5, 5], 'p i3+a1 p4 i3+a1'], ['46', 'VIb', 's', [5, 5, 5, 5], 'p+m1 i3+a1 p4+m1 i3'], ['47', 'VIb', 's', [5, 5, 5, 5], 'p i3+a1 p4+m1 i3+a1'],
  ['48', 'VIb', 's', [5, 5, 5, 5], 'p+m1 i3 p4+m1 i3+a1'], ['49', 'VIb', 's', [5, 5, 5, 5], 'p+m1 i3+a1 p4 i3+a1'], ['50', 'VIb', 's', [5, 5, 5, 5], 'p+m1 i3+a1 p4+m1 i3+a1'],
  ['51', 'VIb', 's', 'A', 'p+i2+m1 i2+m1 i2+m1 i2+m1'], ['52', 'VIb', 's', 'A', 'i2+m1 p+i2+m1 i2+m1 i2+m1'], ['53', 'VIb', 's', 'A', 'i2+m1 i2+m1 p+i2+m1 i2+m1'], ['54', 'VIb', 's', 'A', 'i2+m1 i2+m1 i2+m1 p+i2+m1'],
  ['55', 'VIb', 's', '-', 'p5+i2+m1 p4+i2+m1 i2+m1 i2+m1|p4+i2+m1 p3+i2+m1 i2+m1 i2+m1|p3+i2+m1 p4+i2+m1 i2+m1 i2+m1|p4+i2+m1 p5+i2+m1 i2+m1 i2+m1'],
  ['59', 'VIb', 's', 'A', 'p+i2+m1 i2+m1 p+i2+m1 i2+m1'], ['61', 'VIb', 's', 'A', 'p+i2+m1 p+i2+m1 p+i2+m1 i2+m1']
];
const GLV = {
  I: ['Seviye I', 'Üç notalı arpejler (p-i-m, p-m-a ve tersleri). Sağ elin temel yerleşimi.'],
  II: ['Seviye II', 'Dört notalı 16’lıklar: p-i-m-i, p-m-i-m. Parmakların eşit vuruşu.'],
  III: ['Seviye III', 'p-i-m-a’nın tüm sıralamaları. Yükselen ve inen dört nota.'],
  IVa: ['Seviye IVa', 'Karışık formüller, iki farklı vuruşun birleşimi, susmalı bas.'],
  IVb: ['Seviye IVb', 'Bas ile üst sesin birlikte (p+i, p+a) başladığı formüller.'],
  Va: ['Seviye Va', 'Uzun formüller (altılı gruplar), p’nin iç seslerde gezinmesi.'],
  Vb: ['Seviye Vb', 'Akor vuruşları: p+m+a ve i+m+a blok akorların arpejle karışımı.'],
  VIa: ['Seviye VIa', 'Tekrarlanan notalar (a-m-i aynı telde), hızlı karışık formüller.'],
  VIb: ['Seviye VIb', 'Çift sesli vuruşlar ve i+m çift notalar; bas farklı yerlerde.']
};
const GORD = GD.map(g => g[0]);
const lab = no => /E\d/.test(no) ? `${no.split('-')[0]} · ek ${no.split('-E')[1]}` : `No. ${no}`;
function giuParse(g) {
  const unit = U[g[2]], bass = Array.isArray(g[3]) ? g[3] : BASS[g[3]];
  const groups = g[4].split('|').map(x => x.trim().split(/\s+/));
  const bpg = groups[0].length * unit, tot = bpg * groups.length;
  const reps = Math.max(1, Math.round(4 / tot));
  return { unit, bass, groups, reps, fingers: groups[0].map(t => t.split('+').map(x => x[0]).join('+')).join(' ') };
}
function giuCols(g) {
  const P = giuParse(g); const cols = [];
  ['C', 'G7'].forEach((ch, mi) => {
    const V = VOI[ch]; let gi = 0;
    for (let r = 0; r < P.reps; r++) P.groups.forEach(grp => {
      grp.forEach((tok, k) => {
        const n = [];
        tok.split('+').forEach(t => {
          let str = null;
          if (t.length > 1) str = 6 - +t[1];
          else if (t === 'p') { const b = P.bass[gi % 4]; if (b) str = 6 - b; }
          else str = { i: 3, m: 4, a: 5 }[t];
          if (str != null && !n.some(x => x.s === str)) n.push({ s: str, f: V[str], v: t[0] === 'p' ? 'd' : 'u' });
        });
        cols.push({ n, top: tok.split('+').map(x => x[0]).join(''), d: P.unit, bar: mi === 1 && gi === 0 && k === 0 });
      });
      gi++;
    });
  });
  return cols;
}
G.giuCols = giuCols;
G.screens.giu = function () {
  const done = GD.filter(g => S.giu[g[0]]).length;
  const mark = S.giuMark;
  let h = `<p class="muted">Op. 1, 120 sağ el formülü, seviye sırasıyla · ${done}/${GD.length} tamamlandı. Her etüt C ve G7 ölçüsünün tekrarıdır. G7’de 2. tel sabit Re alındı; sol el melodili etütler (104–105, 111–114) ve VII. seviye dahil değil.</p>`;
  Object.keys(GLV).forEach(lv => {
    const items = GD.filter(g => g[1] === lv);
    const dn = items.filter(g => S.giu[g[0]]).length;
    h += `<h2 class="sec">${GLV[lv][0]} · ${dn}/${items.length}</h2><p class="muted">${GLV[lv][1]}</p><div class="gtiles">${items.map(g => { const P = giuParse(g); const r = S.giu[g[0]]; return `<button class="gt ${r ? 'ok' : ''} ${mark === g[0] ? 'mk' : ''}" data-a="go" data-s="giud" data-p='${JSON.stringify({ no: g[0] })}'><b>${lab(g[0])}</b><span>${P.fingers}</span>${r ? `<em>${r.bpm ? r.bpm + ' bpm' : '✓'}</em>` : ''}</button>`; }).join('')}</div>`;
  });
  return { t: 'Giuliani 120 arpej', cat: 'klasik', h };
};
G.actions.giuupto = d => { const k = GORD.indexOf(d.no); if (!confirm(lab(d.no) + ' dahil önceki tüm formüller tamamlandı sayılsın mı?')) return; GORD.slice(0, k + 1).forEach(no => { if (!S.giu[no]) S.giu[no] = { bpm: 0, d: G.dayKey() }; }); S.giuMark = d.no; G.save(); G.rerender(); };
G.actions.giuno = () => { S.giuAsked = 1; G.save(); G.rerender(); };
G.screens.giud = function (p) {
  if (!GD.find(x => x[0] === p.no)) p = { no: GD[0][0] };
  const g = GD.find(x => x[0] === p.no), i = GORD.indexOf(p.no); const P = giuParse(g); const cols = giuCols(g);
  CUR = { cols, save: bpm => { const r = S.giu[g[0]] || {}; S.giu[g[0]] = { bpm: Math.max(r.bpm || 0, bpm), d: G.dayKey() }; S.giuMark = g[0]; S.xp += 10; G.save(); } };
  const prev = GORD[i - 1], next = GORD[i + 1];
  const r = S.giu[g[0]];
  return { t: 'Giuliani ' + lab(g[0]), cat: 'klasik', h: `<div class="card"><div class="row"><div><div class="big">${lab(g[0])}</div><div class="muted">${GLV[g[1]][0]} · ${{ q: 'dörtlük', t: 'üçleme', e: 'sekizlik', s: '16’lık' }[g[2]]}</div></div><div class="fing">${P.fingers.split(' ').map(f => `<span>${f}</span>`).join('')}</div></div>
${viewH(cols)}<div class="row g"><span class="muted">Akorlar:</span><div class="pair mini2"><div>${CHM.diagram({ n: 'C', fr: [-1, 3, 2, 0, 1, 0], fg: [0, 3, 2, 0, 1, 0] }, { cls: 'mini' })}<b>C</b></div><div>${CHM.diagram({ n: 'G7', fr: VOI.G7, fg: [3, 2, 0, 0, 4, 1] }, { cls: 'mini' })}<b>G7</b></div></div></div></div>
${playerCard('giu', r && r.bpm)}
<div class="row g">${prev ? `<button class="btn ghost" data-a="giunav" data-no="${prev}">‹ ${lab(prev)}</button>` : ''}<button class="btn sm link" data-a="giuupto" data-no="${g[0]}">Buraya kadarını tamamlandı say</button>${next ? `<button class="btn ghost" data-a="giunav" data-no="${next}">${lab(next)} ›</button>` : ''}</div>`,
    after: bindTab };
};
G.actions.giunav = d => G.replace('giud', { no: d.no });

// ================= SAĞ EL / SOL EL ALIŞTIRMALARI =================
const N = (str, f) => ({ s: 6 - str, f });
const col = (notes, top, d, bar) => ({ n: notes, top: top || '', d: d || 0.5, bar: !!bar });
function rep(arr, k) { let r = []; for (let i = 0; i < k; i++) r = r.concat(arr.map((c, j) => Object.assign({}, c, { bar: j === 0 && i > 0 ? true : c.bar }))); return r; }
function posScale(rootName, mode, pos, octs) {
  const pcs = M.scaleIv(rootName, mode === 'min' ? [0, 2, 3, 5, 7, 8, 11] : M.MAJ).map(M.pcOf);
  // en düşük kök: 6. ya da 5. tel, pencerede
  let start = null;
  for (const s of [0, 1]) { for (let f = Math.max(0, pos - 1); f <= pos + 3; f++) if ((M.OPEN[s] + f) % 12 === M.pcOf(rootName)) { start = M.OPEN[s] + f; break; } if (start) break; }
  if (!start) return [];
  const pitches = []; for (let m = start; m <= start + 12 * (octs || 2); m++) if (pcs.includes(m % 12)) pitches.push(m);
  let cs = 0; const out = [];
  for (const m of pitches) {
    while (cs < 6) {
      const f = m - M.OPEN[cs];
      const fits = f >= Math.max(0, pos - 1) && f <= pos + 4;
      const nf = cs < 5 ? m - M.OPEN[cs + 1] : -99; const nextOk = nf >= Math.max(0, pos - 1) && nf <= pos + 3;
      if (fits && (f <= pos + 3 || !nextOk)) { out.push({ s: cs, f, fg: f === 0 ? 0 : Math.min(4, Math.max(1, f - pos + 1)) }); break; }
      cs++;
    }
    if (cs >= 6) break;
  }
  return out;
}
function scaleCols(notes, rh) { const up = notes.map((n, i) => col([{ s: n.s, f: n.f }], rh ? (i % 2 ? 'm' : 'i') : (n.fg === 0 ? '0' : String(n.fg)), 0.5, i === 0)); const dn = notes.slice(0, -1).reverse().map((n, i) => col([{ s: n.s, f: n.f }], rh ? ((notes.length - 1 + i) % 2 ? 'm' : 'i') : (n.fg === 0 ? '0' : String(n.fg)), 0.5)); return up.concat(dn); }
const KEYS2 = [['C', 'maj', 'Do majör'], ['G', 'maj', 'Sol majör'], ['D', 'maj', 'Re majör'], ['A', 'maj', 'La majör'], ['E', 'maj', 'Mi majör'], ['F', 'maj', 'Fa majör'], ['A', 'min', 'La minör (armonik)'], ['E', 'min', 'Mi minör (armonik)'], ['D', 'min', 'Re minör (armonik)']];
const PERMS = ['1234', '1324', '1243', '1342', '1423', '1432', '2143', '4321', '3142', '2413'];
const EX = {
  rh1: { h: 'R', g: 1, n: 'Boş tel apoyando · i-m', d: 'Dayanarak vuruş (apoyando): parmak teli çalıp bir alttaki tele yaslanır. i ve m sırayla, eşit ses ve süre. Önce 1. tel, sonra 2. ve 3. tel.', build: () => [5, 4, 3].flatMap((s, k) => Array.from({ length: 8 }, (_, i) => col([{ s, f: 0 }], i % 2 ? 'm' : 'i', 0.5, i === 0 && k > 0))) },
  rh2: { h: 'R', g: 1, n: 'Tel geçişi · i-m (1-2-3-2)', d: 'i-m sırasını bozmadan tel değiştir. Tel değişiminde elin yüksekliği sabit kalsın; parmaklar teller arasında “yürüsün”.', build: () => rep([1, 2, 3, 2].map((s, i) => col([N(s, 0)], i % 2 ? 'm' : 'i', 0.5)), 4) },
  rh3: { h: 'R', g: 2, n: 'm-a ve i-a alternasyonu', d: 'a parmağı en zayıf parmaktır. m-a ve i-a çiftleriyle eşit ses hedefle; a’nın sesi diğerleri kadar dolu olmalı.', build: () => [['m', 'a'], ['i', 'a'], ['a', 'm']].flatMap((pr, k) => Array.from({ length: 8 }, (_, i) => col([N(1, 0)], pr[i % 2], 0.5, i === 0 && k > 0))) },
  rh4: { h: 'R', g: 1, n: 'Başparmak · bas telleri', d: 'p, 6-5-4. telleri tirando (havada) ya da apoyando çalar. Bilek sabit, hareket başparmağın kökünden.', build: () => rep([6, 5, 4, 5].map(s => col([N(s, 0)], 'p', 0.5)), 4) },
  rh5: { h: 'R', g: 1, n: 'Tutam (pinch) · p ile m birlikte', d: 'Bas ve 1. tel aynı anda: p dışarıya, m avuca doğru “çimdikler”. İki ses tam aynı anda çıkmalı.', build: () => rep([6, 5, 4, 5].map(s => col([N(s, 0), N(1, 0)], 'p+m', 1)), 2) },
  rh6: { h: 'R', g: 7, n: 'Tremolo · p-a-m-i (La minör)', d: 'Recuerdos de la Alhambra hazırlığı. a-m-i aynı teli eşit aralıklarla çalar; p bası. Çok yavaş başla, dört notanın eşit olması hızdan önemli.', build: () => { const am = [-1, 0, 2, 2, 1, 0]; return rep([[5, 0], [4, 2], [3, 2], [4, 2]].flatMap(([s, f], k) => [col([N(s, f)], 'p', 0.25, k === 0), col([N(1, 0)], 'a', 0.25), col([N(1, 0)], 'm', 0.25), col([N(1, 0)], 'i', 0.25)]), 2); } },
  rh7: { h: 'R', g: 2, n: 'Gam · i-m alternasyonu', d: 'Sol el gamı, sağ el i-m sırası. Tel değişiminde sıra bozulmasın. Ton seçebilirsin.', keys: true, build: k => scaleCols(posScale(k[0], k[1], k[0] === 'C' ? 1 : k[0] === 'G' ? 2 : 1, 2), true) },
  rh8: { h: 'R', g: 3, n: 'Arpej · p-i-m-a-m-i (Mi majör ⇄ La minör)', d: 'Tárrega ve Carcassi etütlerinin temel arpeji. 16’lık, her akor 2 tur.', build: () => { const E = [0, 2, 2, 1, 0, 0], Am = [-1, 0, 2, 2, 1, 0]; const f = (V, b, bar) => [[b, 'p'], [3, 'i'], [4, 'm'], [5, 'a'], [4, 'm'], [3, 'i']].map(([s, t], i) => col([{ s, f: V[s] }], t, 0.25, bar && i === 0)); return f(E, 0, false).concat(f(E, 0), f(Am, 1, true), f(Am, 1)); } },
  rh9: { h: 'R', g: 5, n: 'Hız merdiveni · i-m tek tel', d: 'Tárrega’nın Estudio de Escalas’ına hazırlık: tek telde 16’lık i-m. Hız merdivenini aç; temiz kaldığın son tempo kaydedilir.', build: () => rep([0, 1, 3, 5, 3, 1, 0, 1].map((f, i) => col([N(1, f)], i % 2 ? 'm' : 'i', 0.25)), 2) },
  lh1: { h: 'L', g: 1, n: 'Kromatik 1-2-3-4 (1. pozisyon)', d: 'Her parmak kendi perdesinde: 1. perde 1. parmak, 4. perde 4. parmak. 6. telden 1. tele çık, geri in. Parmaklar perdenin hemen arkasında, kalkan parmaklar telin yakınında kalsın.', perm: true, build: (k, perm) => { perm = perm || '1234'; const up = []; for (let s = 6; s >= 1; s--) perm.split('').forEach((d, i) => up.push(col([N(s, +d)], d, 0.5, i === 0 && s === 6))); const dn = []; for (let s = 1; s <= 6; s++) perm.split('').reverse().forEach(d => dn.push(col([N(s, +d)], d, 0.5))); return up.concat(dn); } },
  lh2: { h: 'L', g: 2, n: 'Kromatik 5. pozisyon', d: 'Aynı kalıp 5. perdede: 1. parmak 5. perde. Pozisyon kaydıkça perde aralıkları daralır; el gevşek.', perm: true, build: (k, perm) => { perm = perm || '1234'; const r = []; for (let s = 6; s >= 1; s--) perm.split('').forEach((d, i) => r.push(col([N(s, 4 + +d)], d, 0.5, i === 0 && s === 6))); return r; } },
  lh3: { h: 'L', g: 1, n: 'Bağ · vurma (çekiç)', d: 'İlk nota sağ elle çalınır, ikincisi sağ el çalmadan sol el parmağının tele “çekiç” gibi düşmesiyle (V) çıkar. İkinci nota ilk kadar duyulmalı.', build: () => [1, 2, 3].flatMap((s, k) => [[0, 1], [0, 2], [0, 3], [1, 3], [1, 4], [2, 4]].flatMap(([a, b], i) => [col([N(s, a)], a ? String(a) : '0', 0.5, i === 0 && k > 0), col([N(s, b)], 'V' + b, 0.5)])) },
  lh4: { h: 'L', g: 2, n: 'Bağ · çekme', d: 'Üstteki parmak teli hafifçe çekerek (avuca doğru) bırakır, alttaki nota sağ el çalmadan çıkar (Ç). Alttaki parmak önceden yerinde olmalı.', build: () => [1, 2, 3].flatMap((s, k) => [[1, 0], [2, 0], [3, 0], [3, 1], [4, 1], [4, 2]].flatMap(([a, b], i) => [col([N(s, a)], String(a), 0.5, i === 0 && k > 0), col([N(s, b)], 'Ç' + (b || '0'), 0.5)])) },
  lh5: { h: 'L', g: 2, n: 'Uzanma (5. pozisyon)', d: 'Parmak aralarını açma: önce 1-2 arası 2 perde (5-7-8-9), sonra 3-4 arası 2 perde (5-6-7-9). Zorlamadan, avuç gevşek.', build: () => { const r = []; [[5, 7, 8, 9], [5, 6, 7, 9]].forEach((fs, k) => { for (let s = 6; s >= 1; s--) fs.forEach((f, i) => r.push(col([N(s, f)], String(i + 1), 0.5, i === 0 && s === 6 && k > 0))); }); return r; } },
  lh6: { h: 'L', g: 1, n: 'Gam · 1. pozisyon', d: 'Delcamp 1. seviyenin Do ve Sol majör gamları, sonra diğer tonlar. Parmak numarası = perde numarası (1. pozisyon).', keys: true, build: k => scaleCols(posScale(k[0], k[1], 1, 2)) },
  lh7: { h: 'L', g: 4, n: 'Gam · iki oktav, kaydırmalı pozisyon', d: 'Aynı tonu daha yukarıdaki bir pozisyonda çal: el bir pozisyonda kalır, 4. parmak gerekirse uzanır. Pozisyon seç.', keys: true, pos: true, build: (k, p, pos) => scaleCols(posScale(k[0], k[1], pos || 5, 2)) },
  lh8: { h: 'L', g: 2, n: '3’lüler (terceras) · 2. ve 1. tel', d: 'Do majörün 3’lüleri iki telde birlikte; sapta kayarak. Tárrega’nın Estudio de Terceras’ına hazırlık. Kayarken parmaklar telden kalkmasın.', build: () => { const s2 = [1, 3, 5, 6, 8, 10, 12, 13], s1 = [0, 1, 3, 5, 7, 8, 10, 12]; const up = s2.map((f, i) => col([N(2, f), N(1, s1[i])], '', 0.5, i === 0)); return up.concat(up.slice(0, -1).reverse().map(c => Object.assign({}, c, { bar: false }))); } },
  lh9: { h: 'L', g: 3, n: 'Pozisyon kayması · tek tel', d: 'Do majör gamı 2. telde: el kayarak ilerler. Kayma sırasında parmak tele hafifçe değsin (rehber parmak).', build: () => { const fs = [1, 3, 5, 6, 8, 10, 12, 13]; const fg = [1, 3, 1, 2, 1, 3, 1, 2]; const up = fs.map((f, i) => col([N(2, f)], String(fg[i]), 0.5, i === 0)); return up.concat(up.slice(0, -1).reverse().map(c => Object.assign({}, c, { bar: false }))); } },
  lh10: { h: 'L', g: 2, n: 'Barre dayanıklılığı', d: 'Mi şekli barre’ı 7. perdeden 1. perdeye kadar, her perdede 4 vuruş tut. Tüm teller net çıkmalı; baskıyı kolun ağırlığıyla ver, başparmakla sıkma.', build: () => [7, 6, 5, 4, 3, 2, 1].flatMap((n, k) => { const V = [0, 2, 2, 1, 0, 0].map(x => x + n); return [0, 1, 2, 3].map(i => col(V.map((f, s) => ({ s, f })), i === 0 ? 'B' + n : '', 1, i === 0 && k > 0)); }) },
  lh11: { h: 'L', g: 3, n: 'Trill ve mordent hazırlığı', d: 'Aynı telde hızlı vurma-çekme zinciri (2-4-2-4). Delcamp 3. seviyedeki mordent ve trill’lerin temeli. Sağ el yalnızca ilk notayı çalar.', build: () => [3, 2, 1].flatMap((s, k) => [col([N(s, 2)], '2', 0.25, k > 0), col([N(s, 4)], 'V4', 0.25), col([N(s, 2)], 'Ç2', 0.25), col([N(s, 4)], 'V4', 0.25), col([N(s, 2)], 'Ç2', 0.25), col([N(s, 4)], 'V4', 0.25), col([N(s, 2)], 'Ç2', 0.25), col([N(s, 0)], 'Ç0', 0.25)]) },
  lh12: { h: 'L', g: 5, n: 'Örümcek (spider)', d: 'İki komşu telde 1-2-3-4 çapraz yürüyüş. Parmak bağımsızlığı ve parmakların perde üzerinde kalması için.', build: () => { const r = []; for (let s = 6; s >= 2; s--) [[s, 1, 1], [s - 1, 2, 2], [s, 3, 3], [s - 1, 4, 4]].forEach(([st, f, d], i) => r.push(col([N(st, f)], String(d), 0.5, i === 0 && s === 6))); return r; } },
  lh13: { h: 'L', g: 5, n: 'Bağ zinciri (ligado) 1-2-3-4', d: 'Barrios’un Estudio del ligado’suna hazırlık: tek vuruşla dört nota (vurma) ve dört nota geri (çekme). 5. pozisyonda.', build: () => [1, 2, 3].flatMap((s, k) => [col([N(s, 5)], '1', 0.25, k > 0), col([N(s, 6)], 'V2', 0.25), col([N(s, 7)], 'V3', 0.25), col([N(s, 8)], 'V4', 0.25), col([N(s, 8)], '4', 0.25), col([N(s, 7)], 'Ç3', 0.25), col([N(s, 6)], 'Ç2', 0.25), col([N(s, 5)], 'Ç1', 0.25)]) }
};
G.EX = EX;
function exOpts(id) { return S.exo[id] || { k: 0, p: '1234', pos: 5 }; }
G.screens.ex = function (p) {
  const e = EX[p.id]; const o = exOpts(p.id); const k = KEYS2[o.k];
  const cols = e.build(k, o.p, o.pos);
  CUR = { cols, save: bpm => { S.ex[p.id] = Math.max(S.ex[p.id] || 0, bpm); S.xp += 10; G.save(); } };
  let opts = '';
  if (e.keys) opts += `<div class="chips">${KEYS2.map((x, i) => `<button class="chipb ${i === o.k ? 'on' : ''}" data-a="exo" data-id="${p.id}" data-f="k" data-v="${i}">${x[2]}</button>`).join('')}</div>`;
  if (e.perm) opts += `<div class="chips">${PERMS.map(x => `<button class="chipb ${x === o.p ? 'on' : ''}" data-a="exo" data-id="${p.id}" data-f="p" data-v="${x}">${x.split('').join('-')}</button>`).join('')}</div>`;
  if (e.pos) opts += `<div class="chips">${[2, 3, 4, 5, 7, 9].map(x => `<button class="chipb ${x === o.pos ? 'on' : ''}" data-a="exo" data-id="${p.id}" data-f="pos" data-v="${x}">${x}. pozisyon</button>`).join('')}</div>`;
  return { t: e.n, cat: 'klasik', h: `<div class="card"><div class="tag">${e.h === 'R' ? 'Sağ el' : 'Sol el'} · Delcamp ${e.g}. seviye</div><p>${e.d}</p>${opts}
${cols.length ? viewH(cols, { flats: e.keys && ['F'].includes(k[0]) }) : '<p class="muted">Bu ton bu pozisyonda çıkmıyor, başka pozisyon seç.</p>'}
<p class="muted">Üstteki satır: ${e.h === 'R' ? 'sağ el parmağı (p i m a)' : 'sol el parmağı (0 = boş tel, V = vurma, Ç = çekme, B = barre perdesi)'}.</p></div>${playerCard(p.id, S.ex[p.id])}`, after: bindTab };
};
G.actions.exo = d => { const o = Object.assign({}, exOpts(d.id)); o[d.f] = d.f === 'p' ? d.v : +d.v; S.exo[d.id] = o; G.save(); G.rerender(); };
function exList(h) {
  return Object.keys(EX).filter(id => EX[id].h === h).sort((a, b) => EX[a].g - EX[b].g).map(id => { const e = EX[id]; return `<button class="menu exm" data-a="go" data-s="ex" data-p='${JSON.stringify({ id })}'><span class="lvn">${e.g}</span><span><b>${e.n}</b><span class="muted">${e.d.split('. ')[0]}.</span>${S.ex[id] ? `<span class="pill ok">rekor ${S.ex[id]} bpm</span>` : ''}</span></button>`; }).join('');
}
G.screens.sagel = () => ({ t: 'Sağ el', cat: 'klasik', h: `<p class="muted">Soldaki sayı Delcamp seviyesi. Arpej formülleri için Giuliani 120 bölümü ayrıca var.</p><div class="menus">${exList('R')}</div>` });
G.screens.solel = () => ({ t: 'Sol el', cat: 'klasik', h: `<p class="muted">Soldaki sayı Delcamp seviyesi. Her alıştırmada tab, parmak numarası, metronom ve hız merdiveni var.</p><div class="menus">${exList('L')}</div>` });

// ================= DELCAMP SEVİYELERİ =================
const PB = 'https://www.classical-guitar-sheet-music.com/apdfsdelcamp/';
const COLL = { 1: 'delcamp_beginner_level_1_classical_guitar_sheet_music.pdf', 2: 'delcamp_beginner_level_2_classical_guitar_sheet_music.pdf', 3: 'delcamp_beginner_level_3_classical_guitar_sheet_music.pdf', 4: 'delcamp_beginner_level_4_classical_guitar_sheet_music.pdf',
  5: 'Delcamp_intermediate_level_5_classical_guitar_sheet_music.pdf', 6: 'Delcamp_intermediate_level_6_classical_guitar_sheet_music.pdf', 7: 'Delcamp_intermediate_level_7_classical_guitar_sheet_music.pdf', 8: 'Delcamp_intermediate_level_8_classical_guitar_sheet_music.pdf',
  MB1: 'Classical_masterpieces_for_guitar_Book_1_for_beginner.pdf', MB2: 'Classical_masterpieces_for_guitar_Book_2_for_beginner.pdf', REN1: 'Renaissance_Music_Book_1_For_Beginner_Guitarists.pdf', SAG1: 'Julio_Salvador_Sagreras_Las_Primeras_Lecciones_de_guitarra.pdf' };
// [besteci, eser, PDF dosyası | derleme anahtarı (arama ile açılır)]
const DG = [
  { g: 1, t: 'Başlangıç', top: ['Apoyando (dayanarak vuruş)', 'Boş teller ve susturma', 'Do ve Sol majör gamları', '3’lü gamlar', 'Basit akorlar ve arpejler', 'Bağ (ligado) girişi', 'İki ses (polifoni)', 'Ritim okuma'],
    ex: ['rh1', 'rh2', 'rh4', 'rh5', 'lh1', 'lh6', 'lh3'], giu: ['I'],
    rep: [['Fernando Sor', 'Leçon 1, op. 60', 'Fernando_Sor_Lecon_1_op_60.pdf'], ['Fernando Sor', 'Leçon 2, op. 60', 'Fernando_Sor_Lecon_2_op_60.pdf'], ['Fernando Sor', 'Leçon 3, op. 60', 'Fernando_Sor_Lecon_3_op_60.pdf'],
      ['Dionisio Aguado', 'Lección 5a', 'Dionisio_Aguado_Leccion_5a.pdf'], ['Dionisio Aguado', 'Valse in G', 'Dionisio_Aguado_Valse_sol_majeur.pdf'], ['Matteo Carcassi', 'Exercice, op. 59', 'Matteo_Carcassi_Exercice.pdf'],
      ['Joseph Küffner', 'Sonatine 1, op. 80', 'Joseph_K%C3%BCffner_Sonatine_1_opus_80.pdf'], ['Julio S. Sagreras', 'Lecciones 40 y 41', 'Julio_Sagreras_Leciones_40_41.pdf'], ['Julio S. Sagreras', 'Lección 44', 'Julio_Sagreras_Leciones_44.pdf'], ['Julio S. Sagreras', 'Lección 47', 'Julio_Sagreras_Leciones_47.pdf'], ['Adrian Le Roy', 'Branle de Poictou 2', 'adrian_leroy_branle_de_poictou_2.pdf'], ['Adrian Le Roy', 'Branle de Poictou 4', 'adrian_leroy_branle_de_poictou_4.pdf'], ['Gaspar Sanz', 'Villano', 'Gaspar_Sanz_Villano.pdf']] },
  { g: 2, t: 'Temel teknik', top: ['Bağlar (vurma ve çekme)', 'Seslerin susturulması', 'Uzanmalar', 'Arpejler', 'Yarım ve tam barre (cejilla)', 'Gamlar ve 3’lü gamlar'],
    ex: ['rh3', 'rh7', 'lh2', 'lh4', 'lh5', 'lh8', 'lh10'], giu: ['II', 'III'],
    rep: [['Fernando Sor', 'Leçon 4, op. 60', 'Fernando_Sor_Lecon_4_op_60.pdf'], ['Fernando Sor', 'Leçon 5, op. 60', 'Fernando_Sor_opus_60_05.pdf'], ['Fernando Sor', 'Leçon 8, op. 60', 'Fernando_Sor_opus_60_08.pdf'],
      ['Fernando Sor', 'Andante n°1, op. 44', 'Fernando_Sor_opus_44_01.pdf'], ['Ferdinando Carulli', 'Valse in A major, op. 241', 'ferdinando_carulli_op_241_Valse_in_a_maj.pdf'], ['Ferdinando Carulli', 'Andantino in G, op. 241', 'ferdinando_carulli_op_241_Andantino_in_G.pdf'],
      ['Mauro Giuliani', 'Escozzese 4, op. 33', 'mauro_giuliani_op_033_escozzese_4.pdf'], ['Mauro Giuliani', 'Écossaise 13, op. 24', 'mauro_giuliani_op_024_13_Ecossaise.pdf'], ['Matteo Carcassi', 'Andantino, op. 59', 'matteo_carcassi_op_59_andantino.pdf'],
      ['Matteo Carcassi', 'Andante, op. 59', 'matteo_carcassi_op_59_andante.pdf'], ['Matteo Carcassi', 'Sauteuse, op. 59', 'matteo_carcassi_op_59_sauteuse.pdf'], ['Gaspar Sanz', 'Dance de las hachas', 'gaspar_sanz_dance_de_las_hachas.pdf'], ['Thoinot Arbeau', 'Pavane', 'Thoinot_Arbeau_Pavane.pdf']] },
  { g: 3, t: 'Pozisyon ve süsleme', top: ['Akorlar ve arpejler', 'Barre', 'Uzanmalar', 'Gamlar, pozisyon kayması', 'Glissando', 'Legato ve staccato', 'Bağlar', 'Mordent ve trill'],
    ex: ['rh8', 'lh9', 'lh11'], giu: ['IVa', 'IVb'],
    rep: [['Fernando Sor', 'Leçon 7, op. 60', 'Fernando_Sor_opus_60_07.pdf'], ['Fernando Sor', 'Exercice 1, op. 35', 'Fernando_Sor_opus_35_01.pdf'], ['Fernando Sor', 'Exercice 2, op. 35', 'Fernando_Sor_opus_35_02.pdf'],
      ['Ferdinando Carulli', 'Allegretto, op. 241', 'ferdinando_carulli_op_241_Allegretto.pdf'], ['Ferdinando Carulli', 'Andante, op. 241', 'ferdinando_carulli_op_241_Andante.pdf'], ['Ferdinando Carulli', 'Arpeggi, op. 241', 'ferdinando_carulli_op_241_Arpeggi.pdf'],
      ['Ferdinando Carulli', 'Valse en Sol, op. 241', 'ferdinando_carulli_op_241_Valse_sol.pdf'], ['Matteo Carcassi', 'Allegretto, op. 59', 'matteo_carcassi_op_59_allegretto.pdf'], ['Niccolò Paganini', 'Ghiribizzo 1', 'niccolo_paganini_ghiribizzi_01.pdf'], ['Joseph Haydn', 'Menuet in C', 'joseph_haydn_menuet_do_majeur.pdf'], ['Anonim', 'Greensleeves', 'Greensleeves_for_classical_guitar.pdf']] },
  { g: 4, t: 'Klasik dönem etütleri', top: ['Daha uzun arpej formülleri', 'Bas ile melodi ayrımı', 'Pozisyonlar arası geçiş', 'Barre’lı akor akışı'],
    ex: ['lh7'], giu: ['Va'],
    rep: [['Mauro Giuliani', 'Étude 1, op. 51', 'mauro_giuliani_etude_1_opus_51.pdf'], ['Mauro Giuliani', 'Allegretto 17, op. 50', 'mauro_giuliani_allegretto_17_opus_50.pdf'], ['Mauro Giuliani', 'Le Papillon n°1, op. 50', 'mauro_giuliani_le_papillon_n1_opus_50.pdf'],
      ['Dionisio Aguado', 'Leçon 56, op. 6', 'dionisio_aguado_lecon_56_opus_6.pdf'], ['Fernando Sor', 'Étude 13, op. 35', 'Fernando_Sor_opus_35_13.pdf'], ['Fernando Sor', 'Étude 17, op. 35', 'Fernando_Sor_opus_35_17.pdf'], ['Fernando Sor', 'Étude 22, op. 35', 'Fernando_Sor_opus_35_22.pdf'],
      ['Matteo Carcassi', 'Prelude in A minor, op. 59', 'matteo_carcassi_prelude_en_la_mineur_opus_59.pdf'], ['Napoléon Coste', 'Étude in D minor', 'napoleon_coste_etude_in_d_minor.pdf'], ['Johann K. Mertz', 'Ländler op. 9 n°4', 'johann_kaspar_mertz_op_09_04.pdf'], ['Luys Milán', 'Pavane I', 'milan_pavana_1.pdf']] },
  { g: 5, t: 'Orta seviye', top: ['Gam hızı (Estudio de Escalas)', 'Bağ zincirleri (Estudio del ligado)', 'Carcassi op. 60 etütleri', 'Rönesans repertuvarı'],
    ex: ['rh9', 'lh12', 'lh13'], giu: ['Vb'],
    rep: [['Francisco Tárrega', 'Lágrima', 'francisco_tarrega_lagrima.pdf'], ['Francisco Tárrega', 'Preludio 8', 'francisco_tarrega_preludio_8.pdf'], ['Francisco Tárrega', 'Preludio 9', 'francisco_tarrega_preludio_9.pdf'],
      ['Francisco Tárrega', 'Estudio en si menor', 'francisco_tarrega_estudio_si_minor.pdf'], ['Francisco Tárrega', 'Estudio de Escalas', 'francisco_tarrega_estudio_escalas.pdf'], ['Fernando Sor', 'Exercice op. 35 n°8', 'Fernando_Sor_opus_35_8.pdf'],
      ['Fernando Sor', 'Leçon op. 31 n°21', 'Fernando_Sor_opus_31_21.pdf'], ['Fernando Sor', 'Leçon op. 60 n°18', 'Fernando_Sor_opus_60_18.pdf'], ['Matteo Carcassi', 'Étude op. 60 n°1', 'matteo_carcassi_op_60_01.pdf'],
      ['Matteo Carcassi', 'Étude op. 60 n°3', 'matteo_carcassi_op_60_03.pdf'], ['Matteo Carcassi', 'Étude op. 60 n°6', 'matteo_carcassi_op_60_06.pdf'], ['Matteo Carcassi', 'Étude op. 60 n°11', 'matteo_carcassi_op_60_11.pdf'],
      ['Napoléon Coste', 'Étude 1, op. 38', 'napoleon_coste_op_38_01.pdf'], ['Napoléon Coste', 'Étude 2, op. 38', 'napoleon_coste_op_38_02.pdf'], ['J. S. Bach', 'Prelude BWV 1007', 'johann_sebastian_bach_bwv_1007.pdf'],
      ['J. S. Bach', 'Sarabande BWV 995', 'johann_sebastian_bach_bwv_995_sarabande.pdf'], ['Luys de Narváez', 'Guárdame las vacas', 'luys_de_narvaez_diferencias_guardame_las_vacas.pdf'], ['Gaspar Sanz', 'Canarios', 'gaspar_sanz_canarios.pdf'],
      ['Agustín Barrios', 'Estudio del ligado', 'agustin_barrios_mangore_estudio_del_ligado.pdf'], ['Agustín Barrios', 'El sueño de la muñequita', 'agustin_barrios_mangore_el_sueno_de_munequita.pdf'],
      ['Dionisio Aguado', 'Egercicio 10', 'Dionisio_Aguado_Egercicio_10.pdf'], ['Mauro Giuliani', 'Arpeggi (op. 1)', 'mauro_giuliani_op_001_48.pdf'], ['Johann K. Mertz', 'Ländler op. 12 n°1', 'johann_kaspar_mertz_op_12_01.pdf']] },
  { g: 6, t: 'Orta-ileri', top: ['3’lüler ve 6’lılar', 'Hız etütleri', 'Barok repertuvar', 'Carcassi op. 60 devamı'],
    ex: ['lh8', 'rh9'], giu: ['VIa'],
    rep: [['J. S. Bach', 'Bourrée BWV 996', 'johann_sebastian_bach_bwv_996_bourree.pdf'], ['J. S. Bach', 'Sarabande BWV 1002', 'johann_sebastian_bach_bwv_1002.pdf'], ['Francisco Tárrega', 'Estudio de Terceras', 'francisco_tarrega_estudio_terceras.pdf'],
      ['Francisco Tárrega', 'Estudio de Velocidad', 'francisco_tarrega_estudio_de_velocita.pdf'], ['Francisco Tárrega', 'Estudio de Damas', 'francisco_tarrega_estudio_damas.pdf'], ['Francisco Tárrega', 'Estudio de Cramer', 'francisco_tarrega_estudio_cramer.pdf'],
      ['Francisco Tárrega', 'Preludio 1', 'francisco_tarrega_preludio_1.pdf'], ['Francisco Tárrega', 'Preludio 4', 'francisco_tarrega_preludio_4.pdf'], ['Francisco Tárrega', 'Preludio 11', 'francisco_tarrega_preludio_11.pdf'],
      ['Matteo Carcassi', 'Étude op. 60 n°2', 'matteo_carcassi_op_60_02.pdf'], ['Matteo Carcassi', 'Étude op. 60 n°7', 'matteo_carcassi_op_60_07.pdf'], ['Dionisio Aguado', 'Estudio 15', 'Dionisio_Aguado_Estudio_15.pdf'],
      ['Dionisio Aguado', 'Estudio 29', 'Dionisio_Aguado_Estudio_29.pdf'], ['Mauro Giuliani', 'Sonatine 1, op. 71', 'mauro_giuliani_op_071_Sonatine.pdf'], ['Fernando Sor', 'Leçon 16, op. 31', 'Fernando_Sor_opus_31_16.pdf'],
      ['Fernando Sor', 'Leçon 20, op. 31', 'Fernando_Sor_opus_31_20.pdf'], ['Napoléon Coste', 'Étude 20, op. 38', 'napoleon_coste_op_38_20.pdf'], ['Erik Satie', 'Gnossienne 1', 'erik_satie_gnossienne_1.pdf'],
      ['Agustín Barrios', 'Preludio en mi', 'agustin_barrios_mangore_preludio_e_major.pdf'], ['Agustín Barrios', 'Minueto en do', 'agustin_barrios_mangore_minueto_en_do.pdf'], ['Luys de Narváez', 'Ay, arde corazón, arde', 'luys_de_narvaez_ay_arde_corazon_arde.pdf']] },
  { g: 7, t: 'İleri', top: ['Tárrega’nın arpej etüdü', 'Uzun formlar', 'Romantik repertuvar'],
    ex: ['rh6'], giu: ['VIb'],
    rep: [['Francisco Tárrega', 'Estudio de Arpegios', 'francisco_tarrega_estudio_arpegios.pdf'], ['Francisco Tárrega', 'Preludio 2', 'francisco_tarrega_preludio_2.pdf'], ['Francisco Tárrega', 'Preludio 5', 'francisco_tarrega_preludio_5.pdf'],
      ['Francisco Tárrega', 'Preludio 7', 'francisco_tarrega_preludio_7.pdf'], ['Fernando Sor', 'Étude op. 6 n°11', 'Fernando_Sor_opus_06_11.pdf'], ['J. S. Bach', 'Prélude BWV 999', 'johann_sebastian_bach_bwv_999.pdf'],
      ['Matteo Carcassi', 'Étude op. 60 n°12', 'matteo_carcassi_op_60_12.pdf'], ['Matteo Carcassi', 'Étude op. 60 n°20', 'matteo_carcassi_op_60_20.pdf'], ['Miguel Llobet', 'El testament d’Amelia', 'Miguel_Llobet__El_Testament_d_Amelia_%281900%29.pdf'],
      ['Miguel Llobet', 'Leonesa', 'Miguel_Llobet__Leonesa.pdf'], ['Erik Satie', 'Gymnopédie 1', 'erik_satie_gymnopedie_1.pdf'], ['Agustín Barrios', 'Villancico de Navidad', 'agustin_barrios_mangore_villancico_de_navidad.pdf'],
      ['Agustín Barrios', 'Preludio en do menor', 'agustin_barrios_mangore_preludio_do_menor.pdf'], ['Johann K. Mertz', 'Capriccio, op. 13', 'johann_kaspar_mertz_capriccio_3_op_13.pdf'], ['Luys de Narváez', 'Conde claros', 'luys_de_narvaez_conde_claros.pdf']] },
  { g: 8, t: 'Konser repertuvarı', top: ['Tremolo', 'Virtüözite', 'Büyük formlar'],
    ex: ['rh6'], giu: [],
    rep: [['Francisco Tárrega', 'Capricho Árabe', 'francisco_tarrega_capricho_arabe_serenata.pdf'], ['Francisco Tárrega', 'Recuerdos de la Alhambra', 'francisco_tarrega_recuerdos_de_la_alhambra_tremolo.pdf'], ['Fernando Sor', 'Étude op. 29 n°17', 'Fernando_Sor_opus_29_17.pdf'], ['Fernando Sor', 'Variations sur Malbrough, op. 28', 'fernando_sor_malbroug_op28.pdf'],
      ['Isaac Albéniz', 'Asturias', 'isaac_albeniz_opus47e_asturias.pdf'], ['Isaac Albéniz', 'Granada', 'isaac_albeniz_opus47a_granada.pdf'], ['J. S. Bach', 'Courante BWV 996', 'johann_sebastian_bach_bwv_996_courante.pdf'], ['J. S. Bach', 'Sarabande BWV 996', 'johann_sebastian_bach_bwv_996_sarabande.pdf'], ['J. S. Bach', 'Gigue BWV 996', 'johann_sebastian_bach_bwv_996_gigue.pdf'],
      ['Matteo Carcassi', 'Étude op. 60 n°25', 'matteo_carcassi_op_60_25.pdf'], ['Napoléon Coste', 'Étude 23, op. 38', 'napoleon_coste_etude23_op38.pdf'], ['Johann K. Mertz', 'Tarantelle', 'johann_kaspar_mertz_tarantelle.pdf']] }
];
function repUrl(r) { const f = r[2]; if (typeof f === 'string' && f.endsWith('.pdf')) return { u: PB + f, own: true }; return { u: PB + COLL[f] + '#search=' + encodeURIComponent(r[1].split(',')[0]), own: false }; }
const RS = ['', 'çalışıyorum', 'öğrendim'];
const rkey = (g, i) => { const d = DG.find(x => x.g === g); return g + ':' + d.rep[i][1]; };
function initRep() { if (S.rep && S.repV === 2) return; S.rep = {}; S.repV = 2; const set = (g, t, v) => { const d = DG.find(x => x.g === g); const i = d.rep.findIndex(r => r[1].includes(t)); if (i >= 0) S.rep[rkey(g, i)] = v; }; set(5, 'Lágrima', 2); set(6, 'Bourrée', 2); set(8, 'Capricho', 1); G.save(); }
function gradeProg(d) { const n = d.rep.length; let v = 0; d.rep.forEach((_, i) => { v += (S.rep[rkey(d.g, i)] || 0) / 2; }); return Math.round(v / n * 100); }
// genel repertuvar satırı: k = durum anahtarı; md: 'pdf' (tek parça), 'pdfc' (derleme), 'ext' (dış sayfa)
G.repRow = function (k, title, sub, url, md, src) {
  initRep(); const v = S.rep[k] || 0; const x = (S.repd || {})[k] || {};
  const info = [x.cur ? `${x.cur}${x.goal ? '/' + x.goal : ''} bpm` : x.goal ? `hedef ${x.goal} bpm` : '', x.recs && x.recs.length ? `kayıt ${x.recs.at(-1).d.slice(8, 10)}.${x.recs.at(-1).d.slice(5, 7)}` : ''].filter(Boolean).join(' · ');
  const meta = esc(JSON.stringify({ t: title, s: sub, u: url, md, src: src || '' }));
  const link = md === 'ext' ? `<a href="${esc(url)}" target="_blank" rel="noopener">` : `<a href="${esc(url)}" data-a="pdfopen" data-u="${encodeURIComponent(url)}" data-t="${encodeURIComponent(title)}" data-own="${md === 'pdf' ? 1 : 0}">`;
  return `<div class="rep s${v}">${link}<b>${esc(title)}${md === 'ext' ? ' <span class="ext" aria-label="dış bağlantı">↗</span>' : ''}</b><span class="muted">${esc(sub)}${info ? ' · <span class="rinf">' + info + '</span>' : ''}</span></a><button class="rs rd" data-a="repdet" data-k="${esc(k)}" data-t="${esc(title)}" aria-label="${esc(title)}: tempo ve kayıt">⋯</button><button class="rs" data-a="repset" data-k="${esc(k)}" data-m="${meta}" aria-label="${esc(title)}: durum ${v ? RS[v] : 'başlamadım'}">${v ? RS[v] : 'başlamadım'}</button></div>`;
};
G.klasikTech = function () {
  const gdone = GD.filter(g => S.giu[g[0]]).length;
  const card = (ic, t, d, attrs) => `<button class="menu" ${attrs}><span class="pic">${ic}</span><span><b>${t}</b><span class="muted">${d}</span></span></button>`;
  return `<div class="menus">
${card(G.icon('arpej'), 'Giuliani 120 arpej', `Op. 1, seviye sırasıyla ${GD.length} formül; tab, ses ve hız merdiveni. ${gdone} tamamlandı.`, 'data-a="go" data-s="giu"')}
${card(G.icon('sarki'), 'Sağ el', 'Apoyando, tel geçişi, a parmağı, tutam, tremolo, hız.', 'data-a="go" data-s="sagel"')}
${card(G.icon('sap'), 'Sol el', 'Kromatik permütasyonlar, bağlar, uzanma, gamlar, 3’lüler, barre, trill.', 'data-a="go" data-s="solel"')}
</div>`;
};
G.KL = { DG, GD, GLV, initRep: () => initRep(), gradeProg: d => gradeProg(d), repUrl: r => repUrl(r), rkey: (g, i) => rkey(g, i), RS, esc };
G.screens.delcamp = function () {
  initRep();
  const grades = DG.map(d => `<button class="gcard" data-a="go" data-s="grade" data-p='${JSON.stringify({ g: d.g })}'><span class="gn">${d.g}</span><span><b>${d.t}</b><span class="muted">${d.top.slice(0, 3).join(' · ')}</span><span class="bar2 thin"><i style="width:${gradeProg(d)}%"></i></span></span></button>`).join('');
  return { t: 'Delcamp', cat: 'klasik', h: `<p class="muted">Delcamp forumunun ücretsiz seviye derlemeleri. Her seviyede teknik alıştırmalar ve bol repertuvar var; Giuliani 120 formülleri seviyelere eşleştirildi. Parçalar uygulamanın içinde açılır, durumlarını ve tempolarını burada tutarsın.</p><div class="gcards">${grades}</div>
<p class="muted" style="margin-top:12px">Notalar: Delcamp seviye derlemeleri <a href="https://www.classical-guitar-sheet-music.com/beginner-grades-1-2-3-4/" target="_blank" rel="noopener">1–4</a>, <a href="https://www.classical-guitar-sheet-music.com/intermediate-classical-guitar-sheet-music/" target="_blank" rel="noopener">5–8</a> (ücretsiz PDF).</p>` };
};
G.screens.grade = function (p) {
  initRep();
  const d = DG.find(x => x.g === p.g);
  const giuL = d.giu.map(lv => { const items = GD.filter(g => g[1] === lv); const dn = items.filter(g => S.giu[g[0]]).length; return `<button class="chipb" data-a="go" data-s="giu">${GLV[lv][0]} · ${dn}/${items.length}</button>`; }).join('');
  const exs = d.ex.map(id => `<button class="menu exm" data-a="go" data-s="ex" data-p='${JSON.stringify({ id })}'><span class="lvn">${EX[id].h === 'R' ? 'Sağ' : 'Sol'}</span><span><b>${EX[id].n}</b>${S.ex[id] ? `<span class="pill ok">rekor ${S.ex[id]} bpm</span>` : ''}</span></button>`).join('');
  const rep = d.rep.map((r, i) => { const U2 = repUrl(r); return G.repRow(rkey(d.g, i), r[1], r[0], U2.u, U2.own ? 'pdf' : 'pdfc', 'Delcamp ' + d.g + '. seviye'); }).join('');
  // bu seviyenin Giuliani formüllerinden sıradaki 4 tanesi
  const nextG = GD.filter(g => d.giu.includes(g[1]) && !S.giu[g[0]]).slice(0, 4);
  const giuNext = d.giu.length ? (nextG.length ? `<div class="muted" style="margin-top:8px">Sıradaki Giuliani formülleri:</div><div class="chips">${nextG.map(g => `<button class="chipb" data-a="go" data-s="giud" data-p='${JSON.stringify({ no: g[0] })}'>No. ${g[0]}</button>`).join('')}</div>` : '<p class="muted">Bu seviyenin Giuliani formüllerini bitirdin.</p>') : '';
  return { t: `Delcamp ${d.g}. seviye`, cat: 'klasik', h: `<div class="card"><h3>${d.g}. seviye · ${d.t}</h3><div class="chips">${d.top.map(x => `<span class="chip">${x}</span>`).join('')}</div>${giuL ? `<div class="muted">Giuliani karşılığı:</div><div class="chips">${giuL}</div>` : ''}${giuNext}</div>
<h2 class="sec">Teknik alıştırmalar</h2><div class="menus">${exs}</div>
<h2 class="sec">Repertuvar</h2><p class="muted">Parça adına dokun: notası uygulamanın içinde açılır. Sağdaki düğme durumunu değiştirir (başlamadım → çalışıyorum → öğrendim).</p><div class="reps">${rep}</div>` };
};
G.actions.pdfopen = (d, el, e) => { if (e) e.preventDefault(); G.go('pdf', { u: decodeURIComponent(d.u), t: decodeURIComponent(d.t), own: d.own === '1' }); };
G.screens.pdf = function (p) {
  const mobile = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const mode = G.ui.pdfm || (mobile ? 'g' : 'd');
  const bare = p.u.split('#')[0];
  const src = mode === 'g' ? 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(bare) : p.u;
  return { t: p.t, cat: 'klasik', h: `<div class="pdfbar"><div class="seg sm"><button class="btn sm ${mode === 'd' ? 'on' : 'ghost'}" data-a="pdfm" data-v="d">Doğrudan</button><button class="btn sm ${mode === 'g' ? 'on' : 'ghost'}" data-a="pdfm" data-v="g">Google görüntüleyici</button></div><a class="btn sm ghost" href="${p.u}" target="_blank" rel="noopener">Yeni sekmede ↗</a></div>
${p.own ? '' : '<p class="muted">Bu parça seviye derlemesinin içinde; görüntüleyicinin arama özelliğiyle (Ctrl+F) parça adını bul.</p>'}
<div class="pdfv"><iframe src="${src}" title="${p.t}" loading="lazy" allowfullscreen></iframe></div>
<p class="muted">Sayfa boş kalırsa diğer görüntüleyiciyi dene. Telefonda Google görüntüleyici daha güvenilir çalışır.</p>` };
};
G.actions.pdfm = d => { G.ui.pdfm = d.v; G.rerender(); };
// ---------- repertuvar ayrıntısı: tempo hedefi ve kendini kaydetme ----------
let REC = null;
G._recStop = () => recStop();
function repD(k) { S.repd = S.repd || {}; return S.repd[k] = S.repd[k] || { goal: 0, cur: 0, recs: [] }; }
function recStop() { if (REC && REC.mr && REC.mr.state !== 'inactive') { try { REC.mr.stop(); } catch (e) {} } }
async function recList(k) {
  const el = $('#recl'); if (!el) return; const x = repD(k);
  if (!x.recs.length) { el.innerHTML = '<p class="muted">Henüz kayıt yok. Kendini ara ara kaydetmek, ilerlemeyi duymanın en iyi yolu.</p>'; return; }
  el.innerHTML = ''; for (const r of x.recs.slice().reverse()) {
    let b = null; try { b = await G.IDB.get('rec:' + k + ':' + r.t); } catch (e) {}
    const row = document.createElement('div'); row.className = 'recr';
    row.innerHTML = `<span>${r.d.slice(8, 10)}.${r.d.slice(5, 7)}.${r.d.slice(0, 4)}${r.bpm ? ' · ' + r.bpm + ' bpm' : ''}</span>`;
    if (b) { const a = document.createElement('audio'); a.controls = true; a.preload = 'none'; a.src = URL.createObjectURL(b); row.appendChild(a); } else row.insertAdjacentHTML('beforeend', '<span class="muted">dosya yok</span>');
    el.appendChild(row);
  }
}
G.actions.repdet = d => {
  const k = d.k, x = repD(k);
  G.modal(`<h3>${d.t}</h3><div class="two2"><label>Şu anki temiz tempo (bpm)<input id="rcur" type="number" inputmode="numeric" min="20" max="240" value="${x.cur || ''}"></label><label>Hedef tempo (bpm)<input id="rgoal" type="number" inputmode="numeric" min="20" max="240" value="${x.goal || ''}"></label></div>${x.goal && x.cur ? `<div class="bar2"><i style="width:${Math.min(100, x.cur / x.goal * 100)}%"></i></div><p class="muted">Hedefin %${Math.round(x.cur / x.goal * 100)}’indesin.</p>` : ''}
<button class="btn sm" data-a="repsave" data-k="${esc(k)}">Tempoyu kaydet</button>
<h3 style="margin-top:16px">Kendini kaydet</h3><p class="muted">Kayıtlar yalnızca bu cihazda saklanır; son 5 kayıt tutulur.</p><div class="row g"><button class="btn sm" id="recb" data-a="recgo" data-k="${esc(k)}">● Kaydı başlat</button><span class="muted" id="recs"></span></div><div id="recl"></div>`);
  recList(k);
};
G.actions.repsave = d => { const x = repD(d.k); x.cur = Math.max(0, +$('#rcur').value || 0); x.goal = Math.max(0, +$('#rgoal').value || 0); G.save(); G.actions.mclose(); G.rerender(); };
G.actions.recgo = async d => {
  const k = d.k, b = $('#recb'), st = $('#recs');
  if (REC && REC.mr && REC.mr.state === 'recording') { recStop(); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder) { st.textContent = 'Bu tarayıcı kayıt yapamıyor.'; return; }
  if (G.micMode) G.micMode('play-and-record');
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { if (G.micMode) G.micMode('playback'); st.textContent = 'Mikrofon izni verilmedi.'; return; }
  const chunks = []; const mr = new MediaRecorder(stream); const t0 = Date.now(); REC = { mr };
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = async () => {
    stream.getTracks().forEach(t => t.stop()); clearInterval(REC && REC.iv); if (G.micMode) G.micMode('playback');
    const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }); const x = repD(k); const ts = Date.now();
    try { await G.IDB.put('rec:' + k + ':' + ts, blob); x.recs.push({ t: ts, d: G.dayKey(), bpm: x.cur || 0 }); G._modalDirty = true; while (x.recs.length > 5) { const o = x.recs.shift(); try { await G.IDB.del('rec:' + k + ':' + o.t); } catch (e) {} } G.save(); } catch (e) { const s2 = $('#recs'); if (s2) s2.textContent = 'Kayıt saklanamadı.'; }
    const bb = $('#recb'); if (bb) bb.textContent = '● Kaydı başlat'; const s3 = $('#recs'); if (s3) s3.textContent = 'Kaydedildi.'; REC = null; recList(k);
  };
  mr.start(); b.textContent = '■ Kaydı bitir';
  REC.iv = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const e = $('#recs'); if (e) e.textContent = `kaydediliyor ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (s > 900) recStop(); }, 500);
};
G.actions.repset = d => { S.rep[d.k] = ((S.rep[d.k] || 0) + 1) % 3; if (d.m) { try { S.repm = S.repm || {}; S.repm[d.k] = JSON.parse(d.m); } catch (e) {} } G.save(); G.rerender(); };
})();
