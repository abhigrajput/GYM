export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const Leaderboard = dyn(
  () => import("@/features/social/components/Leaderboard").then((m) => m.Leaderboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function MemberLeaderboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member || !member.gym_id) return <Card className="m-4">Gym not assigned.</Card>

  const { data: members } = await supabase.from("members").select("*").eq("gym_id", member.gym_id)
  const ranked = (members || []).map((m) => ({
    ...m,
    score: Number(m.streak_count || 0) * 3 + Number(m.days_per_week || 0) * 10 + 50,
  }))
  ranked.sort((a, b) => b.score - a.score)
  const top = ranked.slice(0, 10).map((m, i) => ({ ...m, rank: i + 1 }))

  const { data: gym } = await supabase.from("gyms").select("name").eq("id", member.gym_id).maybeSingle()

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">{gym?.name || "Gym"} Leaderboard</h1>
      <Leaderboard rows={top} currentUserMemberId={member.id} />
    </div>
  )
}
