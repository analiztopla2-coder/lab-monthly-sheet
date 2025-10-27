# 👤 Admin Kullanıcı Yönetimi Sistemi

## 🎉 Yeni Özellik Eklendi!

Admin kullanıcıları artık sisteme yeni kullanıcı ekleyebilir ve mevcut kullanıcıları silebilir.

---

## 🚀 Özellikler

### ✅ Admin Paneli
- Tüm kullanıcıları görüntüleme
- Kullanıcı istatistikleri (Toplam, Admin, Normal kullanıcı)
- Kullanıcı rollerini gösterme
- Oluşturulma tarihlerini görme

### ➕ Kullanıcı Ekleme
- Kullanıcı adı ve şifre belirleme
- Rol seçimi (Admin / Kullanıcı)
- Otomatik şifre hash'leme (bcrypt)
- Kullanıcı adı tekil kontrolü
- Minimum 6 karakter şifre zorunluluğu

### 🗑️ Kullanıcı Silme
- Tek tıkla kullanıcı silme
- Silme onay modalı
- Kendi hesabını silme engeli
- Güvenli veri silme

---

## 📋 Kullanım Kılavuzu

### Admin Paneline Erişim

1. **Admin olarak giriş yapın**
   - Kullanıcı adı: `admin` veya `emre`
   - Şifreler: `admin123` veya `ema2014`

2. **Dashboard'da "👤 Kullanıcılar" butonuna tıklayın**
   - Bu buton sadece admin kullanıcılara görünür
   - Normal kullanıcılar bu butonu göremez

3. **Kullanıcı Yönetimi sayfası açılır**
   - URL: http://localhost:3000/admin/users

---

## ➕ Yeni Kullanıcı Ekleme

### Adım Adım:

1. **"+ Yeni Kullanıcı Ekle" butonuna tıklayın**

2. **Modal açılır, bilgileri girin:**
   - **Kullanıcı Adı**: Benzersiz bir kullanıcı adı
   - **Şifre**: En az 6 karakter
   - **Rol**: 
     - `Kullanıcı`: Normal kullanıcı (veri girişi yapabilir)
     - `Admin`: Yönetici (kullanıcı yönetimi + veri girişi)

3. **"Ekle" butonuna tıklayın**

4. **Başarılı mesajı görünür** ✅
   - "Kullanıcı başarıyla eklendi!"
   - Modal otomatik kapanır
   - Liste yenilenir

### Örnek Kullanım:

```
Kullanıcı Adı: ayse
Şifre: ayse2025
Rol: Kullanıcı
```

**Sonuç**: `ayse` kullanıcısı sisteme eklenir ve hemen giriş yapabilir.

---

## 🗑️ Kullanıcı Silme

### Adım Adım:

1. **Kullanıcı listesinde silmek istediğiniz kullanıcıyı bulun**

2. **"Sil" butonuna tıklayın**
   - Kendi hesabınızın yanındaki "Sil" butonu devre dışıdır

3. **Onay modalı açılır**
   - "Bu işlem geri alınamaz!"
   - Kullanıcı adı gösterilir

4. **"Evet, Sil" butonuna tıklayın**

5. **Kullanıcı silinir** ✅
   - "Kullanıcı silindi!" mesajı görünür
   - Liste yenilenir

### ⚠️ Dikkat:
- **Kendi hesabınızı silemezsiniz**
- **Silme işlemi geri alınamaz**
- **Silinen kullanıcının tüm oturumları sonlanır**

---

## 🔒 Güvenlik Özellikleri

### 1. Rol Tabanlı Erişim Kontrolü
- Admin paneli sadece `role = admin` kullanıcılara açık
- Middleware seviyesinde kontrol
- URL'yi manuel yazsanız bile erişemezsiniz

### 2. API Endpoint Koruması
- Tüm `/api/admin/*` endpoint'leri JWT token kontrolü yapar
- Admin rolü zorunluluğu
- Yetkisiz erişim 403 Forbidden döner

### 3. Şifre Güvenliği
- Şifreler bcrypt ile hash'lenir (10 rounds)
- Düz metin şifre asla saklanmaz
- Minimum 6 karakter zorunluluğu

### 4. Kullanıcı Adı Tekil Kontrolü
- Aynı kullanıcı adı iki kez eklenemez
- Veritabanı seviyesinde UNIQUE constraint
- API seviyesinde ekstra kontrol

---

## 📊 İstatistikler Kartları

Admin panelinde 3 istatistik kartı görürsünüz:

1. **Toplam Kullanıcı**
   - Sistemdeki tüm kullanıcı sayısı

2. **Admin Sayısı**
   - Yönetici yetkisine sahip kullanıcılar

3. **Kullanıcı Sayısı**
   - Normal kullanıcı sayısı

---

## 🛠️ Teknik Detaylar

### API Endpoint'leri

#### 1. GET /api/auth/me
- **Açıklama**: Mevcut oturumdaki kullanıcı bilgisini döner
- **Yetki**: Giriş yapmış herhangi bir kullanıcı
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "emre",
    "role": "admin"
  }
}
```

#### 2. GET /api/admin/users
- **Açıklama**: Tüm kullanıcıları listeler
- **Yetki**: Sadece admin
- **Response**:
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "username": "admin",
      "role": "user",
      "created_at": "2025-01-27T..."
    }
  ]
}
```

#### 3. POST /api/admin/users
- **Açıklama**: Yeni kullanıcı ekler
- **Yetki**: Sadece admin
- **Request Body**:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "user"
}
```
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "newuser",
    "role": "user",
    "created_at": "2025-01-27T..."
  }
}
```

#### 4. DELETE /api/admin/users/[id]
- **Açıklama**: Kullanıcı siler
- **Yetki**: Sadece admin
- **Response**:
```json
{
  "success": true
}
```

### Veritabanı Şeması

Kullanıcılar `app_users` tablosunda saklanır:

```sql
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 UI Bileşenleri

### Kullanılan shadcn/ui Bileşenleri:
- `Card` - Kart görünümü
- `Button` - Butonlar
- `Input` - Form girişleri
- `Select` - Dropdown seçici
- `Dialog` - Modal pencereler
- `Table` - Kullanıcı listesi tablosu

### Renkler ve Badge'ler:
- **Admin Badge**: Mor (purple)
- **Kullanıcı Badge**: Gri (slate)
- **Siz Badge**: Mavi (blue)

---

## 🚧 Sınırlamalar ve Gelecek Özellikler

### Mevcut Sınırlamalar:
- ❌ Kullanıcı düzenleme yok (sadece ekleme/silme)
- ❌ Toplu işlemler yok (multi-select)
- ❌ Kullanıcı arama/filtreleme yok
- ❌ Sayfalama yok (tüm kullanıcılar tek sayfada)

### Gelecek Özellikler (Opsiyonel):
- ✨ Kullanıcı düzenleme (şifre sıfırlama, rol değiştirme)
- ✨ Arama ve filtreleme
- ✨ Sayfalama (pagination)
- ✨ Kullanıcı aktivite logu
- ✨ Toplu silme
- ✨ CSV export

---

## 📸 Ekran Görüntüleri Açıklaması

### Admin Panel Görünümü:
```
┌─────────────────────────────────────────────────┐
│  [LOGO] Kullanıcı Yönetimi       [Ana Sayfa] [Çıkış] │
├─────────────────────────────────────────────────┤
│  Kullanıcılar                [+ Yeni Kullanıcı]  │
│  ─────────────────────────────────────────────  │
│  | Kullanıcı Adı | Rol      | Tarih    | İşlem | │
│  | admin         | Kullanıcı| 27.01... | [Sil] | │
│  | emre          | Admin    | 27.01... | [Sil] | │
│  | emine         | Kullanıcı| 27.01... | [Sil] | │
└─────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Toplam: 3    │ │ Admin: 1     │ │ Kullanıcı: 2 │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🧪 Test Senaryoları

### Test 1: Admin Paneline Erişim
1. Admin olarak giriş yap
2. "👤 Kullanıcılar" butonunu gör
3. Butona tıkla
4. Admin paneli açılır ✅

### Test 2: Normal Kullanıcı Paneli Görememeli
1. Normal kullanıcı olarak giriş yap
2. "👤 Kullanıcılar" butonu görünmemeli ✅
3. URL'yi manuel yazsan bile 403 hata almalı ✅

### Test 3: Kullanıcı Ekleme
1. Admin panelinde "+ Yeni Kullanıcı Ekle" tıkla
2. Bilgileri gir: `test` / `test123` / `user`
3. "Ekle" butonuna bas
4. Başarı mesajı görünür ✅
5. Listede yeni kullanıcı görünür ✅

### Test 4: Kullanıcı Silme
1. Listede `test` kullanıcısını bul
2. "Sil" butonuna tıkla
3. Onay modalında "Evet, Sil" de
4. Kullanıcı listeden kaldırılır ✅

### Test 5: Kendi Hesabını Silememeli
1. Kendi kullanıcı adının yanındaki "Sil" butonu disabled ✅
2. Tıklayamazsın ✅

---

## 🎯 Başarı Kriterleri

✅ Admin paneli sadece adminlere açık
✅ Kullanıcı ekleme çalışıyor
✅ Kullanıcı silme çalışıyor
✅ Şifreler güvenli hash'leniyor
✅ Rol kontrolü yapılıyor
✅ UI responsive ve kullanıcı dostu
✅ Hata mesajları açıklayıcı

---

## 🆘 Sorun Giderme

### "Yetkisiz erişim" Hatası
**Sebep**: Admin rolünüz yok
**Çözüm**: Admin hesabıyla giriş yapın (emre/ema2014)

### "Bu kullanıcı adı zaten kullanılıyor"
**Sebep**: Aynı kullanıcı adı mevcut
**Çözüm**: Farklı bir kullanıcı adı seçin

### "Şifre en az 6 karakter olmalı"
**Sebep**: Girdiğiniz şifre 6 karakterden kısa
**Çözüm**: Daha uzun bir şifre girin

### Admin Paneli Açılmıyor
**Sebep**: Server çalışmıyor veya route tanımlı değil
**Çözüm**: 
1. `npm run dev` komutuyla server'i başlatın
2. Tarayıcı konsolunu kontrol edin (F12)

---

## 📝 Özet

Admin Kullanıcı Yönetimi sistemi başarıyla eklendi! 

**Artık yapabilecekleriniz:**
- ✅ Tüm kullanıcıları görüntüleme
- ✅ Yeni kullanıcı ekleme (admin veya normal)
- ✅ Kullanıcı silme
- ✅ İstatistikleri görme

**Güvenlik:**
- 🔒 Sadece adminler erişebilir
- 🔒 Middleware koruması
- 🔒 API yetkilendirmesi
- 🔒 Şifre hash'leme

**Başarılı kullanımlar! 🎉**
