import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { supabaseFetch } from "@/lib/supabase/http"

/**
 * Service-role Supabase client for server-side API routes only.
 * Uses request timeout + exponential backoff on fetch failures.
 */
export function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: supabaseFetch },
  })
}
