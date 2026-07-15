# Yağmur & Cihangir — Premium Düğün Davetiyesi

Bordo velvet zeminli, cotton kağıt kartlı, Apple/Keynote tarzı akıcı geçişlere
sahip lüks bir dijital düğün davetiyesi. Framework yok — saf HTML/CSS/JS,
GitHub Pages'te ek ayar gerektirmeden çalışır.

## Akış

1. **Açılış kartı** (`acilis.png`) ~2 saniye görünür, altında Oooh Baby fontuyla
   "Yağmur İpek + Cihangir" yazar, sonra yumuşakça yukarı kaybolur.
2. **Zarf ekranı** (`zarf.png`) — statik, hafif nefes alma (breathing) ve hover
   mikro animasyonu. Zarf açılmaz.
3. Zarfa tıklanınca **davetiye** (`davetiye.jpg`) hafif scale + blur çözülmesi +
   kamera yaklaşma hissiyle gelir; birkaç saniye sonra sayfa yavaşça aşağı kayar.
4. Sırasıyla **Geri Sayım → Couple → Konum → Footer** bölümleri sinematik belirir.

## Dosyalar

```
index.html   style.css   script.js
acilis.png            → açılış karikatürü
zarf.png              → kapalı premium zarf
davetiye.jpg          → ana davetiye görseli
couple-polaroid.png   → couple bölümü görseli
muzik.mp3             → arka plan müziği (Pachelbel Canon in D)
README.md
```

## Özelleştirme

- **Tarih**: `script.js` en üstünde `WEDDING_DATE`.
- **Konum**: `index.html` içinde `mapFrame` iframe `src` + `mapBtn` `href`.
- **Müzik**: `muzik.mp3` dosyasını değiştirin (aynı isim).
- **Görseller**: aynı dosya adıyla değiştirin.

## Fontlar

Poppins (gövde), Playfair Display (geri sayım rakamları), Oooh Baby (başlıklar
ve isimler) — Google Fonts üzerinden otomatik yüklenir.

İyi düğünler! 💍
