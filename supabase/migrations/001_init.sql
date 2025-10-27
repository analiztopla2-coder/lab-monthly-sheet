-- Lab Monthly Sheet - Database Schema
-- Basit uygulama içi kullanıcılar (Supabase Auth KULLANILMIYOR)

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  pass_hash text not null,
  role text not null default 'user',
  created_at timestamptz default now()
);

-- Aylık sayfa (bir ay = bir kayıt)
create table if not exists monthly_sheets (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null, -- 0..11 (JavaScript Date.getMonth() uyumlu)
  rows jsonb not null, -- { "SU SERTLİĞİ": ["","",...""], ... }
  created_by uuid references app_users(id),
  updated_at timestamptz default now(),
  unique(year, month)
);

-- İndeks ekleyelim
create index if not exists idx_monthly_sheets_year_month on monthly_sheets(year, month);
create index if not exists idx_app_users_username on app_users(username);

-- Varsayılan satır etiketleri:
-- [ "SU SERTLİĞİ", "TUZ SERTLİĞİ", "TUZ YOĞUNLUĞU", "TUZ PH",
--   "TUZ İLETKENLİĞİ", "SODA YOĞUNLUK KONTROLÜ",
--   "HER BASILACAK TUZ İLETKENLİĞİ", "HER BASILACAK TUZ SERTLİĞİ",
--   "A.ASİT", "KOSTİK", "BOYA DEĞİŞİMİ", "PEROKSİT", "PH" ]
