# baqikk.github.io

https://baqikk.github.io adresinde yayınlanan statik çatı site. Build adımı, framework ya da bağımlılık yok: yalnızca HTML, CSS ve biraz vanilla JS.

Tasarım Yörünge Simülatörü ve Kelime Avcısı ile aynı dili kullanır (Chakra Petch / IBM Plex, keskin köşeli paneller, kehribar köşe işaretleri). Gece / gündüz geçişi Kelime Avcısı'ndaki flaş ve sis bombası efektiyle yapılır. Seçim `ka_mode` anahtarında saklanır, yani Kelime Avcısı ile ortaktır.

## Dosya yapısı

```
index.html                 Ana sayfa (Projeler + Araçlar bölümleri)
projects.js                Proje ve araç listeleri (kartlar buradan çizilir)
tema.css                   Ortak renkler (gece/gündüz), paneller, tema düğmesi, efekt stilleri
tema.js                    Gece / gündüz geçişi ve efekti
style.css                  Ana sayfa ve 404 yerleşimi
favicon.svg                Site simgesi
404.html                   Bulunamadı sayfası
.nojekyll                  GitHub Pages'in Jekyll işlemesini kapatır
araclar/
  index.html               /araclar/ adresini ana sayfadaki Araçlar bölümüne yönlendirir
  video-to-gif/index.html  Video → GIF ve çözünürlük yükseltme aracı
```

## Yeni proje ya da araç eklemek

`projects.js` içinde ilgili diziye bir satır ekleyin. Kartlar dizideki sırayla gösterilir.

```js
{ ad: "Proje adı", aciklama: "Kısa açıklama.", url: "https://baqikk.github.io/proje-adi", etiket: "Simülasyon" },
```

- **`PROJELER`**: kendi reposunda yaşayan büyük projeler (`baqikk/proje-adi` → `https://baqikk.github.io/proje-adi`).
- **`ARACLAR`**: tek işi yapan küçük yardımcılar. Bu repoda `araclar/<ad>/index.html` olarak durur, `url` alanına `/araclar/<ad>/` yazılır.

JavaScript kapalı tarayıcılar için `index.html` içindeki `<noscript>` listesine de bir bağlantı eklemek isteyebilirsiniz.

### Yeni bir araca tema eklemek

Aracın `<head>` kısmına `index.html`'deki satır içi tema betiğini, yazı tipi bağlantısını ve `/tema.css`'i ekleyin. Sayfaya `<span class="mode-l" id="modeLabel"></span><button class="mode" id="modeBtn" type="button"></button>` koyun ve `</body>` öncesine `<script src="/tema.js"></script>` ekleyin. Flaş anında bulanıklaşacak öğelere `data-fx-blur` verin. Renkler için `var(--bg)`, `var(--panel)`, `var(--ink)`, `var(--cyan)`, `var(--accent)` gibi değişkenleri kullanın.

## Yerelde önizleme

Repo kökünde:

```bash
python -m http.server 8000
```

Python yoksa:

```bash
npx serve .
```

Ardından http://localhost:8000 (ya da `serve`'ün yazdığı adresi) açın. Bağlantılar kök göreli (`/tema.css`) olduğu için dosyayı çift tıklayarak açmak yerine sunucu kullanın.

## Yayınlamak

1. Değişiklikleri `main` dalına commit edip push edin.
2. GitHub'da **Settings → Pages → Build and deployment** altında kaynak **Deploy from a branch**, dal `main` / `/ (root)` olmalı (kullanıcı sitelerinde genelde varsayılan budur).
3. Birkaç dakika içinde site https://baqikk.github.io adresinde güncellenir.
