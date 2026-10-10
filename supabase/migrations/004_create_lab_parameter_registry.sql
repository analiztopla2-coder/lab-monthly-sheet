-- Safe registry-only migration: NO touches to monthly_sheets or rows JSONB.
-- Idempotent CREATE + INSERT for 13 canonical legacy parameters (stable UUIDs).

BEGIN;

CREATE TABLE IF NOT EXISTS lab_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  effective_from DATE NOT NULL DEFAULT '2000-01-01',
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES app_users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES app_users(id)
);

CREATE INDEX IF NOT EXISTS idx_lab_parameters_sort_order ON lab_parameters (sort_order);
CREATE INDEX IF NOT EXISTS idx_lab_parameters_effective_from ON lab_parameters (effective_from);
CREATE INDEX IF NOT EXISTS idx_lab_parameters_effective_to ON lab_parameters (effective_to) WHERE effective_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lab_parameters_name_normalized ON lab_parameters (name_normalized);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_parameters_unique_active_name
  ON lab_parameters (name_normalized)
  WHERE deleted_at IS NULL AND effective_to IS NULL;

-- effective_from 2000-01-01: before oldest sheet (2025-01); effective_to NULL for all legacy rows.
INSERT INTO lab_parameters (id, name, name_normalized, sort_order, effective_from, effective_to)
VALUES
  ('11111111-1111-4111-8111-111111110001', 'SU SERTLİĞİ', 'su sertliği', 1, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110002', 'TUZ SERTLİĞİ', 'tuz sertliği', 2, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110003', 'TUZ YOĞUNLUĞU', 'tuz yoğunluğu', 3, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110004', 'TUZ PH', 'tuz ph', 4, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110005', 'TUZ İLETKENLİĞİ', 'tuz iletkenliği', 5, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110006', 'SODA YOĞUNLUK KONTROLÜ', 'soda yoğunluk kontrolü', 6, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110007', 'HER BASILACAK TUZ İLETKENLİĞİ', 'her basılacak tuz iletkenliği', 7, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110008', 'HER BASILACAK TUZ SERTLİĞİ', 'her basılacak tuz sertliği', 8, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110009', 'A.ASİT', 'a.asit', 9, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110010', 'KOSTİK', 'kostik', 10, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110011', 'BOYA DEĞİŞİMİ', 'boya değişimi', 11, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110012', 'PEROKSİT', 'peroksit', 12, '2000-01-01', NULL),
  ('11111111-1111-4111-8111-111111110013', 'PH', 'ph', 13, '2000-01-01', NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;
