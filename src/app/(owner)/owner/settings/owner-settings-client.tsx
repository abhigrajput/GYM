"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function OwnerSettingsClient() {
  const [gym, setGym] = useState<any>({})
  const [renewalDays, setRenewalDays] = useState(7)
  const [trainerPhone, setTrainerPhone] = useState("")
  const [trainers, setTrainers] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("gyms").select("*").eq("owner_id", user.id).maybeSingle()
      setGym(data || {})
    }
    void load()
  }, [])

  const saveGym = async () => {
    const supabase = createClient()
    await supabase.from("gyms").update({
      name: gym.name,
      address: gym.address,
      phone: gym.phone,
      whatsapp: gym.whatsapp,
      monthly_fee: Number(gym.monthly_fee || 0),
    }).eq("id", gym.id)
  }

  const addTrainer = () => {
    if (!trainerPhone.trim()) return
    setTrainers((t) => [...t, trainerPhone.trim()])
    setTrainerPhone("")
  }

  const deactivateGym = async () => {
    const ok = confirm("Deactivate gym account?")
    if (!ok) return
    const supabase = createClient()
    await supabase.from("gyms").update({ is_active: false }).eq("id", gym.id)
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Owner Settings</h1>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Gym settings</h2>
        <Input label="Gym Name" value={gym.name || ""} onChange={(e) => setGym((g: any) => ({ ...g, name: e.target.value }))} />
        <Input label="Address" value={gym.address || ""} onChange={(e) => setGym((g: any) => ({ ...g, address: e.target.value }))} />
        <Input label="Phone" value={gym.phone || ""} onChange={(e) => setGym((g: any) => ({ ...g, phone: e.target.value }))} />
        <Input label="WhatsApp" value={gym.whatsapp || ""} onChange={(e) => setGym((g: any) => ({ ...g, whatsapp: e.target.value }))} />
        <Input label="Monthly fee" type="number" value={String(gym.monthly_fee || 0)} onChange={(e) => setGym((g: any) => ({ ...g, monthly_fee: e.target.value }))} />
        <Button onClick={saveGym}>Save Gym Settings</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Notification settings</h2>
        <label className="text-sm">Renewal reminders before expiry (days)</label>
        <div className="flex gap-2">
          {[7, 3, 1].map((d) => (
            <button key={d} className={`rounded-xl border px-3 py-2 text-sm ${renewalDays === d ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`} onClick={() => setRenewalDays(d)}>
              {d}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Trainer management</h2>
        <div className="flex gap-2">
          <Input label="Trainer phone" value={trainerPhone} onChange={(e) => setTrainerPhone(e.target.value)} />
          <Button onClick={addTrainer}>Add</Button>
        </div>
        <div className="space-y-1 text-sm">
          {trainers.map((t) => (
            <div key={t} className="flex items-center justify-between rounded-xl border border-[#1A2332] p-2">
              <span>{t}</span>
              <Button variant="ghost" size="sm" onClick={() => setTrainers((x) => x.filter((v) => v !== t))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-[#EF4444]">Danger zone</h2>
        <Button variant="danger" onClick={deactivateGym}>Deactivate gym account</Button>
      </Card>
    </div>
  )
}
