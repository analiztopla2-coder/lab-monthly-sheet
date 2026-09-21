// lib/supabase-server.ts - Server-side Supabase client (SERVICE_ROLE kullanır)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your hosting provider or .env.local for local development.`
    );
  }
  return value;
}

/**
 * Lazy-initialized Supabase admin client (service role).
 * Only call from server runtime (API routes, server actions) — not at build/import time.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const supabaseUrl = requireServerEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseServiceRole = requireServerEnv("SUPABASE_SERVICE_ROLE");
    adminClient = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
      },
    });
  }
  return adminClient;
}
