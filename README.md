# Gitar Gelişim

Telefonda, tablette ve bilgisayarda çalışan, sunucusuz bir gitar çalışma uygulaması.

## Bölümler

- **Ana sayfa:** 60 dakikalık günlük plan (gitarsız 25 + gitarla 35 dk), seri, son 7 gün, seviye ilerlemesi
- **Sap ezberi (11 seviye):** tel tel doğal notalar, diyez/bemol, bir notanın tüm yerleri, 3 saniyelik hız turu; aralıklı tekrar ve ısı haritası
- **Teori › Armoni (15 seviye):** her seviyede konu anlatımı. Gam, aralıklar, akor kurma, notadan akor adı, dereceler, beşliler çemberi, transpoze, kapo, minör, yedili akorlar, fonksiyonlar, pop dizilimleri, sus/add/slash, ikincil dominant ve ödünç akor
- **Teori › Kulak (7 seviye):** aralıklar, akor türleri, tonda derece, dizilim tanıma, makam dizisi tanıma
- **Makam:** Rast, Uşşak, Hüseyni, Buselik, Kürdi, Kürdilihicazkâr, Nihavent, Hicaz, Hümayun. Her biri 6 kararda: dizi (çıkış/iniş), sapta dizi, akorlar, karakteristik hareket, örnek eşlik kalıpları; 7 seviyelik oyun (perde adları, dörtlü/beşliler, yapı, dizi, transpoze, akorlar, diziden makam tanıma)
- **Akor:** 13 parmak kaydırmalı geçiş zinciri (açık akorlardan barre ailelerine), metronomlu geçiş antrenörü ve 1 dakika testi, arpej atölyesi (11 desen + kendi desenin), şarkılarım (akorları yaz, eşlik ederken aksın; kapo desteği), akor kütüphanesi ve arama, barre ve tonlar, 5 seviyelik akor şekli oyunu, Barre Bulucu

Notalar varsayılan olarak "Do (C)" şeklinde yan yana gösterilir; Ayarlar'dan değişir. Koyu/açık tema otomatik.

## GitHub Pages ile yayınlama

1. GitHub'da bir repo aç (örn. `gitar`).
2. Bu klasördeki dosyaların hepsini reponun köküne yükle (zip'i değil, içindekileri).
3. Repo → **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, klasör `/ (root)` → Save.
4. Bir dakika sonra adres: `https://KULLANICIADIN.github.io/gitar/`
5. Telefonda aç → **Ana ekrana ekle**. İnternetsiz de çalışır.

Güncellemede dosyaları yeniden yüklemen yeterli. Eski sürümden gelen ilerleme korunur.

## Bilgisayarda yerel açma

`index.html` dosyasına çift tıkla, ya da klasörde `python -m http.server 8000` çalıştırıp `http://localhost:8000` aç.

## Notlar

- İlerleme cihazın tarayıcısında saklanır. **Ayarlar → Yedeği indir** ile yedek al; başka cihaza yükleyerek ilerlemeni taşıyabilirsin.
- Bilgisayarda sorular klavyeyle çözülebilir: 1–9 seçenek, Enter devam, R sesi tekrar çalar.
- Makamlar gitarın 12 eşit perdesine en yakın haliyle verilir; koma gerektirenler işaretlidir.

## Kaynaklar ve lisanslar

- Armoni dersleri, şu açık lisanslı kitaplardan yararlanılarak Türkçe ve gitara uyarlanarak yazıldı: [Open Music Theory](https://viva.pressbooks.pub/openmusictheory/) (CC BY-SA 4.0), Robert Hutchinson, [Music Theory for the 21st-Century Classroom](https://musictheory.pugetsound.edu/mt21c/) (GNU FDL), Andre Mount, [Fundamentals, Function, and Form](https://milneopentextbooks.org/fundamentals-function-and-form/) (CC BY 4.0).
- Naylon gitar örnek sesleri: quartertone, Freesound paket 11573, [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) derlemesi üzerinden, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Ayrıntı: `snd/KAYNAK.txt`.
- Simgelerin çoğu [Lucide](https://lucide.dev) (ISC lisansı).
- Delcamp ve Giuliani parçalarının notaları uygulamaya kopyalanmadı; ücretsiz PDF’lere bağlantı verilir.
