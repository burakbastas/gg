(function () {
'use strict';
// ================= AKORT ALETİ + METRONOM =================
const G = window.G, S = G.S;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- ayarlar ----------
const TUNINGS = [
  ['std', 'Standart', [40, 45, 50, 55, 59, 64]],
  ['dropd', 'Drop D (6. tel Re)', [38, 45, 50, 55, 59, 64]],
  ['dg', '6. tel Re, 5. tel Sol', [38, 43, 50, 55, 59, 64]],
  ['ddd', 'Çift drop D', [38, 45, 50, 55, 59, 62]],
  ['half', 'Yarım ses pes (Mi♭)', [39, 44, 49, 54, 58, 63]],
  ['whole', 'Tam ses pes (Re)', [38, 43, 48, 53, 57, 62]],
  ['dadgad', 'DADGAD', [38, 45, 50, 55, 57, 62]],
  ['opend', 'Open D', [38, 45, 50, 54, 57, 62]],
  ['openg', 'Open G', [38, 43, 50, 55, 59, 62]],
  ['opene', 'Open E', [40, 47, 52, 56, 59, 64]],
  ['openc', 'Open C', [36, 43, 48, 55, 60, 64]],
  ['custom', 'Özel', null]
];
const fill = (o, d) => { Object.keys(d).forEach(k => { if (o[k] === undefined) o[k] = d[k]; }); return o; };
function tst() { return fill(S.tuner = S.tuner || {}, { a4: 440, tun: 'std', custom: [40, 45, 50, 55, 59, 64], mode: 'gtr', auto: true, sel: 0, ref: 'pluck' }); }
function mst() {
  return fill(S.metro = S.metro || {}, { bpm: 80, meter: '4/4', acc: null, sub: 1, snd: 'click', grpOnly: false, tr: { on: false, step: 4, every: 4, max: 140 }, gap: { on: false, play: 2, mute: 2 }, stopAfter: 0, presets: [] });
}
const tunOf = T => T.tun === 'custom' ? T.custom : (TUNINGS.find(x => x[0] === T.tun) || TUNINGS[0])[2];

// ---------- nota adları ----------
const NAMES = M.SHARP;
const midiF = (m, a4) => a4 * Math.pow(2, (m - 69) / 12);
const noteLbl = m => G.nn(NAMES[((m % 12) + 12) % 12]);
const notePlain = m => G.nnPlain(NAMES[((m % 12) + 12) % 12]) + (Math.floor(m / 12) - 1);
const KOMA = 1200 / 53; // Holder koması ≈ 22,64 sent

// ================= PERDE ALGILAMA (YIN) =================
// Kaynak: de Cheveigné & Kawahara (2002), YIN. 2 kat seyreltilmiş örnekle telefonda da hızlı.
function yin(buf, sr) {
  const N = buf.length, W = N >> 1; const d = new Float32Array(W);
  for (let tau = 1; tau < W; tau++) { let s = 0; for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; } d[tau] = s; }
  d[0] = 1; let run = 0;
  for (let tau = 1; tau < W; tau++) { run += d[tau]; d[tau] = d[tau] * tau / (run || 1); }
  const minTau = Math.floor(sr / 1400), maxTau = Math.min(W - 2, Math.floor(sr / 50));
  let tau = -1;
  for (let t = minTau; t < maxTau; t++) { if (d[t] < 0.12) { while (t + 1 < maxTau && d[t + 1] < d[t]) t++; tau = t; break; } }
  if (tau < 0) { // eşik altı yoksa en derin minimum (zayıf sinyal)
    let best = 1, bt = -1; for (let t = minTau; t < maxTau; t++) if (d[t] < best) { best = d[t]; bt = t; }
    if (bt < 0 || best > 0.35) return null; tau = bt;
  }
  const a = d[tau - 1], b = d[tau], c = d[tau + 1]; const den = a + c - 2 * b; const sh = den ? (a - c) / (2 * den) : 0;
  return { f: sr / (tau + sh), q: 1 - Math.min(1, d[tau]) };
}

// ================= AKORT ALETİ =================
const TU = { on: false, stream: null, src: null, an: null, raf: 0, buf: null, hist: [], med: [], last: null, err: '', refOsc: null, refStr: -1, lastProc: 0 };
async function tunerStart() {
  if (TU.on) return; if (!Aud.init()) { TU.err = 'Bu tarayıcı ses işleyemiyor.'; drawTuner(); return; }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { TU.err = 'Bu tarayıcı mikrofona erişemiyor. Güncel Safari veya Chrome kullan.'; drawTuner(); return; }
  try {
    TU.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch (e) { TU.err = 'Mikrofon izni verilmedi. Tarayıcı ayarlarından bu siteye mikrofon izni ver ve tekrar dene.'; drawTuner(); return; }
  const ctx = Aud.ctx; try { if (ctx.state !== 'running') await ctx.resume(); } catch (e) {}
  TU.src = ctx.createMediaStreamSource(TU.stream); TU.an = ctx.createAnalyser(); TU.an.fftSize = 4096; TU.src.connect(TU.an);
  TU.buf = new Float32Array(TU.an.fftSize); TU.ds = new Float32Array(TU.an.fftSize >> 1); TU.on = true; TU.err = ''; TU.hist = []; TU.med = []; TU.last = null;
  wakeOn(); loop(); drawTuner();
}
function tunerStop() {
  TU.on = false; cancelAnimationFrame(TU.raf);
  try { if (TU.src) TU.src.disconnect(); } catch (e) {} if (TU.stream) TU.stream.getTracks().forEach(t => t.stop());
  TU.stream = TU.src = TU.an = null; TU.last = null; refOff(); wakeOff(); drawTuner();
}
G.tunerStop = tunerStop;
function loop() {
  if (!TU.on) return; TU.raf = requestAnimationFrame(loop);
  const now = performance.now(); if (now - TU.lastProc < 45) return; TU.lastProc = now;
  TU.an.getFloatTimeDomainData(TU.buf);
  let rms = 0; for (let i = 0; i < TU.buf.length; i++) rms += TU.buf[i] * TU.buf[i]; rms = Math.sqrt(rms / TU.buf.length);
  // metronom tıkı mikrofona girdiyse o kareyi atla
  const nearClick = MT.running && MT.lastTick && Aud.ctx.currentTime - MT.lastTick < 0.09;
  let res = null;
  if (rms > 0.006 && !nearClick) {
    for (let i = 0; i < TU.ds.length; i++) TU.ds[i] = (TU.buf[2 * i] + TU.buf[2 * i + 1]) * 0.5;
    res = yin(TU.ds, Aud.ctx.sampleRate / 2);
  }
  const T = tst();
  if (res && res.f > 50 && res.f < 1400 && res.q > 0.6) {
    TU.med.push(res.f); if (TU.med.length > 5) TU.med.shift();
    const f = TU.med.slice().sort((a, b) => a - b)[TU.med.length >> 1];
    const mf = 69 + 12 * Math.log2(f / T.a4);
    let target, idx = -1;
    if (T.mode === 'gtr') {
      const tun = tunOf(T);
      if (T.auto) { let bd = 99; tun.forEach((m, i) => { const dd = Math.abs(mf - m); if (dd < bd) { bd = dd; idx = i; } }); T.sel = idx; }
      else idx = T.sel;
      target = tun[idx];
      if (Math.abs(mf - target) > 6) { target = Math.round(mf); idx = T.auto ? -1 : idx; }
    } else target = Math.round(mf);
    const cents = (mf - target) * 100;
    TU.last = { f, target, cents, idx, at: now, mf };
    TU.hist.push(Math.max(-50, Math.min(50, (mf - Math.round(mf)) * 100))); if (TU.hist.length > 90) TU.hist.shift();
  } else if (TU.last && now - TU.last.at > 900) { TU.last = null; }
  paint();
}
let ema = null;
function paint() {
  const L = TU.last, T = tst();
  const nd = $('#tnote'), ne = $('#tneedle'), hz = $('#thz'), cs = $('#tcents'), box = $('#tbox');
  if (!nd) return;
  if (!L) { nd.innerHTML = TU.on ? '<span class="muted">Bir tel çal</span>' : '—'; hz.textContent = TU.on ? 'dinleniyor…' : ''; cs.textContent = ''; box.className = 'tbox'; ema = null; if (ne) ne.setAttribute('transform', 'rotate(0 160 150)'); drawHist(); markStr(-1); return; }
  const c = Math.max(-50, Math.min(50, L.cents)); ema = ema == null ? c : ema * 0.6 + c * 0.4;
  ne.setAttribute('transform', `rotate(${ema * 1.4} 160 150)`);
  nd.innerHTML = `${noteLbl(L.target)}<sub>${Math.floor(L.target / 12) - 1}</sub>`;
  hz.textContent = `${L.f.toFixed(1)} Hz · hedef ${midiF(L.target, T.a4).toFixed(1)} Hz`;
  const ok = Math.abs(ema) <= 4, near = Math.abs(ema) <= 12;
  let txt = ok ? 'tam' : (ema < 0 ? `${Math.round(-ema)} sent pes · sık` : `${Math.round(ema)} sent tiz · gevşet`);
  if (T.mode === 'makam') { const k = Math.round(ema / KOMA); txt = `${Math.round(ema) > 0 ? '+' : ''}${Math.round(ema)} sent · ${k === 0 ? 'koma yok' : (k > 0 ? '+' : '') + k + ' koma'}`; }
  cs.textContent = txt; box.className = 'tbox ' + (ok ? 'ok' : near ? 'near' : 'off');
  markStr(T.mode === 'gtr' ? L.idx : -1); drawHist();
}
function markStr(idx) { document.querySelectorAll('.tstr').forEach(b => b.classList.toggle('hot', +b.dataset.i === idx)); }
function drawHist() {
  const cv = $('#thist'); if (!cv) return; const w = cv.clientWidth, h = cv.clientHeight; if (!w) return;
  if (cv.width !== w * 2) { cv.width = w * 2; cv.height = h * 2; }
  const g = cv.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, w, h);
  const css = getComputedStyle(document.documentElement);
  g.strokeStyle = css.getPropertyValue('--line'); g.lineWidth = 1; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  g.fillStyle = css.getPropertyValue('--gr-soft'); g.fillRect(0, h / 2 - h * 0.04, w, h * 0.08);
  if (TU.hist.length < 2) return;
  g.strokeStyle = css.getPropertyValue('--ac'); g.lineWidth = 2; g.beginPath();
  TU.hist.forEach((c, i) => { const x = w - (TU.hist.length - 1 - i) * (w / 89), y = h / 2 - c / 50 * (h / 2 - 3); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke();
}
// referans ses: seçili telin perdesi (A4 ayarına uygun), kulakla akort için
function refOff() { if (TU.refOsc) { try { TU.refOsc.g.gain.setTargetAtTime(0, Aud.ctx.currentTime, 0.05); TU.refOsc.o.stop(Aud.ctx.currentTime + 0.3); } catch (e) {} TU.refOsc = null; } clearInterval(TU.refT); TU.refT = 0; TU.refStr = -1; document.querySelectorAll('.tref').forEach(b => b.classList.remove('on')); }
function refOn(i) {
  if (!Aud.init()) return; refOff(); const T = tst(); const m = tunOf(T)[i]; const f = midiF(m, T.a4); TU.refStr = i;
  if (T.ref === 'tone') {
    const ctx = Aud.ctx, o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = f * 3;
    g.gain.value = 0; g.gain.setTargetAtTime(0.12, ctx.currentTime, 0.05); o.connect(lp); lp.connect(g); g.connect(Aud.out); o.start(); TU.refOsc = { o, g };
  } else { const pl = () => Aud.pluck(m + 12 * Math.log2(T.a4 / 440), Aud.now() + 0.02, 0.6); pl(); TU.refT = setInterval(pl, 2200); }
  document.querySelectorAll('.tref').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
}
function drawTuner() {
  const b = $('#tgo'); if (b) { b.textContent = TU.on ? '■ Akort aletini kapat' : 'Akort aletini aç'; b.classList.toggle('ghost', TU.on); }
  const e = $('#terr'); if (e) e.textContent = TU.err; paint();
}

// ================= METRONOM =================
const METERS = [
  ['2/4', [1, 1], 4], ['3/4', [1, 1, 1], 4], ['4/4', [1, 1, 1, 1], 4], ['5/4', [1, 1, 1, 1, 1], 4], ['6/8', [3, 3], 8],
  ['5/8', [2, 3], 8, 'Türk aksağı'], ['7/8', [3, 2, 2], 8, 'Devr-i hindi'], ['7/8b', [2, 2, 3], 8, '7/8 (2+2+3)'], ['9/8', [2, 2, 2, 3], 8, 'Aksak'], ['10/8', [3, 2, 2, 3], 8, 'Aksak semai'], ['12/8', [3, 3, 3, 3], 8]
];
const meterOf = id => METERS.find(x => x[0] === id) || METERS[2];
const mLabel = m => (m[3] ? `${m[0].replace('b', '')} · ${m[3]}` : m[0]) + (m[2] === 8 ? ` (${m[1].join('+')})` : '');
function pulses(m) { const p = []; m[1].forEach((g, gi) => { for (let k = 0; k < g; k++) p.push({ g: gi, start: k === 0 }); }); return p; }
function defAcc(m) { return pulses(m).map((p, i) => i === 0 ? 3 : (m[2] === 8 && p.start) ? 2 : 1); }
function accOf(Mt) { const m = meterOf(Mt.meter); const n = pulses(m).length; if (!Mt.acc || Mt.acc.length !== n) Mt.acc = defAcc(m); return Mt.acc; }
const TERMS = [[40, 'Grave'], [60, 'Largo'], [66, 'Larghetto'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [156, 'Allegro'], [176, 'Vivace'], [200, 'Presto'], [999, 'Prestissimo']];
const term = b => (TERMS.find(t => b < t[0]) || TERMS[TERMS.length - 1])[1];
const MT = { running: false, sch: null, bar: 0, t0: 0, lastTick: 0, timer: 0, taps: [] };
function ticksOf(Mt) {
  // her ölçünün tık listesi: {p: vuruş no, lvl, d: süre (bpm birimi cinsinden)}
  const m = meterOf(Mt.meter), acc = accOf(Mt), P = pulses(m), out = [];
  if (m[2] === 8) {
    if (Mt.grpOnly) { let i = 0; m[1].forEach(g => { out.push({ p: i, lvl: acc[i], d: g }); i += g; }); }
    else P.forEach((p, i) => out.push({ p: i, lvl: acc[i], d: 1 }));
  } else P.forEach((p, i) => {
    const sub = Mt.sub;
    if (sub === 'sw') { out.push({ p: i, lvl: acc[i], d: 2 / 3 }); out.push({ p: i, lvl: acc[i] ? 0.5 : 0, d: 1 / 3, s: 1 }); }
    else for (let k = 0; k < sub; k++) out.push({ p: i, lvl: k ? (acc[i] ? 0.5 : 0) : acc[i], d: 1 / sub, s: k });
  });
  return out;
}
function metroStart() {
  if (MT.running) return; if (!Aud.init()) return; const Mt = mst();
  let ticks = ticksOf(Mt); MT.bar = 0; MT.t0 = Date.now(); MT.running = true;
  MT.sch = makeScheduler((i, t, api) => {
    const k = i % ticks.length;
    if (k === 0) {
      if (i > 0) { MT.bar++; if (Mt.tr.on && MT.bar % Math.max(1, Mt.tr.every) === 0 && Mt.bpm < Mt.tr.max) { Mt.bpm = Math.min(Mt.tr.max, Mt.bpm + Mt.tr.step); api.at(t, syncBpm); } }
      ticks = ticksOf(Mt);
    }
    const tk = ticks[k % ticks.length]; const cyc = Mt.gap.play + Mt.gap.mute; const muted = Mt.gap.on && cyc > 0 && (MT.bar % cyc) >= Mt.gap.play;
    if (!muted && tk.lvl) { Aud.tick(t, tk.lvl, Mt.snd); MT.lastTick = t; }
    if (!tk.s) api.at(t, () => beatUI(tk.p, muted, MT.bar));
    return 60 / Mt.bpm * tk.d;
  }, { metro: true });
  MT.sch.start(); wakeOn();
  MT.timer = setInterval(() => { const s = Math.floor((Date.now() - MT.t0) / 1000); const e = $('#mtime'); if (e) e.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (Mt.stopAfter && s >= Mt.stopAfter * 60) metroStop(); }, 500);
  metroUI(); pill();
}
function metroStop() {
  if (!MT.running) return; MT.running = false; if (MT.sch) MT.sch.stop(); MT.sch = null; clearInterval(MT.timer);
  if (!TU.on) wakeOff(); document.querySelectorAll('.mdot').forEach(d => d.classList.remove('cur')); metroUI(); pill();
}
G.metroStop = metroStop;
function beatUI(p, muted, bar) {
  document.querySelectorAll('.mdot').forEach(d => d.classList.toggle('cur', +d.dataset.i === p));
  const bc = $('#mbar'); if (bc) bc.textContent = `${bar + 1}. ölçü${muted ? ' · sessiz' : ''}`;
  const pl = $('#mpill'); if (pl) { pl.classList.toggle('beat', p === 0); pl.classList.toggle('mute', muted); }
}
function syncBpm() { const Mt = mst(); const r = $('#mbpm'); if (r) r.value = Mt.bpm; const v = $('#mbpmv'); if (v) v.innerHTML = bpmBig(Mt); const tm = $('#mterm'); if (tm) tm.textContent = term(Mt.bpm); pill(); G.save(); }
const bpmLabel = Mt => `${Mt.bpm} bpm${meterOf(Mt.meter)[2] === 8 ? ' (8’lik)' : ''}`;
const bpmBig = Mt => `${Mt.bpm}<small>${meterOf(Mt.meter)[2] === 8 ? 'sekizlik / dk' : 'bpm'}</small>`;
function metroUI() { const b = $('#mgo'); if (b) { b.textContent = MT.running ? '■ Durdur' : '▶ Başlat'; } }
// başlıktaki küçük rozet: metronom başka ekranlardayken de görünür
function pill() {
  let el = $('#mpill'); const Mt = mst();
  if (!MT.running) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('button'); el.id = 'mpill'; el.className = 'pill mpill'; el.dataset.a = 'tab'; el.dataset.t = 'arac'; el.setAttribute('aria-label', 'Metronom çalıyor, aç'); const tm = $('#tmr'); tm.parentNode.insertBefore(el, tm); }
  el.textContent = bpmLabel(Mt);
}

// ---------- ekran kararmasın ----------
let wake = null;
function wakeOn() { try { if (!wake && navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener && w.addEventListener('release', () => { wake = null; }); }).catch(() => {}); } catch (e) {} }
function wakeOff() { if (TU.on || MT.running) return; try { if (wake) wake.release(); } catch (e) {} wake = null; }
document.addEventListener('visibilitychange', () => { if (!document.hidden && (TU.on || MT.running)) wakeOn(); });

// ================= EKRAN =================
G.screens.arac = function () {
  const T = tst(), Mt = mst(), tun = tunOf(T), m = meterOf(Mt.meter), acc = accOf(Mt), P = pulses(m);
  const view = G.ui.aracV || 'tun';
  const sb = (a, v, cur, l, extra) => `<button class="btn sm ${cur === v ? 'on' : 'ghost'}" data-a="${a}" data-v="${v}" ${extra || ''}>${l}</button>`;
  const strs = tun.map((mm, i) => `<div class="tstrw"><button class="tstr ${!T.auto && T.sel === i ? 'sel' : ''}" data-a="tstr" data-i="${i}" aria-label="${6 - i}. tel ${notePlain(mm)}"><small>${6 - i}. tel</small><b>${G.nnPlain(NAMES[mm % 12])}</b><em>${S.set.nt === 'en' ? '' : NAMES[mm % 12].replace('#', '♯')}${Math.floor(mm / 12) - 1}</em></button><button class="tref ${TU.refStr === i ? 'on' : ''}" data-a="tref" data-i="${i}" aria-label="${6 - i}. tel referans sesi">♪</button></div>`).join('');
  const cust = T.tun === 'custom' ? `<div class="tcust">${T.custom.map((mm, i) => `<div><span>${6 - i}. tel</span><button class="btn sm ghost" data-a="tcus" data-i="${i}" data-d="-1" aria-label="${6 - i}. tel yarım ses pes">−</button><b>${G.nnPlain(NAMES[mm % 12])}${Math.floor(mm / 12) - 1}</b><button class="btn sm ghost" data-a="tcus" data-i="${i}" data-d="1" aria-label="${6 - i}. tel yarım ses tiz">+</button></div>`).join('')}</div>` : '';
  const dots = P.map((p, i) => `<button class="mdot l${acc[i]} ${m[2] === 8 && p.start && i ? 'gs' : ''}" data-a="macc" data-i="${i}" aria-label="${i + 1}. vuruş, vurgu ${['sessiz', 'normal', 'grup başı', 'ölçü başı'][acc[i]]}"><i></i></button>`).join('');
  const meters = METERS.map(x => `<option value="${x[0]}" ${x[0] === Mt.meter ? 'selected' : ''}>${mLabel(x)}</option>`).join('');
  const subs = m[2] === 8 ? `<label class="chk"><input type="checkbox" id="mgrp" ${Mt.grpOnly ? 'checked' : ''}> Sadece grup başlarını çal (aksak hissi)</label>` :
    `<div class="seg">${[[1, '♩'], [2, '♫ 8’lik'], [3, '3’leme'], [4, '16’lık'], ['sw', 'Swing']].map(x => sb('msub', String(x[0]), String(Mt.sub), x[1])).join('')}</div>`;
  const presets = Mt.presets.length ? Mt.presets.map((p, i) => `<div class="mpre"><button class="chipb" data-a="mload" data-i="${i}">${esc(p.name)} <span class="muted">${p.bpm} · ${p.meter.replace('b', '')}</span></button><button class="btn sm link danger" data-a="mdel" data-i="${i}" aria-label="${esc(p.name)} sil">✕</button></div>`).join('') : '<p class="muted">Kayıtlı ayar yok. Çalıştığın parçalar için tempo ve ölçüyü kaydet.</p>';
  return { t: 'Akort ve metronom', cat: 'arac', h: `<div class="seg tview">${sb('aview', 'tun', view, 'Akort')}${sb('aview', 'met', view, 'Metronom')}</div>
<div class="tools v-${view}">
<section class="card tcard"><div class="row"><h3>Akort aleti</h3><div class="seg sm">${sb('tmode', 'gtr', T.mode, 'Gitar')}${sb('tmode', 'chr', T.mode, 'Kromatik')}${sb('tmode', 'makam', T.mode, 'Makam')}</div></div>
<div id="tbox" class="tbox"><svg viewBox="0 0 320 172" class="tgauge" aria-hidden="true">
<path d="M30 150 A130 130 0 0 1 290 150" class="tarc"/><path d="M139 22 A130 130 0 0 1 181 22" class="tok"/>
${[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map(c => { const a = (c * 1.4 - 90) * Math.PI / 180, r1 = c % 50 === 0 || c === 0 ? 112 : 120; return `<line x1="${160 + r1 * Math.cos(a)}" y1="${150 + r1 * Math.sin(a)}" x2="${160 + 130 * Math.cos(a)}" y2="${150 + 130 * Math.sin(a)}" class="ttick"/>`; }).join('')}
<text x="34" y="166" class="tlab">−50</text><text x="286" y="166" class="tlab" text-anchor="end">+50</text><text x="160" y="14" class="tlab" text-anchor="middle">0</text>
<g id="tneedle"><line x1="160" y1="150" x2="160" y2="34" class="tnd"/><circle cx="160" cy="150" r="7" class="tnc"/></g></svg>
<div class="tread"><div id="tnote" class="tnote">—</div><div id="tcents" class="tcents"></div><div id="thz" class="muted thz"></div></div></div>
<canvas id="thist" class="thist" aria-hidden="true"></canvas>
<button class="btn full big" id="tgo" data-a="tgo">${TU.on ? '■ Akort aletini kapat' : 'Akort aletini aç'}</button><p class="err" id="terr">${esc(TU.err)}</p>
${T.mode === 'gtr' ? `<div class="row" style="margin-top:6px"><select id="ttun" aria-label="akort düzeni">${TUNINGS.map(x => `<option value="${x[0]}" ${x[0] === T.tun ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>
<div class="row g">${sb('tauto', '1', T.auto ? '1' : '0', 'Otomatik tel')}${sb('tauto', '0', T.auto ? '1' : '0', 'Teli ben seçerim')}</div>
<div class="tstrs">${strs}</div>${cust}
<p class="muted">♪ düğmesi o telin referans sesini çalar (kulakla akort için). Referans: ${sb('trefk', 'pluck', T.ref, 'gitar sesi')} ${sb('trefk', 'tone', T.ref, 'sürekli ton')}</p>` : ''}
${T.mode === 'makam' ? `<p class="muted">Makam modu notayı 12 eşit perdeye göre gösterir ve sapmayı <b>koma</b> cinsinden verir (1 koma ≈ 22,6 sent; Arel-Ezgi-Uzdilek sistemi). Örneğin Segâh, Si’den yaklaşık 1 koma pestir. Ud, bağlama veya ses icrasındaki perdeyi kontrol etmek için kullan; gitarın perdeleri sabit olduğu için gitarda koma ayarlanamaz.</p>` : ''}
${T.mode === 'chr' ? `<p class="muted">Kromatik mod en yakın notayı gösterir: farklı akortlar, kapo sonrası kontrol, şan veya başka çalgılar için.</p>` : ''}
<details class="leg"><summary>Ayarlar ve ipuçları</summary><div class="row"><span>Referans La (A4)</span><b id="ta4v">${T.a4} Hz</b></div><input type="range" id="ta4" min="415" max="466" value="${T.a4}" aria-label="A4 frekansı">
<div class="row g">${[415, 432, 440, 442, 443].map(v => `<button class="btn sm ${T.a4 === v ? 'on' : 'ghost'}" data-a="ta4" data-v="${v}">${v}</button>`).join('')}</div>
<p class="muted">440 Hz standart; bazı orkestralar 442–443 Hz, barok topluluklar 415 Hz kullanır. Mikrofonu gitarın gövdesine 20–40 cm yakın tut, teli tek tek çal ve sesin sönmesini bekleme: ilk bir saniye en net okumadır. Akorda bir teli aşağıdan yukarı doğru sıkmak daha kalıcıdır (biraz pes ayarla, sonra hedefe doğru sık). Naylon teller yeniyken birkaç gün sürekli gevşer.</p></details>
</section>
<section class="card mcard"><div class="row"><h3>Metronom</h3><span class="muted" id="mtime">0:00</span></div>
<div class="mbig"><button class="btn ghost" data-a="mstep" data-d="-1" aria-label="tempo −1">−</button><div><b id="mbpmv">${bpmBig(Mt)}</b><span id="mterm" class="muted">${term(Mt.bpm)}</span></div><button class="btn ghost" data-a="mstep" data-d="1" aria-label="tempo +1">+</button></div>
<input type="range" id="mbpm" min="30" max="300" value="${Mt.bpm}" aria-label="metronom temposu">
<div class="row g">${[-10, -5, 5, 10].map(d => `<button class="btn sm ghost" data-a="mstep" data-d="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}<button class="btn sm" data-a="mtap" id="mtap">Tap tempo</button></div>
<div class="mdots" id="mdots">${dots}</div><div class="muted mbarl"><span id="mbar">${MT.running ? '' : 'Vurguyu değiştirmek için noktalara dokun'}</span></div>
<button class="btn full big" id="mgo" data-a="mgo">${MT.running ? '■ Durdur' : '▶ Başlat'}</button>
<div class="mgrid"><label>Ölçü / usul<select id="mmeter">${meters}</select></label><label>Ses<select id="msnd">${[['click', 'Klasik tık'], ['wood', 'Tahta blok'], ['beep', 'Elektronik'], ['soft', 'Yumuşak']].map(x => `<option value="${x[0]}" ${x[0] === Mt.snd ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></label></div>
${subs}
<details class="leg" ${Mt.tr.on ? 'open' : ''}><summary>Tempo antrenörü ${Mt.tr.on ? '· açık' : ''}</summary><label class="chk"><input type="checkbox" id="mtr" ${Mt.tr.on ? 'checked' : ''}> Her <input class="nin" type="number" id="mtre" min="1" max="32" value="${Mt.tr.every}"> ölçüde <input class="nin" type="number" id="mtrs" min="1" max="20" value="${Mt.tr.step}"> bpm artır, en çok <input class="nin" type="number" id="mtrm" min="40" max="300" value="${Mt.tr.max}"> bpm</label><p class="muted">Yavaş ve temiz başla, metronom seni yavaşça hedef tempoya taşısın.</p></details>
<details class="leg" ${Mt.gap.on ? 'open' : ''}><summary>Sessiz ölçü (iç tempo) ${Mt.gap.on ? '· açık' : ''}</summary><label class="chk"><input type="checkbox" id="mgap" ${Mt.gap.on ? 'checked' : ''}> <input class="nin" type="number" id="mgapp" min="1" max="16" value="${Mt.gap.play}"> ölçü çal, <input class="nin" type="number" id="mgapm" min="1" max="16" value="${Mt.gap.mute}"> ölçü sus</label><p class="muted">Sustuğu ölçülerde tempoyu sen tutarsın; geri döndüğünde metronomla aynı yerde olmalısın.</p></details>
<details class="leg"><summary>Süre ve kayıtlı ayarlar</summary><label class="chk">Otomatik dur: <select id="mstop" class="inl">${[0, 5, 10, 15, 20, 30, 45, 60].map(v => `<option value="${v}" ${v === Mt.stopAfter ? 'selected' : ''}>${v ? v + ' dk sonra' : 'kapalı'}</option>`).join('')}</select></label>
<div class="row g"><input id="mpn" placeholder="Ayar adı (ör. Lágrima)" aria-label="ayar adı" style="flex:1;margin:0"><button class="btn sm" data-a="msave">Kaydet</button></div><div class="mpres">${presets}</div></details>
<p class="muted">Metronom başka ekranlara geçince de çalmaya devam eder; üstteki <b>${bpmLabel(Mt)}</b> rozetine dokunarak buraya dönersin. Akort aleti açıkken metronom tıkları algılamayı bozmaz.</p>
</section></div>`,
    after: () => {
      const T2 = tst(), M2 = mst();
      const sel = $('#ttun'); if (sel) sel.onchange = () => { T2.tun = sel.value; T2.sel = 0; refOff(); G.save(); G.rerender(); };
      const a4 = $('#ta4'); a4.oninput = () => { T2.a4 = +a4.value; $('#ta4v').textContent = T2.a4 + ' Hz'; }; a4.onchange = () => { G.save(); if (TU.refStr >= 0) refOn(TU.refStr); };
      const r = $('#mbpm'); r.oninput = () => { M2.bpm = +r.value; syncBpm(); };
      $('#mmeter').onchange = e => { M2.meter = e.target.value; M2.acc = null; restartIf(); G.save(); G.rerender(); };
      $('#msnd').onchange = e => { M2.snd = e.target.value; G.save(); };
      const gp = $('#mgrp'); if (gp) gp.onchange = () => { M2.grpOnly = gp.checked; G.save(); };
      const num = (id, f) => { const e = $(id); if (e) e.onchange = () => { f(+e.value || 0); G.save(); }; };
      $('#mtr').onchange = e => { M2.tr.on = e.target.checked; G.save(); }; num('#mtre', v => { M2.tr.every = Math.max(1, v); }); num('#mtrs', v => { M2.tr.step = Math.max(1, v); }); num('#mtrm', v => { M2.tr.max = Math.max(40, Math.min(300, v)); });
      $('#mgap').onchange = e => { M2.gap.on = e.target.checked; G.save(); }; num('#mgapp', v => { M2.gap.play = Math.max(1, v); }); num('#mgapm', v => { M2.gap.mute = Math.max(1, v); });
      $('#mstop').onchange = e => { M2.stopAfter = +e.target.value; G.save(); };
      drawTuner(); requestAnimationFrame(drawHist);
    } };
};
function restartIf() { if (MT.running) { metroStop(); metroStart(); } }
G.actions.aview = d => { G.ui.aracV = d.v; const t = $('.tools'); if (t) t.className = 'tools v-' + d.v; document.querySelectorAll('[data-a=aview]').forEach(b => { const on = b.dataset.v === d.v; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); requestAnimationFrame(drawHist); };
G.actions.tgo = () => { if (TU.on) tunerStop(); else tunerStart(); };
G.actions.tmode = d => { tst().mode = d.v; G.save(); G.rerender(); };
G.actions.tauto = d => { tst().auto = d.v === '1'; G.save(); G.rerender(); };
G.actions.tstr = d => { const T = tst(); T.auto = false; T.sel = +d.i; G.save(); document.querySelectorAll('.tstr').forEach(b => b.classList.toggle('sel', +b.dataset.i === T.sel)); document.querySelectorAll('[data-a=tauto]').forEach(b => { const on = b.dataset.v === '0'; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
G.actions.tref = d => { if (TU.refStr === +d.i) refOff(); else refOn(+d.i); };
G.actions.trefk = d => { tst().ref = d.v; G.save(); const s = TU.refStr; G.rerender(); if (s >= 0) refOn(s); };
G.actions.ta4 = d => { tst().a4 = +d.v; G.save(); G.rerender(); };
G.actions.tcus = d => { const T = tst(); const i = +d.i; T.custom[i] = Math.max(28, Math.min(72, T.custom[i] + +d.d)); G.save(); G.rerender(); };
G.actions.mgo = () => { if (MT.running) metroStop(); else metroStart(); };
G.actions.mstep = d => { const Mt = mst(); Mt.bpm = Math.max(30, Math.min(300, Mt.bpm + +d.d)); syncBpm(); };
G.actions.mtap = () => {
  const now = performance.now(); MT.taps = MT.taps.filter(t => now - t < 2500); MT.taps.push(now); if (Aud.init()) Aud.tick(Aud.now() + 0.01, 1, mst().snd);
  if (MT.taps.length >= 2) { const iv = []; for (let i = 1; i < MT.taps.length; i++) iv.push(MT.taps[i] - MT.taps[i - 1]); const avg = iv.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, iv.length); const Mt = mst(); Mt.bpm = Math.max(30, Math.min(300, Math.round(60000 / avg))); syncBpm(); }
  const b = $('#mtap'); if (b) b.textContent = MT.taps.length < 2 ? 'Tap… (bir daha)' : 'Tap tempo';
};
G.actions.macc = d => { const Mt = mst(); const a = accOf(Mt); const i = +d.i; a[i] = a[i] === 0 ? 3 : a[i] - 1; G.save(); const el = document.querySelector(`.mdot[data-i="${i}"]`); if (el) { el.className = el.className.replace(/\bl\d\b/, 'l' + a[i]); el.setAttribute('aria-label', `${i + 1}. vuruş, vurgu ${['sessiz', 'normal', 'grup başı', 'ölçü başı'][a[i]]}`); } };
G.actions.msub = d => { const Mt = mst(); Mt.sub = d.v === 'sw' ? 'sw' : +d.v; G.save(); document.querySelectorAll('[data-a=msub]').forEach(b => { const on = b.dataset.v === d.v; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
G.actions.msave = () => { const Mt = mst(); const n = ($('#mpn').value || '').trim() || `${Mt.bpm} · ${Mt.meter.replace('b', '')}`; Mt.presets.push({ name: n.slice(0, 40), bpm: Mt.bpm, meter: Mt.meter, acc: accOf(Mt).slice(), sub: Mt.sub, grpOnly: Mt.grpOnly }); G.save(); G.rerender(); };
G.actions.mload = d => { const Mt = mst(); const p = Mt.presets[+d.i]; if (!p) return; Object.assign(Mt, { bpm: p.bpm, meter: p.meter, acc: p.acc.slice(), sub: p.sub, grpOnly: p.grpOnly }); G.save(); restartIf(); G.rerender(); };
G.actions.mdel = d => { const Mt = mst(); Mt.presets.splice(+d.i, 1); G.save(); G.rerender(); };
// akort aleti ekrandan çıkınca kapanır (mikrofon açık kalmasın); metronom çalmaya devam eder
G.beforeRender = name => { if (name !== 'arac' && TU.on) tunerStop(); };
})();
