export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { PlanGenerator } from "@/features/workout-planner/components/PlanGenerator"
import { WorkoutPlanView } from "@/features/workout-planner/components/WorkoutPlanView"

export default async function MemberWorkoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member || !member.gym_id) {
    return <Card className="m-4">Member profile missing.</Card>
  }

  const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", member.gym_id)
  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("member_id", member.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle()

  if (!equipment || equipment.length === 0) {
    return <Card className="m-4">Pehle owner se equipment setup complete karvao.</Card>
  }

  if (!plan) {
    return (
      <div className="p-4 sm:p-6">
        <PlanGenerator memberId={member.id} gymId={member.gym_id} equipment={equipment} onGenerated={() => {}} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <WorkoutPlanView plan={plan} memberId={member.id} />
    </div>
  )
}
