export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const GymAnalyticsDashboard = dyn(
  () => import("@/features/analytics/components/GymAnalyticsDashboard").then((m) => m.GymAnalyticsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function OwnerAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase.from("gyms").select("id,name").eq("owner_id", user.id).maybeSingle()
  if (!gym) return <Card className="m-4">No gym found.</Card>

  const { data: members } = await supabase.from("members").select("*").eq("gym_id", gym.id)
  const { data: attendance } = await supabase.from("attendance").select("*").eq("gym_id", gym.id)
  const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", gym.id)
  const { data: schedules } = await supabase.from("equipment_schedules").select("equipment_id").eq("gym_id", gym.id)

  const total = members?.length || 0
  const active = (members || []).filter((m) => m.membership_status === "active").length
  const revenue =
    active *
    Number((await supabase.from("gyms").select("monthly_fee").eq("id", gym.id).maybeSingle()).data?.monthly_fee || 0)
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
  const data = {
    total_members: total,
    active_members: active,
    new_this_month: (members || []).filter((m) => new Date(m.join_date || "").getMonth() === new Date().getMonth()).length,
    churned_this_month: (members || []).filter((m) => m.membership_status === "expired").length,
    revenue_this_month: revenue,
    revenue_last_6_months: [],
    peak_hours: peakHours,
    equipment_usage: (equipment || []).map((e) => ({
      equipment_name: e.name,
      usage_count: scheduleCounts.get(e.id) || 0,
    })),
    retention_rate: total ? Math.round((active / total) * 100) : 0,
    avg_streak: total ? Math.round((members || []).reduce((s, m) => s + Number(m.streak_count || 0), 0) / total) : 0,
    dropout_risk_members: (members || [])
      .map((m) => ({
      id: m.id,
      name: `Member ${m.id.slice(0, 4)}`,
      days_absent: m.last_workout_date ? Math.floor((Date.now() - new Date(m.last_workout_date).getTime()) / 86_400_000) : 999,
    }))
      .filter((m) => m.days_absent >= 7)
      .slice(0, 10),
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Analytics — {gym.name}</h1>
      <GymAnalyticsDashboard gymId={gym.id} initialData={data} />
    </div>
  )
}
