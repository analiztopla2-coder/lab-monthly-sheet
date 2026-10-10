import { getSupabaseAdmin } from "./supabase-server";
import { getDaysInMonth, type RowsJson } from "./rows";
import type { LabParameter, LabParameterRow } from "./parameter-types";
import {
  ephemeralLegacyFromSheetName,
  findLegacyByName,
  getLegacyParameterRowsForMonth,
} from "./legacy-parameters";
import {
  isParameterEffectiveForMonth,
  monthEndDate,
  monthStartDate,
  normalizeParameterName,
} from "./month-period";

export type { LabParameter, LabParameterRow } from "./parameter-types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isParameterIdKey(key: string): boolean {
  return UUID_RE.test(key);
}

export { normalizeParameterName, monthStartDate, monthEndDate } from "./month-period";

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

function isMissingParametersTable(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST205" ||
    (error?.message?.includes("lab_parameters") ?? false)
  );
}

function filterRowsByMonth(
  rows: LabParameterRow[],
  year: number,
  month: number
): LabParameterRow[] {
  return rows.filter((p) =>
    isParameterEffectiveForMonth(p.effective_from, p.effective_to, year, month)
  );
}

/**
 * Parameters effective for a given year/month (historical view).
 * Falls back to legacy registry if lab_parameters is missing or empty.
 */
export async function fetchParametersEffectiveForMonth(
  year: number,
  month: number
): Promise<LabParameterRow[]> {
  const periodEnd = monthEndDate(year, month);

  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select(
      "id, name, name_normalized, sort_order, effective_from, effective_to, deleted_at"
    )
    .lte("effective_from", periodEnd)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingParametersTable(error)) {
      return getLegacyParameterRowsForMonth(year, month);
    }
    throw error;
  }

  const filtered = filterRowsByMonth((data || []) as LabParameterRow[], year, month);

  if (filtered.length === 0) {
    return getLegacyParameterRowsForMonth(year, month);
  }

  return filtered;
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

  if (error) {
    if (isMissingParametersTable(error)) {
      return ids
        .map((id) => {
          const legacy = getLegacyParameterRowsForMonth(2000, 0).find((p) => p.id === id);
          return legacy;
        })
        .filter(Boolean) as LabParameterRow[];
    }
    throw error;
  }
  return (data || []) as LabParameterRow[];
}

/**
 * Union of month-effective parameters, sheet row keys (legacy names + UUIDs).
 */
export async function resolveParametersForSheet(
  year: number,
  month: number,
  sheetRows: RowsJson
): Promise<LabParameter[]> {
  const effective = await fetchParametersEffectiveForMonth(year, month);
  const byId = new Map(effective.map((p) => [p.id, p]));

  for (const key of Object.keys(sheetRows || {})) {
    if (isParameterIdKey(key)) {
      if (!byId.has(key)) {
        const fromDb = await fetchParametersByIds([key]);
        if (fromDb[0]) byId.set(key, fromDb[0]);
      }
      continue;
    }
    const legacy = findLegacyByName(key);
    if (legacy) {
      if (!byId.has(legacy.id)) {
        byId.set(legacy.id, ephemeralLegacyFromSheetName(key, legacy.sortOrder));
      }
      continue;
    }
    const ephemeral = ephemeralLegacyFromSheetName(key, 9000 + byId.size);
    if (!byId.has(ephemeral.id)) {
      byId.set(ephemeral.id, ephemeral);
    }
  }

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

export async function getNextSortOrder(): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("lab_parameters")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingParametersTable(error)) {
      return LEGACY_MAX_SORT + 1;
    }
    throw error;
  }
  return (data?.sort_order ?? LEGACY_MAX_SORT) + 1;
}

const LEGACY_MAX_SORT = 13;

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
    .limit(20);

  if (error) {
    if (isMissingParametersTable(error)) {
      const legacy = findLegacyByName(normalizedName);
      if (legacy) {
        return {
          id: legacy.id,
          name: legacy.name,
          name_normalized: normalizedName,
          sort_order: legacy.sortOrder,
          effective_from: "2000-01-01",
          effective_to: null,
          deleted_at: null,
        };
      }
      return null;
    }
    throw error;
  }

  const rows = (data || []) as LabParameterRow[];
  for (const row of rows) {
    const year = parseInt(effectiveFrom.slice(0, 4), 10);
    const month = parseInt(effectiveFrom.slice(5, 7), 10) - 1;
    if (
      isParameterEffectiveForMonth(
        row.effective_from,
        row.effective_to,
        year,
        month
      )
    ) {
      return row;
    }
  }
  return null;
}
