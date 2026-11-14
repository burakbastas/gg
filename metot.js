// Klasik metotlar (Delcamp dışındakiler), Klasik ve Repertuvarım merkezi, JustinGuitar kursu ve video oynatıcı.
// İçerik kopyalanmaz: notalar ve videolar kaynaklarından uygulamanın içine gömülerek açılır.
(function () {
'use strict';
const G = window.G, S = G.S, K = G.KURS;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fact = (k, v, cls) => `<span class="fact"><span class="fk">${k}</span><span class="fv ${cls || ''}">${v}</span></span>`;
const jp = o => esc(JSON.stringify(o));
const VW = () => (S.vw = S.vw || {});

// ---------------- video dersleri ----------------
const COURSES = {};
function course(c) {
  if (COURSES[c]) return COURSES[c];
  let r = null;
  if (c === 'w1' || c === 'w2') r = { t: c === 'w1' ? 'Metot dersleri · 1. cilt' : 'Metot dersleri · 2. cilt', cat: 'klasik', ls: K[c].map(([t, id]) => ({ t, id })) };
  else if (/^jg[1-7]$/.test(c)) {
    const g = +c.slice(2), ls = [];
    K.jg[g - 1].forEach(([mt, L], m) => L.forEach(([t, id, d]) => ls.push({ t, id, d, m, mt })));
    r = { t: 'JustinGuitar ' + g + '. seviye', cat: 'akor', g, ls };
  }
  return (COURSES[c] = r);
}
const cProg = c => { const C = course(c); return { w: C.ls.filter(x => VW()[x.id]).length, n: C.ls.length }; };
const nextIn = c => { const C = course(c); const i = C.ls.findIndex(x => !VW()[x.id]); return i; };
const vrow = (c, i, x, cur, r) => `<button class="vl${VW()[x.id] ? ' ok' : ''}${cur ? ' cur' : ''}" data-a="vopen" data-c="${c}" data-v="${i}"${r ? ' data-r="1"' : ''} data-id="${x.id}"${cur ? ' aria-current="true"' : ''}><span class="vk" aria-hidden="true">✓</span><span class="vt">${esc(x.t)}</span>${x.d ? `<span class="vd">${x.d}</span>` : ''}</button>`;
const ytFrame = (id, t) => `<div class="vbox"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1" title="${esc(t)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
const toolChip = ([s, l]) => s === 'barre' ? `<button class="chipb" data-a="barregame">${l}</button>` : s === 'klavye' || s === 'armoni' ? `<button class="chipb" data-a="jgt" data-v="${s}">${l}</button>` : `<button class="chipb" data-a="go" data-s="${s}"${s === 'tonlar' ? ` data-p='{"k":"C","t":"maj"}'` : ''}>${l}</button>`;
const W_TOOLS = [['sagel', 'Sağ el alıştırmaları'], ['solel', 'Sol el alıştırmaları'], ['klavye', 'Klavyede notalar']];

G.screens.vid = function (p) {
  const C = course(p.c); if (!C) return G.screens.klasik();
  const i = Math.max(0, Math.min(C.ls.length - 1, p.i | 0)), L = C.ls[i], w = VW()[L.id];
  const sib = C.ls.map((x, j) => [x, j]).filter(([x]) => L.m == null || x.m === L.m);
  const tools = C.g ? JGG[C.g - 1][3] : W_TOOLS;
  return { t: L.t, cat: C.cat, h: `<div data-keep="1">${ytFrame(L.id, L.t)}
<div class="vhead"><b>${esc(L.t)}</b><span class="muted">${C.t}${L.mt ? ' · ' + esc(L.mt) : ''} · ${i + 1}/${C.ls.length}${L.d ? ' · ' + L.d : ''}</span></div>
<div class="vnav"><button class="btn sm ghost" data-a="vgo" data-c="${p.c}" data-v="${i - 1}"${i ? '' : ' disabled'}>‹ Önceki</button><button class="btn sm vwb ${w ? 'on' : 'ghost'}" data-a="vw" data-id="${L.id}" aria-pressed="${!!w}">${w ? '✓ İzledim' : 'İzledim'}</button><span class="grow"></span><button class="btn sm" data-a="vgo" data-c="${p.c}" data-v="${i + 1}" data-mark="${L.id}"${i < C.ls.length - 1 ? '' : ' disabled'}>Sonraki ›</button></div>
<div class="muted vtl">Uygulamada çalış:</div><div class="chips">${tools.map(toolChip).join('')}</div>
<h2 class="sec">${L.mt ? esc(L.mt) : C.t}</h2><div class="card vls">${sib.map(([x, j]) => vrow(p.c, j, x, j === i, true)).join('')}</div></div>` };
};
function setVW(id, on) {
  if (on) VW()[id] = G.dayKey(); else delete VW()[id];
  G.save();
  document.querySelectorAll(`.vl[data-id="${id}"]`).forEach(b => b.classList.toggle('ok', on));
  document.querySelectorAll(`.vwb[data-id="${id}"]`).forEach(b => { b.classList.toggle('on', on); b.classList.toggle('ghost', !on); b.setAttribute('aria-pressed', on); b.textContent = on ? '✓ İzledim' : 'İzledim'; });
}
G.actions.vw = d => setVW(d.id, !VW()[d.id]);
G.actions.vgo = d => { if (d.mark && !VW()[d.mark]) setVW(d.mark, true); G.replace('vid', { c: d.c, i: +d.v }); };
G.actions.vopen = d => d.r ? G.replace('vid', { c: d.c, i: +d.v }) : G.go('vid', { c: d.c, i: +d.v });
// kaldığın yerden devam kartı
const resumeCard = (c, label) => { const i = nextIn(c); if (i < 0) return ''; const x = course(c).ls[i]; return `<button class="resume" data-a="vopen" data-c="${c}" data-v="${i}"><span class="rl"><i aria-hidden="true"></i>${label}</span><b>${esc(x.t)}</b><span class="ra"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg></span></button>`; };
const modBlock = (c, num, title, rows, w, n, open) => `<details class="mod${w === n ? ' ok' : ''}"${open ? ' open' : ''}><summary><span class="lvn">${num}</span><span><b>${title}</b><span class="muted">${w}/${n} ders</span></span></summary><div class="vls">${rows}</div></details>`;

// ---------------- This is Classical Guitar (Bradford Werner) ----------------
const WU = 'https://www.thisisclassicalguitar.com/wp-content/uploads/';
const DPB = 'https://www.classical-guitar-sheet-music.com/apdfsdelcamp/';
// yalnızca notası ve videosu ücretsiz olan parçalar. Besteci|Parça|anahtar|PDF|YouTube|ek PDF'ler (Etiket=yol;…)
const WF = {
1: `Carulli|Moderato, Op.192|moderato-op192-carulli-pdf-lesson|2020/06/Carulli-Moderato-Op192-Free.pdf|Sx7fjTMieoE`,
2: `Anonim|Spagnoletta|spagnoletta-for-guitar-free-pdf|2014/11/Spagnoletta.pdf|CrNgfJ7BPNM
Anonim|Wilson’s Wilde|wilsons-wilde-free-pdf-or-tab|2015/05/Wilsons-Wilde.pdf|EB11faOjL4k`,
3: `İskoç ezgisi|Auld Lang Syne|auld-lang-syne-guitar-free-pdf-tab|2015/12/Auld-Lang-Syne-2017.pdf|t2_DIzrI5GI
Holst|In the Bleak Midwinter|free-pdf-in-the-bleak-midwinter-guitar|2016/12/In-The-Bleak-Midwinter-Free.pdf|qi27tFbcd6Y
Ferrer|Ejercicio No.9|ejercicio-no-9-ferrer-free-pdf-tab|2017/03/Ferrer-Ejercicio9.pdf|I_5JrcZ4Q-U
Mertz|Minka|minka-mertz-sheet-music-lesson|2020/10/Mertz-Minka-Guitar-Free.pdf|tJO6eWxX6Hk`,
4: `Dalza|Recercar|recercar-dalza-guitar-free-pdf|2019/03/Dalza-Recercar-Guitar-2019.pdf|YG2b6Dtuz5M
Dowland|Mrs. Winters Jump|mrs-winters-jump-dowland-free-pdf|2015/03/Dowland-Winters-Jump-Free.pdf|bSDwQjdBUV8
Giuliani|Study No.2, Op.1 Bölüm 3|study-no2-op1-part3-giuliani-string-damping|2020/08/Giuliani-No2-Op1-Part3-Free.pdf|baRhvOkNbzk
Giuliani|Op.1 Bölüm 4, No.1|op-1-four-no-1-giuliani|2013/11/Giuliani-Studio-Op1-No1-Notes-TAB.pdf|
Sagreras|Lección 84|leccion-no84-sagreras-lesson-free-pdf|2018/12/Sagreras-Leccion-84.pdf|o5ssuhWZi1E|Parmak numarasız=2018/12/Sagreras-Lession84-Unfingered.pdf
Sagreras|Lección 3, 2. kitap|leccion-no3-book-2-sagreras-pdf-lesson|2021/06/Sagreras-Leccion-No3-Book2.pdf|r9Ua3XjDWkQ
Sagreras|Lección 5, 2. kitap|leccion-no5-book2-sagreras-pdf-lesson|2021/06/Sagreras-Book2-No5-Guitar.pdf|kcGsLMPfr7k
Sor|Study No.13, Op.35 (Segovia No.2)|sor-study-no-13-op-35-free-pdf-tab|2015/05/Sor-no13-op35-Free.pdf|GxUSkYfEoMQ`,
5: `Cutting|Greensleeves|greensleeves-cutting-free-pdf-tab|2015/10/Cutting-Greensleeves-Free-2018.pdf|BC4iO_Mr-gs
Giuliani|Study No.1, Op.1 Bölüm 3|etude-op1-part3-no1-giuliani-free-pdf|2019/04/Giuliani-Op1-Part3-No1-2019-Free.pdf|60bm43XRhzI
Obregón|Amanda’s Gavotte|amandas-gavotte-obregon-lesson-free-pdf|2019/08/Obregon-Amandas-Gavotte.pdf|iAM74GPuTns
Sagreras|Lección 11, 2. kitap|leccion-no11-book2-sagreras-pdf|2021/08/Sagreras-Book2-Leccion-No11.pdf|L-jNgiGXepo
Sor|Study No.15, Op.44|sor-study-no15-op44-free-pdf-tab|2016/01/Sor-op44-no15-Free.pdf|2deXsjsELUU
Sor|Study No.18, Op.35|sor-study-op35-no18-free-pdf|2019/02/Sor-Op35-No18-2019-Free.pdf|LN2KIDqOkVY`,
6: `Chopin / Tárrega|Prelude, Op.28 No.7|preludio-no7-op28-chopin-guitar-free-pdf|2020/03/Chopin-Prelude-Op28-No7-Guitar-Free.pdf|HxI0NfOo_xc
Dalza|Calata ala spagnola|calata-ala-spagnola-dalza-sheet-music-pdf|2015/04/Dalza-spagnola.pdf|UjBznj_TS54
Johnson|Alman|alman-robert-johnson-guitar-free-pdf|2017/10/Johnson-Alman-Free.pdf|wNfMCH5-gqw
Kellner|Passepied (La majör)|passepied-kellner-guitar-pdf-lesson|2017/01/Kellner-David-16-Auserlesene-Lauten-Stucke.pdf|elX2Zhs3PQU
Kellner|Pastorel (La majör)|pastorel-david-kellner-lesson-pdf|2017/01/Kellner-David-16-Auserlesene-Lauten-Stucke.pdf|u9-25oH-hrs
Mertz|Nocturne No.2, Op.4|nocturne-no-2-op-4-by-mertz-free-pdf|2014/07/mertz-nocturnes.pdf|5neKWXWgJTA`,
7: `Bach|Prelude, Çello Süiti No.1, BWV 1007|bach-cello-suite-no-1-bwv-1007-free-pdfs|2014/08/cello-suite1-bwv1007-Dmajor.pdf|fbQeF2IBW0E|Do majör=2014/08/cello-suite1-bwv1007-Cmajor.pdf;Parmak numarasız=2018/05/Bach-BWV1007-Prelude-Unfingered.pdf
Kellner|Rondeau (La majör)|rondeau-in-a-kellner-guitar|2017/01/Kellner-David-16-Auserlesene-Lauten-Stucke.pdf|nM6X2yFRf3s
Llobet|El Testament d’Amèlia|el-testament-damelia-guitar-llobet-free-pdf|${DPB}Miguel_Llobet__El_Testament_d_Amelia_%281900%29.pdf|z9S_sG3Ihf0
Sor|Study No.8, Op.6 (Segovia No.1)|sor-study-no8-op6-free-pdf-tab|2015/05/Sor-op6-no8-Free.pdf|NmGKVUfeiM8`,
9: `Beethoven / Tárrega|Ay Işığı Sonatı (Adagio)|beethovens-moonlight-sonata-guitar-free-pdf|2016/09/Beethoven-Moonlight-Tarrega-Free.pdf|WF9EEtvvYSU
Tárrega|Recuerdos de la Alhambra|recuerdos-de-la-alhambra-tarrega-free-pdf|2014/07/Tarrega-Recuerdos-Guitar-Free-2018.pdf|hzoU5ebiOWc`
};
const pdfU = s => /^https?:/.test(s) ? s : WU + s;
const COLLPDF = /Kellner-David-16|mertz-nocturnes/;
const wList = g => (WF[g] || '').split('\n').filter(Boolean).map(l => {
  const [c, t, u, pdf, yt, alt] = l.split('|');
  return { c, t, g: +g, k: 'w:' + u, pdf: pdfU(pdf), yt: yt || '', coll: COLLPDF.test(pdf), alt: (alt || '').split(';').filter(Boolean).map(a => { const [n, p] = a.split('='); return [n, pdfU(p)]; }) };
});
let WALL = null;
const wAll = () => { if (!WALL) { WALL = {}; Object.keys(WF).forEach(g => wList(g).forEach(x => { WALL[x.k] = x; })); } return WALL; };
const WGR = Object.keys(WF).map(Number);
// Werner seviyesi → teknikte karşılık gelen Delcamp seviyesi
const W2D = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8 };
function techFor(dg) {
  const d = G.KL.DG.find(x => x.g === dg); if (!d) return '';
  const ex = d.ex.map(id => `<button class="chipb" data-a="go" data-s="ex" data-p='${jp({ id })}'>${G.EX[id].n}</button>`).join('');
  const gi = d.giu.map(lv => { const items = G.KL.GD.filter(g => g[1] === lv); const dn = items.filter(g => S.giu[g[0]]).length; return `<button class="chipb" data-a="go" data-s="giu">Giuliani 120 · ${G.KL.GLV[lv][0]} · ${dn}/${items.length}</button>`; }).join('');
  return `<div class="chips">${ex}${gi}</div>`;
}
const wSub = x => x.c + (x.yt ? ' · nota ve video' : ' · nota');

G.screens.ticg = function () {
  G.KL.initRep();
  const sg = G.ui.wseg === 'par' ? 'par' : 'ders';
  const seg = G.segBar('wseg', sg, [['ders', 'Metot dersleri'], ['par', 'Seviyeli parçalar']]);
  const head = `<div class="card mhead"><p><b>Bradford Werner</b>’in sitesinin ücretsiz kısmı: metodunun iki cildine eşlik eden ${K.w1.length + K.w2.length} video ders ve notası ile videosu ücretsiz ${Object.keys(wAll()).length} parça. Hepsi uygulamanın içinde açılır.</p><div class="facts">${fact('Seviye', '1–10')}${fact('İçerik', 'Video + nota', 'ok')}${fact('Odak', 'Adım adım ders')}</div></div>`;
  let h = '';
  if (sg === 'ders') {
    const p1 = cProg('w1'), p2 = cProg('w2');
    const blk = (c, num, title, P, open) => modBlock(c, num, title, course(c).ls.map((x, i) => vrow(c, i, x)).join(''), P.w, P.n, open);
    const r = nextIn('w1') >= 0 ? resumeCard('w1', p1.w ? 'Devam et · 1. cilt' : 'Başla · 1. cilt') : resumeCard('w2', p2.w ? 'Devam et · 2. cilt' : 'Başla · 2. cilt');
    h = `${r}<p class="muted">Sıfırdan başlayan ders dizisi: oturuş, sağ ve sol el, nota ve ritim okuma, ilk etütler, düetler, akor eşliği. 2. ciltte gamlar, tonlar ve pozisyonlar. Videoyu bitirince “İzledim” de; “Sonraki” de işaretler.</p>
${blk('w1', 1, '1. cilt · temeller', p1, p1.w < p1.n)}${blk('w2', 2, '2. cilt · gamlar, tonlar, pozisyonlar', p2, p1.w === p1.n && p2.w < p2.n)}`;
  } else {
    const g = WGR.includes(G.ui.wg) ? G.ui.wg : 1; const L = wList(g);
    const chips = WGR.map(x => `<button class="chipb ${x === g ? 'on' : ''}" data-a="wg" data-v="${x}" aria-pressed="${x === g}">${x}</button>`).join('');
    const done = L.filter(x => S.rep[x.k] === 2).length, act = L.filter(x => S.rep[x.k] === 1).length;
    h = `<div class="chips" role="group" aria-label="Seviye">${chips}</div>
<div class="card"><h3>${g}. seviye</h3><p class="muted">${L.length} parça · çalışıyorum ${act} · öğrendim ${done}. Teknikte Delcamp ${W2D[g]}. seviyeye denk:</p>${techFor(W2D[g])}</div>
<p class="muted">Parçaya dokun: ders videosu ve nota birlikte açılır. Sağdaki düğme durumu değiştirir; tempo ve kayıt için “⋯”.</p>
<div class="reps">${L.map(x => G.repRow(x.k, x.t, wSub(x), '', 'les', 'This is Classical Guitar ' + g + '. seviye')).join('')}</div>`;
  }
  return { t: 'This is Classical Guitar', cat: 'klasik', h: `${head}${seg}${h}<p class="muted">Kaynak: thisisclassicalguitar.com (Bradford Werner). Videolar YouTube oynatıcısıyla, notalar Google görüntüleyicisiyle açılır.</p>` };
};
G.actions.wg = d => { G.ui.wg = +d.v; G.rerender(); };
G.actions.wseg = d => { G.ui.wseg = d.v; G.rerender(); };

// parça ders ekranı: video ve nota, durum, tempo ve kayıt
G.screens.wp = function (p) {
  const x = wAll()[p.k];
  if (!x) return { t: 'Parça', cat: 'klasik', h: '<div class="card"><p class="muted">Bu parça artık listede yok.</p></div>' };
  G.KL.initRep();
  if (G.ui.wpk !== x.k) { G.ui.wpk = x.k; G.ui.wpi = 0; }
  const mode = x.yt ? (G.ui.wpv || 'v') : 'n';
  const pdfs = [['Nota', x.pdf]].concat(x.alt), pi = Math.min(G.ui.wpi || 0, pdfs.length - 1);
  const v = S.rep[x.k] || 0, src = 'This is Classical Guitar ' + x.g + '. seviye';
  const meta = jp({ t: x.t, s: wSub(x), u: '', md: 'les', src });
  const tabs = x.yt ? G.segBar('wpv', mode, [['v', 'Video ders'], ['n', 'Nota']]) : '';
  const body = mode === 'v' ? ytFrame(x.yt, x.t)
    : `${pdfs.length > 1 ? `<div class="chips">${pdfs.map((q, i) => `<button class="chipb ${i === pi ? 'on' : ''}" data-a="wpi" data-v="${i}">${q[0]}</button>`).join('')}</div>` : ''}${x.coll ? '<p class="muted">Bu nota birkaç parçalık bir derleme; parçayı sayfalarda bul.</p>' : ''}${G.pdfFrame(pdfs[pi][1], x.t)}`;
  return { t: x.t, cat: 'klasik', h: `<div data-keep="1"><div class="card wph"><div><b>${esc(x.t)}</b><span class="muted">${esc(x.c)} · ${src}</span></div><div class="row g"><button class="btn sm rsb s${v}" data-a="repset" data-ip="1" data-k="${esc(x.k)}" data-m="${meta}">${v ? G.KL.RS[v] : 'başlamadım'}</button><button class="btn sm ghost" data-a="repdet" data-k="${esc(x.k)}" data-t="${esc(x.t)}">Tempo ve kayıt</button></div></div>
${tabs}${body}
<h2 class="sec">Teknik karşılığı</h2><p class="muted">Delcamp ${W2D[x.g]}. seviyenin alıştırmaları:</p>${techFor(W2D[x.g])}</div>` };
};
G.actions.wpv = d => { G.ui.wpv = d.v; G.rerender(); };
G.actions.wpi = d => { G.ui.wpi = +d.v; G.rerender(); };
G.actions.lesopen = (d, el, e) => { if (e) e.preventDefault(); G.go('wp', { k: d.k }); };

// ---------------- Telifsiz klasik metotlar (IMSLP) ----------------
const IMV = 'https://vmirror.imslp.org/files/imglnks/usimg/';
const PD = [
  ['car241', 'Carulli', 'Metodo per chitarra, Op.241', '8/8f/IMSLP397088-PMLP339588-Carulli_Metodo_op_241.pdf', '1–3', 'Metot ve kısa parçalar; Delcamp’ın ilk seviyelerinde bol yer alır.', 7.5],
  ['car59', 'Carcassi', 'Méthode complète, Op.59', '9/92/IMSLP34490-PMLP77530-boije-1129.pdf', '1–3', 'Gamlar, akorlar ve 50 kolay parça; pozisyonlara sistemli giriş.', 12.7],
  ['sor60', 'Sor', 'Introduction à l’étude de la guitare, Op.60', 'd/da/IMSLP836891-PMLP93616-Sor_F-Intro_25_Et_Op60.pdf', '1–3', '25 kısa ders; okuma ve iki sesli çalmanın temeli.', 0.5],
  ['agu', 'Aguado', 'Nuevo método para guitarra (1843)', '3/31/IMSLP265882-PMLP430836-DAguado_Nuevo_m%C3%A9todo_para_guitarra_1843.pdf', '1–5', 'Sağ el tekniği ve ses üzerine en ayrıntılı eski metot; dersler ve alıştırmalar.', 10.3],
  ['giu1', 'Giuliani', 'Studio per la chitarra, Op.1', 'a/a0/IMSLP26396-PMLP58675-Giuliani_Studio_Op1.pdf', '1–6', '120 sağ el arpeji ve sol el alıştırmaları; uygulamadaki Giuliani 120 bu eserden.', 7.1],
  ['sor35', 'Sor', '24 Exercices très faciles, Op.35', 'e/ec/IMSLP838080-PMLP237526-Sor_F-24_Exercises_tres_faciles_Op35.pdf', '3–5', 'Kolay ama müzikal etütler; Delcamp 3. seviyede başlar.', 0.8],
  ['giu50', 'Giuliani', 'Le Papillon, Op.50', '9/90/IMSLP260706-PMLP90246-GiulianiOp50.pdf', '2–5', '32 kısa, kolay parça.', 8.4],
  ['sor31', 'Sor', '24 Leçons progressives, Op.31', 'c/ca/IMSLP838450-PMLP492621-Sor_F-Lecons_prog_Op31_RiBS0948.pdf', '4–6', 'Orta seviyeye geçişte pozisyon ve çok sesli çalma.', 1],
  ['car60', 'Carcassi', '25 Études mélodiques progressives, Op.60', '2/28/IMSLP34392-RiBS0980.pdf', '5–8', 'Orta–ileri etütlerin standardı; arpej, bağ ve hız.', 1.3],
  ['sor6', 'Sor', '12 Études, Op.6', '6/60/IMSLP840332-PMLP97592-Sor_F-12_Etudes_Op6_RiBS0690.pdf', '7–8', 'İleri etütler; konser repertuvarına köprü.', 0.7]
];
const pdSub = p => `yaklaşık Delcamp ${p[4]} · ${p[5]} · ${String(p[6]).replace('.', ',')} MB`;
const pdAll = () => PD.reduce((o, p) => { o['pd:' + p[0]] = p; return o; }, {});
G.screens.pd = function () {
  const rows = PD.map(p => G.repRow('pd:' + p[0], p[1] + ': ' + p[2], pdSub(p), IMV + p[3], 'pdf', 'Telifsiz metotlar')).join('');
  return { t: 'Telifsiz klasik metotlar', cat: 'klasik', h: `<div class="card mhead"><p>19. yüzyıl gitar ustalarının kendi yazdığı, kolaydan zora sıralı metot ve etüt kitapları. Telif süresi dolduğu için serbest; tarama baskıları IMSLP’den uygulamanın içinde açılır. Bugünkü konservatuvar programlarının ortak temeli bu eserler.</p><div class="facts">${fact('Seviye', 'Opus sırası')}${fact('İçerik', '10 kitap', 'ok')}${fact('Odak', '19. yy. etütleri')}</div></div>
<p class="muted">Önerilen sıra yukarıdan aşağıya. Bir metotla başla (Carulli, Carcassi ya da Sor Op.60), sağ eli Giuliani Op.1 ile her gün çalış, etütlere seviyene göre geç. Kitaba dokun: nota açılır. Durumu düğmeyle tut, tempo ve kaydı “⋯” ile.</p>
<div class="reps">${rows}</div>
<div class="row g"><button class="btn sm ghost" data-a="go" data-s="giu">Giuliani 120 arpeji uygulamada çalış</button></div>
<p class="muted">Kaynak: IMSLP (imslp.org), kamu malı baskılar.</p>` };
};

// ---------------- Klasik merkezi ----------------
const METHODS = [
  { id: 'delcamp', n: 'Delcamp', a: 'Forum derlemeleri', f: [['Seviye', '1–8'], ['İçerik', 'Nota + teknik', 'ok'], ['Odak', 'Teknik + repertuvar']], d: 'Her seviyede teknik alıştırmalar ve bol parça; Giuliani 120 formülleriyle eşleşik. Uygulamanın ana yolu.' },
  { id: 'ticg', n: 'This is Classical Guitar', a: 'Bradford Werner', f: [['Seviye', '1–10'], ['İçerik', 'Video + nota', 'ok'], ['Odak', 'Adım adım ders']], d: 'Metoda eşlik eden 67 video ders ve videolu, notalı 33 parça. Kendi başına çalışana en öğretici yol.' },
  { id: 'pd', n: 'Telifsiz klasik metotlar', a: 'Carcassi · Sor · Aguado · Carulli · Giuliani', f: [['Seviye', 'Opus sırası'], ['İçerik', '10 kitap', 'ok'], ['Odak', '19. yy. etütleri']], d: 'Ustaların kendi sıraladığı metot ve etütler; konservatuvar programlarının ortak temeli.' }
];
function methodProg(id) {
  if (id === 'delcamp') { G.KL.initRep(); const D = G.KL.DG; return '%' + Math.round(D.reduce((a, d) => a + G.KL.gradeProg(d), 0) / D.length); }
  const pre = { ticg: 'w:', pd: 'pd:' }[id];
  const parts = Object.keys(S.rep || {}).filter(k => k.startsWith(pre) && S.rep[k]).length;
  const vids = id === 'ticg' ? cProg('w1').w + cProg('w2').w : 0;
  return [vids ? vids + ' video' : '', parts ? parts + (id === 'pd' ? ' kitap' : ' parça') : ''].filter(Boolean).join(' · ');
}
// tüm metotlardaki parçalar; artık uygulamada olmayan kaynaklar listelenmez
function repAll() {
  G.KL.initRep(); const out = []; const W = wAll(), P = pdAll();
  Object.keys(S.rep || {}).forEach(k => {
    const v = S.rep[k]; if (!v) return;
    const m = /^(\d+):(.*)$/.exec(k);
    if (m) { const d = G.KL.DG.find(x => x.g === +m[1]); const i = d ? d.rep.findIndex(r => r[1] === m[2]) : -1; if (i < 0) return; const r = d.rep[i]; const U = G.KL.repUrl(r); out.push({ k, v, t: r[1], s: r[0], u: U.u, md: U.own ? 'pdf' : 'pdfc', src: 'Delcamp ' + d.g + '. seviye' }); return; }
    if (W[k]) { const x = W[k]; out.push({ k, v, t: x.t, s: wSub(x), u: '', md: 'les', src: 'This is Classical Guitar ' + x.g + '. seviye' }); return; }
    if (P[k]) { const p = P[k]; out.push({ k, v, t: p[1] + ': ' + p[2], s: pdSub(p), u: IMV + p[3], md: 'pdf', src: 'Telifsiz metotlar' }); }
  });
  return out;
}
G.screens.klasik = function () {
  G.KL.initRep();
  const sg = ['met', 'tek', 'rep'].includes(G.ui.kseg) ? G.ui.kseg : 'met';
  const seg = G.segBar('kseg', sg, [['met', 'Metotlar'], ['tek', 'Teknik'], ['rep', 'Repertuvarım']]);
  let h = '';
  if (sg === 'met') {
    h = `<p class="muted">Bir metot seç. Hepsi ücretsiz, notalar ve videolar uygulamanın içinde açılır. Teknik alıştırmalar ve repertuvar listen tüm metotlarda ortak.</p><div class="mcards">${METHODS.map(m => {
      const p = methodProg(m.id);
      return `<button class="mcard" data-a="go" data-s="${m.id}"><span class="mtop"><b>${m.n}</b>${p ? `<span class="mbadge">${p}</span>` : ''}</span><span class="ma">${m.a}</span><span class="facts">${m.f.map(x => fact(x[0], x[1], x[2])).join('')}</span><span class="md">${m.d}</span></button>`;
    }).join('')}</div>`;
  } else if (sg === 'tek') {
    h = `<p class="muted">Tüm metotlarla birlikte her gün: sağ el arpejleri, sağ ve sol el teknik alıştırmaları. Hepsinde tab, ses, metronom ve hız merdiveni var.</p>${G.klasikTech()}`;
  } else {
    const L = repAll(); const a = L.filter(x => x.v === 1), b = L.filter(x => x.v === 2);
    const list = arr => `<div class="reps">${arr.map(x => G.repRow(x.k, x.t, (x.src ? x.src + ' · ' : '') + x.s, x.u, x.md, x.src)).join('')}</div>`;
    h = L.length ? `<p class="muted">Tüm metotlardan çalıştığın ve öğrendiğin parçalar. Durumu düğmeyle değiştir; tempo hedefi ve kendi kaydın için “⋯”.</p>${a.length ? `<h2 class="sec">Çalışıyorum · ${a.length}</h2>${list(a)}` : ''}${b.length ? `<h2 class="sec">Öğrendim · ${b.length}</h2>${list(b)}` : ''}`
      : `<div class="card"><h3>Henüz parça yok</h3><p class="muted">Bir metottan parça seç ve yanındaki düğmeyle durumunu “çalışıyorum” yap; burada toplanır.</p><button class="btn sm" data-a="kseg" data-v="met">Metotlara git</button></div>`;
  }
  return { t: 'Klasik gitar', cat: 'klasik', h: seg + h };
};
G.actions.kseg = d => { G.ui.kseg = d.v; G.rerender(); };
// eski sürümlerde kayıtlı kalmış ekranlar (kaldırılan ücretli metotlar)
G.screens.cgc = G.screens.tgs = () => G.screens.klasik();

// ---------------- JustinGuitar (pop eşlik kursu) ----------------
const JGG = [
  [1, 'Beyaz', 'Sekiz temel akor, ilk vuruş kalıpları, akor geçişleri, kapo ve metronom; ilk riff ve şarkılar.', [['zincir', 'Akor geçişleri'], ['lib', 'Akor kütüphanesi']]],
  [2, 'Sarı', 'Fa akoru, ilk gamlar, sekizlik ve on altılık vuruş, parmakla çalmaya giriş, power chord, blues ve doğaçlama.', [['arpej', 'Arpej atölyesi'], ['songs', 'Şarkılarım']]],
  [3, 'Turuncu', 'Akor şekli kâşifleri, melodi çalma, üçlü akorlar, açık akort, vibrato, tonlardaki akorlar ve kolay barre.', [['lib', 'Akor kütüphanesi'], ['asistan', 'Kulaktan çıkarma']]],
  [4, 'Yeşil', 'Mi şekli barre akorlar, majör gam kalıpları, ritim okuma, blues solo ve 56 blues cümlesi.', [['tonlar', 'Barre ve tonlar'], ['klavye', 'Teori › Klavye']]],
  [5, 'Mavi', 'La şekli barre akorlar, majör gamın 4. kalıbı, legato ve tel bükme, folk parmak tekniği.', [['tonlar', 'Barre ve tonlar'], ['barre', 'Barre Bulucu']]],
  [6, 'Mor', 'Beş pentatonik kalıp, 12 ölçülük blues ritmi, funk, caza giriş ve caz standartları.', [['klavye', 'Teori › Klavye'], ['armoni', 'Teori › Armoni']]],
  [7, 'Kırmızı', 'Blues’ta majör pentatonik ve arpejler, Mayfield ve Hendrix dolguları, caz akor ikameleri.', [['armoni', 'Teori › Armoni']]]
];
G.screens.jg = function () {
  const cards = JGG.map(([g, c, d]) => { const P = cProg('jg' + g), done = S.jg && S.jg[g]; return `<button class="gcard${done ? ' ok' : ''}" data-a="go" data-s="jgg" data-p='{"g":${g}}'><span class="gn">${g}</span><span><b>${g}. seviye · ${c}</b><span class="muted">${d}</span><span class="bar2 thin"><i style="width:${Math.round(P.w / P.n * 100)}%"></i></span><span class="muted">${P.w}/${P.n} ders${done ? ' · ✓ bitti' : ''}</span></span></button>`; }).join('');
  let rc = ''; for (const [g] of JGG) { if (!(S.jg && S.jg[g]) && nextIn('jg' + g) >= 0) { rc = resumeCard('jg' + g, (cProg('jg' + g).w ? 'Devam et · ' : 'Başla · ') + g + '. seviye'); break; } }
  const total = JGG.reduce((a, [g]) => a + cProg('jg' + g).n, 0);
  return { t: 'JustinGuitar kursu', cat: 'akor', h: `<div class="card mhead"><p><b>Justin Sandercoe</b>’nun ücretsiz video kursu: ${total} ders, modül modül. Pop ve rock eşlik için en derli toplu seviyeli yol; 1–3. seviye başlangıç, 4–7. seviye orta. Dersler uygulamanın içinde oynar; aynı becerileri uygulamadaki alıştırmalarla pekiştir.</p><div class="facts">${fact('Seviye', '1–7')}${fact('İçerik', total + ' video', 'ok')}${fact('Odak', 'Akor, ritim, eşlik')}</div></div>${rc}<div class="gcards">${cards}</div><p class="muted">Kaynak: justinguitar.com (Justin Sandercoe). Videolar YouTube oynatıcısıyla açılır; dersler İngilizce.</p>` };
};
G.screens.jgg = function (p) {
  const g = Math.max(1, Math.min(7, p.g | 0)), J = JGG[g - 1], c = 'jg' + g, C = course(c), done = S.jg && S.jg[g];
  let j = 0; const mods = K.jg[g - 1].map(([mt, L]) => { const rows = L.map(() => { const i = j++; return vrow(c, i, C.ls[i]); }).join(''); return { mt, rows, w: L.filter(x => VW()[x[1]]).length, n: L.length }; });
  const op = mods.findIndex(m => m.w < m.n);
  const P = cProg(c);
  return { t: `JustinGuitar ${g}. seviye`, cat: 'akor', h: `<div class="card jgr${done ? ' ok' : ''}"><div class="row"><h3><span class="lvn">${g}</span> ${g}. seviye · ${J[1]}</h3><button class="btn sm ${done ? 'on' : 'ghost'}" data-a="jgset" data-v="${g}" aria-pressed="${!!done}">${done ? '✓ Bitti' : 'Bitirdim'}</button></div><p class="muted">${J[2]}</p><div class="bar2 thin"><i style="width:${Math.round(P.w / P.n * 100)}%"></i></div><p class="muted">${P.w}/${P.n} ders izlendi · ${mods.length} modül</p><div class="muted">Uygulamada çalış:</div><div class="chips">${J[3].map(toolChip).join('')}</div></div>
${resumeCard(c, P.w ? 'Devam et' : 'Başla')}
${mods.map((m, i) => modBlock(c, i + 1, esc(m.mt), m.rows, m.w, m.n, i === op)).join('')}` };
};
G.actions.jgset = d => { S.jg = S.jg || {}; if (S.jg[d.v]) delete S.jg[d.v]; else S.jg[d.v] = G.dayKey(); G.save(); G.rerender(); };
G.actions.jgt = d => { G.ui.tseg = d.v; G.goTab('teori'); };
})();
