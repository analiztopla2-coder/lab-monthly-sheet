# Migrations

## Production registry (safe)

Use **`004_create_lab_parameter_registry.sql`** for production.

- Creates `lab_parameters` only
- Inserts 13 canonical legacy parameters (stable UUIDs)
- **Does not** modify `monthly_sheets` or `rows` JSONB

Apply via Supabase SQL Editor, or locally:

```bash
# Requires DATABASE_URL in .env (database password — not service_role JWT)
node scripts/apply-004-registry.mjs
```

## Do not run on production as-is

**`003_lab_parameters.sql`** includes a `DO $$ ... UPDATE monthly_sheets` block that rewrites row keys. Do not run that block against production until an explicit data migration is approved.

## Parameter reorder RPC (005)

**`005_reorder_lab_parameters.sql`** — creates `reorder_lab_parameters(uuid[], uuid[])` only. Does not change `monthly_sheets` or existing `sort_order` until the admin API calls the function.

```bash
node scripts/apply-005-reorder-rpc.mjs
```
