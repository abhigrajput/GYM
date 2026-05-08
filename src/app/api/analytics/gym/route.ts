export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"
import { createHash } from "crypto"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/analytics/gym")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const gymId = searchParams.get("gymId")
    if (!gymId) return secureJson({ error: "gymId required" }, { status: 400 })

    const { data: members } = await supabase.from("members").select("*").eq("gym_id", gymId)
    const { data: gym } = await supabase.from("gyms").select("*").eq("id", gymId).maybeSingle()
    const { data: attendance } = await supabase.from("attendance").select("*").eq("gym_id", gymId)
    const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", gymId)
    const { data: schedules } = await supabase.from("equipment_schedules").select("equipment_id").eq("gym_id", gymId)

    const total = members?.length || 0
    const active = (members || []).filter((m) => m.membership_status === "active").length
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const newThisMonth = (members || []).filter((m) => (m.join_date || "") >= monthStart).length
    const churned = (members || []).filter((m) => m.membership_status === "expired").length
    const revenue = active * Number(gym?.monthly_fee || 0)
    const avgStreak =
      total > 0 ? Math.round((members || []).reduce((sum, m) => sum + Number(m.streak_count || 0), 0) / total) : 0

    const revenueLast6: { month: string; amount: number }[] = []

    const hourMap = new Map<number, number>()
    ;(attendance || []).forEach((a) => {
      const h = new Date(a.checked_in_at).getHours()
      hourMap.set(h, (hourMap.get(h) || 0) + 1)
    })
    const peakHours = Array.from(hourMap.entries()).map(([hour, avg_checkins]) => ({ hour, avg_checkins }))

    const scheduleCounts = new Map<string, number>()
    ;(schedules || []).forEach((s) => {
      if (!s.equipment_id) return
      scheduleCounts.set(s.equipment_id, (scheduleCounts.get(s.equipment_id) || 0) + 1)
    })
    const equipmentUsage = (equipment || []).map((e) => ({
      equipment_name: e.name,
      usage_count: scheduleCounts.get(e.id) || 0,
    }))

    const dropoutRisk = (members || [])
      .map((m) => {
        const daysAbsent = m.last_workout_date
          ? Math.floor((Date.now() - new Date(m.last_workout_date).getTime()) / 86_400_000)
          : 999
        return { id: m.id, name: `Member ${createHash("md5").update(m.id).digest("hex").slice(0, 4)}`, days_absent: daysAbsent }
      })
      .filter((m) => m.days_absent >= 7)
      .slice(0, 20)

    return secureJson({
      total_members: total,
      active_members: active,
      new_this_month: newThisMonth,
      churned_this_month: churned,
      revenue_this_month: revenue,
      revenue_last_6_months: revenueLast6,
      peak_hours: peakHours,
      equipment_usage: equipmentUsage,
      retention_rate: total ? Math.round((active / total) * 100) : 0,
      avg_streak: avgStreak,
      dropout_risk_members: dropoutRisk,
    })
  } catch {
    return secureJson({ error: "Failed to fetch analytics." }, { status: 500 })
  }
}
