export const dynamic = "force-dynamic"

import { createServiceRoleClient } from "@/lib/db/connection-pool"
import { secureJson, enforceRateLimit } from "@/lib/security/api"
import { requireAdmin } from "@/lib/security/admin"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/admin/users")
    if (limited) return limited
    const gate = await requireAdmin()
    if (!gate.ok) return gate.response

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const city = searchParams.get("city")
    const q = (searchParams.get("q") || "").trim().toLowerCase()

    const db = createServiceRoleClient()
    let query = db.from("profiles").select("id, full_name, phone, role, city, created_at")
    if (role && role !== "all") query = query.eq("role", role)
    if (city) query = query.ilike("city", `%${city}%`)

    const { data: rows, error } = await query.order("created_at", { ascending: false }).limit(500)
    if (error) return secureJson({ error: error.message }, { status: 500 })

    // profiles may not have email - fetch auth users is not trivial without admin api
    const filtered = (rows || []).filter((r: { full_name?: string; phone?: string | null }) => {
      if (!q) return true
      const name = (r.full_name || "").toLowerCase()
      const phone = (r.phone || "").toLowerCase()
      return name.includes(q) || phone.includes(q)
    })

    return secureJson({ users: filtered })
  } catch {
    return secureJson({ error: "Failed to load users" }, { status: 500 })
  }
}
