export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const ProgressDashboard = dyn(
  () => import("@/features/progress-tracker/components/ProgressDashboard").then((m) => m.ProgressDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function MemberProgressPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member) return <Card className="m-4">Member not found.</Card>

  const { data: measurements } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("member_id", member.id)
    .order("measured_at", { ascending: false })
  const { data: workoutLogs } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("member_id", member.id)
    .order("workout_date", { ascending: false })

  return (
    <div className="p-4 sm:p-6">
      <ProgressDashboard memberId={member.id} goal={member.goal} measurements={measurements || []} workoutLogs={workoutLogs || []} />
    </div>
  )
}
