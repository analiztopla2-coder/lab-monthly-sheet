// lib/supabase-server.ts - Server-side Supabase client (SERVICE_ROLE kullanır)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE .env.local'de tanımlanmalı!"
  );
}

// Server-side için service_role key kullanıyoruz (RLS bypass)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    persistSession: false,
  },
});
