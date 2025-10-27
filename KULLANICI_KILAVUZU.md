# 📘 EMAA Laboratuvar Aylık Takip Sistemi - Kullanıcı Kılavuzu

## 🎯 Hoş Geldiniz!

EMAA Laboratuvar Aylık Takip Sistemi, laboratuvar verilerinizi günlük olarak kaydetmenizi, geçmiş verilere erişmenizi ve raporlar oluşturmanızı sağlayan modern bir dijital platformdur. Bu kılavuz, sistemi nasıl kullanacağınızı adım adım anlatmaktadır.

---

## 📋 İçindekiler

1. [Sisteme Giriş](#-1-sisteme-giriş)
2. [Ana Ekranı Tanıma](#-2-ana-ekranı-tanıma)
3. [Veri Girişi Yapma](#-3-veri-girişi-yapma)
4. [Kaydetme İşlemleri](#-4-kaydetme-i̇şlemleri)
5. [Farklı Ay ve Yıllara Geçiş](#-5-farklı-ay-ve-yıllara-geçiş)
6. [Yeni Ay Oluşturma](#-6-yeni-ay-oluşturma)
7. [Geçmiş Kayıtlara Erişim](#-7-geçmiş-kayıtlara-erişim)
8. [Excel Dosyası İndirme](#-8-excel-dosyası-i̇ndirme)
9. [Yazdırma ve PDF Oluşturma](#-9-yazdırma-ve-pdf-oluşturma)
10. [Şifre Değiştirme](#-10-şifre-değiştirme)
11. [Güvenli Çıkış](#-11-güvenli-çıkış)
12. [Sık Sorulan Sorular](#-12-sık-sorulan-sorular)
13. [İpuçları ve Püf Noktaları](#-13-i̇puçları-ve-püf-noktaları)

---

## 🔐 1. Sisteme Giriş

### Adım 1: Giriş Sayfasına Erişim
- Web tarayıcınızı açın (Chrome, Firefox, Edge veya Safari önerilir)
- Adres çubuğuna sistem adresini yazın: `http://localhost:3000`
- Karşınıza EMAA logosu ve giriş ekranı gelecektir

### Adım 2: Kullanıcı Bilgilerinizi Girin
- **Kullanıcı Adı**: Size verilen kullanıcı adınızı yazın
- **Şifre**: Şifrenizi girin (karakterler gizli görünür)
- **Giriş** butonuna tıklayın

### 📌 Önemli Notlar:
- İlk giriş şifreniz yöneticiniz tarafından verilmiştir
- Güvenlik için ilk girişte şifrenizi değiştirmeniz önerilir
- Yanlış şifre girişi: 10 başarısız denemeden sonra 15 dakika beklemeniz gerekir
- Şifrenizi unuttuysanız sistem yöneticinizle iletişime geçin

---

## 🖥️ 2. Ana Ekranı Tanıma

Başarılı girişten sonra karşınıza gelen ana ekran şu bölümlerden oluşur:

### Üst Bölüm (Kontrol Paneli)
```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]  LABORATUVAR                                    │
│                                                          │
│  [Yıl▼] [Ay▼] [Kaydet] [Yeni Ay] [Geçmiş] [XLSX] [PDF] │
│                                                          │
│               Ocak 2025                                  │
└─────────────────────────────────────────────────────────┘
```

- **EMAA Logo**: Kurumsal kimlik
- **Yıl Seçici**: Hangi yılı görüntülediğinizi gösterir
- **Ay Seçici**: Hangi ayı görüntülediğinizi gösterir
- **Kaydet Butonu**: Yaptığınız değişiklikleri kaydeder
- **Yeni Ay Oluştur**: Henüz oluşturulmamış bir ay için sayfa açar
- **Geçmiş**: Daha önce kaydedilmiş tüm ayları listeler
- **XLSX İndir**: Excel dosyası olarak indirir
- **Yazdır/PDF**: Sayfayı yazdırır veya PDF olarak kaydeder

### Veri Tablosu
Ekranın ana bölümünde 13 satır (parametre) ve aya göre değişen gün sayısı (28-31) içeren bir tablo görürsünüz:

```
┌──────────────────┬────┬────┬────┬─────┬────┐
│ Parametre        │ 1  │ 2  │ 3  │ ... │ 31 │
├──────────────────┼────┼────┼────┼─────┼────┤
│ Sıcaklık (°C)    │    │    │    │     │    │
│ pH               │    │    │    │     │    │
│ İletkenlik       │    │    │    │     │    │
│ Bulanıklık       │    │    │    │     │    │
│ ...              │    │    │    │     │    │
└──────────────────┴────┴────┴────┴─────┴────┘
```

**13 Laboratuvar Parametresi:**
1. Sıcaklık (°C)
2. pH
3. İletkenlik (µS/cm)
4. Bulanıklık (NTU)
5. Renk (Pt-Co)
6. Serbest Klor (mg/L)
7. Toplam Klor (mg/L)
8. Toplam Sertlik (°F)
9. Kalsiyum Sertliği (°F)
10. Magnezyum Sertliği (°F)
11. Demir (mg/L)
12. Mangan (mg/L)
13. Nitrit (mg/L)

---

## ✍️ 3. Veri Girişi Yapma

### Adım 1: Hücreyi Seçme
- Veri girmek istediğiniz hücrenin üzerine fare imlecini getirin
- Hücreye **bir kez tıklayın**
- Hücre aktif hale gelir (çerçevesi belirginleşir)

### Adım 2: Değer Girme
- Klavyenizden ölçüm değerini yazın
- Örnek: `7.2`, `8.5`, `124.3`, `0.8`
- Ondalık sayılar için nokta (.) veya virgül (,) kullanabilirsiniz

### Adım 3: Sonraki Hücreye Geçme
Değeri girdikten sonra:
- **Tab tuşu**: Sağdaki hücreye geçer
- **Enter tuşu**: Altdaki hücreye geçer
- **Fare ile tıklama**: İstediğiniz başka hücreye geçer

### 💡 Pratik İpuçları:
- **Hızlı veri girişi için**: Tab tuşunu kullanarak soldan sağa doğru ilerleyin
- **Boş bırakma**: Bir gün ölçüm yapılmadıysa hücreyi boş bırakabilirsiniz
- **Düzeltme**: Yanlış yazdıysanız hücreye tekrar tıklayıp düzeltebilirsiniz
- **Silme**: İçeriği silmek için hücreyi seçip Delete/Backspace tuşuna basın

### 📊 Örnek Kullanım Senaryosu:
```
Tarih: 15 Ocak 2025
Görev: O günün tüm parametrelerini kaydetmek

1. "15" numaralı gün sütununu bulun
2. İlk parametre (Sıcaklık) satırında 15. güne tıklayın
3. Değeri yazın: "18.5"
4. Enter tuşuna basarak aşağı inin
5. pH değerini yazın: "7.4"
6. Bu şekilde 13 parametreyi de tamamlayın
7. "Kaydet" butonuna tıklayın
```

---

## 💾 4. Kaydetme İşlemleri

### Manuel Kaydetme
- Verilerinizi girdikten sonra **mutlaka kaydetmelisiniz**
- Üst menüde **"Kaydet"** butonuna tıklayın
- Ekranda **"Kaydedildi!"** mesajı görünecektir
- Bu işlem 2-3 saniye sürer

### 🚨 Önemli Uyarılar:
- **Otomatik kaydetme yoktur!** Kaydet butonuna basmadan sayfayı kapatırsanız değişiklikler kaybolur
- Değişiklik yaptıktan sonra başka aya geçmeden önce **mutlaka kaydedin**
- İnternet bağlantısı yoksa kaydetme başarısız olur
- "Sunucu hatası" mesajı alırsanız internet bağlantınızı kontrol edin

### ✅ Başarılı Kaydetme Kontrol Listesi:
- [ ] Tüm gerekli verileri girdim
- [ ] Değerleri kontrol ettim
- [ ] "Kaydet" butonuna tıkladım
- [ ] "Kaydedildi!" mesajını gördüm

---

## 📅 5. Farklı Ay ve Yıllara Geçiş

### Ay Değiştirme
1. Üst menüdeki **"Ay"** açılır menüsüne tıklayın
2. İstediğiniz ayı seçin (Ocak, Şubat, Mart... Aralık)
3. Sistem otomatik olarak o ayın verilerini yükleyecektir
4. O ay daha önce oluşturulmamışsa boş tablo görürsünüz

### Yıl Değiştirme
1. Üst menüdeki **"Yıl"** açılır menüsüne tıklayın
2. İstediğiniz yılı seçin (Mevcut yıldan 5 yıl öncesi ve sonrası)
3. Seçtiğiniz yılın seçili ayı yüklenecektir

### 📌 Pratik Örnekler:
- **Şubat 2025 verilerine bakmak için**: Ay → Şubat
- **2024 yılının Aralık ayına bakmak için**: Yıl → 2024, Ay → Aralık
- **Bir önceki aya geçmek için**: Ay seçiciden bir önceki ayı seçin

---

## 🆕 6. Yeni Ay Oluşturma

Henüz veri girilmemiş bir ay için ilk kez sayfa açacaksanız:

### Adım Adım:
1. Yıl ve Ay seçicileri ile oluşturmak istediğiniz ay/yılı seçin
2. Ekranda boş tablo görünecektir
3. **"Yeni Ay Oluştur"** butonuna tıklayın
4. Onay penceresinde **"Tamam"** deyin
5. Sistem o ay için yeni bir sayfa oluşturacaktır
6. Artık veri girişi yapabilirsiniz

### 💡 Ne Zaman Kullanılır?
- Ayın ilk günü yeni ay başladığında
- Geçmiş bir aya ait veri girişi yapmak istediğinizde
- Sistem ilk kez kullanıma alındığında

### ⚠️ Dikkat:
- Bir ay için yalnızca **bir kez** "Yeni Ay Oluştur" yapılır
- Daha önce oluşturulmuş bir ay için tekrar oluşturma yapmaya gerek yoktur
- Yanlışlıkla iki kez oluşturamazsınız, sistem uyarı verecektir

---

## 📂 7. Geçmiş Kayıtlara Erişim

### Geçmiş Listesini Açma
1. Üst menüde **"Geçmiş"** butonuna tıklayın
2. Bir pencere açılır ve tüm kaydedilmiş aylar listelenir
3. Her kayıt şu bilgileri gösterir:
   - Ay ve Yıl (örn: "Ocak 2025")
   - Son güncelleme tarihi ve saati

### Geçmiş Kayda Gitme
1. Listeden görmek istediğiniz aya tıklayın
2. Sistem otomatik olarak o aya geçiş yapacaktır
3. Geçmiş penceresi kapanacak ve seçtiğiniz ayın verileri yüklenecektir

### 📊 Kullanım Senaryoları:
- **Geçen ayla karşılaştırma**: Ocak 2025'teyken Aralık 2024 verilerine bakmak
- **Yıllık trend analizi**: 2024 yılının tüm aylarını sırayla incelemek
- **Raporlama**: Müfettişlere göstermek için geçmiş aylara erişim

---

## 📥 8. Excel Dosyası İndirme

Excel formatında profesyonel rapor oluşturmak için:

### Adım 1: İndirme İşlemi
1. Üst menüde **"XLSX İndir"** butonuna tıklayın
2. Tarayıcınız otomatik olarak dosyayı indirecektir
3. Dosya adı: `laboratuvar_2025_Ocak.xlsx` formatında olacaktır

### Adım 2: Excel Dosyasını Açma
1. İndirilenler klasörünüze gidin
2. `laboratuvar_2025_Ocak.xlsx` dosyasını bulun
3. Microsoft Excel, LibreOffice veya Google Sheets ile açın

### 📊 Excel Dosyası İçeriği:
- **İlk satır**: Başlık (Parametre, 1, 2, 3... 31)
- **Sonraki satırlar**: Her parametre için bir satır
- **Sütunlar**: Gün numaraları (1-31)
- **Veriler**: Tam olarak sistemdeki gibi

### 💼 Profesyonel Kullanım:
- **E-posta ile gönderme**: İnsan Kaynakları, Yönetim, Denetçiler
- **Arşivleme**: Bilgisayarınızda veya bulutta saklama
- **İleri analiz**: Excel'de grafik, formül ve pivot tablo oluşturma
- **Yazıcıdan çıktı**: Excel'den daha gelişmiş yazdırma seçenekleri

---

## 🖨️ 9. Yazdırma ve PDF Oluşturma

### Yazdırma İşlemi
1. Üst menüde **"Yazdır/PDF"** butonuna tıklayın
2. Tarayıcınızın yazdırma penceresi açılacaktır
3. Seçenekleri ayarlayın:
   - **Yazıcı seçimi**: Fiziksel yazıcı veya "PDF olarak kaydet"
   - **Sayfa düzeni**: Yatay (Landscape) önerilir
   - **Kenar boşlukları**: Varsayılan
   - **Ölçek**: "Sayfaya sığdır" önerilir

### PDF Olarak Kaydetme
1. Yazdırma penceresinde **"Hedef"** kısmını bulun
2. **"PDF olarak kaydet"** veya **"Microsoft Print to PDF"** seçin
3. **"Yazdır"** butonuna tıklayın
4. Dosya adı verin: `Laboratuvar_Ocak_2025.pdf`
5. Kaydetmek istediğiniz klasörü seçin
6. **"Kaydet"** deyin

### 🎨 Yazdırma Görünümü Özellikleri:
- Logo ve başlık büyük ve net
- Kontrol butonları gizlenir (sadece tablo görünür)
- Ay/Yıl bilgisi belirgin şekilde görünür
- Tablo çizgileri kalın ve net
- Kağıda sığacak şekilde otomatik ölçeklenir

### 📋 Ne Zaman Kullanılır?
- Aylık raporları dosyalama için
- Toplantılarda sunmak için
- Arşivleme amaçlı
- Yasal zorunluluklar için

---

## 🔑 10. Şifre Değiştirme

### Giriş Sayfasından Şifre Değiştirme
1. Giriş ekranında **"Şifre Değiştir"** butonuna tıklayın
2. Açılan pencerede:
   - **Eski Şifre**: Mevcut şifrenizi yazın
   - **Yeni Şifre**: Yeni şifrenizi yazın (en az 6 karakter)
3. **"Değiştir"** butonuna tıklayın
4. Başarılı olursa yeşil mesaj görürsünüz
5. Pencere otomatik kapanır

### 🔐 Güvenli Şifre Önerileri:
- **Uzunluk**: En az 8-10 karakter
- **Karakter çeşitliliği**: Büyük harf, küçük harf, rakam
- **Tahmin edilemez**: Doğum tarihi, 123456 gibi basit şifreler kullanmayın
- **Örnekler**: `LabEmaa2025!`, `Guvenli#Lab24`, `KimyaTest_42`

### ⚠️ Şifre Değiştirme Hataları:
- **"Eski şifre yanlış"**: Mevcut şifrenizi yanlış yazdınız
- **"Yeni şifre çok kısa"**: En az 6 karakter olmalı
- **"Sunucu hatası"**: İnternet bağlantınızı kontrol edin

---

## 🚪 11. Güvenli Çıkış

### Çıkış Yapma
1. Sağ üstteki **"Çıkış"** butonuna (kırmızı) tıklayın
2. Sistem otomatik olarak oturumunuzu kapatacaktır
3. Giriş sayfasına yönlendirilirsiniz

### 🔒 Güvenlik İpuçları:
- İşiniz bittiğinde **mutlaka çıkış yapın**
- Özellikle ortak kullanılan bilgisayarlarda önemlidir
- Sadece tarayıcıyı kapatmak yeterli değildir
- Uzun süre bilgisayar başında olmayacaksanız çıkış yapın

### 💡 Oturum Süresi:
- Giriş yaptıktan sonra oturumunuz **7 gün** açık kalır
- 7 gün sonra otomatik olarak çıkış yapılır
- Güvenlik için her gün sonunda manuel çıkış önerilir

---

## ❓ 12. Sık Sorulan Sorular

### S1: Verilerimi kaydettim ama kayboldu, neden?
**C**: Birkaç sebep olabilir:
- Kaydet butonuna basmadan başka sayfaya geçtiniz
- İnternet bağlantınız kesildi
- Tarayıcı çöktü veya bilgisayar kapandı
**Çözüm**: Her veri girişinden sonra mutlaka "Kaydet" butonuna basın.

### S2: Geçen ayın verilerini düzenleyebilir miyim?
**C**: Evet! Geçmiş butonundan veya Ay seçiciden o aya gidin, düzenleyin ve kaydedin.

### S3: Yanlışlıkla yanlış hücreye yazdım, nasıl silerim?
**C**: Hücreye tıklayın, Ctrl+A ile tümünü seçin, Delete/Backspace tuşuna basın.

### S4: Excel dosyası açılmıyor, neden?
**C**: Bilgisayarınızda Microsoft Excel, LibreOffice veya Google Sheets yüklü olmalı. Alternatif olarak PDF kullanın.

### S5: Tabloda kaydırma yaparken başlıklar kayboldu?
**C**: Tabloda "sticky header" özelliği var. Sağa veya aşağı kaydırdığınızda parametre isimleri ve günler sabit kalmalı. Tarayıcınızı güncelleyin.

### S6: Telefondan veya tabletten kullanabilir miyim?
**C**: Evet, ancak masaüstü görünüm önerilir. Mobil cihazlarda küçük ekranda veri girişi zor olabilir.

### S7: İki kişi aynı anda aynı ayı düzenleyebilir mi?
**C**: Evet, ancak son kaydeden kazanır. Ekip çalışmasında koordinasyon önemlidir.

### S8: Şifremi unuttum, ne yapmalıyım?
**C**: Sistem yöneticinize başvurun. Yönetici şifrenizi sıfırlayabilir.

### S9: Yazdırdığımda tablo sayfaya sığmıyor?
**C**: Yazdırma ayarlarından "Yatay (Landscape)" ve "Sayfaya sığdır" seçeneklerini kullanın.

### S10: Verilerim güvende mi? Yedekleme var mı?
**C**: Tüm veriler Supabase bulut veritabanında saklanır. Düzenli yedekleme için XLSX formatında aylık indirme yapın.

---

## 💡 13. İpuçları ve Püf Noktaları

### ⚡ Hızlı Veri Girişi
1. **Klavye kısayollarını kullanın**:
   - Tab: Sağa geç
   - Shift+Tab: Sola geç
   - Enter: Aşağı geç
   - Ctrl+A: Hücre içeriğini seç

2. **Günlük rutin oluşturun**:
   - Her gün aynı saatte veri girin
   - Sabah ölçümleri → Hemen giriş → Kaydet
   - İşlem sırası: 1.gün → 2.gün → 3.gün...

3. **Çift ekran kullanıyorsanız**:
   - Bir ekranda sistem
   - Diğer ekranda notlar veya ölçüm cihazı

### 📊 Veri Kalitesi
1. **Tutarlı format kullanın**:
   - Ondalık ayracı: Her zaman aynı (nokta veya virgül)
   - Boşluk bırakmayın: `7.2` ✅, `7. 2` ❌

2. **Anormal değerlerde not alın**:
   - Excel dosyasına yorum ekleyin
   - Ayrı bir not defteri tutun

3. **Çift kontrol**:
   - Veri girişi sonrası satır satır gözden geçirin
   - Özellikle kritik parametrelerde dikkatli olun

### 🎯 Verimlilik Artırıcı Öneriler
1. **Haftalık yedekleme rutini**:
   - Her Cuma XLSX indirin
   - Klasörde tarihe göre isimlendirin: `2025-01-31_Ocak.xlsx`

2. **Aylık raporlama**:
   - Ay sonunda PDF oluşturun
   - Yöneticiye e-posta ile gönderin

3. **Tarayıcı yer imi**:
   - Sistem adresini tarayıcı favorilerinize ekleyin
   - Hızlı erişim için

### 🔧 Sorun Giderme Taktikleri
1. **Sistem yavaş çalışıyorsa**:
   - Tarayıcıyı yenileyin (F5)
   - Önbelleği temizleyin (Ctrl+Shift+Delete)
   - Farklı tarayıcı deneyin

2. **Kaydet butonu yanıt vermiyorsa**:
   - İnternet bağlantısını kontrol edin
   - Birkaç saniye bekleyin (işlem sürebilir)
   - Tarayıcı konsolu hatalarına bakın (F12)

3. **Giriş yapamıyorsanız**:
   - Caps Lock kapalı mı kontrol edin
   - Şifrenizi kopyala-yapıştır yapmayın (boşluk ekleyebilir)
   - Yöneticiyle iletişime geçin

### 🌟 Profesyonel İpuçları
1. **Veri analizi için**:
   - Excel'e aktarın
   - Grafik ve pivot tablo oluşturun
   - Aylık trendleri görselleştirin

2. **Arşivleme stratejisi**:
   ```
   Klasör yapısı:
   📁 Laboratuvar_Raporları
     📁 2025
       📁 Ocak
         📄 2025-01-31_Ocak.xlsx
         📄 2025-01-31_Ocak.pdf
       📁 Şubat
         ...
   ```

3. **Ekip koordinasyonu**:
   - Vardi/nöbet listesi oluşturun
   - Her kişi belirli günlerde veri girişi yapsın
   - Haftalık toplantılarda verileri gözden geçirin

---

## 📞 Destek ve İletişim

### Teknik Sorunlar
- **Sistem Yöneticisi**: IT departmanınıza başvurun
- **Acil Durumlar**: Sisteme erişim sorunları, veri kaybı

### Eğitim Talebi
- Yeni kullanıcılar için oryantasyon
- İleri seviye Excel analizi eğitimi

### Öneriler ve Geri Bildirim
- Sistem geliştirme önerileri
- Yeni özellik talepleri
- Kullanılabilirlik geri bildirimleri

---

## ✅ Başlangıç Kontrol Listesi

Sistemi ilk kez kullanmaya başlarken:

- [ ] Giriş bilgilerinizi aldınız
- [ ] İlk girişi yaptınız
- [ ] Şifrenizi değiştirdiniz
- [ ] Ana ekranı tanıdınız
- [ ] İlk veri girişinizi yaptınız
- [ ] Kaydetme işlemini test ettiniz
- [ ] XLSX indirmeyi denediniz
- [ ] Yazdırma/PDF özelliğini test ettiniz
- [ ] Geçmiş sayfaları incelediğiniz
- [ ] Bu kılavuzu okuduğunuz

---

## 🎓 Sonuç

EMAA Laboratuvar Aylık Takip Sistemi, verilerinizi dijital ortamda güvenle saklamanızı ve yönetmenizi sağlar. Bu kılavuzdaki adımları izleyerek sistemi etkin şekilde kullanabilir, verilerinizi kaybetmeden yönetebilir ve profesyonel raporlar oluşturabilirsiniz.

**Unutmayın**:
- ✅ Her değişikliği kaydedin
- ✅ Düzenli yedekleme yapın
- ✅ Güvenli çıkış yapın
- ✅ Sorun yaşadığınızda bu kılavuza başvurun

**İyi çalışmalar!** 🧪🔬📊

---

*Son güncelleme: Ocak 2025*  
*Versiyon: 1.0*  
*EMAA Laboratuvar Sistemi*
