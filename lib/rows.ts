// lib/rows.ts - Varsayılan satır etiketleri ve yardımcı fonksiyonlar

export const ROW_LABELS = [
  "SU SERTLİĞİ",
  "TUZ SERTLİĞİ",
  "TUZ YOĞUNLUĞU",
  "TUZ PH",
  "TUZ İLETKENLİĞİ",
  "SODA YOĞUNLUK KONTROLÜ",
  "HER BASILACAK TUZ İLETKENLİĞİ",
  "HER BASILACAK TUZ SERTLİĞİ",
  "A.ASİT",
  "KOSTİK",
  "BOYA DEĞİŞİMİ",
  "PEROKSİT",
  "PH",
];

export type RowsJson = Record<string, string[]>;

/**
 * Belirtilen gün sayısı kadar boş string dizileri ile bir ay verisi oluşturur
 */
export const emptyMonth = (days: number): RowsJson =>
  Object.fromEntries(
    ROW_LABELS.map((label) => [label, Array.from({ length: days }, () => "")])
  );

/**
 * Ayın gün sayısını hesaplar
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
