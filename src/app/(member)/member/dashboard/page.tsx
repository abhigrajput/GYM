export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { MemberDashboardClient } from "./member-dashboard-client"

export default async function MemberDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()

  const gym = member?.gym_id
    ? (await supabase.from("gyms").select("*").eq("id", member.gym_id).maybeSingle()).data
    : null

  const equipment = member?.gym_id
    ? (await supabase.from("equipment").select("*").eq("gym_id", member.gym_id)).data || []
    : []

  const plan = member
    ? (
        await supabase
          .from("workout_plans")
          .select("*")
          .eq("member_id", member.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .maybeSingle()
      ).data
    : null

  const logs = member
    ? (await supabase
        .from("workout_logs")
        .select("*")
        .eq("member_id", member.id)
        .order("workout_date", { ascending: false })
        .limit(5)).data || []
    : []

  return (
    <MemberDashboardClient
      profile={profile}
      member={member}
      gym={gym}
      equipment={equipment}
      plan={plan}
      logs={logs}
    />
  )
}
