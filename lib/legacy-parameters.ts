/**
 * Canonical legacy parameter registry (matches migration 003 stable UUIDs).
 */
import type { LabParameter } from "./parameter-types";
import type { LabParameterRow } from "./parameter-types";
import {
  isParameterEffectiveForMonth,
  normalizeParameterName,
} from "./month-period";

export const LEGACY_PARAMETER_SEED: readonly {
  id: string;
  name: string;
  sortOrder: number;
}[] = [
  { id: "11111111-1111-4111-8111-111111110001", name: "SU SERTLİĞİ", sortOrder: 1 },
  { id: "11111111-1111-4111-8111-111111110002", name: "TUZ SERTLİĞİ", sortOrder: 2 },
  { id: "11111111-1111-4111-8111-111111110003", name: "TUZ YOĞUNLUĞU", sortOrder: 3 },
  { id: "11111111-1111-4111-8111-111111110004", name: "TUZ PH", sortOrder: 4 },
  { id: "11111111-1111-4111-8111-111111110005", name: "TUZ İLETKENLİĞİ", sortOrder: 5 },
  { id: "11111111-1111-4111-8111-111111110006", name: "SODA YOĞUNLUK KONTROLÜ", sortOrder: 6 },
  { id: "11111111-1111-4111-8111-111111110007", name: "HER BASILACAK TUZ İLETKENLİĞİ", sortOrder: 7 },
  { id: "11111111-1111-4111-8111-111111110008", name: "HER BASILACAK TUZ SERTLİĞİ", sortOrder: 8 },
  { id: "11111111-1111-4111-8111-111111110009", name: "A.ASİT", sortOrder: 9 },
  { id: "11111111-1111-4111-8111-111111110010", name: "KOSTİK", sortOrder: 10 },
  { id: "11111111-1111-4111-8111-111111110011", name: "BOYA DEĞİŞİMİ", sortOrder: 11 },
  { id: "11111111-1111-4111-8111-111111110012", name: "PEROKSİT", sortOrder: 12 },
  { id: "11111111-1111-4111-8111-111111110013", name: "PH", sortOrder: 13 },
];

const LEGACY_BY_NAME = new Map(
  LEGACY_PARAMETER_SEED.map((p) => [normalizeParameterName(p.name), p])
);

const LEGACY_BY_ID = new Map(LEGACY_PARAMETER_SEED.map((p) => [p.id, p]));

export function findLegacyByName(name: string) {
  return LEGACY_BY_NAME.get(normalizeParameterName(name));
}

export function findLegacyById(id: string) {
  return LEGACY_BY_ID.get(id);
}

const LEGACY_EFFECTIVE_FROM = "2000-01-01";

export function getLegacyParameterRowsForMonth(
  year: number,
  month: number
): LabParameterRow[] {
  return LEGACY_PARAMETER_SEED.filter(() =>
    isParameterEffectiveForMonth(LEGACY_EFFECTIVE_FROM, null, year, month)
  ).map((p) => ({
    id: p.id,
    name: p.name,
    name_normalized: normalizeParameterName(p.name),
    sort_order: p.sortOrder,
    effective_from: LEGACY_EFFECTIVE_FROM,
    effective_to: null,
    deleted_at: null,
  }));
}

export function ephemeralLegacyFromSheetName(
  name: string,
  sortOrder: number
): LabParameterRow {
  const known = findLegacyByName(name);
  if (known) {
    return {
      id: known.id,
      name: known.name,
      name_normalized: normalizeParameterName(known.name),
      sort_order: known.sortOrder,
      effective_from: LEGACY_EFFECTIVE_FROM,
      effective_to: null,
      deleted_at: null,
    };
  }
  return {
    id: `legacy-name:${normalizeParameterName(name)}`,
    name: name.trim(),
    name_normalized: normalizeParameterName(name),
    sort_order: sortOrder,
    effective_from: LEGACY_EFFECTIVE_FROM,
    effective_to: null,
    deleted_at: null,
  };
}
