// Klasik metotlar (Delcamp dışındakiler), Klasik ve Repertuvarım merkezi, JustinGuitar kursu.
// İçerik uygulamaya kopyalanmaz: her parça ve kitap kendi sitesine bağlanır.
(function () {
'use strict';
const G = window.G, S = G.S;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${l} <span class="ext" aria-hidden="true">↗</span></a>`;
const fact = (k, v, cls) => `<span class="fact"><span class="fk">${k}</span><span class="fv ${cls || ''}">${v}</span></span>`;

// ---------------- This is Classical Guitar (Bradford Werner) ----------------
const WB = 'https://www.thisisclassicalguitar.com/';
// Besteci|Parça|adres|ücretsiz(f)
const WG = {
1: `Carulli|Moderato, Op.192|moderato-op192-carulli-pdf-lesson|f
Anonim|A Toye (Rönesans lavtası)|a-toye-anonymous-renaissance-lute-work
Anonim|Chanson Englesa|lesson-chanson-englesa-guitar-easy
Anonim|The Spanish Pavin|lesson-the-spanish-pavin
Anonim|Robin Reddocke|lesson-robin-reddocke-easy
Aguado|Lección 19|lesson-leccion-19-dionisio-aguado
Bosch|Enfantillage No.1, Op.89|enfantillage-no1-op89-bosch
Calvi|Tordilione|lesson-tordilione-calvi
Cano|Vals No.4|vals-no4-antonio-cano
Carulli|Waltz, Op.121 No.1|lesson-waltz-op-121-no-1-carulli-easy
Carulli|Andantino, Op.241 No.5|lesson-andantino-op241-no5-carulli
Carulli|Prelude No.2, Op.114|prelude-no2-op114-carulli
Coste|Exercise No.11|lesson-exercise-no11-coste
Giuliani|Andantino, Op.50 No.1|lesson-andantino-op-50-no-1-giuliani-easy
Giuliani|Écossaise, Op.33 No.2|lesson-ecossaise-op33-no2-giuliani
Le Roy|La Tirantine|lesson-la-tirantine-adrian-le-roy
Meissonnier|Andantino Affectuoso|andantino-affectuoso-meissonnier
Mertz|Exercise No.13|lesson-exercise-no13-mertz
O’Carolan|O’Carolan’s Dream (melodi)|ocarolans-dream-melody
Pratten|Spanish Air No.9|spanish-air-catharina-pratten
Sagreras|Lección 66|leccion-no66-sagreras
Sagreras|Lección 70|lesson-leccion-70-by-sagreras
Sagreras|Lección 75|lesson-leccion75-sagreras
Sagreras|Lección 77|leccion-no77-sagreras
Sagreras|Lección 78|leccion-no78-sagreras`,
2: `Anonim|Greensleeves (düzenleme)|lesson-easy-greensleeves-classical-guitar
Kelt|The Ash Grove|the-ash-grove-for-easy-guitar
Kelt|The Skye Boat Song|the-skye-boat-song-easy-guitar
Anonim|Packington’s Pound|lesson-packingtons-pound-anonymous
Anonim|The Passemeze Pavin|grade-2-lesson-the-passemeze-pavin-anonymous
Anonim|Spagnoletta|spagnoletta-for-guitar-free-pdf|f
Anonim|Tu Anderai Col Bocchalon|lesson-tu-anderai-col-bocchalon-lute
Anonim|Wilson’s Wilde|wilsons-wilde-free-pdf-or-tab|f
Calvi|Canario|lesson-canario-carlo-calvi
Carcassi|Andantino (La minör), Op.59|grade-2-lesson-andantino-by-carcassi
Carcassi|Allegretto (Mi minör), Op.59|grade-2-lesson-allegretto-carcassi
Carulli|Andantino, Op.241 No.20|lesson-andantino-op241-no20-carulli
Carulli|Waltz, Op.241 No.21|lesson-waltz-op241-no21-carulli
Carulli|Moderato|lesson-moderato-carulli-classical-guitar-easy
Logy|Gigue (Do majör süit)|lesson-gigue-by-logy-easy
Mertz|Andantino|lesson-andantino-by-mertz-for-guitar-easy
Mertz|Moderato|grade-2-lesson-moderato-mertz
Mertz|Romanze|grade-2-lesson-romanze-mertz
Negri|Il Bianco Fiore|lesson-il-bianco-fiore-cesare-negri
Sanz|Españoleta (tema)|grade-2-lesson-espanoleta-sanz
Sanz|Rujero (kolay)|lesson-rujero-by-sanz-easy
Sanz|Lantururu|grade-2-lesson-lantururu-sanz
Sor|Andante, Op.35 No.1|lesson-andante-op-35-no-1-sor-easy`,
3: `Halk|House of the Rising Sun|house-of-the-rising-sun-classical-guitar-sheet-music-tab
Kelt|Auld Lang Syne|auld-lang-syne-guitar-free-pdf-tab|f
Kelt|Danny Boy (Londonderry Air)|londonderry-air-danny-boy-guitar-pdf
Kelt|Loch Lomond|loch-lomond-for-easy-guitar-pdf
Holst|In the Bleak Midwinter|free-pdf-in-the-bleak-midwinter-guitar|f
Halk|Oh Shenandoah|oh-shenandoah-for-easy-guitar-pdf
Halk|Scarborough Fair|scarborough-fair-classical-guitar-sheet-music-tab-pdf
Bortolazzi|Notturno No.1–2|notturno-no1-2-bortolazzi-pdf
Caroso|Bella Gioiosa|lesson-bella-gioiosa-fabritio-caroso
Ferrer|Ejercicio No.2|lesson-ejercicio-no2-ferrer
Ferrer|Ejercicio No.9|ejercicio-no-9-ferrer-free-pdf-tab|f
Foster|Jeanie with the Light Brown Hair|jeanie-with-the-light-brown-hair-foster
Fuhrmann|Tanz|lesson-tanz-fuhrmann
Giuliani|Allegro, Op.50 No.10|lesson-allegro-op50-no10-giuliani
Kellner|Sarabande|lesson-sarabande-david-kellner
Kellner|Double|lesson-double-david-kellner
Mertz|Andante|lesson-andante-by-mertz-for-guitar-easy
Mertz|Cantabile (Re)|cantabile-mertz-lesson-pdf
Mertz|Andante (Do)|lesson-andante-in-c-mertz
Mertz|Minka|minka-mertz-sheet-music-lesson|f
Molino|Romance (Do)|lesson-romance-by-molino-easy
Molino|Romance (La minör)|lesson-romance-andantino-molino
Molino|Prelude (La minör)|lesson-prelude-molino
Sagreras|Lección 86|lesson-leccion-no86-sagreras
Sor|Study, Op.31 No.1|lesson-sor-study-op31-no1
Sor|Study, Op.31 No.6|lesson-sor-study-op31-no6
Sor|Study No.6, Op.60|lesson-sor-study-no-6-op-60
Sor|Andante, Op.60 No.14|lesson-andante-op-60-no-14-sor-easy
Sor|Andantino, Op.44 No.3|lesson-andantino-op44-no3-sor
Tárrega|Study in C|study-in-c-tarrega-free-pdf|f`,
4: `Bayer|Marche Funèbre ve Bolero|marche-funebre-bolero-bayer-sheet-music-lesson
Bach|Air “On the G String”, BWV 1068|air-on-the-g-string-bach-easy-guitar-pdf
Bach|Jesu, Joy of Man’s Desiring, BWV 147|jesu-joy-of-mans-desiring-for-guitar-free-pdf|f
Petzold|Minuet in G, Anh.114|minuet-in-g-petzold-bach-pdf-lesson-classical-guitar
Carulli|Rondo, Op.241 No.34|lesson-rondo-op241-no34-carulli
Dalza|Recercar|recercar-dalza-guitar-free-pdf|f
Dowland|Mr. Dowland’s Midnight|mr-dowlands-midnight-pdf-lesson
Dowland|Mrs. Winters Jump|mrs-winters-jump-dowland-free-pdf|f
Dowland|Orlando Sleepeth|lesson-orlando-sleepeth-dowland
Ferrer|Cantilène Espagnole No.1, Op.41|cantilene-espagnole-ferrer
Ferrer|Ejercicio (Mi minör)|lesson-ejercicio-e-minor-ferrer
Giuliani|Study No.2, Op.1 Bölüm 3|study-no2-op1-part3-giuliani-string-damping|f
Giuliani|Op.1 Bölüm 4, No.1|op-1-four-no-1-giuliani|f
Giuliani|Etude No.22, Op.50|lesson-etude-no22-op50-giuliani
O’Carolan|Carolan’s Welcome|ocarolans-welcome-guitar-pdf
Manjón|Rosita|rosita-antonio-manjon-guitar-lesson-pdf
Mozart / Pratten|Il Mio Tesoro|il-mio-tesoro-mozart-pratten-pdf
Rossini / Giuliani|Se inclinassi|rossini-giuliani-se-inclinassi-a-prender-moglie
Sagreras|Lección 84|leccion-no84-sagreras-lesson-free-pdf|f
Sagreras|Nostalgia No.3, Op.19|nostalgia-no-3-op-19-by-sagreras-lesson-free-pdf
Sagreras|Lección 5, 2. kitap|leccion-no5-book2-sagreras-pdf-lesson|f
Sagreras|Lección 3, 2. kitap|leccion-no3-book-2-sagreras-pdf-lesson|f
Sanz|La Esfachata de Nápoles|la-esfachata-de-napoles-sanz
Sanz|Matachín|matachin-gaspar-sanz-pdf
Schubert|Ave Maria (düzenleme)|ave-maria-schubert-guitar-lesson-tab-pdf
Sor|Study No.13, Op.35 (Segovia No.2)|sor-study-no-13-op-35-free-pdf-tab|f
Tárrega|Estudio (Mi minör)|estudio-in-e-minor-tarrega-free-pdf|f
Tárrega|Lágrima|lagrima-by-tarrega-free-pdf|f
Viñas|Vals No.2, Op.40|vals-no2-op40-vinas-lesson-pdf`,
5: `Anonim|Spanish Romance (Romanza)|spanish-romance-tab-free-pdf|f
Anonim|Recercata Bella|recercata-bella
Bach|Sinfonia (Arioso), BWV 156|sinfonia-arioso-bwv-156-bach-guitar-lesson-pdf
Barrios|Minueto en Do|minueto-en-do-barrios-pdf
Bosch|Lamento (Mi minör) No.5, Op.89|lesson-lamento-no5-op89-bosch
Carcassi|Etude No.1, Op.60|etude-no1-op60-carcassi-lesson-pdf
Carcassi|Etude No.2, Op.60|etude-no2-op60-carcassi-pdf
Carcassi|Etude No.3, Op.60|etude-no3-op60-carcassi
Carcassi|Etude No.4, Op.60|etude-no4-op60-carcassi-pdf
Carcassi|Etude No.6, Op.60|etude-no-6op-60-carcassi-pdf
Carcassi|Etude No.7, Op.60|etude-no7-op60-carcassi-pdf
Coste|Chasse No.9, Op.51|chasse-op51-no9-coste-lesson-pdf
Cutting|Greensleeves|greensleeves-cutting-free-pdf-tab|f
Giuliani|Study No.1, Op.1 Bölüm 3|etude-op1-part3-no1-giuliani-free-pdf|f
Marschner|Bagatelle No.7, Op.4|bagatelle-no7-8-op4-marschner
Milano|Ricercare (Fantasia) 7|ricercare-fantasia-7-milano-lesson-pdf
Obregón|Amanda’s Gavotte|amandas-gavotte-obregon-lesson-free-pdf|f
Pachelbel|Canon in D|pachelbels-canon-in-d-for-guitar-free-pdf|f
Sagreras|María Luisa (Mazurka), Op.19|maria-luisa-mazurka-op-19-sagreras-lesson-pdf
Sagreras|Lección 11, 2. kitap|leccion-no11-book2-sagreras-pdf|f
Sanz|Bailete Francés|bailete-frances-gaspar-sanz
Sanz|Folías|folias-gaspar-sanz
Sanz|Pavana|pavana-gaspar-sanz-sheet-music-lesson
Sanz|Zarabanda|zarabande-gaspar-sanz-pdf
Sor|Study No.15, Op.44|sor-study-no15-op44-free-pdf-tab|f
Sor|Study No.18, Op.35|sor-study-op35-no18-free-pdf|f
Sor|Study No.24, Op.60|lesson-study-no-24-op-60-sor`,
6: `Asioli|Aria ve Capriccio|aria-capriccio-francesco-asioli-pdf
Bach|Bourrée, BWV 996|bourree-bwv-996-bach-lesson-pdf|f
Bach|Bist du bei mir|bist-du-bei-mir-be-thou-with-me-guitar-pdf
Bach|Sheep May Safely Graze, BWV 208|sheep-may-safely-graze-bwv208-bach-pdf
Carcassi|Etude No.5, Op.60|etude-no5-op60-carcassi-pdf
Carcassi|Etude No.8, Op.60|etude-no8-op-60-carcassi-pdf
Carcassi|Etude No.9, Op.60|etude-no9op60-carcassi-pdf
Carcassi|Etude No.10, Op.60|etude-no10-op60-carcassi
Carcassi|Etude No.11, Op.60|etude-no11-op60-carcassi
Carcassi|Etude No.12, Op.60|etude-no12-op60-carcassi-pdf
Carcassi|Etude No.13, Op.60|etude-no13-op60-carcassi-pdf
Carcassi|Etude No.14, Op.60|etude-no14-op60-carcassi-pdf
Carcassi|Etude No.15, Op.60|etude-no15-op60-carcassi-pdf
Carcassi|Etude No.18, Op.60|etude-no18-op60-carcassi
Chopin / Tárrega|Prelude, Op.28 No.7|preludio-no7-op28-chopin-guitar-free-pdf|f
Dall’Aquila|La Traditora No.2 (Saltarello)|la-traditora-saltarello-marco-dallaquila-pdf
Dalza|Calata ala spagnola|calata-ala-spagnola-dalza-sheet-music-pdf
Dowland|Fortune, My Foe|lesson-fortune-my-foe-john-dowland-guitar
Dowland|Tarleton’s Resurrection|tarletons-riserrectione-dowland-guitar
Giuliani|Etude No.13, Op.100|lesson-etude-no13-op100-giuliani
Johnson|Alman|alman-robert-johnson-guitar-free-pdf|f
Kellner|Passepied (La majör)|passepied-kellner-guitar-pdf-lesson
Kellner|Pastorel (La majör)|pastorel-david-kellner-lesson-pdf
Marschner|Bagatelle No.8, Op.4|bagatelle-no7-8-op4-marschner
Mertz|Nocturne No.1, Op.4|nocturne-no1-op4-mertz-free-pdf
Mertz|Nocturne No.2, Op.4|nocturne-no-2-op-4-by-mertz-free-pdf
Mertz|Nocturne No.3, Op.4|lesson-nocturne-op4-no3-mertz
Murcia|Folías Gallegas|folias-gallegas-santiago-de-murcia-lesson-pdf
Murcia|Payssanos (Greensleeves teması)|payssanos-greensleeves-murcia-pdf
Murcia|Villanos|villanos-santiago-de-murcia-lesson-pdf
Narváez|Guárdame las vacas|guardame-las-vacas-narvaez-free-pdf|f
Pratten|March Funèbre|march-funebre-by-pratten-lesson-free-pdf
Roncalli|Preludio (Sonata VII)|lesson-preludio-roncalli
Sagreras|Lección 4, 3. kitap (tremolo)|tremolo-study-leccion-no4-sagreras
Schulz|Study No.5, Op.40|study-no5-op40-schulz
Sor|Study No.15, Op.35|lesson-study-no15-op35-sor
Sor|Study (Si minör) No.22, Op.35|lesson-study-in-b-minor-no-22-op-35-by-sor
Tárrega|Adelita (Mazurka)|adelita-mazurca-tarrega-free-pdf-or-tab
Visée|Sarabande (Mi minör)|sarabande-e-minor-visee-lesson-pdf`,
7: `Arcas|Manuelito ve Bolero|manuelito-bolero-arcas-pdf
Bach|Prelude (Re minör), BWV 999|bach-prelude-d-minor-bwv-999
Bach|Prelude, Çello Süiti BWV 1007|bach-cello-suite-no-1-bwv-1007-free-pdfs
Barrios|Preludio (Re minör)|preludio-d-minor-barrios
Brescianello|Partita No.15 (La minör)|partita-no15-brescianello
Brescianello|Partita No.16 (Mi minör)|partita-no16-brescianello
Carcassi|Etude No.17, Op.60|etude-no17-op60-carcassi
Carcassi|Etude No.19, Op.60|etude-no19-op60-carcassi
Carcassi|Etude No.20, Op.60|etude-no20-op60-carcassi
Carcassi|Etude No.21, Op.60|etude-no21-op60-carcassi
Carcassi|Etude No.23, Op.60|etude-no23-op60-carcassi
Dowland|The Round Battle Galliard|the-round-battle-galliard-dowland-guitar-pdf
Kellner|Rondeau (La majör)|rondeau-in-a-kellner-guitar
Legnani|Caprice No.1–4, Op.20|caprice-no1-4-op20-legnani
Llobet|El Noi de la Mare|el-noi-de-la-mare-llobet-free-pdf-tab
Llobet|El Testament d’Amèlia|el-testament-damelia-guitar-llobet-free-pdf
Mertz|Fingals Höhle, Op.13|fingals-hohle-op13-mertz
Mertz|An Malvina, Op.13|an-malvina-mertz-pdf-lesson
Milano|Ricercare (Fantasia) 16|ricercare16-milano
Narváez|Mille Regretz|mille-regretz-cancion-del-emperador-narvaez
Pernambuco|Sons de Carrilhões|sons-de-carrilhoes-pernambuco
Sanz|Marionas|marionas-gaspar-sanz
Satie|Gymnopédie No.1|gymnopedie-no1-satie-guitar-lesson-pdf
Satie|Gnossienne No.1|gnossienne-no1-erik-satie-guitar
Schulz|Study No.4, Op.40|study-no4-op40-schulz
Sor|Study No.8, Op.6 (Segovia No.1)|sor-study-no8-op6-free-pdf-tab|f
Tárrega|Marieta (Mazurka)|marieta-mazurca-by-tarrega-free-pdf-tab|f
Viñas|El Sueño (tremolo)|el-sueno-tremolo-vinas-lesson-pdf
Visée|Passacaille (Mi minör)|passacaille-robert-de-visee-free-pdf
Weiss|Mademoiselle Tiroloise|mademoiselle-tiroloise-weiss-pdf-lesson`,
8: `Carcassi|Etude No.22, Op.60|etude-no22-op60-carcassi
Carcassi|Etude No.24, Op.60|etude-no24-op60-carcassi
Dowland|The Frog Galliard|the-frog-galliard-dowland-pdf-lesson
Kellner|Giga (La majör)|giga-by-david-kellner-lesson
Matiegka|Sonata No.4 (Mi minör), Op.31|sonata-no4-op-31-matiegka
Mertz|Unruhe, Op.13|unruhe-johann-kaspar-mertz-pdf
Piston|Air varié de Vive Henry IV|air-varie-de-vive-henry-iv-julia-piston
Tárrega|María (Gavota)|maria-gavota-tarrega-guitar-free-pdf
Tárrega|Rosita (Polka)|rosita-polka-francisco-tarrega-pdf`,
9: `Carcassi|Etude No.25, Op.60|etude-no25-op60-carcassi
Beethoven / Tárrega|Ay Işığı Sonatı|beethovens-moonlight-sonata-guitar-free-pdf|f
Dowland|Lachrimae|lachrimae-john-dowland-guitar-pdf
Falla|Homenaje (Le Tombeau de Debussy)|homenaje-manuel-de-falla
de Fossa|Pastoral No.9, Op.15|pastoral-no9-op15-francois-de-fossa
Giuliani|Händel Teması Üzerine Varyasyonlar, Op.107|variations-on-a-theme-by-handel-op107-giuliani
Giuliani|Folies d’Espagne Varyasyonları, Op.45|variations-sur-les-folies-despagne-op45-mauro-giuliani
Mudarra|Fantasía X|fantasia-x-mudarra-guitar-free-pdf
Regondi|Etude No.1|etude-no1-giulio-regondi
Tárrega|Capricho Árabe|capricho-arabe-tarrega
Tárrega|Gran Vals|gran-vals-by-tarrega-free-pdf
Tárrega|Recuerdos de la Alhambra|recuerdos-de-la-alhambra-tarrega-free-pdf|f
Weiss|Tombeau (Comte d’Logy)|tombeau-comte-logy-weiss-free-pdf`,
10: `Albéniz|Asturias (Leyenda), Op.47|asturias-leyenda-albeniz-guitar
Bach|Süit (Mi minör), BWV 996|lute-suite-e-minor-bwv-996-bach-pdf
Bach|Çello Süiti No.1, BWV 1007|bach-cello-suite-no-1-bwv-1007-free-pdfs|f
Bach|Çello Süiti No.2, BWV 1008|cello-suite-no2-bwv1008-bach-guitar-pdf
Bach|Prelude (Mi majör), BWV 1006a|prelude-e-major-bwv1006a-bach-guitar-free-pdf
Barrios|Una Limosna por el Amor de Dios|una-limosna-por-el-amor-de-dios-barrios
Weiss|Sonata IX (Do majör)|sonata-ix-c-major-weiss-guitar-pdf
Zamboni|Sonata No.9|sonata-no9-giovanni-zamboni-pdf`
};
const wList = g => (WG[g] || '').split('\n').filter(Boolean).map(l => { const [c, t, u, f] = l.split('|'); return { c, t, u: WB + u + '/', f: f === 'f', k: 'w:' + u }; });
const WBOOK = [
  ['Metot', 'Classical Guitar Method, 1. cilt', 'free-classical-guitar-method-book-pdf', 'Sıfırdan başlayan, 100 sayfalık metot; ücretsiz PDF.'],
  ['Metot', 'Classical Guitar Method, 2. cilt', 'classical-guitar-method-book-volume-2', 'Birinci cildin devamı: pozisyonlar, okuma, ilk etütler.'],
  ['Repertuvar', 'Repertoire Lessons, 1–6. seviye', 'learn-classical-guitar-education-series', 'Her seviye için ders notlu parça kitapları; dizinin nasıl kullanılacağı bu sayfada.'],
  ['Teknik', 'Essential Exercises, Scales & Arpeggios', 'classical-guitar-technique-exercises-scales-arpeggios', '1–10. seviye teknik: alıştırmalar, gamlar, arpejler.'],
  ['Teknik', 'Exploring the Fretboard', 'exploring-the-fretboard-for-guitar-pdf', '4–8. seviye, 100 alıştırma: pozisyonlar ve klavye bilgisi.'],
  ['Teknik', '20 Favorite Exercises', '20-favorite-exercises-for-classical-guitar', '1–6. seviye, en çok kullanılan 20 alıştırma.'],
  ['Etüt', 'Sor: 25 Progressive Studies, Op.60', '25-progressive-studies-op60-fernando-sor', '1–7. seviye.'],
  ['Etüt', 'Giuliani: Le Papillon, Op.50', 'le-papillon-op50-mauro-giuliani', '1–7. seviye, 32 kısa parça.'],
  ['Etüt', 'Carcassi: 25 Etudes, Op.60', '25-etudes-op60-carcassi-pdf', '5–9. seviye.'],
  ['Etüt', 'Legnani: Caprice No.1–4, Op.20', 'caprice-no1-4-op20-legnani', '6–8. seviye.']
];
G.screens.ticg = function () {
  const g = G.ui.wg || 1; const L = wList(g);
  const chips = Object.keys(WG).map(x => `<button class="chipb ${+x === g ? 'on' : ''}" data-a="wg" data-v="${x}" aria-pressed="${+x === g}">${x}${+x === 10 ? '+' : ''}</button>`).join('');
  const done = L.filter(x => S.rep[x.k] === 2).length, act = L.filter(x => S.rep[x.k] === 1).length;
  const books = WBOOK.map(b => `<div class="lk"><span class="lkk">${b[0]}</span><span class="lkt">${ext(WB + b[2] + '/', esc(b[1]))}<span class="muted">${b[3]}</span></span></div>`).join('');
  return { t: 'This is Classical Guitar', cat: 'klasik', h: `<div class="card mhead"><p><b>Bradford Werner</b>’in sitesi. 1’den 10’a seviyeli, adım adım metot kitapları ve her parça için ders notu, çoğunda video. Kendi başına çalışana en öğretici yol: önce 1. cilt metotla başla, sonra kendi seviyendeki parçalara geç.</p><div class="facts">${fact('Seviye', '1–10')}${fact('Ücret', 'Çoğu ücretsiz')}${fact('Odak', 'Metot + video ders')}</div></div>
<h2 class="sec">Seviyeye göre parçalar</h2><div class="chips" role="group" aria-label="Seviye">${chips}</div>
<p class="muted">${g}. seviye · ${L.length} parça · çalışıyorum ${act} · öğrendim ${done}. Parça adına dokununca ders sayfası açılır; “ücretsiz” işaretliler ücretsiz PDF.</p>
<div class="reps">${L.map(x => G.repRow(x.k, x.t, x.c + (x.f ? ' · ücretsiz PDF' : ''), x.u, 'ext', 'This is Classical Guitar ' + g + '. seviye')).join('')}</div>
<h2 class="sec">Kitaplar</h2><div class="card lks">${books}</div>
<p class="muted">Kaynak: ${ext('https://www.thisisclassicalguitar.com/graded-classical-guitar-sheet-music-and-lessons/', 'Graded classical guitar sheet music and lessons')}</p>` };
};
G.actions.wg = d => { G.ui.wg = +d.v; G.rerender(); };

// ---------------- Cornerstone (Simon Powis, CGC Academy) ----------------
G.screens.cgc = function () {
  const ex = (id, l) => `<button class="chipb" data-a="go" data-s="ex" data-p='${JSON.stringify({ id })}'>${l}</button>`;
  return { t: 'Cornerstone', cat: 'klasik', h: `<div class="card mhead"><p><b>Simon Powis</b>’in Classical Guitar Corner Academy’sinin seviyeli müfredatı: temellerden 8. seviyeye teknik, repertuvar, etüt ve teori bir arada. Etütler 19. yüzyıl parçaları yerine her biri tek bir beceriyi hedefleyen modern, kısa çalışmalar; üyelikte öğretmen geri bildirimi ve sınav da var.</p><div class="facts">${fact('Seviye', 'Temel–8')}${fact('Ücret', 'Ücretli', 'warn')}${fact('Odak', 'Konu etüdü')}</div></div>
<div class="card"><h3>Ücret</h3><p class="muted">İçerik yalnızca üyelere açık; uygulamaya konmaz. Yıllık üyelik 497 $, birebir koçlukla 897 $; üç aylık 197 $. Ücretsiz deneme yok, ilk ödemede 30 gün iade garantisi var. 1. seviye kitabı ayrıca satılıyor.</p><div class="lks">
<div class="lk"><span class="lkk">Üyelik</span><span class="lkt">${ext('https://classicalguitarcorner.com/join-cgc/', 'CGC Academy üyelik sayfası')}<span class="muted">Fiyatlar ve içerik listesi.</span></span></div>
<div class="lk"><span class="lkk">Bilgi</span><span class="lkt">${ext('https://www.classicalguitarcorner.com/cornerstone/', 'Cornerstone Method')}<span class="muted">Müfredatın tanıtımı.</span></span></div></div></div>
<div class="card"><h3>Ücretsiz kısımlar</h3><div class="lks">
<div class="lk"><span class="lkk">Kurs</span><span class="lkt">${ext('https://fundamentals.classicalguitarcorner.com/', 'The Fundamentals of Classical Guitar')}<span class="muted">Ücretsiz giriş kursu: oturuş, sağ ve sol el, ilk notalar.</span></span></div>
<div class="lk"><span class="lkk">Dersler</span><span class="lkt">${ext('https://www.classicalguitarcorner.com/theory/', 'Ücretsiz dersler')}<span class="muted">Teori ve teknik üzerine ücretsiz ders arşivi.</span></span></div></div></div>
<div class="card"><h3>Uygulamadaki karşılıkları</h3><p class="muted">Cornerstone’un 2. ve 3. seviye etütlerinin hedeflediği becerilere uygulamadaki alıştırmalarla çalışabilirsin:</p><div class="chips">${ex('rh4', 'Bas tutma · başparmak')}${ex('lh10', 'Yarım ve tam barre')}${ex('lh3', 'Bağ · vurma')}${ex('lh4', 'Bağ · çekme')}${ex('lh9', 'Pozisyon kayması')}${ex('lh11', 'Trill hazırlığı')}${ex('rh3', 'm-a ve i-a dengesi')}</div></div>` };
};

// ---------------- The Guitar School (Sveinn Eythorsson) ----------------
const TGS = 'https://www.classical-guitar-school.com/en/';
const TGSG = [[0, 'Hiç çalmamış olanlar için ilk adımlar'], [1, 'Başlangıç'], [2, 'Başlangıç'], [3, 'Başlangıç'], [4, 'Orta'], [5, 'Orta'], [6, 'İleri'], [7, 'İleri'], [8, 'İleri']];
G.screens.tgs = function () {
  const rows = TGSG.map(([g, l]) => { const k = 'tgs:' + g; return G.repRow(k, g + '. seviye', l, TGS + 'Grades/' + g, 'ext', 'The Guitar School'); }).join('');
  return { t: 'The Guitar School', cat: 'klasik', h: `<div class="card mhead"><p><b>Sveinn Eythorsson</b>’un sitesi. 0’dan 8’e seviyelendirilmiş çok sayıda kısa ve kolay parça, düet, trio ve etüt. Amaç bol okuma: deşifre hızını ve repertuvar genişliğini artırmak için iyi bir tamamlayıcı.</p><div class="facts">${fact('Seviye', '0–8')}${fact('Ücret', 'Karışık', 'warn')}${fact('Odak', 'Deşifre, kısa parça')}</div></div>
<p class="muted">Parçaların çoğu ücretli (yaklaşık 2–24 $), bir kısmı ücretsiz. Her seviye sayfasında fiyat parçanın yanında yazar. Seviyeyi bitirdiğinde durumunu “öğrendim” yap.</p>
<div class="reps">${rows}</div>
<div class="card lks"><div class="lk"><span class="lkk">Metot</span><span class="lkt">${ext(TGS + 'Methods', 'Metotlar')}<span class="muted">Aguado, Sor–Coste ve Eythorsson metotları.</span></span></div>
<div class="lk"><span class="lkk">Etüt</span><span class="lkt">${ext(TGS + 'Studies', 'Etütler')}<span class="muted">Seviyeli etüt listesi.</span></span></div></div>` };
};

// ---------------- Telifsiz klasik metotlar (IMSLP) ----------------
const IM = 'https://imslp.org/wiki/';
const PD = [
  ['car241', 'Carulli', 'École de guitare, Op.241', 'École_de_guitare,_Op.241_(Carulli,_Ferdinando)', '1–3', 'Metot ve kısa parçalar; Delcamp’ın ilk seviyelerinde bol yer alır.'],
  ['car59', 'Carcassi', 'Méthode complète, Op.59', 'Méthode_complète_pour_la_guitare,_Op.59_(Carcassi,_Matteo)', '1–3', 'Gamlar, akorlar ve 50 kolay parça; pozisyonlara sistemli giriş.'],
  ['sor60', 'Sor', 'Introduction à l’étude de la guitare, Op.60', 'Introduction_à_l%27étude_de_la_guitare,_Op.60_(Sor,_Fernando)', '1–3', '25 kısa ders; okuma ve iki sesli çalmanın temeli.'],
  ['agu', 'Aguado', 'Nuevo método para guitarra (1843)', 'Nuevo_método_para_guitarra_(Aguado,_Dionisio)', '1–5', 'Sağ el tekniği ve ses üzerine en ayrıntılı eski metot; dersler ve alıştırmalar.'],
  ['giu1', 'Giuliani', 'Studio per la chitarra, Op.1', 'Studio_per_la_chitarra,_Op.1_(Giuliani,_Mauro)', '1–6', '120 sağ el arpeji ve sol el alıştırmaları; uygulamadaki Giuliani 120 bu eserden.'],
  ['sor35', 'Sor', '24 Exercices très faciles, Op.35', '24_Exercices_très_faciles,_Op.35_(Sor,_Fernando)', '3–5', 'Kolay ama müzikal etütler; Delcamp 3. seviyede başlar.'],
  ['giu50', 'Giuliani', 'Le Papillon, Op.50', 'Le_Papillon,_Op.50_(Giuliani,_Mauro)', '2–5', '32 kısa, kolay parça.'],
  ['sor31', 'Sor', '24 Leçons progressives, Op.31', '24_Leçons_progressives,_Op.31_(Sor,_Fernando)', '4–6', 'Orta seviyeye geçişte pozisyon ve çok sesli çalma.'],
  ['car60', 'Carcassi', '25 Études mélodiques progressives, Op.60', 'Etudes,_Op.60_(Carcassi,_Matteo)', '5–8', 'Orta–ileri etütlerin standardı; arpej, bağ ve hız.'],
  ['sor6', 'Sor', '12 Études, Op.6', '12_Etudes,_Op.6_(Sor,_Fernando)', '7–8', 'İleri etütler; konser repertuvarına köprü.']
];
G.screens.pd = function () {
  const rows = PD.map(p => G.repRow('pd:' + p[0], p[1] + ': ' + p[2], 'yaklaşık Delcamp ' + p[4] + ' · ' + p[5], IM + p[3], 'ext', 'Telifsiz metotlar')).join('');
  return { t: 'Telifsiz klasik metotlar', cat: 'klasik', h: `<div class="card mhead"><p>19. yüzyıl gitar ustalarının kendi yazdığı, kolaydan zora sıralı metot ve etüt kitapları. Telif süresi dolduğu için ücretsiz ve serbest; tarama baskıları IMSLP’de. Bugünkü konservatuvar programlarının ortak temeli bu eserler.</p><div class="facts">${fact('Seviye', 'Opus sırası')}${fact('Ücret', 'Kamu malı', 'ok')}${fact('Odak', '19. yy. etütleri')}</div></div>
<p class="muted">Önerilen sıra yukarıdan aşağıya. Bir metotla başla (Carulli, Carcassi ya da Sor Op.60), sağ eli Giuliani Op.1 ile her gün çalış, etütlere seviyene göre geç. Durumu düğmeyle tut, tempo ve kaydı “⋯” ile.</p>
<div class="reps">${rows}</div>
<div class="row g"><button class="btn sm ghost" data-a="go" data-s="giu">Giuliani 120 arpeji uygulamada çalış</button></div>` };
};

// ---------------- Klasik merkezi ----------------
const METHODS = [
  { id: 'delcamp', n: 'Delcamp', a: 'Forum derlemeleri', f: [['Seviye', '1–8'], ['Ücret', 'Ücretsiz', 'ok'], ['Odak', 'Teknik + repertuvar']], d: 'Her seviyede teknik alıştırmalar ve bol parça; Giuliani 120 formülleriyle eşleşik. Uygulamanın ana yolu.' },
  { id: 'ticg', n: 'This is Classical Guitar', a: 'Bradford Werner', f: [['Seviye', '1–10'], ['Ücret', 'Çoğu ücretsiz', 'ok'], ['Odak', 'Metot + video']], d: 'Adım adım metot kitabı ve parça başına ders notu, çoğunda video. Kendi başına çalışana en öğretici yol.' },
  { id: 'cgc', n: 'Cornerstone', a: 'Simon Powis · CGC Academy', f: [['Seviye', 'Temel–8'], ['Ücret', 'Ücretli', 'warn'], ['Odak', 'Konu etüdü']], d: 'Her etüt tek bir beceriyi hedefler: bas tutma, yarım barre, bağ. Teori ve öğretmen geri bildirimi üyelikte.' },
  { id: 'tgs', n: 'The Guitar School', a: 'Sveinn Eythorsson', f: [['Seviye', '0–8'], ['Ücret', 'Karışık', 'warn'], ['Odak', 'Deşifre, kısa parça']], d: 'Bol, kısa ve kolay parça: deşifre hızı ve repertuvar genişliği için tamamlayıcı.' },
  { id: 'pd', n: 'Telifsiz klasik metotlar', a: 'Carcassi · Sor · Aguado · Carulli · Giuliani', f: [['Seviye', 'Opus sırası'], ['Ücret', 'Kamu malı', 'ok'], ['Odak', '19. yy. etütleri']], d: 'Ustaların kendi sıraladığı metot ve etütler; konservatuvar programlarının ortak temeli.' }
];
function methodProg(id) {
  if (id === 'delcamp') { G.KL.initRep(); const D = G.KL.DG; return Math.round(D.reduce((a, d) => a + G.KL.gradeProg(d), 0) / D.length); }
  const pre = { ticg: 'w:', tgs: 'tgs:', pd: 'pd:' }[id]; if (!pre) return null;
  const ks = Object.keys(S.rep || {}).filter(k => k.startsWith(pre) && S.rep[k]); return ks.length ? ks.length : null;
}
function repAll() {
  G.KL.initRep(); const out = [];
  Object.keys(S.rep || {}).forEach(k => {
    const v = S.rep[k]; if (!v) return;
    const m = /^(\d+):(.*)$/.exec(k);
    if (m) { const d = G.KL.DG.find(x => x.g === +m[1]); const i = d ? d.rep.findIndex(r => r[1] === m[2]) : -1; if (i < 0) return; const r = d.rep[i]; const U = G.KL.repUrl(r); out.push({ k, v, t: r[1], s: r[0], u: U.u, md: U.own ? 'pdf' : 'pdfc', src: 'Delcamp ' + d.g + '. seviye' }); return; }
    const x = (S.repm || {})[k]; if (x) out.push({ k, v, t: x.t, s: x.s, u: x.u, md: x.md, src: x.src });
  });
  return out;
}
G.screens.klasik = function () {
  G.KL.initRep();
  const sg = ['met', 'tek', 'rep'].includes(G.ui.kseg) ? G.ui.kseg : 'met';
  const seg = G.segBar('kseg', sg, [['met', 'Metotlar'], ['tek', 'Teknik'], ['rep', 'Repertuvarım']]);
  let h = '';
  if (sg === 'met') {
    h = `<p class="muted">Bir metot seç. Teknik alıştırmalar ve repertuvar listen tüm metotlarda ortak.</p><div class="mcards">${METHODS.map(m => {
      const p = methodProg(m.id);
      const badge = m.id === 'delcamp' ? `<span class="mbadge">%${p}</span>` : p ? `<span class="mbadge">${p} parça</span>` : '';
      return `<button class="mcard" data-a="go" data-s="${m.id}"><span class="mtop"><b>${m.n}</b>${badge}</span><span class="ma">${m.a}</span><span class="facts">${m.f.map(x => fact(x[0], x[1], x[2])).join('')}</span><span class="md">${m.d}</span></button>`;
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

// ---------------- JustinGuitar (pop eşlik kursu) ----------------
const JG = 'https://justinguitar.com/classes/';
const JGG = [
  [1, 'Beyaz', 'beginner-guitar-course-grade-one', 'Sekiz temel akor, kolay sekizlik vuruş, akor geçişleri ve kolay şarkılar.', [['zincir', 'Akor geçişleri'], ['lib', 'Akor kütüphanesi']]],
  [2, 'Sarı', 'beginner-guitar-course-grade-two', 'Yeni akorlar ve alternatif parmak düzenleri, yeni vuruşlar, parmakla çalmaya giriş, blues ve power chord.', [['arpej', 'Arpej atölyesi'], ['songs', 'Şarkılarım']]],
  [3, 'Turuncu', 'beginner-guitar-course-grade-three', '2. seviyenin konularını derinleştirir ve Akor Kâşifi modülünü ekler. Bitince orta seviyedesin.', [['lib', 'Akor kütüphanesi'], ['asistan', 'Kulaktan çıkarma']]],
  [4, 'Yeşil', 'intermediate-guitar-course-grade-four', 'Temeller 1 ve 2 modülleri ve bu becerileri kullanan şarkılar.', [['zincir', 'Akor geçişleri'], ['songs', 'Şarkılarım']]],
  [5, 'Mavi', 'intermediate-guitar-course-grade-five', 'Temeller 3 ve 4, La şekli barre akorlar, doğaçlama, gam ve teknik çalışması.', [['tonlar', 'Barre ve tonlar'], ['barre', 'Barre Bulucu']]],
  [6, 'Mor', 'intermediate-guitar-course-grade-six', 'Mi ve La şekli barre akorlarda rahatlık, CAGED sistemi, akor çeşitlemeleri, majör gamda doğaçlama.', [['tonlar', 'Barre ve tonlar'], ['klavye', 'Teori › Klavye']]],
  [7, 'Kırmızı', null, 'Ton değişimleri; caz ve blues örnekleriyle.', [['armoni', 'Teori › Armoni']]]
];
G.screens.jg = function () {
  const lnk = ([s, l]) => s === 'barre' ? `<button class="chipb" data-a="barregame">${l}</button>` : s === 'klavye' || s === 'armoni' ? `<button class="chipb" data-a="jgt" data-v="${s}">${l}</button>` : `<button class="chipb" data-a="go" data-s="${s}"${s === 'tonlar' ? ` data-p='{"k":"C","t":"maj"}'` : ''}>${l}</button>`;
  const rows = JGG.map(([g, c, u, d, ap]) => { const k = 'jg:' + g, v = S.jg && S.jg[g]; return `<div class="card jgr ${v ? 'ok' : ''}"><div class="row"><h3><span class="lvn">${g}</span> ${g}. seviye · ${c}</h3><button class="btn sm ${v ? 'on' : 'ghost'}" data-a="jgset" data-v="${g}" aria-pressed="${!!v}">${v ? '✓ Bitti' : 'Bitirdim'}</button></div><p class="muted">${d}</p><div class="chips">${ap.map(lnk).join('')}</div>${ext(u ? JG + u : 'https://justinguitar.com/site-map-and-lesson-structure', g + '. seviye dersleri')}</div>`; }).join('');
  return { t: 'JustinGuitar kursu', cat: 'akor', h: `<div class="card mhead"><p><b>Justin Sandercoe</b>’nun ücretsiz video kursu. Pop ve rock eşlik için en derli toplu seviyeli yol: 1–3. seviye başlangıç, 4–7. seviye orta. Dersleri sitesinde izle, aynı becerileri uygulamadaki alıştırmalarla pekiştir.</p><div class="facts">${fact('Seviye', '1–7')}${fact('Ücret', 'Ücretsiz', 'ok')}${fact('Odak', 'Akor, ritim, eşlik')}</div></div>${rows}<p class="muted">8. ve 9. seviye henüz yayımlanmadı. Kaynak: ${ext('https://justinguitar.com/site-map-and-lesson-structure', 'JustinGuitar ders yapısı')}</p>` };
};
G.actions.jgset = d => { S.jg = S.jg || {}; if (S.jg[d.v]) delete S.jg[d.v]; else S.jg[d.v] = G.dayKey(); G.save(); G.rerender(); };
G.actions.jgt = d => { G.ui.tseg = d.v; G.goTab('teori'); };
})();
