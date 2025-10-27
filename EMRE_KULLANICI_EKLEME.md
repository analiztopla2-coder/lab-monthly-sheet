# 👤 EMRE Admin Kullanıcısı - Oluşturma Talimatları

## ✅ Kullanıcı Bilgileri

- **Kullanıcı Adı**: `emre`
- **Şifre**: `ema2014`
- **Rol**: `admin` (yönetici)
- **Hash**: `$2a$10$IG9kuII7HKh4/c41AzsFaOEeRrWLBRIj91DGE0pk6qbDvSU0uQ89O`

---

## 📝 Supabase'e Ekleme Adımları

### 1. Supabase Dashboard'a Gidin
- https://supabase.com/dashboard
- Projenizi seçin: https://jlkoeiwpdrkumjxekkxi.supabase.co

### 2. SQL Editor'ı Açın
- Sol menüden **SQL Editor** seçin
- **New Query** butonuna tıklayın

### 3. Aşağıdaki SQL Komutunu Kopyalayıp Yapıştırın

```sql
INSERT INTO app_users (username, pass_hash, role)
VALUES ('emre', '$2a$10$IG9kuII7HKh4/c41AzsFaOEeRrWLBRIj91DGE0pk6qbDvSU0uQ89O', 'admin')
ON CONFLICT (username) DO NOTHING;
```

### 4. SQL Komutunu Çalıştırın
- **Run** (veya Ctrl+Enter) butonuna basın
- "Success. No rows returned" mesajı görürseniz başarılı!

---

## 🔐 Giriş Yapma

SQL komutu çalıştırıldıktan sonra:

1. http://localhost:3000/login adresine gidin
2. Aşağıdaki bilgilerle giriş yapın:
   - **Kullanıcı Adı**: `emre`
   - **Şifre**: `ema2014`
3. Başarılı giriş sonrası dashboard'a yönlendirileceksiniz

---

## ⚡ Hızlı Kopyala-Yapıştır

**Tek satır SQL (Supabase SQL Editor için):**

```sql
INSERT INTO app_users (username, pass_hash, role) VALUES ('emre', '$2a$10$IG9kuII7HKh4/c41AzsFaOEeRrWLBRIj91DGE0pk6qbDvSU0uQ89O', 'admin') ON CONFLICT (username) DO NOTHING;
```

---

## 📊 Tüm Kullanıcılar

Sistemde şu kullanıcılar mevcut olacak:

| Kullanıcı | Şifre      | Rol   | Durum      |
|-----------|------------|-------|------------|
| admin     | admin123   | user  | ✅ Mevcut  |
| emine     | eminelab   | user  | ✅ Mevcut  |
| emre      | ema2014    | admin | 🆕 Yeni    |

---

## 🔒 Güvenlik Notları

- ⚠️ İlk girişte şifrenizi değiştirmeniz önerilir
- 🔐 Admin rolü ile tüm yetkilere sahipsiniz
- 🚨 Şifrenizi kimseyle paylaşmayın
- ✅ Güçlü şifre önerileri: En az 8 karakter, büyük/küçük harf, rakam

---

## ✅ Kontrol Listesi

- [ ] Supabase Dashboard'a giriş yaptım
- [ ] SQL Editor'ı açtım
- [ ] SQL komutunu kopyaladım
- [ ] SQL komutunu yapıştırdım
- [ ] Run butonuna bastım
- [ ] "Success" mesajını gördüm
- [ ] Login sayfasına gittim
- [ ] emre/ema2014 ile giriş yaptım
- [ ] Dashboard'a erişebildim

**Başarılı! 🎉**
