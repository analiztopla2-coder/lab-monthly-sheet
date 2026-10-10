-- Atomic global parameter reorder (sort_order only). Does NOT touch monthly_sheets.

BEGIN;

CREATE OR REPLACE FUNCTION public.reorder_lab_parameters(
  p_expected_ids uuid[],
  p_ordered_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_len int;
  v_current uuid[];
  v_slots int[];
  i int;
  v_min_sort int;
BEGIN
  v_len := array_length(p_expected_ids, 1);
  IF v_len IS NULL OR v_len = 0 THEN
    RAISE EXCEPTION 'invalid_order: empty arrays' USING ERRCODE = '22000';
  END IF;

  IF array_length(p_ordered_ids, 1) IS DISTINCT FROM v_len THEN
    RAISE EXCEPTION 'invalid_order: length mismatch' USING ERRCODE = '22000';
  END IF;

  IF (SELECT count(*) FROM unnest(p_expected_ids) AS x(id)) <>
     (SELECT count(DISTINCT id) FROM unnest(p_expected_ids) AS x(id)) THEN
    RAISE EXCEPTION 'invalid_order: duplicate in expected' USING ERRCODE = '22000';
  END IF;

  IF (SELECT count(*) FROM unnest(p_ordered_ids) AS x(id)) <>
     (SELECT count(DISTINCT id) FROM unnest(p_ordered_ids) AS x(id)) THEN
    RAISE EXCEPTION 'invalid_order: duplicate in ordered' USING ERRCODE = '22000';
  END IF;

  IF (
    SELECT count(*) FROM (
      SELECT unnest(p_expected_ids) AS id
      EXCEPT
      SELECT unnest(p_ordered_ids) AS id
    ) t
  ) > 0 THEN
    RAISE EXCEPTION 'invalid_order: id set mismatch' USING ERRCODE = '22000';
  END IF;

  IF (SELECT count(*) FROM lab_parameters WHERE id = ANY(p_expected_ids)) <> v_len THEN
    RAISE EXCEPTION 'invalid_order: unknown parameter id' USING ERRCODE = '22000';
  END IF;

  PERFORM id FROM lab_parameters WHERE id = ANY(p_expected_ids) FOR UPDATE;

  SELECT array_agg(id ORDER BY sort_order ASC, id ASC)
  INTO v_current
  FROM lab_parameters
  WHERE id = ANY(p_expected_ids);

  IF v_current IS DISTINCT FROM p_expected_ids THEN
    RAISE EXCEPTION 'stale_order' USING ERRCODE = '40001';
  END IF;

  SELECT array_agg(sort_order ORDER BY sort_order ASC, id ASC)
  INTO v_slots
  FROM lab_parameters
  WHERE id = ANY(p_expected_ids);

  SELECT COALESCE(min(sort_order), 0) - v_len - 1 INTO v_min_sort FROM lab_parameters;

  FOR i IN 1..v_len LOOP
    UPDATE lab_parameters
    SET sort_order = v_min_sort - i, updated_at = NOW()
    WHERE id = p_ordered_ids[i];
  END LOOP;

  FOR i IN 1..v_len LOOP
    UPDATE lab_parameters
    SET sort_order = v_slots[i], updated_at = NOW()
    WHERE id = p_ordered_ids[i];
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_lab_parameters(uuid[], uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reorder_lab_parameters(uuid[], uuid[]) FROM anon;
REVOKE ALL ON FUNCTION public.reorder_lab_parameters(uuid[], uuid[]) FROM authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.reorder_lab_parameters(uuid[], uuid[]) TO service_role;
  END IF;
END $$;

COMMIT;
