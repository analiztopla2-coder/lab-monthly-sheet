-- ============================================
-- EMRE Admin Kullanıcısı SQL Komutu
-- ============================================
-- 
-- Bu SQL komutunu Supabase Dashboard'da çalıştırın:
-- https://supabase.com/dashboard
-- Sol menü: SQL Editor → New Query
-- 
-- Kullanıcı Bilgileri:
-- - Kullanıcı: emre
-- - Şifre: ema2014
-- - Rol: admin
-- ============================================

INSERT INTO app_users (username, pass_hash, role)
VALUES ('emre', '$2a$10$IG9kuII7HKh4/c41AzsFaOEeRrWLBRIj91DGE0pk6qbDvSU0uQ89O', 'admin')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- Çalıştırdıktan sonra kontrol edin:
-- ============================================

SELECT username, role, created_at 
FROM app_users 
WHERE username = 'emre';

-- Sonuç görmelisiniz: emre | admin | [tarih]
