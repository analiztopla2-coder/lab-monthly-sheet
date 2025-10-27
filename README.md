# EMAA Laboratuvar Aylık Takip Sistemi

![EMAA Logo](public/logo.png)

Laboratuvar verilerinin aylık olarak takip edildiği, Excel (.xlsx) indirme ve yazdırma özelliklerine sahip modern web uygulaması.

## 🚀 Özellikler

- ✅ **Kullanıcı Kimlik Doğrulama**: JWT tabanlı güvenli giriş sistemi
- ✅ **Şifre Değiştirme**: Güvenli şifre güncelleme
- ✅ **Aylık Veri Tablosu**: 13 parametre × 31 gün düzenlenebilir tablo
- ✅ **XLSX İndirme**: Excel formatında (.xlsx) profesyonel raporlama
- ✅ **Yazdır/PDF**: Tarayıcı print özelliği ile PDF oluşturma
- ✅ **Geçmiş Aylar**: Önceki ayların verilerini görüntüleme ve düzenleme
- ✅ **Responsive Tasarım**: Mobil ve desktop uyumlu
- ✅ **Sticky Header/Row**: Kaydırma sırasında başlık ve ilk sütun sabit kalır
- ✅ **Supabase Backend**: PostgreSQL veritabanı ile güvenli veri saklama
- ✅ **Rate Limiting**: 10 başarısız deneme sonrası 15 dakika koruma
- ✅ **Kapsamlı Kullanıcı Kılavuzu**: Detaylı dokümantasyon ve HTML kılavuz

## 📋 Parametreler

Uygulama aşağıdaki 13 laboratuvar parametresini takip eder:

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

## 🛠 Teknoloji Stack

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Stil**: TailwindCSS + Custom CSS
- **UI Bileşenleri**: shadcn/ui (custom)
- **Veritabanı**: Supabase (PostgreSQL)
- **Kimlik Doğrulama**: JWT (jose - Edge Runtime uyumlu) + bcryptjs
- **Excel Export**: SheetJS (xlsx)
- **Lisans**: MIT

## 📦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env.local` dosyasını oluştur (`.env.local.example` dosyasını kopyalayarak):

```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenle ve Supabase bilgilerini gir:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jlkoeiwpdrkumjxekkxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE=your_service_role_key_here
APP_JWT_SECRET=your_long_random_secret_key_here
APP_DEFAULT_ADMIN=admin
APP_DEFAULT_PASSWORD=admin123
```

### 3. Supabase Veritabanını Hazırla

Supabase Dashboard'a git ve SQL Editor'da `supabase/migrations/001_init.sql` dosyasını çalıştır:

**Seçenek 1: Supabase Dashboard**
1. https://supabase.com/dashboard → Projenizi seç
2. Sol menüden **SQL Editor** seç
3. **New Query** butonuna tıkla
4. `supabase/migrations/001_init.sql` içeriğini yapıştır
5. **Run** butonuna tıkla

**Seçenek 2: Supabase CLI** (opsiyonel)
```bash
supabase db push
```

### 4. Veritabanını Seed'le (İlk Kullanıcı ve Ay)

```bash
npm run dev
```

Başka bir terminal'de:

```bash
npm run seed
```

Bu komut:
- `admin` / `admin123` kullanıcısını oluşturur
- Mevcut ay için boş bir sheet oluşturur

### 5. Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcıda açın: http://localhost:3000

## 🔐 Varsayılan Giriş Bilgileri

İlk seed sonrası:
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

> ⚠️ **Önemli**: İlk girişten sonra şifrenizi değiştirin!

## 📖 Kullanım

> 📘 **Detaylı Kullanıcı Kılavuzu**: Sistemi kullanmaya başlamadan önce [KULLANICI_KILAVUZU.md](KULLANICI_KILAVUZU.md) dosyasını okuyun veya uygulama içinden "Kılavuz" butonuna tıklayın.

### Giriş Yapma
1. http://localhost:3000 adresine gidin
2. Kullanıcı adı ve şifre ile giriş yapın
3. Başarılı girişte ana dashboard açılır

### Veri Girişi
1. Tabloda istediğiniz hücreye tıklayın
2. Değeri girin
3. **Kaydet** butonuna tıklayın

### Ay Değiştirme
1. Üstteki ay/yıl seçicilerinden istediğiniz dönemi seçin
2. Otomatik olarak o ayın verisi yüklenir
3. Eğer o ay yoksa, boş bir tablo görürsünüz

### Yeni Ay Oluşturma
1. Ay/yıl seçicilerden oluşturmak istediğiniz dönemi seçin
2. **Yeni Ay Oluştur** butonuna tıklayın
3. Onay verin, boş bir sheet oluşturulur

### Geçmiş Aylara Erişim
1. **Geçmiş** butonuna tıklayın
2. Açılan listeden istediğiniz aya tıklayın
3. O ayın verileri yüklenir

### Excel İndirme
1. **XLSX İndir** butonuna tıklayın
2. `laboratuvar_YYYY_AY.xlsx` dosyası indirilir
3. Dosya Microsoft Excel, LibreOffice Calc vb. ile açılabilir

### Yazdırma/PDF
1. **Yazdır/PDF** butonuna tıklayın
2. Tarayıcının print diyalogu açılır
3. PDF olarak kaydet veya yazıcıya gönder

### Şifre Değiştirme
1. Login sayfasında **Şifre Değiştir** butonuna tıklayın
2. Eski ve yeni şifrenizi girin
3. Onayladıktan sonra tekrar giriş yapın

### Çıkış
1. Sağ üstteki **Çıkış** butonuna tıklayın
2. Login sayfasına yönlendirilirsiniz

## 🗂 Dosya Yapısı

```
lab-monthly-sheet/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Login sayfası
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts    # Login endpoint
│   │   │   ├── logout/route.ts   # Logout endpoint
│   │   │   └── change-password/route.ts
│   │   ├── seed/route.ts         # Database seed
│   │   ├── sheet/
│   │   │   ├── route.ts          # GET, POST sheet
│   │   │   └── [id]/route.ts     # PUT sheet
│   │   └── sheets/route.ts       # GET all sheets list
│   ├── components/
│   │   ├── MonthTable.tsx        # Ana tablo bileşeni
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   ├── globals.css               # Global + Print stilleri
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard (ana sayfa)
├── lib/
│   ├── auth.ts                   # JWT + bcrypt helper'ları
│   ├── auth-edge.ts              # Edge Runtime JWT doğrulama
│   ├── rows.ts                   # Row labels ve helpers
│   └── supabase-server.ts        # Supabase server client
├── public/
│   ├── logo.png                  # EMAA Logo
│   └── kullanici-kilavuzu.html   # İnteraktif kullanıcı kılavuzu
├── supabase/
│   └── migrations/
│       └── 001_init.sql          # Database şeması
├── middleware.ts                 # Route koruma
├── .env.local                    # Ortam değişkenleri (GIT'e eklenmez!)
├── .env.local.example            # Örnek env dosyası
├── KULLANICI_KILAVUZU.md         # Detaylı kullanıcı dokümantasyonu
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── README.md
```

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri

1. **JWT Kimlik Doğrulama**
   - HttpOnly cookie ile token saklanır
   - 7 günlük geçerlilik süresi
   - SameSite=Lax, Secure (production)

2. **Şifre Güvenliği**
   - bcryptjs ile hash'leme (10 rounds)
   - Şifreler düz metin olarak asla saklanmaz

3. **Supabase Service Role Koruması**
   - `SUPABASE_SERVICE_ROLE` sadece server-side kullanılır
   - Client bundle'a asla dahil edilmez
   - Middleware ile route koruması

4. **Rate Limiting**
   - Login endpoint'inde 10 deneme / 15 dakika
   - IP bazlı basit in-memory rate limiting

5. **SQL Injection Koruması**
   - Supabase client parametrik sorgular kullanır
   - JSONB validasyonu

### Güvenlik Önerileri

- [ ] Production'da `APP_JWT_SECRET` değerini değiştirin (en az 32 karakter)
- [ ] Varsayılan admin şifresini değiştirin
- [ ] HTTPS kullanın (production)
- [ ] Supabase RLS (Row Level Security) politikaları ekleyin
- [ ] Rate limiting'i Redis ile geliştirin

## 🐛 Sorun Giderme

### "Cannot find module" Hataları

TypeScript lint hataları görebilirsiniz. Bu normaldir, çalışma zamanında sorun olmaz. Eğer derleme hatası alırsanız:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Supabase Bağlantı Hatası

1. `.env.local` dosyasını kontrol edin
2. Supabase URL ve key'lerin doğru olduğundan emin olun
3. Supabase Dashboard'da projenizin aktif olduğunu kontrol edin

### Seed Çalışmıyor

```bash
# Development modunda çalıştığınızdan emin olun
npm run dev

# Başka terminalde:
npm run seed
```

### Print/PDF Siyah-Beyaz Çıkıyor

Bu normaldir. Print stilleri siyah-beyaz optimize edilmiştir. Renkli yazdırmak için:
- Tarayıcı print ayarlarından "Background graphics" aktif edin

## 📈 Production Dağıtımı

### AWS Linux Sunucu (Önerilen)

Detaylı kurulum için [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) dosyasına bakın.

Hızlı başlangıç:

```bash
# Sunucuya SSH ile bağlanın
ssh -i "your-key.pem" ec2-user@your-server-ip

# Repository'yi klonlayın
git clone https://github.com/YOUR_USERNAME/lab-monthly-sheet.git
cd lab-monthly-sheet

# Bağımlılıkları yükleyin
npm install

# .env.local dosyasını oluşturun
cp .env.example .env.local
nano .env.local  # Supabase bilgilerinizi girin

# Build alın
npm run build

# PM2 ile başlatın
pm2 start ecosystem.config.js
pm2 save
```

### Vercel (Alternatif)

```bash
npm run build
vercel deploy
```

Vercel Dashboard'da environment variables ekleyin:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `APP_JWT_SECRET`
- `APP_DEFAULT_ADMIN`
- `APP_DEFAULT_PASSWORD`

### Diğer Platformlar

```bash
npm run build
npm run start
```

Environment variables ayarlamayı unutmayın!

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 İletişim

Proje Sahibi: [GitHub](https://github.com/yourusername)

---

**Not**: Bu proje eğitim ve iş amaçlı geliştirilmiştir. Production ortamında kullanmadan önce güvenlik önlemlerini gözden geçirin ve geliştirin.
