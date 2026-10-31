(function () {
'use strict';
const G = window.G;
const { pick, shuffle, rnd } = M;

function voice(ch, low) {
  const p = M.chordParse(ch); let r = (low || 48) + M.pcOf(p.root); if (r > (low || 48) + 7) r -= 12;
  return [r - 12].concat(M.CQ[p.q].map(x => r + x));
}
G.buildKulak = function () {
  const cn = G.cn;
  function opts(c, pool, n) { const s = [c]; for (const x of shuffle(pool)) { if (s.length >= (n || 4)) break; if (!s.includes(x)) s.push(x); } return shuffle(s); }
  function q(prompt, correct, pool, audio, why, n, cols) {
    return { kind: 'choice', prompt, sub: 'Dinle ve seç', audio, opts: opts(String(correct), pool.map(String), n).map(v => ({ v, html: v })), ans: [String(correct)], why, cols: cols || 2 };
  }
  const ivQ = set => () => {
    const iv = pick(set); const r = 50 + rnd(12); const down = set.length > 6 && Math.random() < 0.3;
    const a = down ? r + iv : r, b = down ? r : r + iv;
    return q(`Aralık${down ? ' <span class="muted">(inen)</span>' : ''}`, M.IVS[iv], set.map(x => M.IVS[x]), () => { const t = Aud.seq([a, b], null, 0.7, 0.6, 0.65); Aud.block([a, b], t + 0.25, 0.5, 1.2); },
      `${M.IVS[iv]} = ${iv} yarım ses. ${['', 'Çok gergin, sürtüşür', 'Gam adımı', 'Hüzünlü (minör üçlünün başı)', 'Parlak (majör üçlünün başı)', 'Açık, boşluklu', 'Tritone: kararsız, gergin', 'Dolu, sağlam', 'Hüzünlü, geniş', 'Sıcak, geniş', 'Bluesy, çözülmek ister', 'Çok gergin, oktava yakın', 'Aynı nota, üstte'][iv]}.`, set.length > 6 ? 6 : set.length, set.length > 6 ? 2 : 1);
  };
  const QN = { '': 'Majör', m: 'Minör', dim: 'Eksik (°)', aug: 'Artık (+)', '7': 'Dominant 7', maj7: 'Majör 7', m7: 'Minör 7' };
  const typeQ = set => () => {
    const t = pick(set); const r = 48 + rnd(8); const notes = M.CQ[t].map(x => r + x);
    return q('Akor türü', QN[t], set.map(x => QN[x]), () => { const e = Aud.seq(notes, null, 0.32, 0.5, 0.5); Aud.block(notes, e + 0.2, 0.45, 1.4); },
      `${QN[t]}: ${({ '': 'aydınlık, kararlı', m: 'hüzünlü', dim: 'gergin, karanlık', aug: 'havada, rüya gibi', '7': 'gerilimli, çözülmek ister', maj7: 'yumuşak, parlak', m7: 'yumuşak, hüzünlü' })[t]}.`, set.length, set.length > 2 ? 2 : 2);
  };
  function degQ() {
    const k = pick(['C', 'D', 'E', 'F', 'G', 'A']); const ch = M.diatonic(k, 'maj'); const d = pick([0, 1, 2, 3, 4, 5]);
    const R = M.RMAJ.slice(0, 6);
    return q('Ton duyulduktan sonra çalınan akor kaçıncı derece?', R[d], R, () => {
      let t = Aud.now() + 0.05; [0, 3, 4, 0].forEach(i => { Aud.block(voice(ch[i]), t, 0.35, 0.6); t += 0.7; });
      Aud.block(voice(ch[d]), t + 0.6, 0.5, 1.4);
    }, `Akor ${R[d]} (${cn(ch[d])}, ${G.nn(k)} tonunda). I ev hissi, IV açılma, V gerilim, vi hüzünlü tonik.`, 6, 3);
  }
  const PR = [['I–V–vi–IV', [0, 4, 5, 3]], ['vi–IV–I–V', [5, 3, 0, 4]], ['I–vi–IV–V', [0, 5, 3, 4]], ['I–IV–V–I', [0, 3, 4, 0]], ['ii–V–I–vi', [1, 4, 0, 5]], ['I–iii–IV–V', [0, 2, 3, 4]]];
  function progQ() {
    const k = pick(['C', 'D', 'G', 'A', 'F']); const ch = M.diatonic(k, 'maj'); const p = pick(PR);
    return q('Hangi dizilim?', p[0], PR.map(x => x[0]), () => { let t = Aud.now() + 0.05; p[1].forEach(i => { Aud.block(voice(ch[i]), t, 0.45, 0.85); t += 0.95; }); },
      `${p[0]} → ${p[1].map(i => cn(ch[i])).join(' – ')}`, 4, 1);
  }
  const MAKS = ['rast', 'huseyni', 'buselik', 'kurdi', 'nihavent', 'hicaz', 'humayun'];
  function makQ() {
    const id = pick(MAKS); const mk = G.MAK.find(m => m.id === id); const k = pick(['A', 'E', 'D']);
    const sc = G.mScale(mk, k); let base = 52 + M.pcOf(k); if (base > 59) base -= 12;
    let prev = base; const mids = sc.map((n, i) => { if (!i) return base; let m = prev - (prev % 12) + M.pcOf(n); while (m <= prev) m += 12; prev = m; return m; }).concat([base + 12]);
    return q('Bu dizi hangi makama yakın? <span class="muted">(gitardaki yaklaşığı)</span>', mk.name, MAKS.map(id => G.MAK.find(m => m.id === id).name), () => { const e = Aud.seq(mids, null, 0.3, 0.55, 0.35); Aud.seq(mids.slice().reverse().slice(1), e, 0.3, 0.5, 0.35); },
      `${mk.name}: ${sc.map(G.nn).join(' ')} (${mk.west}).`, 4, 2);
  }
  const L = {
    k1: '<p>Önce en belirgin aralıklar: <b>3’lüler</b> (akorun rengi), <b>4’lü ve 5’li</b> (boş, sağlam) ve <b>oktav</b>. Her soruda iki nota önce sırayla, sonra birlikte çalınır.</p><p>Hafıza çapaları: Tam 4’lü = “Here Comes the Bride” başı; Tam 5’li = Star Wars teması; Büyük 3’lü = “Oh When the Saints” başı. Kendi bildiğin Türkçe ezgilerden çapa bulmak daha kalıcıdır.</p>',
    k2: '<p>Tüm aralıklar, bazen inen. 2’liler gergin, 6’lılar geniş, 7’liler oktava çekilir. Tritone (6 yarım ses) en kararsız sestir.</p>',
    k3: '<p>Majör aydınlık, minör hüzünlü. Fark sadece ortadaki notada: büyük ya da küçük 3’lü.</p>',
    k4: '<p>Üçlülere ek olarak eksik (gergin), artık (havada) ve yedili akorlar. Dominant 7 çözülmek ister; maj7 yumuşak ve parlak; m7 slow pop rengidir.</p>',
    k5: '<p>Önce tonu tanıtan kısa bir kadans (I–IV–V–I) çalınır, sonra tek bir akor. O akorun tona göre yerini bul. Bu beceri, şarkıyı dinleyip akorlarını çıkarmanın temelidir.</p>',
    k6: '<p>Pop’un temel dizilimlerini kulaktan tanı. Başlangıç akoruna dikkat et: minörle başlıyorsa vi–IV–I–V olabilir.</p>',
    k7: '<p>Dizi karar perdesinden çıkıp iner. Ayırt edici notaları dinle: 2. derece yarım ses mi (Kürdi/Hicaz ailesi), 3. derece büyük mü (Rast, Hicaz), 7. derece yükselmiş mi (Nihavent)? Gitardaki 12 eşit perdeyle çalındığı için komalı sesler yaklaşıktır.</p>'
  };
  return [
    ['k1', 'Temel aralıklar', '3’lüler, 4’lü, 5’li, oktav', ivQ([3, 4, 5, 7, 12])],
    ['k2', 'Tüm aralıklar', 'Küçük 2’liden oktava, çıkan ve inen', ivQ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])],
    ['k3', 'Majör mü minör mü', 'Üçlü akorun rengi', typeQ(['', 'm'])],
    ['k4', 'Akor türleri', 'Eksik, artık ve yedili akorlar', typeQ(['', 'm', 'dim', 'aug', '7', 'maj7', 'm7'])],
    ['k5', 'Tonda derece', 'Kadanstan sonra çalınan akorun derecesi', degQ],
    ['k6', 'Dizilim tanıma', 'I–V–vi–IV, vi–IV–I–V ve diğerleri', progQ],
    ['k7', 'Makam dizisini tanı', 'Kürdi, Hicaz, Nihavent, Rast... kulaktan', makQ]
  ].map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], lesson: L[a[0]], count: 12 }));
};
})();
