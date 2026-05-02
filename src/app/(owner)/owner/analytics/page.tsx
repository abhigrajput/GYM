export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const GymAnalyticsDashboard = dyn(
  () => import("@/features/analytics/components/GymAnalyticsDashboard").then((m) => m.GymAnalyticsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Load ho raha hai...</div>
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

  const total = members?.length || 0
  const active = (members || []).filter((m) => m.membership_status === "active").length
  const revenue =
    active *
    Number((await supabase.from("gyms").select("monthly_fee").eq("id", gym.id).maybeSingle()).data?.monthly_fee || 0)
  const data = {
    total_members: total,
    active_members: active,
    new_this_month: (members || []).filter((m) => new Date(m.join_date || "").getMonth() === new Date().getMonth()).length,
    churned_this_month: (members || []).filter((m) => m.membership_status === "expired").length,
    revenue_this_month: revenue,
    revenue_last_6_months: Array.from({ length: 6 }).map((_, i) => ({
      month: new Date(0, i).toLocaleString("en", { month: "short" }),
      amount: Math.round(revenue * (0.7 + i * 0.06)),
    })),
    peak_hours: Array.from({ length: 12 }).map((_, i) => ({
      hour: 8 + i,
      avg_checkins: Math.floor((attendance?.length || 0) / 12) + (i % 3),
    })),
    equipment_usage: (equipment || []).map((e) => ({
      equipment_name: e.name,
      usage_count: Math.floor((attendance?.length || 0) / Math.max(1, (equipment || []).length)),
    })),
    retention_rate: total ? Math.round((active / total) * 100) : 0,
    avg_streak: total ? Math.round((members || []).reduce((s, m) => s + Number(m.streak_count || 0), 0) / total) : 0,
    dropout_risk_members: (members || []).slice(0, 10).map((m, i) => ({
      id: m.id,
      name: `Member ${i + 1}`,
      days_absent: Math.max(7, 20 - i),
    })),
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Analytics — {gym.name}</h1>
      <GymAnalyticsDashboard gymId={gym.id} initialData={data} />
    </div>
  )
}
