/**
 * READ-ONLY: Verify lab_parameters registry after migration 004.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const EXPECTED_IDS = [
  "11111111-1111-4111-8111-111111110001",
  "11111111-1111-4111-8111-111111110002",
  "11111111-1111-4111-8111-111111110003",
  "11111111-1111-4111-8111-111111110004",
  "11111111-1111-4111-8111-111111110005",
  "11111111-1111-4111-8111-111111110006",
  "11111111-1111-4111-8111-111111110007",
  "11111111-1111-4111-8111-111111110008",
  "11111111-1111-4111-8111-111111110009",
  "11111111-1111-4111-8111-111111110010",
  "11111111-1111-4111-8111-111111110011",
  "11111111-1111-4111-8111-111111110012",
  "11111111-1111-4111-8111-111111110013",
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.service_role_secret
);

const { data, error, count } = await supabase
  .from("lab_parameters")
  .select("id,name,sort_order,effective_from,effective_to", { count: "exact" })
  .order("sort_order");

if (error) {
  console.log("FAIL", error.code, error.message);
  process.exit(1);
}

const ids = new Set((data || []).map((r) => r.id));
const missing = EXPECTED_IDS.filter((id) => !ids.has(id));
console.log({
  count,
  missingIds: missing.length,
  pass: count === 13 && missing.length === 0,
});
