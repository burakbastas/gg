(function (g) {
'use strict';
const { pick, shuffle, rnd } = M;

g.buildTheory = function (U) {
  const nn = U.nn, cn = U.cn, pcl = U.pcl;
  const KE = ['C', 'G', 'F'], KM = ['C', 'G', 'D', 'F', 'Bb', 'A', 'Eb'];
  const KA = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const MINS = ['A', 'E', 'D', 'B', 'G', 'C', 'F#', 'F', 'C#', 'G#', 'Bb'];
  const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#', 'Bb', 'Eb', 'Ab', 'Db'];
  const ROM = M.RMAJ;
  const N = n => nn(n), Cn = c => cn(c);

  function opts4(c, pool) { const s = [c]; for (const x of shuffle(pool)) { if (s.length >= 4) break; if (!s.includes(x)) s.push(x); } return shuffle(s); }
  function choice(prompt, correct, pool, label, why, cols) {
    const vals = opts4(correct, pool);
    return { kind: 'choice', prompt, opts: vals.map(v => ({ v: String(v), html: label(v) })), ans: [String(correct)], why, cols: cols || 2 };
  }
  function uniqPc(arr, notPc) { const seen = {}; if (notPc != null) seen[notPc] = 1; return arr.filter(n => { const p = M.pcOf(n); if (seen[p]) return false; seen[p] = 1; return true; }); }
  const chList = ch => ch.map(cn).join(' · ');
  const seqL = v => v.split(' – ').map(cn).join(' – ');

  function t1() {
    const k = pick(KE.concat(['D', 'Bb', 'A', 'E', 'Eb']));
    const sc = M.scale(k, 'maj'); const d = pick([2, 3, 4, 5, 6, 7]); const c = sc[d - 1]; const cp = M.pcOf(c);
    let pool = sc.filter((n, i) => i !== d - 1);
    pool.push(M.spellWith(c[0], (cp + 1) % 12), M.spellWith(c[0], (cp + 11) % 12));
    pool = uniqPc(pool, cp);
    return choice(`<b>${nn(k)} majör</b> gamının <b>${d}.</b> notası hangisi?`, c, pool, nn, `${nn(k)} majör: ${sc.map(nn).join(' – ')}<br><span class="muted">Kalıp: T T Y T T T Y</span>`, 2);
  }
  function t2() {
    const k = pick(KM); const ch = M.diatonic(k, 'maj'); const d = rnd(7);
    return choice(`<b>${nn(k)}</b> tonunda <b>${ROM[d]}</b> akoru hangisi?`, ch[d], ch.filter((x, i) => i !== d), cn, `${nn(k)} majör akorları: ${chList(ch)}`, 2);
  }
  function t3() {
    const k = pick(KA); const ch = M.diatonic(k, 'maj'); const d = rnd(7);
    return choice(`<b>${nn(k)}</b> tonunda <b>${cn(ch[d])}</b> kaçıncı derece?`, ROM[d], ROM, x => x, `${nn(k)} majör akorları: ${chList(ch)}<br>${ROM.join(' ')}`, 2);
  }
  function t4() {
    const ch = pick(ROOTS) + pick(['', 'm', 'm', '', 'dim', 'aug']);
    const pcs = M.chordPcs(ch);
    const opts = []; for (let pc = 0; pc < 12; pc++) opts.push({ v: String(pc), html: pcl(pc) });
    return { kind: 'multi', prompt: `<b>${cn(ch)}</b> akorunun notalarını işaretle`, sub: '3 nota seç', n: 3, opts, ans: pcs.map(String), cols: 4,
      why: `${cn(ch)} = ${M.chordSpelled(ch).map(nn).join(' – ')}` };
  }
  const PROGS = [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [1, 4, 0], [0, 3, 4, 3], [0, 2, 3, 4]];
  function t5() {
    const k = pick(KA.filter(x => x !== 'C')); const pr = pick(PROGS); const ch = M.diatonic(k, 'maj');
    const rom = pr.map(d => ROM[d]).join(' – ');
    const correct = pr.map(d => ch[d]).join(' – ');
    const pool = [];
    for (let t = 0; t < 3; t++) { const k2 = pick(KA.filter(x => x !== k)); const c2 = M.diatonic(k2, 'maj'); pool.push(pr.map(d => c2[d]).join(' – ')); }
    for (const p2 of PROGS) if (p2.length === pr.length && p2 !== pr) pool.push(p2.map(d => ch[d]).join(' – '));
    pool.push(pr.map(d => ch[(d + 1) % 7]).join(' – '));
    return choice(`<b>${rom}</b> dizilimi <b>${nn(k)}</b> tonunda hangisi?`, correct, pool, seqL, `${nn(k)} majör: ${chList(ch)}`, 1);
  }
  function t6() {
    const k = pick(KA); const sc = M.scale(k, 'maj'); const t = rnd(5);
    if (t === 0) {
      const sg = M.keySig(k);
      const correct = sg.n === 0 ? 'Hiç' : sg.n + (sg.t === '#' ? ' diyez' : ' bemol');
      const pool = ['Hiç', '1 diyez', '2 diyez', '3 diyez', '4 diyez', '5 diyez', '6 diyez', '1 bemol', '2 bemol', '3 bemol', '4 bemol', '5 bemol'];
      return choice(`<b>${nn(k)} majör</b> tonunda kaç diyez/bemol var?`, correct, pool, x => x, `Beşliler çemberi: Do → Sol → Re → La → Mi → Si → Fa♯ (her adımda +1 diyez). Ters yönde Fa, Si♭, Mi♭... (+1 bemol).`, 2);
    }
    if (t === 1) return choice(`<b>${nn(k)} majör</b> tonunun dominantı (V) hangi akor?`, sc[4], [sc[3], sc[1], sc[5], sc[2], sc[6]], cn, `V derecesi = gamın 5. notası: ${sc.map(nn).join(' – ')}`, 2);
    if (t === 2) return choice(`<b>${nn(k)} majör</b> tonunun subdominantı (IV) hangi akor?`, sc[3], [sc[4], sc[1], sc[5], sc[2], sc[6]], cn, `IV derecesi = gamın 4. notası: ${sc.map(nn).join(' – ')}`, 2);
    if (t === 3) return choice(`<b>${nn(k)} majör</b> tonunun ilgili minörü?`, sc[5] + 'm', [sc[2] + 'm', sc[1] + 'm', sc[0] + 'm', sc[4] + 'm'], cn, `İlgili minör = majör gamın 6. notası (vi).`, 2);
    const m = pick(MINS); const ms = M.scale(m, 'min');
    return choice(`<b>${cn(m + 'm')}</b> tonunun ilgili majörü?`, ms[2], [ms[3], ms[5], ms[6], ms[4], ms[1]], cn, `İlgili majör = minör gamın 3. notası: ${ms.map(nn).join(' – ')}`, 2);
  }
  const BANK = ["Büyük 2'li", "Küçük 3'lü", "Büyük 3'lü", "Tam 4'lü", "Artık 4'lü", "Eksik 5'li", "Tam 5'li", "Küçük 6'lı", "Büyük 6'lı", "Küçük 7'li", "Büyük 7'li"];
  function t7() {
    const a = pick(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#', 'Bb', 'Eb', 'Ab']);
    const maj = M.scale(a, 'maj'), min = M.scale(a, 'min'); const tp = rnd(4); let b;
    if (tp === 0) b = maj[pick([1, 2, 3, 4, 5, 6])];
    else if (tp === 1) b = min[pick([2, 5, 6])];
    else if (tp === 2) b = M.spellWith(M.LET[(M.LET.indexOf(a[0]) + 3) % 7], (M.pcOf(a) + 6) % 12);
    else b = M.spellWith(M.LET[(M.LET.indexOf(a[0]) + 4) % 7], (M.pcOf(a) + 6) % 12);
    const name = M.interval(a, b); const semis = (M.pcOf(b) - M.pcOf(a) + 12) % 12;
    const pool = BANK.includes(name) ? BANK : BANK.concat([name]);
    return choice(`<b>${nn(a)} – ${nn(b)}</b> aralığı hangisi?`, name, pool, x => x, `${name} = ${semis} yarım ses (gitarda ${semis} perde)`, 2);
  }
  function t8() {
    const k = pick(MINS); const ch = M.diatonic(k, 'min'); const t = rnd(3); const nm = cn(k + 'm');
    if (t === 0) { const d = pick([1, 2, 3, 4, 5, 6]); return choice(`<b>${nm}</b> tonunda <b>${M.RMIN[d]}</b> akoru hangisi?`, ch[d], ch.filter((x, i) => i !== d), cn, `${nm} doğal minör: ${chList(ch)}`, 2); }
    if (t === 1) { const d = rnd(7); return choice(`<b>${nm}</b> tonunda <b>${cn(ch[d])}</b> kaçıncı derece?`, M.RMIN[d], M.RMIN, x => x, `${nm} doğal minör: ${chList(ch)}<br>${M.RMIN.join(' ')}`, 2); }
    const sc = M.scale(k, 'min');
    return choice(`<b>${nm}</b> tonunda armonik minörün <b>V</b> akoru (majör) hangisi?`, sc[4], [sc[4] + 'm', sc[3], sc[6], sc[2], sc[5]], cn, `Armonik minörde 7. nota yükselir, V akoru majör olur ve karara güçlü çözülür.`, 2);
  }
  function t9() {
    const k = pick(KM); const c7 = M.diatonic7(k, 'maj'); const sc = M.scale(k, 'maj'); const t = rnd(2);
    if (t === 0) {
      const d = pick([0, 1, 3, 4, 5]); const lbl = ['Imaj7', 'ii7', '', 'IVmaj7', 'V7', 'vi7'][d];
      const pool = ['', 'm', '7', 'maj7', 'm7'].map(q => sc[d] + q);
      return choice(`<b>${nn(k)}</b> tonunda <b>${lbl}</b> akoru hangisi?`, c7[d], pool, cn, `${nn(k)} majör yedili akorlar: ${chList(c7)}`, 2);
    }
    const r = [c7[1], c7[4], c7[0]]; const correct = r.join(' – ');
    const pool = [`${sc[1]}m7 – ${sc[4]}m7 – ${c7[0]}`, `${sc[1]}7 – ${sc[4]}7 – ${c7[0]}`, `${c7[1]} – ${sc[4]}7 – ${sc[0]}7`, `${c7[1]} – ${c7[4]} – ${sc[0]}m7`, `${sc[1]}maj7 – ${c7[4]} – ${c7[0]}`];
    return choice(`<b>${nn(k)}</b> tonunda <b>ii7 – V7 – Imaj7</b> hangisi?`, correct, pool, seqL, `ii = minör 7, V = dominant 7, I = majör 7`, 1);
  }
  const FN = ['Tonik', 'Subdominant', 'Dominant'];
  const CAD = ['Tam kadans (V–I)', 'Plagal kadans (IV–I)', 'Yarım kadans (...–V)', 'Aldatmalı kadans (V–vi)'];
  const FNQ = [
    ['<b>I</b> derecesinin fonksiyonu?', 'Tonik', FN], ['<b>IV</b> derecesinin fonksiyonu?', 'Subdominant', FN], ['<b>V</b> derecesinin fonksiyonu?', 'Dominant', FN],
    ['<b>vi</b> derecesi hangi fonksiyonda (toniğin yerine geçer)?', 'Tonik', FN], ['<b>ii</b> derecesi hangi fonksiyona yakındır?', 'Subdominant', FN],
    ['<b>vii°</b> derecesi hangi fonksiyona yakındır?', 'Dominant', FN], ['<b>iii</b> derecesi hangi fonksiyona yakındır?', 'Tonik', FN],
    ['<b>V – I</b> hareketinin adı?', CAD[0], CAD], ['<b>IV – I</b> hareketinin adı?', CAD[1], CAD],
    ['Cümlenin <b>V</b> üzerinde asılı kalarak bitmesi?', CAD[2], CAD], ['<b>V – vi</b> hareketinin adı?', CAD[3], CAD]
  ];
  function t10() {
    const q = pick(FNQ);
    return choice(q[0], q[1], q[2], x => x, `Tonik = ev, dinlenme · Subdominant = uzaklaşma · Dominant = gerilim, toniğe dönmek ister.`, 1);
  }
  function t11() {
    const k = pick(KA); const ch = M.diatonic(k, 'maj'); const t = rnd(2);
    if (t === 0) {
      const pr = pick([[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [0, 3, 4, 3]]);
      const shown = pr.slice(0, 3).map(d => cn(ch[d])).join(' – ');
      const pool = ch.filter((x, i) => i !== pr[3]);
      return choice(`<b>${nn(k)}</b> tonunda <b>${pr.slice(0, 3).map(d => ROM[d]).join(' – ')} – ?</b><br>${shown} – ?`, ch[pr[3]], pool, cn, `Dizilim ${pr.map(d => ROM[d]).join(' – ')}: ${pr.map(d => cn(ch[d])).join(' – ')}`, 2);
    }
    const spc = M.scale(k, 'maj').map(M.pcOf); const nd = [];
    for (let pc = 0; pc < 12; pc++) if (!spc.includes(pc)) nd.push(M.FLAT[pc]);
    const odd = pick(nd); const four = shuffle(ch).slice(0, 3).concat([odd]);
    return choice(`<b>${nn(k)}</b> tonunda hangi akor tonun dışında?`, odd, four, cn, `${nn(k)} majör akorları: ${chList(ch)}`, 2);
  }
  function t12() {
    const k = pick(KM); const sc = M.scale(k, 'maj'); const ch = M.diatonic(k, 'maj'); const li = M.LET.indexOf(k[0]), rp = M.pcOf(k); const t = rnd(2);
    if (t === 0) {
      const m = pick([[1, 5, 'V/ii'], [2, 6, 'V/iii'], [3, 0, 'V/IV'], [4, 1, 'V/V'], [5, 2, 'V/vi']]);
      const correct = sc[m[1]] + '7';
      const pool = [sc[m[1]], sc[m[1]] + 'm7', sc[(m[1] + 1) % 7] + '7', sc[(m[1] + 3) % 7] + '7', sc[(m[1] + 5) % 7] + '7'];
      return choice(`<b>${nn(k)}</b> tonunda <b>${m[2]}</b> (7’li) hangi akor?`, correct, pool, cn, `${m[2]}: ${cn(ch[m[0]])} akorunun dominantı = ${cn(correct)}. Bir an onu tonik gibi gösterir.`, 2);
    }
    const bm = pick([['iv', sc[3] + 'm', 'paralel minörden iv'], ['♭VII', M.spellWith(M.LET[(li + 6) % 7], (rp + 10) % 12), '♭VII'], ['♭VI', M.spellWith(M.LET[(li + 5) % 7], (rp + 8) % 12), '♭VI'], ['♭III', M.spellWith(M.LET[(li + 2) % 7], (rp + 3) % 12), '♭III']]);
    const pool = [ch[3], ch[4], ch[5], ch[1], ch[2]].filter(x => x !== bm[1]);
    return choice(`<b>${nn(k)} majör</b> tonunda <b>${bm[0]}</b> (ödünç akor) hangisi?`, bm[1], pool, cn, `Ödünç akor paralel minörden (${nn(k)} minör) alınır. ${bm[2]} = ${cn(bm[1])}`, 2);
  }
  // notalardan akor adı
  function t13() {
    const r = pick(ROOTS); const q = pick(['', 'm', '', 'm', 'dim', 'aug', '7', 'maj7', 'm7']); const ch = r + q;
    const notes = shuffle(M.chordSpelled(ch));
    const pool = ['', 'm', 'dim', 'aug', '7', 'maj7', 'm7'].filter(x => x !== q && (q.length > 1 || x.length <= 3)).map(x => r + x);
    const sp = M.chordSpelled(ch);
    pool.push(M.spellWith(sp[1][0], M.pcOf(sp[1])) + (q === 'm' ? '' : 'm'));
    return choice(`Notalar: <b>${notes.map(nn).join(' · ')}</b><br>Bu hangi akor?`, ch, pool, cn, `Üçlüler halinde diz: ${sp.map(nn).join(' – ')}. Kök ${nn(r)}, ${q === '' ? 'büyük 3’lü → majör' : q === 'm' ? 'küçük 3’lü → minör' : cn(ch) + ' yapısı'}.`, 2);
  }
  // kapo
  const SH = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];
  function t14() {
    const t = rnd(3);
    if (t === 0) {
      const s = pick(SH), n = 1 + rnd(7); const c = M.transposeName(s, n);
      const pool = [-2, -1, 1, 2, 3].map(d => M.transposeName(s, n + d)).concat([s]);
      return choice(`Kapo <b>${n}. perdede</b>, <b>${cn(s)}</b> şeklini çalıyorsun. Duyulan akor?`, c, pool, cn, `Gerçek akor = şekil + kapo: ${cn(s)} + ${n} yarım ses = ${cn(c)}`, 2);
    }
    if (t === 1) {
      const s = pick(SH.slice(0, 7)), n = 1 + rnd(7); const target = M.transposeName(s, n);
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== n);
      return choice(`Şarkı <b>${cn(target)}</b> tonunda. <b>${cn(s)}</b> şekilleriyle çalmak için kapo kaçıncı perdeye?`, n, pool, x => x + '. perde', `${cn(s)} → ${cn(target)} arası ${n} yarım ses, kapo ${n}. perdeye.`, 2);
    }
    const prog = pick([['Am', 'F', 'C', 'G'], ['C', 'G', 'Am', 'F'], ['Em', 'C', 'G', 'D'], ['Am', 'Dm', 'E', 'Am'], ['G', 'D', 'Em', 'C']]); const n = 1 + rnd(5);
    const corr = prog.map(c => M.transposeName(c, n)).join(' – ');
    const pool = [n - 1, n + 1, n + 2, 12 - n].map(d => prog.map(c => M.transposeName(c, d)).join(' – '));
    return choice(`Kapo <b>${n}</b>, şekiller <b>${prog.map(cn).join(' – ')}</b>. Gerçekte hangi akorlar duyulur?`, corr, pool, seqL, `Her akor ${n} yarım ses yukarı: ${seqL(corr)}`, 1);
  }
  // sus, add, slash
  function t15() {
    const t = rnd(5);
    if (t === 0) {
      const r = pick(['D', 'A', 'E', 'G', 'C']); const q = pick(['sus4', 'sus2']); const ch = r + q;
      const opts = []; for (let pc = 0; pc < 12; pc++) opts.push({ v: String(pc), html: pcl(pc) });
      return { kind: 'multi', prompt: `<b>${cn(ch)}</b> akorunun notalarını işaretle`, sub: '3 nota seç', n: 3, opts, ans: M.chordPcs(ch).map(String), cols: 4,
        why: `${cn(ch)} = ${M.chordSpelled(ch).map(nn).join(' – ')} (3’lü yerine ${q === 'sus4' ? 'tam 4’lü' : 'büyük 2’li'})` };
    }
    if (t === 1) {
      const k = pick(['C', 'G', 'D', 'A', 'F']); const sc = M.scale(k, 'maj'); const V = sc[4];
      const chs = M.chordSpelled(V); const ch = V + '/' + chs[1];
      return choice(`<b>${cn(ch)}</b> akorunda en kalın (bas) nota hangisi?`, chs[1], [chs[0], chs[2], sc[0], sc[3]], nn, `Slash akor: akor/bas. ${cn(ch)} = ${cn(V)} akoru, basta ${nn(chs[1])} (akorun 3’lüsü).`, 2);
    }
    if (t === 2) {
      const r = pick(['D', 'A', 'E', 'G', 'C']);
      return choice('Hangisi ne majör ne minördür?', r + 'sus4', [r, r + 'm', r + '7', r + 'maj7'], cn, `sus akorlarında 3’lü yoktur, bu yüzden majör/minör rengi taşımaz ve genelde asıl akora çözülür (${cn(r + 'sus4')} → ${cn(r)}).`, 2);
    }
    if (t === 3) {
      const k = pick(['C', 'G', 'D', 'A']); const sc = M.scale(k, 'maj');
      const chords = [sc[0], M.chordSpelled(sc[4])[0] + '/' + sc[6], sc[5] + 'm', sc[5] + 'm/' + sc[4], sc[3]];
      const corr = [0, 6, 5, 4, 3].map(i => sc[i]).join(' – ');
      const pool = [[0, 4, 5, 4, 3], [0, 6, 5, 3, 4], [0, 2, 5, 4, 3], [0, 6, 1, 4, 3]].map(a => a.map(i => sc[i]).join(' – '));
      return choice(`<b>${chords.map(cn).join(' – ')}</b><br>Bas hattı nasıl ilerler?`, corr, pool, v => v.split(' – ').map(nn).join(' – '), `Bas adım adım iner: ${corr.split(' – ').map(nn).join(' – ')}. Slash akorlar bu inişi sağlar.`, 1);
    }
    const r = pick(['C', 'G', 'D', 'A']); const s = M.chordSpelled(r + 'add9');
    return choice(`<b>${cn(r + 'add9')}</b> ile <b>${cn(r + 'sus2')}</b> arasındaki fark?`, 'add9’da 3’lü var, sus2’de yok', ['sus2’de 5’li yok', 'add9’da 7’li var', 'İkisi aynı akordur', 'add9’da kök yok'], x => x, `${cn(r + 'add9')} = ${s.map(nn).join(' – ')}; ${cn(r + 'sus2')} = ${M.chordSpelled(r + 'sus2').map(nn).join(' – ')}. Fark ${nn(s[1])} (3’lü).`, 1);
  }


  // ---- yeni soru tipleri ----
  const TF = ['Doğru', 'Yanlış'];
  const tf = (stmt, val, why) => ({ kind: 'choice', prompt: `Doğru mu, yanlış mı?<br><b>${stmt}</b>`, opts: TF.map(v => ({ v, html: v })), ans: [val ? 'Doğru' : 'Yanlış'], why, cols: 2 });
  const order = (prompt, seq, label, why, cols) => ({ kind: 'order', prompt, opts: shuffle(seq).map(v => ({ v, html: label(v) })), ans: seq.slice(), why, cols: cols || (seq.length > 4 ? 4 : seq.length) });
  function t1o() { const k = pick(KM.concat(['A', 'E'])); const sc = M.scale(k, 'maj'); return order(`<b>${nn(k)} majör</b> gamını sırayla diz`, sc, nn, `${nn(k)} majör: ${sc.map(nn).join(' – ')} (T T Y T T T Y)`, 4); }
  function t7f() {
    const B = U.board; const s1 = rnd(5); const f1 = 1 + rnd(6); let s2 = s1, f2;
    if (Math.random() < 0.5) f2 = f1 + 1 + rnd(7); else { s2 = s1 + 1; f2 = f1 + pick([-2, -1, 0, 1, 2, 3]); }
    const d = (M.OPEN[s2] + f2) - (M.OPEN[s1] + f1); if (d < 1 || d > 12 || f2 < 0 || f2 > 12) return t7f();
    const names = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(x => M.IVS[x]);
    const shape = s2 === s1 ? `Aynı telde ${f2 - f1} perde = ${d} yarım ses.` : `Bir ince tel ${f2 - f1 >= 0 ? f2 - f1 + ' perde ileri' : f1 - f2 + ' perde geri'}: ${s1 === 3 ? 'Sol–Si telleri arası 4 yarım ses' : 'teller arası 5 yarım ses'} ${f2 - f1 >= 0 ? '+' : '−'} ${Math.abs(f2 - f1)} = ${d}.`;
    return { kind: 'choice', prompt: '1’den 2’ye aralık hangisi?', visual: `<div class="fbwrap">${B({ frets: 12, dots: [{ s: s1, f: f1, cls: 'k', t: '1' }, { s: s2, f: f2, cls: 'g', t: '2' }] })}</div>`, opts: opts4(M.IVS[d], names).map(v => ({ v, html: v })), ans: [M.IVS[d]], why: `${M.IVS[d]}. ${shape}`, cols: 2 };
  }
  function t4o() { const ch = pick(ROOTS) + pick(['', 'm']); const sp = M.chordSpelled(ch); return order(`<b>${cn(ch)}</b> akorunun notalarını kökten başlayarak diz<br><span class="muted">kök – 3’lü – 5’li</span>`, sp, nn, `${cn(ch)} = ${sp.map(nn).join(' – ')}`, 3); }
  function t2t() {
    const k = pick(KM); const ch = M.diatonic(k, 'maj'); const inKey = Math.random() < 0.5;
    let c; if (inKey) c = pick(ch.slice(0, 6)); else { const d = pick([1, 2, 5]); const r = M.chordParse(ch[d]).root; c = r; }
    return tf(`${nn(k)} majör tonunda ${cn(c)} akoru diatoniktir (tonun içindedir).`, ch.includes(c), `${nn(k)} majör akorları: ${chList(ch)}. ${ch.includes(c) ? '' : `ii, iii, vi dereceleri minördür; ${cn(c)} majör olarak tonun dışında.`}`);
  }
  function t6o() {
    if (Math.random() < 0.5) return order('Diyezlerin tona eklenme sırasını diz', ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'].slice(0, 5), nn, 'Diyez sırası: Fa Do Sol Re La Mi Si (tam 5’li aralıklarla).', 5);
    return order('Bemollerin tona eklenme sırasını diz', ['Bb', 'Eb', 'Ab', 'Db', 'Gb'], nn, 'Bemol sırası: Si Mi La Re Sol Do Fa (diyez sırasının tersi).', 5);
  }
  function t6k() {
    if (Math.random() < 0.5) { const k = pick(['G', 'D', 'A', 'E', 'B']); const sg = M.keySig(k); const last = ['F#', 'C#', 'G#', 'D#', 'A#'][sg.n - 1];
      return choice(`Son diyezi <b>${nn(last)}</b> olan majör ton hangisi?`, k, ['G', 'D', 'A', 'E', 'B', 'F#'], nn, `Kural: son diyezin yarım ses üstü majör tondur. ${nn(last)} + yarım ses = ${nn(k)}.`, 2); }
    const k = pick(['Bb', 'Eb', 'Ab', 'Db']); const fl = ['Bb', 'Eb', 'Ab', 'Db', 'Gb']; const i = fl.indexOf(k);
    return choice(`Bemolleri ${fl.slice(0, i + 2).map(nn).join(', ')} olan majör ton hangisi?`, k, ['F', 'Bb', 'Eb', 'Ab', 'Db'], nn, `Kural: sondan bir önceki bemol tonun adıdır → ${nn(k)}. (Tek bemolde ton ${nn('F')}.)`, 2);
  }
  const TF8 = [['Armonik minörde 7. nota yarım ses yükselir.', 1, 'Doğru: La minörde Sol → Sol♯. Böylece V akoru majör olur.'], ['Doğal minörde v akoru majördür.', 0, 'Yanlış: doğal minörde v minördür (Am’de Em). Majör V için armonik minör gerekir.'], ['Her majörün ilgili minörü, majörün 6. derecesidir.', 1, 'Doğru: Do majör → La minör.'], ['La minör ile Do majör aynı notalara sahiptir.', 1, 'Doğru: ilgili tonlardır, ikisinde de diyez/bemol yok.'], ['Doğal minörde ii derecesi minör akordur.', 0, 'Yanlış: ii° eksik akordur (Am’de B°).']];
  const TF10 = [['vi derecesi toniğin yerine geçebilir.', 1, 'Doğru: vi, I ile iki ortak nota taşır; aldatmalı kadans bundandır.'], ['IV – I hareketi tam kadanstır.', 0, 'Yanlış: IV–I plagal kadanstır; tam kadans V–I.'], ['Dominant akor gerilim yaratır ve toniğe çözülmek ister.', 1, 'Doğru.'], ['Yarım kadans tonik akorla biter.', 0, 'Yanlış: yarım kadans V üzerinde asılı kalır.'], ['ii derecesi subdominant görevindedir.', 1, 'Doğru: ii ve IV aynı görevdedir; ii–V–I bunun için güçlüdür.']];
  function t8t() { const q = pick(TF8); return tf(q[0], q[1], q[2]); }
  function t10t() { const q = pick(TF10); return tf(q[0], q[1], q[2]); }
  function t11o() { const k = pick(['G', 'C', 'D', 'A', 'E', 'F']); const ch = M.diatonic(k, 'maj'); const pr = pick([[0, 4, 5, 3, 'I–V–vi–IV'], [5, 3, 0, 4, 'vi–IV–I–V'], [0, 5, 3, 4, 'I–vi–IV–V']]);
    return order(`<b>${nn(k)}</b> tonunda <b>${pr[4]}</b> dizilimini sırala`, pr.slice(0, 4).map(d => ch[d]), cn, `${pr[4]} = ${pr.slice(0, 4).map(d => cn(ch[d])).join(' – ')}`, 4); }
  const mix = (...a) => () => { const r = Math.random(); let acc = 0; for (const [p, f] of a) { acc += p; if (r < acc) return f(); } return a[a.length - 1][1](); };

  // konu anlatımları
  const L = {};
  L.t1 = `<p>Majör gam 7 notadır ve aralık kalıbı her tonda aynıdır:</p><p class="kal">T · T · Y · T · T · T · Y</p><p>T = tam ses = 2 perde, Y = yarım ses = 1 perde. ${N('C')}’dan başlarsan hiç diyez/bemol çıkmaz: ${M.scale('C', 'maj').map(N).join(' ')}.</p><p>${N('G')}’den başlarsan kalıbı korumak için 7. nota yükselir: ${M.scale('G', 'maj').map(N).join(' ')}.</p><p><b>Gitarda dene:</b> 5. telde 3. perdeden (${N('C')}) başla: 3 → 5 → 7 → 8 → 10 → 12 → 14 → 15. Parmakların kalıbı hisseder.</p><p><b>Kural:</b> her harf bir kez kullanılır; bu yüzden ${N('G')} majörde ${N('Gb')} değil ${N('F#')} yazılır. Gamın notalarına <i>derece</i> denir; 1. derece toniktir.</p><div class="ex"><b>Örnek: ${N('F')} majör gamı nasıl kurulur?</b><br>1. Harfleri sırayla yaz: ${['F','G','A','B','C','D','E'].map(x => M.TRN[x]).join(' ')}.<br>2. Kalıbı uygula: ${N('F')}→${N('G')} T ✓, ${N('G')}→${N('A')} T ✓, ${N('A')}→${M.TRN.B} Y olmalı ama aralarında T var → ${N('Bb')} yazılır.<br>3. Devam et: ${N('Bb')}→${N('C')} T ✓ … Sonuç: ${M.scale('F', 'maj').map(N).join(' ')}.</div><p><b>Sorularda:</b> “X majörün 5. notası?” → gamı kur, saymaya başla (1. nota tonun kendisi). “Sırala” sorularında notalara gam sırasıyla dokun.</p>`;
  L.t7 = `<p>Aralık, iki nota arasındaki mesafedir. Adındaki sayı <b>harf sayısıdır</b>: ${N('C')}–${N('E')} → ${N('C')} ${N('D')} ${N('E')} = 3’lü. Niteliği (büyük, küçük, tam...) <b>yarım ses sayısından</b> gelir. Gitarda 1 perde = 1 yarım ses.</p><table class="t"><tr><th>Aralık</th><th>Yarım ses</th></tr>${[[1, "Küçük 2'li"], [2, "Büyük 2'li"], [3, "Küçük 3'lü"], [4, "Büyük 3'lü"], [5, "Tam 4'lü"], [6, "Artık 4'lü / Eksik 5'li"], [7, "Tam 5'li"], [8, "Küçük 6'lı"], [9, "Büyük 6'lı"], [10, "Küçük 7'li"], [11, "Büyük 7'li"], [12, 'Oktav']].map(r => `<tr><td>${r[1]}</td><td>${r[0]}</td></tr>`).join('')}</table><p><b>İpucu:</b> majör gamda toniğe göre her nota “büyük” ya da “tam”dır. Büyüğün bir yarım ses azı küçük; tamın bir fazlası artık, bir eksiği eksik.</p><p><b>Artık 4’lü mü eksik 5’li mi?</b> İkisi de 6 yarım ses; fark harf sayısında. ${N('C')}–${N('F#')}: ${N('C')} ${N('D')} ${N('E')} ${N('F')} = 4 harf → artık 4’lü. ${N('C')}–${N('Gb')}: 5 harf → eksik 5’li.</p><div class="ex"><b>Gitarda aralık şekilleri</b><br>• Aynı telde: perde sayısı = yarım ses.<br>• Bir ince telde aynı perde: tam 4’lü (Sol→Si telleri arasında büyük 3’lü).<br>• Bir ince tel, 2 perde ileri: tam 5’li.<br>• Bir ince tel, 1 perde geri: büyük 3’lü.<br>• İki ince tel, 2 perde ileri: oktav.<br>Sorularda sap üzerinde iki nokta görürsen bu şekilleri kullan.</div>`;
  L.t4 = `<p>Üçlü akor = <b>kök + 3’lü + 5’li</b>. Gamda birer atlayarak üç nota al: ${N('C')} (${N('D')}) ${N('E')} (${N('F')}) ${N('G')}.</p><table class="t"><tr><th>Tür</th><th>3’lü</th><th>5’li</th><th>Örnek</th></tr><tr><td>Majör</td><td>4</td><td>7</td><td>${Cn('D')} = ${M.chordSpelled('D').map(N).join(' ')}</td></tr><tr><td>Minör</td><td>3</td><td>7</td><td>${Cn('Dm')} = ${M.chordSpelled('Dm').map(N).join(' ')}</td></tr><tr><td>Eksik (°)</td><td>3</td><td>6</td><td>${Cn('Bdim')} = ${M.chordSpelled('Bdim').map(N).join(' ')}</td></tr><tr><td>Artık (+)</td><td>4</td><td>8</td><td>${Cn('Caug')} = ${M.chordSpelled('Caug').map(N).join(' ')}</td></tr></table><p>Gitardaki akor şekilleri bu üç notanın tekrarlarıdır. ${Cn('C')} (x32010): teller ${N('C')} ${N('E')} ${N('G')} ${N('C')} ${N('E')}.</p>`;
  L.t13 = `<p>Karışık verilen notaları <b>üçlüler halinde</b> diz: her nota bir öncekinden bir harf atlasın. ${N('E')} · ${N('C')} · ${N('A')} → ${N('A')} ${N('C')} ${N('E')}. En alttaki nota köktür.</p><p>Sonra kök ile 3’lü arasındaki yarım sesleri say: 4 → majör, 3 → minör. 5’li 6 yarım sesse eksik, 8 ise artık. Dördüncü nota varsa 7’li akor: kökten 10 yarım ses küçük 7’li, 11 büyük 7’li.</p>`;
  L.t2 = `<p>Majör gamın her notası üzerine <b>gamın kendi notalarıyla</b> üçlü kurarsan 7 akor çıkar. Kalıp her tonda aynıdır:</p><p class="kal">I · ii · iii · IV · V · vi · vii°</p><p>Büyük roma rakamı majör, küçük rakam minör, ° eksik demek.</p><p>${N('C')} tonunda: ${M.diatonic('C', 'maj').map(Cn).join(' ')}<br>${N('G')} tonunda: ${M.diatonic('G', 'maj').map(Cn).join(' ')}</p><p>Pop şarkılarının neredeyse tamamı bu akorlarla (çoğunlukla I, IV, V, vi) yazılır.</p><p><b>Tonun içinde mi?</b> ${N('C')} tonunda ${Cn('E')} majör çıkmaz çünkü iii minördür (${Cn('Em')}). Böyle bir akor şarkıda geçiyorsa ya ikincil dominanttır (V/vi) ya da ödünç akordur; bunları son seviyede göreceksin.</p>`;
  L.t3 = `<p>Ters yönden düşün: tonun gamını say, akorun kökü kaçıncı notaysa o derecedir.</p><p>${N('D')} tonunda ${Cn('Bm')}? ${M.scale('D', 'maj').map(N).join(' ')} → ${N('B')} 6. nota → <b>vi</b>.</p><p>Akor türü dereceyle uyuşmalı: vi minördür, ${N('D')} tonunda ${Cn('B')} majör çıkmaz. Uyuşmuyorsa ya ton dışı (ödünç, ikincil dominant) bir akordur ya da ton yanlıştır.</p>`;
  L.t6 = `<p>${N('C')}’dan tam 5’li yukarı çıkarak (${['C', 'G', 'D', 'A', 'E', 'B', 'F#'].map(N).join(' → ')}) her adımda bir diyez eklenir. Diyez sırası: ${['F', 'C', 'G', 'D', 'A', 'E', 'B'].map(N).join(' ')}.</p><p>Ters yönde (${['C', 'F', 'Bb', 'Eb', 'Ab', 'Db'].map(N).join(' → ')}) her adımda bir bemol eklenir. Bemol sırası: ${['B', 'E', 'A', 'D', 'G', 'C', 'F'].map(N).join(' ')}.</p><p>Çemberde bir tonun <b>sağ komşusu dominantı (V)</b>, <b>sol komşusu subdominantı (IV)</b>. İlgili minör, majörün 6. derecesidir ve aynı diyez/bemollere sahiptir (${N('C')} ↔ ${Cn('Am')}).</p><div class="ex"><b>Tonu imzadan bulma</b><br>• Diyezli tonlar: son diyezin yarım ses üstü majör tondur (son diyez ${N('C#')} → ${N('D')} majör).<br>• Bemolli tonlar: sondan bir önceki bemol tonun adıdır (${N('Bb')} ${N('Eb')} ${N('Ab')} → ${N('Eb')} majör). Tek bemol ${N('F')} majördür.</div>`;
  L.t5 = `<p>Şarkıyı roma rakamlarıyla düşünürsen tonu değiştirmek kolaylaşır. ${N('C')}’da ${['C', 'G', 'Am', 'F'].map(Cn).join(' – ')} = I – V – vi – IV.</p><p>${N('D')}’ye taşımak için ${N('D')} tonunun I, V, vi, IV’ünü bul: ${['D', 'A', 'Bm', 'G'].map(Cn).join(' – ')}.</p><p><b>Kısayol:</b> tüm akorları aynı aralıkla kaydır (${N('C')} → ${N('D')} = 2 yarım ses; her akor 2 yarım ses yukarı). Canlı müzikte solistin sesine göre ton değiştirmek için bu beceri şart.</p>`;
  L.t14 = `<p>Kapo sapı kısaltır: kapo 2. perdedeyken çaldığın şekiller <b>2 yarım ses yukarıda</b> duyulur. ${Cn('G')} şekli + kapo 2 = ${Cn('A')}.</p><p class="kal">Gerçek akor = şekil + kapo perdesi</p><p><b>Ters soru:</b> şarkı ${Cn('Bm')} ama ${Cn('Am')} şekilleriyle çalmak istiyorsun → ${Cn('Am')}’den ${Cn('Bm')}’ye 2 yarım ses → kapo 2.</p><p>Açık tellerin tınısı arpejde çok güzel olduğu için pop eşlikte kapo çok kullanılır. Hicaz gibi makamsal parçalarda da ${N('E')} veya ${N('A')} şekilleriyle çalıp kapoyla ton ayarlanır.</p>`;
  L.t8 = `<p>Doğal minör gamın kalıbı:</p><p class="kal">T · Y · T · T · Y · T · T</p><p>${N('A')}’dan: ${M.scale('A', 'min').map(N).join(' ')}. Her majörün bir ilgili minörü vardır (aynı notalar, farklı karar).</p><p>Doğal minörde akorlar: i ii° III iv v VI VII → ${M.diatonic('A', 'min').map(Cn).join(' ')}.</p><p><b>Armonik minör:</b> 7. nota yükselir (${N('G')} → ${N('G#')}), v minör akoru V majör olur (${Cn('Em')} → ${Cn('E')}) ve karara güçlü çekim oluşur: ${['Am', 'Dm', 'E', 'Am'].map(Cn).join(' – ')}. Bu ses TSM’deki <b>Nihavent</b>’e ve <b>Buselik</b>’in Hicaz’lı haline çok yakındır.</p>`;
  L.t9 = `<p>Üçlü akorun üstüne bir 3’lü daha eklersen <b>yedili akor</b> olur.</p><table class="t"><tr><td><b>maj7</b></td><td>majör + büyük 7’li</td><td>${Cn('Cmaj7')}: ${M.chordSpelled('Cmaj7').map(N).join(' ')} · yumuşak, rüya gibi</td></tr><tr><td><b>m7</b></td><td>minör + küçük 7’li</td><td>${Cn('Am7')}: ${M.chordSpelled('Am7').map(N).join(' ')} · slow pop rengi</td></tr><tr><td><b>7</b></td><td>majör + küçük 7’li</td><td>${Cn('G7')}: ${M.chordSpelled('G7').map(N).join(' ')} · gerilim, çözülmek ister</td></tr></table><p>Majör tonda: Imaj7 · ii7 · iii7 · IVmaj7 · V7 · vi7 · viiø7. Baladlarda <b>ii7 – V7 – Imaj7</b> en temel kalıptır.</p>`;
  L.t10 = `<p>Akorlar üç role ayrılır:</p><p><b>Tonik</b> (I, vi, iii): ev, dinlenme.<br><b>Subdominant</b> (IV, ii): evden uzaklaşma.<br><b>Dominant</b> (V, vii°): gerilim, toniğe dönmek ister.</p><p><b>Kadanslar</b> cümle sonlarıdır:<br>Tam kadans V–I: kesin bitiş.<br>Plagal IV–I: yumuşak, “amin” kadansı.<br>Yarım kadans …–V: soru gibi asılı kalır.<br>Aldatmalı V–vi: beklenen I yerine vi gelir; baladlarda duygusal sürpriz.</p>`;
  L.t11 = `<p>Pop’ta en sık dizilimler:</p><p>I–V–vi–IV (${['C', 'G', 'Am', 'F'].map(Cn).join(' ')})<br>vi–IV–I–V (${['Am', 'F', 'C', 'G'].map(Cn).join(' ')}): aynı akorlar, minörden başlar<br>I–vi–IV–V (50’ler balad)<br>I–IV–V–IV</p><p>Türkçe slow pop’ta minör başlangıçlar (vi–IV–I–V), i–iv–V–i (Nihavent rengi) ve iv–VII–III–VI (${['Dm', 'G', 'C', 'F'].map(Cn).join(' ')}) çok yaygın.</p><p>Dizilimi tanıyınca şarkıyı ezberlemek yerine “bu şarkı vi–IV–I–V” diye hatırlarsın ve her tonda çalabilirsin.</p><div class="ex"><b>Ton dışı akoru bulma</b><br>1. Tonun 6 akorunu yaz (I ii iii IV V vi).<br>2. Her akoru kontrol et: hem kökü gamda olmalı hem türü dereceye uymalı.<br>Örnek: ${N('G')} tonunda ${['G','Am','Bm','C','D','Em'].map(Cn).join(' ')} var; ${Cn('F')} gelirse kökü (${N('F')}) gamda yok (${N('G')} majörde ${N('F#')} var) → ton dışı.</div>`;
  L.t15 = `<p><b>sus4:</b> 3’lü yerine tam 4’lü (${Cn('Dsus4')}: ${M.chordSpelled('Dsus4').map(N).join(' ')}). <b>sus2:</b> 3’lü yerine büyük 2’li (${Cn('Dsus2')}: ${M.chordSpelled('Dsus2').map(N).join(' ')}). Ne majör ne minördür, genelde asıl akora çözülür.</p><p><b>add9:</b> akora 9’lu eklenir, 3’lü kalır (${Cn('Cadd9')}: ${M.chordSpelled('Cadd9').map(N).join(' ')}).</p><p><b>Slash akor:</b> “akor/bas notası”. ${Cn('G/B')} = ${N('G')} akoru, basta ${N('B')}. Pop’ta bas hattını adım adım indirmek için kullanılır: ${['C', 'G/B', 'Am', 'Am/G', 'F'].map(Cn).join(' – ')}. Arpejde bu bas hareketi çok güzel duyulur.</p>`;
  L.t12 = `<p><b>İkincil dominant:</b> tonun bir akorundan önce onun V’ini (7’li majör) çalarsın, o akor bir an tonik gibi parlar. ${N('C')} tonunda ${Cn('Am')}’den önce ${Cn('E7')} (V/vi): ${['C', 'E7', 'Am'].map(Cn).join(' – ')}. ${Cn('Dm')}’den önce ${Cn('A7')} (V/ii).</p><p><b>Ödünç akor:</b> paralel minörden alınan akor. ${N('C')} majörde ${Cn('Fm')} (iv), ${Cn('Bb')} (♭VII), ${Cn('Ab')} (♭VI). ${['F', 'Fm', 'C'].map(Cn).join(' – ')} dizisi hüzünlü bir renk verir; Türkçe pop’ta çok sık.</p>`;

  const lv = [
    ['t1', 'Majör gam ve dereceler', 'Gamın notaları, sıralama ve dereceler', mix([0.35, t1o], [1, t1])],
    ['t7', 'Aralıklar', 'Aralığın adı; nota adlarından ve sap üzerinden', mix([0.4, t7f], [1, t7])],
    ['t4', 'Akor kur', 'Majör, minör, eksik, artık akorun notaları', mix([0.3, t4o], [1, t4]), 12],
    ['t13', 'Notalardan akor adı', 'Karışık notaları diz, akoru adlandır', t13],
    ['t2', 'Derece → akor', '“Do tonunda vi?” ve hangi akor tonun içinde', mix([0.25, t2t], [1, t2])],
    ['t3', 'Akor → derece', '“Sol tonunda Mi minör kaçıncı derece?”', t3],
    ['t6', 'Beşliler çemberi', 'Diyez/bemol sırası, tonu bulma, dominant, ilgili ton', mix([0.2, t6o], [0.25, t6k], [1, t6])],
    ['t5', 'Transpoze', 'I–V–vi–IV gibi dizilimleri başka tonlara taşı', t5],
    ['t14', 'Kapo hesabı', 'Kapoyla gerçek tonu ve gereken kapo perdesini bul', t14],
    ['t8', 'Minör tonlar', 'Doğal ve armonik minörde akorlar ve dereceler', mix([0.25, t8t], [1, t8])],
    ['t9', 'Yedili akorlar', 'maj7, m7, 7 ve ii7–V7–Imaj7', t9],
    ['t10', 'Fonksiyonlar ve kadanslar', 'Tonik, subdominant, dominant ve kadans türleri', mix([0.35, t10t], [1, t10])],
    ['t11', 'Pop dizilimleri', 'Sırala, eksik akoru tamamla, ton dışı akoru bul', mix([0.3, t11o], [1, t11])],
    ['t15', 'sus, add ve slash akorlar', 'Dsus4, Cadd9, G/B ve inen bas hatları', t15],
    ['t12', 'İkincil dominant ve ödünç akor', 'V/vi gibi geçici dominantlar, ♭VII ve iv', t12]
  ];
  return lv.map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], count: a[4], lesson: L[a[0]] }));
};
})(window);
