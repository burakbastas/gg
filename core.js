(function () {
'use strict';
const G = window.G = { screens: {}, actions: {}, tracks: {}, ui: { tseg: 'armoni' } };
G.VERSION = 13;
G.CHANGES = [
  [13, '1 Kasım 2026', 'Akort ve metronom modülü: mikrofonla akort (gitar, kromatik, makam/koma), 11 akort düzeni + özel, A4 ayarı, referans ses, kararlılık grafiği; metronom: tap tempo, aksak usuller (5/8, 7/8, 9/8, 10/8), vurgu düzenleme, alt bölüm ve swing, 4 ses, tempo antrenörü, sessiz ölçü, otomatik durma, kayıtlı ayarlar; ekranlar arasında çalmaya devam eder.'],
  [12, '1 Kasım 2026', 'Gerçek naylon gitar sesi; tüm oynatıcılarda sayarak başlama, ±1/±5 tempo ve ölçü döngüsü; 1 dakika geçiş testi; kulakta “notanın tondaki görevi” ve melodi dezesi; klavyede porte ↔ sap; şarkılarda kendi ses dosyanla yavaşlatma ve A–B döngüsü, basitleştirme, sahne görünümü; makamda karar drone’u ve seyir örneği; repertuvarda tempo hedefi ve kendini kaydetme, sıradaki Giuliani formülleri; kısa gün planı.'],
  [11, '1 Kasım 2026', 'Yeni logo ve simgeler; ekranın kenarından kaydırarak geri/ileri (iPhone/iPad ana ekran uygulamasında) ve tarayıcı geri tuşu desteği; telefonda taşan alanlar ve yakınlaştırma sorunu düzeltildi, notalar ekrana sığacak şekilde satırlara bölünüyor; “Kaldığın yerden devam”; armoni dersleri yeniden yazıldı (yarım ses, pop şemaları, modal renkler, karışık tekrar seviyeleri, kendini dene, açık lisanslı kaynaklar).'],
  [10, '1 Kasım 2026', 'Telefon ve tablette ses düzeltmesi (iPhone sessiz düğmesi ve ses kilidi); Ayarlar’a ses testi.'],
  [9, '1 Kasım 2026', 'Arpej oynatıcıda sıradaki akorun hangi tellerden çalınacağı gösteriliyor.'],
  [8, '1 Kasım 2026', 'Repertuvardaki tüm parçalar kendi PDF’iyle açılıyor (derleme yerine).'],
  [7, '1 Kasım 2026', 'Sürüm numarası ve değişiklik listesi.'],
  [6, '1 Kasım 2026', 'Repertuvar PDF’leri uygulama içinde açılıyor.'],
  [5, '1 Kasım 2026', 'Nota görünümü; repertuvarda PDF bağlantıları; Şarkılarım’a arpejle eserler (Bach, Beethoven, Satie...).'],
  [4, '1 Kasım 2026', 'Klasik bölüm (Delcamp seviyeleri, Giuliani 120, sağ/sol el); 1 yıllık eşlik yolu ve kulaktan çıkarma asistanı; yatay akor şemaları.'],
  [3, '1 Kasım 2026', 'Kaydırma antrenörü, ton gruplarına göre geçişler, Barış Manço şarkıları, yeni soru tipleri.'],
  [2, '1 Kasım 2026', 'Makamlar, kulak eğitimi, konu anlatımları, telefon/tablet/bilgisayar tasarımı.'],
  [1, '1 Kasım 2026', 'İlk sürüm: klavye ezberi, armoni, akor geçişleri, arpej.']
];
const $ = s => document.querySelector(s);
const pick = M.pick;

// ---------- durum ----------
function defState() { return { v: 2, set: { nt: 'both', theme: 'auto', dg: 'h', tone: 'smp' }, srs: {}, lv: {}, xp: 0, days: {}, pairs: {}, min1: {}, arp: { p: 0, pat: 0, bpm: 70, snd: 'arp' }, songs: null, pats: [], progs: [], seen: {}, flow: {}, slide: { best: {} }, giu: {}, ex: {}, exo: {}, yol: {} }; }
function migrate(s) {
  const d = defState(); if (!s || typeof s !== 'object') return d;
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  for (const k in d.set) if (s.set[k] === undefined) s.set[k] = d.set[k];
  for (const k in d.arp) if (s.arp[k] === undefined) s.arp[k] = d.arp[k];
  Object.keys(s.days).forEach(k => { if (!s.days[k].sub) s.days[k].sub = {}; });
  s.v = 2; return s;
}
let S = null;
try { S = JSON.parse(localStorage.getItem('gg1') || 'null'); } catch (e) { S = null; }
S = migrate(S);
G.S = S;
G.save = () => { try { localStorage.setItem('gg1', JSON.stringify(S)); } catch (e) {} };
const dayKey = d => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
G.dayKey = dayKey;
function dayObj(k) { k = k || dayKey(); return S.days[k] || (S.days[k] = { away: 0, guitar: 0, sub: {} }); }
function today() { return S.days[dayKey()] || { away: 0, guitar: 0, sub: {} }; }
function dayTotal(k) { const d = S.days[k]; return d ? d.away + d.guitar : 0; }
function streak() { let n = 0; const d = new Date(); if (dayTotal(dayKey(d)) < 600) d.setDate(d.getDate() - 1); while (dayTotal(dayKey(d)) >= 600) { n++; d.setDate(d.getDate() - 1); } return n; }

// ---------- nota etiketleri ----------
const ac = s => s.replace(/#/g, '♯').replace(/b/g, '♭');
const trN = n => M.TRN[n[0]] + ac(n.slice(1)), enN = n => n[0] + ac(n.slice(1));
G.nn = name => { const m = S.set.nt; return m === 'tr' ? trN(name) : m === 'en' ? enN(name) : `${trN(name)}<small>${enN(name)}</small>`; };
G.nnPlain = name => S.set.nt === 'en' ? enN(name) : trN(name);
G.cn = spec => {
  const ch = CHM.baseName(spec); const p = M.chordParse(ch); if (!p) return ch;
  const suf = p.q.replace('dim', '°').replace('aug', '+').replace('m7b5', 'm7♭5');
  const bar = String(spec).includes('|') ? ' <i class="bt">barre</i>' : '';
  const tr = trN(p.root) + suf + (p.bass ? '/' + trN(p.bass) : ''), en = enN(p.root) + suf + (p.bass ? '/' + enN(p.bass) : '');
  const m = S.set.nt;
  return (m === 'tr' ? tr : m === 'en' ? en : `${tr}<small>${en}</small>`) + bar;
};
G.cnPlain = spec => { const ch = CHM.baseName(spec); const p = M.chordParse(ch); if (!p) return ch; const f = S.set.nt === 'en' ? enN : trN; return f(p.root) + p.q.replace('dim', '°') + (p.bass ? '/' + f(p.bass) : ''); };
G.pcl = pc => M.NAT.includes(pc) ? G.nn(M.SHARP[pc]) : `<span class="sh">${G.nn(M.SHARP[pc])}</span><span class="fl">${G.nn(M.FLAT[pc])}</span>`;
G.pcInline = pc => M.NAT.includes(pc) ? G.nn(M.SHARP[pc]) : `${G.nn(M.SHARP[pc])} / ${G.nn(M.FLAT[pc])}`;

// ---------- süre takibi ----------
const CAT = { arac: 'guitar', sap: 'away', teori: 'away', kulak: 'away', makam: 'away', sekil: 'away', gecis: 'guitar', arpej: 'guitar', sarki: 'guitar', akor: 'guitar', klasik: 'guitar' };
let cat = null, lastTouch = Date.now(); G.playing = false;
['pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, () => { lastTouch = Date.now(); }, { passive: true }));
const isShort = () => !!(S.short && S.short[dayKey()]);
const goalMin = () => isShort() ? 10 : 60;
function updTimer() { const d = today(); const el = $('#tmr'); if (el) el.textContent = `${Math.floor((d.away + d.guitar) / 60)}/${goalMin()} dk`; }
setInterval(() => {
  if (!cat || document.hidden) return;
  if (Date.now() - lastTouch > (G.playing ? 600000 : 60000)) return;
  const d = dayObj(); d[CAT[cat] || 'away'] += 5; d.sub[cat] = (d.sub[cat] || 0) + 5; G.save(); updTimer();
}, 5000);

// ---------- aralıklı tekrar ----------
const INT = [0, 20e3, 120e3, 600e3, 86400e3, 3 * 86400e3, 7 * 86400e3];
G.srsUpdate = (k, ok, ms) => {
  const r = S.srs[k] || (S.srs[k] = { box: 0, due: 0, n: 0, t: 0, w: 0 });
  r.n++; r.t = Math.round((r.t * (r.n - 1) + Math.min(ms, 15000)) / r.n);
  if (ok) r.box = r.box === 0 ? 2 : Math.min(6, r.box + 1); else { r.box = 1; r.w++; }
  r.due = Date.now() + INT[r.box];
};
function wpick(arr, wf) { const w = arr.map(wf); let t = w.reduce((a, b) => a + b, 0) * Math.random(); for (let i = 0; i < arr.length; i++) { t -= w[i]; if (t <= 0) return arr[i]; } return arr[arr.length - 1]; }
G.srsPick = (keys, last) => {
  const now = Date.now();
  const info = keys.map(k => ({ k, r: S.srs[k] }));
  const unseen = info.filter(x => !x.r || x.r.n === 0), seen = info.filter(x => x.r && x.r.n > 0);
  const learning = seen.filter(x => x.r.box < 3).length;
  let c = null;
  if (unseen.length && (learning < 6 || !seen.length) && (Math.random() < 0.7 || !seen.length)) c = pick(unseen);
  else {
    const due = seen.filter(x => x.r.due <= now);
    if (due.length) { due.sort((a, b) => a.r.box - b.r.box); c = pick(due.slice(0, Math.max(1, Math.ceil(due.length / 2)))); }
    else if (seen.length) c = wpick(seen, x => 7 - x.r.box);
    else c = pick(unseen);
  }
  if (c.k === last && keys.length > 1) return pick(keys.filter(k => k !== last));
  return c.k;
};
G.seenFrac = keys => keys.filter(k => S.srs[k] && S.srs[k].n > 0).length / keys.length;
G.dueList = () => { const now = Date.now(); return Object.keys(S.srs).filter(k => S.srs[k].n > 0 && S.srs[k].due <= now && S.srs[k].box < 6); };
G.dueCount = () => G.dueList().length;

// ---------- yönlendirme (tarayıcı geçmişiyle bağlı: kaydırma, geri/ileri tuşları) ----------
let stack = [], stopFns = [];
const SNAP = {}; let seq = 0, curI = 0, qEntry = false;
const snap = () => stack.map(x => ({ name: x.name, p: x.p }));
function hPush() { seq++; SNAP[seq] = snap(); curI = seq; qEntry = false; try { history.pushState({ gg: seq }, ''); } catch (e) {} }
function hRepl() { SNAP[curI] = snap(); try { history.replaceState({ gg: curI }, ''); } catch (e) {} }
G.onStop = fn => stopFns.push(fn);
G.ci = secFn => ({ countIn: () => S.set.ci === false ? null : { n: 4, sec: secFn } });
function stopAll() { stopFns.forEach(f => { try { f(); } catch (e) {} }); stopFns = []; G.playing = false; }
G.endSession = () => { if (SES) { clearTimeout(SES.timer); clearTimeout(SES.adv); } SES = null; document.body.classList.remove('in-q'); };
function render(name, p) {
  if (G.beforeRender) G.beforeRender(name);
  stopAll(); G.endSession();
  const sc = G.screens[name](p || {});
  $('#ttl').textContent = sc.t || '';
  document.title = (sc.t ? sc.t + ' · ' : '') + 'Gitar Gelişim';
  $('#app').innerHTML = sc.h;
  cat = sc.cat || null;
  $('#back').hidden = stack.length < 2;
  const root = stack[0].name;
  document.querySelectorAll('[data-a=tab]').forEach(b => { b.classList.toggle('on', b.dataset.t === root); if (b.closest('#nav')) b.setAttribute('aria-current', b.dataset.t === root ? 'page' : 'false'); });
  if (sc.after) sc.after();
  enhance();
  updTimer();
  if (stack.length > 1 || !['home', 'ayar'].includes(root)) { S.last = { st: snap(), t: sc.t || '' }; G.save(); }
}
// ortak oynatıcı denetimleri: her tempo kaydırıcısına ±1/±5 ve sayarak başlama düğmesi
function enhance() {
  document.querySelectorAll('#app input[type=range][aria-label=tempo]').forEach(r => {
    if (r.dataset.enh) return; r.dataset.enh = 1;
    const d = document.createElement('div'); d.className = 'tstep';
    d.innerHTML = ['-5', '-1', '+1', '+5'].map(v => `<button class="btn sm ghost" data-a="bstep" data-d="${v}" aria-label="tempo ${v}">${v.replace('-', '−')}</button>`).join('') + `<button class="btn sm ${S.set.ci === false ? 'ghost' : 'on'} citog" data-a="citog" aria-pressed="${S.set.ci !== false}">Sayarak başla</button>`;
    r.insertAdjacentElement('afterend', d);
  });
}
G.enhance = enhance;
G.actions.bstep = (d, el) => { const r = el.parentElement.previousElementSibling; if (!r) return; r.value = Math.max(+r.min, Math.min(+r.max, +r.value + +d.d)); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); };
G.actions.citog = () => { S.set.ci = S.set.ci === false; G.save(); document.querySelectorAll('.citog').forEach(b => { b.classList.toggle('on', S.set.ci); b.classList.toggle('ghost', !S.set.ci); b.setAttribute('aria-pressed', S.set.ci); }); };
G.actions.resume = () => { const l = S.last; if (!l || !l.st || !l.st.length) return; try { stack = l.st.map(x => ({ name: x.name, p: x.p })); hPush(); const t = stack[stack.length - 1]; render(t.name, t.p); window.scrollTo(0, 0); } catch (e) { G.goTab('home'); } };
G.go = function (name, p, push) {
  if (push !== false) { stack.push({ name, p }); if (qEntry) { qEntry = false; hRepl(); } else hPush(); }
  render(name, p); window.scrollTo(0, 0);
};
G.rerender = () => { const t = stack[stack.length - 1]; const y = window.scrollY; render(t.name, t.p); window.scrollTo(0, y); };
G.replace = (name, p) => { stack[stack.length - 1] = { name, p }; hRepl(); render(name, p); window.scrollTo(0, 0); };
G.goTab = (tab, sub, p) => { stack = [{ name: tab, p: {} }]; if (sub) { hPush(); G.go(sub, p || {}); } else { hPush(); render(tab, {}); window.scrollTo(0, 0); } };
G.modal = html => { const m = $('#modal'); m.innerHTML = `<div class="box" role="dialog" aria-modal="true">${html}<button class="btn ghost full" style="margin-top:14px" data-a="mclose">Kapat</button></div>`; m.hidden = false; };
G.actions.mclose = () => { if (G._recStop) G._recStop(); $('#modal').hidden = true; $('#modal').innerHTML = ''; if (G._modalDirty) { G._modalDirty = false; G.rerender(); } };
G.actions.tab = d => { if (stack.length === 1 && stack[0].name === d.t && !SES) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } G.goTab(d.t); };
G.actions.back = () => { if (stack.length > 1 || SES) history.back(); };
G.actions.go = d => G.go(d.s, d.p ? JSON.parse(d.p) : {});
G.qEntry = () => { if (!qEntry) { hPush(); qEntry = true; } };
const scrollMem = {};
addEventListener('popstate', e => {
  if (!$('#modal').hidden) G.actions.mclose();
  const i = e.state && e.state.gg, sn = i && SNAP[i];
  scrollMem[curI] = window.scrollY;
  if (!sn) { stack = [{ name: 'home', p: {} }]; curI = 0; qEntry = false; render('home', {}); window.scrollTo(0, 0); return; }
  const wasQ = !!SES; curI = i; qEntry = false;
  stack = sn.map(x => ({ name: x.name, p: x.p }));
  const t = stack[stack.length - 1]; render(t.name, t.p);
  window.scrollTo(0, wasQ ? (scrollMem[i] || 0) : (scrollMem[i] || 0));
});
G.initHistory = () => { stack = [{ name: 'home', p: {} }]; seq++; curI = seq; SNAP[seq] = snap(); try { history.replaceState({ gg: seq }, ''); } catch (e) {} render('home', {}); };

// ---------- kenardan kaydırma: ana ekrana eklenmiş uygulamada (tarayıcı kendi hareketini vermediği için) ----------
(function swipe() {
  const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  G.standalone = standalone;
  if (!standalone) return; // Safari/Chrome içinde tarayıcının kendi kenar kaydırması geçmişi kullanır
  const EDGE = 28; let sx = 0, sy = 0, dir = 0, on = false, dx = 0, ind = null;
  const app = () => document.querySelector('#shell');
  addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !$('#modal').hidden) return;
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; dx = 0;
    dir = sx < EDGE ? 1 : sx > innerWidth - EDGE ? -1 : 0; on = false;
  }, { passive: true });
  addEventListener('touchmove', e => {
    if (!dir) return; const t = e.touches[0]; const mx = t.clientX - sx, my = t.clientY - sy;
    if (!on) { if (Math.abs(my) > 14 && Math.abs(my) > Math.abs(mx)) { dir = 0; return; } if (mx * dir > 10) { on = true; if (!ind) { ind = document.createElement('div'); ind.className = 'swind'; document.body.appendChild(ind); } ind.textContent = dir > 0 ? '‹' : '›'; ind.className = 'swind ' + (dir > 0 ? 'l' : 'r'); } else return; }
    dx = Math.max(0, mx * dir); const k = Math.min(1, dx / 90);
    const el = app(); if (el) { el.style.transition = 'none'; el.style.transform = `translateX(${dir * Math.min(dx, 120) * 0.35}px)`; }
    if (ind) { ind.style.opacity = k; ind.classList.toggle('go', k >= 1); }
  }, { passive: true });
  addEventListener('touchend', () => {
    if (!dir || !on) { dir = 0; return; }
    const el = app(); if (el) { el.style.transition = 'transform .18s ease-out'; el.style.transform = ''; }
    if (ind) ind.style.opacity = 0;
    if (dx >= 90) { if (dir > 0) { if (stack.length > 1 || SES) history.back(); } else history.forward(); }
    dir = 0; on = false;
  });
})();

// ---------- seviyeler ----------
G.regTrack = (key, arr) => { arr.forEach(L => { L.track = key; }); G.tracks[key] = arr; };
function ls(id) { return S.lv[id] || (S.lv[id] = { hist: [], un: false, ok: false }); }
function isUnlocked(track, i) { const st = ls(track[i].id); return i === 0 || st.un || st.ok || st.hist.length > 0 || ls(track[i - 1].id).ok; }
function accOf(id) { const h = ls(id).hist; return h.length ? Math.round(h.reduce((a, b) => a + b, 0) / h.length * 100) : null; }
G.nextOf = track => track.find((L, i) => isUnlocked(track, i) && !ls(L.id).ok);
G.passed = track => track.filter(L => ls(L.id).ok).length;
const findLevel = id => { for (const k in G.tracks) { const L = G.tracks[k].find(l => l.id === id); if (L) return L; } return null; };
G.levelList = track => track.map((L, i) => {
  const st = ls(L.id), unl = isUnlocked(track, i), a = accOf(L.id);
  const label = st.ok ? '✓ geçildi' : unl ? (a == null ? 'yeni' : '%' + a) : 'kilitli';
  const prog = st.ok ? 100 : Math.min(100, Math.round(st.hist.slice(-15).reduce((x, y) => x + y, 0) / 14 * 100));
  return `<div class="lv ${st.ok ? 'ok' : unl ? '' : 'lock'}"><div class="lvh"><span class="lvn">${i + 1}</span><div class="lvt"><b>${L.name}</b><div class="muted">${L.desc}</div></div><span class="st">${label}</span></div>${unl && !st.ok && st.hist.length ? `<div class="bar2 thin"><i style="width:${prog}%"></i></div>` : ''}<div class="row g">` +
    (unl ? `<button class="btn sm" data-a="lv" data-id="${L.id}">${st.ok ? 'Tekrar çalış' : st.hist.length ? 'Devam' : 'Başla'}</button>` : `<button class="btn sm ghost" data-a="unlock" data-id="${L.id}">Kilidi aç</button>`) +
    (L.lesson ? `<button class="btn sm ghost" data-a="go" data-s="lesson" data-p='{"id":"${L.id}"}'>Konu</button>` : '') +
    (unl && !st.ok ? `<button class="btn sm link" data-a="know" data-id="${L.id}">Zaten biliyorum</button>` : '') + `</div></div>`;
}).join('');
function startLevel(L) { G.startSession({ title: L.name, count: L.count || 15, gen: L.gen, cat: L.track, lvId: L.id }); }
G.actions.lv = d => { const L = findLevel(d.id); if (L.lesson && !S.seen[L.id]) G.go('lesson', { id: L.id, auto: 1 }); else startLevel(L); };
G.actions.lvgo = d => { S.seen[d.id] = 1; G.save(); startLevel(findLevel(d.id)); };
G.screens.lesson = p => { const L = findLevel(p.id); return { t: L.name, cat: L.track, h: `<article class="card lesson"><div class="tag">Konu anlatımı</div><h2>${L.name}</h2>${L.lesson}</article><div class="row g"><button class="btn" data-a="lvgo" data-id="${L.id}">${p.auto ? 'Anladım, başla' : 'Alıştırmaya başla'}</button></div>` }; };
G.actions.unlock = d => { ls(d.id).un = true; G.save(); G.rerender(); };
G.actions.know = d => { if (confirm('Bu seviyeyi geçmiş sayalım mı? Sonraki seviye açılır.')) { ls(d.id).ok = true; G.save(); G.rerender(); } };
function passCheck(L) {
  const h = ls(L.id).hist; if (h.length < 15) return false;
  if (h.slice(-15).reduce((a, b) => a + b, 0) < 14) return false;
  return L.keys ? G.seenFrac(L.keys()) >= 0.7 : true;
}

// ---------- soru motoru ----------
let SES = null;
G._ses = () => SES;
G.startSession = function (cfg) {
  G.endSession();
  SES = { cfg, i: 0, ok: 0, xp: 0, retry: [], q: null, locked: false, picked: new Set(), t0: 0, timer: null, adv: null, streak: 0 };
  cat = cfg.cat || 'teori';
  $('#ttl').textContent = cfg.title || '';
  document.body.classList.add('in-q'); $('#back').hidden = false; G.qEntry();
  nextQ();
};
function nextQ() {
  if (!SES) return;
  if (SES.i >= SES.cfg.count) return finish();
  let q; const ri = SES.retry.findIndex(r => r.at <= SES.i);
  if (ri >= 0) { q = SES.retry.splice(ri, 1)[0].q; q.retry = true; } else { q = SES.cfg.gen(); q.retry = false; }
  SES.q = q; SES.locked = false; SES.picked = new Set(); SES.seq = [];
  renderQ(); SES.t0 = Date.now();
  if (q.audio) { try { if (Aud.init()) q.audio(); } catch (e) {} }
  if (q.limit) startTimer(q.limit);
}
function gridHtml() {
  let h = '<div class="grid"><span></span>';
  for (let f = 0; f <= 12; f++) h += `<span class="h">${f}</span>`;
  for (let s = 5; s >= 0; s--) { h += `<span class="h">${6 - s}</span>`; for (let f = 0; f <= 12; f++) h += `<button data-a="cell" data-k="${s}:${f}" aria-label="${6 - s}. tel ${f}. perde"></button>`; }
  return h + '</div><button class="btn full" style="margin-top:12px" data-a="gcheck">Kontrol et</button>';
}
function renderQ() {
  const q = SES.q, cfg = SES.cfg;
  let h = `<div class="qwrap"><div class="qtop"><button class="x" data-a="quit" aria-label="Çık">✕</button><div class="bar"><i style="width:${SES.i / cfg.count * 100}%"></i></div><span>${SES.i + 1}/${cfg.count}</span></div>`;
  h += `<div class="qcard">${q.retry ? '<div class="tag">tekrar</div>' : ''}<div class="prompt">${q.prompt}</div>${q.sub ? `<div class="sub">${q.sub}</div>` : ''}${q.visual || ''}`;
  if (q.audio) h += '<button class="btn ghost listen" data-a="qplay">▶ Tekrar dinle</button>';
  if (q.limit) h += '<div class="tbar"><i id="tb"></i></div>';
  if (q.kind === 'grid') h += gridHtml();
  else if (q.kind === 'order') {
    h += `<div class="oseq" id="oseq"><span class="muted">Sırayla dokun (${q.ans.length} adım)</span></div><div class="opts c${q.cols || 3}">` + q.opts.map((o, i) => `<button class="opt" data-a="oopt" data-v="${o.v}"><span class="kb">${i < 9 ? i + 1 : ''}</span>${o.html}</button>`).join('') + '</div><button class="btn ghost sm" style="margin-top:10px" data-a="oundo">↶ Geri al</button>';
  } else {
    const act = q.kind === 'multi' ? 'mopt' : 'opt';
    h += `<div class="opts c${q.cols || 2}">` + q.opts.map((o, i) => `<button class="opt" data-a="${act}" data-v="${o.v}"><span class="kb">${i < 9 ? i + 1 : ''}</span>${o.html}</button>`).join('') + '</div>';
    if (q.kind === 'multi') h += '<button class="btn full" style="margin-top:12px" data-a="mcheck">Kontrol et</button>';
  }
  h += '<div id="fb" aria-live="polite"></div></div><div class="kbhint">Klavye: 1–9 seç · Enter devam' + (q.audio ? ' · R tekrar dinle' : '') + '</div></div>';
  $('#app').innerHTML = h; window.scrollTo(0, 0);
}
function startTimer(limit) {
  const tb = $('#tb');
  if (tb) requestAnimationFrame(() => requestAnimationFrame(() => { tb.style.transition = `width ${limit}ms linear`; tb.style.width = '0%'; }));
  SES.timer = setTimeout(() => {
    if (!SES || SES.locked) return;
    document.querySelectorAll('.opt').forEach(b => { if (SES.q.ans.includes(b.dataset.v)) b.classList.add('ok'); });
    result(false, true);
  }, limit);
}
function result(ok, timeout) {
  SES.locked = true; clearTimeout(SES.timer);
  const q = SES.q, ms = Date.now() - SES.t0;
  if (q.key) G.srsUpdate(q.key, ok, ms);
  if (SES.cfg.lvId && !q.retry) { const st = ls(SES.cfg.lvId); st.hist.push(ok ? 1 : 0); if (st.hist.length > 20) st.hist.shift(); }
  SES.streak = ok ? SES.streak + 1 : 0;
  const gain = ok ? (10 + (ms < 2500 ? 5 : 0) + (SES.streak >= 5 ? 5 : 0)) : 2;
  S.xp += gain; SES.xp += gain;
  if (ok) SES.ok++; else SES.retry.push({ q, at: SES.i + 4 });
  SES.i++;
  const fb = $('#fb');
  if (ok) { fb.innerHTML = `<div class="fb ok">Doğru${SES.streak >= 5 ? ` · ${SES.streak} seri 🔥` : ''}</div>`; SES.adv = setTimeout(nextQ, q.audio ? 900 : 650); }
  else fb.innerHTML = `<div class="fb bad">${timeout ? '<b>Süre doldu.</b> ' : ''}${q.why || ''}<button class="btn" data-a="next">Devam</button></div>`;
  G.save();
}
function finish() {
  const cfg = SES.cfg; let msg = '', nextBtn = '';
  if (cfg.lvId) {
    const L = findLevel(cfg.lvId), st = ls(cfg.lvId);
    if (!st.ok && passCheck(L)) {
      st.ok = true; S.xp += 50; msg = '<div class="win">🎉</div><b>Seviye geçildi!</b> +50 XP';
      const tr = G.tracks[L.track]; const nx = tr[tr.indexOf(L) + 1];
      if (nx) nextBtn = `<button class="btn" data-a="lv" data-id="${nx.id}">Sonraki: ${nx.name}</button>`;
    } else if (!st.ok) { const got = st.hist.slice(-15).reduce((a, b) => a + b, 0); msg = `<div class="muted">Geçmek için son 15 cevabın en az 14’ü doğru olmalı (şu an ${got}/${Math.min(15, st.hist.length)})${L.keys ? ' ve notaların çoğunu görmüş olmalısın' : ''}.</div>`; }
  }
  G.save();
  const pct = SES.i ? Math.round(SES.ok / SES.i * 100) : 0;
  $('#app').innerHTML = `<div class="qwrap"><div class="card sum"><div class="muted">${cfg.title}</div><div class="ring" style="--p:${pct}"><span>${SES.ok}/${SES.i}</span></div><div class="muted">+${SES.xp} XP</div>${msg}<div class="row g" style="justify-content:center">${nextBtn}<button class="btn ${nextBtn ? 'ghost' : ''}" data-a="again">Bir tur daha</button><button class="btn ghost" data-a="exit">Çık</button></div></div></div>`;
  SES.done = true; document.body.classList.remove('in-q');
};
G.actions.again = () => { const c = SES.cfg; G.startSession(c); };
G.actions.exit = () => { G.endSession(); if (qEntry) history.back(); else G.rerender(); };
G.actions.quit = G.actions.exit;
G.actions.next = () => { if (SES && SES.locked) { clearTimeout(SES.adv); nextQ(); } };
G.actions.qplay = () => { if (SES && SES.q && SES.q.audio && Aud.init()) SES.q.audio(); };
G.actions.opt = (d, el) => {
  if (!SES || SES.locked) return;
  const ok = SES.q.ans.includes(d.v);
  el.classList.add(ok ? 'ok' : 'bad');
  if (!ok) document.querySelectorAll('.opt').forEach(b => { if (SES.q.ans.includes(b.dataset.v)) b.classList.add('ok'); });
  result(ok);
};
G.actions.mopt = (d, el) => {
  if (!SES || SES.locked) return;
  if (SES.picked.has(d.v)) { SES.picked.delete(d.v); el.classList.remove('on'); } else { SES.picked.add(d.v); el.classList.add('on'); }
  if (SES.q.n && SES.picked.size === SES.q.n) G.actions.mcheck();
};
G.actions.mcheck = () => {
  if (!SES || SES.locked || !SES.picked.size) return;
  const ans = SES.q.ans; const ok = ans.length === SES.picked.size && ans.every(a => SES.picked.has(a));
  document.querySelectorAll('.opt').forEach(b => { const v = b.dataset.v; b.classList.remove('on'); if (ans.includes(v)) b.classList.add('ok'); else if (SES.picked.has(v)) b.classList.add('bad'); });
  result(ok);
};
function drawSeq() { const el = $('#oseq'); if (!el) return; const m = {}; SES.q.opts.forEach(o => { m[o.v] = o.html; }); el.innerHTML = SES.seq.length ? SES.seq.map((v, i) => `<span class="chip" id="os${i}">${i + 1}. ${m[v]}</span>`).join('') : `<span class="muted">Sırayla dokun (${SES.q.ans.length} adım)</span>`; }
G.actions.oopt = (d, el) => {
  if (!SES || SES.locked || SES.q.kind !== 'order') return; SES.seq = SES.seq || [];
  if (SES.seq.includes(d.v)) return; SES.seq.push(d.v); el.classList.add('on'); el.disabled = true; drawSeq();
  if (SES.seq.length === SES.q.ans.length) {
    const ok = SES.seq.every((v, i) => v === SES.q.ans[i]);
    SES.seq.forEach((v, i) => { const c = $('#os' + i); if (c) c.classList.add(v === SES.q.ans[i] ? 'okc' : 'badc'); });
    result(ok);
  }
};
G.actions.oundo = () => { if (!SES || SES.locked || !SES.seq || !SES.seq.length) return; const v = SES.seq.pop(); document.querySelectorAll('.opt').forEach(b => { if (b.dataset.v === v) { b.classList.remove('on'); b.disabled = false; } }); drawSeq(); };
G.actions.cell = (d, el) => {
  if (!SES || SES.locked) return;
  if (SES.picked.has(d.k)) { SES.picked.delete(d.k); el.classList.remove('on'); } else { SES.picked.add(d.k); el.classList.add('on'); }
};
G.actions.gcheck = () => {
  if (!SES || SES.locked) return;
  const ans = SES.q.ans; let ok = true;
  document.querySelectorAll('.grid button').forEach(b => {
    const k = b.dataset.k, want = ans.includes(k), got = SES.picked.has(k);
    b.classList.remove('on');
    if (want && got) b.classList.add('ok'); else if (want && !got) { b.classList.add('miss'); ok = false; } else if (!want && got) { b.classList.add('bad'); ok = false; }
  });
  SES.q.why = ok ? '' : 'Yeşil: doğru bulduklarını, kırmızı çerçeve: kaçırdıklarını, kırmızı dolu: yanlışlarını gösterir.';
  result(ok);
};
function onKey(e) {
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (e.key === 'Escape') { if (!$('#modal').hidden) G.actions.mclose(); return; }
  if (!SES || SES.done) return;
  if (SES.locked) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); G.actions.next(); } return; }
  if (/^[1-9]$/.test(e.key)) { const b = document.querySelectorAll('.opt')[+e.key - 1]; if (b) b.click(); }
  else if (e.key === 'Enter') { if (SES.q.kind === 'multi') G.actions.mcheck(); else if (SES.q.kind === 'grid') G.actions.gcheck(); }
  else if (e.key === 'r' || e.key === 'R') G.actions.qplay();
}

// ---------- günlük plan ----------
const ROT = [['makam', 'Makamlar'], ['kulak', 'Kulak'], ['sekil', 'Akor şekilleri']];
G.plan = () => { const r = ROT[Math.floor(Date.now() / 864e5) % 3];
  if (isShort()) return [{ k: 'sap', n: 'Klavye tekrarı', m: 3 }, { k: 'teori', n: 'Armoni: bir tur', m: 3 }, { k: 'gecis', n: 'Akor geçişi (1 dakika testi dahil)', m: 4, g: 1 }];
  return [
  { k: 'sap', n: 'Klavye haritası', m: 8 }, { k: 'teori', n: 'Armoni teorisi', m: 10 }, { k: r[0], n: r[1], m: 7 },
  { k: 'gecis', n: 'Akor geçişleri', m: 8, g: 1 }, (Math.floor(Date.now() / 864e5) % 2 ? { k: 'klasik', n: 'Klasik: Giuliani ve teknik', m: 15, g: 1 } : { k: 'arpej', n: 'Arpej ve ritim', m: 15, g: 1 }), { k: 'sarki', n: 'Kulaktan şarkı çıkarma', m: 12, g: 1 }]; };
G.actions.short = () => { S.short = S.short || {}; const k = dayKey(); if (S.short[k]) delete S.short[k]; else S.short[k] = 1; Object.keys(S.short).forEach(x => { if (x < dayKey(new Date(Date.now() - 30 * 864e5))) delete S.short[x]; }); G.save(); G.rerender(); };
G.actions.plan = d => {
  const k = d.k, nx = t => G.nextOf(G.tracks[t]);
  if (k === 'sap') { if (G.dueCount()) return G.actions.review(); const L = nx('sap'); return L ? G.actions.lv({ id: L.id }) : G.goTab('sap'); }
  if (k === 'teori' || k === 'kulak' || k === 'sekil') { const L = nx(k); if (L) return G.actions.lv({ id: L.id }); return G.goTab(k === 'sekil' ? 'akor' : 'teori'); }
  if (k === 'makam') return G.goTab('makam');
  if (k === 'gecis') return G.goTab('akor', 'zincir');
  if (k === 'arpej') return G.goTab('akor', 'arpej');
  if (k === 'sarki') return G.goTab('akor', 'asistan');
  if (k === 'klasik') return G.goTab('klasik');
};

// ---------- ekranlar ----------
const ICON = { // çoğu Lucide (ISC lisansı) — lucide.dev
  sap: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 9.7h20M2 14.3h20M8 5v14M14 5v14"/><circle cx="11" cy="12" r="1.3" fill="currentColor"/>',
  teori: '<path d="M12 5v16"/><path d="M20 19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a5 5 0 0 0-4 2 5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a5 5 0 0 1 4 2 5 5 0 0 1 4-2z"/>',
  makam: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  kulak: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
  sekil: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M5 7.5h14M5 12.5h14M5 17h14M9.7 2.5v19M14.3 2.5v19"/><circle cx="9.7" cy="10" r="1.6" fill="currentColor"/><circle cx="14.3" cy="14.8" r="1.6" fill="currentColor"/>',
  gecis: '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>',
  arpej: '<path d="M2 16c2 0 2-8 4-8s2 8 4 8 2-8 4-8 2 8 4 8 2-4 4-4"/>',
  klasik: '<path d="m11.9 12.1 4.514-4.514"/><path d="M20.1 2.3a1 1 0 0 0-1.4 0l-1.114 1.114A2 2 0 0 0 17 4.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 17.828 7h1.344a2 2 0 0 0 1.414-.586L21.7 5.3a1 1 0 0 0 0-1.4z"/><path d="m6 16 2 2"/><path d="M8.23 9.85A3 3 0 0 1 11 8a5 5 0 0 1 5 5 3 3 0 0 1-1.85 2.77l-.92.38A2 2 0 0 0 12 18a4 4 0 0 1-4 4 6 6 0 0 1-6-6 4 4 0 0 1 4-4 2 2 0 0 0 1.85-1.23z"/>',
  yol: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  sarki: '<path d="M16 5H3"/><path d="M11 12H3"/><path d="M11 19H3"/><path d="M21 16V5"/><circle cx="18" cy="16" r="3"/>'
};
G.icon = k => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[k] || ''}</svg>`;
G.screens.home = function () {
  const d = today(); const plan = G.plan();
  const tot = Math.floor((d.away + d.guitar) / 60);
  let firstOpen = -1;
  const items = plan.map((it, ix) => {
    const v = Math.floor(((d.sub || {})[it.k] || 0) / 60), done = v >= it.m;
    if (!done && firstOpen < 0) firstOpen = ix;
    return `<div class="pi ${done ? 'done' : ''} ${firstOpen === ix ? 'nx' : ''}"><span class="pic">${G.icon(it.k)}</span><div class="pit"><div class="row"><b>${it.n}</b><span class="muted">${v}/${it.m} dk</span></div><div class="bar2 thin ${done ? 'gr' : ''}"><i style="width:${Math.min(100, v / it.m * 100)}%"></i></div></div><button class="btn sm ${done || firstOpen !== ix ? 'ghost' : ''}" data-a="plan" data-k="${it.k}" aria-label="${it.n}: ${done ? 'tamamlandı, tekrar aç' : 'başla'}">${done ? '✓' : 'Başla'}</button></div>`;
  });
  const days = []; for (let i = 6; i >= 0; i--) { const x = new Date(); x.setDate(x.getDate() - i); days.push({ k: dayKey(x), l: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][x.getDay()] }); }
  const week = days.map(x => { const m = Math.floor(dayTotal(x.k) / 60); return `<div class="wd"><div class="wb"><i style="height:${Math.min(100, m / 60 * 100)}%"></i></div><span>${x.l}</span><em>${m || ''}</em></div>`; }).join('');
  const TR = [['sap', 'Klavye'], ['teori', 'Armoni'], ['makam', 'Makam'], ['kulak', 'Kulak'], ['sekil', 'Akor şekli']];
  const prog = TR.map(t => { const a = G.tracks[t[0]], p = G.passed(a); return `<div class="tp"><span>${t[1]}</span><div class="bar2 thin"><i style="width:${p / a.length * 100}%"></i></div><em>${p}/${a.length}</em></div>`; }).join('');
  const due = G.dueCount();
  return { t: 'Gitar Gelişim', h: `<section class="hero"><div class="hs"><div class="hv">${streak()}</div><div class="hl">gün seri</div></div><div class="hs"><div class="hv">${tot}<small>/${goalMin()}</small></div><div class="hl">bugün (dk)</div></div><div class="hs"><div class="hv">${S.xp}</div><div class="hl">XP</div></div></section>
${S.last && S.last.t && S.last.t !== 'Gitar Gelişim' ? `<button class="resume" data-a="resume"><span class="muted">Kaldığın yerden devam</span><b>${S.last.t}</b><span class="ra">›</span></button>` : ''}
${due ? `<button class="banner" data-a="review"><b>Tekrar zamanı:</b> ${due} klavye notası seni bekliyor <span>›</span></button>` : ''}
<div class="two"><div class="card"><div class="row"><h3>Bugünün planı</h3><button class="btn sm ${isShort() ? 'on' : 'ghost'}" data-a="short" aria-pressed="${isShort()}">Kısa gün · 10 dk</button></div><div class="muted" style="margin-bottom:8px">${isShort() ? 'Yoğun günler için: 6 dk gitarsız, 4 dk gitarla. Seri bozulmaz (seri için günde 10 dakika yeter).' : 'Gitarsız 25 dk · gitarla 35 dk'}</div>${isShort() ? `<div class="ptag">Gitar elinde değilken</div>${items.slice(0, 2).join('')}<div class="ptag">Gitar elindeyken</div>${items.slice(2).join('')}` : `<div class="ptag">Gitar elinde değilken</div>${items.slice(0, 3).join('')}<div class="ptag">Gitar elindeyken</div>${items.slice(3).join('')}`}</div>
<div><div class="card"><h3>Son 7 gün</h3><div class="week">${week}</div></div><div class="card"><h3>Seviye ilerlemesi</h3>${prog}</div></div></div><p class="muted center" style="margin-top:8px"><button class="btn sm link" data-a="tab" data-t="ayar">Sürüm ${G.VERSION}</button></p>` };
};
G.screens.teori = function () {
  const sg = G.ui.tseg;
  const seg = `<div class="seg"><button class="btn sm ${sg === 'armoni' ? 'on' : 'ghost'}" data-a="tseg" data-v="armoni">Armoni</button><button class="btn sm ${sg === 'kulak' ? 'on' : 'ghost'}" data-a="tseg" data-v="kulak">Kulak</button></div>`;
  const intro = sg === 'armoni' ? 'Gitar elinde yokken. Her seviyenin bir konu anlatımı var; son 15 cevabın 14’ü doğru olunca sonraki açılır.' : 'Kulaklıkla çalış. Sesler gitar tınısıyla sentezlenir; her soru otomatik çalar.';
  const src = sg === 'armoni' && window.theorySources && theorySources();
  const srcCard = src ? `<details class="card srcs"><summary><b>Kaynaklar</b> <span class="muted">· derslerin dayandığı açık lisanslı kitaplar</span></summary><p class="muted">Konu sırası ve anlatımlar aşağıdaki ücretsiz, açık lisanslı ders kitaplarından yararlanılarak Türkçe ve gitara uyarlanarak yazıldı. Her dersin sonunda ilgili bölümün bağlantısı var.</p><ul class="srcl"><li><a href="https://viva.pressbooks.pub/openmusictheory/" target="_blank" rel="noopener">Open Music Theory</a> (Gotham, Gullings, Hamm, Hughes, Jarvis, Lavengood, Peterson) · CC BY-SA 4.0 · pop şemaları ve modal kalıplar</li><li><a href="https://musictheory.pugetsound.edu/mt21c/" target="_blank" rel="noopener">Music Theory for the 21st-Century Classroom</a> (Robert Hutchinson) · GNU FDL · temel bilgiler, akorlar, kadanslar, ikincil dominant, ödünç akor</li><li><a href="https://milneopentextbooks.org/fundamentals-function-and-form/" target="_blank" rel="noopener">Fundamentals, Function, and Form</a> (Andre Mount) · CC BY 4.0 · fonksiyonel armoni</li></ul><p class="muted">Ders yapısı: kısa “neden”, anlatım, çözümlü örnek, “kendini dene” (önce düşün, sonra cevaba dokun), gitarda uygulama, özet. Sorular kolay tonlarla başlar ve sen ilerledikçe zorlaşır; ara ara karışık tekrar seviyeleri gelir.</p></details>` : '';
  return { t: sg === 'armoni' ? 'Armoni teorisi' : 'Kulak eğitimi', h: `${seg}<p class="muted">${intro}</p><div class="lvgrid">${G.levelList(G.tracks[sg === 'armoni' ? 'teori' : 'kulak'])}</div>${srcCard}` };
};
G.actions.tseg = d => { G.ui.tseg = d.v; G.rerender(); };
function applyTheme() {
  const t = S.set.theme; const r = document.documentElement;
  if (t === 'auto') delete r.dataset.theme; else r.dataset.theme = t;
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#121317' : '#f5f1ea';
}
G.screens.ayar = function () {
  const b = (a, v, cur, l) => `<button class="btn sm ${cur === v ? 'on' : 'ghost'}" data-a="${a}" data-v="${v}">${l}</button>`;
  let seen = 0, mast = 0; Object.keys(S.srs).forEach(k => { if (S.srs[k].n > 0) { seen++; if (S.srs[k].box >= 3) mast++; } });
  return { t: 'Ayarlar', h: `<div class="two"><div><div class="card"><h3>Nota gösterimi</h3><div class="seg">${b('setnt', 'both', S.set.nt, 'Do (C)')}${b('setnt', 'tr', S.set.nt, 'Do Re Mi')}${b('setnt', 'en', S.set.nt, 'C D E')}</div><div class="muted">Önerilen: ikisi yan yana. Akor siteleri C-D-E kullanır.</div></div>
<div class="card"><h3>Görünüm</h3><div class="seg">${b('settheme', 'auto', S.set.theme, 'Otomatik')}${b('settheme', 'dark', S.set.theme, 'Koyu')}${b('settheme', 'light', S.set.theme, 'Açık')}</div><div class="muted">Akor şeması</div><div class="seg">${b('setdg', 'h', S.set.dg, 'Yatay (klavye gibi)')}${b('setdg', 'v', S.set.dg, 'Dikey (akor kitabı)')}</div></div>
<div class="card"><h3>İlerleme</h3><div class="muted">Görülen klavye konumu: ${seen} · pekişen: ${mast} · toplam XP: ${S.xp}</div><div class="row g"><button class="btn sm ghost" data-a="go" data-s="heat">Klavye ısı haritası</button></div></div></div>
<div><div class="card"><h3>Yedek</h3><div class="muted">İlerleme bu cihazın tarayıcısında saklanır. Tarayıcı verisi silinirse kaybolur; ara sıra yedek al. Yedeği başka cihaza yükleyerek ilerlemeni taşıyabilirsin.</div><div class="row g"><button class="btn sm" data-a="exp">Yedeği indir</button><button class="btn sm ghost" data-a="imp">Yedeği yükle</button><input type="file" id="impf" accept=".json,application/json" hidden></div><div class="row g"><button class="btn sm danger" data-a="reset">Her şeyi sıfırla</button></div></div>
<div class="card"><h3>Telefona kurma</h3><div class="muted">GitHub Pages adresini telefonda aç. iPhone: Paylaş → Ana Ekrana Ekle. Android: menü (⋮) → Ana ekrana ekle / Uygulamayı yükle. Sonra internetsiz de çalışır.</div></div>
<div class="card"><h3>Sürüm ${G.VERSION}</h3><div class="muted">${G.CHANGES[0][1]}</div><details class="leg"><summary>Değişiklikler</summary>${G.CHANGES.map(c => `<p class="muted"><b>${c[0]}.</b> ${c[2]}</p>`).join('')}</details></div>
<div class="card"><h3>Ses</h3><div class="muted">Ses gelmiyorsa buradan dene. iPhone’da yan taraftaki sessiz düğmesi kapalıyken de çalması için ayarlandı; yine de gelmezse sesi aç ve ekranı bir kez yenile.</div><div class="muted" style="margin-top:8px">Gitar sesi</div><div class="seg">${b('settone', 'smp', S.set.tone, 'Naylon gitar (kayıt)')}${b('settone', 'syn', S.set.tone, 'Sentez (hafif)')}</div><div class="row g"><button class="btn sm" data-a="sndtest">▶ Sesi test et</button><span class="muted" id="sndst"></span></div><p class="muted" style="font-size:12px;margin-top:8px">Naylon gitar örnekleri: quartertone (Freesound), tonejs-instruments derlemesi, CC BY 3.0.</p></div>
<div class="card"><h3>İpuçları</h3><div class="muted">Bilgisayarda soruları klavyeyle çözebilirsin: 1–9 seçenek, Enter devam, R sesi tekrar çalar. Ses gelmezse telefonun sessiz modunu kapat.</div></div></div></div>`,
    after: () => { const f = $('#impf'); if (f) f.onchange = () => { const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); if (!j || !j.v || !j.set) throw 0; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, migrate(j)); G.save(); alert('Yedek yüklendi.'); G.buildTracks(); applyTheme(); G.rerender(); } catch (e) { alert('Geçersiz yedek dosyası.'); } }; r.readAsText(f.files[0]); }; } };
};
G.actions.setnt = d => { S.set.nt = d.v; G.save(); G.buildTracks(); G.rerender(); };
G.actions.sndtest = () => { Aud.unlock(); if (Aud.ctx) { Aud.strum([-1, 3, 2, 0, 1, 0]); setTimeout(() => { const e = document.querySelector('#sndst'); if (e) e.textContent = 'Ses motoru: ' + ({ running: 'çalışıyor', suspended: 'bekliyor (bir kez daha dokun)', interrupted: 'kesildi', closed: 'kapalı' }[Aud.ctx.state] || Aud.ctx.state) + (Aud.mode === 'smp' ? ' · naylon gitar: ' + ({ ready: 'hazır', loading: 'yükleniyor', failed: 'yüklenemedi, sentez kullanılıyor', none: '—' }[Aud.smpState]) : ''); }, 600); } else { const e = document.querySelector('#sndst'); if (e) e.textContent = 'Bu tarayıcı Web Audio desteklemiyor.'; } };
G.actions.settone = d => { S.set.tone = d.v; Aud.mode = d.v; if (Aud.ctx && d.v === 'smp') Aud.loadSamples(); G.save(); G.rerender(); };
G.actions.setdg = d => { S.set.dg = d.v; CHM.orient = d.v; G.save(); G.rerender(); };
G.actions.settheme = d => { S.set.theme = d.v; G.save(); applyTheme(); G.rerender(); };
G.actions.exp = () => { const b = new Blob([JSON.stringify(S)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'gitar-yedek-' + dayKey() + '.json'; document.body.appendChild(a); a.click(); a.remove(); };
G.actions.imp = () => { const f = $('#impf'); if (f) f.click(); };
G.actions.reset = () => { if (confirm('Tüm ilerleme silinsin mi? Bu geri alınamaz.')) { Object.keys(S).forEach(k => delete S[k]); Object.assign(S, defState()); G.save(); G.initSongs && G.initSongs(); G.rerender(); } };

G.buildTracks = function () {
  G.regTrack('teori', buildTheory({ nn: G.nn, cn: G.cn, pcl: G.pcl, pcInline: G.pcInline, board: G.board, tries: id => (S.lv[id] ? S.lv[id].hist.length : 0) }));
  G.regTrack('makam', G.buildMakam());
  G.regTrack('kulak', G.buildKulak().concat(G.kulakExtra ? G.kulakExtra() : []));
  G.regTrack('sekil', G.buildSekil());
  G.regTrack('sap', G.FLV);
};
G.boot = function () {
  applyTheme(); CHM.orient = S.set.dg; Aud.mode = S.set.tone;
  if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) {} }
  G.buildTracks();
  if (G.initSongs) G.initSongs();
  document.addEventListener('click', e => {
    if (e.target.id === 'modal') { G.actions.mclose(); return; }
    const t = e.target.closest('[data-a]'); if (!t) return;
    const f = G.actions[t.dataset.a]; if (f) f(t.dataset, t, e);
  });
  document.addEventListener('keydown', onKey);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  const vb = document.querySelector('#ver'); if (vb) vb.textContent = 'Sürüm ' + G.VERSION;
  G.initHistory();
  if (S.ver && S.ver < G.VERSION) { const c = G.CHANGES.filter(x => x[0] > S.ver); G.modal(`<h3>Yeni sürüm: ${G.VERSION}</h3>${c.map(x => `<p><b>${x[0]}.</b> ${x[2]}</p>`).join('')}`); }
  S.ver = G.VERSION; G.save();
};
})();
