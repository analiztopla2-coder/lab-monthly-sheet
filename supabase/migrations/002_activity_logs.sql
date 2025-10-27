-- ============================================
-- Kullanıcı Aktivite Logları Tablosu
-- ============================================
-- Bu tabloyu Supabase Dashboard'da çalıştırın:
-- https://supabase.com/dashboard
-- Sol menü: SQL Editor → New Query
-- ============================================

-- Aktivite logları tablosu
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeks oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);

-- ============================================
-- Örnek kullanım:
-- ============================================
-- INSERT INTO user_activity_logs (user_id, username, action, details, ip_address)
-- VALUES ('user-uuid-here', 'emre', 'login', 'Başarılı giriş', '127.0.0.1');

-- Tüm logları görüntüle
-- SELECT * FROM user_activity_logs ORDER BY created_at DESC LIMIT 100;

-- Belirli bir kullanıcının logları
-- SELECT * FROM user_activity_logs WHERE username = 'emre' ORDER BY created_at DESC;

-- Son 24 saatteki aktiviteler
-- SELECT * FROM user_activity_logs WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC;
