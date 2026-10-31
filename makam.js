(function () {
'use strict';
const G = window.G, S = G.S;
const $ = s => document.querySelector(s);
const { pick, shuffle, rnd } = M;

// ---------- veri ----------
// iv: çıkış dizisi (12 eşit perdeye en yakın), gu: güçlünün derece indeksi,
// parts: [çeşni, 4|5, başlangıç derecesi], down: inişte değişen perdeler, alt: seçenekli perdeler
// ch / progs / cad: [derece, değişim, akor türü]
const MAK = [
  { id: 'rast', name: 'Rast', k: 'G', gu: 4, iv: [0, 2, 4, 5, 7, 9, 11], koma: true,
    parts: [['Rast', 5, 0], ['Rast', 4, 4]], down: [{ d: 6, a: -1 }],
    downNote: 'İnerken Fa♯ (eviç) yerine çoğunlukla Fa (acem) kullanılır.',
    komaNote: 'Si (segâh) ve Fa♯ (eviç) perdeleri bir koma kadar pestir; gitarda en yakın Si ve Fa♯ çalınır. Bu yüzden gitarda majör gam gibi duyulur, segâh rengi kaybolur.',
    west: 'Majöre yakın', ch: [[0, 0, ''], [3, 0, ''], [4, 0, ''], [1, 0, 'm'], [5, 0, 'm'], [6, -1, '']],
    progs: [[[0, 0, ''], [3, 0, ''], [4, 0, ''], [0, 0, '']], [[0, 0, ''], [1, 0, 'm'], [4, 0, ''], [0, 0, '']], [[0, 0, ''], [6, -1, ''], [3, 0, ''], [0, 0, '']]],
    cad: [4, 0, ''], cadNote: 'V – I ile karar (Re → Sol).', common: ['G', 'D', 'A', 'C'],
    use: 'Neşeli halk ezgileri, oyun havaları, majör pop parçaları.' },
  { id: 'ussak', name: 'Uşşak', k: 'A', gu: 3, iv: [0, 2, 3, 5, 7, 8, 10], koma: true,
    parts: [['Uşşak', 4, 0], ['Buselik', 5, 3]], down: [],
    downNote: 'Bazı ezgilerde Si yerine Si♭ (kürdi) dokunuşu duyulur.',
    komaNote: 'Si (segâh) perdesi Si’den bir koma pestir. Gitarda Si çalınır ve dizi La doğal minör gibi duyulur; Uşşak’ın asıl rengi ezginin seyrinden (Re güçlüsü, Sol’den karara iniş) gelir.',
    west: 'Doğal minöre yakın', ch: [[0, 0, 'm'], [6, 0, ''], [3, 0, 'm'], [2, 0, ''], [5, 0, ''], [4, 0, 'm']],
    progs: [[[0, 0, 'm'], [6, 0, ''], [0, 0, 'm']], [[3, 0, 'm'], [6, 0, ''], [0, 0, 'm']], [[0, 0, 'm'], [3, 0, 'm'], [6, 0, ''], [0, 0, 'm']]],
    cad: [6, 0, ''], cadNote: 'Karara çoğunlukla bir alttaki Sol’den gelinir (VII → i).', common: ['A', 'E', 'D'],
    use: 'Türküler, arabesk ve hüzünlü pop ezgileri.' },
  { id: 'huseyni', name: 'Hüseyni', k: 'A', gu: 4, iv: [0, 2, 3, 5, 7, 9, 10], koma: true,
    parts: [['Hüseyni', 5, 0], ['Uşşak', 4, 4]], down: [{ d: 5, a: -1 }],
    downNote: 'İnerken Fa♯ (eviç) yerine çoğunlukla Fa (acem) kullanılır.',
    komaNote: 'Si (segâh) ve Fa♯ (eviç) bir koma pestir. Gitarda Si ve Fa♯ ile La Dor dizisi gibi duyulur.',
    west: 'Dor moduna yakın', ch: [[0, 0, 'm'], [3, 0, ''], [4, 0, 'm'], [6, 0, ''], [2, 0, ''], [5, -1, '']],
    progs: [[[0, 0, 'm'], [3, 0, ''], [0, 0, 'm']], [[0, 0, 'm'], [4, 0, 'm'], [3, 0, ''], [0, 0, 'm']], [[4, 0, 'm'], [3, 0, ''], [6, 0, ''], [0, 0, 'm']]],
    cad: [3, 0, ''], cadNote: 'Fa♯ sayesinde IV (Re) majördür; Am – D – Am rengi tipiktir.', common: ['A', 'E', 'D'],
    use: 'Türküler ve Anadolu kökenli pop ezgileri.' },
  { id: 'buselik', name: 'Buselik', k: 'A', gu: 4, iv: [0, 2, 3, 5, 7, 8, 10], koma: false,
    parts: [['Buselik', 5, 0], ['Kürdi', 4, 4]], down: [], alt: [{ d: 6, a: 1 }],
    downNote: 'Mi’de Kürdi dörtlüsü yerine Hicaz dörtlüsü de kullanılır (Sol♯); karara inerken sık.',
    komaNote: 'Koma gerektirmez, gitarda tam çalınır.',
    west: 'Doğal / armonik minör', ch: [[0, 0, 'm'], [3, 0, 'm'], [4, 1, ''], [4, 0, 'm'], [5, 0, ''], [6, 0, ''], [2, 0, '']],
    progs: [[[0, 0, 'm'], [3, 0, 'm'], [4, 1, ''], [0, 0, 'm']], [[0, 0, 'm'], [6, 0, ''], [5, 0, ''], [4, 1, '']], [[0, 0, 'm'], [3, 0, 'm'], [4, 0, 'm'], [0, 0, 'm']]],
    cad: [4, 1, ''], cadNote: 'Hicaz dörtlüsüyle V majör olur (Mi majör → La minör).', common: ['A', 'E', 'D', 'B'],
    use: 'Batı minörüne en yakın makam; slow pop’ta çok yaygın.' },
  { id: 'kurdi', name: 'Kürdi', k: 'A', gu: 3, iv: [0, 1, 3, 5, 7, 8, 10], koma: false,
    parts: [['Kürdi', 4, 0], ['Buselik', 5, 3]], down: [],
    downNote: 'Karara Si♭’den (kürdi) yarım sesle inilir; bu iniş makamın imzasıdır.',
    komaNote: 'Koma gerektirmez, gitarda tam çalınır.',
    west: 'Frig modu', ch: [[0, 0, 'm'], [1, 0, ''], [3, 0, 'm'], [6, 0, 'm'], [2, 0, ''], [5, 0, '']],
    progs: [[[0, 0, 'm'], [1, 0, ''], [0, 0, 'm']], [[3, 0, 'm'], [2, 0, ''], [1, 0, ''], [0, 0, 'm']], [[0, 0, 'm'], [6, 0, 'm'], [1, 0, ''], [0, 0, 'm']]],
    cad: [1, 0, ''], cadNote: '♭II → i: Si♭ majör → La minör.', common: ['A', 'E', 'D'],
    use: 'Arabesk, fantezi ve hüzünlü pop parçaları.' },
  { id: 'kurdilihicazkar', name: 'Kürdilihicazkâr', k: 'G', gu: 3, iv: [0, 1, 3, 5, 7, 8, 10], koma: false,
    parts: [['Kürdi', 4, 0], ['Buselik', 5, 3]], down: [],
    downNote: 'Gitarda Kürdi ile aynı diziyi verir; farkı kararın Sol (Rast) ve güçlünün Do (Çargâh) olmasında ve seyirdedir.',
    komaNote: 'Koma gerektirmez, gitarda tam çalınır.',
    west: 'Frig modu', ch: [[0, 0, 'm'], [1, 0, ''], [3, 0, 'm'], [6, 0, 'm'], [2, 0, ''], [5, 0, '']],
    progs: [[[0, 0, 'm'], [1, 0, ''], [0, 0, 'm']], [[3, 0, 'm'], [2, 0, ''], [1, 0, ''], [0, 0, 'm']], [[0, 0, 'm'], [6, 0, 'm'], [1, 0, ''], [0, 0, 'm']]],
    cad: [1, 0, ''], cadNote: '♭II → i, Kürdi’deki gibi.', common: ['E', 'A', 'G', 'D'],
    use: 'Türkçe pop ve sanat müziğinde en sık duyulan makamlardan.' },
  { id: 'nihavent', name: 'Nihavent', k: 'G', gu: 4, iv: [0, 2, 3, 5, 7, 8, 11], koma: false,
    parts: [['Buselik', 5, 0], ['Hicaz', 4, 4]], down: [{ d: 6, a: -1 }],
    downNote: 'Çıkarken Re’de Hicaz dörtlüsü (Fa♯), inerken çoğunlukla Kürdi dörtlüsü (Fa).',
    komaNote: 'Koma gerektirmez, gitarda tam çalınır.',
    west: 'Armonik minör', ch: [[0, 0, 'm'], [3, 0, 'm'], [4, 0, ''], [5, 0, ''], [6, -1, ''], [2, 0, '']],
    progs: [[[0, 0, 'm'], [3, 0, 'm'], [4, 0, ''], [0, 0, 'm']], [[0, 0, 'm'], [6, -1, ''], [5, 0, ''], [4, 0, '']], [[0, 0, 'm'], [5, 0, ''], [3, 0, 'm'], [4, 0, '']]],
    cad: [4, 0, ''], cadNote: 'V majör → i (Re majör → Sol minör).', common: ['A', 'E', 'D', 'B'],
    use: 'Slow pop ve baladlarda en yaygın makam. Gitarda genelde La veya Mi’de çalınır.' },
  { id: 'hicaz', name: 'Hicaz', k: 'A', gu: 3, iv: [0, 1, 4, 5, 7, 9, 10], koma: true,
    parts: [['Hicaz', 4, 0], ['Rast', 5, 3]], down: [{ d: 5, a: -1 }],
    downNote: 'Çıkarken Re’de Rast beşlisi (Fa♯), inerken çoğunlukla Buselik beşlisi (Fa).',
    komaNote: 'Hicaz dörtlüsünün aralıkları gerçekte yarım–bir buçuk–yarım sesten biraz farklıdır; gitarda bu yaklaşıkla çalınır ve oldukça iyi duyulur.',
    west: 'Frig dominanta yakın', ch: [[0, 0, ''], [1, 0, ''], [6, 0, 'm'], [3, 0, 'm'], [2, -1, ''], [0, 0, '7']],
    progs: [[[0, 0, ''], [1, 0, ''], [0, 0, '']], [[3, 0, 'm'], [2, -1, ''], [1, 0, ''], [0, 0, '']], [[0, 0, ''], [6, 0, 'm'], [1, 0, ''], [0, 0, '']]],
    cad: [1, 0, ''], cadNote: '♭II → I: Si♭ majör → La majör. Karar akoru majördür (Do♯).', common: ['A', 'E', 'D', 'B'],
    use: 'Doğu rengi isteyen pop, arabesk ve oyun havaları. Gitarda “Mi Hicaz” ve “La Hicaz” çok çalınır.' },
  { id: 'humayun', name: 'Hümayun', k: 'A', gu: 3, iv: [0, 1, 4, 5, 7, 8, 10], koma: false,
    parts: [['Hicaz', 4, 0], ['Buselik', 5, 3]], down: [],
    downNote: 'Pop’ta “Hicaz” diye çalınan ezgilerin çoğu bu diziyle duyulur (Fa natürel).',
    komaNote: 'Gitarda yaklaşık olarak çok iyi çalınır.',
    west: 'Frig dominant', ch: [[0, 0, ''], [1, 0, ''], [3, 0, 'm'], [6, 0, 'm'], [0, 0, '7']],
    progs: [[[0, 0, ''], [1, 0, ''], [0, 0, '']], [[3, 0, 'm'], [1, 0, ''], [0, 0, '']], [[6, 0, 'm'], [0, 0, ''], [3, 0, 'm'], [0, 0, '']]],
    cad: [1, 0, ''], cadNote: '♭II → I ve iv → I (Re minör → La majör).', common: ['A', 'E', 'D'],
    use: 'Hicaz ailesi; pop ve arabeskte yoğun.' }
];
const CES = {
  Rast: { k: [9, 8, 5], s: [2, 2, 1] }, 'Uşşak': { k: [8, 5, 9], s: [2, 1, 2] }, Buselik: { k: [9, 4, 9], s: [2, 1, 2] },
  'Kürdi': { k: [4, 9, 9], s: [1, 2, 2] }, Hicaz: { k: [5, 12, 5], s: [1, 3, 1] }, 'Hüseyni': { k: [8, 5, 9, 9], s: [2, 1, 2, 2], five: true }
};
const PERDE = [['Yegâh', 'D', 'kaba'], ['Hüseyniaşiran', 'E', 'kaba'], ['Acemaşiran', 'F', 'kaba'], ['Irak', 'F#', 'kaba, koma pes'], ['Rast', 'G'], ['Dügâh', 'A'],
  ['Kürdi', 'Bb'], ['Segâh', 'B', 'koma pes'], ['Buselik', 'B'], ['Çargâh', 'C'], ['Hicaz', 'C#', 'yaklaşık'], ['Neva', 'D'], ['Hüseyni', 'E'], ['Acem', 'F'],
  ['Eviç', 'F#', 'koma pes'], ['Gerdaniye', 'G', 'tiz'], ['Muhayyer', 'A', 'tiz']];
const PNAME = { G: 'Rast', A: 'Dügâh', C: 'Çargâh', D: 'Neva', E: 'Hüseyni', B: 'Buselik', F: 'Acem' };
const KEYS = ['A', 'E', 'D', 'B', 'G', 'C'];
G.MAK = MAK;

// ---------- hesap ----------
function mScale(mk, k, dir) {
  const li = M.LET.indexOf(k[0]), kp = M.pcOf(k);
  const iv = mk.iv.slice();
  if (dir === 'down') (mk.down || []).forEach(x => { iv[x.d] += x.a; });
  return iv.map((x, i) => M.spellWith(M.LET[(li + i) % 7], (kp + x + 120) % 12));
}
function mChord(mk, k, t) { const li = M.LET.indexOf(k[0]), kp = M.pcOf(k); const pc = (kp + mk.iv[t[0]] + t[1] + 120) % 12; let r = M.spellWith(M.LET[(li + t[0]) % 7], pc); if (/##|bb/.test(r)) r = M.NICE[pc]; return r + t[2]; }
const ROMB = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
function mRoman(mk, t) {
  const base = M.MAJ[t[0]], real = mk.iv[t[0]] + t[1]; const diff = real - base;
  const acc = diff < 0 ? '♭'.repeat(-diff) : diff > 0 ? '♯'.repeat(diff) : '';
  let r = ROMB[t[0]]; if (t[2] === 'm' || t[2] === 'dim') r = r.toLowerCase();
  return acc + r + (t[2] === '7' ? '7' : t[2] === 'dim' ? '°' : '');
}
const partsTxt = mk => { const sc = mScale(mk, mk.k); return mk.parts.map(p => { const pn = PNAME[sc[p[2]][0]] || sc[p[2]]; return `${pn}’${sufx(pn)} ${p[0]} ${p[1] === 4 ? 'dörtlüsü' : 'beşlisi'}`; }).join(' + '); };
function sufx(w) { if (!w) return 'de'; const v = (w.match(/[aeıioöuüâ]/g) || []).pop(); const back = 'aıouâ'.includes(v); const hard = /[çfhkpsşt]$/.test(w); return (hard ? 't' : 'd') + (back ? 'a' : 'e'); }
G.mScale = mScale; G.mChord = mChord;

function stepTxt(a, b) { const d = (M.pcOf(b) - M.pcOf(a) + 12) % 12; return d === 1 ? 'Y' : d === 2 ? 'T' : d === 3 ? 'A' : d; }

// ---------- ekranlar ----------
G.screens.makam = function () {
  const cards = MAK.map(mk => `<button class="mk-card" data-a="go" data-s="makamd" data-p='${JSON.stringify({ id: mk.id })}'>
    <span class="mk-n">${mk.name}</span><span class="mk-w">${mk.west}</span>
    <span class="mk-s">${mScale(mk, mk.k).map(G.nnPlain).join(' ')}</span>${mk.koma ? '<span class="pill warn">koma · yaklaşık</span>' : '<span class="pill ok">gitarda tam</span>'}</button>`).join('');
  return { t: 'Makamlar', cat: 'makam', h: `<div class="intro"><p>Gitarın perdeleri oktavı 12 eşit parçaya böler (her perde ≈ 4,4 koma). TSM’de oktav 53 komadır, bu yüzden <b>segâh, eviç</b> gibi perdeler gitarda tam çıkmaz. Aşağıda her makam gitardaki <b>en yakın</b> haliyle verildi; koma gerektirenler işaretli.</p>
<div class="row g"><button class="btn sm ghost" data-a="perdeler">Perde adları</button><button class="btn sm ghost" data-a="cesniler">Dörtlü ve beşliler</button></div></div>
<h2 class="sec">Makamlar</h2><div class="mk-grid">${cards}</div>
<h2 class="sec">Makam oyunları</h2><div class="lvgrid">${G.levelList(G.tracks.makam)}</div>` };
};
G.actions.perdeler = () => G.modal(`<h3>TSM perde adları</h3><p class="muted">Gitardaki en yakın nota. “Koma pes” işaretliler gitarda tam çıkmaz.</p><table class="t">${PERDE.map(p => `<tr><td><b>${p[0]}</b></td><td>${G.nn(p[1])}</td><td class="muted">${p[2] || ''}</td></tr>`).join('')}</table>`);
G.actions.cesniler = () => G.modal(`<h3>Dörtlü ve beşliler (çeşniler)</h3><p class="muted">Dörtlü 22 koma (tam 4’lü), beşli 31 koma (tam 5’li). Beşli = dörtlü + tam ses (9 koma). Gitarda 1 perde ≈ 4,4 koma.</p><table class="t"><tr><th>Çeşni</th><th>Koma</th><th>Gitarda (perde)</th></tr>${Object.keys(CES).map(k => `<tr><td><b>${k}</b> ${CES[k].five ? 'beşlisi' : 'dörtlüsü'}</td><td>${CES[k].k.join(' + ')}</td><td>${CES[k].s.join(' – ')}${['Rast', 'Uşşak', 'Hüseyni'].includes(k) ? ' <span class="muted">(yaklaşık)</span>' : ''}</td></tr>`).join('')}</table><p class="muted">Hicaz’daki 12 komalık artık ikili, gitarda 3 perde (≈13 koma) olarak çalınır.</p>`);

let MD = { id: null, k: null, dir: 'up' };
G.screens.makamd = function (p) {
  const mk = MAK.find(m => m.id === p.id);
  if (MD.id !== mk.id) MD = { id: mk.id, k: mk.k, dir: 'up' };
  const k = MD.k, up = mScale(mk, k), dn = mScale(mk, k, 'down');
  const keys = [...new Set([mk.k].concat(mk.common, KEYS))];
  const kc = keys.map(x => `<button class="chipb ${x === k ? 'on' : ''}" data-a="mkey" data-k="${x}">${G.nn(x)}${x === mk.k ? '<em>notada</em>' : ''}</button>`).join('');
  const row = (sc, lab) => `<div class="scale"><span class="sl">${lab}</span>${sc.map((n, i) => `<span class="sn ${i === 0 ? 'k' : i === mk.gu ? 'g' : ''}">${G.nn(n)}</span>${i < 6 ? `<span class="ss">${stepTxt(n, sc[i + 1])}</span>` : `<span class="ss">${stepTxt(n, sc[0])}</span>`}`).join('')}<span class="sn k">${G.nn(sc[0])}</span></div>`;
  const changed = dn.some((n, i) => n !== up[i]);
  const pcs = (MD.dir === 'down' ? dn : up).map(M.pcOf);
  const kp = M.pcOf(k), gp = M.pcOf(up[mk.gu]);
  const cur = MD.dir === 'down' ? dn : up; const nameOf = {}; cur.forEach(n => { nameOf[M.pcOf(n)] = n; });
  const dots = [];
  for (let s = 0; s < 6; s++) for (let f = 0; f <= 12; f++) { const pc = (M.OPEN[s] + f) % 12; if (pcs.includes(pc)) dots.push({ s, f, cls: pc === kp ? 'k' : pc === gp ? 'g' : 'n', t: G.nnPlain(nameOf[pc]) }); }
  const chords = mk.ch.map(t => { const n = mChord(mk, k, t); const c = CHM.getChord(n); return `<div class="cc" data-a="mplay" data-n="${n}">${c ? CHM.diagram(c) : '<div class="muted nod">şema yok</div>'}<b>${G.cn(n)}</b><span class="muted">${mRoman(mk, t)}</span></div>`; }).join('');
  const progs = mk.progs.map((pr, i) => { const names = pr.map(t => mChord(mk, k, t)); return `<div class="prog"><div><b>${names.map(G.cn).join(' – ')}</b><div class="muted">${pr.map(t => mRoman(mk, t)).join(' – ')}</div></div><div class="row"><button class="btn sm ghost" data-a="mprog" data-i="${i}">▶</button><button class="btn sm ghost" data-a="mtoarp" data-i="${i}">Arpejde çalış</button></div></div>`; }).join('');
  const cadN = mChord(mk, k, mk.cad);
  return { t: mk.name, cat: 'makam', h: `<div class="mk-head"><div><div class="big">${mk.name}</div><div class="muted">${mk.west} · ${mk.use}</div></div>${mk.koma ? '<span class="pill warn">koma · yaklaşık</span>' : '<span class="pill ok">gitarda tam</span>'}</div>
<div class="card"><div class="muted" style="margin-bottom:6px">Karar (başlangıç perdesi)</div><div class="chips">${kc}</div></div>
<div class="two">
<div class="card"><h3>Yapı</h3><p>${partsTxt(mk)}</p><p><b>Karar:</b> ${G.nn(up[0])} · <b>Güçlü:</b> ${G.nn(up[mk.gu])}${k === mk.k ? ` (${PNAME[up[mk.gu][0]] || ''})` : ''}</p>
${row(up, 'Çıkış')}${changed ? row(dn, 'İniş') : ''}
<p class="muted">${mk.downNote}</p><p class="muted">${mk.komaNote}</p>
<div class="row g"><button class="btn sm" data-a="mscale" data-d="up">▶ Çıkış</button>${changed ? '<button class="btn sm ghost" data-a="mscale" data-d="down">▶ İniş</button>' : '<button class="btn sm ghost" data-a="mscale" data-d="updown">▶ Çık ve in</button>'}</div></div>
<div class="card"><h3>Karakteristik hareket</h3><p><b>${G.cn(cadN)} → ${G.cn(mChord(mk, k, mk.ch[0]))}</b></p><p class="muted">${mk.cadNote}</p>
<button class="btn sm ghost" data-a="mcad">▶ Dinle</button></div>
</div>
<div class="card"><div class="row"><h3>Sapta dizi</h3><div class="seg sm">${changed ? `<button class="btn sm ${MD.dir === 'up' ? 'on' : 'ghost'}" data-a="mdir" data-d="up">Çıkış</button><button class="btn sm ${MD.dir === 'down' ? 'on' : 'ghost'}" data-a="mdir" data-d="down">İniş</button>` : ''}</div></div>
<div class="fbwrap scroll">${G.board({ dots, frets: 12 })}</div><div class="legend"><span><i class="lg k"></i>karar</span><span><i class="lg g"></i>güçlü</span><span><i class="lg n"></i>dizi notası</span></div></div>
<div class="card"><h3>Akorlar</h3><div class="cgrid">${chords}</div><p class="muted">Akora dokun: çalar. Akorlar diziden kurulmuş, pop/arabesk eşlikte en çok kullanılanlardır.</p></div>
<div class="card"><h3>Örnek eşlik kalıpları</h3>${progs}</div>` };
};
G.actions.mkey = d => { MD.k = d.k; G.rerender(); };
G.actions.mdir = d => { MD.dir = d.d; G.rerender(); };
const curMk = () => MAK.find(m => m.id === MD.id);
function scaleMidis(sc, k) {
  let base = 52 + M.pcOf(k); if (base > 59) base -= 12; let prev = base;
  return sc.map((n, i) => { if (i === 0) return base; let m = prev - (prev % 12) + M.pcOf(n); while (m <= prev) m += 12; prev = m; return m; }).concat([base + 12]);
}
G.actions.mscale = d => {
  if (!Aud.init()) return; const mk = curMk(); const k = MD.k;
  const up = scaleMidis(mScale(mk, k), k), dn = scaleMidis(mScale(mk, k, 'down'), k).reverse();
  const seq = d.d === 'up' ? up : d.d === 'down' ? dn : up.concat(scaleMidis(mScale(mk, k), k).reverse().slice(1));
  Aud.seq(seq, null, 0.32, 0.55, 0.4);
};
function playProg(names) {
  if (!Aud.init()) return; let t = Aud.now() + 0.05;
  names.forEach(n => { const c = CHM.getChord(n); if (c) { const b = CHM.bassIdx(c); Aud.pluck(M.OPEN[b] + c.fr[b], t, 0.6); [3, 4, 5, 4].forEach((s, i) => { if (c.fr[s] >= 0) Aud.pluck(M.OPEN[s] + c.fr[s], t + (i + 1) * 0.22, 0.42); }); } t += 1.1; });
}
G.playProg = playProg;
G.actions.mplay = d => { const c = CHM.getChord(d.n); if (c && Aud.init()) Aud.strum(c.fr); };
G.actions.mprog = d => { const mk = curMk(); playProg(mk.progs[+d.i].map(t => mChord(mk, MD.k, t))); };
G.actions.mcad = () => { const mk = curMk(); playProg([mChord(mk, MD.k, mk.cad), mChord(mk, MD.k, mk.ch[0])]); };
G.actions.mtoarp = d => {
  const mk = curMk(); const ch = mk.progs[+d.i].map(t => mChord(mk, MD.k, t));
  if (ch.length < 4) ch.push(ch[ch.length - 1]);
  const name = `${G.nnPlain(MD.k)} ${mk.name}: ${ch.join(' – ')}`;
  let i = S.progs.findIndex(p => p.name === name);
  if (i < 0) { S.progs.push({ name, ch }); i = S.progs.length - 1; }
  S.arp.p = PROGS.length + i; G.save(); G.go('arpej');
};

// ---------- seviyeler ----------
G.buildMakam = function () {
  const nn = G.nn, cn = G.cn;
  function opts4(c, pool) { const s = [c]; for (const x of shuffle(pool)) { if (s.length >= 4) break; if (!s.includes(x)) s.push(x); } return shuffle(s); }
  function choice(prompt, correct, pool, label, why, cols) { return { kind: 'choice', prompt, opts: opts4(String(correct), pool.map(String)).map(v => ({ v, html: label(v) })), ans: [String(correct)], why, cols: cols || 2 }; }
  const ALLP = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  function m1() {
    if (Math.random() < 0.6) {
      const p = pick(PERDE); const pc = M.pcOf(p[1]);
      const pool = [-2, -1, 1, 2].map(d => ALLP[(pc + d + 12) % 12]);
      return choice(`<b>${p[0]}</b> perdesi gitarda hangi nota?`, p[1], pool, nn, `${p[0]} = ${nn(p[1])}${p[2] ? ' (' + p[2] + ')' : ''}`, 2);
    }
    const q = pick([['A', 'Dügâh'], ['Bb', 'Kürdi'], ['C', 'Çargâh'], ['C#', 'Hicaz'], ['D', 'Neva'], ['E', 'Hüseyni'], ['F', 'Acem'], ['F#', 'Eviç']]);
    const pool = ['Rast', 'Dügâh', 'Kürdi', 'Segâh', 'Çargâh', 'Hicaz', 'Neva', 'Hüseyni', 'Acem', 'Eviç'];
    return choice(`Orta oktavda <b>${nn(q[0])}</b> hangi perdedir?`, q[1], pool, x => x, `${nn(q[0])} = ${q[1]}. Sıra: Rast, Dügâh, (Kürdi), Segâh/Buselik, Çargâh, (Hicaz), Neva, Hüseyni, Acem/Eviç, Gerdaniye.`, 2);
  }
  function spellSteps(start, steps) { const li = M.LET.indexOf(start[0]); let pc = M.pcOf(start); const r = [start]; steps.forEach((s, i) => { pc = (pc + s) % 12; r.push(M.spellWith(M.LET[(li + i + 1) % 7], pc)); }); return r; }
  function m2() {
    const t = rnd(4); const names = ['Buselik', 'Kürdi', 'Hicaz', 'Rast'];
    if (t === 0) {
      const c = pick(names); const st = pick(['A', 'D', 'E', 'G']); const notes = spellSteps(st, CES[c].s);
      return choice(`<b>${notes.map(nn).join(' – ')}</b><br>Bu hangi dörtlü? <span class="muted">(gitardaki yaklaşığı)</span>`, c, names.concat(['Uşşak']).filter(x => !(c === 'Buselik' && x === 'Uşşak')), x => x + ' dörtlüsü', `${c} dörtlüsü gitarda ${CES[c].s.join('–')} perde${c === 'Rast' ? '; gerçekte ' + CES[c].k.join('+') + ' koma' : ''}.`, 2);
    }
    if (t === 1) {
      const c = pick(['Rast', 'Uşşak', 'Buselik', 'Kürdi', 'Hicaz']);
      return choice(`<b>${c} dörtlüsünün</b> aralıkları kaç koma?`, CES[c].k.join(' + '), ['Rast', 'Uşşak', 'Buselik', 'Kürdi', 'Hicaz'].map(x => CES[x].k.join(' + ')), x => x, `${c}: ${CES[c].k.join(' + ')} = 22 koma (tam 4’lü).`, 2);
    }
    if (t === 2) {
      const c = pick(['Buselik', 'Kürdi', 'Hicaz']);
      return choice(`<b>${c} dörtlüsü</b> gitarda kaç perde aralıkla çalınır?`, CES[c].s.join('–'), ['1–2–2', '2–1–2', '2–2–1', '1–3–1'], x => x, `${c}: ${CES[c].s.join('–')} perde.`, 2);
    }
    return choice('<b>Uşşak dörtlüsü</b> gitarda hangi dörtlüye benzer duyulur?', 'Buselik', ['Kürdi', 'Hicaz', 'Rast', 'Buselik'], x => x, 'Uşşak 8+5+9 koma; segâh perdesi gitarda Si’ye yuvarlanınca Buselik (9+4+9) gibi 2–1–2 perde olur.', 2);
  }
  function m3() {
    const mk = pick(MAK); const t = rnd(3); const sc = mScale(mk, mk.k);
    if (t === 0) return choice(`<b>${mk.name}</b> hangi dörtlü ve beşliden oluşur?`, partsTxt(mk), MAK.filter(m => m.id !== mk.id).map(partsTxt), x => x, `${mk.name}: ${partsTxt(mk)}`, 1);
    if (t === 1) { const gp = PNAME[sc[mk.gu][0]] || sc[mk.gu]; return choice(`<b>${mk.name}</b> makamının güçlüsü?`, gp, ['Neva', 'Hüseyni', 'Çargâh', 'Dügâh', 'Rast'], x => x, `${mk.name}: karar ${PNAME[sc[0][0]]}, güçlü ${gp} (${nn(sc[mk.gu])}).`, 2); }
    return choice(`<b>${mk.name}</b> notada hangi perdede karar eder?`, PNAME[mk.k[0]], ['Rast', 'Dügâh', 'Neva', 'Çargâh'], x => x, `${mk.name} kararı: ${PNAME[mk.k[0]]} (${nn(mk.k)}).`, 2);
  }
  function noteQ(mk, k, label) {
    const sc = mScale(mk, k); const d = 1 + rnd(6); const c = sc[d]; const cp = M.pcOf(c);
    const pool = [M.spellWith(c[0], (cp + 1) % 12), M.spellWith(c[0], (cp + 11) % 12), sc[(d + 1) % 7], sc[d - 1]];
    return choice(`<b>${label}</b> dizisinin <b>${d + 1}.</b> notası? <span class="muted">(çıkış)</span>`, c, pool, nn, `${label}: ${sc.map(nn).join(' – ')}`, 2);
  }
  function m4() { const mk = pick(MAK); return noteQ(mk, mk.k, mk.name); }
  function m5() {
    const mk = pick(MAK); const k = pick(KEYS.filter(x => x !== mk.k)); const label = `${G.nnPlain(k)} ${mk.name}`;
    if (Math.random() < 0.5) return noteQ(mk, k, label);
    const corr = mScale(mk, k).join(' ');
    const pool = MAK.filter(m => m.iv.join() !== mk.iv.join()).map(m => mScale(m, k).join(' '));
    return choice(`<b>${G.nnPlain(k)}’den ${mk.name}</b> dizisi hangisi?`, corr, pool, v => v.split(' ').map(nn).join(' '), `${label}: ${mScale(mk, k).map(nn).join(' – ')}`, 1);
  }
  function m6() {
    const mk = pick(MAK); const k = pick([mk.k].concat(mk.common)); const label = `${G.nnPlain(k)} ${mk.name}`; const t = rnd(3);
    const cad = mChord(mk, k, mk.cad), ki = mChord(mk, k, mk.ch[0]);
    const pool = mk.ch.map(x => mChord(mk, k, x)).concat([M.transposeName(cad, 2), M.transposeName(ki, 7)]);
    if (t === 0) return choice(`<b>${label}</b>: karakteristik akor (→ ${cn(ki)})?`, cad, pool.filter(x => x !== ki), cn, `${mk.cadNote} ${label}’da: ${cn(cad)} → ${cn(ki)}.`, 2);
    if (t === 1) {
      const q = mk.ch[0][2] === 'm' ? 'Minör' : 'Majör';
      return choice(`<b>${label}</b> karar akoru majör mü minör mü?`, q, ['Majör', 'Minör'], x => x, `Karar akoru ${cn(ki)}: dizinin 3. notası ${nn(mScale(mk, k)[2])}, kökten ${mk.iv[2]} yarım ses → ${q.toLowerCase()}.`, 2);
    }
    const pr = pick(mk.progs); const k2 = pick(KEYS.filter(x => x !== k));
    const corr = pr.map(x => mChord(mk, k2, x)).join(' – ');
    const pool2 = KEYS.filter(x => x !== k2).map(x => pr.map(y => mChord(mk, x, y)).join(' – '));
    return choice(`<b>${label}</b>: ${pr.map(x => cn(mChord(mk, k, x))).join(' – ')}<br>Aynısı <b>${G.nnPlain(k2)}</b> kararında?`, corr, pool2, v => v.split(' – ').map(cn).join(' – '), `${G.nnPlain(k2)} ${mk.name}: ${corr.split(' – ').map(cn).join(' – ')}`, 1);
  }
  const DIST = ['rast', 'huseyni', 'buselik', 'kurdi', 'nihavent', 'hicaz', 'humayun'];
  function m7() {
    const id = pick(DIST); const mk = MAK.find(m => m.id === id); const k = pick(KEYS);
    const pool = DIST.filter(x => x !== mk.id).map(x => MAK.find(m => m.id === x).name);
    return choice(`<b>${mScale(mk, k).map(nn).join(' · ')}</b><br>Karar ${nn(k)}. Bu hangi makamın dizisi?`, mk.name, pool, x => x, `${mk.name}: ${partsTxt(mk)} · ${mk.west}`, 2);
  }
  const L = {
    m1: `<p>TSM’de her perdenin bir adı vardır. Notada karar perdesi (örn. Dügâh) La’ya, Rast Sol’e denk gelir. Gitarda en yakın notalar:</p><table class="t">${PERDE.slice(4, 15).map(p => `<tr><td><b>${p[0]}</b></td><td>${nn(p[1])}</td><td class="muted">${p[2] || ''}</td></tr>`).join('')}</table><p class="muted">Kaba (alt oktav): Yegâh, Hüseyniaşiran, Acemaşiran, Irak. Tiz: Gerdaniye, Muhayyer.</p>`,
    m2: `<p>Makamlar <b>dörtlü</b> (22 koma, tam 4’lü) ve <b>beşli</b> (31 koma, tam 5’li) parçalarından kurulur. Beşli = dörtlü + tam ses (9 koma).</p><table class="t"><tr><th>Dörtlü</th><th>Koma</th><th>Gitarda</th></tr>${['Rast', 'Uşşak', 'Buselik', 'Kürdi', 'Hicaz'].map(k => `<tr><td>${k}</td><td>${CES[k].k.join('+')}</td><td>${CES[k].s.join('–')}</td></tr>`).join('')}</table><p>Gitarda 1 perde ≈ 4,4 koma. Bu yüzden 8 komalık <b>büyük mücennep</b> (Rast ve Uşşak’taki segâh) iki perde arasında kalır: Rast majör dörtlüsü gibi, Uşşak Buselik gibi duyulur.</p>`,
    m3: `<p>Bir makamı tanımlayan üç şey: <b>dizi</b> (hangi dörtlü + beşli), <b>karar</b> (bitiş perdesi) ve <b>güçlü</b> (dörtlü ile beşlinin birleştiği, ezginin dayandığı perde).</p>${MAK.map(m => `<p><b>${m.name}:</b> ${partsTxt(m)}. Güçlü: ${PNAME[mScale(m, m.k)[m.gu][0]]}.</p>`).join('')}`,
    m4: `<p>Notada her makam sabit bir perdeden yazılır: Rast, Nihavent ve Kürdilihicazkâr <b>Rast (Sol)</b>, diğerleri <b>Dügâh (La)</b> perdesinde karar eder.</p><p>Diziyi ezberlemenin yolu çeşnileri birleştirmek: Hicaz = La’da Hicaz dörtlüsü (La Si♭ Do♯ Re) + Re’de Rast beşlisi (Re Mi Fa♯ Sol La).</p>`,
    m5: `<p>Gitarda makamlar her perdeden çalınır: “Mi Hicaz”, “Re Nihavent” gibi. Yöntem: aralık kalıbını koru, harfleri sırayla kullan.</p><p>Hicaz La’da: La Si♭ Do♯ Re → <b>Y A Y</b>. Mi’den: Mi Fa Sol♯ La. Re’den: Re Mi♭ Fa♯ Sol.</p><p>Gitarcılar genelde açık tellerin tınısı için La, Mi ve Re kararlarını seçer; ses aralığı uymazsa kapo kullanılır.</p>`,
    m6: `<p>Makamsal eşlikte akorlar diziden kurulur ve bazı hareketler makamı hemen tanıtır:</p><p><b>Kürdi ailesi:</b> ♭II → i (Si♭ → Am)<br><b>Hicaz ailesi:</b> ♭II → I (Si♭ → A). Karar akoru <b>majördür</b> çünkü dizide Do♯ var.<br><b>Nihavent / Buselik:</b> V majör → i (E → Am)<br><b>Uşşak:</b> VII → i (G → Am)<br><b>Hüseyni:</b> IV majör (D), Fa♯ sayesinde.</p>`,
    m7: `<p>Gitarda koma yok; diziyi 12 eşit perdeyle tanırsın. Ayırt edici notalar:</p><p><b>2. derece yarım ses</b> (Si♭): Kürdi ya da Hicaz ailesi. Üstüne <b>3. derece büyük</b> (Do♯) gelirse Hicaz/Hümayun; 6. derece Fa♯ ise Hicaz, Fa ise Hümayun.<br><b>7. derece yükselmiş</b> (Sol♯ ya da Fa♯ Sol kararlıda): Nihavent.<br><b>6. derece büyük</b> (Fa♯ La kararlıda): Hüseyni.<br><b>3. derece büyük, 2. tam</b>: Rast.<br>Hiçbiri yoksa Buselik (Uşşak da gitarda böyle duyulur).</p>`
  };
  return [
    ['m1', 'Perde adları', 'Dügâh, Neva, Hüseyni... gitarda hangi nota', m1],
    ['m2', 'Dörtlü ve beşliler', 'Çeşnilerin koma ve perde aralıkları', m2],
    ['m3', 'Makam yapıları', 'Hangi dörtlü + beşli, karar ve güçlü', m3],
    ['m4', 'Makam dizileri', 'Notadaki kararından dizinin notaları', m4],
    ['m5', 'Her perdeden makam', 'Mi Hicaz, Re Nihavent... diziyi başka kararda kur', m5],
    ['m6', 'Makam akorları', 'Karakteristik akorlar ve kalıpları transpoze et', m6],
    ['m7', 'Diziden makamı tanı', 'Notaları verilen dizinin makamı', m7]
  ].map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], lesson: L[a[0]] }));
};
})();
