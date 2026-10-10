/**
 * Applies 004_create_lab_parameter_registry.sql (DDL). Does NOT modify monthly_sheets.
 * Requires DATABASE_URL or SUPABASE_DB_URL in .env (Supabase → Database → connection string).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv(join(root, ".env"));

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  "";

if (!databaseUrl) {
  console.error(
    "Missing DATABASE_URL or SUPABASE_DB_URL in .env (Postgres connection string from Supabase Dashboard)."
  );
  console.error("service_role JWT cannot run DDL; database password/URL is required.");
  process.exit(2);
}

const sql = readFileSync(
  join(root, "supabase/migrations/004_create_lab_parameter_registry.sql"),
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
    "SELECT COUNT(*)::int AS c FROM lab_parameters"
  );
  console.log("004 applied OK. lab_parameters count:", rows[0].c);
} finally {
  await client.end();
}
