/**
 * READ-ONLY: Simulates legacy parameter resolution for 2026-10 production sheet.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const LEGACY = [
  "SU SERTLİĞİ","TUZ SERTLİĞİ","TUZ YOĞUNLUĞU","TUZ PH","TUZ İLETKENLİĞİ",
  "SODA YOĞUNLUK KONTROLÜ","HER BASILACAK TUZ İLETKENLİĞİ","HER BASILACAK TUZ SERTLİĞİ",
  "A.ASİT","KOSTİK","BOYA DEĞİŞİMİ","PEROKSİT","PH",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
loadEnv(join(root, ".env"));

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.service_role_secret
);

const { data: sheet } = await supabase
  .from("monthly_sheets")
  .select("rows")
  .eq("year", 2026)
  .eq("month", 9)
  .single();

const rows = sheet.rows;
const paramCount = LEGACY.length;
let mappedNonEmpty = 0;
for (const name of LEGACY) {
  const vals = rows[name];
  if (!vals) continue;
  for (const v of vals) {
    if (String(v ?? "").trim() !== "") mappedNonEmpty++;
  }
}

console.log({
  legacyParameterCount: paramCount,
  sheetNameKeys: Object.keys(rows).length,
  mappedNonEmptyFromLegacyNames: mappedNonEmpty,
  pass: paramCount === 13 && mappedNonEmpty > 0,
});
