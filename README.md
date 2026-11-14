# Gitar Gelişim

Telefonda, tablette ve bilgisayarda çalışan, sunucusuz bir gitar çalışma uygulaması.

## Bölümler

Alt menüde 5 sekme var; her sekmenin içinde üstte alt sekmeler.

- **Bugün:** 60 dakikalık günlük plan (gitarsız 25 + gitarla 35 dk) ve 10 dakikalık kısa gün, kaldığın yerden devam, seri, son 7 gün, seviye ilerlemesi. Ayarlar sağ üstteki düğmede.
- **Klasik**
  - *Metotlar:* Delcamp (1–8. seviye, teknik ve repertuvar), This is Classical Guitar (Bradford Werner, 1–10. seviye parça listesi ve kitaplar), Cornerstone (Simon Powis, ücretli; ücretsiz kısımları ve uygulamadaki karşılıkları), The Guitar School (Sveinn Eythorsson, 0–8. seviye), telifsiz klasik metotlar (Carulli, Carcassi, Sor, Aguado, Giuliani; IMSLP). Her metodun kartında seviye aralığı, ücret ve odak yan yana.
  - *Teknik:* Giuliani 120 arpej, sağ el ve sol el alıştırmaları.
  - *Repertuvarım:* tüm metotlardan çalıştığın ve öğrendiğin parçalar; tempo hedefi ve kendini kaydetme.
- **Pop:** 1 yıllık eşlik yolu ve JustinGuitar kursu (1–7. seviye, uygulamadaki alıştırmalarla eşleşik); akor geçişleri, arpej atölyesi, barre ve tonlar; şarkılarım ve kulaktan çıkarma asistanı; akor kütüphanesi.
- **Teori:** Armoni (konu anlatımlı seviyeler), Kulak, Klavye (sap ezberi, ısı haritası, akor şekli oyunları, Barre Bulucu), Makam (9 makam ve makam oyunları).
- **Araçlar:** akort aleti ve metronom (aksak usuller, tempo antrenörü).

Notalar varsayılan olarak "Do (C)" şeklinde yan yana gösterilir; Ayarlar'dan değişir. Stüdyo teması: koyu ve açık, sistem ayarına göre kendiliğinden değişir; Ayarlar’dan da seçilebilir.

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
- Yazı tipi: IBM Plex Sans ve IBM Plex Mono (IBM), SIL Open Font License 1.1 (`fonts/IBM-Plex-OFL.txt`).
- Simgelerin çoğu [Lucide](https://lucide.dev) (ISC lisansı).
- Delcamp, This is Classical Guitar, The Guitar School, Cornerstone, IMSLP ve JustinGuitar içerikleri uygulamaya kopyalanmadı; kendi sayfalarına bağlantı verilir.
