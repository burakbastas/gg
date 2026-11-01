(function (g) {
'use strict';
const { pick, shuffle, rnd } = M;

let G_SRC = null;
g.theorySources = () => G_SRC;
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
    const k = pick(KR('t1', ['C', 'G', 'F', 'D'], ['Bb', 'A', 'Eb'], ['E', 'Ab', 'B', 'Db']));
    const sc = M.scale(k, 'maj'); const d = pick([2, 3, 4, 5, 6, 7]); const c = sc[d - 1]; const cp = M.pcOf(c);
    let pool = sc.filter((n, i) => i !== d - 1);
    pool.push(M.spellWith(c[0], (cp + 1) % 12), M.spellWith(c[0], (cp + 11) % 12));
    pool = uniqPc(pool, cp);
    return choice(`<b>${nn(k)} majör</b> gamının <b>${d}.</b> notası hangisi?`, c, pool, nn, `${nn(k)} majör: ${sc.map(nn).join(' – ')}<br><span class="muted">Kalıp: T T Y T T T Y</span>`, 2);
  }
  function t2() {
    const k = pick(KR('t2', ['C', 'G', 'D'], ['F', 'A'], ['Bb', 'Eb', 'E'])); const ch = M.diatonic(k, 'maj'); const d = rnd(7);
    return choice(`<b>${nn(k)}</b> tonunda <b>${ROM[d]}</b> akoru hangisi?`, ch[d], ch.filter((x, i) => i !== d), cn, `${nn(k)} majör akorları: ${chList(ch)}`, 2);
  }
  function t3() {
    const k = pick(KR('t3', ['C', 'G', 'D', 'F'], ['A', 'E', 'Bb'], ['Eb', 'Ab', 'B', 'Db', 'F#'])); const ch = M.diatonic(k, 'maj'); const d = rnd(7);
    return choice(`<b>${nn(k)}</b> tonunda <b>${cn(ch[d])}</b> kaçıncı derece?`, ROM[d], ROM, x => x, `${nn(k)} majör akorları: ${chList(ch)}<br>${ROM.join(' ')}`, 2);
  }
  function t4() {
    const ch = pick(KR('t4', ['C', 'G', 'D', 'A', 'E', 'F'], ['B', 'Bb', 'Eb'], ['F#', 'Ab', 'Db'])) + pick(KR('t4', ['', 'm'], ['', 'm'], ['dim', 'aug']));
    const pcs = M.chordPcs(ch);
    const opts = []; for (let pc = 0; pc < 12; pc++) opts.push({ v: String(pc), html: pcl(pc) });
    return { kind: 'multi', prompt: `<b>${cn(ch)}</b> akorunun notalarını işaretle`, sub: '3 nota seç', n: 3, opts, ans: pcs.map(String), cols: 4,
      why: `${cn(ch)} = ${M.chordSpelled(ch).map(nn).join(' – ')}` };
  }
  const PROGS = [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [1, 4, 0], [0, 3, 4, 3], [0, 2, 3, 4]];
  function t5() {
    const k = pick(KR('t5', ['G', 'D', 'A'], ['F', 'E', 'Bb'], ['Eb', 'Ab', 'B', 'Db'])); const pr = pick(PROGS); const ch = M.diatonic(k, 'maj');
    const rom = pr.map(d => ROM[d]).join(' – ');
    const correct = pr.map(d => ch[d]).join(' – ');
    const pool = [];
    for (let t = 0; t < 3; t++) { const k2 = pick(KA.filter(x => x !== k)); const c2 = M.diatonic(k2, 'maj'); pool.push(pr.map(d => c2[d]).join(' – ')); }
    for (const p2 of PROGS) if (p2.length === pr.length && p2 !== pr) pool.push(p2.map(d => ch[d]).join(' – '));
    pool.push(pr.map(d => ch[(d + 1) % 7]).join(' – '));
    return choice(`<b>${rom}</b> dizilimi <b>${nn(k)}</b> tonunda hangisi?`, correct, pool, seqL, `${nn(k)} majör: ${chList(ch)}`, 1);
  }
  function t6() {
    const k = pick(KR('t6', ['C', 'G', 'D', 'F'], ['A', 'E', 'Bb', 'Eb'], ['B', 'F#', 'Ab', 'Db'])); const sc = M.scale(k, 'maj'); const t = rnd(5);
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
    const a = pick(KR('t7', ['C', 'G', 'D', 'A'], ['E', 'F', 'B'], ['F#', 'Bb', 'Eb', 'Ab']));
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
    const k = pick(KR('t8', ['A', 'E', 'D'], ['B', 'G'], ['C', 'F#', 'F', 'C#'])); const ch = M.diatonic(k, 'min'); const t = rnd(3); const nm = cn(k + 'm');
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
    const k = pick(KR('t11', ['C', 'G', 'D'], ['A', 'E', 'F'], ['Bb', 'Eb', 'B'])); const ch = M.diatonic(k, 'maj'); const t = rnd(2);
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

  // ---- zorluk rampası: ilk sorular kolay tonlarda, sonra genişler ----
  const KR = (id, a, b, c) => { const n = U.tries ? U.tries(id) : 99; return n < 6 ? a : n < 14 ? a.concat(b) : a.concat(b, c || []); };
  const pcIn = p => U.pcInline ? U.pcInline(p) : pcl(p);

  // ---- t0: ses adımları ----
  function t0a() {
    const i = rnd(7); const a = M.LET[i], b = M.LET[(i + 1) % 7]; const half = a === 'E' || a === 'B';
    return choice(`<b>${nn(a)} → ${nn(b)}</b> arası kaç perde?`, half ? '1 perde (yarım ses)' : '2 perde (tam ses)', ['1 perde (yarım ses)', '2 perde (tam ses)'], x => x, `Doğal notalar arasında yalnızca ${nn('E')}–${nn('F')} ve ${nn('B')}–${nn('C')} yarım sestir; diğer komşular tam ses. Piyanoda bu iki yerde siyah tuş yoktur.`, 1);
  }
  function t0b() {
    const r = pick(M.LET); const up = Math.random() < 0.5; const st = pick([1, 2]); const rp = M.pcOf(r); const pc = M.mod(rp + (up ? st : -st), 12);
    const pool = [1, 2, 3, -1, -2].map(d => M.mod(rp + (up ? d : -d), 12)).filter(p => p !== pc);
    return choice(`<b>${nn(r)}</b> notasının ${st === 1 ? 'yarım' : 'tam'} ses ${up ? 'üstü' : 'altı'}?`, pc, pool, p => pcIn(+p), `${nn(r)} ${up ? '+' : '−'} ${st} perde = ${pcIn(pc)}. Gitarda aynı telde ${st} perde ${up ? 'ileri (gövdeye doğru)' : 'geri (başa doğru)'}.`, 2);
  }
  function t0c() {
    const pc = pick([1, 3, 6, 8, 10]); const sh = M.SHARP[pc], fl = M.FLAT[pc]; const askSh = Math.random() < 0.5; const ask = askSh ? sh : fl, ans = askSh ? fl : sh;
    const pool = [1, 3, 6, 8, 10].filter(p => p !== pc).map(p => askSh ? M.FLAT[p] : M.SHARP[p]);
    return choice(`<b>${nn(ask)}</b> ile aynı perdede çalınan nota?`, ans, pool, nn, `${nn(sh)} = ${nn(fl)}: aynı ses, iki ad (eş sesli). Hangi adın yazılacağını ton belirler; ${nn('F')} majörde ${nn('Bb')}, ${nn('B')} majörde ${nn('A#')} yazılır.`, 2);
  }
  const TF0 = [['Mi ile Fa arasında tam ses vardır.', 0, `Yanlış: ${nn('E')}–${nn('F')} yarım sestir (1 perde).`], ['Gitarda bir perde bir yarım sestir.', 1, 'Doğru: her perde sesi yarım ses yükseltir; 12 perde = oktav.'], [`${nn('C#')} ile ${nn('Db')} farklı perdelerde çalınır.`, 0, 'Yanlış: eş seslidirler, aynı perdedir.'], ['Bir oktavda 12 farklı yarım ses vardır.', 1, 'Doğru: 7 doğal nota + 5 diyez/bemol.'], [`${nn('B')} notasının yarım ses üstü ${nn('C')}’dur.`, 1, `Doğru: ${nn('B')}–${nn('C')} doğal yarım sestir.`]];
  function t0t() { const q = pick(TF0); return tf(q[0], q[1], q[2]); }

  // ---- t16: pop şemaları (Open Music Theory, “Four-chord schemas”) ----
  const SCH = [['Doo-wop', [0, 5, 3, 4], 'tam (V → I)'], ['Şarkıcı-söz yazarı', [5, 3, 0, 4], 'plagal (IV → I)'], ['Seksek (hopscotch)', [3, 4, 5, 0], 'atlayarak (vi → I)']];
  const rot = (a, k) => a.slice(k).concat(a.slice(0, k));
  function t16a() {
    const k = pick(KR('t16', ['C', 'G', 'D'], ['A', 'F', 'E'], ['Bb', 'Eb'])); const ch = M.diatonic(k, 'maj'); const sc = pick(SCH); const r = rnd(4); const d = rot(sc[1], r);
    return choice(`<b>${d.map(i => cn(ch[i])).join(' – ')}</b><br>Bu döngü hangi şema?`, sc[0], SCH.map(x => x[0]), x => x,
      `Dört akor aynı (I, IV, V, vi); ayırt eden sıra. Toniğe (${cn(ch[0])}) nasıl gelindiğine bak: ${sc[0]} şemasında ${sc[2]}. Döngü: ${sc[1].map(i => ROM[i]).join('–')}.`, 1);
  }
  function t16b() {
    const sc = pick(SCH); const r = rnd(4); const d = rot(sc[1], r);
    return choice(`<b>${d.map(i => ROM[i]).join(' – ')}</b> döngüsünde toniğe (I) nasıl varılır?`, sc[2], SCH.map(x => x[2]), x => x, `Döngüde I’den hemen önceki akora bak. ${sc[0]}: ${sc[2]}.`, 1);
  }
  function t16c() {
    const m = pick(KR('t16', ['A', 'E'], ['D', 'B'], ['G', 'C'])); const mc = M.diatonic(m, 'min');
    const pr = pick([[[0, 5, 2, 6], 'Şarkıcı-söz yazarı (minörden: i–VI–III–VII)'], [[5, 6, 0, 2], 'Seksek, minör hali (VI–VII–i–III)']]);
    return choice(`<b>${pr[0].map(i => cn(mc[i])).join(' – ')}</b><br>Minör tonik duyuluyorsa bu hangi şemanın minör hali?`, pr[1], ['Şarkıcı-söz yazarı (minörden: i–VI–III–VII)', 'Seksek, minör hali (VI–VII–i–III)', 'Doo-wop (I–vi–IV–V)'], x => x, `Aynı dört akor ilgili minörden okunur: ${pr[0].map(i => M.RMIN[i]).join('–')}.`, 1);
  }
  function t16d() {
    const k = pick(KR('t16', ['C', 'G'], ['D', 'A', 'E'], ['F', 'Bb'])); const ch = M.diatonic(k, 'maj'); const sc = pick(SCH);
    return order(`<b>${nn(k)}</b> tonunda <b>${sc[0]}</b> döngüsünü ${ROM[sc[1][0]]} ile başlayarak diz`, sc[1].map(i => ch[i]), cn, `${sc[0]}: ${sc[1].map(i => ROM[i]).join('–')} = ${sc[1].map(i => cn(ch[i])).join(' – ')}`, 4);
  }

  // ---- t17: modal renkler (Open Music Theory, “Modal schemas”) ----
  const flatDeg = (k, deg, semis) => { const li = M.LET.indexOf(k[0]); return M.spellWith(M.LET[(li + deg) % 7], (M.pcOf(k) + semis) % 12); };
  function t17a() {
    const k = pick(KR('t17', ['D', 'A', 'G'], ['E', 'C'], ['F', 'Bb'])); const b7 = flatDeg(k, 6, 10), b6 = flatDeg(k, 5, 8), b3 = flatDeg(k, 2, 3); const sc = M.scale(k, 'maj');
    const w = pick([['♭VII', b7], ['♭VI', b6], ['♭III', b3]]);
    return choice(`<b>${nn(k)} majör</b> şarkıda <b>${w[0]}</b> akoru hangisi?`, w[1], [sc[6], sc[5], sc[2], b7, b6, b3, sc[4]].filter(x => x !== w[1]), cn, `${w[0]}: tonun ${w[0].slice(1)}. derecesinin yarım ses aşağısı üzerine majör akor. ${nn(k)} → ${cn(w[1])}. Bu akorlar ${nn(k)} minörden (paralel minör) ödünç gelir.`, 2);
  }
  const MSC = [['Çift plagal', ['bVII', 'IV', 'I']], ['Eolyen kadans', ['bVI', 'bVII', 'i']], ['Ağıt (lament)', ['i', 'bVII', 'bVI', 'v']], ['Endülüs kadansı', ['i', 'bVII', 'bVI', 'V']], ['Dorik salınım', ['i', 'IV']]];
  function spellRN(k, minor, rn) {
    const map = { I: [0, 0, ''], i: [0, 0, 'm'], IV: [3, 5, ''], v: [4, 7, 'm'], V: [4, 7, ''], bVII: [6, 10, ''], bVI: [5, 8, ''] };
    const m = map[rn]; return flatDeg(k, m[0], m[1]) + m[2];
  }
  function t17b() {
    const s = pick(MSC); const minor = s[1].includes('i'); const k = minor ? pick(KR('t17', ['A', 'E'], ['D', 'B'], ['G'])) : pick(KR('t17', ['D', 'A', 'G'], ['E', 'C'], ['F']));
    return choice(`<b>${s[1].map(r => cn(spellRN(k, minor, r))).join(' – ')}</b><br>Bu kalıbın adı?`, s[0], MSC.map(x => x[0]), x => x, `${s[0]}: ${s[1].join(' – ').replace(/b/g, '♭')} (${nn(k)} ${minor ? 'minör' : 'majör'}).${s[0] === 'Endülüs kadansı' ? ' Son akor majör V; Hicaz’ın gitardaki karşılığına çok yakın.' : ''}`, 1);
  }
  const TF17 = [['♭VII akoru majör tonun kendi notalarıyla kurulabilir.', 0, 'Yanlış: ♭VII’nin kökü tonun dışındadır (Re majörde Do). Paralel minörden ödünç gelir.'], ['Am – G – F – E dizisi Endülüs kadansıdır.', 1, 'Doğru: i–♭VII–♭VI–V. Flamenko ve Hicaz rengi.'], ['Eolyen kadans ♭VI – ♭VII – i şeklindedir.', 1, 'Doğru: dominant yerine ♭VII ile toniğe gelinir; rock ve Türkçe pop’ta çok yaygın.'], ['Dorik salınımda IV akoru minördür.', 0, 'Yanlış: dorikte 6. derece yükselir, IV majör olur (Am – D).']];
  function t17t() { const q = pick(TF17); return tf(q[0], q[1], q[2]); }

  // ---- karışık tekrar (aralıklı tekrar ve harmanlama) ----
  const mixU = (...fs) => () => pick(fs)();
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

  // ---- ders şablonu: neden → anlatım → çözümlü örnek → kendini dene → gitarda → özet → kaynak ----
  const HU = 'https://musictheory.pugetsound.edu/mt21c/', OMT = 'https://viva.pressbooks.pub/openmusictheory/chapter/';
  const SRC = {
    hw: ['Hutchinson · Yarım ve tam ses', HU + 'HalfStepsAndWholeSteps.html'], enh: ['Hutchinson · Eş sesli notalar', HU + 'EnharmonicNotes.html'],
    maj: ['Hutchinson · Majör gam', HU + 'TheMajorScale.html'], deg: ['Hutchinson · Derece adları', HU + 'ScaleDegreeNames.html'],
    ks: ['Hutchinson · Majör ton imzaları', HU + 'MajorKeySignatures.html'], cof: ['Hutchinson · Beşliler çemberi dizisi', HU + 'CircleOfFifths.html'],
    iv: ['Hutchinson · Aralıkları tanıma', HU + 'HowToIdentifyIntervals.html'], iva: ['Hutchinson · Artık ve eksik aralıklar', HU + 'AugmentedAndDiminishedIntervals.html'],
    tri: ['Hutchinson · Üçlü akorlar', HU + 'TriadsIntroduction.html'], lead: ['Hutchinson · Akor sembolleri', HU + 'LeadSheetSymbols.html'], inv: ['Hutchinson · Çevrimler', HU + 'InvertedTriads.html'],
    dmaj: ['Hutchinson · Majörde diatonik akorlar', HU + 'DiatonicChordsInMajor.html'], dmin: ['Hutchinson · Minörde diatonik akorlar', HU + 'DiatonicChordsInMinor.html'],
    min: ['Hutchinson · Minör gamlar', HU + 'MinorScales.html'], cad: ['Hutchinson · Kadanslar', HU + 'cadences.html'], fn: ['Hutchinson · Armonik fonksiyon', HU + 'HarmonicFunction.html'],
    s7: ['Hutchinson · Yedili akorlar', HU + 'SeventhChordsIntroduction.html'], s7r: ['Hutchinson · Diatonik yedililer', HU + 'RomanNumeralsOfDiatonicSeventhChords.html'],
    sus: ['Hutchinson · sus akorlar', HU + 'SimpleSusChords.html'], sec: ['Hutchinson · İkincil dominantlar', HU + 'SecondaryDominants.html'], mix: ['Hutchinson · Ödünç akorlar', HU + 'ModeMixtureSection.html'],
    b7: ['Hutchinson · Pop’ta ♭VII', HU + 'SubtonicVIIinPopMusic.html'], aeo: ['Hutchinson · i–VII–VI–VII', HU + 'i-VII-VI-VII.html'],
    pop: ['Open Music Theory · Pop şemalarına giriş', OMT + 'intro-to-pop-schemas/'], four: ['Open Music Theory · Dört akorlu şemalar', OMT + '4-chord-schemas/'], modal: ['Open Music Theory · Modal şemalar', OMT + 'modal-schemas/']
  };
  const LS = (o, body) => `<div class="lwhy"><b>Neden?</b> ${o.why}</div>${body}` +
    (o.tr ? `<h3 class="lh">Kendini dene <span class="muted">· cevabı görmek için dokun</span></h3>${o.tr.map(([q, a]) => `<details class="try"><summary>${q}</summary><div>${a}</div></details>`).join('')}` : '') +
    (o.gtr ? `<div class="ex gtr"><b>Gitarda</b><br>${o.gtr}</div>` : '') +
    `<div class="sumbox"><b>Akılda kalsın</b><ul>${o.sum.map(x => `<li>${x}</li>`).join('')}</ul></div>` +
    (o.src ? `<p class="src">Daha fazlası (İngilizce, açık lisanslı): ${o.src.map(k => `<a href="${SRC[k][1]}" target="_blank" rel="noopener">${SRC[k][0]}</a>`).join(' · ')}</p>` : '');

  L.t0 = `<p>Müzikte en küçük adım <b>yarım ses</b>tir (Y). Gitarda bu tam olarak <b>1 perde</b>. İki yarım ses bir <b>tam ses</b> (T) eder: 2 perde.</p><p>Yedi doğal nota (${['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(N).join(' ')}) arasındaki mesafeler eşit değildir. Yalnızca <b>${N('E')}–${N('F')}</b> ve <b>${N('B')}–${N('C')}</b> arası yarım sestir; diğer komşular arasında tam ses vardır ve aradaki perdeye diyezli/bemollü bir ad verilir.</p><p class="kal">${N('C')} T ${N('D')} T ${N('E')} Y ${N('F')} T ${N('G')} T ${N('A')} T ${N('B')} Y ${N('C')}</p><p><b>Diyez (♯)</b> yarım ses yükseltir, <b>bemol (♭)</b> yarım ses alçaltır. ${N('C#')} ile ${N('Db')} aynı perdedir: bunlara <b>eş sesli</b> (enharmonik) denir. Hangi adın kullanılacağına ton karar verir; bunu gamlarda göreceksin.</p><div class="ex"><b>Çözümlü örnek:</b> ${N('A')} notasının tam ses üstü?<br>${N('A')} → (${N('A#')}) → ${N('B')}: iki perde. Cevap ${N('B')}.<br><b>Tuzak:</b> ${N('E')} notasının tam ses üstü ${N('F')} değil, ${N('F#')}’dir; çünkü ${N('E')}–${N('F')} zaten yarım ses.</div>`;
  const LX = {
    t0: { why: 'Gam, aralık ve akorların hepsi bu iki adımla ölçülür. Gitarda sayması en kolay şey perde olduğu için önce bunu otomatikleştiriyoruz.', tr: [[`${N('B')} notasının yarım ses üstü?`, `${N('C')} (doğal yarım ses).`], [`${N('F#')} başka nasıl yazılır?`, `${N('Gb')}.`], [`${N('D')}’den 2 tam ses yukarı?`, `${N('D')} → ${N('E')} → ${N('F#')}.`]], gtr: 'Herhangi bir telde 1 perde = yarım ses, 2 perde = tam ses. 6. telde boş (Mi) → 1. perde Fa: arada perde yok, çünkü Mi–Fa yarım ses.', sum: ['1 perde = yarım ses, 2 perde = tam ses.', 'Mi–Fa ve Si–Do doğal yarım seslerdir.', 'Eş sesli: aynı perde, iki ad (Do♯ = Re♭).'], src: ['hw', 'enh'] },
    t1: { why: 'Ton, derece ve akor kavramlarının hepsi majör gama dayanır. “Bu şarkı Sol majör” dediğinde aslında bu yedi notayı kastedersin.', tr: [[`${N('D')} majör gamı?`, M.scale('D', 'maj').map(N).join(' ')], [`${N('Bb')} majörün 4. notası?`, `${N('Eb')} (${M.scale('Bb', 'maj').map(N).join(' ')}).`], ['Majör gamda yarım sesler kaçıncı notalar arasında?', '3–4 ve 7–8 (Y’ler).']], sum: ['Kalıp: T T Y T T T Y.', 'Her harf bir kez kullanılır; bu yüzden diyez veya bemol seçilir, ikisi karışmaz.', 'Gamın notalarına derece denir; 1. derece toniktir (ev).'], src: ['maj', 'deg'] },
    t6: { why: 'Bir şarkının akor listesine bakıp tonunu tahmin etmek ve tonlar arası yakınlığı (hangi tona kolay modülasyon olur) görmek için.', tr: [['3 diyezli majör ton?', `${N('A')} majör (${['F#', 'C#', 'G#'].map(N).join(' ')}).`], [`${N('Eb')} majörde kaç bemol var?`, `3 (${['Bb', 'Eb', 'Ab'].map(N).join(' ')}).`], [`${N('G')} majörün ilgili minörü?`, Cn('Em')]], sum: ['Çemberde saat yönü = tam 5’li yukarı = +1 diyez.', 'Diyez sırası Fa Do Sol Re La Mi Si; bemol sırası tersidir.', 'Komşu tonlar (IV ve V) ve ilgili minör en yakın tonlardır.'], src: ['ks', 'cof'] },
    t7: { why: 'Akorlar aralıklardan yapılır. Ayrıca kulaktan şarkı çıkarırken “bu nota ondan ne kadar yukarıda?” sorusu bir aralık sorusudur.', tr: [[`${N('D')}–${N('F')} hangi aralık?`, 'Küçük 3’lü (3 harf, 3 yarım ses).'], [`${N('E')}–${N('B')}?`, 'Tam 5’li (5 harf, 7 yarım ses).'], ['Gitarda aynı perde, bir ince tel?', 'Tam 4’lü (Sol–Si teli hariç: orada büyük 3’lü).']], sum: ['Sayı harflerden, nitelik yarım seslerden gelir.', 'Tam aralıklar: 4’lü, 5’li, oktav. Diğerleri büyük/küçük.', 'Sap üzerinde aralık = şekil; şekilleri ezberle.'], src: ['iv', 'iva'] },
    t4: { why: 'Akor şemalarını ezberlemek yerine akorun hangi notalardan oluştuğunu bilirsen her pozisyonda ve her tonda akoru kendin bulursun.', tr: [[`${Cn('E')} akorunun notaları?`, M.chordSpelled('E').map(N).join(' ')], [`${Cn('Fm')}?`, M.chordSpelled('Fm').map(N).join(' ')], ['Majör ile minör akor arasındaki tek fark?', '3’lü: majörde büyük (4 yarım ses), minörde küçük (3).']], gtr: `${Cn('Am')} (x02210) tellerin sesleri: ${['A', 'E', 'A', 'C', 'E'].map(N).join(' ')}. Sadece üç farklı nota, tekrar ediliyor.`, sum: ['Akor = kök + 3’lü + 5’li (birer harf atlayarak).', 'Majör 4+3, minör 3+4 yarım ses.', 'Eksik (°): küçük 3’lü + eksik 5’li; artık (+): büyük 3’lü + artık 5’li.'], src: ['tri', 'lead'] },
    t13: { why: 'Arpejde veya bir parçada notaları görünce akoru tanımak, armoniyi okumanın ilk adımıdır.', tr: [[`${['G', 'E', 'B'].map(N).join(' · ')} hangi akor?`, `${Cn('Em')} (${['E', 'G', 'B'].map(N).join(' ')}).`], [`${['F', 'A', 'D'].map(N).join(' · ')}?`, `${Cn('Dm')}.`]], sum: ['Notaları üçlülere diz; en alttaki kök olur.', 'Kök–3’lü mesafesi türü söyler.', 'Basta kök yoksa akor çevrimdir (slash akor).'], src: ['tri', 'inv'] },
    t2: { why: 'Pop şarkılarının çoğu tek tonun 6 akorundan oluşur. Hangi 6 akorun “aile” olduğunu bilirsen şarkının devamını tahmin edersin.', tr: [[`${N('D')} tonunun 6 akoru?`, M.diatonic('D', 'maj').slice(0, 6).map(Cn).join(' ')], [`${N('A')} tonunda IV?`, Cn('D')], [`${N('F')} tonunda vi?`, Cn('Dm')]], sum: ['Kalıp: I ii iii IV V vi vii°.', 'I, IV, V majör; ii, iii, vi minör.', 'Kalıbı dışında kalan akor “renk akoru”dur (sonraki seviyeler).'], src: ['dmaj'] },
    t3: { why: 'Şarkıları roma rakamıyla düşünmek, her tona aktarabilmenin ve kulaktan çıkarabilmenin anahtarı.', tr: [[`${N('G')} tonunda ${Cn('Em')}?`, 'vi'], [`${N('E')} tonunda ${Cn('A')}?`, 'IV'], [`${N('C')} tonunda ${Cn('D')} majör çıkar mı?`, 'Hayır: ii minördür (Dm). D majör ikincil dominanttır (V/V).']], sum: ['Akorun kökü gamın kaçıncı notasıysa o derecedir.', 'Tür dereceyle uyuşmalı.', 'Uyuşmuyorsa: ödünç, ikincil dominant ya da yanlış ton.'], src: ['dmaj'] },
    t8: { why: 'Türkçe pop ve slow şarkıların büyük kısmı minör. Ayrıca minör, Nihavent ve Hicaz’ın gitardaki karşılıklarına köprü.', tr: [[`${Cn('Em')} tonunda iv?`, Cn('Am')], [`${Cn('Am')} tonunda armonik minörün V’i?`, Cn('E')], [`${Cn('Dm')} ile hangi majör aynı notaları kullanır?`, `${N('F')} majör.`]], sum: ['Doğal minör: T Y T T Y T T.', 'Akorlar: i ii° III iv v VI VII.', 'Armonik minör 7. notayı yükseltir → V majör olur.'], src: ['min', 'dmin'] },
    t10: { why: 'Akorların görevini bilirsen ezber yerine mantıkla dinlersin: “şimdi gerilim geldi, eve dönecek” diye önceden sezersin.', tr: [['ii ile IV aynı göreve mi sahip?', 'Evet: ikisi de subdominant (pre-dominant).'], ['Şarkı V’te bitip soru gibi kalırsa?', 'Yarım kadans.'], ['V–vi?', 'Aldatmalı kadans.']], sum: ['T → S → D → T döngüsü armoninin iskeleti.', 'Tam kadans V–I, plagal IV–I, yarım …–V, aldatmalı V–vi.', 'vi ve iii toniğin yerine geçebilir.'], src: ['fn', 'cad'] },
    t11: { why: 'Akor dizilimlerini kalıp olarak tanıyınca şarkıyı akor akor değil, kalıp kalıp hatırlarsın.', tr: [[`${N('G')} tonunda I–V–vi–IV?`, ['G', 'D', 'Em', 'C'].map(Cn).join(' – ')], [`${N('C')} tonunda ${Cn('Bb')} tonun içinde mi?`, 'Hayır: ♭VII, ödünç akor.']], sum: ['Dizilimi roma rakamıyla ezberle, tonla değil.', 'Ton dışı akor: kökü gamda değil ya da türü dereceye uymuyor.'], src: ['pop', 'four'] },
    t16: { why: 'Pop’un dört akoru (I, IV, V, vi) aynı ama sıraları farklı duygular verir. Şemayı kulakla tanımak, şarkıyı ilk dinleyişte çözmeni sağlar.', tr: [[`${['C', 'Am', 'F', 'G'].map(Cn).join(' – ')}?`, 'Doo-wop (I–vi–IV–V): toniğe V’ten, tam kadansla gelinir.'], [`${['Am', 'F', 'C', 'G'].map(Cn).join(' – ')}?`, 'Şarkıcı-söz yazarı (vi–IV–I–V): toniğe IV’ten, plagal gelinir.'], [`${['F', 'G', 'Am', 'C'].map(Cn).join(' – ')}?`, 'Seksek (IV–V–vi–I): toniğe vi’dan atlayarak gelinir.']], gtr: `Arpejde dört akoru döngüye sok; döngünün neresinden başlarsan başla, şema aynıdır. Toniğe hangi akordan geldiğini dinle: V’ten mi, IV’ten mi, vi’dan mı?`, sum: ['Üç şema: Doo-wop I–vi–IV–V, Şarkıcı-söz yazarı vi–IV–I–V, Seksek IV–V–vi–I.', 'Döngü nereden başlarsa başlasın, ayırt eden toniğe varış şekli.', 'Minör tonik duyuluyorsa aynı akorlar ilgili minörden okunur.'], src: ['pop', 'four'] },
    t5: { why: 'Canlı müzikte solistin sesine göre tonu anında değiştirmek gerekir. Roma rakamıyla düşünen gitarcı bunu kâğıtsız yapar.', tr: [[`${['C', 'G', 'Am', 'F'].map(Cn).join(' – ')} → ${N('D')}?`, ['D', 'A', 'Bm', 'G'].map(Cn).join(' – ')], [`${['Am', 'Dm', 'E'].map(Cn).join(' – ')} → 2 yarım ses yukarı?`, ['Bm', 'Em', 'F#'].map(Cn).join(' – ')]], sum: ['Önce dizilimi roma rakamına çevir, sonra yeni tonda oku.', 'Kısayol: her akoru aynı aralıkla kaydır.'], src: ['dmaj'] },
    t14: { why: 'Açık akor şekilleriyle her tonda çalmanın en pratik yolu kapo. Arpejde açık tellerin tınısını korur.', tr: [[`Kapo 3, ${Cn('Em')} şekli?`, Cn('Gm')], [`Şarkı ${Cn('B')}, ${Cn('G')} şekilleriyle çalmak için kapo?`, '4. perde.']], sum: ['Gerçek akor = şekil + kapo perdesi (yarım ses).', 'Gereken kapo = şekilden hedefe yarım ses sayısı.'] },
    t9: { why: 'Slow pop ve baladların “yumuşak” rengi çoğunlukla yedili akorlardan gelir (maj7, m7).', tr: [[`${Cn('Dmaj7')} notaları?`, M.chordSpelled('Dmaj7').map(N).join(' ')], [`${N('G')} tonunda V7?`, Cn('D7')], ['m7 ile 7 farkı?', 'm7 minör üçlü + küçük 7’li; 7 majör üçlü + küçük 7’li (dominant).']], sum: ['maj7 = majör + büyük 7’li; m7 = minör + küçük 7’li; 7 = majör + küçük 7’li.', 'Majör tonda: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.', 'ii7–V7–Imaj7 baladların omurgası.'], src: ['s7', 's7r'] },
    t15: { why: 'sus, add ve slash akorlar arpejle eşliğe hareket katar; özellikle inen bas hatları slow pop’un imzasıdır.', tr: [[`${Cn('Asus4')} notaları?`, M.chordSpelled('Asus4').map(N).join(' ')], [`${Cn('C/E')} basta hangi nota?`, N('E')]], gtr: `Arpejde bas parmağının (p) çaldığı notayı değiştirmek slash akoru yaratır: ${['C', 'G/B', 'Am', 'Am/G'].map(Cn).join(' – ')}. Sol el neredeyse hiç hareket etmez.`, sum: ['sus: 3’lü yok, yerine 2’li veya 4’lü; genelde çözülür.', 'add9: 3’lü kalır, 9’lu eklenir.', 'Slash: akor/bas; bas hattını yürütür.'], src: ['sus', 'inv'] },
    t12: { why: 'Bir şarkıda “tonun dışında” duyduğun akorların çoğu bu iki aileden gelir. Bunları tanımak kulaktan çıkarmayı hızlandırır.', tr: [[`${N('C')} tonunda V/vi?`, `${Cn('E7')} (→ ${Cn('Am')}).`], [`${N('G')} tonunda iv?`, Cn('Cm')], [`${N('D')} tonunda V/V?`, `${Cn('E7')} (→ ${Cn('A')}).`]], sum: ['İkincil dominant: hedef akorun V’i; hedefe çözülür.', 'Ödünç akor: paralel minörden (iv, ♭VI, ♭VII, ♭III).'], src: ['sec', 'mix'] },
    t17: { why: 'Rock, Türkçe pop ve flamenko renklerinin çoğu majör/minörün dışındaki modal akorlardan gelir. Endülüs kadansı Hicaz’la akrabadır.', tr: [[`${N('A')} majörde ♭VII?`, Cn('G')], [`${['Am', 'G', 'F', 'E'].map(Cn).join(' – ')}?`, 'Endülüs kadansı (i–♭VII–♭VI–V).'], [`${['F', 'G', 'Am'].map(Cn).join(' – ')}?`, 'Eolyen kadans (♭VI–♭VII–i).']], gtr: `${['Am', 'G', 'F', 'E'].map(Cn).join(' – ')}’yi arpejle çal; son akorda ${N('G#')} sesi Hicaz rengini verir. Sonra aynı dizinin sonunu ${Cn('Em')} ile bitir (ağıt kalıbı) ve farkı dinle.`, sum: ['♭VII, ♭VI, ♭III: kökü tonun dışında olan modal akorlar.', 'Çift plagal ♭VII–IV–I; eolyen kadans ♭VI–♭VII–i.', 'Ağıt i–♭VII–♭VI–v; son akor majörse Endülüs kadansı.'], src: ['modal', 'b7', 'aeo'] }
  };
  L.t16 = `<p>I, IV, V ve vi akorlarını farklı sıralarla döngüye sokan üç kalıp, pop’un büyük kısmını oluşturur. Akademik pop analizinde bunlara <b>şema</b> denir:</p><table class="t"><tr><th>Şema</th><th>Döngü</th><th>${N('C')} tonunda</th><th>Toniğe varış</th></tr>${SCH.map(sc => `<tr><td>${sc[0]}</td><td>${sc[1].map(i => ROM[i]).join('–')}</td><td>${sc[1].map(i => Cn(M.diatonic('C', 'maj')[i])).join(' ')}</td><td>${sc[2]}</td></tr>`).join('')}</table><p><b>Döngü önemli:</b> şema her akordan başlayabilir. ${['C', 'G', 'Am', 'F'].map(Cn).join(' – ')} (I–V–vi–IV) ile ${['Am', 'F', 'C', 'G'].map(Cn).join(' – ')} aynı şemadır (şarkıcı-söz yazarı); sadece başka yerden başlar. Bu yüzden başlangıç akoruna değil, <b>toniğe nasıl gelindiğine</b> bak.</p><p><b>Minör hali:</b> aynı akorlar minör tonik etrafında da duyulabilir. ${['Am', 'F', 'C', 'G'].map(Cn).join(' – ')} ${N('A')} minör hissettiriyorsa i–VI–III–VII diye okunur. Türkçe slow pop’ta bu çok sık.</p>`;
  L.t17 = `<p>Bazı pop ve rock akorları tonun gamında yoktur; paralel minörden veya başka bir moddan gelir. En yaygını <b>♭VII</b>: ${N('D')} majörde ${Cn('C')}, ${N('A')} majörde ${Cn('G')}. Sembolündeki ♭, vii°’den ayırmak içindir.</p><table class="t"><tr><th>Kalıp</th><th>Dereceler</th><th>Örnek</th></tr>${MSC.map(m => { const minor = m[1].includes('i'); const k = minor ? 'A' : 'D'; return `<tr><td>${m[0]}</td><td>${m[1].join('–').replace(/b/g, '♭')}</td><td>${m[1].map(r => Cn(spellRN(k, minor, r))).join(' ')}</td></tr>`; }).join('')}</table><p><b>Endülüs kadansı</b> (${['Am', 'G', 'F', 'E'].map(Cn).join(' ')}), ağıt kalıbının son akoru majör yapılmış halidir. Son akordaki ${N('G#')}, ${N('A')} kararlı Hicaz’daki artık 2’liyi (${N('F')}–${N('G#')}) çağrıştırır; Makam bölümündeki Hicaz ile karşılaştır.</p>`;
  Object.keys(LX).forEach(k => { L[k] = LS(LX[k], L[k] || ''); });

  // karışık tekrar seviyeleri
  const R1 = mixU(t0a, t0b, t0c, t1, t1o, t6, t6k, t7, t7f);
  const R2 = mixU(t4, t13, t2, t3, t2t, t8, t8t, t10, t10t, t7);
  const R3 = mixU(t1, t7f, t13, t3, t8, t10t, t11, t16a, t5, t14, t9, t15, t12, t17a, t17b);
  const RL = n => `<div class="lwhy"><b>Neden karışık tekrar?</b> Konuları tek tek çalışırken her şey kolay görünür; asıl öğrenme, farklı soru türleri karışık geldiğinde “bu hangi konu?” diye ayırt ederken olur. Ayrıca bir süre sonra geri dönüp hatırlamak, bilgiyi kalıcı hale getirir.</div><p>Bu seviye, önceki ${n} konudan karışık sorular sorar. Yanlış yaptığın soru birkaç soru sonra tekrar gelir.</p><div class="sumbox"><b>İpucu</b><ul><li>Cevabı seçmeden önce kafanda kur (gamı, akoru, dereceyi).</li><li>Takıldığın konuya geri dön: seviye listesinde “Konu” düğmesi.</li></ul></div>`;
  L.r1 = RL('ses adımları, gam, ton imzası ve aralık'); L.r2 = RL('akor kurma, derece, minör ve fonksiyon'); L.r3 = RL('tüm');

  const lv = [
    ['t0', 'Yarım ses, tam ses', 'Perde = yarım ses; doğal notalar ve eş sesliler', mix([0.3, t0t], [0.6, t0a], [0.8, t0b], [1, t0c])],
    ['t1', 'Majör gam ve dereceler', 'Gamın notaları, sıralama ve dereceler', mix([0.35, t1o], [1, t1])],
    ['t6', 'Ton imzası ve beşliler çemberi', 'Diyez/bemol sırası, tonu bulma, komşu ve ilgili tonlar', mix([0.2, t6o], [0.25, t6k], [1, t6])],
    ['t7', 'Aralıklar', 'Aralığın adı; nota adlarından ve sap üzerinden', mix([0.4, t7f], [1, t7])],
    ['t4', 'Akor kur', 'Majör, minör, eksik, artık akorun notaları', mix([0.3, t4o], [1, t4]), 12],
    ['t13', 'Notalardan akor adı', 'Karışık notaları diz, akoru adlandır', t13],
    ['r1', 'Karışık tekrar 1', 'Ses adımları, gam, ton, aralık', R1],
    ['t2', 'Derece → akor', '“Do tonunda vi?” ve hangi akor tonun içinde', mix([0.25, t2t], [1, t2])],
    ['t3', 'Akor → derece', '“Sol tonunda Mi minör kaçıncı derece?”', t3],
    ['t8', 'Minör tonlar', 'Doğal ve armonik minörde akorlar ve dereceler', mix([0.25, t8t], [1, t8])],
    ['t10', 'Fonksiyonlar ve kadanslar', 'Tonik, subdominant, dominant ve kadans türleri', mix([0.35, t10t], [1, t10])],
    ['r2', 'Karışık tekrar 2', 'Akor, derece, minör, fonksiyon', R2],
    ['t11', 'Dizilim kalıpları', 'Sırala, eksik akoru tamamla, ton dışı akoru bul', mix([0.3, t11o], [1, t11])],
    ['t16', 'Pop şemaları', 'Doo-wop, şarkıcı-söz yazarı, seksek: dört akorun üç sırası', mix([0.35, t16a], [0.6, t16b], [0.8, t16d], [1, t16c])],
    ['t5', 'Transpoze', 'Dizilimleri başka tonlara taşı', t5],
    ['t14', 'Kapo hesabı', 'Kapoyla gerçek tonu ve gereken kapo perdesini bul', t14],
    ['t9', 'Yedili akorlar', 'maj7, m7, 7 ve ii7–V7–Imaj7', t9],
    ['t15', 'sus, add ve slash akorlar', 'Dsus4, Cadd9, G/B ve inen bas hatları', t15],
    ['t12', 'İkincil dominant ve ödünç akor', 'V/vi gibi geçici dominantlar, ♭VII ve iv', t12],
    ['t17', 'Modal renkler', '♭VII, eolyen ve Endülüs kadansı, ağıt kalıbı', mix([0.4, t17a], [0.8, t17b], [1, t17t])],
    ['r3', 'Genel tekrar', 'Tüm konulardan karışık', R3, 20]
  ];
  G_SRC = SRC;
  return lv.map(a => ({ id: a[0], name: a[1], desc: a[2], gen: a[3], count: a[4], lesson: L[a[0]] }));
};
})(window);
