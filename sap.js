(function () {
'use strict';
const G = window.G, S = G.S;
const pick = M.pick;
const pcAt = (s, f) => (M.OPEN[s] + f) % 12;

// Sap çizimi: o.frets, o.dot [tel, perde], o.dots [{s,f,cls,t}], o.hs vurgulu tel
G.board = function (o) {
  o = o || {};
  const FR = o.frets || 12, X0 = 40, FW = 44, Y0 = 18, SY = 22;
  const W = X0 + FR * FW + 10, H = Y0 + 5 * SY + 34;
  const ys = s => Y0 + (5 - s) * SY;
  let h = `<svg class="fbd" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="gitar sapı">`;
  h += `<rect x="${X0}" y="${Y0 - 8}" width="${FR * FW}" height="${5 * SY + 16}" rx="4" class="wood"/>`;
  [3, 5, 7, 9, 15].filter(f => f <= FR).forEach(f => { h += `<circle cx="${X0 + (f - 0.5) * FW}" cy="${Y0 + 2.5 * SY}" r="5" class="mk"/>`; });
  if (FR >= 12) h += `<circle cx="${X0 + 11.5 * FW}" cy="${Y0 + 1.5 * SY}" r="5" class="mk"/><circle cx="${X0 + 11.5 * FW}" cy="${Y0 + 3.5 * SY}" r="5" class="mk"/>`;
  for (let f = 0; f <= FR; f++) h += `<line x1="${X0 + f * FW}" x2="${X0 + f * FW}" y1="${Y0 - 8}" y2="${Y0 + 5 * SY + 8}" class="${f === 0 ? 'nut' : 'fr'}"/>`;
  for (let s = 0; s < 6; s++) {
    const hot = o.hs === s;
    h += `<line x1="${X0}" x2="${X0 + FR * FW}" y1="${ys(s)}" y2="${ys(s)}" class="${hot ? 'sl hs' : 'sl'}" style="stroke-width:${hot ? 3.2 : 0.9 + (5 - s) * 0.32}"/>`;
    h += `<text x="6" y="${ys(s) + 4}" class="tn">${6 - s}</text>`;
  }
  for (let f = 1; f <= FR; f++) h += `<text x="${X0 + (f - 0.5) * FW}" y="${H - 6}" text-anchor="middle" class="fnum">${f}</text>`;
  const cx = f => f === 0 ? X0 - 16 : X0 + (f - 0.5) * FW;
  (o.dots || []).forEach(d => {
    h += `<circle cx="${cx(d.f)}" cy="${ys(d.s)}" r="10" class="bd ${d.cls || ''}"/>`;
    if (d.t) h += `<text x="${cx(d.f)}" y="${ys(d.s) + 3.5}" text-anchor="middle" class="bdt ${d.cls || ''}">${d.t}</text>`;
  });
  if (o.dot) h += `<circle cx="${cx(o.dot[1])}" cy="${ys(o.dot[0])}" r="11" class="dotq"/>`;
  return h + '</svg>';
};
const board = o => `<div class="fbwrap">${G.board(o)}</div>`;

function nameQ(s, f, key, L) {
  const pc = pcAt(s, f);
  const pcs = L.acc ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : M.NAT;
  const openN = M.SHARP[M.OPEN[s] % 12];
  return { kind: 'choice', key, prompt: `${6 - s}. tel · ${f === 0 ? 'açık tel' : f + '. perde'}`, sub: 'Bu hangi nota?', visual: board({ dot: [s, f] }), cols: L.acc ? 4 : 4,
    opts: pcs.map(p => ({ v: String(p), html: G.pcl(p) })), ans: [String(pc)], limit: L.mode === 'timed' ? 3000 : 0,
    why: `${6 - s}. tel ${f === 0 ? 'açık' : f + '. perde'} = <b>${G.pcInline(pc)}</b><br><span class="muted">Açık tel ${G.nn(openN)} + ${f} yarım ses${f === 12 ? ' (12. perde açık telin oktavı)' : f === 5 && s !== 3 ? ' (5. perde = bir ince telin açık sesi)' : ''}.</span>` };
}
function fretQ(s, f, key) {
  const pc = pcAt(s, f); const fr = [];
  for (let x = 0; x <= 12; x++) if (pcAt(s, x) === pc) fr.push(String(x));
  return { kind: 'choice', key, prompt: `${6 - s}. telde <b>${G.pcInline(pc)}</b> nerede?`, sub: 'Perde numarasını seç', visual: board({ hs: s }), cols: 5,
    opts: Array.from({ length: 13 }, (_, x) => ({ v: String(x), html: x === 0 ? 'açık' : String(x) })), ans: fr,
    why: `${6 - s}. telde ${G.pcInline(pc)}: ${fr.map(x => x === '0' ? 'açık tel' : x + '. perde').join(', ')}` };
}
function gridQ(pc) {
  const ans = [];
  for (let s = 0; s < 6; s++) for (let f = 0; f <= 12; f++) if (pcAt(s, f) === pc) ans.push(s + ':' + f);
  return { kind: 'grid', key: 'n:' + pc, prompt: `Sapta tüm <b>${G.pcInline(pc)}</b> notalarını işaretle`, sub: `${ans.length} konum · satır 1 = ince Mi teli`, ans, why: '' };
}
function poolStr(strs, nat) { const r = []; strs.forEach(s => { for (let f = 0; f <= 12; f++) if (!nat || M.NAT.includes(pcAt(s, f))) r.push(s + ':' + f); }); return r; }
let lastKey = null;
function fretGen(L) {
  const k = G.srsPick(L.keys(), lastKey); lastKey = k;
  if (L.mode === 'all') return gridQ(+k.slice(2));
  const p = k.split(':').map(Number);
  return L.mode !== 'timed' && Math.random() < 0.4 ? fretQ(p[0], p[1], k) : nameQ(p[0], p[1], k, L);
}

const NATS = s => { const r = []; for (let f = 0; f <= 12; f++) if (M.NAT.includes(pcAt(s, f))) r.push(f + ' ' + M.TRN[M.SHARP[pcAt(s, f)]]); return r.join(' · '); };
const SN = ['6. tel (kalın Mi)', '5. tel (La)', '4. tel (Re)', '3. tel (Sol)', '2. tel (Si)', '1. tel (ince Mi)'];
const TIPS = [
  'Bu tel <b>Mi şekli barre</b> akorlarının kök telidir; barre akorların adı buradan okunur. Mi–Fa ve Si–Do arası yarım ses (1 perde), diğer doğal notalar arası tam ses (2 perde).',
  'Bu tel <b>La şekli barre</b> akorlarının kök telidir. Kısayol: 6. telin 5. perdesi açık La’ya eşittir; 6. teldeki her nota bu telde 5 perde geridedir.',
  '<b>Oktav şekli:</b> 6. teldeki bir notanın 2 tel ince, 2 perde ilerisi aynı notadır (6. tel 3. perde Sol = 4. tel 5. perde Sol).',
  '<b>Oktav şekli:</b> 5. teldeki notanın 2 tel ince, 2 perde ilerisi (5. tel 3. perde Do = 3. tel 5. perde Do).',
  'Dikkat: Sol–Si telleri arası 4 perde (diğerleri 5). <b>Oktav şekli</b> 4. telden: 2 tel ince, 3 perde ileri (4. tel 2. perde Mi = 2. tel 5. perde Mi).',
  'Kalın Mi teliyle aynı notalar, iki oktav yukarı. 6. teldeki notalar burada da geçerli.'
];
const FLV = [];
[0, 1, 2, 3, 4, 5].forEach(s => FLV.push({ id: 'f' + (s + 1), name: SN[s] + ' · doğal notalar', desc: '0–12. perde, sadece doğal notalar', keys: () => poolStr([s], true),
  lesson: `<p><b>${SN[s]}</b> üzerindeki doğal notalar:</p><p class="kal">${NATS(s)}</p><p>${TIPS[s]}</p><p>12. perde açık telin oktavıdır; sonrası baştan tekrar eder (13 = 1 gibi). Önce çapa noktalarını ezberle: açık tel, 5, 7 ve 12. perde.</p>` }));
const ALL6 = [0, 1, 2, 3, 4, 5];
FLV.push({ id: 'f7', name: 'Tüm teller · doğal notalar', desc: 'Altı telin hepsi karışık', keys: () => poolStr(ALL6, true), lesson: '<p>Altı tel karışık. Hesaplarken en yakın çapa noktasını kullan: açık teller, 5, 7 ve 12. perde. Her yanlış, aralıklı tekrar ile sana geri döner.</p>' });
FLV.push({ id: 'f8', name: 'Diyez/bemol dahil · tüm sap', desc: 'Her tel, her perde, ♯ ve ♭ dahil', acc: true, keys: () => poolStr(ALL6, false), lesson: '<p>Diyez (♯) bir perde ileri, bemol (♭) bir perde geri. Aynı perde iki isim alır: Fa♯ = Sol♭. Hangisinin yazılacağı tona bağlıdır (Re majörde Fa♯, Fa majörde Si♭). Seçeneklerde iki isim birlikte gösterilir.</p>' });
FLV.push({ id: 'f9', name: 'Notanın tüm yerleri · doğal', desc: 'Bir notanın sapta bütün konumlarını işaretle', mode: 'all', count: 6, keys: () => M.NAT.map(p => 'n:' + p),
  lesson: '<p>Bir notanın 0–12 arası her telde bir (bazen iki) yeri var. Hepsini bulmanın yolu oktav ve unison şekilleri:</p><p>• 6→4 ve 5→3: 2 tel ince + 2 perde<br>• 4→2 ve 3→1: 2 tel ince + 3 perde<br>• Bir ince tel: 5 perde geri (Sol→Si arası 4)</p><p>Barre akor şekilleri bu konumlar üzerine oturur.</p>' });
FLV.push({ id: 'f10', name: 'Notanın tüm yerleri · ♯/♭ dahil', desc: '12 notanın hepsi', mode: 'all', count: 6, keys: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(p => 'n:' + p) });
FLV.push({ id: 'f11', name: 'Hız turu · 3 saniye', desc: 'Her soruya 3 saniye: hesaplamadan bilmeye geçiş', mode: 'timed', acc: true, keys: () => poolStr(ALL6, false),
  lesson: '<p>Hedef: düşünmeden bilmek. 3 saniye sınır var, hesaplamaya vakit kalmaz. Burada takılırsan önceki seviyelere geri dönmek normaldir.</p>' });
FLV.forEach(L => { L.gen = () => fretGen(L); });
G.FLV = FLV;

G.screens.sap = function () {
  const due = G.dueCount();
  return { t: 'Klavye haritası', cat: 'sap', h: `<div class="row g" style="margin:0 0 10px">${due ? `<button class="btn sm" data-a="review">Tekrar zamanı (${due})</button>` : ''}<button class="btn sm ghost" data-a="go" data-s="heat">Isı haritası</button></div><p class="muted">Yanlış yaptıkların daha sık, bildiklerin seyrek gelir. Bildiğin seviyeleri “Zaten biliyorum” ile geçebilirsin.</p><div class="lvgrid">${G.levelList(FLV)}</div>` };
};
G.screens.heat = function () {
  let h = '<p class="muted">Kırmızı: zayıf · turuncu/sarı: öğreniliyor · yeşil: pekişti · boş: henüz görülmedi. Üst satır = ince Mi teli.</p><div class="card"><div class="heat"><span></span>';
  for (let f = 0; f <= 12; f++) h += `<span class="h">${f}</span>`;
  for (let s = 5; s >= 0; s--) {
    h += `<span class="h">${6 - s}</span>`;
    for (let f = 0; f <= 12; f++) { const r = S.srs[s + ':' + f]; h += `<span class="c b${r && r.n ? r.box : 0}" title="${M.TRN[M.SHARP[pcAt(s, f)][0]]}${M.SHARP[pcAt(s, f)].length > 1 ? '♯' : ''}">${r && r.n ? G.nnPlain(M.SHARP[pcAt(s, f)]) : ''}</span>`; }
  }
  return { t: 'Klavye ısı haritası', cat: 'sap', h: h + '</div></div>' };
};
G.actions.review = () => {
  const keys = G.dueList();
  if (!keys.length) { alert('Şu an tekrar edilecek bir şey yok.'); return; }
  G.startSession({ title: 'Aralıklı tekrar', count: Math.min(15, Math.max(5, keys.length)), cat: 'sap',
    gen: () => {
      const cur = G.dueList();
      const k = cur.length ? pick(cur) : pick(Object.keys(S.srs));
      if (k.startsWith('n:')) return gridQ(+k.slice(2));
      const p = k.split(':').map(Number);
      return Math.random() < 0.4 ? fretQ(p[0], p[1], k) : nameQ(p[0], p[1], k, { acc: true });
    } });
};
})();
