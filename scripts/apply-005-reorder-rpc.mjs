/**
 * Applies 005_reorder_lab_parameters.sql (RPC only). Does NOT modify monthly_sheets.
 * Requires DATABASE_URL or SUPABASE_DB_URL in .env.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const databaseUrl =
  process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

if (!databaseUrl) {
  console.error("Missing DATABASE_URL or SUPABASE_DB_URL in .env");
  process.exit(2);
}

const sql = readFileSync(
  join(root, "supabase/migrations/005_reorder_lab_parameters.sql"),
  "utf8"
);

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT proname FROM pg_proc WHERE proname = 'reorder_lab_parameters'`
  );
  console.log("005 applied OK. function exists:", rows.length > 0);
} finally {
  await client.end();
}
