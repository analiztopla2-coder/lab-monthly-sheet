// lib/rows.ts - Sheet row value helpers (keys are parameter UUIDs)

export type RowsJson = Record<string, string[]>;

/**
 * Ayın gün sayısını hesaplar (month: 0–11, JavaScript Date uyumlu)
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
