export const dynamic = "force-dynamic"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  const { data: gym } = await supabase.from("gyms").select("*").eq("owner_id", user.id).maybeSingle()
  const { data: members } = gym
    ? await supabase.from("members").select("*").eq("gym_id", gym.id).order("created_at", { ascending: false })
    : { data: [] as any[] }
  const { data: attendance } = gym
    ? await supabase
        .from("attendance")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("date", new Date().toISOString().slice(0, 10))
        .order("checked_in_at", { ascending: false })
    : { data: [] as any[] }
  const { data: equipment } = gym
    ? await supabase.from("equipment").select("*").eq("gym_id", gym.id).order("name")
    : { data: [] as any[] }

  const memberIds = (attendance || []).map((a) => a.member_id).filter(Boolean)
  const { data: attendanceMembers } = memberIds.length
    ? await supabase.from("members").select("id,profile_id").in("id", memberIds)
    : { data: [] as any[] }
  const profileIds = (attendanceMembers || []).map((m) => m.profile_id).filter(Boolean)
  const { data: attendanceProfiles } = profileIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", profileIds)
    : { data: [] as any[] }

  const activeMembers = (members || []).filter((m) => m.membership_status === "active").length
  const todayCheckins = (attendance || []).length
  const totalMembers = (members || []).length
  const revenueThisMonth = (gym?.monthly_fee || 0) * activeMembers
  const expiringThisWeek = (members || []).filter((m) => {
    if (!m.expiry_date) return false
    const d = new Date(m.expiry_date)
    const now = new Date()
    const in7 = new Date(now)
    in7.setDate(now.getDate() + 7)
    return d >= now && d <= in7
  }).length

  const lastSixMonths = [65, 70, 74, 72, 80, 86]

  const equipmentGaps = [
    { text: "Cable crossover missing — 12 members affected", show: !(equipment || []).some((e) => e.name.toLowerCase().includes("cable crossover")) },
    { text: "Second squat rack recommended — peak hour wait high", show: (equipment || []).filter((e) => e.name.toLowerCase().includes("squat rack")).length < 2 },
  ].filter((gap) => gap.show)

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Namaste, {profile?.full_name || "Owner"}! 🏋️</h1>
          <p className="text-sm text-[#94A3B8]">{gym?.name || "Your Gym"}</p>
        </div>
        <Button>Add Member</Button>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-[#94A3B8]">Total Active Members</p>
          <p className="mt-2 text-2xl font-semibold">{activeMembers}</p>
          <p className="text-xs text-[#10B981]">+8% vs last month</p>
        </Card>
        <Card>
          <p className="text-xs text-[#94A3B8]">Today&apos;s Check-ins</p>
          <p className="mt-2 text-2xl font-semibold">
            {todayCheckins} / {totalMembers}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-[#94A3B8]">Revenue This Month</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(revenueThisMonth)}</p>
        </Card>
        <Card>
          <p className="text-xs text-[#94A3B8]">Expiring This Week</p>
          <p className={`mt-2 text-2xl font-semibold ${expiringThisWeek > 0 ? "text-[#F59E0B]" : ""}`}>{expiringThisWeek}</p>
        </Card>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold">Today&apos;s Attendance</h3>
          <div className="mt-3 space-y-2">
            {(attendance || []).length === 0 ? (
              <p className="text-sm text-[#94A3B8]">No check-ins yet.</p>
            ) : (
              (attendance || []).map((entry) => {
                const member = (attendanceMembers || []).find((m) => m.id === entry.member_id)
                const p = (attendanceProfiles || []).find((item) => item.id === member?.profile_id)
                const name = p?.full_name || "Member"
                return (
                  <div key={entry.id} className="flex items-center justify-between rounded-xl border border-[#1A2332] p-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A2332] text-xs">
                        {name[0]}
                      </span>
                      <span className="text-sm">{name}</span>
                    </div>
                    <span className="text-xs text-[#94A3B8]">
                      {entry.checked_in_at ? new Date(entry.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold">Equipment Status</h3>
          <div className="mt-3 space-y-2">
            {(equipment || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${item.is_functional ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-4">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Members</h3>
            <Link href="/owner/members" className="text-sm text-[#0ECFB0]">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-[#94A3B8]">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Level</th>
                  <th className="pb-2">Goal</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Expiry Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(members || []).slice(0, 8).map((member) => {
                  const status = member.membership_status || "trial"
                  const statusColor =
                    status === "active" ? "text-[#10B981]" : status === "trial" ? "text-[#F59E0B]" : "text-[#EF4444]"
                  return (
                    <tr key={member.id} className="border-t border-[#1A2332]">
                      <td className="py-2">Member {member.id.slice(0, 4)}</td>
                      <td className="py-2 capitalize">{member.current_level || "beginner"}</td>
                      <td className="py-2 capitalize">{String(member.goal || "muscle_gain").replace("_", " ")}</td>
                      <td className={`py-2 capitalize ${statusColor}`}>{status}</td>
                      <td className="py-2">{member.expiry_date || "--"}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold">AI Equipment Analysis</h3>
          <div className="mt-3 space-y-2 text-sm text-[#94A3B8]">
            {equipmentGaps.length ? equipmentGaps.map((gap) => <p key={gap.text}>• {gap.text}</p>) : <p>Inventory looks balanced for current member load.</p>}
          </div>
          <Button className="mt-3">Full Analysis Dekho</Button>
        </Card>
        <Card>
          <h3 className="text-base font-semibold">Revenue Chart</h3>
          <div className="mt-4 flex h-40 items-end gap-2">
            {lastSixMonths.map((value, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-[#0ECFB0]/70" style={{ height: `${value}%` }} />
                <span className="text-[10px] text-[#94A3B8]">M{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
