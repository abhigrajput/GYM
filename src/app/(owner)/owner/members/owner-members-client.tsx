"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function OwnerMembersClient() {
  const [gymId, setGymId] = useState<string>("")
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    durationMonths: "3",
    startDate: new Date().toISOString().slice(0, 10),
    monthlyFee: "799",
    goal: "muscle_gain",
    level: "beginner",
    trainerId: "",
  })

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data: gym } = await supabase.from("gyms").select("id").eq("owner_id", user.id).maybeSingle()
      if (gym?.id) setGymId(gym.id)
    }
    void init()
  }, [])

  const loadMembers = useCallback(async () => {
    if (!gymId) return
    const res = await fetch(`/api/members?gymId=${gymId}&status=${status}`)
    const data = await res.json()
    if (res.ok) setMembers(data.members || [])
  }, [gymId, status])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m?.id?.toLowerCase().includes(search.toLowerCase()) ||
          String(m?.phone || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [members, search]
  )

  const addMember = async () => {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, gymId }),
    })
    if (res.ok) {
      setShowAdd(false)
      await loadMembers()
      await fetch("/api/whatsapp/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "welcome_message", name: form.fullName, link: `${window.location.origin}/member/dashboard` }),
      })
    }
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Members <span className="rounded-full bg-[#1A2332] px-2 py-1 text-sm">{filtered.length}</span>
        </h1>
        <Button onClick={() => setShowAdd(true)}>Add Member</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search name/phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        {["all", "active", "trial", "expired"].map((s) => (
          <button key={s} className={`rounded-xl border px-3 py-2 text-sm ${status === s ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`} onClick={() => setStatus(s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-[#94A3B8]">
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th>Goal</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Streak</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const color = m.current_level === "advanced" ? "bg-[#10B981]" : m.current_level === "intermediate" ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
              const stColor = m.membership_status === "active" ? "text-[#10B981]" : m.membership_status === "trial" ? "text-[#F59E0B]" : "text-[#EF4444]"
              return (
                <tr key={m.id} className="border-t border-[#1A2332]">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${color}`}>M</span>
                      <div>
                        <p>Member {m.id.slice(0, 4)}</p>
                        <p className="text-xs text-[#94A3B8]">{m.phone || "--"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="capitalize">{m.current_level}</td>
                  <td className="capitalize">{String(m.goal).replace("_", " ")}</td>
                  <td className={`capitalize ${stColor}`}>{m.membership_status}</td>
                  <td className={`${m.expiry_date && new Date(m.expiry_date) < new Date(Date.now() + 7 * 86400000) ? "text-[#EF4444]" : ""}`}>{m.expiry_date}</td>
                  <td>🔥 {m.streak_count || 0}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(m)}>
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelected(m)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const res = await fetch("/api/whatsapp/reminder", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ type: "renewal_reminder", name: `Member ${m.id.slice(0, 4)}`, date: m.expiry_date, link: `${window.location.origin}/owner/members` }),
                          })
                          const data = await res.json()
                          window.open(data.waUrl, "_blank")
                        }}
                      >
                        Send WhatsApp
                      </Button>
                      <Button size="sm" variant="danger" onClick={async () => { await fetch(`/api/members/${m.id}`, { method: "DELETE" }); await loadMembers() }}>
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      <div className="space-y-2 md:hidden">
        {filtered.map((m) => (
          <Card key={m.id}>
            <p className="font-semibold">Member {m.id.slice(0, 4)}</p>
            <p className="text-xs text-[#94A3B8]">{m.phone || "--"}</p>
            <p className="text-sm capitalize">{m.current_level} • {String(m.goal).replace("_", " ")}</p>
            <p className="text-xs">🔥 {m.streak_count || 0}</p>
          </Card>
        ))}
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-xl space-y-3">
            <h3 className="text-lg font-semibold">Add Member</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
              <Input label="Phone (+91)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <Input label="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Duration months" type="number" value={form.durationMonths} onChange={(e) => setForm((f) => ({ ...f, durationMonths: e.target.value }))} />
              <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              <Input label="Monthly Fee" type="number" value={form.monthlyFee} onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))} />
              <select className="rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-sm" value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}>
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="aesthetics">Aesthetics</option>
              </select>
              <select className="rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-sm" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addMember}>Submit</Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Close</Button>
            </div>
          </Card>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-[#1A2332] bg-[#0F1520] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Member Profile</h3>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <p className="text-sm">Member {selected.id.slice(0, 4)}</p>
          <p className="text-sm text-[#94A3B8]">Expiry: {selected.expiry_date}</p>
          <Card className="mt-3">
            <p className="font-semibold">Trainer Notes</p>
            <textarea className="mt-2 min-h-20 w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-2 text-sm" />
          </Card>
          <Button
            className="mt-3"
            onClick={async () => {
              const res = await fetch("/api/whatsapp/reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "renewal_reminder", name: `Member ${selected.id.slice(0, 4)}`, date: selected.expiry_date, link: `${window.location.origin}/owner/members` }),
              })
              const data = await res.json()
              window.open(data.waUrl, "_blank")
            }}
          >
            Send Renewal
          </Button>
        </div>
      ) : null}
    </div>
  )
}
