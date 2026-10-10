-- Dynamic lab parameters (row definitions) + migrate existing sheet row keys from names to UUIDs
-- Idempotent: safe to run more than once

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

-- One active definition per normalized name (soft-deleted rows excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lab_parameters_unique_active_name
  ON lab_parameters (name_normalized)
  WHERE deleted_at IS NULL AND effective_to IS NULL;

-- Seed legacy fixed rows with stable UUIDs (ON CONFLICT DO NOTHING)
INSERT INTO lab_parameters (id, name, name_normalized, sort_order, effective_from)
VALUES
  ('11111111-1111-4111-8111-111111110001', 'SU SERTLİĞİ', 'su sertliği', 1, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110002', 'TUZ SERTLİĞİ', 'tuz sertliği', 2, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110003', 'TUZ YOĞUNLUĞU', 'tuz yoğunluğu', 3, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110004', 'TUZ PH', 'tuz ph', 4, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110005', 'TUZ İLETKENLİĞİ', 'tuz iletkenliği', 5, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110006', 'SODA YOĞUNLUK KONTROLÜ', 'soda yoğunluk kontrolü', 6, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110007', 'HER BASILACAK TUZ İLETKENLİĞİ', 'her basılacak tuz iletkenliği', 7, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110008', 'HER BASILACAK TUZ SERTLİĞİ', 'her basılacak tuz sertliği', 8, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110009', 'A.ASİT', 'a.asit', 9, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110010', 'KOSTİK', 'kostik', 10, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110011', 'BOYA DEĞİŞİMİ', 'boya değişimi', 11, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110012', 'PEROKSİT', 'peroksit', 12, '2000-01-01'),
  ('11111111-1111-4111-8111-111111110013', 'PH', 'ph', 13, '2000-01-01')
ON CONFLICT (id) DO NOTHING;

-- Migrate monthly_sheets.rows: label keys -> parameter UUID keys (skip already-migrated UUID keys)
DO $$
DECLARE
  sheet_rec RECORD;
  new_rows JSONB;
  entry_key TEXT;
  entry_val JSONB;
  param_id UUID;
  legacy_name TEXT;
BEGIN
  FOR sheet_rec IN SELECT id, rows FROM monthly_sheets LOOP
    new_rows := '{}'::JSONB;

    FOR entry_key, entry_val IN SELECT * FROM jsonb_each(sheet_rec.rows) LOOP
      IF entry_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        new_rows := new_rows || jsonb_build_object(entry_key, entry_val);
        CONTINUE;
      END IF;

      legacy_name := entry_key;
      SELECT lp.id INTO param_id FROM lab_parameters lp WHERE lp.name = legacy_name LIMIT 1;

      IF param_id IS NOT NULL THEN
        new_rows := new_rows || jsonb_build_object(param_id::TEXT, entry_val);
      ELSE
        -- Unknown legacy key: preserve under original key
        new_rows := new_rows || jsonb_build_object(entry_key, entry_val);
      END IF;
    END LOOP;

    IF new_rows IS DISTINCT FROM sheet_rec.rows THEN
      UPDATE monthly_sheets SET rows = new_rows, updated_at = NOW() WHERE id = sheet_rec.id;
    END IF;
  END LOOP;
END $$;
