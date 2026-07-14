# Yağmur & Cihangir — Düğün Davetiyesi

Bordo, krem ve altın temalı; zarf açma animasyonlu, tamamen HTML/CSS/JavaScript ile
hazırlanmış premium bir düğün davetiyesi sitesi. Framework kullanılmamıştır, GitHub
Pages üzerinde hiçbir ek ayar yapmadan yayınlanabilir.

## Dosya Yapısı

```
index.html          → Sayfa iskeleti
style.css            → Tüm tasarım ve animasyon stilleri
script.js             → Zarf açma, geri sayım, galeri, müzik, konfeti mantığı
assets/
  fonts/              → (opsiyonel) kendi fontlarınızı buraya koyabilirsiniz
  music/              → Arka plan müziği dosyanızı buraya koyun
README.md
```

## 1. GitHub Pages'e Yükleme

1. GitHub'da yeni bir repo oluşturun (örn. `yagmur-cihangir-dugun`).
2. Bu klasördeki tüm dosyaları repoya yükleyin (sürükle-bırak veya `git push`).
3. Repo ayarlarında **Settings → Pages** bölümüne gidin.
4. **Branch**: `main`, **Folder**: `/ (root)` seçip **Save** deyin.
5. Birkaç dakika içinde siteniz şu adreste yayında olacaktır:
   `https://kullaniciadiniz.github.io/repo-adi/`

Herhangi bir build adımı, npm kurulumu veya ayar gerekmez — dosyalar olduğu gibi çalışır.

## 2. Geri Sayım Tarihini Değiştirme

`script.js` dosyasının en üstünde şu satırı bulun:

```js
const WEDDING_DATE = new Date('2026-08-14T19:00:00+03:00');
```

Tarihi ve saati kendi düğün tarihinize göre `YIL-AY-GÜN`T`SAAT:DAKİKA:00`+03:00`
formatında güncelleyin (Türkiye saat dilimi `+03:00` olarak bırakılabilir).

Kartın üzerinde görünen tarih metnini de `index.html` içinde güncelleyin:

```html
<span class="details__value" id="weddingDateText">14 Ağustos 2026</span>
```

## 3. Google Maps Linkini Değiştirme

`index.html` içinde `id="mapBtn"` olan bağlantıyı bulun:

```html
<a
  class="map-btn"
  id="mapBtn"
  href="https://www.google.com/maps/search/?api=1&query=Mandalina+Park+Guzelbahce+Izmir"
  ...
>
```

`href` değerini kendi mekanınızın Google Maps linkiyle değiştirin. Google Maps'te
mekanı arayın, **Paylaş → Bağlantıyı Kopyala** ile linki alıp buraya yapıştırmanız
yeterlidir.

## 4. Müziği Değiştirme

1. Kendi müzik dosyanızı (`.mp3` formatında, telifsiz/lisanslı bir parça) `assets/music/`
   klasörüne koyun.
2. `index.html` içindeki şu satırı güncelleyin:

```html
<audio id="bgMusic" loop preload="none">
  <source src="assets/music/kendi-muziginiz.mp3" type="audio/mpeg">
</audio>
```

> Not: Bu proje bir örnek/yer tutucu ses dosyası içermez — telif haklarına uygun
> kendi müziğinizi eklemeniz gerekir. Dosya eklenmezse müzik popup'ı yine görünür,
> yalnızca "Evet" seçildiğinde sessiz kalır.

## 5. İsimleri ve Metinleri Değiştirme

`index.html` içinde şu bölümleri arayıp kendi bilgilerinizle değiştirin:

- `Yağmur` / `Cihangir` → gelin & damat isimleri (2 ayrı `<p class="name-line">` etiketi)
- `Y & C` → zarf mührü ve galeri kartındaki baş harfler
- `Gülçin & Cavit Fidan` / `Sevilay & Ali Sadık Köroğlu` → anne-baba isimleri
- `Mandalina Park` / `Güzelbahçe, İzmir` → salon ve adres bilgisi

## 6. Renk ve Yazı Tipini Özelleştirme

Tüm renkler `style.css` dosyasının en üstünde `:root` içinde tanımlıdır:

```css
:root {
  --bordo-dark: #3a0f1c;
  --bordo: #6b1e2e;
  --cream: #f6eede;
  --gold: #c9a24b;
  ...
}
```

Bu değişkenleri güncellemeniz yeterlidir; tüm site otomatik olarak yeni renklere uyum sağlar.

## 7. Performans ve Erişilebilirlik Notları

- Fotoğraflar `loading="lazy"` ve IntersectionObserver ile yalnızca gerektiğinde yüklenir.
- `prefers-reduced-motion` tercihi olan kullanıcılar için tüm animasyonlar otomatik sadeleşir.
- Tüm etkileşimli öğeler klavye ile erişilebilir (`:focus-visible` stiliyle).
- Google Fonts `Tangerine`, `Cormorant Garamond` ve `EB Garamond` CDN üzerinden `preconnect`
  ile hızlandırılmış şekilde yüklenir.

## 8. Yerel Olarak Önizleme

Herhangi bir kurulum gerekmez — `index.html` dosyasını doğrudan tarayıcıda açabilir
ya da basit bir yerel sunucu ile önizleyebilirsiniz:

```bash
python3 -m http.server 8000
# ardından tarayıcıda http://localhost:8000 adresini açın
```

İyi düğünler! 💍
