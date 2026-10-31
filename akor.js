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
  return { t: 'Akor ve arpej', cat: 'akor', h: `<h2 class="sec">Gitar elindeyken</h2><div class="menus">
${card('gecis', 'Geçiş zincirleri', 'Ortak parmağı yerinde bırakan akor çiftleri, metronomlu antrenör ve 1 dakika testi.', 'data-a="go" data-s="zincir"')}
${card('arpej', 'Arpej atölyesi', 'Akor dizisi üzerinde p-i-m-a kalıpları; kendi desenini yaz.', 'data-a="go" data-s="arpej"')}
${card('sarki', 'Şarkılarım', 'Akorları yaz, desen ve tempo seç, eşlik ederken akorlar sırayla aksın.', 'data-a="go" data-s="songs"')}
${card('sekil', 'Akor kütüphanesi', 'Açık, 7’li, sus, slash ve barre akorlar. Akor ara.', 'data-a="go" data-s="lib"')}
${card('sap', 'Barre ve tonlar', 'Her tonda diatonik akorlar, Mi ve La şekli barre perdeleri.', 'data-a="go" data-s="tonlar" data-p=\'{"k":"C","t":"maj"}\'')}
</div><h2 class="sec">Gitarsız: akor şekli oyunları</h2><div class="lvgrid">${G.levelList(G.tracks.sekil)}</div>
<div class="menus" style="margin-top:12px">${card('teori', 'Barre Bulucu', '“Si♭ minör La şekliyle kaçıncı perde?” gibi hızlı sorular.', 'data-a="barregame"')}</div>` };
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

// ---------- zincirler ----------
G.screens.zincir = function () {
  const best = (a, b) => { const k = a + '>' + b; const v = [4, 2, 1].map(n => S.pairs[k + '@' + n] ? `${n} vuruş ${S.pairs[k + '@' + n]}` : null).filter(Boolean); if (S.min1[k]) v.push(`1 dk: ${S.min1[k]} geçiş`); return v.join(' · '); };
  let h = '<p class="muted">Sırayla ilerle. Bir çifte dokun, antrenör açılır: yeşil parmak yerinde kalır, turuncu kalkar, mavi yeni basılır.</p>';
  [1, 2, 3].forEach(st => {
    h += `<h2 class="sec">${STAGES[st]}</h2><div class="lvgrid">`;
    GROUPS.filter(g => g.st === st).forEach(g => {
      h += `<div class="card"><h3>${g.name}</h3><div class="chips">${g.chords.map(c => `<span class="chip">${cn(c)}</span>`).join('')}</div><p class="muted">${g.tip}</p><div class="row g">`;
      const prs = []; for (let i = 0; i < g.chords.length - 1; i++) if (g.chords[i] !== g.chords[i + 1]) prs.push([g.chords[i], g.chords[i + 1]]);
      const uniq = prs.filter((p, i) => prs.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i);
      uniq.forEach(p => { h += `<button class="btn sm ghost" data-a="go" data-s="trainer" data-p='${JSON.stringify({ a: p[0], b: p[1] })}'>${G.cnPlain(p[0])} ⇄ ${G.cnPlain(p[1])}</button>`; });
      h += '</div>';
      uniq.forEach(p => { const b = best(p[0], p[1]); if (b) h += `<div class="muted rec">${G.cnPlain(p[0])}⇄${G.cnPlain(p[1])} → ${b}</div>`; });
      h += '</div>';
    });
    h += '</div>';
  });
  return { t: 'Geçiş zincirleri', cat: 'gecis', h };
};

let sch = null, m1t = null;
const TS = { bpm: 60, beats: 4 };
function stopSch() { if (sch) { sch.stop(); sch = null; } G.playing = false; const b = $('#play'); if (b) b.textContent = '▶ Başla'; }
function stopM1() { if (m1t) { clearInterval(m1t); m1t = null; } }
G.screens.trainer = function (p) {
  const a = gc(p.a), b = gc(p.b), t = CHM.transition(a, b);
  const key = p.a + '>' + p.b;
  const seg = [4, 2, 1].map(n => `<button class="btn sm ${TS.beats === n ? 'on' : 'ghost'}" data-a="tbeats" data-v="${n}">${n} vuruş</button>`).join('');
  return { t: 'Geçiş antrenörü', cat: 'gecis',
    h: `<div class="two"><div class="card"><div class="pair big2"><div id="da">${dg(a, { marks: CHM.marksFor(t, 'a'), cls: 'lg' })}<b>${cn(p.a)}</b></div><div id="db">${dg(b, { marks: CHM.marksFor(t, 'b'), cls: 'lg' })}<b>${cn(p.b)}</b></div></div>
<div class="legend"><span><i class="lg lst"></i>ortak (${t.stay.length})</span><span><i class="lg llv"></i>kalkar (${t.leave.length})</span><span><i class="lg lar"></i>yeni (${t.arrive.length})</span></div></div>
<div><div class="card"><div id="hint" class="hint">Hazır</div>
<div class="row"><span>Tempo</span><b id="bpmv">${TS.bpm} bpm</b></div><input type="range" id="bpm" min="40" max="160" value="${TS.bpm}" aria-label="tempo">
<div class="muted">Akor başına vuruş</div><div class="seg">${seg}</div>
<div class="row g"><button class="btn" id="play" data-a="tplay" data-k="${key}">▶ Başla</button><button class="btn ghost" data-a="tclean" data-k="${key}">Temiz yaptım ✓</button></div>
<div class="muted" id="best" style="margin-top:8px"></div></div>
<div class="card"><h3>1 dakika testi</h3><p class="muted">60 saniyede iki akor arasında kaç temiz geçiş yapabiliyorsun? Her geçişte büyük düğmeye dokun (ya da boşluk tuşu). Her gün bir kez yap, sayı arttıkça geçiş otomatikleşir.</p>
<div class="m1"><div id="m1c" class="m1c">60</div><button class="btn full big" id="m1b" data-a="m1" data-k="${key}">Testi başlat</button></div></div></div></div>`,
    after: () => {
      const r = $('#bpm'); if (r) r.oninput = () => { TS.bpm = +r.value; $('#bpmv').textContent = TS.bpm + ' bpm'; };
      showBest(key); G.onStop(stopSch); G.onStop(stopM1);
    } };
};
function showBest(key) { const el = $('#best'); if (!el) return; const v = [4, 2, 1].map(n => { const x = S.pairs[key + '@' + n]; return x ? `${n} vuruş: ${x} bpm` : null; }).filter(Boolean); el.textContent = v.length ? 'En iyi temiz hızın → ' + v.join(' · ') : 'Temiz yapabildiğin hızda “Temiz yaptım”a bas; rekorun kaydedilir. 50 bpm’den başla, 5’er artır.'; }
G.actions.tbeats = d => { TS.beats = +d.v; document.querySelectorAll('[data-a=tbeats]').forEach(b => { const on = +b.dataset.v === TS.beats; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
G.actions.tclean = d => { const k = d.k + '@' + TS.beats; if (!S.pairs[k] || S.pairs[k] < TS.bpm) S.pairs[k] = TS.bpm; S.xp += 10; G.save(); showBest(d.k); };
G.actions.tplay = d => {
  if (sch && sch.running) { stopSch(); return; }
  const parts = d.k.split('>'); const a = gc(parts[0]), b = gc(parts[1]);
  G.playing = true; $('#play').textContent = '■ Durdur';
  sch = makeScheduler((i, t, api) => {
    const beat = i % TS.beats, bar = Math.floor(i / TS.beats);
    const cur = bar % 2 === 0 ? a : b, nxt = bar % 2 === 0 ? b : a;
    Aud.click(t, beat === 0);
    if (beat === 0) Aud.strum(cur.fr, t, 0.28, 0.025);
    api.at(t, () => {
      const ea = $('#da'), eb = $('#db'), hint = $('#hint'); if (!hint) return;
      ea.classList.toggle('cur', cur === a); eb.classList.toggle('cur', cur === b);
      const prep = TS.beats > 1 && beat === TS.beats - 1;
      hint.classList.toggle('prep', prep);
      hint.textContent = prep ? `HAZIRLAN → ${G.cnPlain(nxt.n)}` : `ŞİMDİ: ${G.cnPlain(cur.n)}`;
    });
    return 60 / TS.bpm;
  });
  sch.start();
};
G.actions.m1 = d => {
  const btn = $('#m1b'), c = $('#m1c');
  if (!m1t) {
    let left = 60, n = 0; btn.dataset.n = 0; btn.textContent = '+1 geçiş'; c.textContent = '60'; c.classList.add('run');
    G.playing = true;
    m1t = setInterval(() => {
      left--; c.textContent = left;
      if (left <= 0) {
        stopM1(); n = +btn.dataset.n; c.classList.remove('run');
        const prev = S.min1[d.k] || 0; if (n > prev) S.min1[d.k] = n; S.xp += 15; G.save();
        c.textContent = n; btn.textContent = 'Tekrar başlat';
        G.modal(`<h3>1 dakika testi</h3><p class="big">${n} geçiş</p><p class="muted">${n > prev ? (prev ? `Yeni rekor! (önceki ${prev})` : 'İlk kayıt.') : `Rekorun ${prev}.`} Hedef: 60 (saniyede bir).</p>`);
      }
    }, 1000);
    return;
  }
  btn.dataset.n = +btn.dataset.n + 1; btn.textContent = `+1 geçiş · ${btn.dataset.n}`;
};
document.addEventListener('keydown', e => { if (m1t && e.key === ' ' && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) { e.preventDefault(); const b = $('#m1b'); if (b) b.click(); } });

// ---------- arpej motoru (atölye ve şarkılar ortak) ----------
const allPats = () => PATTERNS.concat(S.pats);
const allProgs = () => PROGS.concat(S.progs);
const patById = id => allPats().find(p => p.id === id) || PATTERNS[0];
const toks = p => Array.isArray(p.steps) ? p.steps : p.steps.split(' ');
function clickSteps(p) { const st = toks(p); return p.click || st.map((_, k) => k).filter(k => Math.abs(k * p.unit - Math.round(k * p.unit)) < 1e-6); }
let player = null;
function stopPlayer() { if (player) { player.stop(); player = null; } G.playing = false; const b = $('#pplay'); if (b) b.textContent = '▶ Başla'; }
function playerHtml(bars, pat, bpm, opt) {
  opt = opt || {};
  const c0 = gc(bars[0]);
  const snd = S.arp.snd;
  const sb = (v, l) => `<button class="btn sm ${snd === v ? 'on' : 'ghost'}" data-a="psnd" data-v="${v}">${l}</button>`;
  return `<div class="player"><div class="pchips" id="pchips">${bars.map((c, i) => `<span class="chip" id="pc${i}">${cn(c)}</span>`).join('')}</div>
<div class="pmain"><div class="pnow"><div class="muted">Şimdi</div><b id="pname">${cn(bars[0])}</b><div id="pdg">${c0 ? dg(c0, { cls: 'lg' }) : ''}</div></div><div class="pnext"><div class="muted">Sıradaki</div><b id="pnn">${cn(bars[1 % bars.length])}</b><div id="pndg">${gc(bars[1 % bars.length]) ? dg(gc(bars[1 % bars.length])) : ''}</div></div></div>
<div class="ptok" id="ptok">${toks(pat).map((t, i) => `<span class="tok" id="tk${i}">${t}</span>`).join('')}</div>
<div id="phint" class="hint">Hazır</div>
<div class="row"><span>Tempo</span><b id="pbpmv">${bpm} bpm</b></div><input type="range" id="pbpm" min="40" max="140" value="${bpm}" aria-label="tempo">
<div class="muted">Ses</div><div class="seg">${sb('arp', 'Arpej')}${sb('click', 'Metronom')}${sb('off', 'Sessiz')}</div>
${opt.kapo ? `<p class="muted">Kapo ${opt.kapo}. perde: şekiller ${opt.kapo} yarım ses yukarıda duyulur.</p>` : ''}
<button class="btn full big" id="pplay" data-a="pplay">▶ Başla</button></div>`;
}
let PSTATE = null;
G.actions.psnd = d => { S.arp.snd = d.v; G.save(); document.querySelectorAll('[data-a=psnd]').forEach(b => { const on = b.dataset.v === d.v; b.classList.toggle('on', on); b.classList.toggle('ghost', !on); }); };
function bindPlayer(bars, pat, bpmRef, shift) {
  PSTATE = { bars, pat, bpmRef, shift: shift || 0 };
  const r = $('#pbpm'); if (r) { r.oninput = () => { bpmRef.set(+r.value); $('#pbpmv').textContent = r.value + ' bpm'; }; r.onchange = () => G.save(); }
  G.onStop(stopPlayer);
}
G.actions.pplay = () => {
  if (player && player.running) { stopPlayer(); return; }
  const P = PSTATE; if (!P) return; const st = toks(P.pat), n = st.length, cs = clickSteps(P.pat);
  G.playing = true; $('#pplay').textContent = '■ Durdur';
  let lastBar = -1;
  player = makeScheduler((i, t, api) => {
    const bi = Math.floor(i / n) % P.bars.length, k = i % n;
    const c = gc(P.bars[bi]), nxtName = P.bars[(bi + 1) % P.bars.length];
    const mode = S.arp.snd; const hot = []; let extra = null;
    if (mode === 'click' && cs.includes(k)) Aud.click(t, k === 0);
    const play = (s, f, v) => { if (f >= 0) { if (mode === 'arp') Aud.pluck(M.OPEN[s] + f + P.shift, t, v); hot.push(s); } };
    if (c) st[k].split('+').forEach(tok => {
      if (tok === 'p') { const b = CHM.bassIdx(c); play(b, c.fr[b], 0.62); }
      else if (tok === 'P') { const ab = CHM.altBass(c); play(ab[0], ab[1], 0.58); if (c.fr[ab[0]] !== ab[1]) extra = ab; }
      else if (tok === 'i') play(3, c.fr[3], 0.45); else if (tok === 'm') play(4, c.fr[4], 0.45); else if (tok === 'a') play(5, c.fr[5], 0.48);
      else if (tok === 'c') [3, 4, 5].forEach(s => play(s, c.fr[s], 0.4));
      else if (tok === 'x' && mode === 'arp') Aud.slap(t);
    });
    api.at(t, () => {
      const dgEl = $('#pdg'); if (!dgEl || !c) return;
      dgEl.innerHTML = dg(c, { cls: 'lg', hot, extra });
      document.querySelectorAll('.tok').forEach((e, j) => e.classList.toggle('cur', j === k));
      if (bi !== lastBar) {
        lastBar = bi;
        document.querySelectorAll('#pchips .chip').forEach((e, j) => e.classList.toggle('cur', j === bi));
        const cur = $('#pc' + bi); if (cur && P.bars.length > 8) cur.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        $('#pname').innerHTML = cn(P.bars[bi]); $('#pnn').innerHTML = cn(nxtName);
        const nc = gc(nxtName); $('#pndg').innerHTML = nc ? dg(nc) : '';
      }
      const prep = k >= n - Math.max(1, Math.round(n / 4));
      const h = $('#phint'); h.classList.toggle('prep', prep);
      h.textContent = prep ? `Hazırlan → ${G.cnPlain(nxtName)} (sol el şimdi geçsin)` : `Şimdi: ${G.cnPlain(P.bars[bi])}`;
    });
    return 60 / P.bpmRef.get() * P.pat.unit;
  });
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
G.initSongs = () => {
  if (S.songs) return;
  S.songs = [
    { id: 's1', name: 'Şablon · Slow pop (vi–IV–I–V)', txt: 'Am F C G | Am F C G | Dm F C G*2', pat: 'a7', bpm: 62, kapo: 0, ex: 1 },
    { id: 's2', name: 'Şablon · Nihavent balad (La, 6/8)', txt: 'Am Dm E Am | F Dm E*2', pat: 'a2', bpm: 66, kapo: 0, ex: 1 },
    { id: 's3', name: 'Şablon · Hicaz (La)', txt: 'A Bb A A | Dm C Bb A', pat: 'a3', bpm: 78, kapo: 0, ex: 1 },
    { id: 's4', name: 'Şablon · İnen bas hattı', txt: 'C G/B Am Am/G | F C/E Dm7 G', pat: 'a4', bpm: 72, kapo: 0, ex: 1 },
    { id: 's5', name: 'Şablon · Kürdilihicazkâr (Mi)', txt: 'Em F Em Em | Am G F Em', pat: 'a3', bpm: 74, kapo: 0, ex: 1 }
  ];
  G.save();
};
G.screens.songs = function () {
  const list = S.songs.map(s => { const r = parseBars(s.txt); return `<div class="song"><button class="sgo" data-a="go" data-s="song" data-p='${JSON.stringify({ id: s.id })}'><b>${esc(s.name)}</b><span class="muted">${r.bars.slice(0, 8).map(G.cnPlain).join(' ')}${r.bars.length > 8 ? ' …' : ''} · ${s.bpm} bpm${s.kapo ? ' · kapo ' + s.kapo : ''}</span></button><button class="btn sm ghost" data-a="go" data-s="songed" data-p='${JSON.stringify({ id: s.id })}' aria-label="düzenle">Düzenle</button></div>`; }).join('');
  return { t: 'Şarkılarım', cat: 'sarki', h: `<p class="muted">Çalmak istediğin şarkının akorlarını internetten bul, buraya yaz. Her akor bir ölçü; <code>Am*2</code> iki ölçü, <code>%</code> öncekini tekrarlar, <code>|</code> sadece okunurluk için.</p>
<button class="btn" data-a="go" data-s="songed" data-p='{}'>+ Yeni şarkı</button><div class="songs">${list || '<p class="muted">Henüz şarkı yok.</p>'}</div>` };
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
G.actions.delsong = d => { if (confirm('Şarkı silinsin mi?')) { S.songs = S.songs.filter(x => x.id !== d.id); G.save(); G.actions.back(); } };
G.screens.song = function (p) {
  const s = S.songs.find(x => x.id === p.id); const r = parseBars(s.txt); const P = patById(s.pat);
  return { t: s.name, cat: 'sarki', h: `<div class="card">${playerHtml(r.bars, P, s.bpm, { kapo: s.kapo })}</div><div class="row g"><button class="btn sm ghost" data-a="go" data-s="songed" data-p='${JSON.stringify({ id: s.id })}'>Düzenle</button><span class="muted">Desen: ${esc(P.name)}</span></div>`,
    after: () => bindPlayer(r.bars, P, { get: () => s.bpm, set: v => { s.bpm = v; } }, s.kapo || 0) };
};

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
function barreGen() {
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
