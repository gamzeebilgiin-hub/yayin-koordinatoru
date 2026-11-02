# Yayın Koordinatörü

İçerik üreticileri ve küçük ajanslar için çok kanallı yayın planner. Üretim, yükleme ve gerçek yayını ayrı takip edin. İlk sürüm tarayıcıda çalışır; hesap veya API anahtarı istemez.

## Özellikler

- Kanal ve içerik ekleme/düzenleme; YouTube, Instagram, TikTok ve diğer platformlar.
- Bağımsız üretim, yükleme ve yayın durumları; hedef tarih, gerçek yayın tarihi, video bağlantısı, dosya referansı, kaynak, kontrol zamanı ve notlar.
- Arama ve kanal/üretim/yayın/arşiv filtreleri.
- Ana ekranda içerik havuzu ve Pazartesi–Pazar gün sütunları. Tarihsiz ve hazır kartları güne sürükleyerek planlama.
- Bu hafta / Gelecek hafta geçişi; dokunmatik ve klavye için Güne taşı alternatifi.
- Zamanı geçmiş planlar, eksik üretim ve doğrulanmamış yayınlar için uyarı.
- Tarayıcıda kalıcılık; JSON yedek, CSV aktarımı, JSON metni yapıştırma ve birleştirmeden önce önizleme.
- Geri alınabilir arşivleme ve son kayıt değişikliğini geri alma.
- Sekmelerde değişiklik algılama; sentetik demo, boş çalışma alanı ve mobil görünüm.

## Canlı önizleme

https://yayin-koordinatoru-atlas.gamzeebilgiin.chatgpt.site

Demo şu anda sahibiyle sınırlı erişimde olabilir. Herkes yerel kurulumla kullanabilir; demo erişimi kaynak lisansından bağımsızdır.

## Kurulum

Node.js 20.11 veya üstü. Harici paket kurulumu gerekmez.

```sh
npm start
```

`http://127.0.0.1:4173` adresini açın. Port için `PORT=4174 npm start` kullanılabilir. HTML dosyasını file protokolü yerine HTTP ile açın.

```sh
npm test
npm run check
```

`dist/` klasörü herhangi bir statik web sunucusunda yayımlanabilir. `server.mjs` yalnız yerel önizleme içindir; üretim sunucusu olarak kullanılmamalıdır.

## Kullanım

1. Sentetik örnekleri inceleyin veya “Boş alanla başla” seçin.
2. Kanallar ekranından benzersiz adlı kanallar ekleyin.
3. İçerik ve hedef tarihi girin. Tarihler Europe/Istanbul, UTC+3 olarak yorumlanır.
4. Platformu kontrol ettikten sonra yükleme/yayın durumunu güncelleyin. “Platformda planlandı” için yüklenmiş içerik ve hedef tarih gerekir. “Yayınlandı” için yükleme ve gerçek yayın tarihi gerekir.
5. Veri aktarımından JSON yedeği indirin; başka cihazda dosyayla veya JSON metni yapıştırarak içe alın. Önizlemeyi kontrol ederek birleştirin.
6. Arşivlenen içerikler İçerik havuzundaki Arşiv filtresinden geri getirilebilir.

## Veri aktarımı

`examples/demo.json` ve `examples/demo.csv` sentetik örneklerdir. Uygulamanın açılış örnekleri o haftaya yerleşir; dosya örnekleri sabit tarihlidir.

JSON kökü `version: 1`, `channels`, `items` alanlarını içerir. Kanal alanları `id`, `name`, `platform`, `color`, `url`; içerik alanları `id`, `channelId`, `title`, `format`, `production`, `upload`, `publication`, `plannedAt`, `publishedAt`, `verifiedAt`, `platformPlannedAt`, `url`, `source`, `asset`, `notes`, `archived` şeklindedir. Tarih/saat `YYYY-MM-DDTHH:mm` ile İstanbul yerel saatidir. Kimlikler 1–100 ASCII harf, sayı, alt çizgi veya kısa çizgiden oluşur.

| Alan | Değerler |
|---|---|
| production | draft, in_progress, ready |
| upload | unknown, not_uploaded, uploaded |
| publication | unknown, unpublished, scheduled, published |

CSV UTF-8 ve virgülle ayrılmış olmalı. Gereken başlıklar `id,channel,title,format,production,upload,publication`. Tüm sütunlar için uygulamanın CSV şablonunu indirin. XLSX dosyalarını önce Excel'de CSV UTF-8 olarak kaydedin. Üst sınırlar: 2 MB, 100 kanal ve 1000 içerik.

İçe aktarma birleştirir: aynı kimlikteki içerik dosyadaki tüm alanlarıyla güncellenir; dosyada olmayanlar korunur. Aynı adlı kanallar eşleştirilir. Notların da üzerine yazılabileceği önizlemede belirtilir; önce JSON yedeği alın. JSON tam yedektir. CSV içerikleri ve ilgili kanal temel bilgilerini taşır, boş kanalları içermez. CSV dışa aktarımı formül enjeksiyonuna karşı =, +, -, @ ile başlayan değerleri tek tırnakla korur. Birebir yedek için JSON kullanın.

Kartı taşımak yalnız hedef günü değiştirir. Mevcut saat korunur; saati olmayan kart 18:00 alır. Platformda planlı kart taşındığında eski platform tarihi ayrıca korunur ve hedefle farklıysa kontrol uyarısı gösterilir. Platformda hiçbir işlem yapılmaz. Yayınlanmış kart taşınmaz; yeniden kullanım için yeni içerik kaydı oluşturulur.

## Veri saklama ve sınırlar

Veriler bu site adresi ve tarayıcı profiline ait localStorage alanındadır. Her ziyaretçi kendi tarayıcı kaydını kullanır. Uygulama içerik verilerini sunucuya göndermez. Tarayıcı verilerini temizlemek kayıtları siler; özel modda kalıcılık garanti değildir. Düzenli JSON yedeği alın.

Paylaşılan ekip hesabı, bulut veri tabanı ve cihazlar arasında otomatik eşitleme yoktur. YouTube API/Studio bağlantısı, otomatik veri çekme, video yükleme ve yayınlama yoktur. Platform durumu kullanıcı tarafından kontrol edilerek girilir. Tarihi geçen içerik kendiliğinden yayınlandı sayılmaz. Örnekler gerçek kanal verisi veya kimlik bilgisi içermez.

İlk sürüm yalnız İstanbul saat dilimini kullanır. Son değişikliği geri alma sayfa yenilenince sıfırlanır. Kalıcı arşivden geri getirme yenileme sonrasında da çalışır.

## Mimari

- `dist/index.html` ve `dist/styles.css`: erişilebilir HTML, formlar ve duyarlı arayüz.
- `dist/app.js`: görünüm, formlar, kalıcılık ve aktarım.
- `dist/model.js`: veri doğrulama, tarih, CSV ve birleştirme mantığı.
- `server.mjs`: bağımlılıksız yerel HTTP sunucusu.
- `tests/model.test.mjs`: Node test runner senaryoları.

Vanilla JavaScript ile statik HTML/CSS seçimi ilk sürümü kolay çalıştırılabilir tutar.

## Doğrulama

15 otomatik test; hafta sınırları, geçersiz tarih, yayın önkoşulları, bozuk CSV, birleştirme, kimlik/kanal eşleşmeleri, arşiv ve CSV formül korumasını kapsar. Tarayıcıda kanal/içerik oluşturma, eksik yayın tarihi hatası, yenileme sonrası kayıt, arama, arşiv/geri alma, JSON yapıştırma önizlemesi/birleştirme ve hafta geçişi denendi. Kart havuzdan Perşembe gününe sürüklenip bırakıldı; Güne taşı ile sonraki haftaya alındı. Masaüstü ve 390 px mobil görünüm incelendi.

Otomatik dosya seçici testi Chrome eklentisinin yerel dosya iznine takıldı. Aynı doğrulama/önizleme/birleştirme hattı JSON yapıştırma üzerinden tarayıcıda, CSV çözümleme ise otomatik testlerde doğrulandı.

## Sonraki adımlar

Kullanıcı testlerinden sonra farklı saat dilimleri ve XLSX alan eşleştirme değerlendirilebilir. Salt okunur YouTube OAuth, ekip üyeliği ve bulut veri tabanı ayrıca geliştirilecektir; mevcut sürümde yoktur.

## Lisans

MIT. Kullanım, değişiklik ve dağıtım serbesttir; lisans ve telif bildirimi korunmalıdır.
