/**
 * READ-ONLY production audit. No writes. Does not log cell values.
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

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jlkoeiwpdrkumjxekkxi.supabase.co";
const key =
  process.env.SUPABASE_SERVICE_ROLE || process.env.service_role_secret;
if (!key) {
  console.error("No service role in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function countNonEmpty(rows) {
  if (!rows || typeof rows !== "object") return 0;
  let n = 0;
  for (const vals of Object.values(rows)) {
    if (!Array.isArray(vals)) continue;
    for (const v of vals) {
      if (v !== null && v !== undefined && String(v).trim() !== "") n++;
    }
  }
  return n;
}

function keyStats(rows) {
  const keys = Object.keys(rows || {});
  const uuidKeys = keys.filter((k) => UUID_RE.test(k));
  const nameKeys = keys.filter((k) => !UUID_RE.test(k));
  return { totalKeys: keys.length, uuidKeys: uuidKeys.length, nameKeys: nameKeys.length, sampleNameKeys: nameKeys.slice(0, 5) };
}

// lab_parameters
const lp = await supabase.from("lab_parameters").select("id", { count: "exact", head: true });
console.log("lab_parameters:", { count: lp.count, error: lp.error?.code, message: lp.error?.message });

if (!lp.error) {
  const lpSample = await supabase.from("lab_parameters").select("id,name,sort_order,effective_from,effective_to,deleted_at").order("sort_order").limit(3);
  console.log("lab_parameters sample rows:", lpSample.data?.length, lpSample.error?.message);
}

// all sheets summary
const { data: sheets, error: sheetsErr } = await supabase
  .from("monthly_sheets")
  .select("id,year,month,rows")
  .order("year")
  .order("month");

if (sheetsErr) {
  console.error("monthly_sheets error:", sheetsErr.message);
  process.exit(1);
}

console.log("monthly_sheets count:", sheets.length);

let totalNonEmpty = 0;
const monthReport = [];

for (const s of sheets) {
  const ne = countNonEmpty(s.rows);
  totalNonEmpty += ne;
  const ks = keyStats(s.rows);
  monthReport.push({
    ym: `${s.year}-${String(s.month + 1).padStart(2, "0")}`,
    keys: ks.totalKeys,
    nameKeys: ks.nameKeys,
    uuidKeys: ks.uuidKeys,
    nonEmpty: ne,
    sampleNames: ks.sampleNameKeys,
  });
}

console.log("total non-empty cells (all sheets):", totalNonEmpty);
console.log("month breakdown:", monthReport);

const oct2026 = sheets.find((s) => s.year === 2026 && s.month === 9);
if (oct2026) {
  console.log("2026-10 sheet id:", oct2026.id);
  console.log("2026-10 key stats:", keyStats(oct2026.rows));
  console.log("2026-10 non-empty:", countNonEmpty(oct2026.rows));
} else {
  console.log("2026-10 sheet: NOT FOUND");
}
