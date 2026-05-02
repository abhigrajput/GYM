export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/analytics/traffic")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const gymId = searchParams.get("gymId")
    const date = searchParams.get("date")
    if (!gymId || !date) return secureJson({ error: "gymId and date required" }, { status: 400 })

    const { data: schedules } = await supabase
      .from("equipment_schedules")
      .select("*")
      .eq("gym_id", gymId)
      .eq("scheduled_date", date)
    const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", gymId)
    const { data: members } = await supabase.from("members").select("id,profile_id").eq("gym_id", gymId)
    const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", (members || []).map((m) => m.profile_id))

    const byEquipmentTime = new Map<string, any[]>()
    ;(schedules || []).forEach((s) => {
      const k = `${s.equipment_id}:${s.time_slot}`
      if (!byEquipmentTime.has(k)) byEquipmentTime.set(k, [])
      byEquipmentTime.get(k)!.push(s)
    })

    const conflicts: any[] = []
    byEquipmentTime.forEach((rows, key) => {
      const [equipmentId, slot] = key.split(":")
      const eq = (equipment || []).find((e) => e.id === equipmentId)
      if (!eq) return
      const qty = eq.quantity || 1
      if (rows.length > qty) {
        conflicts.push({
          equipment_name: eq.name,
          equipment_quantity: qty,
          time_slot: slot,
          members_wanting: rows.map((r) => {
            const m = (members || []).find((mm) => mm.id === r.member_id)
            const p = (profiles || []).find((pp) => pp.id === m?.profile_id)
            return { id: r.member_id, name: p?.full_name || "Member" }
          }),
          overflow_count: rows.length - qty,
        })
      }
    })

    const recommendations =
      conflicts.length === 0
        ? ["No major conflicts. Current scheduling is smooth."]
        : conflicts.map((c) => `Shift ${c.overflow_count} members from ${c.time_slot} for ${c.equipment_name}.`)

    return secureJson({ conflicts, recommendations })
  } catch {
    return secureJson({ error: "Failed to fetch traffic analytics." }, { status: 500 })
  }
}
