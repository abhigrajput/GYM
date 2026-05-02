import { createClient } from "@/lib/supabase/server"
import { secureJson } from "@/lib/security/api"

export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, response: secureJson({ error: "Unauthorized" }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") {
    return { ok: false as const, response: secureJson({ error: "Forbidden" }, { status: 403 }) }
  }
  return { ok: true as const, supabase, user }
}
