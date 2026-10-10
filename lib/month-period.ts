import { getDaysInMonth } from "./rows";

export function normalizeParameterName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

export function monthStartDate(year: number, month: number): string {
  const m = String(month + 1).padStart(2, "0");
  return `${year}-${m}-01`;
}

export function monthEndDate(year: number, month: number): string {
  const days = getDaysInMonth(year, month);
  const m = String(month + 1).padStart(2, "0");
  const d = String(days).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function isParameterEffectiveForMonth(
  effectiveFrom: string,
  effectiveTo: string | null,
  year: number,
  month: number
): boolean {
  const periodStart = monthStartDate(year, month);
  const periodEnd = monthEndDate(year, month);
  if (effectiveFrom > periodEnd) return false;
  if (effectiveTo === null) return true;
  return periodStart < effectiveTo;
}
