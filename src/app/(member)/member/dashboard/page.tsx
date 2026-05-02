export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { EquipmentScanner } from "@/features/equipment-scanner/components/EquipmentScanner"
import { PlanGenerator } from "@/features/workout-planner/components/PlanGenerator"
import { WorkoutPlanView } from "@/features/workout-planner/components/WorkoutPlanView"
import { Card } from "@/components/ui/card"

export default async function MemberDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member || !member.gym_id) {
    return <Card className="m-4">Gym mapping missing. Owner se connect karo.</Card>
  }

  const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", member.gym_id)
  const { data: workoutPlan } = member
    ? await supabase
        .from("workout_plans")
        .select("*")
        .eq("member_id", member.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .maybeSingle()
    : { data: null as any }

  if (!equipment || equipment.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="mb-3 text-xl font-bold">Gym equipment setup pending</h2>
        <EquipmentScanner gymId={member.gym_id} />
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="p-4 sm:p-6">
        <PlanGenerator memberId={member.id} gymId={member.gym_id} equipment={equipment} onGenerated={() => {}} />
      </div>
    )
  }

  return <div className="p-4 sm:p-6"><WorkoutPlanView plan={workoutPlan} memberId={member.id} /></div>
}
