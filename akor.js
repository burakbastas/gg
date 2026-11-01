(function () {
'use strict';
const G = window.G, S = G.S;
const $ = s => document.querySelector(s);
const { pick, shuffle, rnd } = M;
const nn = n => G.nn(n), cn = c => G.cn(c);
const dg = (c, o) => CHM.diagram(c, o);
const gc = s => CHM.getChord(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const acc = s => s.replace(/#/g, '♯').replace(/b/g, '♭');
const QN = { '': 'majör', m: 'minör', '7': 'dominant 7', maj7: 'majör 7', m7: 'minör 7', sus2: 'sus2', sus4: 'sus4', add9: 'add9' };
function chordLong(spec) { const n = CHM.baseName(spec); const p = M.chordParse(n); if (!p) return n; return `${M.TRN[p.root[0]]}${acc(p.root.slice(1))} ${QN[p.q] || p.q}${p.bass ? ', basta ' + M.TRN[p.bass[0]] + acc(p.bass.slice(1)) : ''}`; }
const fretTxt = n => n === 0 ? 'açık' : n + '. perde';
const MKEYS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb'];
const BARRES = ['F#', 'F#m', 'G#m', 'Ab', 'Bb', 'Bbm', 'B', 'Cm', 'C#m', 'Db', 'Eb', 'Ebm', 'Fm', 'Gm', 'F#7', 'C#m7'];

// ---------- menü ----------
G.screens.akor = function () {
  const card = (ic, t, d, attrs) => `<button class="menu" ${attrs}><span class="pic">${G.icon(ic)}</span><span><b>${t}</b><span class="muted">${d}</span></span></button>`;
  const yd = Object.values(S.yol || {}).filter(Boolean).length;
  return { t: 'Akor ve arpej', cat: 'akor', h: `<h2 class="sec">Hedef: kulaktan eşlik</h2><div class="menus">
${card('yol', '1 yıllık eşlik yolu', `12 ay, 48 hedef: el, kulak ve teori adım adım. ${yd} hedef tamamlandı.`, 'data-a="go" data-s="yol"')}
${card('kulak', 'Kulaktan çıkarma asistanı', 'Ton sesi, tondaki olası akorlar, melodi notasından akor bulma ve şarkıya kaydetme.', 'data-a="go" data-s="asistan"')}
</div><h2 class="sec">Gitar elindeyken</h2><div class="menus">
${card('gecis', 'Akor geçişleri', 'Tonlara göre pop geçişleri, sapta kaydırarak akor değiştirme, barre aileleri. Metronom ve hız merdiveni.', 'data-a="go" data-s="zincir"')}
${card('arpej', 'Arpej atölyesi', 'Akor dizisi üzerinde p-i-m-a kalıpları; kendi desenini yaz.', 'data-a="go" data-s="arpej"')}
${card('sarki', 'Şarkılarım', 'Akorları yaz, desen ve tempo seç, eşlik ederken akorlar sırayla aksın.', 'data-a="go" data-s="songs"')}
${card('sekil', 'Akor kütüphanesi', 'Açık, 7’li, sus, slash ve barre akorlar. Akor ara.', 'data-a="go" data-s="lib"')}
${card('sap', 'Barre ve tonlar', 'Her tonda diatonik akorlar, Mi ve La şekli barre perdeleri.', 'data-a="go" data-s="tonlar" data-p=\'{"k":"C","t":"maj"}\'')}
</div><h2 class="sec">Gitarsız: akor şekli oyunları</h2><div class="lvgrid">${G.levelList(G.tracks.sekil)}</div>
<div class="menus" style="margin-top:12px">${card('teori', 'Barre Bulucu', '“Si♭ minör La şekliyle kaçıncı perde?”, “F’den A’ya kaç perde kayarsın?” gibi hızlı sorular.', 'data-a="barregame"')}</div>` };
};

// ---------- kütüphane ----------
let LF = 'all';
G.screens.lib = function () {
  const fams = [['all', 'Tümü']].concat(FAMS, [['bar', 'Barre']]);
  const chips = fams.map(f => `<button class="chipb ${LF === f[0] ? 'on' : ''}" data-a="libf" data-v="${f[0]}">${f[1]}</button>`).join('');
  const list = LF === 'bar' ? BARRES.map(gc) : CHORDS.filter(c => LF === 'all' || c.fam === LF);
  const cards = list.map(c => `<button class="cc" data-a="chord" data-n="${c.n}">${dg(c)}<b>${cn(c.n)}</b></button>`).join('');
  return { t: 'Akor kütüphanesi', cat: 'akor', h: `<div class="search"><input id="cs" placeholder="Akor ara: F#m7, Bb, Cmaj7…" autocomplete="off" autocapitalize="off"><button class="btn sm" data-a="csearch">Göster</button></div>
<div class="chips">${chips}</div><p class="muted">Turuncu halka = akorun kök (bas) notası. Sayı = parmak (1 işaret … 4 serçe).</p><div class="cgrid">${cards}</div>`,
    after: () => { const i = $('#cs'); if (i) i.onkeydown = e => { if (e.key === 'Enter') G.actions.csearch(); }; } };
};
G.actions.libf = d => { LF = d.v; G.rerender(); };
function normName(s) { s = String(s).trim().replace(/♯/g, '#').replace(/♭/g, 'b').replace(/\s+/g, ''); if (!s) return s; return s[0].toUpperCase() + s.slice(1).replace(/^([#b]?)M(?!aj)/, '$1m').replace(/min/i, 'm'); }
G.actions.csearch = () => {
  const v = normName(($('#cs') || {}).value || ''); if (!v) return;
  const c = gc(v); if (c) G.actions.chord({ n: c.n }); else G.modal(`<h3>${esc(v)}</h3><p class="muted">Bu akor için şema üretemedim. Desteklenenler: majör, m, 7, m7, maj7 (her kökte barre), kütüphanedeki sus/add/slash akorlar.</p>`);
};
G.actions.chord = d => {
  const c = gc(d.n); const base = CHM.baseName(c.n); const p = M.chordParse(base);
  const qual = (p.q === 'm' || p.q === 'm7') ? 'm' : (p.q === '' || p.q === '7' || p.q === 'maj7') ? '' : null;
  const fam = [];
  if (qual !== null && !p.bass) {
    const find = (dt) => dt.findIndex(x => { const xp = M.chordParse(x); return M.pcOf(xp.root) === M.pcOf(p.root) && xp.q === qual; });
    M.CIRC.forEach(k => { const i = find(M.diatonic(k, 'maj')); if (i >= 0) fam.push(`${nn(k)} majör: <b>${M.RMAJ[i]}</b>`); });
    MKEYS.forEach(k => { const i = find(M.diatonic(k, 'min')); if (i >= 0) fam.push(`${nn(k)} minör: <b>${M.RMIN[i]}</b>`); });
  }
  const alts = ['E', 'A'].filter(s => CHM.SHAPES[s][p.q] && !p.bass).map(s => { const n = CHM.barreFret(s, M.pcOf(p.root)); const b = CHM.barreChord(s, p.q, n, base + '|' + s); return n > 0 && b.fr.join() !== c.fr.join() ? `<div>${dg(b)}<div class="muted">${s === 'E' ? 'Mi' : 'La'} şekli · ${fretTxt(n)}</div></div>` : ''; }).join('');
  G.modal(`<div class="mhead"><div><h3>${cn(c.n)}</h3><div class="muted">${chordLong(c.n)}</div></div><div class="row"><button class="btn sm" data-a="play" data-n="${c.n}">▶ Çal</button><button class="btn sm ghost" data-a="playarp" data-n="${c.n}">▶ Arpej</button></div></div>
<div class="mbody"><div>${dg(c, { cls: 'lg' })}</div><div><p><b>Notalar:</b> ${M.chordSpelled(base).map(nn).join(' – ')}${p.bass ? ' · bas: ' + nn(p.bass) : ''}</p>${fam.length ? `<p><b>Hangi tonlarda geçer</b><br><span class="muted">${fam.join(' · ')}</span></p>` : ''}${alts ? `<p><b>Başka konumda</b></p><div class="pair">${alts}</div>` : ''}</div></div>`);
};
G.actions.play = d => { const c = gc(d.n); if (c && Aud.init()) Aud.strum(c.fr); };
G.actions.playarp = d => {
  const c = gc(d.n); if (!c || !Aud.init()) return; const t = Aud.now() + 0.05; let k = 0;
  [CHM.bassIdx(c), 3, 4, 5, 4, 3].forEach(s => { if (c.fr[s] >= 0) { Aud.pluck(M.OPEN[s] + c.fr[s], t + k * 0.26, 0.5); k++; } });
};

// ---------- geçiş sayfası ----------
G.ui.zt = G.ui.zt || 'gecis'; G.ui.open = G.ui.open || 'kG';
const pairKey = (a, b) => a + '>' + b;
function pairStars(k) { let s = 0; if (S.pairs[k + '@4']) s = 1; if ((S.pairs[k + '@2'] || 0) >= 70) s = 2; if ((S.pairs[k + '@1'] || 0) >= 80) s = 3; return s; }
const starH = n => `<span class="stars">${'★'.repeat(n)}<i>${'★'.repeat(3 - n)}</i></span>`;
function groupPairs(g) { const r = []; for (let i = 0; i < g.chords.length; i++) for (let j = i + 1; j < g.chords.length; j++) r.push([g.chords[i], g.chords[j]]); return r; }
function groupCard(g) {
  const prs = groupPairs(g); const got = prs.reduce((a, p) => a + pairStars(pairKey(p[0], p[1])), 0);
  const minis = g.chords.map(c => `<div class="mini">${dg(gc(c), { cls: 'mini', root: false })}<b>${G.cnPlain(c)}</b></div>`).join('');
  const tiles = prs.map(p => {
    const t = CHM.transition(gc(p[0]), gc(p[1])); const st = pairStars(pairKey(p[0], p[1]));
    return `<button class="pt s${st}" data-a="go" data-s="trainer" data-p='${JSON.stringify({ a: p[0], b: p[1] })}'><b>${G.cnPlain(p[0])} ⇄ ${G.cnPlain(p[1])}</b><span>${t.stay.length ? t.stay.length + ' ortak parmak' : 'tüm parmaklar yer değiştirir'}</span>${starH(st)}</button>`;
  }).join('');
  const fb = S.flow[g.id];
  return `<div class="card grp"><div class="row"><div><h3>${g.name}</h3><div class="muted">${got}/${prs.length * 3} yıldız${fb ? ` · akış rekoru ${fb} bpm` : ''}</div></div><button class="btn sm" data-a="go" data-s="trainer" data-p='${JSON.stringify({ g: g.id })}'>▶ Akış</button></div>
<div class="minis">${minis}</div><details class="ptd"${G.ui.open === g.id ? ' open' : ''} data-g="${g.id}"><summary>${prs.length} geçiş çalış <span class="muted">· ipucu ve kutular</span></summary><p class="muted">${g.tip}</p><div class="ptiles">${tiles}</div></details></div>`;
}
G.screens.zincir = function () {
  const zt = G.ui.zt;
  const tb = (v, l) => `<button class="btn sm ${zt === v ? 'on' : 'ghost'}" data-a="zt" data-v="${v}">${l}</button>`;
  let h = `<div class="seg">${tb('gecis', 'Farklı akorlar')}${tb('kay', 'Kaydırma')}${tb('barre', 'Barre aileleri')}</div>`;
  if (zt === 'kay') return { t: 'Akor geçişleri', cat: 'gecis', h: h + slideList() };
  const all = GROUPS.filter(g => zt === 'barre' ? g.st === 3 : g.st < 3);
  const tot = all.reduce((a, g) => a + groupPairs(g).length * 3, 0), got = all.reduce((a, g) => a + groupPairs(g).reduce((x, p) => x + pairStars(pairKey(p[0], p[1])), 0), 0);
  h += `<div class="card sumrow"><div><b>${got}</b><span class="muted"> / ${tot} yıldız</span></div><div class="bar2"><i style="width:${tot ? got / tot * 100 : 0}%"></i></div><p class="muted">★ 4 vuruşta kayıt · ★★ 2 vuruşta 70+ bpm · ★★★ her vuruşta 80+ bpm. Bir kutuya dokun, antrenör açılır. “Akış” grubun akorlarını rastgele sırayla çaldırır, şarkıdaki gibi her akora hazırlanırsın.</p></div>`;
  [1, 2, 3].forEach(st => { const gs = all.filter(g => g.st === st); if (!gs.length) return; h += `<h2 class="sec">${STAGES[st]}</h2><div class="lvgrid w">${gs.map(groupCard).join('')}</div>`; });
  return { t: 'Akor geçişleri', cat: 'gecis', h, after: () => document.querySelectorAll('details.ptd').forEach(d => d.addEventListener('toggle', () => { if (d.open) G.ui.open = d.dataset.g; })) };
};
G.actions.zt = d => { G.ui.zt = d.v; G.rerender(); };

// ---------- geçiş antrenörü (çift ya da akış) ----------
let sch = null;
const TS = { bpm: 60, beats: 4, ladder: false };
function stopSch(record) {
  const wasLadder = sch && sch.running && TS.ladder && sch.lad;
  if (sch) { sch.stop(); } const s = sch; sch = null; G.playing = false;
  const b = $('#play'); if (b) b.textContent = '▶ Başla';
  if (record && wasLadder && s) {
    const top = Math.max(s.lad.start, TS.bpm - 4); TS.bpm = s.lad.start;
    s.lad.save(top);
    const r = $('#bpm'); if (r) { r.value = TS.bpm; $('#bpmv').textContent = TS.bpm + ' bpm'; }
    G.modal(`<h3>Hız merdiveni</h3><p class="big">${top} bpm</p><p class="muted">Rahat çaldığın son tempo (${TS.beats} vuruşta bir geçiş). Kaydedildi. Yarın bunu geçmeyi dene.</p>`);
  }
}
function ladBtn() { return `<button class="btn sm ${TS.ladder ? 'on' : 'ghost'}" data-a="tlad">Hız merdiveni: ${TS.ladder ? 'açık' : 'kapalı'}</button>`; }
G.actions.tlad = (d, el) => { TS.ladder = !TS.ladder; el.outerHTML = ladBtn(); };
G.screens.trainer = function (p) {
  const grp = p.g ? GROUPS.find(g => g.id === p.g) : null;
  const list = grp ? grp.chords : [p.a, p.b];
  const key = grp ? null : pairKey(p.a, p.b);
  const a = gc(list[0]), b = gc(list[1]); const t = CHM.transition(a, b);
  const seg = [4, 2, 1].map(n => `<button class="btn sm ${TS.beats === n ? 'on' : 'ghost'}" data-a="tbeats" data-v="${n}">${n} vuruş</button>`).join('');
  return { t: grp ? grp.name + ' · akış' : 'Geçiş antrenörü', cat: 'gecis',
    h: `<div class="two"><div class="card"><div class="pair big2"><div id="da" class="cur"><span class="muted">Şimdi</span><div id="dad">${dg(a, { marks: CHM.marksFor(t, 'a'), cls: 'lg' })}</div><b id="dan">${cn(a.n)}</b></div><div id="db"><span class="muted">Sıradaki</span><div id="dbd">${dg(b, { marks: CHM.marksFor(t, 'b'), cls: 'lg' })}</div><b id="dbn">${cn(b.n)}</b></div></div>
<div class="legend"><span><i class="lg lst"></i>yerinde kalır</span><span><i class="lg llv"></i>kalkar</span><span><i class="lg lar"></i>yeni basılır</span></div>
${grp ? `<div class="chips" style="margin-top:10px">${list.map(c => `<span class="chip">${cn(c)}</span>`).join('')}</div><p class="muted">Akorlar rastgele sırayla gelir. Sıradaki akoru önceden görürsün; son vuruşta el yola çıkmış olmalı.</p>` : ''}</div>
<div><div class="card"><div id="hint" class="hint">Hazır</div>
<div class="row"><span>Tempo</span><b id="bpmv">${TS.bpm} bpm</b></div><input type="range" id="bpm" min="40" max="180" value="${TS.bpm}" aria-label="tempo">
<div class="muted">Akor başına vuruş</div><div class="seg">${seg}</div>
<div class="row g"><button class="btn" id="play" data-a="tplay" data-k="${key || ''}" data-g="${grp ? grp.id : ''}" data-l='${JSON.stringify(list)}'>▶ Başla</button>${key ? `<button class="btn ghost" data-a="tclean" data-k="${key}">Temiz yaptım ✓</button>` : ''}${ladBtn()}</div>
<p class="muted" id="best" style="margin-top:8px"></p></div>
${key ? `<div class="card"><h3>1 dakika geçiş</h3><p class="muted">60 saniye boyunca iki akor arasında olabildiğince çok <b>temiz</b> geçiş yap; her akoru bir kez çal, sonra diğerine geç. Ekrana dokunmana gerek yok: süre bitince zil çalar, sonra kaç geçiş yaptığını girersin.</p><div class="m1t" id="m1t">1:00</div><button class="btn full" id="m1b" data-a="m1go" data-k="${key}">▶ 60 saniye başlat</button><div id="m1h">${m1Hist(key)}</div></div>` : ''}
<div class="card"><h3>Nasıl çalışılır</h3><p class="muted">1. 4 vuruşla, 50–60 bpm’de temiz çal. Temizse “Temiz yaptım”a bas.<br>2. Hız merdivenini aç: her 4 ölçüde tempo 4 bpm artar, sen sadece çalarsın. Yetişemediğin an Durdur’a bas; rahat çaldığın son tempo kaydedilir.<br>3. 2 vuruşa, sonra her vuruşta bir geçişe in.</p></div></div></div>`,
    after: () => {
      const r = $('#bpm'); if (r) r.oninput = () => { TS.bpm = +r.value; $('#bpmv').textContent = TS.bpm + ' bpm'; };
      showBest(key, grp); G.onStop(() => stopSch(false));
    } };
};
// ---------- 1 dakika geçiş (JustinGuitar yöntemi) ----------
let m1 = null;
function m1Hist(key) {
  const h = (S.m1 && S.m1[key]) || []; if (!h.length) return '<p class="muted" style="margin-top:8px">Henüz kayıt yok. Başlangıçta 20–30 geçiş normaldir; 60’a ulaşınca geçiş otomatikleşmiş demektir.</p>';
  const best = Math.max(...h.map(x => x.n)), last = h.slice(-10), mx = Math.max(60, best);
  return `<div class="m1bars">${last.map(x => `<div class="${x.n === best ? 'b' : ''}"><i style="height:${Math.max(6, x.n / mx * 100)}%"></i><em>${x.n}</em><span>${x.d.slice(8, 10)}.${x.d.slice(5, 7)}</span></div>`).join('')}</div><p class="muted">Rekor: <b>${best}</b> geçiş · son ${last.length} deneme</p>`;
}
function m1Stop() { if (m1) { clearInterval(m1.t); m1 = null; } const b = $('#m1b'); if (b) b.textContent = '▶ 60 saniye başlat'; const t = $('#m1t'); if (t) { t.textContent = '1:00'; t.classList.remove('on', 'go'); } }
G.actions.m1go = d => {
  if (m1) { m1Stop(); return; }
  if (!Aud.init()) return; if (sch && sch.running) stopSch(false);
  const key = d.k; let left = 63; const el = $('#m1t');
  const t0 = Aud.now(); [0, 1, 2].forEach(i => Aud.click(t0 + 0.1 + i, false)); Aud.click(t0 + 3.1, true);
  m1 = { t: setInterval(() => {
    left--; const e = $('#m1t'); if (!e) { m1Stop(); return; }
    if (left > 60) { e.textContent = String(left - 60); e.classList.add('on'); return; }
    e.classList.add('go'); e.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (left <= 3 && left > 0) Aud.click(Aud.now() + 0.02, false);
    if (left <= 0) { const n = Aud.now(); [0, 0.15, 0.3].forEach(x => Aud.click(n + x, true)); m1Stop(); m1Ask(key); }
  }, 1000) };
  const b = $('#m1b'); if (b) b.textContent = '■ Vazgeç'; if (el) { el.textContent = '3'; el.classList.add('on'); }
  G.onStop(m1Stop);
};
G.m1Ask = key => m1Ask(key);
function m1Ask(key) {
  const h = (S.m1 && S.m1[key]) || []; const v = h.length ? h[h.length - 1].n : 20;
  G.modal(`<h3>Kaç geçiş yaptın?</h3><p class="muted">Sadece temiz geçişleri say (tüm teller net duyulmalı).</p><div class="m1in"><button class="btn ghost" data-a="m1d" data-d="-5">−5</button><button class="btn ghost" data-a="m1d" data-d="-1">−1</button><input id="m1v" type="number" inputmode="numeric" min="0" max="200" value="${v}" aria-label="geçiş sayısı"><button class="btn ghost" data-a="m1d" data-d="1">+1</button><button class="btn ghost" data-a="m1d" data-d="5">+5</button></div><button class="btn full" data-a="m1save" data-k="${key}">Kaydet</button>`);
}
G.actions.m1d = d => { const i = $('#m1v'); i.value = Math.max(0, Math.min(200, (+i.value || 0) + +d.d)); };
G.actions.m1save = d => {
  const n = Math.max(0, Math.min(200, +$('#m1v').value || 0)); S.m1 = S.m1 || {}; const h = S.m1[d.k] = S.m1[d.k] || [];
  const prev = h.length ? Math.max(...h.map(x => x.n)) : 0; h.push({ d: G.dayKey(), n }); if (h.length > 60) h.shift(); S.xp += 10; G.save(); G.actions.mclose();
  const e = $('#m1h'); if (e) e.innerHTML = m1Hist(d.k);
  if (n > prev && prev) G.modal(`<h3>Yeni rekor</h3><p class="big">${n} geçiş</p><p class="muted">Önceki rekorun ${prev}.</p>`);
};
function showBest(key, grp) {
  const el = $('#best'); if (!el) return;
  if (grp) { el.textContent = S.flow[grp.id] ? `Akış rekorun: ${S.flow[grp.id]} bpm` : 'Henüz akış kaydın yok. Hız merdiveniyle dene.'; return; }
  const v = [4, 2, 1].map(n => { const x = S.pairs[key + '@' + n]; return x ? `${n} vuruş: ${x} bpm` : null; }).filter(Boolean);
  el.textContent = v.length ? 'Rekorların → ' + v.join(' · ') : 'Henüz kayıt yok. 50 bpm’den başla.';
}
G.actions.tbeats = d => { TS.beats = +d.v; document.querySelectorAll('[data-a=tbeats]').forEach(b => { const on = +b.dataset.v === TS.beats; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
G.actions.tclean = d => { const k = d.k + '@' + TS.beats; if (!S.pairs[k] || S.pairs[k] < TS.bpm) S.pairs[k] = TS.bpm; S.xp += 10; G.save(); showBest(d.k); };
function setPair(cur, nxt) {
  const t = CHM.transition(cur, nxt);
  const ad = $('#dad'); if (!ad) return;
  ad.innerHTML = dg(cur, { marks: CHM.marksFor(t, 'a'), cls: 'lg' }); $('#dan').innerHTML = cn(cur.n);
  $('#dbd').innerHTML = dg(nxt, { marks: CHM.marksFor(t, 'b'), cls: 'lg' }); $('#dbn').innerHTML = cn(nxt.n);
}
G.actions.tplay = d => {
  if (sch && sch.running) { stopSch(true); return; }
  const list = JSON.parse(d.l).map(gc); const flow = !!d.g;
  const seq = [0, 1]; const nextIdx = i => { if (!flow) return 1 - i; let n; do { n = M.rnd(list.length); } while (n === i); return n; };
  G.playing = true; $('#play').textContent = '■ Durdur';
  let bar = -1;
  sch = makeScheduler((i, t, api) => {
    const beat = i % TS.beats;
    if (beat === 0) { bar++; if (bar > 0) { seq[0] = seq[1]; seq[1] = nextIdx(seq[0]); }
      if (TS.ladder && bar > 0 && bar % 4 === 0) { TS.bpm = Math.min(180, TS.bpm + 4); api.at(t, () => { const r = $('#bpm'); if (r) { r.value = TS.bpm; $('#bpmv').textContent = TS.bpm + ' bpm'; } }); } }
    const cur = list[seq[0]], nxt = list[seq[1]];
    Aud.click(t, beat === 0);
    if (beat === 0) Aud.strum(cur.fr, t, 0.28, 0.025);
    const b0 = bar;
    api.at(t, () => {
      const hint = $('#hint'); if (!hint) return;
      if (beat === 0) setPair(cur, nxt);
      const prep = TS.beats > 1 ? beat === TS.beats - 1 : true;
      hint.classList.toggle('prep', prep && TS.beats > 1);
      hint.textContent = TS.beats > 1 && prep ? `HAZIRLAN → ${G.cnPlain(nxt.n)}` : `ŞİMDİ: ${G.cnPlain(cur.n)}${b0 >= 0 && TS.ladder ? ' · ' + TS.bpm + ' bpm' : ''}`;
    });
    return 60 / TS.bpm;
  }, G.ci(() => 60 / TS.bpm));
  sch.lad = TS.ladder ? { start: TS.bpm, save: top => {
    if (flow) { if (!S.flow[d.g] || S.flow[d.g] < top) S.flow[d.g] = top; }
    else { const k = d.k + '@' + TS.beats; if (!S.pairs[k] || S.pairs[k] < top) S.pairs[k] = top; }
    S.xp += 15; G.save(); showBest(flow ? null : d.k, flow ? GROUPS.find(g => g.id === d.g) : null);
  } } : null;
  sch.start();
};

// ---------- kaydırma: aynı şekli sapta kaydırarak akor değiştirme ----------
const SL = {
  E: { n: 'Mi şekli barre', d: 'Kök 6. telde. Tam akor; F = 1, G = 3, A = 5, B = 7, C = 8, D = 10.' },
  A: { n: 'La şekli barre', d: 'Kök 5. telde. B♭ = 1, C = 3, D = 5, E = 7, F = 8, G = 10.' },
  EA: { n: 'Mi + La (en az hareket)', d: 'Her akor için ele en yakın şekil seçilir. Barre’lı pop çalmanın standart yolu: el 2-3 perdelik bölgede kalır.' },
  P6: { n: 'Power chord · 6. tel', d: 'Barresiz, 3 parmak. Majör/minör farkı yok; rock-pop eşlikte en hızlı kaydırma.' },
  P5: { n: 'Power chord · 5. tel', d: 'Barresiz, 5. telde kök. 6. tel şekliyle birleşince her akor elinin altında.' },
  T3: { n: 'Üst 3 tel mini akor', d: 'Barresiz, 1-2 parmak. Kök 1. telde (6. tel ile aynı perde). Arpej ve süsleme için çok hafif.' }
};
const SLX = [
  { id: 'x1', name: 'Basamak: F – G – A – B', ch: ['F', 'G', 'A', 'B'], sh: 'E', note: 'Mi şekli barre 1’den 3’e, 5’e, 7’ye kayar. Parmaklar hiç açılmaz, el tek parça kayar.' },
  { id: 'x2', name: 'Minör basamak: Fm – Gm – Am – Bm', ch: ['Fm', 'Gm', 'Am', 'Bm'], sh: 'E', note: 'Aynı kayma, minör şekille.' },
  { id: 'x3', name: 'La şekli basamak: B♭ – C – D – E', ch: ['Bb', 'C', 'D', 'E'], sh: 'A', note: '5. tel kökte aynı mantık: 1 → 3 → 5 → 7.' },
  { id: 'x4', name: 'Kromatik: F – F♯ – G – A♭ – A', ch: ['F', 'F#', 'G', 'Ab', 'A'], sh: 'E', note: 'Her adım 1 perde. Kaymayı kontrollü yapmayı öğretir.' },
  { id: 'x5', name: 'i–VII–VI: Am – G – F', ch: ['Am', 'G', 'F'], sh: 'E', note: 'Türkçe pop ve rock’un inen klasik kalıbı: 5 → 3 → 1.' },
  { id: 'x6', name: 'Andaluz: Am – G – F – E', ch: ['Am', 'G', 'F', 'E'], sh: 'E', note: 'Nihavent/Hicaz rengi. E son adımda boş tel (0) olur.' },
  { id: 'x7', name: 'I–IV–V: A – D – E', ch: ['A', 'D', 'E'], sh: 'EA', note: 'Tek şekille kaydırmak uzun atlama ister; Mi + La karışık çalınca el 5. perde civarında kalır.' },
  { id: 'x8', name: 'I–V–vi–IV: G – D – Em – C', ch: ['G', 'D', 'Em', 'C'], sh: 'EA', note: 'Pop’un en sık dizilimi, barre ile tek bölgede.' },
  { id: 'x9', name: 'vi–IV–I–V: Am – F – C – G', ch: ['Am', 'F', 'C', 'G'], sh: 'EA', note: 'Minörle başlayan pop kalıbı.' },
  { id: 'x10', name: 'Nihavent: Am – Dm – E – Am', ch: ['Am', 'Dm', 'E', 'Am'], sh: 'EA', note: 'Am ve Dm aynı perdede (5), E bir perde geride.' },
  { id: 'x11', name: 'Kürdi (Mi): Em – F – G – F', ch: ['Em', 'F', 'G', 'F'], sh: 'E', note: 'Mi Kürdi’nin karakteristik yarım ses kayması: 0 → 1 → 3 → 1.' },
  { id: 'x12', name: 'Power: E – G – A – C', ch: ['E', 'G', 'A', 'C'], sh: 'P6', note: '0 → 3 → 5 → 8. Rock eşliğin temeli.' },
  { id: 'x13', name: 'Power: A – C – D – F', ch: ['A', 'C', 'D', 'F'], sh: 'P5', note: '5. telde aynı kalıp.' },
  { id: 'x14', name: 'Mini akor: C – F – G – C', ch: ['C', 'F', 'G', 'C'], sh: 'T3', note: 'Üst üç telde kayan hafif akorlar; arpej yaparken bas olarak boş telleri ekleyebilirsin.' }
];
const PSH = { P6: { rel: [0, 2, 2, -1, -1, -1], fg: [1, 3, 4, 0, 0, 0], openPc: 4 }, P5: { rel: [-1, 0, 2, 2, -1, -1], fg: [0, 1, 3, 4, 0, 0], openPc: 9 } };
const T3S = { '': { rel: [-1, -1, -1, 1, 0, 0], fg: [0, 0, 0, 2, 1, 1] }, m: { rel: [-1, -1, -1, 0, 0, 0], fg: [0, 0, 0, 1, 1, 1] }, openPc: 4 };
function slideChord(name, sh, prev) {
  const p = M.chordParse(name); const pc = M.pcOf(p.root);
  const tri = (p.q === 'm' || p.q === 'm7') ? 'm' : '';
  const cands = [];
  const add = (s, rel, fg, openPc) => { const b = M.mod(pc - openPc, 12); [b, b + 12].filter(n => n + Math.max.apply(null, rel) <= 15).forEach(n => cands.push({ s, n, rel, fg })); };
  if (sh === 'E' || sh === 'A' || sh === 'EA') ['E', 'A'].filter(s => sh === 'EA' || s === sh).forEach(s => { const d = CHM.SHAPES[s][p.q] || CHM.SHAPES[s][tri]; add(s, d.rel, d.fg, CHM.SHAPES[s].openPc); });
  else if (sh === 'T3') add('T3', T3S[tri].rel, T3S[tri].fg, T3S.openPc);
  else add(sh, PSH[sh].rel, PSH[sh].fg, PSH[sh].openPc);
  let best;
  if (prev == null) { cands.sort((x, y) => x.n - y.n || (x.s === 'E' ? -1 : 1)); best = cands[0]; }
  else { cands.sort((x, y) => Math.abs(x.n - prev) - Math.abs(y.n - prev) || x.n - y.n); best = cands[0]; }
  const n = best.n;
  return { n: name, sh: best.s, fret: n, fr: best.rel.map(x => x < 0 ? -1 : x + n), fg: n === 0 ? best.rel.map((x, i) => x > 0 ? Math.max(1, best.fg[i] - 1) : 0) : best.fg.slice() };
}
function slidePath(ch, sh) { let prev = null; return ch.map(c => { const r = slideChord(c, sh, prev); prev = r.fret; return r; }); }
const shN = s => ({ E: 'Mi şekli', A: 'La şekli', P6: 'power 6. tel', P5: 'power 5. tel', T3: 'üst 3 tel' })[s];
const fpos = n => n === 0 ? 'boş tel' : n + '. perde';
function slideList() {
  const cards = SLX.map(x => { const path = slidePath(x.ch, x.sh); const b = S.slide.best[x.id];
    return `<button class="menu sx" data-a="go" data-s="slide" data-p='${JSON.stringify({ id: x.id })}'><span><b>${x.name}</b><span class="muted">${SL[x.sh].n}</span><span class="frets">${path.map((c, i) => `${i ? `<em>${c.fret - path[i - 1].fret > 0 ? '+' : ''}${c.fret - path[i - 1].fret}</em>` : ''}<span>${G.cnPlain(c.n)}<i>${c.fret}</i></span>`).join('')}</span>${b ? `<span class="muted">rekor ${b} bpm</span>` : ''}</span></button>`; }).join('');
  return `<div class="intro"><p><b>Kaydırma:</b> sol el şeklini hiç bozmadan sapta ilerleyerek akor değiştirirsin. Şeklin adı kök telindeki notadan gelir: Mi şeklinde 6. tel, La şeklinde 5. tel. Akorun perdesini bilirsen her tonda çalarsın. Kaymadan önce parmak baskısını gevşet, tellerden kaldırma, yeni perdede tekrar bas.</p></div>
<h2 class="sec">Alıştırmalar</h2><div class="menus">${cards}</div>
<div class="card" style="margin-top:12px"><h3>Kendi dizini kaydır</h3><p class="muted">Akorları yaz (majör, m, 7, m7). Örnek: <code>C Am F G</code></p><div class="search"><input id="slc" placeholder="C Am F G" autocapitalize="off" autocomplete="off"><button class="btn sm" data-a="slcustom">Aç</button></div><div id="slerr" class="err"></div></div>`;
}
G.actions.slcustom = () => {
  const r = G.parseBars(($('#slc') || {}).value || ''); const ok = r.bars.filter(b => { const p = M.chordParse(b); return p && ['', 'm', '7', 'm7'].includes(p.q) && !p.bass; });
  if (r.bad.length || !ok.length || ok.length !== r.bars.length) { $('#slerr').textContent = 'Sadece majör, m, 7, m7 akorlar (slash ve sus olmadan).'; return; }
  G.go('slide', { custom: ok.map(CHM.baseName) });
};
const SLS = { bpm: 60, beats: 4 };
let ssch = null;
function stopSlide(rec) {
  const lad = ssch && ssch.running && ssch.lad; if (ssch) ssch.stop(); const s = ssch; ssch = null; G.playing = false;
  const b = $('#splay'); if (b) b.textContent = '▶ Başla';
  if (rec && lad && s) { const top = Math.max(s.lad.start, SLS.bpm - 4); SLS.bpm = s.lad.start; s.lad.save(top); const r = $('#sbpm'); if (r) { r.value = SLS.bpm; $('#sbpmv').textContent = SLS.bpm + ' bpm'; } G.modal(`<h3>Hız merdiveni</h3><p class="big">${top} bpm</p><p class="muted">Rahat kaydırdığın son tempo kaydedildi.</p>`); }
}
G.screens.slide = function (p) {
  const x = p.custom ? { id: 'custom', name: 'Kendi dizin', ch: p.custom, sh: p.sh || 'EA', note: '' } : SLX.find(e => e.id === p.id);
  const sh = p.sh || x.sh, tr = p.tr || 0;
  const ch = x.ch.map(c => M.transposeName(c, tr));
  const path = slidePath(ch, sh);
  const shBtns = Object.keys(SL).map(k => `<button class="chipb ${k === sh ? 'on' : ''}" data-a="slsh" data-v="${k}">${SL[k].n}</button>`).join('');
  const seqH = path.map((c, i) => `${i ? `<em class="arr">${c.fret - path[i - 1].fret > 0 ? '+' : ''}${c.fret - path[i - 1].fret}</em>` : ''}<span class="chip ${i === 0 ? 'cur' : ''}" id="sc${i}">${G.cnPlain(c.n)} · ${c.fret}</span>`).join('');
  const seg = [4, 2, 1].map(n => `<button class="btn sm ${SLS.beats === n ? 'on' : 'ghost'}" data-a="slbeats" data-v="${n}">${n} vuruş</button>`).join('');
  G.ui.slide = { p, path, x };
  const best = S.slide.best[x.id];
  return { t: x.name, cat: 'gecis', h: `<div class="card"><div class="chips">${shBtns}</div><p class="muted">${SL[sh].d}${x.note ? ' ' + x.note : ''}</p>
<div class="row"><div class="slseq">${seqH}</div><div class="row"><button class="btn sm ghost" data-a="sltr" data-v="-1" aria-label="yarım ses aşağı">− ½</button><span class="muted">Ton ${tr > 0 ? '+' : ''}${tr}</span><button class="btn sm ghost" data-a="sltr" data-v="1" aria-label="yarım ses yukarı">+ ½</button></div></div>
<div class="fbwrap scroll" id="slb">${slideBoard(path[0], path[1 % path.length])}</div>
<div class="legend"><span><i class="lg k"></i>şimdi (parmak no.)</span><span><i class="lg n"></i>sıradaki</span></div></div>
<div class="two"><div class="card"><div class="pair big2"><div class="cur"><span class="muted">Şimdi</span><div id="sdn">${slideCardH(path[0])}</div></div><div><span class="muted">Sıradaki</span><div id="sdx">${slideCardH(path[1 % path.length], path[0])}</div></div></div></div>
<div class="card"><div id="shint" class="hint">Hazır</div><div class="row"><span>Tempo</span><b id="sbpmv">${SLS.bpm} bpm</b></div><input type="range" id="sbpm" min="40" max="180" value="${SLS.bpm}" aria-label="tempo">
<div class="muted">Akor başına vuruş</div><div class="seg">${seg}</div>
<div class="row g"><button class="btn" id="splay" data-a="slplay">▶ Başla</button>${ladBtnS()}</div><p class="muted">${best ? `Rekorun: ${best} bpm` : 'Hız merdiveni açıkken her 4 ölçüde tempo 4 artar; yetişemeyince Durdur’a bas.'}</p></div></div>`,
    after: () => { const r = $('#sbpm'); if (r) r.oninput = () => { SLS.bpm = +r.value; $('#sbpmv').textContent = SLS.bpm + ' bpm'; }; G.onStop(() => stopSlide(false)); } };
};
function slideCardH(c, prev) { return `${dg(c, { cls: 'lg' })}<b>${cn(c.n)}</b><div class="muted">${shN(c.sh)} · ${fpos(c.fret)}${prev ? ` (${c.fret - prev.fret > 0 ? '+' : ''}${c.fret - prev.fret})` : ''}</div>`; }
function slideBoard(cur, nxt) {
  const dots = [];
  nxt.fr.forEach((f, s) => { if (f >= 0 && cur.fr[s] !== f) dots.push({ s, f, cls: 'n' }); });
  cur.fr.forEach((f, s) => { if (f >= 0) dots.push({ s, f, cls: 'k', t: cur.fg[s] ? String(cur.fg[s]) : '' }); });
  return G.board({ dots, frets: 15 });
}
function ladBtnS() { return `<button class="btn sm ${TS.ladder ? 'on' : 'ghost'}" data-a="sllad">Hız merdiveni: ${TS.ladder ? 'açık' : 'kapalı'}</button>`; }
G.actions.sllad = (d, el) => { TS.ladder = !TS.ladder; el.outerHTML = ladBtnS(); };
G.actions.slsh = d => { const u = G.ui.slide; G.replace('slide', Object.assign({}, u.p, { sh: d.v })); };
G.actions.sltr = d => { const u = G.ui.slide; let tr = (u.p.tr || 0) + +d.v; if (tr > 6) tr = -5; if (tr < -5) tr = 6; G.replace('slide', Object.assign({}, u.p, { tr })); };
G.actions.slbeats = d => { SLS.beats = +d.v; document.querySelectorAll('[data-a=slbeats]').forEach(b => { const on = +b.dataset.v === SLS.beats; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
G.actions.slplay = () => {
  if (ssch && ssch.running) { stopSlide(true); return; }
  const u = G.ui.slide, path = u.path, n = path.length;
  G.playing = true; $('#splay').textContent = '■ Durdur';
  let bar = -1;
  ssch = makeScheduler((i, t, api) => {
    const beat = i % SLS.beats; if (beat === 0) { bar++; if (TS.ladder && bar > 0 && bar % 4 === 0) { SLS.bpm = Math.min(180, SLS.bpm + 4); api.at(t, () => { const r = $('#sbpm'); if (r) { r.value = SLS.bpm; $('#sbpmv').textContent = SLS.bpm + ' bpm'; } }); } }
    const ci = bar % n, cur = path[ci], nxt = path[(ci + 1) % n];
    Aud.click(t, beat === 0); if (beat === 0) Aud.strum(cur.fr, t, 0.28, 0.025);
    api.at(t, () => {
      const h = $('#shint'); if (!h) return;
      if (beat === 0) {
        $('#slb').innerHTML = slideBoard(cur, nxt); $('#sdn').innerHTML = slideCardH(cur); $('#sdx').innerHTML = slideCardH(nxt, cur);
        document.querySelectorAll('.slseq .chip').forEach((e, j) => e.classList.toggle('cur', j === ci));
      }
      const prep = SLS.beats > 1 && beat === SLS.beats - 1; const dlt = nxt.fret - cur.fret;
      h.classList.toggle('prep', prep);
      h.textContent = prep ? `KAY → ${G.cnPlain(nxt.n)}: ${fpos(nxt.fret)} (${dlt > 0 ? '+' : ''}${dlt})` : `ŞİMDİ: ${G.cnPlain(cur.n)} · ${fpos(cur.fret)}${TS.ladder ? ' · ' + SLS.bpm + ' bpm' : ''}`;
    });
    return 60 / SLS.bpm;
  }, G.ci(() => 60 / SLS.bpm));
  ssch.lad = TS.ladder ? { start: SLS.bpm, save: top => { const id = u.x.id; if (!S.slide.best[id] || S.slide.best[id] < top) S.slide.best[id] = top; S.xp += 15; G.save(); } } : null;
  ssch.start();
};
G.slideChord = slideChord;

// ---------- arpej motoru (atölye ve şarkılar ortak) ----------
const allPats = () => PATTERNS.concat(S.pats);
const allProgs = () => PROGS.concat(S.progs);
const patById = id => allPats().find(p => p.id === id) || PATTERNS[0];
const toks = p => Array.isArray(p.steps) ? p.steps : p.steps.split(' ');
function clickSteps(p) { const st = toks(p); return p.click || st.map((_, k) => k).filter(k => Math.abs(k * p.unit - Math.round(k * p.unit)) < 1e-6); }
let player = null;
function stopPlayer() { if (player) { player.stop(); player = null; } G.playing = false; const b = $('#pplay'); if (b) b.textContent = '▶ Başla'; const sb = document.getElementById('sgp'); if (sb) sb.textContent = '▶ Başla'; }
function playerHtml(bars, pat, bpm, opt) {
  opt = opt || {};
  const c0 = gc(bars[0]);
  const snd = S.arp.snd;
  const sb = (v, l) => `<button class="btn sm ${snd === v ? 'on' : 'ghost'}" data-a="psnd" data-v="${v}">${l}</button>`;
  return `<div class="player"><div class="pchips" id="pchips">${bars.map((c, i) => `<button class="chip" id="pc${i}" data-a="ploop" data-i="${i}">${cn(c)}</button>`).join('')}</div><div class="muted lpinfo" id="plpi">Döngü için bir akora, sonra bitiş akoruna dokun.</div>
<div class="pmain"><div class="pnow"><div class="muted">Şimdi</div><b id="pname">${cn(bars[0])}</b><div id="pdg">${c0 ? dg(c0, { cls: 'lg', use: patUse(c0, pat).strs }) + `<div class="pus">${patUse(c0, pat).h}</div>` : ''}</div></div><div class="pnext"><div class="muted">Sıradaki</div><b id="pnn">${cn(bars[1 % bars.length])}</b><div id="pndg">${(() => { const nc = gc(bars[1 % bars.length]); const u = patUse(nc, pat); return nc ? dg(nc, { use: u.strs }) + `<div class="pus">${u.h}</div>` : ''; })()}</div></div></div>
<div class="ptok" id="ptok">${toks(pat).map((t, i) => `<span class="tok" id="tk${i}">${t}</span>`).join('')}</div>
<div id="phint" class="hint">Hazır</div>
<div class="row"><span>Tempo</span><b id="pbpmv">${bpm} bpm</b></div><input type="range" id="pbpm" min="40" max="140" value="${bpm}" aria-label="tempo">
<div class="muted">Ses</div><div class="seg">${sb('arp', 'Arpej')}${sb('click', 'Metronom')}${sb('off', 'Sessiz')}</div>
${opt.kapo ? `<p class="muted">Kapo ${opt.kapo}. perde: şekiller ${opt.kapo} yarım ses yukarıda duyulur.</p>` : ''}
<button class="btn full big" id="pplay" data-a="pplay">▶ Başla</button></div>`;
}
let PSTATE = null;
// desenin bu akorda hangi telleri kullandığı (p = kök bas, P = alternatif bas)
function patUse(c, pat) {
  if (!c) return { strs: [], h: '' };
  const strs = new Set(), map = {};
  toks(pat).forEach(st => st.split('+').forEach(raw => {
    const mm = raw.match(/^([pPimacxDU.])(\d)?$/); if (!mm) return; const t = mm[1];
    let ss = [];
    if (mm[2] && 'pPima'.includes(t)) ss = [6 - +mm[2]];
    else if (t === 'p') ss = [CHM.bassIdx(c)]; else if (t === 'P') ss = [CHM.altBass(c)[0]];
    else if (t === 'i') ss = [3]; else if (t === 'm') ss = [4]; else if (t === 'a') ss = [5]; else if (t === 'c') ss = [3, 4, 5];
    else if (t === 'D' || t === 'U') ss = [0, 1, 2, 3, 4, 5].filter(x => c.fr[x] >= 0 && (t === 'D' || x >= 2));
    ss.filter(x => c.fr[x] >= 0 || t === 'P').forEach(x => { strs.add(x); if ('pPima'.includes(t)) { map[t] = map[t] || new Set(); map[t].add(6 - x); } });
  }));
  const nm = { p: 'bas', P: '2. bas', i: 'i', m: 'm', a: 'a' };
  const h = ['p', 'P', 'i', 'm', 'a'].filter(k => map[k]).map(k => `<span class="pu${k === 'p' || k === 'P' ? ' b' : ''}">${nm[k]} <b>${[...map[k]].join('/')}</b></span>`).join('');
  return { strs: [...strs], h };
}
G.actions.ploop = d => {
  const P = PSTATE; if (!P) return; const j = +d.i;
  if (P.lstep === 0) { P.loop = [j, j]; P.lstep = 1; }
  else if (P.lstep === 1) { P.loop = [Math.min(P.loop[0], j), Math.max(P.loop[0], j)]; P.lstep = 2; }
  else { P.loop = null; P.lstep = 0; }
  document.querySelectorAll('#pchips .chip').forEach((e, x) => e.classList.toggle('lp', !!P.loop && x >= P.loop[0] && x <= P.loop[1]));
  const inf = $('#plpi'); if (inf) inf.textContent = !P.loop ? 'Döngü için bir akora, sonra bitiş akoruna dokun.' : P.lstep === 1 ? `Döngü: ${P.loop[0] + 1}. ölçü · bitiş için başka bir akora dokun` : `Döngü: ${P.loop[0] + 1}–${P.loop[1] + 1}. ölçüler · kaldırmak için bir akora dokun`;
};
G.actions.psnd = d => { S.arp.snd = d.v; G.save(); document.querySelectorAll('[data-a=psnd]').forEach(b => { const on = b.dataset.v === d.v; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
function bindPlayer(bars, pat, bpmRef, shift) {
  PSTATE = { bars, pat, bpmRef, shift: shift || 0, loop: null, lstep: 0 };
  const r = $('#pbpm'); if (r) { r.oninput = () => { bpmRef.set(+r.value); $('#pbpmv').textContent = r.value + ' bpm'; }; r.onchange = () => G.save(); }
  G.onStop(stopPlayer);
}
G.actions.pplay = () => {
  if (player && player.running) { stopPlayer(); return; }
  const P = PSTATE; if (!P) return; const st = toks(P.pat), n = st.length, cs = clickSteps(P.pat);
  G.playing = true; $('#pplay').textContent = '■ Durdur'; { const sb = document.getElementById('sgp'); if (sb) sb.textContent = '■ Durdur'; }
  let lastBar = -1;
  player = makeScheduler((i, t, api) => {
    const L = P.loop, off = L ? L[0] : 0, len = L ? L[1] - L[0] + 1 : P.bars.length;
    const bi = off + Math.floor(i / n) % len, k = i % n;
    const c = gc(P.bars[bi]), nxtName = P.bars[off + (bi - off + 1) % len];
    const mode = S.arp.snd; const hot = []; let extra = null;
    if (mode === 'click' && cs.includes(k)) Aud.click(t, k === 0);
    const play = (s, f, v) => { if (f >= 0) { if (mode === 'arp') Aud.pluck(M.OPEN[s] + f + P.shift, t, v); hot.push(s); } };
    if (c) st[k].split('+').forEach(raw => {
      const mm = raw.match(/^([pPimacxDU.])(\d)?$/); if (!mm) return; const tok = mm[1], sn = mm[2] ? 6 - +mm[2] : null;
      if (sn != null && 'pPima'.includes(tok)) { play(sn, c.fr[sn], tok.toLowerCase() === 'p' ? 0.6 : 0.46); return; }
      if (tok === 'p') { const b = CHM.bassIdx(c); play(b, c.fr[b], 0.62); }
      else if (tok === 'P') { const ab = CHM.altBass(c); play(ab[0], ab[1], 0.58); if (c.fr[ab[0]] !== ab[1]) extra = ab; }
      else if (tok === 'i') play(3, c.fr[3], 0.45); else if (tok === 'm') play(4, c.fr[4], 0.45); else if (tok === 'a') play(5, c.fr[5], 0.48);
      else if (tok === 'c') [3, 4, 5].forEach(s => play(s, c.fr[s], 0.4));
      else if (tok === 'x' && mode === 'arp') Aud.slap(t);
      else if (tok === 'D' || tok === 'U') {
        const strs = [0, 1, 2, 3, 4, 5].filter(s => c.fr[s] >= 0 && (tok === 'D' || s >= 2));
        (tok === 'U' ? strs.reverse() : strs).forEach((s, j) => { if (mode === 'arp') Aud.pluck(M.OPEN[s] + c.fr[s] + P.shift, t + j * 0.011, tok === 'D' ? 0.32 : 0.22); hot.push(s); });
      }
    });
    api.at(t, () => {
      const dgEl = $('#pdg'); if (!dgEl || !c) return;
      const cu = patUse(c, P.pat); dgEl.innerHTML = dg(c, { cls: 'lg', hot, extra, use: cu.strs }) + `<div class="pus">${cu.h}</div>`;
      document.querySelectorAll('.tok').forEach((e, j) => e.classList.toggle('cur', j === k));
      if (bi !== lastBar) {
        lastBar = bi;
        document.querySelectorAll('#pchips .chip').forEach((e, j) => e.classList.toggle('cur', j === bi));
        const cur = $('#pc' + bi); if (cur && P.bars.length > 8) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        $('#pname').innerHTML = cn(P.bars[bi]); $('#pnn').innerHTML = cn(nxtName); G.stageSync(bi, nxtName);
        const nc = gc(nxtName); const nu = patUse(nc, P.pat); $('#pndg').innerHTML = nc ? dg(nc, { use: nu.strs }) + `<div class="pus">${nu.h}</div>` : '';
      }
      const prep = k >= n - Math.max(1, Math.round(n / 4));
      const h = $('#phint'); h.classList.toggle('prep', prep);
      h.textContent = prep ? `Hazırlan → ${G.cnPlain(nxtName)} (sol el şimdi geçsin)` : `Şimdi: ${G.cnPlain(P.bars[bi])}`;
    });
    return 60 / P.bpmRef.get() * P.pat.unit;
  }, G.ci(() => 60 / P.bpmRef.get()));
  player.start();
};

// ---------- arpej atölyesi ----------
G.screens.arpej = function () {
  const A = S.arp; const pats = allPats(), progs = allProgs();
  if (A.pat >= pats.length) A.pat = 0; if (A.p >= progs.length) A.p = 0;
  const P = pats[A.pat], pr = progs[A.p];
  const o = (arr, sel) => arr.map((x, i) => `<option value="${i}" ${i === sel ? 'selected' : ''}>${esc(x.name)}${x.custom ? ' ★' : ''}</option>`).join('');
  const unitL = P.unit === 1 ? 'dörtlük' : P.unit === 0.5 ? 'sekizlik' : 'üçleme';
  return { t: 'Arpej atölyesi', cat: 'arpej',
    h: `<div class="two"><div><div class="card"><h3>Akor dizisi</h3><select id="asel" aria-label="akor dizisi">${o(progs, A.p)}</select>
<div class="row g"><button class="btn sm ghost" data-a="newprog">+ Kendi dizin</button>${A.p >= PROGS.length ? '<button class="btn sm link" data-a="delprog">Sil</button>' : ''}</div></div>
<div class="card"><h3>Sağ el deseni</h3><select id="psel" aria-label="desen">${o(pats, A.pat)}</select>
<p class="muted">${esc(P.tip || '')} <span class="pill">${toks(P).length} ${unitL}</span></p>
<div class="row g"><button class="btn sm ghost" data-a="newpat">+ Desen yaz</button>${P.custom ? '<button class="btn sm link" data-a="delpat">Sil</button>' : ''}</div>
<details class="leg"><summary>Harfler ne demek?</summary><p class="muted"><b>p</b> başparmak, akorun kök bası · <b>P</b> alternatif bas (beşli) · <b>i</b> 3. tel · <b>m</b> 2. tel · <b>a</b> 1. tel · <b>c</b> i+m+a birlikte · <b>x</b> tellere vuruş · <b>.</b> sus · <b>p+a</b> aynı anda.</p></details></div></div>
<div class="card">${playerHtml(pr.ch, P, A.bpm)}<p class="muted">Turuncu uyarı çıkınca sol el yeni akora geçmeye başlamalı; bas nota gelmeden akor oturmuş olmalı.</p></div></div>`,
    after: () => {
      $('#asel').onchange = e => { S.arp.p = +e.target.value; G.save(); G.rerender(); };
      $('#psel').onchange = e => { S.arp.pat = +e.target.value; G.save(); G.rerender(); };
      bindPlayer(pr.ch, P, { get: () => S.arp.bpm, set: v => { S.arp.bpm = v; } });
    } };
};
G.actions.newpat = () => G.modal(`<h3>Desen yaz</h3><p class="muted">Harfleri boşlukla ayır. Bir desen = bir ölçü, en çok 16 adım. Örnek: <code>p i m a m i</code> · <code>p+a i m i P i m i</code></p>
<label>Ad<input id="npn" placeholder="Giuliani No. 5"></label><label>Adımlar<input id="nps" placeholder="p i m a m i" autocapitalize="off" autocomplete="off"></label>
<label>Adım uzunluğu<select id="npu"><option value="0.5">Sekizlik (en yaygın)</option><option value="1">Dörtlük</option><option value="0.3333333333">Üçleme (12/8 his)</option></select></label>
<div id="nperr" class="err"></div><button class="btn full" data-a="savepat">Kaydet</button>`);
G.actions.savepat = () => {
  const name = ($('#npn').value || '').trim() || 'Desenim', steps = CHM.parsePattern($('#nps').value);
  if (!steps) { $('#nperr').textContent = 'Geçersiz desen. Kullanılabilir: p P i m a c x . ve + ile birleşim (p+a).'; return; }
  S.pats.push({ id: 'u' + Date.now(), name, steps: steps.join(' '), unit: +$('#npu').value, tip: 'Kendi desenin: ' + steps.join(' '), custom: true });
  S.arp.pat = allPats().length - 1; G.save(); G.actions.mclose(); G.rerender();
};
G.actions.delpat = () => { const i = S.arp.pat - PATTERNS.length; if (i >= 0 && confirm('Bu deseni sil?')) { S.pats.splice(i, 1); S.arp.pat = 0; G.save(); G.rerender(); } };
G.actions.newprog = () => G.modal(`<h3>Kendi akor dizin</h3><p class="muted">Akorları boşlukla yaz (her akor bir ölçü). Örnek: <code>Am F C G</code> · <code>Bm G D A</code></p><label>Akorlar<input id="nrc" placeholder="Am F C G" autocapitalize="off" autocomplete="off"></label><div id="nrerr" class="err"></div><button class="btn full" data-a="saveprog">Kaydet</button>`);
G.actions.saveprog = () => {
  const r = parseBars($('#nrc').value); if (r.bad.length || !r.bars.length) { $('#nrerr').textContent = r.bars.length ? 'Tanınmayan akor: ' + r.bad.join(', ') : 'En az bir akor yaz.'; return; }
  S.progs.push({ name: r.bars.join(' – '), ch: r.bars, custom: true }); S.arp.p = allProgs().length - 1; G.save(); G.actions.mclose(); G.rerender();
};
G.actions.delprog = () => { const i = S.arp.p - PROGS.length; if (i >= 0 && confirm('Bu diziyi sil?')) { S.progs.splice(i, 1); S.arp.p = 0; G.save(); G.rerender(); } };

// ---------- şarkılar ----------
function parseBars(txt) {
  const bars = [], bad = [];
  String(txt || '').split(/[\s|,]+/).filter(Boolean).forEach(tok => {
    if (tok === '%') { if (bars.length) bars.push(bars[bars.length - 1]); return; }
    const m = tok.match(/^(.+?)(?:\*(\d))?$/); const name = normName(m[1]); const rep = m[2] ? +m[2] : 1;
    if (!gc(name)) { bad.push(m[1]); return; }
    for (let i = 0; i < rep; i++) bars.push(gc(name).n);
  });
  return { bars, bad };
}
G.parseBars = parseBars;
const TEMPL = [
  { id: 's1', name: 'Şablon · Slow pop (vi–IV–I–V)', txt: 'Am F C G | Am F C G | Dm F C G*2', pat: 'a7', bpm: 62, kapo: 0, ex: 1 },
  { id: 's2', name: 'Şablon · Nihavent balad (La, 6/8)', txt: 'Am Dm E Am | F Dm E*2', pat: 'a2', bpm: 66, kapo: 0, ex: 1 },
  { id: 's3', name: 'Şablon · Hicaz (La)', txt: 'A Bb A A | Dm C Bb A', pat: 'a3', bpm: 78, kapo: 0, ex: 1 },
  { id: 's4', name: 'Şablon · İnen bas hattı', txt: 'C G/B Am Am/G | F C/E Dm7 G', pat: 'a4', bpm: 72, kapo: 0, ex: 1 },
  { id: 's5', name: 'Şablon · Kürdilihicazkâr (Mi)', txt: 'Em F Em Em | Am G F Em', pat: 'a3', bpm: 74, kapo: 0, ex: 1 },
  { id: 's6', name: 'Şablon · Pop I–V–vi–IV (Sol)', txt: 'G D Em C | G D Em C | C D G Em | C D G*2', pat: 'a3', bpm: 76, kapo: 0, ex: 1 },
  { id: 's7', name: 'Şablon · 50’ler balad I–vi–IV–V', txt: 'C Am F G | C Am F G | F G C Am | F G C*2', pat: 'a2', bpm: 68, kapo: 0, ex: 1 },
  { id: 's8', name: 'Şablon · Minör pop i–VI–III–VII', txt: 'Em C G D | Em C G D | C D Em*2', pat: 'a7', bpm: 64, kapo: 0, ex: 1 },
  { id: 's9', name: 'Şablon · Canon (Pachelbel)', txt: 'D A Bm F#m | G D G A', pat: 'a9', bpm: 70, kapo: 0, ex: 1 },
  { id: 's10', name: 'Şablon · ii–V–I caz balad', txt: 'Dm7 G7 Cmaj7 Am7 | Dm7 G7 Cmaj7*2', pat: 'a4', bpm: 66, kapo: 0, ex: 1 },
  { id: 's11', name: 'Şablon · 12 ölçü blues (La)', txt: 'A7*4 D7*2 A7*2 E7 D7 A7 E7', pat: 'a5', bpm: 84, kapo: 0, ex: 1 },
  { id: 'k1', name: 'Eser · Pachelbel – Canon (D)', txt: 'D A Bm F#m | G D G A | D A Bm F#m | G D G A', pat: 'a15', bpm: 60, kapo: 0, ar: 1, note: 'Kanonun 8 akorluk bas kalıbı (ostinato), iki tur.' },
  { id: 'k2', name: 'Eser · Bach – Prelude in C, BWV 846', txt: 'C Dm7 G7 C | Am D7 G Cmaj7 | Am7 D7 G G7 | Dm7 G7 C*2', pat: 'a24', bpm: 60, kapo: 0, ar: 1, note: 'İlk 11 ölçünün armonisi ve kapanış kadansı; orijinaldeki bas değişimleri (Dm7/C, G7/B gibi) sadeleştirildi.' },
  { id: 'k3', name: 'Eser · Beethoven – Ay Işığı Sonatı (giriş)', txt: 'Am Am/G F Bb E7 E7 Am Am', pat: 'a22', bpm: 52, kapo: 4, ar: 1, note: 'Orijinal ton Do♯ minör; kapo 4 ile La minör şekilleri. İlk ölçülerin armonik özeti.' },
  { id: 'k4', name: 'Eser · Satie – Gymnopédie 1 (giriş)', txt: 'Gmaj7 Dmaj7 Gmaj7 Dmaj7 | Gmaj7 Dmaj7 Gmaj7 Dmaj7', pat: 'a23', bpm: 66, kapo: 0, ar: 1, note: 'Açılıştaki iki akorun salınımı, 3/4.' },
  { id: 'k5', name: 'Eser · Romance (İspanyol romansı)', txt: 'Em*6 Am*2 B7*2 Em*2 Am B7 Em*2 | E*2 A*2 B7*2 E*4 A*2 E B7 E*2', pat: 'a13', bpm: 60, kapo: 0, ar: 1, note: 'Minör ve majör bölüm. Am6 ve A6 sade Am ve A olarak yazıldı.' },
  { id: 'k6', name: 'Eser · La Folia', txt: 'Dm A Dm C F C Dm A | Dm A Dm C F C A Dm', pat: 'a2', bpm: 76, kapo: 0, ar: 1, note: 'Barok dönemin ünlü 16 ölçülük armonik kalıbı (Corelli, Vivaldi, Sanz).' },
  { id: 'k7', name: 'Eser · Romanesca (Guárdame las vacas)', txt: 'C G Am E | C G Am E Am', pat: 'a2', bpm: 80, kapo: 0, ar: 1, note: 'Narváez’in Guárdame las vacas varyasyonlarının temeli olan Rönesans kalıbı (III–VII–i–V).' },
  { id: 'k8', name: 'Eser · Passamezzo antico', txt: 'Am G Am E | C G Am E Am', pat: 'a2', bpm: 80, kapo: 0, ar: 1, note: 'Rönesans dans kalıbı (i–VII–i–V–III–VII–i–V–i).' },
  { id: 'k9', name: 'Eser · Greensleeves (anonim)', txt: 'Am G Am E | Am G Am E Am | C G Am E | C G Am E Am', pat: 'a2', bpm: 72, kapo: 0, ar: 1, note: '16. yüzyıl İngiliz halk ezgisi, 6/8.' },
  { id: 'k10', name: 'Eser · House of the Rising Sun (geleneksel)', txt: 'Am C D F | Am C E E | Am C D F | Am E Am E', pat: 'a2', bpm: 84, kapo: 0, ar: 1, note: 'Geleneksel Amerikan halk şarkısı; en bilinen 6/8 arpej eşliği.' },
  { id: 'bm1', name: 'Barış Manço · Gülpembe', txt: 'Em Am Em D G F Em | Am Em D G F Em | D Em D Em D Em D Em | Em Am Em D G F Em', pat: 'a3', bpm: 72, kapo: 0, bm: 1 },
  { id: 'bm2', name: 'Barış Manço · Dönence', txt: 'Em F Em F | Em F Em F Em*2', pat: 'a7', bpm: 64, kapo: 0, bm: 1 },
  { id: 'bm3', name: 'Barış Manço · Unutamadım', txt: 'Bm Em Bm Em Bm | Em D C Bm | Em D C Bm | Bm C Bm C Bm | D C Bm D C Bm | Em D C Bm', pat: 'a3', bpm: 70, kapo: 1, bm: 1, note: 'Orijinal ton Do minör; kapo 1 ile Si minör şekilleri.' },
  { id: 'bm4', name: 'Barış Manço · Arkadaşım Eşek', txt: 'Em Am Em Am Em B Em | Em Am Em | Am Em B Em | Am Em | Am Em B Em', pat: 'a4', bpm: 92, kapo: 0, bm: 1 },
  { id: 'bm5', name: 'Barış Manço · Sarı Çizmeli Mehmet Ağa', txt: 'Em*2 | Am Em F G Em | Am Em F G Em', pat: 'a4', bpm: 80, kapo: 0, bm: 1 },
  { id: 'bm6', name: 'Barış Manço · Kara Sevda', txt: 'Am Dm E Am Dm E | Am G Am Am G Am | Dm Am E Am Dm Am E Am', pat: 'a3', bpm: 76, kapo: 4, bm: 1, note: 'Orijinal ton Do♯ minör; kapo 4 ile La minör şekilleri.' },
  { id: 'bm7', name: 'Barış Manço · Domates Biber Patlıcan', txt: 'Em Bm Em Bm Am Em Bm Em | Em C Em C D Bm D Em', pat: 'a4', bpm: 96, kapo: 3, bm: 1, note: 'Orijinal ton Sol minör; kapo 3 ile Mi minör şekilleri.' },
  { id: 'bm8', name: 'Barış Manço · Gesi Bağları', txt: 'Em Am | Em Am F Em | Am Em Am F Em', pat: 'a2', bpm: 66, kapo: 1, bm: 1, note: 'Orijinal ton Fa minör; kapo 1 ile Mi minör şekilleri.' }
];
G.initSongs = () => {
  if (!S.songs) S.songs = [];
  const have = new Set(S.songs.map(s => s.id)); const del = new Set(S.songDel || []);
  TEMPL.forEach(t => { if (!have.has(t.id) && !del.has(t.id)) S.songs.push(Object.assign({}, t)); });
  G.save();
};
G.screens.songs = function () {
  const row = s => { const r = parseBars(s.txt); return `<div class="song"><button class="sgo" data-a="go" data-s="song" data-p='${JSON.stringify({ id: s.id })}'><b>${esc(s.name.replace(/^(Şablon|Barış Manço|Eser) · /, ''))}</b><span class="muted">${r.bars.slice(0, 8).map(G.cnPlain).join(' ')}${r.bars.length > 8 ? ' …' : ''} · ${s.bpm} bpm${s.kapo ? ' · kapo ' + s.kapo : ''}</span></button><button class="btn sm ghost" data-a="go" data-s="songed" data-p='${JSON.stringify({ id: s.id })}' aria-label="düzenle">Düzenle</button></div>`; };
  const mine = S.songs.filter(s => !s.ex && !s.bm && !s.ar), bm = S.songs.filter(s => s.bm), ex = S.songs.filter(s => s.ex), ar = S.songs.filter(s => s.ar);
  const sec = (t, arr, d) => arr.length ? `<h2 class="sec">${t}</h2>${d ? `<p class="muted">${d}</p>` : ''}<div class="songs lvgrid">${arr.map(row).join('')}</div>` : '';
  return { t: 'Şarkılarım', cat: 'sarki', h: `<p class="muted">Çalmak istediğin şarkının akorlarını internetten bul, buraya yaz. Her akor bir ölçü; <code>Am*2</code> iki ölçü, <code>%</code> öncekini tekrarlar, <code>|</code> sadece okunurluk için.</p>
<button class="btn" data-a="go" data-s="songed" data-p='{}'>+ Yeni şarkı</button>
${sec('Kendi şarkıların', mine)}${sec('Arpejle eserler', ar, 'Armonisi arpejle çalınan eserler: akorları bas, deseni çal, eser kendiliğinden ortaya çıkar.')}${sec('Barış Manço', bm, 'Akor sırası akorculuk.com ve guitartabsexplorer.com’dan; ölçü süreleri yaklaşık. Kulağınla kontrol edip düzenleyebilirsin. Bazılarında kapo ile kolay şekiller kullanıldı.')}${sec('Sık kullanılan dizilimler', ex, 'Pop’un en yaygın akor kalıpları. Bir şarkının akorları bunlardan birine benziyorsa onu temel alıp düzenle.')}` };
};
G.screens.songed = function (p) {
  const s = S.songs.find(x => x.id === p.id) || { id: null, name: '', txt: '', pat: 'a3', bpm: 70, kapo: 0 };
  const pats = allPats().map(x => `<option value="${x.id}" ${x.id === s.pat ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
  return { t: s.id ? 'Şarkıyı düzenle' : 'Yeni şarkı', cat: 'sarki', h: `<div class="card form">
<label>Şarkı adı<input id="sn" value="${esc(s.name)}" placeholder="Şarkı adı – sanatçı"></label>
<label>Akorlar<textarea id="st" rows="4" placeholder="Am F C G | Am F C G*2" autocapitalize="off" autocomplete="off" spellcheck="false">${esc(s.txt)}</textarea></label>
<div id="sterr" class="err"></div>
<div class="row3"><label>Desen<select id="sp">${pats}</select></label><label>Tempo<input id="sb" type="number" min="40" max="160" value="${s.bpm}"></label><label>Kapo<input id="sk" type="number" min="0" max="9" value="${s.kapo || 0}"></label></div>
<div class="row g"><button class="btn" data-a="savesong" data-id="${s.id || ''}">Kaydet</button>${s.id ? `<button class="btn link danger" data-a="delsong" data-id="${s.id}">Sil</button>` : ''}</div></div>
<p class="muted">Desteklenen akorlar: kütüphanedekiler ve her kökte majör, m, 7, m7, maj7 (barre olarak). Kapo yazarsan şekiller aynı kalır, ses kapo kadar yukarıda çalar.</p>` };
};
G.actions.savesong = d => {
  const name = ($('#sn').value || '').trim() || 'Adsız şarkı', txt = $('#st').value; const r = parseBars(txt);
  if (!r.bars.length || r.bad.length) { $('#sterr').textContent = r.bars.length ? 'Tanınmayan akor: ' + r.bad.join(', ') : 'Akor yaz.'; return; }
  const bpm = Math.max(40, Math.min(160, +$('#sb').value || 70)), kapo = Math.max(0, Math.min(9, +$('#sk').value || 0)), pat = $('#sp').value;
  if (d.id) { const s = S.songs.find(x => x.id === d.id); Object.assign(s, { name, txt, bpm, kapo, pat }); delete s.ex; }
  else S.songs.unshift({ id: 'u' + Date.now(), name, txt, bpm, kapo, pat });
  G.save(); G.actions.back();
};
G.actions.delsong = d => { if (confirm('Şarkı silinsin mi?')) { S.songs = S.songs.filter(x => x.id !== d.id); (S.songDel = S.songDel || []).push(d.id); G.save(); G.actions.back(); } };
// akor basitleştirme: yedili/sus/add → üçlü, slash basını at
function simpName(n) { const p = M.chordParse(n); if (!p) return n; const q = { maj7: '', '7': '', m7: 'm', m7b5: 'dim', sus2: '', sus4: '', add9: '', '6': '' }[p.q]; const r = p.root + (q === undefined ? p.q : q); return gc(r) ? gc(r).n : n; }
// kendi ses dosyan: IndexedDB'de bu cihazda saklanır, hiçbir yere gönderilmez
const IDB = {
  db() { return new Promise((ok, no) => { if (!window.indexedDB) return no(); const r = indexedDB.open('gg-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('a'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); },
  async put(k, v) { const d = await this.db(); return new Promise((ok, no) => { const t = d.transaction('a', 'readwrite'); t.objectStore('a').put(v, k); t.oncomplete = ok; t.onerror = () => no(t.error); }); },
  async get(k) { const d = await this.db(); return new Promise((ok, no) => { const r = d.transaction('a').objectStore('a').get(k); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); },
  async del(k) { const d = await this.db(); return new Promise(ok => { const t = d.transaction('a', 'readwrite'); t.objectStore('a').delete(k); t.oncomplete = ok; }); }
};
G.IDB = IDB;
let AU = null; // { el, url, a, b }
function auStop() { if (AU) { try { AU.el.pause(); } catch (e) {} if (AU.url) URL.revokeObjectURL(AU.url); } AU = null; }
const fmt = x => isFinite(x) ? `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}` : '–';
G.screens.song = function (p) {
  const s = S.songs.find(x => x.id === p.id); const r0 = parseBars(s.txt); const P = patById(s.pat);
  const bars = s.simp ? r0.bars.map(simpName) : r0.bars;
  const changed = r0.bars.some((b, i) => bars[i] !== b);
  return { t: s.name, cat: 'sarki', h: `${s.note ? `<p class="muted">${esc(s.note)}</p>` : ''}<div class="card">${playerHtml(bars, P, s.bpm, { kapo: s.kapo })}</div>
<div class="row g"><button class="btn sm ${s.simp ? 'on' : 'ghost'}" data-a="ssimp" data-id="${s.id}" aria-pressed="${!!s.simp}">Basitleştir${s.simp && changed ? ' ✓' : ''}</button><button class="btn sm ghost" data-a="stage">Sahne görünümü</button><button class="btn sm ghost" data-a="go" data-s="songed" data-p='${JSON.stringify({ id: s.id })}'>Düzenle</button><span class="muted">Desen: ${esc(P.name)}</span></div>
${s.simp ? `<p class="muted">Basit hali: yedili, sus ve add akorlar üçlüye, slash akorlar köke indirildi.${changed ? '' : ' Bu şarkıda değişen akor yok.'}</p>` : ''}
<div class="card" id="aucard"><h3>Kayıtla çalış</h3><p class="muted">Şarkının kendi ses dosyanı (mp3, m4a) bağla: yavaşlatıp döngüye alarak eşlik et. Dosya sadece bu cihazda saklanır.</p><div id="aubody"><p class="muted">Yükleniyor…</p></div><input type="file" id="auf" accept="audio/*" hidden></div>`,
    after: () => {
      bindPlayer(bars, P, { get: () => s.bpm, set: v => { s.bpm = v; } }, s.kapo || 0);
      G.onStop(auStop); G.onStop(stageClose);
      const f = $('#auf'); f.onchange = async () => { const file = f.files[0]; if (!file) return; try { await IDB.put('song:' + s.id, file); s.au = file.name; G.save(); } catch (e) { alert('Dosya kaydedilemedi: ' + (e && e.message || 'tarayıcı izin vermedi')); } auLoad(s); };
      auLoad(s);
    } };
};
async function auLoad(s) {
  const body = $('#aubody'); if (!body) return; auStop();
  let file = null; try { file = s.au ? await IDB.get('song:' + s.id) : null; } catch (e) { file = null; }
  if (!file) { body.innerHTML = `<button class="btn sm" data-a="aupick">Ses dosyası seç</button>`; return; }
  const url = URL.createObjectURL(file); const el = new Audio(url); el.preload = 'auto'; el.setAttribute('playsinline', '');
  try { el.preservesPitch = true; el.webkitPreservesPitch = true; el.mozPreservesPitch = true; } catch (e) {}
  AU = { el, url, a: null, b: null, rate: 1 };
  body.innerHTML = `<div class="aurow"><button class="btn" id="aupl" data-a="aupl">▶</button><input type="range" id="aupos" min="0" max="1000" value="0" aria-label="konum"><span class="muted" id="aut">0:00</span></div>
<div class="row"><span>Hız</span><b id="aurv">%100</b></div><input type="range" id="aur" min="50" max="100" step="5" value="100" aria-label="hız">
<div class="row g"><button class="btn sm ghost" data-a="auab" data-v="a">A noktası</button><button class="btn sm ghost" data-a="auab" data-v="b">B noktası</button><button class="btn sm ghost" data-a="auab" data-v="x">Döngüyü kaldır</button><button class="btn sm ghost" data-a="aujump" data-v="-5">−5 sn</button></div>
<p class="muted" id="auab">Döngü yok. Çalarken “A” ve “B”ye basarak bir bölümü döngüye al.</p>
<div class="row g"><span class="muted">${esc(s.au || '')}</span><button class="btn sm link" data-a="aupick">Değiştir</button><button class="btn sm link danger" data-a="audel" data-id="${s.id}">Kaldır</button></div>`;
  const pos = $('#aupos'), tl = $('#aut');
  el.ontimeupdate = () => { if (!AU || AU.el !== el) return; if (AU.a != null && AU.b != null && el.currentTime >= AU.b) el.currentTime = AU.a; if (el.duration) pos.value = Math.round(el.currentTime / el.duration * 1000); tl.textContent = fmt(el.currentTime) + ' / ' + fmt(el.duration); };
  el.onended = () => { const b = $('#aupl'); if (b) b.textContent = '▶'; };
  pos.oninput = () => { if (el.duration) el.currentTime = pos.value / 1000 * el.duration; };
  $('#aur').oninput = e => { el.playbackRate = +e.target.value / 100; $('#aurv').textContent = '%' + e.target.value; };
}
G.actions.aupick = () => { const f = $('#auf'); if (f) f.click(); };
G.actions.aupl = (d, b) => { if (!AU) return; if (AU.el.paused) { AU.el.play().then(() => { b.textContent = '❚❚'; }).catch(() => {}); } else { AU.el.pause(); b.textContent = '▶'; } };
G.actions.aujump = d => { if (AU) AU.el.currentTime = Math.max(0, AU.el.currentTime + +d.v); };
G.actions.auab = d => {
  if (!AU) return; const t = AU.el.currentTime;
  if (d.v === 'a') { AU.a = t; if (AU.b != null && AU.b <= t) AU.b = null; } else if (d.v === 'b') { if (AU.a == null) AU.a = 0; if (t > AU.a) AU.b = t; } else { AU.a = AU.b = null; }
  const e = $('#auab'); if (e) e.textContent = AU.a == null ? 'Döngü yok.' : AU.b == null ? `A: ${fmt(AU.a)} · şimdi B’ye bas` : `Döngü: ${fmt(AU.a)} → ${fmt(AU.b)}`;
};
G.actions.audel = async d => { const s = S.songs.find(x => x.id === d.id); if (!s || !confirm('Ses dosyası bu şarkıdan kaldırılsın mı?')) return; try { await IDB.del('song:' + s.id); } catch (e) {} delete s.au; G.save(); auLoad(s); };
G.actions.ssimp = d => { const s = S.songs.find(x => x.id === d.id); s.simp = !s.simp; G.save(); G.rerender(); };
// sahne görünümü: büyük akorlar, ekran kararmasın
let wake = null;
function stageClose() { const o = document.getElementById('stage'); if (o) o.remove(); document.body.classList.remove('staged'); if (wake) { try { wake.release(); } catch (e) {} wake = null; } }
G.actions.stage = () => {
  const P = PSTATE; if (!P) return; stageClose();
  const o = document.createElement('div'); o.id = 'stage';
  o.innerHTML = `<div class="sgtop"><b>${esc($('#ttl').textContent)}</b><button class="btn sm ghost" data-a="stagex">Kapat</button></div><div class="sgnow"><div><span>Şimdi</span><b id="sgn">${cn(P.bars[0])}</b></div><div><span>Sıradaki</span><b id="sgx">${cn(P.bars[1 % P.bars.length])}</b></div></div><div class="sggrid">${P.bars.map((c, i) => `<span id="sg${i}">${cn(c)}</span>`).join('')}</div><button class="btn big full" id="sgp" data-a="pplay">${player && player.running ? '■ Durdur' : '▶ Başla'}</button>`;
  document.body.appendChild(o); document.body.classList.add('staged');
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; }).catch(() => {}); } catch (e) {}
};
G.actions.stagex = () => stageClose();
G.stageSync = (bi, nxt) => { const o = document.getElementById('stage'); if (!o) return; o.querySelectorAll('.sggrid span').forEach((e, j) => e.classList.toggle('cur', j === bi)); const a = $('#sgn'), b = $('#sgx'); if (a) a.innerHTML = cn(PSTATE.bars[bi]); if (b) b.innerHTML = cn(nxt); const c = $('#sg' + bi); if (c) c.scrollIntoView({ block: 'nearest' }); const pb = $('#sgp'); if (pb) pb.textContent = player && player.running ? '■ Durdur' : '▶ Başla'; };

// ---------- barre ve tonlar ----------
G.screens.tonlar = function (p) {
  const k = p.k || 'C', type = p.t === 'min' ? 'min' : 'maj';
  const ch = M.diatonic(k, type), rom = type === 'min' ? M.RMIN : M.RMAJ;
  const keys = type === 'maj' ? M.CIRC : MKEYS;
  const chips = keys.map(x => `<button class="chipb ${x === k ? 'on' : ''}" data-a="tonkey" data-k="${x}" data-t="${type}">${nn(x)}</button>`).join('');
  const rows = ch.map((c, i) => {
    const pr = M.chordParse(c), pc = M.pcOf(pr.root);
    if (pr.q === 'dim') return `<tr><td><b>${rom[i]}</b></td><td>${cn(c)}</td><td colspan="2" class="muted">eksik akor</td></tr>`;
    return `<tr class="tap" data-a="shape" data-pc="${pc}" data-q="${pr.q}" data-r="${pr.root}"><td><b>${rom[i]}</b></td><td>${cn(c)}</td><td>${fretTxt(CHM.barreFret('E', pc))}</td><td>${fretTxt(CHM.barreFret('A', pc))}</td></tr>`;
  }).join('');
  return { t: 'Barre ve tonlar', cat: 'akor',
    h: `<div class="seg"><button class="btn sm ${type === 'maj' ? 'on' : 'ghost'}" data-a="tonkey" data-k="C" data-t="maj">Majör tonlar</button><button class="btn sm ${type === 'min' ? 'on' : 'ghost'}" data-a="tonkey" data-k="A" data-t="min">Minör tonlar</button></div>
<div class="chips">${chips}</div>
<div class="card"><h3>${nn(k)} ${type === 'maj' ? 'majör' : 'doğal minör'} · diatonik akorlar</h3>
<table class="t"><tr><th>Derece</th><th>Akor</th><th>Mi şekli</th><th>La şekli</th></tr>${rows}</table>
<p class="muted">Satıra dokun: iki barre şeklini gör. Mi şekli = kök 6. telde, La şekli = kök 5. telde. Aynı perdedeki Mi şekli I ise, La şekli IV’tür.</p></div>` };
};
G.actions.tonkey = d => G.replace('tonlar', { k: d.k, t: d.t });
G.actions.shape = d => {
  const pc = +d.pc, q = d.q; const nE = CHM.barreFret('E', pc), nA = CHM.barreFret('A', pc);
  const cE = CHM.barreChord('E', q, nE, d.r + q), cA = CHM.barreChord('A', q, nA, d.r + q);
  G.modal(`<h3>${cn(d.r + q)}</h3><div class="pair"><div>${dg(cE, { cls: 'lg' })}<b>Mi şekli</b><div class="muted">${fretTxt(nE)}</div></div><div>${dg(cA, { cls: 'lg' })}<b>La şekli</b><div class="muted">${fretTxt(nA)}</div></div></div>
<p class="muted">Aynı şekil sapta kayarak her majör/minör akoru verir. Mi şeklinde 6. teldeki, La şeklinde 5. teldeki nota akorun adıdır.</p>`);
};

// ---------- oyunlar ----------
const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
function slideQ() {
  const sh = pick(['E', 'A']); const q = pick(['', 'm']);
  const r1 = pick(ROOTS); const a = G.slideChord(r1 + q, sh, null); if (a.fret === 0) return slideQ();
  const d = pick([-3, -2, -1, 1, 2, 3, 5]); const b = G.slideChord(M.NICE[M.mod(M.pcOf(r1) + d, 12)] + q, sh, a.fret);
  const dist = b.fret - a.fret; const lab = x => (x > 0 ? '+' : '') + x + ' perde';
  const pool = [dist + 1, dist - 1, dist + 2, -dist, dist - 2].filter(x => x !== dist && x !== 0);
  const opts = [dist]; pool.forEach(x => { if (opts.length < 4 && !opts.includes(x)) opts.push(x); });
  const shName = sh === 'E' ? 'Mi' : 'La';
  return { kind: 'choice', prompt: `${shName} şekliyle <b>${cn(a.n)}</b> (${fretTxt(a.fret)}) çalıyorsun. <b>${cn(b.n)}</b> için kaç perde kaydırırsın?`, cols: 2,
    opts: shuffle(opts).map(v => ({ v: String(v), html: lab(v) })), ans: [String(dist)], why: `${cn(b.n)} ${shName} şekliyle ${fretTxt(b.fret)}: ${a.fret} → ${b.fret} = ${lab(dist)}. Kök ${sh === 'E' ? 6 : 5}. telde.` };
}
function barreGen() {
  if (Math.random() < 0.4) return slideQ();
  const r = pick(ROOTS), q = pick(['', 'm']), sh = pick(['E', 'A']); const pc = M.pcOf(r);
  const n = CHM.barreFret(sh, pc); const set = new Set([n]);
  while (set.size < 4) set.add((((n + pick([-3, -2, -1, 1, 2, 3, 5, 7])) % 12) + 12) % 12);
  const opts = shuffle([...set]).map(x => ({ v: String(x), html: x === 0 ? 'açık' : String(x) }));
  const shName = sh === 'E' ? 'Mi' : 'La', rs = sh === 'E' ? 6 : 5;
  return { kind: 'choice', prompt: `<b>${cn(r + q)}</b> akorunu <b>${shName} şekliyle</b> çalmak için barre kaçıncı perdede?`, sub: `${shName} şeklinde kök ${rs}. telde`, cols: 4, opts, ans: [String(n)],
    why: `${rs}. telde ${G.pcInline(pc)} → ${fretTxt(n)}<div class="center">${dg(CHM.barreChord(sh, q, n, r + q), { cls: 'lg' })}</div>` };
}
G.actions.barregame = () => G.startSession({ title: 'Barre Bulucu', count: 12, gen: barreGen, cat: 'sekil' });

G.buildSekil = function () {
  const OPEN = ['Am', 'Em', 'Dm', 'C', 'G', 'D', 'A', 'E', 'F'];
  const SEV = ['Am7', 'Em7', 'Dm7', 'Bm7', 'Cmaj7', 'Fmaj7', 'E7', 'G7', 'D7', 'A7', 'B7', 'Asus2', 'Asus4', 'Dsus2', 'Dsus4', 'Esus4', 'Cadd9'];
  const SLA = ['G/B', 'D/F#', 'Am/G', 'C/E'];
  function d2n(pool, extra) {
    const n = pick(pool); const c = gc(n);
    const opts = [n]; shuffle(pool.concat(extra || [])).forEach(x => { if (opts.length < 4 && !opts.includes(x)) opts.push(x); });
    return { kind: 'choice', prompt: 'Bu hangi akor?', visual: `<div class="center">${dg(c, { cls: 'lg', root: false })}</div>`, opts: shuffle(opts).map(v => ({ v, html: cn(v) })), ans: [n], cols: 2, why: `${cn(n)} · ${M.chordSpelled(CHM.baseName(n)).map(nn).join(' – ')}` };
  }
  function n2d(pool, extra) {
    const n = pick(pool);
    const opts = [n]; shuffle(pool.concat(extra || [])).forEach(x => { if (opts.length < 4 && !opts.includes(x)) opts.push(x); });
    return { kind: 'choice', prompt: `<b>${cn(n)}</b> hangisi?`, opts: shuffle(opts).map(v => ({ v, html: dg(gc(v), { root: false }) })), ans: [n], cols: 2, dia: 1, why: `<div class="center">${dg(gc(n), { cls: 'lg' })}</div>` };
  }
  function slashQ() {
    if (Math.random() < 0.5) return d2n(SLA, ['G', 'D', 'Am', 'C', 'Em']);
    const n = pick(SLA); const p = M.chordParse(n);
    const pool = [p.root, M.chordSpelled(p.root + p.q)[2], 'E', 'A', 'D', 'C'].filter((x, i, a) => M.pcOf(x) !== M.pcOf(p.bass) && a.findIndex(y => M.pcOf(y) === M.pcOf(x)) === i);
    return { kind: 'choice', prompt: `<b>${cn(n)}</b> çalarken p parmağı (bas) hangi notayı çalar?`, visual: `<div class="center">${dg(gc(n), { cls: 'lg' })}</div>`, opts: shuffle([p.bass].concat(shuffle(pool).slice(0, 3))).map(v => ({ v, html: nn(v) })), ans: [p.bass], cols: 2, why: `${cn(n)}: ${cn(p.root + p.q)} akoru, basta ${nn(p.bass)}.` };
  }
  function barQ() {
    const r = pick(ROOTS), q = pick(['', 'm', '7', 'm7']), sh = pick(['E', 'A']); const pc = M.pcOf(r);
    const n = CHM.barreFret(sh, pc) || 12; const name = r + q;
    const c = CHM.barreChord(sh, q, n, name + '|' + sh);
    const pool = [M.NICE[(pc + 1) % 12] + q, M.NICE[(pc + 11) % 12] + q, M.NICE[(pc + 2) % 12] + q, M.NICE[(pc + 5) % 12] + q, r + (q === 'm' ? '' : 'm'), r + (q === '7' ? '' : '7')];
    const opts = [name]; shuffle(pool).forEach(x => { if (opts.length < 4 && !opts.some(o => M.pcOf(o) === M.pcOf(x) && M.chordParse(o).q === M.chordParse(x).q)) opts.push(x); });
    return { kind: 'choice', prompt: 'Bu barre akor hangisi?', sub: 'Sol taraftaki sayı ilk perdeyi gösterir', visual: `<div class="center">${dg(c, { cls: 'lg', root: false })}</div>`, opts: shuffle(opts).map(v => ({ v, html: cn(v) })), ans: [name], cols: 2,
      why: `${sh === 'E' ? 'Mi' : 'La'} şekli (${QN[q]}), kök ${sh === 'E' ? 6 : 5}. telde ${fretTxt(n)}: ${G.pcInline(pc)} → ${cn(name)}` };
  }
  const L = {
    s1: '<p>Diyagramda dikey çizgiler teller (solda kalın Mi), yatay çizgiler perdeler. × çalınmayan tel, ○ boş tel, sayılar parmak numarası. Gitar elinde değilken şekilleri tanımak, gitar başında akoru düşünmeden basmanı sağlar.</p>',
    s3: '<p>7’li ve sus akorlar çoğunlukla temel açık akordan bir parmak eklenerek ya da kaldırılarak oluşur: Am → Am7 (sol telindeki parmak kalkar), D → Dsus4 (serçe eklenir). Bu ilişkileri gör.</p>',
    s4: '<p>Slash akorda (G/B) bölü işaretinden sonraki nota bastır. Arpejde p parmağın bu notayı çalar. İnen bas hatlarında (C – G/B – Am – Am/G) sadece bas parmağı oynar.</p>',
    s5: '<p>Barre akorun adı kök telinden okunur: Mi şeklinde 6. tel, La şeklinde 5. tel. Diyagramın solundaki sayı barre perdesidir. Mi teli 1. perde Fa, 3 Sol, 5 La, 7 Si, 8 Do; La teli 1 Si♭, 3 Do, 5 Re, 7 Mi.</p>'
  };
  return [
    ['s1', 'Açık akorlar · şemadan ad', 'Am, C, G, D... şekle bakıp adını söyle', () => d2n(OPEN)],
    ['s2', 'Açık akorlar · addan şema', 'Adı verilen akorun doğru şeklini seç', () => n2d(OPEN)],
    ['s3', '7’li, sus ve add akorlar', 'Am7, Dsus4, Cadd9... iki yönlü', () => Math.random() < 0.5 ? d2n(SEV, OPEN) : n2d(SEV, OPEN)],
    ['s4', 'Slash akorlar ve bas notası', 'G/B, D/F♯, Am/G, C/E', slashQ],
    ['s5', 'Barre akorları oku', 'Mi ve La şekli, majör, minör ve 7’liler', barQ]
  ].map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], lesson: L[a[0]], count: 12 }));
};
})();
