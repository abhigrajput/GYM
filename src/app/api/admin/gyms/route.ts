export const dynamic = "force-dynamic"

import { createServiceRoleClient } from "@/lib/db/connection-pool"
import { secureJson, enforceRateLimit } from "@/lib/security/api"
import { requireAdmin } from "@/lib/security/admin"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/admin/gyms")
    if (limited) return limited
    const gate = await requireAdmin()
    if (!gate.ok) return gate.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const db = createServiceRoleClient()
    let q = db.from("gyms").select("id, name, city, owner_id, gym_code, subscription_status, trial_ends_at, monthly_fee")
    if (status && status !== "all") {
      q = q.eq("subscription_status", status)
    }
    const { data: gyms, error } = await q.order("created_at", { ascending: false }).limit(200)
    if (error) return secureJson({ error: error.message }, { status: 500 })

    const ownerIds = [...new Set((gyms || []).map((g) => g.owner_id).filter(Boolean))] as string[]
    const gymIds = (gyms || []).map((g) => g.id)

    const { data: profiles } = ownerIds.length
      ? await db.from("profiles").select("id, full_name").in("id", ownerIds)
      : { data: [] as { id: string; full_name: string }[] }

    const { data: memCounts } = gymIds.length
      ? await db.from("members").select("gym_id").in("gym_id", gymIds)
      : { data: [] as { gym_id: string }[] }

    const countByGym = new Map<string, number>()
    ;(memCounts || []).forEach((m) => {
      if (!m.gym_id) return
      countByGym.set(m.gym_id, (countByGym.get(m.gym_id) || 0) + 1)
    })

    const profById = new Map((profiles || []).map((p) => [p.id, p.full_name]))

    const list = (gyms || []).map((g) => ({
      ...g,
      owner_name: g.owner_id ? profById.get(g.owner_id) || "—" : "—",
      member_count: countByGym.get(g.id) || 0,
      revenue_est: (g.monthly_fee || 0) * (countByGym.get(g.id) || 0),
    }))

    return secureJson({ gyms: list })
  } catch {
    return secureJson({ error: "Failed to load gyms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/admin/gyms")
    if (limited) return limited
    const gate = await requireAdmin()
    if (!gate.ok) return gate.response

    const body = await request.json()
    const { action, gymId } = body as { action: string; gymId: string }
    if (!gymId) return secureJson({ error: "gymId required" }, { status: 400 })

    const db = createServiceRoleClient()
    if (action === "extend_trial") {
      const end = new Date()
      end.setDate(end.getDate() + 14)
      const { error } = await db
        .from("gyms")
        .update({ subscription_status: "trial", trial_ends_at: end.toISOString() })
        .eq("id", gymId)
      if (error) return secureJson({ error: error.message }, { status: 500 })
      return secureJson({ ok: true })
    }
    if (action === "suspend") {
      const { error } = await db.from("gyms").update({ subscription_status: "expired" }).eq("id", gymId)
      if (error) return secureJson({ error: error.message }, { status: 500 })
      return secureJson({ ok: true })
    }
    if (action === "activate") {
      const { error } = await db.from("gyms").update({ subscription_status: "active" }).eq("id", gymId)
      if (error) return secureJson({ error: error.message }, { status: 500 })
      return secureJson({ ok: true })
    }
    return secureJson({ error: "Unknown action" }, { status: 400 })
  } catch {
    return secureJson({ error: "Action failed" }, { status: 500 })
  }
}
