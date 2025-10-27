# 🚀 LAB MONTHLY SHEET - Hızlı Başlangıç

## ✅ Kurulum Tamamlandı!

Tüm dosyalar başarıyla oluşturuldu ve bağımlılıklar yüklendi.

## 📋 Sonraki Adımlar

### 1. Supabase Migration'ı Çalıştır

**ÖNEMLI**: Veritabanı tablolarını oluşturmak için bu adım zorunludur!

#### Seçenek A: Supabase Dashboard (Tavsiye Edilen)

1. https://supabase.com/dashboard → Projenizi seçin
2. Sol menüden **SQL Editor** tıklayın
3. **New Query** butonuna tıklayın
4. `supabase/migrations/001_init.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. **Run** butonuna tıklayın
6. ✅ "Success" mesajı görmelisiniz

#### Seçenek B: Manuel SQL Kopyala-Yapıştır

```sql
-- Bu SQL'i Supabase Dashboard -> SQL Editor'a yapıştırın:
-- (supabase/migrations/001_init.sql dosyasındaki içeriği)

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  pass_hash text not null,
  role text not null default 'user',
  created_at timestamptz default now()
);

create table if not exists monthly_sheets (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null,
  rows jsonb not null,
  created_by uuid references app_users(id),
  updated_at timestamptz default now(),
  unique(year, month)
);

create index if not exists idx_monthly_sheets_year_month on monthly_sheets(year, month);
create index if not exists idx_app_users_username on app_users(username);
```

### 2. Seed Çalıştır (İlk Kullanıcı ve Ay Oluştur)

Development server çalışırken, **yeni bir PowerShell terminali** açın ve:

```powershell
cd c:\Users\ONUR\Desktop\lab-gun
npm run seed
```

Bu komut:
- ✅ `admin` / `admin123` kullanıcısı oluşturur
- ✅ Mevcut ay için boş bir sheet oluşturur

### 3. Uygulamayı Aç

Tarayıcınızda açın: **http://localhost:3000**

**Giriş Bilgileri:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

> ⚠️ İlk girişten sonra şifrenizi değiştirin!

## 🎯 Kullanım

### Ana Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📊 **Veri Girişi** | Hücrelere tıklayıp veri girin, **Kaydet** butonuna basın |
| 📅 **Ay Değiştir** | Üstteki Yıl/Ay seçicileri ile geçiş yapın |
| ➕ **Yeni Ay Oluştur** | Seçili ay/yıl için yeni boş sayfa oluşturun |
| 📜 **Geçmiş** | Önceki ayların verilerini görüntüleyin |
| 📥 **XLSX İndir** | Excel formatında (.xlsx) tablo indirin |
| 🖨️ **Yazdır/PDF** | Tarayıcı print ile PDF oluşturun |
| 🔐 **Şifre Değiştir** | Login sayfasından güvenli şifre güncellemesi |

### Parametreler (13 Satır)

1. SU SERTLİĞİ
2. TUZ SERTLİĞİ
3. TUZ YOĞUNLUĞU
4. TUZ PH
5. TUZ İLETKENLİĞİ
6. SODA YOĞUNLUK KONTROLÜ
7. HER BASILACAK TUZ İLETKENLİĞİ
8. HER BASILACAK TUZ SERTLİĞİ
9. A.ASİT
10. KOSTİK
11. BOYA DEĞİŞİMİ
12. PEROKSİT
13. PH

## 🔧 Teknik Detaylar

### Stack
- ⚡ Next.js 14 (App Router)
- 🎨 TailwindCSS
- 🔐 JWT + bcryptjs
- 🗄️ Supabase (PostgreSQL)
- 📊 SheetJS (xlsx)

### Önemli Dosyalar
```
app/
  ├── page.tsx              # Dashboard (ana sayfa)
  ├── (auth)/login/page.tsx # Login sayfası
  ├── components/
  │   └── MonthTable.tsx    # Tablo bileşeni
  └── api/
      ├── auth/             # Kimlik doğrulama
      ├── seed/             # Database seed
      ├── sheet/            # CRUD işlemleri
      └── sheets/           # Liste

lib/
  ├── auth.ts               # JWT & şifreleme
  ├── rows.ts               # Satır tanımları
  └── supabase-server.ts    # DB client

supabase/migrations/
  └── 001_init.sql          # Database şeması
```

## 🐛 Sorun Giderme

### Seed Çalışmıyor?
```powershell
# 1. Dev server çalıştığından emin olun
npm run dev

# 2. Yeni terminalde:
npm run seed
```

### Migration Hatası?
- Supabase Dashboard'da SQL Editor'ı kullanın
- `.env.local` dosyasındaki URL/KEY'leri kontrol edin

### TypeScript Lint Hataları?
- Normal, çalışma zamanında sorun olmaz
- `npm install` tekrar deneyin

## 📱 Responsive & Print

✅ **Mobil Uyumlu**: Tüm ekran boyutlarında çalışır
✅ **Print Optimize**: Yazdırmada düzenli görünüm
✅ **Sticky Headers**: Kaydırırken başlıklar sabit

## 🔒 Güvenlik

✅ JWT HttpOnly Cookies
✅ bcrypt Şifre Hash
✅ Rate Limiting (5 deneme/15dk)
✅ Supabase Service Role Koruması

## 🚀 Production Deploy

### Vercel
```bash
vercel deploy
```

Environment variables ekleyin:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `APP_JWT_SECRET`
- `APP_DEFAULT_ADMIN`
- `APP_DEFAULT_PASSWORD`

---

## 📞 Destek

Detaylı bilgi için: `README.md`

**Başarılar! 🎉**
