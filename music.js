(function (g) {
'use strict';
const LET = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LPC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const TRN = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NICE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const OPEN = [40, 45, 50, 55, 59, 64]; // 6. telden 1. tele MIDI
const NAT = [0, 2, 4, 5, 7, 9, 11];
const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];
const CIRC = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const IVS = ['Prim', "Küçük 2'li", "Büyük 2'li", "Küçük 3'lü", "Büyük 3'lü", "Tam 4'lü", "Artık 4'lü / Eksik 5'li", "Tam 5'li", "Küçük 6'lı", "Büyük 6'lı", "Küçük 7'li", "Büyük 7'li", 'Oktav'];

const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mod = (a, n) => ((a % n) + n) % n;

function pcOf(n) { let p = LPC[n[0]]; for (let i = 1; i < n.length; i++) { if (n[i] === '#') p++; else if (n[i] === 'b') p--; } return mod(p, 12); }
function spellWith(letter, target) { let d = mod(target - LPC[letter], 12); if (d > 6) d -= 12; return letter + (d > 0 ? '#'.repeat(d) : 'b'.repeat(-d)); }
function scaleIv(root, iv) { const li = LET.indexOf(root[0]), rp = pcOf(root); return iv.map((x, i) => spellWith(LET[(li + i) % 7], (rp + x) % 12)); }
function scale(root, type) { return scaleIv(root, type === 'min' ? MIN : MAJ); }

const IVN = ['prim', "2'li", "3'lü", "4'lü", "5'li", "6'lı", "7'li"];
function interval(a, b) {
  const da = mod(LET.indexOf(b[0]) - LET.indexOf(a[0]), 7);
  const s = mod(pcOf(b) - pcOf(a), 12);
  let diff = s - MAJ[da]; if (diff > 6) diff -= 12; if (diff < -6) diff += 12;
  const perfect = [0, 3, 4].includes(da);
  let q;
  if (perfect) q = diff === 0 ? 'Tam' : diff === 1 ? 'Artık' : diff === -1 ? 'Eksik' : null;
  else q = diff === 0 ? 'Büyük' : diff === -1 ? 'Küçük' : diff === 1 ? 'Artık' : diff === -2 ? 'Eksik' : null;
  return q ? q + ' ' + IVN[da] : '?';
}
function keySig(root) { const i = CIRC.indexOf(root); if (i < 0) return null; return i <= 6 ? { n: i, t: '#' } : { n: 12 - i, t: 'b' }; }

const QMAJ = ['', 'm', 'm', '', '', 'm', 'dim'], QMIN = ['m', 'dim', '', 'm', 'm', '', ''];
const Q7MAJ = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'], Q7MIN = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'];
const RMAJ = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], RMIN = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
function diatonic(root, type) { const sc = scale(root, type); const q = type === 'min' ? QMIN : QMAJ; return sc.map((n, i) => n + q[i]); }
function diatonic7(root, type) { const sc = scale(root, type); const q = type === 'min' ? Q7MIN : Q7MAJ; return sc.map((n, i) => n + q[i]); }

// akor türleri: yarım ses ve harf adımları
const CQ = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10],
  sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 4, 7, 2], '6': [0, 4, 7, 9] };
const CQL = { '': [0, 2, 4], m: [0, 2, 4], dim: [0, 2, 4], aug: [0, 2, 4], '7': [0, 2, 4, 6], maj7: [0, 2, 4, 6], m7: [0, 2, 4, 6], m7b5: [0, 2, 4, 6],
  sus2: [0, 1, 4], sus4: [0, 3, 4], add9: [0, 2, 4, 1], '6': [0, 2, 4, 5] };
function chordParse(ch) { const m = String(ch).match(/^([A-G][#b]?)([^/|]*)(?:\/([A-G][#b]?))?/); if (!m) return null; return { root: m[1], q: m[2], bass: m[3] || null }; }
function chordPcs(ch) {
  const p = chordParse(ch); if (!p || !CQ[p.q]) return null;
  const r = pcOf(p.root); const a = CQ[p.q].map(x => (r + x) % 12);
  if (p.bass) { const b = pcOf(p.bass); if (!a.includes(b)) a.push(b); }
  return a;
}
function chordSpelled(ch) {
  const p = chordParse(ch); if (!p || !CQ[p.q]) return [];
  const li = LET.indexOf(p.root[0]), r = pcOf(p.root);
  return CQ[p.q].map((x, i) => spellWith(LET[(li + CQL[p.q][i]) % 7], (r + x) % 12));
}
function transposeName(ch, n) {
  const p = chordParse(ch); if (!p) return ch;
  return NICE[mod(pcOf(p.root) + n, 12)] + p.q + (p.bass ? '/' + NICE[mod(pcOf(p.bass) + n, 12)] : '');
}
function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

const M = { LET, LPC, TRN, SHARP, FLAT, NICE, OPEN, NAT, CIRC, MAJ, MIN, IVS, rnd, pick, shuffle, mod, pcOf, spellWith, scale, scaleIv, interval, keySig,
  QMAJ, QMIN, RMAJ, RMIN, diatonic, diatonic7, CQ, chordParse, chordPcs, chordSpelled, transposeName, midiFreq };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else g.M = M;
})(typeof window !== 'undefined' ? window : globalThis);
