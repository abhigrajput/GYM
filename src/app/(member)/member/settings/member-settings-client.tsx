"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MemberSettingsClient() {
  const [profile, setProfile] = useState<any>({})
  const [member, setMember] = useState<any>({})
  const [whatsappReminder, setWhatsappReminder] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      const { data: m } = await supabase.from("members").select("*").eq("profile_id", user.id).maybeSingle()
      setProfile(p || {})
      setMember(m || {})
    }
    void load()
  }, [])

  const saveProfile = async () => {
    const supabase = createClient()
    await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      city: profile.city,
    }).eq("id", profile.id)
  }

  const saveFitness = async () => {
    const supabase = createClient()
    await supabase.from("members").update({
      goal: member.goal,
      current_level: member.current_level,
      days_per_week: Number(member.days_per_week || 4),
      injury_notes: member.injury_notes,
    }).eq("id", member.id)
  }

  const changePassword = async () => {
    const supabase = createClient()
    const newPassword = prompt("Enter new password (min 8 chars)")
    if (!newPassword) return
    await supabase.auth.updateUser({ password: newPassword })
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    alert("Account deletion request received. Contact support for final removal.")
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Profile settings</h2>
        <Input label="Name" value={profile.full_name || ""} onChange={(e) => setProfile((p: any) => ({ ...p, full_name: e.target.value }))} />
        <Input label="Phone" value={profile.phone || ""} onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))} />
        <Input label="City" value={profile.city || ""} onChange={(e) => setProfile((p: any) => ({ ...p, city: e.target.value }))} />
        <Button onClick={saveProfile}>Save Profile</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Fitness settings</h2>
        <select className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3" value={member.goal || "muscle_gain"} onChange={(e) => setMember((m: any) => ({ ...m, goal: e.target.value }))}>
          <option value="fat_loss">Fat Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="strength">Strength</option>
          <option value="endurance">Endurance</option>
          <option value="aesthetics">Aesthetics</option>
        </select>
        <select className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3" value={member.current_level || "beginner"} onChange={(e) => setMember((m: any) => ({ ...m, current_level: e.target.value }))}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <Input label="Days per week" type="number" value={String(member.days_per_week || 4)} onChange={(e) => setMember((m: any) => ({ ...m, days_per_week: e.target.value }))} />
        <textarea className="min-h-20 w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3 text-sm" placeholder="Injuries" value={member.injury_notes || ""} onChange={(e) => setMember((m: any) => ({ ...m, injury_notes: e.target.value }))} />
        <Button onClick={saveFitness}>Save Fitness</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Notification settings</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={whatsappReminder} onChange={(e) => setWhatsappReminder(e.target.checked)} />
          WhatsApp reminders
        </label>
        <Button variant="outline">Save Notification Preferences</Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <Button onClick={changePassword}>Change Password</Button>
        <Input label="Type DELETE to confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
        <Button variant="danger" onClick={deleteAccount}>Delete Account</Button>
      </Card>
    </div>
  )
}
