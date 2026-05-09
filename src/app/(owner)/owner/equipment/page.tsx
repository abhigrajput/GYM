export const dynamic = "force-dynamic"

import dyn from "next/dynamic"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

const EquipmentScanner = dyn(
  () => import("@/features/equipment-scanner/components/EquipmentScanner").then((m) => m.EquipmentScanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
    ),
  }
)

export default async function OwnerEquipmentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase.from("gyms").select("*").eq("owner_id", user.id).maybeSingle()
  if (!gym) return <Card className="m-4">No gym found for owner.</Card>

  const { data: equipment } = await supabase.from("equipment").select("*").eq("gym_id", gym.id).order("category").order("name")

  const gaps = [
    !equipment?.some((e) => e.name.toLowerCase().includes("cable")) ? "Cable crossover missing — machine variety low" : null,
    !equipment?.some((e) => e.name.toLowerCase().includes("squat rack")) ? "Squat rack missing — strength members impacted" : null,
    !equipment?.some((e) => e.name.toLowerCase().includes("treadmill")) ? "Cardio option low — fat loss plans affected" : null,
  ].filter(Boolean)

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Card>
        <h2 className="text-xl font-bold">Equipment Management</h2>
        <p className="text-sm text-[#94A3B8]">Current gym: {gym.name}</p>
      </Card>

      <EquipmentScanner gymId={gym.id} />

      <Card>
        <h3 className="text-lg font-semibold">Current Equipment List</h3>
        <div className="mt-3 space-y-2">
          {(equipment || []).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#1A2332] p-3 text-sm">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-[#94A3B8]">
                  {item.category} • Qty {item.quantity}
                </p>
              </div>
              <div className="text-xs text-[#94A3B8]">Edit/Delete from API actions</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Gap Analysis</h3>
        <div className="mt-2 space-y-2 text-sm text-[#94A3B8]">
          {gaps.length ? gaps.map((g) => <p key={g}>• {g}</p>) : <p>No major equipment gaps detected.</p>}
        </div>
      </Card>
    </div>
  )
}
