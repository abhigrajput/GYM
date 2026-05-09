export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const MemberQRCode = dyn(
  () => import("@/features/attendance/components/MemberQRCode").then((m) => m.MemberQRCode),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function MemberQRPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
  const { data: member } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
  if (!member || !member.gym_id) return <Card className="m-4">Member setup incomplete.</Card>
  const { data: gym } = await supabase.from("gyms").select("name").eq("id", member.gym_id).maybeSingle()

  return (
    <div className="p-4 sm:p-6">
      <MemberQRCode memberId={member.id} memberName={profile?.full_name || "Member"} gymName={gym?.name || "Gym"} />
    </div>
  )
}
