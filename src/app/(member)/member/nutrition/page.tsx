export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const NutritionPlan = dyn(
  () => import("@/features/nutrition/components/NutritionPlan").then((m) => m.NutritionPlan),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function MemberNutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member) return <Card className="m-4">Member not found.</Card>

  return (
    <div className="p-4 sm:p-6">
      <NutritionPlan memberId={member.id} goal={member.goal || "muscle_gain"} bodyWeight={member.body_weight || 65} />
    </div>
  )
}
