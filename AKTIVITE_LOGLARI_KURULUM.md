# Aktivite Logları - Kurulum Talimatları

## 1. Supabase Migration Çalıştırma

Aktivite logları için veritabanı tablosunu oluşturmak için şu adımları izleyin:

### Supabase Dashboard'dan:

1. https://supabase.com/dashboard adresine gidin
2. `lab-monthly-sheet` projenizi seçin
3. Sol menüden **SQL Editor** seçeneğine tıklayın
4. **New Query** butonuna tıklayın
5. Aşağıdaki SQL kodunu yapıştırın ve **Run** butonuna tıklayın:

```sql
-- Aktivite logları tablosu
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id 
  ON user_activity_logs(user_id);
  
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at 
  ON user_activity_logs(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action 
  ON user_activity_logs(action);

-- Örnek sorgular:
-- SELECT * FROM user_activity_logs ORDER BY created_at DESC LIMIT 50;
-- SELECT * FROM user_activity_logs WHERE action = 'login' ORDER BY created_at DESC;
-- SELECT username, COUNT(*) as login_count FROM user_activity_logs WHERE action = 'login' GROUP BY username;
```

6. Başarılyla tamamlandığında **Success** mesajı göreceksiniz

## 2. Aktivite Türleri

Sistem şu aktiviteleri loglar:

| Aktivite | Açıklama | Renk |
|----------|----------|------|
| `login` | Başarılı giriş | Yeşil |
| `logout` | Çıkış | Gri |
| `login_failed` | Başarısız giriş denemesi | Kırmızı |
| `password_change` | Şifre değişikliği | Mavi |
| `user_created` | Yeni kullanıcı oluşturma (admin) | Mor |
| `user_updated` | Kullanıcı güncelleme (admin) | Cyan |
| `user_deleted` | Kullanıcı silme (admin) | Turuncu |
| `sheet_created` | Yeni ay oluşturma | İndigo |
| `sheet_updated` | Veri güncelleme | Sarı |
| `sheet_viewed` | Veri görüntüleme | Gri-mavi |

## 3. Eklenen Özellikler

### API Endpoints:
- **GET** `/api/admin/logs` - Aktivite loglarını getir (sadece admin)
  - Query parametreleri:
    - `limit`: Sayfa başına kayıt (varsayılan: 50)
    - `offset`: Başlangıç noktası (varsayılan: 0)
    - `action`: Filtreleme için aktivite türü (opsiyonel)

### Helper Fonksiyonlar:
- `lib/activity-logger.ts` - Log kaydetme fonksiyonları
  - `logActivity()` - Aktivite logla
  - `ACTION_LABELS` - Türkçe etiketler
  - `ACTION_COLORS` - Renk şemaları

### Loglanan Endpoint'ler:
- ✅ Login (başarılı ve başarısız)
- ✅ Logout
- ✅ Kullanıcı oluşturma (admin)
- ✅ Kullanıcı güncelleme (admin) - şifre ve/veya rol değişikliği
- ✅ Kullanıcı silme (admin)
- ⏳ Şifre değiştirme (gelecekte)
- ⏳ Sheet işlemleri (gelecekte)

## 4. Admin Panel Özellikleri

`/admin/users` sayfasında:
- ✅ Kullanıcı CRUD işlemleri (Oluştur, Düzenle, Sil)
  - ✅ Yeni kullanıcı ekleme
  - ✅ Kullanıcı düzenleme (şifre ve rol değiştirme)
  - ✅ Kullanıcı silme
- ✅ Son 20 aktivite logu görüntüleme
- ✅ Aktivite türüne göre filtreleme
- ✅ Sayfalama (önceki/sonraki)
- ✅ IP adresi ve zaman bilgileri
- ✅ Renk kodlu aktivite etiketleri
- ✅ Detay bilgisi (hangi kullanıcı eklendi/silindi/güncellendi vb.)

## 5. Test Senaryosu

Migration'ı çalıştırdıktan sonra test edin:

1. Uygulamayı başlatın: `npm run dev`
2. Login sayfasına gidin: http://localhost:3000/login
3. Yanlış şifre ile giriş yapın → `login_failed` logu oluşur
4. Doğru şifre ile admin olarak giriş yapın → `login` logu oluşur
5. Admin paneline gidin: http://localhost:3000/admin/users
6. Aktivite Logları bölümünde kayıtları görün
7. **Yeni kullanıcı ekleyin** → `user_created` logu oluşur
8. **Kullanıcı düzenleyin** (şifre veya rol değiştirin) → `user_updated` logu oluşur
9. **Kullanıcı silin** → `user_deleted` logu oluşur
10. Çıkış yapın → `logout` logu oluşur

## 6. Örnek Log Verileri

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "abc123...",
  "username": "admin",
  "action": "user_created",
  "details": "Yeni kullanıcı: testuser (user)",
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

## 7. Güvenlik Notları

- Loglar sadece **admin** kullanıcılar tarafından görülebilir
- IP adresi ve User-Agent bilgileri kaydedilir
- Şifreler veya hassas veriler **asla** loglanmaz
- Log hatası uygulamayı durdurmaz (try-catch ile korunmuş)
- Otomatik CASCADE delete (kullanıcı silindiğinde logları da silinir)

## 8. İleriye Dönük Geliştirmeler

- [ ] Sheet oluşturma/güncelleme logları
- [ ] Log export (CSV/Excel)
- [ ] Gelişmiş filtreleme (tarih aralığı)
- [ ] Kullanıcı bazlı log görüntüleme
- [ ] Grafik ve istatistikler
