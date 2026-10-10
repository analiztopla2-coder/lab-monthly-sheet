/**
 * READ-ONLY: Compare non-empty cell counts per month (source of truth in DB).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE || process.env.service_role_secret;
const supabase = createClient(url, key);

function countNonEmpty(rows) {
  let n = 0;
  for (const vals of Object.values(rows || {})) {
    if (!Array.isArray(vals)) continue;
    for (const v of vals) {
      if (String(v ?? "").trim() !== "") n++;
    }
  }
  return n;
}

const { data: sheets } = await supabase
  .from("monthly_sheets")
  .select("year,month,rows")
  .order("year")
  .order("month");

let total = 0;
console.log("MONTH\tNON_EMPTY_VALUES\tROW_KEYS");
for (const s of sheets) {
  const ne = countNonEmpty(s.rows);
  total += ne;
  const ym = `${s.year}-${String(s.month + 1).padStart(2, "0")}`;
  console.log(`${ym}\t${ne}\t${Object.keys(s.rows || {}).length}`);
}
console.log("TOTAL_SHEETS", sheets.length);
console.log("TOTAL_NON_EMPTY", total);
