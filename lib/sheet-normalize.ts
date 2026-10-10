import type { LabParameter } from "./parameter-types";
import type { RowsJson } from "./rows";
import { findLegacyById, findLegacyByName } from "./legacy-parameters";
import { isParameterIdKey } from "./parameters";

export function getStoredValuesForParameter(
  stored: RowsJson,
  param: LabParameter
): string[] | undefined {
  if (stored[param.id]) return stored[param.id];
  const legacy = findLegacyById(param.id);
  if (legacy && stored[legacy.name]) return stored[legacy.name];
  if (!isParameterIdKey(param.id) && stored[param.name]) return stored[param.name];
  return undefined;
}

export function countNonEmptyCells(rows: RowsJson | null | undefined): number {
  if (!rows) return 0;
  let n = 0;
  for (const vals of Object.values(rows)) {
    if (!Array.isArray(vals)) continue;
    for (const v of vals) {
      if (v !== null && v !== undefined && String(v).trim() !== "") n++;
    }
  }
  return n;
}

export function countNonEmptyInParameterPayload(
  rows: RowsJson,
  parameters: LabParameter[]
): number {
  let n = 0;
  for (const param of parameters) {
    const vals = rows[param.id];
    if (!Array.isArray(vals)) continue;
    for (const v of vals) {
      if (v !== null && v !== undefined && String(v).trim() !== "") n++;
    }
  }
  return n;
}

export function sheetHasLegacyNameKeys(rows: RowsJson): boolean {
  return Object.keys(rows || {}).some((k) => !isParameterIdKey(k));
}

export function mergeRowsForParameters(
  stored: RowsJson,
  parameters: LabParameter[],
  days: number
): RowsJson {
  const merged: RowsJson = { ...(stored || {}) };

  for (const param of parameters) {
    const existing = getStoredValuesForParameter(stored, param) || [];
    merged[param.id] = Array.from(
      { length: days },
      (_, i) => existing[i] ?? ""
    );
  }

  return merged;
}

/** Dual-write UUID + legacy name keys when saving (additive; does not remove legacy keys). */
export function applyParameterUpdatesToStored(
  stored: RowsJson,
  updates: RowsJson,
  parameters: LabParameter[]
): RowsJson {
  const merged: RowsJson = { ...(stored || {}) };

  for (const [key, values] of Object.entries(updates)) {
    merged[key] = values;
    const param = parameters.find((p) => p.id === key);
    if (param) {
      const legacy = findLegacyById(param.id);
      if (legacy) {
        merged[legacy.name] = values;
      } else if (!isParameterIdKey(param.id)) {
        merged[param.name] = values;
      }
    } else {
      const legacy = findLegacyByName(key);
      if (legacy) {
        merged[legacy.id] = values;
        merged[legacy.name] = values;
      }
    }
  }

  return merged;
}
