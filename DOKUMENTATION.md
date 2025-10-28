# EMAA Laboratuvar Aylık Takip Sistemi - Tam Dokümantasyon

**Versiyon:** 1.0.0  
**Tarih:** 27 Ekim 2025  
**Geliştirici:** analiztopla2-coder  
**Repository:** https://github.com/analiztopla2-coder/lab-monthly-sheet

---

## 📑 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Özellikler](#özellikler)
3. [Teknoloji Stack](#teknoloji-stack)
4. [Kurulum](#kurulum)
5. [Kullanım Kılavuzu](#kullanım-kılavuzu)
6. [API Dokümantasyonu](#api-dokümantasyonu)
7. [Veritabanı Şeması](#veritabanı-şeması)
8. [Güvenlik](#güvenlik)
9. [Deployment](#deployment)
10. [Sorun Giderme](#sorun-giderme)
11. [Geliştirme](#geliştirme)

---

## Genel Bakış

EMAA Laboratuvar Aylık Takip Sistemi, laboratuvar test sonuçlarının günlük olarak kaydedilmesi, takip edilmesi ve raporlanması için geliştirilmiş modern bir web uygulamasıdır.

### Kullanım Alanları

- Su kalitesi laboratuvar testleri
- Aylık bazda 13 farklı parametre takibi
- Her ay için 31 günlük veri girişi
- Excel formatında rapor çıktısı
- Kullanıcı aktivite izleme (audit log)
- Çoklu kullanıcı yönetimi

### Temel Kavramlar

- **Sheet (Ay)**: Belirli bir ay ve yıla ait veri seti
- **Parametre**: İzlenen test parametresi (pH, Sıcaklık, vb.)
- **Satır (Row)**: Bir parametreye ait tüm günlük değerler
- **Hücre (Cell)**: Belirli bir gün ve parametrenin kesişim noktası
- **Admin**: Sistem yöneticisi (kullanıcı yönetimi yapabilir)
- **User**: Normal kullanıcı (sadece veri girişi yapabilir)

---

## Özellikler

### ✅ Kimlik Doğrulama ve Yetkilendirme

- **JWT Tabanlı Oturum Yönetimi**: Güvenli, stateless authentication
- **Rol Bazlı Erişim**: `admin` ve `user` rolleri
- **Şifre Güvenliği**: bcrypt ile hash'leme (10 rounds)
- **HttpOnly Cookie**: XSS saldırılarına karşı koruma
- **Middleware Koruması**: Tüm korumalı route'lar için otomatik kontrol
- **Şifre Değiştirme**: Kullanıcılar kendi şifrelerini değiştirebilir

### ✅ Veri Yönetimi

- **Aylık Veri Tablosu**: 13 parametre × 31 gün = 403 hücre
- **Gerçek Zamanlı Kaydetme**: Her hücre değişikliği anında kaydedilir
- **Excel Benzeri Navigasyon**: Enter, Tab, Ok tuşları ile hareket
- **Geçmiş Aylar**: Tüm eski aylara erişim ve düzenleme
- **Yeni Ay Oluşturma**: Boş şablon ile hızlı başlangıç
- **Otomatik Validasyon**: Boş değerler kabul edilir, hatalı veri kontrolü

### ✅ Raporlama

- **XLSX Export**: Microsoft Excel uyumlu dosya indirme
- **PDF Export**: Tarayıcı print özelliği ile PDF oluşturma
- **Profesyonel Formatlama**: Logo, başlık, grid düzeni
- **Yazdırma Optimizasyonu**: Özel CSS ile A4 uyumlu çıktı

### ✅ Admin Panel

- **Kullanıcı CRUD**: Oluşturma, Güncelleme, Silme işlemleri
- **Rol Yönetimi**: Admin/User rolleri atama
- **Şifre Sıfırlama**: Admin kullanıcı şifrelerini değiştirebilir
- **Aktivite Logları**: Tüm sistem aktivitelerini görüntüleme
- **Log Filtreleme**: Aktivite türüne göre filtreleme
- **Sayfalama**: Büyük veri setleri için pagination

### ✅ Aktivite Takibi

10 farklı aktivite türü loglanır:

1. **login** - Başarılı giriş
2. **logout** - Çıkış
3. **login_failed** - Başarısız giriş denemesi
4. **password_change** - Şifre değişikliği
5. **user_created** - Yeni kullanıcı oluşturma
6. **user_updated** - Kullanıcı güncelleme
7. **user_deleted** - Kullanıcı silme
8. **sheet_created** - Yeni ay oluşturma
9. **sheet_updated** - Veri güncelleme
10. **sheet_viewed** - Veri görüntüleme

Her log kaydı şunları içerir:
- Kullanıcı bilgisi
- Aktivite türü ve detayları
- IP adresi
- User-Agent (tarayıcı bilgisi)
- Zaman damgası

### ✅ Kullanıcı Arayüzü

- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **Sticky Headers**: Kaydırma sırasında başlıklar sabit kalır
- **Hover Efektleri**: Satır ve sütun vurgulama
- **Zebra Striping**: Astigmat hastalar için okunabilirlik
- **5'lik İşaretler**: Her 5 satır/sütunda kalın çizgi
- **Renk Kodları**: Aktivite türlerine göre renklendirme
- **Modal Diyaloglar**: Kullanıcı dostu onay ekranları

### ✅ Parametreler

Sistem 13 laboratuvar parametresini takip eder:

| # | Parametre | Birim | Açıklama |
|---|-----------|-------|----------|
| 1 | Sıcaklık | °C | Su sıcaklığı |
| 2 | pH | - | Asitlik/Bazlık |
| 3 | İletkenlik | µS/cm | Elektriksel iletkenlik |
| 4 | Bulanıklık | NTU | Su berraklığı |
| 5 | Renk | Pt-Co | Su rengi |
| 6 | Serbest Klor | mg/L | Dezenfektan klor |
| 7 | Toplam Klor | mg/L | Tüm klor türleri |
| 8 | Toplam Sertlik | °F | Kalsiyum ve magnezyum toplamı |
| 9 | Kalsiyum Sertliği | °F | Kalsiyum miktarı |
| 10 | Magnezyum Sertliği | °F | Magnezyum miktarı |
| 11 | Demir | mg/L | Demir konsantrasyonu |
| 12 | Mangan | mg/L | Mangan konsantrasyonu |
| 13 | Nitrit | mg/L | Nitrit seviyesi |

---

## Teknoloji Stack

### Frontend

- **Next.js 14**: React framework (App Router)
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Customizable UI components
- **SheetJS (xlsx)**: Excel dosya işleme

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Edge Runtime**: Middleware için edge runtime
- **Jose**: JWT token operations (Edge uyumlu)
- **bcryptjs**: Şifre hash'leme

### Database

- **Supabase**: PostgreSQL veritabanı (BaaS)
- **Supabase Client**: REST API ve Realtime
- **PostgreSQL 15+**: İlişkisel veritabanı

### DevOps

- **Git**: Versiyon kontrolü
- **GitHub**: Repository hosting
- **PM2**: Production process manager
- **Nginx**: Reverse proxy (opsiyonel)
- **AWS EC2**: Linux sunucu hosting

### Güvenlik

- **JWT**: JSON Web Tokens
- **HttpOnly Cookies**: XSS koruması
- **bcrypt**: Şifre hash'leme
- **Middleware**: Route koruması
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Brute force koruması (basic)

---

## Kurulum

### Ön Gereksinimler

- **Node.js**: 18.x veya üzeri
- **npm**: 9.x veya üzeri
- **Git**: 2.x veya üzeri
- **Supabase Hesabı**: Ücretsiz plan yeterli

### 1. Repository'yi Klonlama

```bash
git clone https://github.com/analiztopla2-coder/lab-monthly-sheet.git
cd lab-monthly-sheet
```

### 2. Bağımlılıkları Yükleme

```bash
npm install
```

Bu komut şu paketleri yükler:
- next, react, react-dom
- typescript, @types/*
- tailwindcss, postcss
- @supabase/supabase-js
- jose, bcryptjs
- xlsx
- ve diğer bağımlılıklar

### 3. Supabase Projesi Oluşturma

1. https://supabase.com/dashboard adresine gidin
2. **New Project** butonuna tıklayın
3. Proje adı: `lab-monthly-sheet` (veya istediğiniz isim)
4. Veritabanı şifresi belirleyin (güçlü bir şifre)
5. Bölge seçin (en yakın: Europe West veya US East)
6. **Create new project** tıklayın (1-2 dakika sürer)

### 4. Supabase Anahtarlarını Alma

Proje oluşturulduktan sonra:

1. **Settings** → **API** sekmesine gidin
2. Şu bilgileri kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (uzun bir token)
   - **service_role**: `eyJhbGc...` (başka bir token)

### 5. Ortam Değişkenlerini Ayarlama

```bash
# .env.local dosyasını oluşturun
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```bash
# Supabase bilgilerinizi buraya yapıştırın
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE=your-service-role-key-here

# Güvenli bir JWT secret oluşturun
# Linux/Mac: openssl rand -base64 32
# Windows: [System.Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
APP_JWT_SECRET=your-secure-random-string-min-32-chars

# İlk admin kullanıcı bilgileri
APP_DEFAULT_ADMIN=admin
APP_DEFAULT_PASSWORD=admin123
```

### 6. Veritabanı Migration'larını Çalıştırma

Supabase Dashboard'da:

1. **SQL Editor** sekmesine gidin
2. **New Query** butonuna tıklayın
3. `supabase/migrations/001_init.sql` dosyasının içeriğini yapıştırın
4. **Run** butonuna tıklayın
5. Başarılı mesajını görün
6. Aynı işlemi `supabase/migrations/002_activity_logs.sql` için tekrarlayın

**Alternatif: Supabase CLI ile** (opsiyonel)

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Migration'ları push et
supabase db push
```

### 7. İlk Kullanıcıyı Oluşturma (Seed)

Development server'ı başlatın:

```bash
npm run dev
```

Başka bir terminal'de seed endpoint'ini çağırın:

```bash
# Linux/Mac
curl http://localhost:3000/api/seed

# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/seed
```

Başarılı yanıt:
```json
{
  "success": true,
  "message": "Admin user and current month sheet created"
}
```

### 8. Uygulamayı Açma

Tarayıcınızda: http://localhost:3000

**İlk Giriş:**
- Kullanıcı adı: `admin`
- Şifre: `admin123`

⚠️ **Önemli:** Giriş yaptıktan sonra hemen şifrenizi değiştirin!

---

## Kullanım Kılavuzu

### Giriş Yapma

1. http://localhost:3000 adresine gidin
2. Kullanıcı adı ve şifre girin
3. **Giriş Yap** butonuna tıklayın
4. Başarılı girişte ana dashboard açılır

**Rate Limiting:**
- 10 başarısız deneme sonrası 15 dakika bloke
- IP bazlı basit koruma

### Ana Dashboard

Dashboard'da şunlar bulunur:

**Üst Bar:**
- Kullanıcı adı ve rol
- Ay/Yıl seçiciler
- **Yeni Ay Oluştur** butonu
- **Geçmiş** butonu
- **Admin Panel** butonu (sadece admin)
- **Kılavuz** butonu
- **Çıkış** butonu

**Veri Tablosu:**
- Sol sütun: 13 parametre adı
- Üst satır: 1-31 günler
- Hücreler: Değer girişi için input alanları

**Alt Bar:**
- **Kaydet** butonu
- **XLSX İndir** butonu
- **Yazdır/PDF** butonu

### Veri Girişi

#### Klavye ile Navigasyon

- **Enter** veya **↓**: Bir satır aşağı
- **↑**: Bir satır yukarı
- **Tab** veya **→**: Bir kolon sağa
- **Shift+Tab** veya **←**: Bir kolon sola

#### Mouse ile

1. İstediğiniz hücreye tıklayın
2. Değer yazın
3. Enter'a basın veya başka hücreye tıklayın

#### Kaydetme

- Değerleri girdikten sonra **Kaydet** butonuna tıklayın
- Her kayıt işlemi activity log oluşturur
- Başarılı mesaj görüntülenir

### Ay Yönetimi

#### Farklı Aya Geçiş

1. Üstteki **Ay** ve **Yıl** seçicilerini kullanın
2. Otomatik olarak o ayın verisi yüklenir
3. Eğer ay yoksa boş tablo görünür

#### Yeni Ay Oluşturma

1. Henüz oluşturulmamış bir ay seçin
2. **Yeni Ay Oluştur** butonu aktif olur
3. Butona tıklayın
4. Onay diyalogu açılır
5. **Oluştur** butonuna tıklayın
6. Boş tablo oluşturulur

#### Geçmiş Aylara Erişim

1. **Geçmiş** butonuna tıklayın
2. Açılan listede tüm aylar görünür
3. İstediğiniz aya tıklayın
4. O ayın verisi yüklenir
5. Düzenleme yapabilir ve kaydedebilirsiniz

### Excel Export

1. **XLSX İndir** butonuna tıklayın
2. Dosya otomatik indirilir
3. Dosya adı: `laboratuvar_YYYY_MM.xlsx`
4. Microsoft Excel, LibreOffice Calc ile açılabilir

**Excel Formatı:**
- A1: EMAA Logo
- Başlık satırı: Gün numaraları
- Sol sütun: Parametre adları
- Veriler: Tüm hücre değerleri
- Grid çizgileri ve kenarlıklar

### PDF Export / Yazdırma

1. **Yazdır/PDF** butonuna tıklayın
2. Tarayıcı print diyalogu açılır
3. **Hedef**: PDF olarak kaydet seçin
4. Veya yazıcıya gönder
5. **Yazdır** butonuna tıklayın

**Print Ayarları:**
- Sayfa yönü: Yatay (Landscape)
- Kağıt boyutu: A4
- Kenar boşlukları: Varsayılan
- Arka plan grafikleri: Açık (renkli çıktı için)

### Şifre Değiştirme

1. Login sayfasında **Şifre Değiştir** linkine tıklayın
2. Kullanıcı adınızı girin
3. Eski şifrenizi girin
4. Yeni şifrenizi girin (minimum 6 karakter)
5. Yeni şifreyi tekrar girin
6. **Değiştir** butonuna tıklayın
7. Başarılı mesajı görün
8. Login sayfasına yönlendirilirsiniz
9. Yeni şifre ile giriş yapın

### Admin Panel (Sadece Admin)

#### Kullanıcı Listesi

1. **Admin Panel** butonuna tıklayın
2. `/admin/users` sayfası açılır
3. Tüm kullanıcılar listelenir
4. Her kullanıcı için:
   - Kullanıcı adı
   - Rol (admin/user)
   - Düzenle butonu
   - Sil butonu

#### Yeni Kullanıcı Ekleme

1. **Yeni Kullanıcı Ekle** butonuna tıklayın
2. Modal açılır
3. Kullanıcı adı girin
4. Şifre girin
5. Rol seçin (admin veya user)
6. **Ekle** butonuna tıklayın
7. Kullanıcı oluşturulur ve activity log kaydedilir

#### Kullanıcı Düzenleme

1. Kullanıcının yanındaki **Düzenle** butonuna tıklayın
2. Modal açılır
3. İstediğiniz alanları değiştirin:
   - Yeni şifre (opsiyonel)
   - Rol değişikliği
4. **Güncelle** butonuna tıklayın
5. Değişiklikler kaydedilir ve loglanır

#### Kullanıcı Silme

1. Kullanıcının yanındaki **Sil** butonuna tıklayın
2. Onay diyalogu açılır
3. **Sil** butonuna tıklayın
4. Kullanıcı ve logları silinir

⚠️ **Uyarı:** Silme işlemi geri alınamaz!

#### Aktivite Logları

**Log Listesi:**
- Son 20 aktivite gösterilir
- Her log için:
  - Aktivite türü (renkli etiket)
  - Kullanıcı adı
  - Detay bilgisi
  - IP adresi
  - Tarih ve saat

**Filtreleme:**
1. "Tümü" dropdown'ına tıklayın
2. Aktivite türü seçin (login, logout, vb.)
3. Sadece o türdeki loglar gösterilir

**Sayfalama:**
- **Önceki** butonu: Daha eski loglar
- **Sonraki** butonu: Daha yeni loglar
- Her sayfada 20 kayıt

### Çıkış Yapma

1. **Çıkış** butonuna tıklayın
2. Session cookie silinir
3. Activity log kaydedilir
4. Login sayfasına yönlendirilirsiniz

---

## API Dokümantasyonu

### Kimlik Doğrulama

Tüm korumalı endpoint'ler JWT token gerektirir. Token, `auth_token` adlı HttpOnly cookie'de saklanır.

#### POST /api/auth/login

Kullanıcı girişi yapar ve JWT token oluşturur.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "admin",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

**Headers:**
- `Set-Cookie`: `auth_token=JWT_TOKEN; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`

**Rate Limiting:**
- 10 başarısız deneme / 15 dakika (IP bazlı)

**Activity Log:**
- Başarılı: `login`
- Başarısız: `login_failed`

---

#### POST /api/auth/logout

Kullanıcı oturumunu sonlandırır.

**Request:**
- Body yok
- Cookie: `auth_token`

**Response (200):**
```json
{
  "success": true
}
```

**Headers:**
- `Set-Cookie`: `auth_token=; HttpOnly; Path=/; Max-Age=0` (cookie silme)

**Activity Log:** `logout`

---

#### GET /api/auth/me

Mevcut kullanıcı bilgilerini döndürür.

**Request:**
- Cookie: `auth_token`

**Response (200):**
```json
{
  "id": "uuid-here",
  "username": "admin",
  "role": "admin"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

#### POST /api/auth/change-password

Kullanıcı şifresini değiştirir.

**Request:**
```json
{
  "username": "admin",
  "oldPassword": "admin123",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Activity Log:** `password_change`

---

### Sheet (Ay) İşlemleri

#### GET /api/sheet

Belirli bir ay ve yıla ait sheet'i getirir.

**Query Params:**
- `year`: number (örn: 2025)
- `month`: number (0-11, 0=Ocak)

**Request:**
```
GET /api/sheet?year=2025&month=9
Cookie: auth_token
```

**Response (200):**
```json
{
  "id": "uuid-here",
  "year": 2025,
  "month": 9,
  "days": 31,
  "rows": {
    "Sıcaklık (°C)": ["22.5", "23.1", "22.8", ...],
    "pH": ["7.2", "7.3", "7.1", ...],
    ...
  },
  "created_at": "2025-10-01T00:00:00.000Z",
  "updated_at": "2025-10-15T14:30:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Sheet not found"
}
```

---

#### POST /api/sheet

Yeni bir sheet (ay) oluşturur.

**Request:**
```json
{
  "year": 2025,
  "month": 10
}
```

**Response (201):**
```json
{
  "id": "uuid-here",
  "year": 2025,
  "month": 10,
  "days": 30,
  "rows": {
    "Sıcaklık (°C)": [],
    "pH": [],
    ...
  }
}
```

**Response (409):**
```json
{
  "error": "Sheet already exists"
}
```

**Activity Log:** `sheet_created`

---

#### PUT /api/sheet/[id]

Mevcut bir sheet'i günceller.

**Request:**
```json
{
  "rows": {
    "Sıcaklık (°C)": ["22.5", "23.1", ...],
    "pH": ["7.2", "7.3", ...],
    ...
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "sheet": {
    "id": "uuid-here",
    "year": 2025,
    "month": 9,
    ...
  }
}
```

**Activity Log:** `sheet_updated`

---

#### GET /api/sheets

Tüm sheet'leri listeler (geçmiş menüsü için).

**Request:**
```
GET /api/sheets
Cookie: auth_token
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "year": 2025,
    "month": 9,
    "created_at": "2025-10-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "year": 2025,
    "month": 8,
    "created_at": "2025-09-01T00:00:00.000Z"
  }
]
```

---

### Admin İşlemleri

Tüm admin endpoint'leri `role: "admin"` gerektirir.

#### GET /api/admin/users

Tüm kullanıcıları listeler.

**Request:**
```
GET /api/admin/users
Cookie: auth_token (admin)
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "username": "admin",
    "role": "admin",
    "created_at": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "username": "user1",
    "role": "user",
    "created_at": "2025-10-15T10:30:00.000Z"
  }
]
```

---

#### POST /api/admin/users

Yeni kullanıcı oluşturur.

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "newuser",
    "role": "user"
  }
}
```

**Response (409):**
```json
{
  "error": "Username already exists"
}
```

**Activity Log:** `user_created`

---

#### PATCH /api/admin/users/[id]

Kullanıcıyı günceller.

**Request:**
```json
{
  "password": "newpassword123",  // opsiyonel
  "role": "admin"                 // opsiyonel
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "user1",
    "role": "admin"
  },
  "changes": ["password", "role"]
}
```

**Activity Log:** `user_updated`

---

#### DELETE /api/admin/users/[id]

Kullanıcıyı siler.

**Request:**
```
DELETE /api/admin/users/uuid-here
Cookie: auth_token (admin)
```

**Response (200):**
```json
{
  "success": true
}
```

**Activity Log:** `user_deleted`

---

#### GET /api/admin/logs

Aktivite loglarını getirir.

**Query Params:**
- `limit`: number (varsayılan: 50)
- `offset`: number (varsayılan: 0)
- `action`: string (opsiyonel, filtreleme için)

**Request:**
```
GET /api/admin/logs?limit=20&offset=0&action=login
Cookie: auth_token (admin)
```

**Response (200):**
```json
[
  {
    "id": "uuid-here",
    "user_id": "uuid-user",
    "username": "admin",
    "action": "login",
    "details": "Başarılı giriş",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2025-10-27T14:30:00.000Z"
  },
  ...
]
```

---

### Seed İşlemleri

#### GET /POST /api/seed

İlk admin kullanıcısı ve mevcut ayı oluşturur.

**Request:**
```
GET /api/seed
```

**Response (200):**
```json
{
  "success": true,
  "message": "Admin user and current month sheet created",
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "sheet": {
    "year": 2025,
    "month": 9
  }
}
```

**Response (409):**
```json
{
  "message": "Admin already exists",
  "sheet": {...}
}
```

⚠️ **Güvenlik:** Production'da bu endpoint'i devre dışı bırakın!

---

## Veritabanı Şeması

### Tablolar

#### app_users

Kullanıcı bilgilerini saklar.

```sql
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_app_users_username ON app_users(username);

-- Check constraint
ALTER TABLE app_users ADD CONSTRAINT check_role 
  CHECK (role IN ('admin', 'user'));
```

**Sütunlar:**
- `id`: UUID, primary key
- `username`: Benzersiz kullanıcı adı
- `password_hash`: bcrypt ile hash'lenmiş şifre
- `role`: Kullanıcı rolü (`admin` veya `user`)
- `created_at`: Oluşturulma zamanı

---

#### monthly_sheets

Aylık veri tablolarını saklar.

```sql
CREATE TABLE monthly_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  days INTEGER NOT NULL,
  rows JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Indexes
CREATE INDEX idx_monthly_sheets_year_month 
  ON monthly_sheets(year, month);
CREATE INDEX idx_monthly_sheets_created_at 
  ON monthly_sheets(created_at DESC);
```

**Sütunlar:**
- `id`: UUID, primary key
- `year`: Yıl (örn: 2025)
- `month`: Ay (0-11, 0=Ocak)
- `days`: O aydaki gün sayısı (28-31)
- `rows`: JSONB, parametre-değerler eşleşmesi
- `created_at`: Oluşturulma zamanı
- `updated_at`: Son güncellenme zamanı

**JSONB Yapısı:**
```json
{
  "Sıcaklık (°C)": ["22.5", "23.1", "22.8", ...],
  "pH": ["7.2", "7.3", "7.1", ...],
  ...
}
```

---

#### user_activity_logs

Kullanıcı aktivitelerini saklar (audit log).

```sql
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_activity_logs_user_id 
  ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at 
  ON user_activity_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_action 
  ON user_activity_logs(action);
```

**Sütunlar:**
- `id`: UUID, primary key
- `user_id`: Kullanıcı referansı (foreign key)
- `username`: Kullanıcı adı (denormalize)
- `action`: Aktivite türü
- `details`: Detay bilgisi
- `ip_address`: İstemci IP adresi
- `user_agent`: Tarayıcı bilgisi
- `created_at`: Aktivite zamanı

**Cascade Delete:** Kullanıcı silindiğinde logları da silinir.

---

### İlişkiler

```
app_users (1) ----< (*) user_activity_logs
     |
     └─── username (denormalized in logs)
```

---

## Güvenlik

### Kimlik Doğrulama

**JWT Token:**
- Algoritma: HS256
- Secret: `APP_JWT_SECRET` (.env.local)
- Geçerlilik: 7 gün
- Payload: `{ userId, username, role, exp }`

**Cookie Ayarları:**
```javascript
{
  httpOnly: true,      // XSS koruması
  secure: production,  // HTTPS zorunluluğu (production)
  sameSite: 'lax',     // CSRF koruması
  maxAge: 604800,      // 7 gün (saniye)
  path: '/'
}
```

### Şifre Güvenliği

**bcryptjs:**
- Rounds: 10
- Salt: Otomatik (bcrypt.hash)
- Hash uzunluğu: 60 karakter

**Minimum Gereksinimler:**
- En az 6 karakter
- Özel karakter/büyük harf zorunlu değil (basitlik için)
- Production'da daha güçlü validasyon önerilir

### Route Koruması

**Middleware** (`middleware.ts`):
- Tüm `/` route'ları kontrol edilir
- Public: `/login`, `/api/auth/login`, `/api/seed`
- Protected: Diğer tüm route'lar
- Token doğrulama: Edge Runtime'da jose kullanır
- Hatalı token: `/login` redirect

**Admin-Only Routes:**
- `/admin/*`
- `/api/admin/*`
- Middleware ve API handler'da çift kontrol

### SQL Injection Koruması

**Supabase Client:**
- Parametrik sorgular kullanır
- JSONB validasyonu
- Otomatik escape

**Örnek:**
```typescript
// Güvenli ✅
const { data } = await supabase
  .from('app_users')
  .select('*')
  .eq('username', username)  // Parametrik
  .single();

// Tehlikeli ❌ (kullanılmıyor)
const query = `SELECT * FROM app_users WHERE username = '${username}'`;
```

### XSS Koruması

- React otomatik escape
- `dangerouslySetInnerHTML` kullanılmıyor (MonthTable'da düzeltildi)
- HttpOnly cookie (JavaScript erişimi yok)

### CSRF Koruması

- SameSite cookie attribute
- State-changing işlemler POST/PUT/DELETE
- GET endpoint'leri sadece veri okur

### Rate Limiting

**Basic Implementation** (login endpoint):
```typescript
const attempts = new Map<string, { count: number, resetAt: number }>();
const MAX_ATTEMPTS = 10;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 dakika
```

⚠️ **Production için:**
- Redis veya database-backed rate limiting
- IP whitelist/blacklist
- CAPTCHA entegrasyonu

### Hassas Veri

**Asla Loglanmaz:**
- Şifreler (plain text)
- JWT secret
- Supabase service role key
- Kullanıcı hassas bilgileri

**Activity Log'da Kaydedilir:**
- IP adresi
- User-Agent
- Kullanıcı adı
- Aktivite türü ve detayları

### Ortam Değişkenleri

**.gitignore:**
```
.env.local
.env.*.local
```

**Public vs Private:**
- `NEXT_PUBLIC_*`: Client tarafında erişilebilir
- Diğerleri: Sadece server-side

**Supabase Keys:**
- `anon key`: Public (RLS ile korunmuş)
- `service_role`: Private (RLS bypass eder!)

---

## Deployment

### Yerel Geliştirme

```bash
# Development server
npm run dev

# Build
npm run build

# Production server
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

### AWS Linux Deployment

Detaylı kılavuz: [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

**Hızlı Adımlar:**

1. **EC2 Instance Oluşturma**
   - Amazon Linux 2023 veya Ubuntu 22.04
   - t2.micro veya üzeri
   - Security Group: 22, 80, 443, 3000

2. **SSH Bağlantısı**
   ```bash
   ssh -i "key.pem" ec2-user@your-ip
   ```

3. **Node.js Kurulumu**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo dnf install -y nodejs
   ```

4. **Repository Klonlama**
   ```bash
   git clone https://github.com/analiztopla2-coder/lab-monthly-sheet.git
   cd lab-monthly-sheet
   npm install
   ```

5. **.env.local Oluşturma**
   ```bash
   cp .env.example .env.local
   nano .env.local  # Supabase bilgilerini girin
   ```

6. **Build**
   ```bash
   npm run build
   ```

7. **PM2 ile Başlatma**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

8. **Nginx Reverse Proxy** (Opsiyonel)
   ```bash
   sudo dnf install -y nginx
   # /etc/nginx/conf.d/lab.conf yapılandırması
   sudo systemctl start nginx
   ```

9. **SSL Sertifikası**
   ```bash
   sudo dnf install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Vercel Deployment

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Environment Variables (Vercel Dashboard):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `APP_JWT_SECRET`
- `APP_DEFAULT_ADMIN`
- `APP_DEFAULT_PASSWORD`

### Docker Deployment (Gelecek)

Şu an Docker support yok, ancak eklenebilir:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Sorun Giderme

### Login Çalışmıyor

**Sebepler:**
1. `.env.local` dosyası yok veya hatalı
2. Veritabanında kullanıcı yok
3. JWT secret yanlış
4. Supabase bağlantı sorunu

**Çözüm:**
```bash
# .env.local kontrolü
cat .env.local

# Seed çalıştır
curl http://localhost:3000/api/seed

# PM2 logları
pm2 logs

# Supabase bağlantı testi
curl https://your-project.supabase.co/rest/v1/
```

### Build Hataları

**TypeScript Hataları:**
```bash
npm run type-check
```

**Dependency Hataları:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Cache Temizleme:**
```bash
rm -rf .next
npm run build
```

### Port Zaten Kullanımda

```bash
# Port 3000'i kullanan process
lsof -i :3000

# Kill et
kill -9 PID

# Veya başka port kullan
PORT=3001 npm run dev
```

### Supabase Bağlantı Hatası

**Kontrol:**
1. `.env.local` dosyasında URL doğru mu?
2. Anon key doğru mu?
3. Supabase projesi aktif mi?
4. Internet bağlantısı var mı?

**Test:**
```bash
curl https://your-project.supabase.co/rest/v1/app_users
```

### PM2 Sorunları

```bash
# Durumu göster
pm2 status

# Logları göster
pm2 logs lab-sheet

# Restart
pm2 restart lab-sheet

# Temiz başlangıç
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### Migration Hataları

**Tablo zaten var:**
```sql
-- DROP ve yeniden oluştur
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS monthly_sheets CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- Migration'ları yeniden çalıştır
```

**Foreign key hatası:**
```sql
-- Cascade silme
DELETE FROM user_activity_logs WHERE user_id NOT IN (SELECT id FROM app_users);
```

### Excel Export Çalışmıyor

**Tarayıcı Uyumluluğu:**
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅ (Mac)
- IE: ❌ (desteklenmiyor)

**Çözüm:**
- Modern tarayıcı kullanın
- Pop-up blocker devre dışı bırakın

### PDF Yazdırma Sorunları

**Renkler görünmüyor:**
- Print ayarlarında "Background graphics" açın

**Sayfa kesildi:**
- Page orientation: Landscape
- Margins: Default
- Scale: Fit to page width

---

## Geliştirme

### Kod Yapısı

```
app/
├── (auth)/login/page.tsx         # Login sayfası
├── admin/users/page.tsx          # Admin panel
├── api/                          # API endpoints
│   ├── auth/                     # Kimlik doğrulama
│   ├── admin/                    # Admin işlemleri
│   ├── sheet/                    # Veri yönetimi
│   └── seed/                     # İlk kurulum
├── components/
│   ├── MonthTable.tsx            # Ana tablo
│   └── ui/                       # Shadcn components
├── globals.css                   # Global + Print CSS
├── layout.tsx                    # Root layout
└── page.tsx                      # Dashboard

lib/
├── activity-logger.ts            # Activity logging
├── auth.ts                       # JWT + bcrypt
├── auth-edge.ts                  # Edge runtime auth
├── rows.ts                       # Parametre tanımları
└── supabase-server.ts            # Supabase client

middleware.ts                     # Route koruması
```

### Yeni Parametre Ekleme

1. `lib/rows.ts` dosyasını düzenleyin:
```typescript
export const ROW_LABELS = [
  "Sıcaklık (°C)",
  "pH",
  // ... mevcut parametreler
  "Yeni Parametre (birim)",  // EKLE
] as const;
```

2. Tablo otomatik güncellenir
3. Migration gerekmez (JSONB dinamik)

### Yeni Aktivite Türü Ekleme

1. `lib/activity-logger.ts` dosyasını düzenleyin:
```typescript
export type ActivityAction =
  | "login"
  | "logout"
  // ... mevcut türler
  | "new_activity";  // EKLE

export const ACTION_LABELS: Record<ActivityAction, string> = {
  // ... mevcut etiketler
  new_activity: "Yeni Aktivite",  // EKLE
};

export const ACTION_COLORS: Record<ActivityAction, string> = {
  // ... mevcut renkler
  new_activity: "bg-pink-100 text-pink-800",  // EKLE
};
```

2. İlgili endpoint'te logActivity çağırın:
```typescript
await logActivity({
  userId: user.id,
  username: user.username,
  action: "new_activity",
  details: "Detay bilgisi",
  req
});
```

### Yeni API Endpoint Ekleme

1. `app/api/your-endpoint/route.ts` oluşturun:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-edge";

export async function GET(req: NextRequest) {
  // Auth kontrolü
  const auth = await verifyAuthToken(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // İşlemler...
  return NextResponse.json({ data: "success" });
}
```

2. Admin-only için:
```typescript
if (auth.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### Testing

**Manuel Test:**
```bash
# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# API test (cookie ile)
curl http://localhost:3000/api/sheet?year=2025&month=9 \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

**Otomatik Test** (gelecek):
- Jest + React Testing Library
- Supertest (API testing)
- Cypress (E2E)

### Veritabanı Backup

**Supabase Dashboard:**
1. Database → Backups
2. Manual backup oluştur
3. Export SQL

**pg_dump ile:**
```bash
pg_dump -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  -f backup.sql
```

### Git Workflow

```bash
# Yeni özellik
git checkout -b feature/new-feature
# Kodlama...
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Pull Request oluştur

# Hotfix
git checkout -b hotfix/bug-fix
# Düzeltme...
git commit -m "fix: resolve bug"
git push origin hotfix/bug-fix
```

**Commit Convention:**
- `feat:` - Yeni özellik
- `fix:` - Bug düzeltme
- `docs:` - Dokümantasyon
- `style:` - Kod formatı
- `refactor:` - Kod iyileştirme
- `test:` - Test ekleme
- `chore:` - Bakım işleri

---

## Lisans

MIT License

```
Copyright (c) 2025 EMAA Laboratuvar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## İletişim ve Destek

- **GitHub Repository:** https://github.com/analiztopla2-coder/lab-monthly-sheet
- **Issues:** https://github.com/analiztopla2-coder/lab-monthly-sheet/issues
- **Geliştirici:** analiztopla2-coder

---

## Versiyon Geçmişi

### v1.0.0 (27 Ekim 2025)

**İlk Yayın:**
- ✅ Kullanıcı kimlik doğrulama (JWT + bcrypt)
- ✅ Aylık veri tablosu (13 parametre × 31 gün)
- ✅ Excel (XLSX) export
- ✅ PDF/Print özelliği
- ✅ Admin panel (kullanıcı CRUD)
- ✅ Aktivite logları (10 aktivite türü)
- ✅ Klavye navigasyonu (Excel benzeri)
- ✅ Responsive tasarım
- ✅ Astigmat-dostu tablo
- ✅ Supabase entegrasyonu
- ✅ PM2 deployment desteği
- ✅ Kapsamlı dokümantasyon

**Bilinen Sorunlar:**
- Rate limiting basit (in-memory)
- Seed endpoint production'da açık
- Unit test yok

**Gelecek Sürümler:**
- v1.1.0: Sheet aktivite logları (create, update, view)
- v1.2.0: Log export (CSV/Excel)
- v1.3.0: Gelişmiş filtreleme ve arama
- v2.0.0: Multi-tenant support

---

**Son Güncelleme:** 27 Ekim 2025  
**Doküman Versiyonu:** 1.0
