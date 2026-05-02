export const dynamic = "force-dynamic"

import { createServiceRoleClient } from "@/lib/db/connection-pool"
import { enforceRateLimit, secureJson } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/gyms/search")
    if (limited) return limited

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("query") || "").trim()
    const city = (searchParams.get("city") || "").trim()

    const db = createServiceRoleClient()
    let query = db
      .from("gyms")
      .select("id, name, city, address, gym_code, subscription_status")
      .in("subscription_status", ["active", "trial"])
      .or("is_active.is.null,is_active.eq.true")

    if (q) {
      query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%`)
    }
    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    const { data: gyms, error } = await query.order("name").limit(50)
    if (error) throw error

    const ids = (gyms || []).map((g) => g.id)
    if (ids.length === 0) {
      return secureJson({ gyms: [] })
    }

    const { data: equipmentRows } = await db.from("equipment").select("gym_id").in("gym_id", ids)
    const { data: memberRows } = await db.from("members").select("gym_id").in("gym_id", ids)

    const equipmentCount = new Map<string, number>()
    const memberCount = new Map<string, number>()
    ;(equipmentRows || []).forEach((r: { gym_id: string | null }) => {
      if (!r.gym_id) return
      equipmentCount.set(r.gym_id, (equipmentCount.get(r.gym_id) || 0) + 1)
    })
    ;(memberRows || []).forEach((r: { gym_id: string | null }) => {
      if (!r.gym_id) return
      memberCount.set(r.gym_id, (memberCount.get(r.gym_id) || 0) + 1)
    })

    const result = (gyms || []).map((g) => ({
      id: g.id,
      name: g.name,
      city: g.city,
      address: g.address,
      equipment_count: equipmentCount.get(g.id) || 0,
      member_count: memberCount.get(g.id) || 0,
      gym_code: g.gym_code,
    }))

    return secureJson({ gyms: result })
  } catch {
    return secureJson({ error: "Search failed" }, { status: 500 })
  }
}
