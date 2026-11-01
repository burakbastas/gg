(function () {
'use strict';
const G = window.G, S = G.S;
const $ = s => document.querySelector(s);
const { pick, shuffle, rnd } = M;

// ================= 1 YILLIK KULAKTAN EŞLİK YOLU =================
const go = (s, p) => `data-a="go" data-s="${s}"${p ? ` data-p='${JSON.stringify(p)}'` : ''}`;
const tabGo = (t, s) => `data-a="yolgo" data-t="${t}" data-s="${s || ''}"`;
const lvGo = id => `data-a="lv" data-id="${id}"`;
const YOL = [
  { m: 1, t: 'Açık akorlar ve Sol tonu', why: 'Eşliğin alfabesi. Akoru düşünmeden basabilmek, kulağını şarkıya ayırmanı sağlar.',
    k: [['G, C, D, Em, Am akorlarını şemaya bakmadan bas', go('lib')], ['Sol tonu grubunda 6 geçişin hepsinde 1 yıldız', go('zincir')], ['Akor şekli oyunları 1. ve 2. seviyeyi geç', lvGo('s1')], ['“Pop I–V–vi–IV (Sol)” şablonunu 70 bpm’de kesintisiz 2 dakika çal', go('songs')]] },
  { m: 2, t: 'Do, La minör ve ilk arpejler', why: 'Türkçe pop’un çoğu Am, Dm, E, F, G, C ile döner. Arpej senin güçlü yanın; şarkıya ilk onunla girersin.',
    k: [['Do tonu ve La minör gruplarında tüm geçişlerde 2 yıldız', go('zincir')], ['Arpej atölyesinde p-i-m-a-m-i (6/8) ve 12/8 slow desenleri 70 bpm', go('arpej')], ['F barre’ı 4 vuruş temiz tut (barre aileleri)', go('zincir')], ['Teori: derece → akor seviyesini geç', lvGo('t2')]] },
  { m: 3, t: 'Ritim temeli', why: 'Canlı eşlikte arpej her zaman yetmez. Sağ elin aşağı-yukarı hiç durmadan sallanması ritmin sırrıdır.',
    k: [['Ritim desenleri: dörtlük, pop klasiği, 6/8 slow (Arpej atölyesi → desen listesi)', go('arpej')], ['Aynı şarkıyı önce arpej, sonra ritimle çal', go('songs')], ['Metronomla 4 dakika hiç durmadan eşlik (Sessiz değil Metronom modu)', go('songs')], ['Kulak: majör mü minör mü seviyesini geç', lvGo('k3')]] },
  { m: 4, t: 'Barre ve kaydırma', why: 'Her tonda çalabilmenin anahtarı. Mi ve La şekliyle 12 tonun hepsi elinin altında.',
    k: [['Kaydırma: Basamak F–G–A–B ve minör basamak hız merdiveni 80 bpm', go('zincir')], ['Re, La, Mi tonu gruplarında 1 yıldız', go('zincir')], ['Barre Bulucu oyununda 12/12', 'data-a="barregame"'], ['Teori: kapo hesabı seviyesini geç', lvGo('t14')]] },
  { m: 5, t: 'Kulak 1: tonu ve I–IV–V’i duymak', why: 'Kulaktan eşliğin ilk adımı: şarkının “evini” (tonik) bulmak ve evden uzaklaşan/geri dönen akorları ayırmak.',
    k: [['Kulak: tonda derece seviyesini geç', lvGo('k5')], ['Kulak: ton merkezi seviyesini geç', lvGo('k8')], ['Kulak: bas hangi derece seviyesini geç', lvGo('k9')], ['Kulaktan çıkarma asistanıyla 3 basit şarkının (3 akorlu türküler, çocuk şarkıları) akorlarını bul', go('asistan')]] },
  { m: 6, t: 'Kulak 2: vi, ii, iii ve dizilimler', why: 'Pop’un dört akoru I, V, vi, IV. Bunları duyarak tanırsan şarkıların yarısı çözülür.',
    k: [['Kulak: dizilim tanıma seviyesini geç', lvGo('k6')], ['Kulak: akor kaç kez değişti seviyesini geç', lvGo('k11')], ['Asistanla 5 pop şarkıyı kağıda bakmadan çıkar, Şarkılarım’a kaydet', go('asistan')], ['Teori: pop dizilimleri seviyesini geç', lvGo('t11')]] },
  { m: 7, t: 'Minör tonlar ve makamsal eşlik', why: 'Türkçe pop ve arabeskin rengi: Nihavent (V majör), Kürdi (♭II), Hicaz (majör karar).',
    k: [['Kulak: majör mü minör ton seviyesini geç', lvGo('k12')], ['Makam: Nihavent, Kürdi ve Hicaz sayfalarında eşlik kalıplarını arpejle çal', `data-a="yolgo" data-t="makam"`], ['Makam: makam akorları seviyesini geç', lvGo('m6')], ['Barış Manço şarkılarından ikisini kayıt eşliğinde çal', go('songs')]] },
  { m: 8, t: 'Melodiye akor bulmak', why: 'Solistin ya da kayıttaki melodinin notasını duyunca o notayı içeren akoru seçmek: kulaktan eşliğin asıl becerisi.',
    k: [['Kulak: melodiye akor seviyesini geç', lvGo('k10')], ['Asistanın “nota → akor” bölümüyle bir türkünün melodisine akor yaz', go('asistan')], ['Bildiğin bir melodiyi (solo çaldığın) önce tek nota, sonra akorla çal', go('asistan')], ['Teori: fonksiyonlar ve kadanslar seviyesini geç', lvGo('t10')]] },
  { m: 9, t: 'Transpoze ve kapo, canlı', why: 'Solist “yarım ses aşağı” dediğinde durmadan devam edebilmek.',
    k: [['Teori: transpoze seviyesini geç', lvGo('t5')], ['Bir şarkıyı kaydırma ekranında ±½ ile 3 farklı tonda çal', go('zincir')], ['Aynı şarkıyı kapo 0, 2, 4 ile şekil değiştirerek çal', go('songs')], ['Kulak: tüm aralıklar seviyesini geç', lvGo('k2')]] },
  { m: 10, t: 'Renkler: yedili, sus, add9 ve bas yürüyüşleri', why: 'Aynı akorları daha zengin çalmak. Arpejde slash akor bas hatları çok güzel duyulur.',
    k: [['Yedili renkler ve inen bas gruplarında 2 yıldız', go('zincir')], ['Teori: sus, add ve slash akorlar seviyesini geç', lvGo('t15')], ['Teori: ikincil dominant ve ödünç akor seviyesini geç', lvGo('t12')], ['Bir şarkıya giriş ve bitiş (intro/outro) kalıbı ekle', go('songs')]] },
  { m: 11, t: 'Repertuvar ve form', why: 'Canlı müzikte 20 şarkılık bir liste. Giriş–kıta–nakarat–köprü–bitiş yapısını duyarak takip etmek.',
    k: [['Şarkılarım’da 15 şarkı (asistanla kendi çıkardıkların)', go('songs')], ['5 şarkıyı ezbere, akor listesine bakmadan çal', go('songs')], ['Her şarkıya uygun desen seç: arpej mi ritim mi', go('arpej')], ['Kulak: akor türleri seviyesini geç', lvGo('k4')]] },
  { m: 12, t: 'Sınav: ilk dinleyişte eşlik', why: 'Hedef: daha önce çalmadığın bir şarkıya kaydı dinlerken ilk turda eşlik edebilmek.',
    k: [['Duymadığın 5 şarkıda: tonu ilk 30 saniyede bul (asistanın ton sesiyle)', go('asistan')], ['Aynı şarkılarda ikinci dinleyişte tüm akorları çal', go('asistan')], ['Kendini kaydet, ritmi ve geçişleri dinleyerek değerlendir', go('songs')], ['Tüm kulak seviyelerini tamamla', `data-a="yolgo" data-t="teori" data-s="kulak"`]] }
];
G.actions.yolgo = d => { if (d.t === 'teori') { G.ui.tseg = d.s || 'kulak'; return G.goTab('teori'); } G.goTab(d.t); };
const yk = (m, i) => m + ':' + i;
function monthDone(y) { return y.k.filter((_, i) => S.yol[yk(y.m, i)]).length; }
G.screens.yol = function () {
  const cur = YOL.find(y => monthDone(y) < y.k.length) || YOL[YOL.length - 1];
  const tot = YOL.reduce((a, y) => a + y.k.length, 0), dn = YOL.reduce((a, y) => a + monthDone(y), 0);
  const months = YOL.map(y => {
    const d = monthDone(y), open = y === cur;
    return `<details class="card yol ${d === y.k.length ? 'ok' : ''}"${open ? ' open' : ''}><summary><span class="lvn">${y.m}</span><span><b>${y.m}. ay · ${y.t}</b><span class="muted">${d}/${y.k.length} hedef</span></span></summary>
<p class="muted">${y.why}</p>${y.k.map((k, i) => `<div class="yk ${S.yol[yk(y.m, i)] ? 'ok' : ''}"><button class="cbx" data-a="yolchk" data-k="${yk(y.m, i)}" aria-label="tamamlandı">${S.yol[yk(y.m, i)] ? '✓' : ''}</button><span>${k[0]}</span><button class="btn sm ghost" ${k[1]}>Aç</button></div>`).join('')}</details>`;
  }).join('');
  return { t: '1 yıllık eşlik yolu', cat: 'sarki', h: `<div class="intro"><p>Hedef: bir yıl sonunda bir şarkıyı kulaktan dinleyip kendi kendine eşlik edebilmek. Soloda bunu zaten yapıyorsun; akorda aynı beceri üç parçadan oluşur: <b>el</b> (akoru düşünmeden basmak), <b>kulak</b> (tonu ve akorun derecesini duymak), <b>teori</b> (duyduğunu rakama çevirmek). Her ay bu üçünden birer adım var.</p><div class="bar2"><i style="width:${dn / tot * 100}%"></i></div><p class="muted">${dn}/${tot} hedef tamamlandı · sıradaki: ${cur.m}. ay</p></div>
<div class="card"><h3>Her gün (şarkı çalışması bölümünde)</h3><p class="muted">1. Asistanla bir şarkının tonunu bul (ton sesini aç, kayıtla birlikte dinle).<br>2. Önce bas notalarını, sonra akorları çıkar; şüphelendiğinde palette dokunup karşılaştır.<br>3. Şarkılarım’a kaydet ve kayıtla birlikte çal.</p><button class="btn" ${go('asistan')}>Kulaktan çıkarma asistanı</button></div>${months}` };
};
G.actions.yolchk = d => { S.yol[d.k] = S.yol[d.k] ? 0 : 1; if (S.yol[d.k]) S.xp += 20; G.save(); G.rerender(); };

// ================= KULAKTAN ÇIKARMA ASİSTANI =================
let drone = null;
function stopDrone() { if (drone) { clearInterval(drone); drone = null; } const b = $('#drbtn'); if (b) { b.textContent = '▶ Ton sesi'; b.classList.remove('on'); } }
const AK = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
function palette(k, mode) {
  if (mode === 'min') {
    const sc = M.scale(k, 'min'); const d = M.diatonic(k, 'min');
    return [[d[0], 'i'], [d[3], 'iv'], [sc[4], 'V'], [d[4], 'v'], [d[5], '♭VI'], [d[6], '♭VII'], [d[2], '♭III'], [sc[4] + '7', 'V7']];
  }
  const sc = M.scale(k, 'maj'); const d = M.diatonic(k, 'maj');
  const li = M.LET.indexOf(k[0]), rp = M.pcOf(k);
  return [[d[0], 'I'], [d[3], 'IV'], [d[4], 'V'], [d[5], 'vi'], [d[1], 'ii'], [d[2], 'iii'], [M.spellWith(M.LET[(li + 6) % 7], (rp + 10) % 12), '♭VII'], [sc[3] + 'm', 'iv'], [sc[2] + '7', 'V/vi'], [sc[4] + '7', 'V7']];
}
const ASS = { k: 'G', mode: 'maj', note: null, txt: '' };
G.screens.asistan = function () {
  const pal = palette(ASS.k, ASS.mode);
  const keys = AK.map(x => `<button class="chipb ${x === ASS.k ? 'on' : ''}" data-a="ask" data-v="${x}">${G.nn(x)}</button>`).join('');
  const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(pc => `<button class="chipb ${ASS.note === pc ? 'on' : ''}" data-a="asnote" data-v="${pc}">${G.nnPlain(M.NICE[pc])}</button>`).join('');
  const cards = pal.map(([c, r]) => { const ch = CHM.getChord(c); const hit = ASS.note != null && (M.chordPcs(c) || []).includes(ASS.note); return `<button class="cc ${hit ? 'hit' : ''}" data-a="aspl" data-n="${c}">${ch ? CHM.diagram(ch, { root: false }) : ''}<b>${G.cn(c)}</b><span class="muted">${r}</span></button>`; }).join('');
  return { t: 'Kulaktan çıkarma asistanı', cat: 'sarki', h: `<div class="card"><h3>1. Tonu bul</h3><p class="muted">Kaydı çalarken ton sesini aç. Şarkının bittiği/dinlendiği yerde ton sesi “uyuyorsa” doğru tondasın. Uymazsa tonu değiştir.</p>
<div class="seg sm"><button class="btn sm ${ASS.mode === 'maj' ? 'on' : 'ghost'}" data-a="asmode" data-v="maj">Majör</button><button class="btn sm ${ASS.mode === 'min' ? 'on' : 'ghost'}" data-a="asmode" data-v="min">Minör</button></div><div class="chips">${keys}</div>
<button class="btn" id="drbtn" data-a="drone">▶ Ton sesi</button></div>
<div class="card"><h3>2. Akorları dene · ${G.nn(ASS.k)} ${ASS.mode === 'maj' ? 'majör' : 'minör'}</h3><p class="muted">Bu tonda en sık geçen akorlar, sıklık sırasıyla. Dokun: çalar. İlk dördüyle şarkıların çoğu çözülür.</p><div class="cgrid">${cards}</div></div>
<div class="card"><h3>3. Melodi notası → akor</h3><p class="muted">Şarkıda vurgulu duyduğun melodi notasını seç. O notayı içeren akorlar yukarıda turuncu çerçeveyle işaretlenir.</p><div class="chips">${notes}</div></div>
<div class="card"><h3>4. Şarkıya kaydet</h3><label>Şarkı adı<input id="asn" placeholder="Şarkı adı"></label><label>Bulduğun akorlar<textarea id="ast" rows="3" placeholder="G D Em C | G D C*2" autocapitalize="off" spellcheck="false">${ASS.txt}</textarea></label><div id="aserr" class="err"></div><button class="btn" data-a="assave">Şarkılarım’a ekle</button></div>`,
    after: () => { G.onStop(stopDrone); const t = $('#ast'); if (t) t.oninput = () => { ASS.txt = t.value; }; } };
};
G.actions.ask = d => { ASS.k = d.v; stopDrone(); G.rerender(); };
G.actions.asmode = d => { ASS.mode = d.v; stopDrone(); G.rerender(); };
G.actions.asnote = d => { ASS.note = ASS.note === +d.v ? null : +d.v; if (Aud.init()) Aud.pluck(60 + +d.v, null, 0.6); G.rerender(); };
G.actions.aspl = d => { const c = CHM.getChord(d.n); if (c && Aud.init()) Aud.strum(c.fr); const t = $('#ast'); if (t) { t.value = (t.value ? t.value.trim() + ' ' : '') + CHM.baseName(d.n); ASS.txt = t.value; } };
G.actions.drone = (d, el) => {
  if (drone) { stopDrone(); return; } if (!Aud.init()) return;
  const r = 40 + M.mod(M.pcOf(ASS.k) - 4, 12); const third = ASS.mode === 'min' ? 3 : 4;
  const play = () => { const t = Aud.now() + 0.02; Aud.pluck(r, t, 0.55); Aud.pluck(r + 7, t + 0.02, 0.35); Aud.pluck(r + 12, t + 0.04, 0.3); Aud.pluck(r + 12 + third, t + 0.06, 0.18); };
  play(); drone = setInterval(play, 2200); G.playing = true; el.textContent = '■ Ton sesini durdur'; el.classList.add('on');
};
G.actions.assave = () => {
  const name = ($('#asn').value || '').trim() || 'Kulaktan çıkardığım şarkı'; const txt = $('#ast').value; const r = G.parseBars(txt);
  if (!r.bars.length || r.bad.length) { $('#aserr').textContent = r.bars.length ? 'Tanınmayan akor: ' + r.bad.join(', ') : 'Önce akor ekle (palete dokunarak ya da yazarak).'; return; }
  S.songs.unshift({ id: 'u' + Date.now(), name, txt, bpm: 72, kapo: 0, pat: 'a3' }); ASS.txt = ''; G.save(); G.go('songs');
};

// ================= YENİ KULAK SEVİYELERİ =================
function voice(ch) { const p = M.chordParse(ch); let r = 48 + M.pcOf(p.root); if (r > 55) r -= 12; return [r - 12].concat(M.CQ[p.q].map(x => r + x)); }
G.kulakExtra = function () {
  const q = (prompt, correct, pool, audio, why, cols, n) => { const s = [String(correct)]; for (const x of shuffle(pool.map(String))) { if (s.length >= (n || 4)) break; if (!s.includes(x)) s.push(x); } return { kind: 'choice', prompt, sub: 'Dinle ve seç', audio, opts: shuffle(s).map(v => ({ v, html: v })), ans: [String(correct)], why, cols: cols || 2 }; };
  const KEYS = ['C', 'D', 'E', 'F', 'G', 'A'];
  const cad = (ch, list, t, dur) => { list.forEach(i => { Aud.block(voice(ch[i]), t, 0.4, dur * 0.9); t += dur; }); return t; };
  function k8() {
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const sc = M.scale(k, 'maj');
    const cand = shuffle([0, pick([1, 2]), pick([4, 5])]); const ans = cand.indexOf(0) + 1;
    const base = 60 + M.pcOf(k) - (M.pcOf(k) > 5 ? 12 : 0);
    return q('Ton merkezi (ev) hangi nota? <span class="muted">Dizilimden sonra 3 nota çalınır</span>', ans + '. nota', ['1. nota', '2. nota', '3. nota'],
      () => { let t = Aud.now() + 0.05; t = cad(ch, [5, 3, 0, 4], t, 0.8); t += 0.3; cand.forEach(d => { Aud.pluck(base + M.MAJ[d], t, 0.6, 0.8); t += 0.9; }); },
      `Ton ${G.nn(k)}; ev notası ${G.nn(sc[0])}. Dizilim V’te asılı kaldığı için ev notası “çözülme” hissi verir.`, 3, 3);
  }
  function k9() {
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const d = pick([0, 3, 4, 5]); const R = { 0: '1 (tonik)', 3: '4', 4: '5', 5: '6' };
    const b = 40 + M.mod(M.pcOf(k) - 4, 12);
    return q('Bas notası tona göre kaçıncı derece?', R[d], Object.values(R), () => { let t = Aud.now() + 0.05; t = cad(ch, [0, 3, 4, 0], t, 0.65); Aud.pluck(b + M.MAJ[d], t + 0.4, 0.75, 1.4); },
      `Bas ${R[d]}. derece (${G.nn(M.scale(k, 'maj')[d])}). Kulaktan eşlikte önce bası bul: akorun kökü çoğu zaman bastır.`, 2, 4);
  }
  function k10() {
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const d = pick([0, 3, 4, 5]); const R = ['I', 'ii', 'iii', 'IV', 'V', 'vi'];
    const pcs = M.chordPcs(ch[d]); let base = 60; const mel = shuffle([0, 1, 2, pick([0, 1, 2])]).map(i => { let m = base - (base % 12) + pcs[i]; if (m < 60) m += 12; if (m > 76) m -= 12; return m; });
    return q('Bu melodi parçasına hangi akor uyar?', R[d], ['I', 'IV', 'V', 'vi'], () => { let t = Aud.now() + 0.05; t = cad(ch, [0, 4, 0], t, 0.6); t += 0.4; mel.forEach(m => { Aud.pluck(m, t, 0.6, 0.5); t += 0.45; }); },
      `Melodi ${G.cn(ch[d])} akorunun notalarından (${M.chordSpelled(ch[d]).map(G.nn).join(', ')}) oluşuyor → ${R[d]}. Melodinin vurgulu notalarını içeren akor genelde doğru akordur.`, 2, 4);
  }
  function k11() {
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const n = rnd(4); const seq = [pick([0, 5])];
    const pool = [0, 3, 4, 5];
    for (let i = 1; i < 4; i++) seq.push(i <= n ? pick(pool.filter(x => x !== seq[i - 1])) : seq[i - 1]);
    const changes = seq.filter((x, i) => i && x !== seq[i - 1]).length;
    return q('4 ölçüde akor kaç kez değişti?', String(changes), ['0', '1', '2', '3'], () => { let t = Aud.now() + 0.05; seq.forEach(i => { for (let b = 0; b < 4; b++) { Aud.block(voice(ch[i]), t, b ? 0.25 : 0.42, 0.5); t += 0.55; } }); },
      `Dizilim: ${seq.map(i => G.cn(ch[i])).join(' – ')}. Bas notasındaki değişimi dinle; akor değişimini en kolay bas ele verir.`, 4, 4);
  }
  function k12() {
    const k = pick(KEYS); const minor = Math.random() < 0.5;
    const prog = minor ? pick([[0, 3, 4, 0], [0, 5, 6, 0], [0, 6, 5, 4]]) : pick([[0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 5, 3]]);
    const ch = minor ? M.diatonic(k, 'min').map((c, i) => i === 4 ? M.scale(k, 'min')[4] : c) : M.diatonic(k, 'maj');
    return q('Bu dizilim majör tonda mı, minör tonda mı?', minor ? 'Minör ton' : 'Majör ton', ['Majör ton', 'Minör ton'], () => { let t = Aud.now() + 0.05; cad(ch, prog, t, 0.85); },
      `${minor ? 'Minör' : 'Majör'}: ${prog.map(i => G.cn(ch[i])).join(' – ')}. İlk ve son akorun rengine odaklan.`, 2, 2);
  }
  // fonksiyonel dinleme: önce tonu kur (I–IV–V–I), sonra tek nota → derece
  const DEGF = ['1 · ev, tam dinlenme', '2 · hareketli, 1’e ya da 3’e kayar', '3 · sıcak, dengeli', '4 · gergin, 3’e iner', '5 · sağlam, açık', '6 · yumuşak, hüzünlü', '7 · keskin, 1’e çeker'];
  function k13() {
    const n = (G.S.lv.k13 || { hist: [] }).hist.length; const pool = n < 6 ? [0, 2, 4] : n < 14 ? [0, 2, 4, 1, 6] : [0, 1, 2, 3, 4, 5, 6];
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const d = pick(pool); const base = 60 + M.pcOf(k) - (M.pcOf(k) > 5 ? 12 : 0);
    const R = pool.map(x => String(x + 1));
    return q('Kadanstan sonra çalınan nota tonun kaçıncı derecesi?', String(d + 1), R, () => { let t = Aud.now() + 0.05; t = cad(ch, [0, 3, 4, 0], t, 0.6); t += 0.45; Aud.pluck(base + M.MAJ[d], t, 0.7, 1.4); },
      `Derece ${DEGF[d]} (${G.nn(M.scale(k, 'maj')[d])}, ${G.nn(k)} majörde). Notayı kafanda ev notasına doğru götür: kaç adımda varıyorsun?`, pool.length > 4 ? 4 : 3, pool.length > 4 ? 7 : 3);
  }
  function k14() {
    const k = pick(KEYS); const ch = M.diatonic(k, 'maj'); const sc = M.scale(k, 'maj'); const base = 60 + M.pcOf(k) - (M.pcOf(k) > 5 ? 12 : 0);
    const st = pick([0, 2, 4]); const mel = [st]; for (let i = 0; i < 3; i++) { const p = mel[mel.length - 1] + pick([-1, 1, -2, 2]); mel.push(Math.max(0, Math.min(6, p))); }
    const lab = a => a.map(x => x + 1).join('–'); const corr = lab(mel); const pool = [corr];
    while (pool.length < 4) { const v = mel.slice(); const j = 1 + rnd(3); v[j] = Math.max(0, Math.min(6, v[j] + pick([-1, 1]))); const l = lab(v); if (!pool.includes(l)) pool.push(l); }
    return q('Dört notalık melodi hangi derecelerden oluşuyor?', corr, pool, () => { let t = Aud.now() + 0.05; t = cad(ch, [0, 3, 4, 0], t, 0.55); t += 0.45; mel.forEach(x => { Aud.pluck(base + M.MAJ[x], t, 0.65, 0.6); t += 0.6; }); },
      `Melodi: ${mel.map(x => G.nn(sc[x])).join(' ')} = ${corr}. İlk notayı tonik çekimine göre bul, sonra her adımı “bir yukarı, bir aşağı” diye izle.`, 1, 4);
  }
  const L = {
    k13: '<p><b>Fonksiyonel dinleme:</b> notayı tek başına değil, tondaki görevine göre tanırsın. Önce I–IV–V–I kadansı tonu kurar, sonra tek bir nota çalınır.</p><p>Her derecenin kendi hissi vardır: 1 ev, 3 sıcak, 5 sağlam; 7 eve doğru çeker, 4 aşağı 3’e iner. Önce 1-3-5 ile başlarsın; doğru yaptıkça 2, 7 ve sonra tüm dereceler eklenir.</p><p>Bu yöntem Functional Ear Trainer gibi uygulamaların temelidir ve kulaktan şarkı çıkarmanın en hızlı yoludur.</p>',
    k14: '<p>Kadanstan sonra dört notalık kısa bir melodi gelir. İlk notayı derece olarak bul, sonraki notaları adım adım izle. Bu, bir şarkının melodisini çıkarıp akor yazmanın (Melodiye akor seviyesi) ön adımıdır.</p>',
    k8: '<p>Kulaktan eşliğin ilk adımı: <b>evi bulmak</b>. Bir dizilim çalınır, ardından üç nota. Hangisinde “bitti, dinlendim” hissi varsa o tonik. Şarkılarda da nakaratın bittiği notayı dinle.</p>',
    k9: '<p>Akorun kökü çoğu zaman bastadır. Ton kadansından sonra tek bir bas notası çalınır: 1 (ev), 4 (açılma), 5 (gerilim), 6 (hüzünlü ev). Basın derecesini duyarsan akorun derecesini de bulmuş olursun.</p>',
    k10: '<p>Melodi akorun notalarından beslenir. Melodinin vurgulu notalarını içeren akor genelde doğru akordur. I: 1-3-5, IV: 4-6-1, V: 5-7-2, vi: 6-1-3 dereceleri. Asistandaki “nota → akor” bölümü bu işin pratiğidir.</p>',
    k11: '<p>Akorun ne zaman değiştiğini duymak, şarkıyı takip etmenin temeli. Her ölçüde dört vuruş çalınır; bas notası değiştiğinde akor değişmiştir.</p>',
    k12: '<p>Şarkının majör mü minör mü olduğunu ilk saniyelerde anlamak, palette hangi akorlara bakacağını belirler. Minörde i, iv, V (majör) ve ♭VI, ♭VII sık.</p>'
  };
  return [['k8', 'Ton merkezi', 'Dizilimden sonra ev notasını bul', k8], ['k9', 'Bas hangi derece', '1, 4, 5, 6: basın tondaki yeri', k9], ['k10', 'Melodiye akor', 'Melodi parçasına uyan akoru seç', k10], ['k11', 'Akor değişimini duy', '4 ölçüde kaç değişim', k11], ['k12', 'Majör mü minör ton', 'Dizilimin tonu', k12], ['k13', 'Notanın tondaki görevi', 'Kadans + tek nota: 1–7 dereceler', k13], ['k14', 'Kısa melodi dezesi', 'Dört notayı derece olarak yaz', k14]]
    .map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], lesson: L[a[0]], count: 10 }));
};
})();
