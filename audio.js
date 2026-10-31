(function (g) {
'use strict';
const Aud = {
  ctx: null, cache: {}, out: null, vol: 0.9,
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
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  },
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
    s.buffer = this.buf(midi);
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
function makeScheduler(stepFn) {
  let timer = null, raf = null, next = 0, i = 0, queue = [];
  const api = {
    running: false,
    at(t, fn) { queue.push({ t, fn }); },
    start() {
      if (!Aud.init()) return;
      api.running = true; i = 0; queue = [];
      next = Aud.ctx.currentTime + 0.15;
      timer = setInterval(() => {
        while (next < Aud.ctx.currentTime + 0.12) { const dur = stepFn(i, next, api); next += dur; i++; }
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
      timer = null; raf = null; queue = [];
    }
  };
  return api;
}

g.Aud = Aud;
g.makeScheduler = makeScheduler;
})(window);
