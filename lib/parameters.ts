import { getSupabaseAdmin } from "./supabase-server";
import { getDaysInMonth, type RowsJson } from "./rows";
import type { LabParameter } from "./parameter-types";

export type { LabParameter } from "./parameter-types";

export interface LabParameterRow {
  id: string;
  name: string;
  name_normalized: string;
  sort_order: number;
  effective_from: string;
  effective_to: string | null;
  deleted_at: string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isParameterIdKey(key: string): boolean {
  return UUID_RE.test(key);
}

export function normalizeParameterName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

/** First calendar day of month (JS month 0–11) as YYYY-MM-DD */
export function monthStartDate(year: number, month: number): string {
  const y = year;
  const m = String(month + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Last calendar day of month (JS month 0–11) as YYYY-MM-DD */
export function monthEndDate(year: number, month: number): string {
  const days = getDaysInMonth(year, month);
  const y = year;
  const m = String(month + 1).padStart(2, "0");
  const d = String(days).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toApiParameter(row: {
  id: string;
  name: string;
  sort_order: number;
}): LabParameter {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

/**
 * Parameters effective for a given year/month (historical view).
 */
export async function fetchParametersEffectiveForMonth(
  year: number,
  month: number
): Promise<LabParameterRow[]> {
  const periodStart = monthStartDate(year, month);
  const periodEnd = monthEndDate(year, month);

  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select(
      "id, name, name_normalized, sort_order, effective_from, effective_to, deleted_at"
    )
    .lte("effective_from", periodEnd)
    .or(`effective_to.is.null,effective_to.gt.${periodStart}`)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as LabParameterRow[];
}

export async function fetchParametersByIds(
  ids: string[]
): Promise<LabParameterRow[]> {
  if (ids.length === 0) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select(
      "id, name, name_normalized, sort_order, effective_from, effective_to, deleted_at"
    )
    .in("id", ids)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as LabParameterRow[];
}

/**
 * Union of month-effective parameters and any parameter IDs stored on the sheet
 * (preserves historical rows after deactivation).
 */
export async function resolveParametersForSheet(
  year: number,
  month: number,
  sheetRows: RowsJson
): Promise<LabParameter[]> {
  const effective = await fetchParametersEffectiveForMonth(year, month);
  const byId = new Map(effective.map((p) => [p.id, p]));

  const extraIds = Object.keys(sheetRows || {}).filter(
    (key) => isParameterIdKey(key) && !byId.has(key)
  );

  if (extraIds.length > 0) {
    const extras = await fetchParametersByIds(extraIds);
    for (const p of extras) {
      byId.set(p.id, p);
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => toApiParameter(p));
}

export function buildEmptyRows(
  parameterIds: string[],
  days: number
): RowsJson {
  const rows: RowsJson = {};
  for (const id of parameterIds) {
    rows[id] = Array.from({ length: days }, () => "");
  }
  return rows;
}

/**
 * Ensures each visible parameter has a day array; preserves extra keys in stored JSON.
 */
export function mergeRowsForParameters(
  stored: RowsJson,
  parameters: LabParameter[],
  days: number
): RowsJson {
  const merged: RowsJson = { ...(stored || {}) };

  for (const param of parameters) {
    const existing = merged[param.id] || [];
    const next = Array.from({ length: days }, (_, i) => existing[i] ?? "");
    merged[param.id] = next;
  }

  return merged;
}

export async function getNextSortOrder(): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.sort_order ?? 0) + 1;
}

export async function findActiveNameConflict(
  normalizedName: string,
  effectiveFrom: string
): Promise<LabParameterRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select(
      "id, name, name_normalized, sort_order, effective_from, effective_to, deleted_at"
    )
    .eq("name_normalized", normalizedName)
    .is("deleted_at", null)
    .lte("effective_from", effectiveFrom)
    .or(`effective_to.is.null,effective_to.gt.${effectiveFrom}`)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as LabParameterRow) || null;
}
