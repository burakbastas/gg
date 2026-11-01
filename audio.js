(function (g) {
'use strict';
// naylon gitar örnekleri (snd/KAYNAK.txt): MIDI numarasıyla
const SMP = { 40: 'E2', 44: 'Gs2', 47: 'B2', 50: 'D3', 54: 'Fs3', 57: 'A3', 61: 'Cs4', 64: 'E4', 68: 'Gs4', 71: 'B4', 74: 'D5', 78: 'Fs5', 81: 'A5' };
const SMK = Object.keys(SMP).map(Number);
const Aud = {
  ctx: null, cache: {}, out: null, vol: 0.9, smp: {}, smpState: 'none', mode: 'smp', countIn: true,
  unlocked: false,
  // iOS: sessiz düğmeye takılmamak için medya oturumu + sessiz <audio>; Safari'nin ses kilidini dokunuşta aç
  unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    if (!this.el) {
      const sr = 8000, n = 800, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
      const w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
      const el = document.createElement('audio'); el.setAttribute('playsinline', ''); el.setAttribute('x-webkit-airplay', 'deny'); el.loop = true; el.preload = 'auto';
      el.src = URL.createObjectURL(new Blob([b], { type: 'audio/wav' })); this.el = el;
    }
    try { const pr = this.el.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {}
    if (!this.init()) return;
    try { const bs = this.ctx.createBufferSource(); bs.buffer = this.ctx.createBuffer(1, 1, 22050); bs.connect(this.ctx.destination); bs.start(0); } catch (e) {}
    if (this.ctx.state === 'running') this.unlocked = true;
  },
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      this.out = this.ctx.createGain(); this.out.gain.value = this.vol;
      this.out.connect(comp); comp.connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running' && this.ctx.state !== 'closed') { try { this.ctx.resume(); } catch (e) {} }
    if (this.smpState === 'none' && this.mode === 'smp') this.loadSamples();
    return true;
  },
  loadSamples() {
    if (!this.ctx || this.smpState !== 'none' || !window.fetch) return;
    this.smpState = 'loading'; let left = SMK.length, bad = 0;
    const done = () => { if (--left === 0) this.smpState = bad > 3 ? 'failed' : 'ready'; };
    SMK.forEach(m => {
      fetch('snd/' + SMP[m] + '.mp3').then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(b => new Promise((ok, no) => { const p = this.ctx.decodeAudioData(b, ok, no); if (p && p.then) p.then(ok, no); }))
        .then(buf => { this.smp[m] = buf; done(); }).catch(() => { bad++; done(); });
    });
  },
  // en yakın örneği bul (eşitlikte aşağıdakini seç: yukarı kaydırma sesi parlatır)
  near(midi) { let best = null, d = 99; for (const k of SMK) { if (!this.smp[k]) continue; const x = Math.abs(midi - k); if (x < d || (x === d && k < best)) { d = x; best = k; } } return d <= 7 ? best : null; },
  now() { return this.ctx ? this.ctx.currentTime : 0; },
  // Karplus-Strong tel sesi, nota başına bir kez hesaplanır
  buf(midi) {
    if (this.cache[midi]) return this.cache[midi];
    const ctx = this.ctx, sr = ctx.sampleRate;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const N = Math.max(2, Math.round(sr / f));
    const len = Math.floor(sr * 2.4);
    const b = ctx.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    const ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    for (let k = 0; k < 2; k++) for (let i = 0; i < N; i++) ring[i] = 0.5 * (ring[i] + ring[(i + 1) % N]);
    const damp = midi > 70 ? 0.996 : 0.9985;
    let idx = 0, peak = 0.0001;
    for (let i = 0; i < len; i++) {
      const nx = ring[(idx + 1) % N];
      d[i] = ring[idx];
      ring[idx] = 0.5 * (ring[idx] + nx) * damp;
      idx = (idx + 1) % N;
      if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]);
    }
    for (let i = 0; i < len; i++) { d[i] = d[i] / peak * 0.8; if (i > len - 2500) d[i] *= (len - i) / 2500; }
    this.cache[midi] = b;
    return b;
  },
  pluck(midi, t, vel, dur) {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource();
    const k = this.mode === 'smp' && this.smpState !== 'none' ? this.near(midi) : null;
    if (k != null) { s.buffer = this.smp[k]; s.playbackRate.value = Math.pow(2, (midi - k) / 12); vel = (vel == null ? 0.5 : vel) * 1.35; }
    else s.buffer = this.buf(midi);
    const gn = this.ctx.createGain();
    t = t || this.ctx.currentTime;
    gn.gain.setValueAtTime(vel == null ? 0.5 : vel, t);
    if (dur) { gn.gain.setValueAtTime(vel == null ? 0.5 : vel, t + dur); gn.gain.linearRampToValueAtTime(0.0001, t + dur + 0.08); }
    s.connect(gn); gn.connect(this.out);
    s.start(t);
    if (dur) s.stop(t + dur + 0.1);
  },
  click(t, accent) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(), gn = this.ctx.createGain();
    o.frequency.value = accent ? 1600 : 1050;
    gn.gain.setValueAtTime(accent ? 0.32 : 0.18, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(gn); gn.connect(this.out);
    o.start(t); o.stop(t + 0.06);
  },
  // gövdeye / tellere vuruş (perküsif)
  slap(t) {
    if (!this.ctx) return;
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * 0.09);
    const b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
    const gn = ctx.createGain(); gn.gain.value = 0.9;
    s.connect(f); f.connect(gn); gn.connect(this.out); s.start(t);
  },
  strum(fr, t, vel, gap, shift) {
    if (!this.ctx) return;
    t = t || this.ctx.currentTime; let k = 0;
    for (let s = 0; s < 6; s++) {
      if (fr[s] < 0) continue;
      this.pluck(M.OPEN[s] + fr[s] + (shift || 0), t + k * (gap == null ? 0.03 : gap), vel);
      k++;
    }
  },
  seq(midis, t, gap, vel, dur) { if (!this.ctx) return; t = t || this.ctx.currentTime + 0.05; midis.forEach((m, i) => this.pluck(m, t + i * gap, vel, dur)); return t + midis.length * gap; },
  block(midis, t, vel, dur) { if (!this.ctx) return; t = t || this.ctx.currentTime + 0.05; midis.forEach((m, i) => this.pluck(m, t + i * 0.012, vel, dur)); }
};

// ileri okumalı zamanlayıcı: stepFn(i, t, api) -> bir sonraki adıma kadar saniye
// opts.countIn: () => {n: vuruş sayısı, sec: vuruş süresi} — başlamadan önce sayım (ortak oynatıcı ayarı)
function makeScheduler(stepFn, opts) {
  let timer = null, raf = null, next = 0, i = 0, queue = [], ci = 0;
  const api = {
    running: false,
    at(t, fn) { queue.push({ t, fn }); },
    start() {
      if (!Aud.init()) return;
      api.running = true; i = 0; queue = [];
      const cfg = opts && opts.countIn ? opts.countIn() : null; ci = cfg && cfg.n ? cfg.n : 0;
      next = Aud.ctx.currentTime + 0.15;
      timer = setInterval(() => {
        while (next < Aud.ctx.currentTime + 0.12) {
          if (i < ci) { const k = i, t = next; Aud.click(t, k === 0); api.at(t, () => G_cnt(k + 1, ci)); next += cfg.sec(); i++; continue; }
          if (i === ci && ci) { const t = next; api.at(t, () => G_cnt(0, ci)); }
          const dur = stepFn(i - ci, next, api); next += dur; i++;
        }
      }, 25);
      const loop = () => {
        const now = Aud.ctx.currentTime;
        while (queue.length && queue[0].t <= now) queue.shift().fn();
        raf = requestAnimationFrame(loop);
      };
      loop();
    },
    stop() {
      api.running = false;
      clearInterval(timer); if (raf) cancelAnimationFrame(raf);
      timer = null; raf = null; queue = []; G_cnt(0, 0);
    }
  };
  return api;
}
// sayım göstergesi (ekranın ortasında büyük rakam)
function G_cnt(n, tot) {
  let el = document.getElementById('cntov');
  if (!n) { if (el) el.classList.remove('on'); return; }
  if (!el) { el = document.createElement('div'); el.id = 'cntov'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  el.textContent = n; el.classList.add('on');
}

g.Aud = Aud;
// dokunuşların hepsinde (touchend/click aktivasyon sayılır) kilidi açmayı dene; çalışınca bırak
['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, function h() { Aud.unlock(); if (Aud.unlocked) document.removeEventListener(ev, h, true); }, true));
document.addEventListener('visibilitychange', () => { if (!document.hidden && Aud.ctx && Aud.ctx.state !== 'running') { try { Aud.ctx.resume(); } catch (e) {} } });
g.makeScheduler = makeScheduler;
})(window);
