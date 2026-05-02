"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type Props = {
  memberId: string
  goal?: string | null
  measurements: any[]
  workoutLogs: any[]
}

export function ProgressDashboard({ memberId, goal, measurements: initialMeasurements, workoutLogs }: Props) {
  const [tab, setTab] = useState<"body" | "strength" | "history" | "photos">("body")
  const [measurements, setMeasurements] = useState(initialMeasurements || [])
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ weight: "", chest: "", waist: "", arms: "", height: "" })
  const [selectedExercise, setSelectedExercise] = useState("")
  const [photoDateA, setPhotoDateA] = useState("")
  const [photoDateB, setPhotoDateB] = useState("")

  const latest = measurements[0] || {}
  const prev = measurements[1] || {}
  const delta = {
    weight: (latest.weight || 0) - (prev.weight || 0),
    chest: (latest.chest || 0) - (prev.chest || 0),
    waist: (latest.waist || 0) - (prev.waist || 0),
    arms: ((latest.left_arm || 0) + (latest.right_arm || 0)) / 2 - ((prev.left_arm || 0) + (prev.right_arm || 0)) / 2,
  }

  const bodyType = useMemo(() => {
    const w = Number(latest.weight || 0)
    if (w < 55) return { label: "Ectomorph", desc: "Lean frame, focus calorie surplus and strength." }
    if (w < 75) return { label: "Mesomorph", desc: "Balanced build, responds quickly to training." }
    return { label: "Endomorph", desc: "Higher fat retention, keep cardio + protein high." }
  }, [latest.weight])

  const parsedProgress = useMemo(() => {
    const rows: { date: string; name: string; weight: number; reps: number }[] = []
    ;(workoutLogs || []).forEach((log) => {
      const list = log.exercises_json?.exercises || []
      list.forEach((ex: any) => rows.push({ date: log.workout_date, name: ex.name, weight: Number(ex.weight || 0), reps: Number(ex.reps || 0) }))
    })
    return rows
  }, [workoutLogs])

  const exercises = Array.from(new Set(parsedProgress.map((p) => p.name))).filter(Boolean)
  const selectedProgress = parsedProgress.filter((p) => p.name === (selectedExercise || exercises[0]))
  const topPRs = [...parsedProgress].sort((a, b) => b.weight - a.weight).slice(0, 5)

  const saveMeasurement = async () => {
    const res = await fetch("/api/progress/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        measured_at: new Date().toISOString().slice(0, 10),
        weight: Number(form.weight || 0) || null,
        chest: Number(form.chest || 0) || null,
        waist: Number(form.waist || 0) || null,
        left_arm: Number(form.arms || 0) || null,
        right_arm: Number(form.arms || 0) || null,
      }),
    })
    const data = await res.json()
    if (res.ok) setMeasurements(data.measurements || [])
  }

  const photoRows = measurements.filter((m) => m.photo_url)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["body", "Body Stats"],
          ["strength", "Strength Progress"],
          ["history", "Workout History"],
          ["photos", "Body Photos"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rounded-xl border px-3 py-2 text-sm ${tab === k ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`}
            onClick={() => setTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "body" ? (
        <Card className="space-y-4">
          <Button variant="outline" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? "Form Hide Karo" : "Measurement Form Khollo"}
          </Button>
          {formOpen ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Weight (kg)" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
              <Input label="Chest (cm)" value={form.chest} onChange={(e) => setForm((f) => ({ ...f, chest: e.target.value }))} />
              <Input label="Waist (cm)" value={form.waist} onChange={(e) => setForm((f) => ({ ...f, waist: e.target.value }))} />
              <Input label="Arms (cm)" value={form.arms} onChange={(e) => setForm((f) => ({ ...f, arms: e.target.value }))} />
              <Input label="Height (cm)" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} />
              <Button onClick={saveMeasurement}>Aaj Ka Measurement Save Karo</Button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Weight", latest.weight, delta.weight],
              ["Chest", latest.chest, delta.chest],
              ["Waist", latest.waist, delta.waist],
              ["Arms", ((latest.left_arm || 0) + (latest.right_arm || 0)) / 2 || "--", delta.arms],
            ].map(([name, value, d]: any) => (
              <Card key={name}>
                <p className="text-xs text-[#94A3B8]">{name}</p>
                <p className="text-xl font-semibold">{value || "--"}</p>
                <p className={`text-xs ${(goal === "fat_loss" && d < 0) || (goal === "muscle_gain" && d > 0) ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                  {d > 0 ? "+" : ""}
                  {Number(d || 0).toFixed(1)}
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <p className="font-semibold">{bodyType.label}</p>
            <p className="text-sm text-[#94A3B8]">{bodyType.desc}</p>
          </Card>

          <div className="space-y-2">
            {measurements.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-[#1A2332] p-2 text-sm">
                {m.measured_at} — W:{m.weight} C:{m.chest} Wst:{m.waist} A:{((m.left_arm || 0) + (m.right_arm || 0)) / 2}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === "strength" ? (
        <Card className="space-y-4">
          <select
            className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] px-4 py-3 text-sm"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {(exercises.length ? exercises : ["No Exercise"]).map((ex) => (
              <option key={ex}>{ex}</option>
            ))}
          </select>
          <div className="overflow-x-auto">
            <svg width="700" height="220" className="rounded-xl border border-[#1A2332] bg-[#0F1520]">
              {selectedProgress.map((p, i) => {
                const x = 40 + i * 60
                const y = 180 - p.weight * 1.5
                const next = selectedProgress[i + 1]
                const nx = 40 + (i + 1) * 60
                const ny = next ? 180 - next.weight * 1.5 : y
                return (
                  <g key={`${p.date}-${i}`}>
                    <circle cx={x} cy={y} r={4} fill="#0ECFB0">
                      <title>{`${p.date}: ${p.weight}kg x ${p.reps}`}</title>
                    </circle>
                    {next ? <line x1={x} y1={y} x2={nx} y2={ny} stroke="#0ECFB0" strokeWidth="2" /> : null}
                    <text x={x - 12} y={205} fill="#94A3B8" fontSize="10">
                      {p.date?.slice(5)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          {topPRs[0] ? <p className="rounded-xl bg-[#1A2332] px-3 py-2 text-sm">Personal Record: {topPRs[0].weight}kg {topPRs[0].name} on {topPRs[0].date}</p> : null}
          <div className="space-y-1 text-sm">
            {topPRs.map((pr, i) => (
              <p key={`${pr.name}-${i}`}>#{i + 1} {pr.name} — {pr.weight}kg ({pr.date})</p>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === "history" ? (
        <Card className="space-y-3">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => {
              const log = workoutLogs[i]
              return <div key={i} className={`h-5 rounded ${log ? "bg-[#10B981]" : "bg-[#1A2332]"}`} />
            })}
          </div>
          {(workoutLogs || []).slice(0, 10).map((log: any) => (
            <details key={log.id} className="rounded-xl border border-[#1A2332] p-3">
              <summary className="cursor-pointer text-sm">
                {log.workout_date} — {log.duration_minutes || 0} mins — {(log.exercises_json?.exercises || []).length} exercises
              </summary>
              <pre className="mt-2 overflow-x-auto text-xs text-[#94A3B8]">{JSON.stringify(log.exercises_json, null, 2)}</pre>
            </details>
          ))}
        </Card>
      ) : null}

      {tab === "photos" ? (
        <Card className="space-y-4">
          <p className="text-sm text-[#94A3B8]">Upload endpoint should store images in Supabase bucket `progress-photos`.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photoRows.map((m: any) => (
              <div key={m.id} className="space-y-1">
                <Image
                  src={m.photo_url}
                  alt={m.measured_at}
                  width={300}
                  height={160}
                  className="h-28 w-full rounded-xl object-cover"
                />
                <p className="text-xs">{m.measured_at}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select className="rounded-xl border border-[#1A2332] bg-[#0F1520] p-2 text-sm" value={photoDateA} onChange={(e) => setPhotoDateA(e.target.value)}>
              <option value="">Date A</option>
              {photoRows.map((m: any) => <option key={`a-${m.id}`} value={m.measured_at}>{m.measured_at}</option>)}
            </select>
            <select className="rounded-xl border border-[#1A2332] bg-[#0F1520] p-2 text-sm" value={photoDateB} onChange={(e) => setPhotoDateB(e.target.value)}>
              <option value="">Date B</option>
              {photoRows.map((m: any) => <option key={`b-${m.id}`} value={m.measured_at}>{m.measured_at}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[photoDateA, photoDateB].map((date, idx) => {
              const row = photoRows.find((m: any) => m.measured_at === date)
              return row ? (
                <Image
                  key={idx}
                  src={row.photo_url}
                  alt={date}
                  width={500}
                  height={300}
                  className="h-40 w-full rounded-xl object-cover"
                />
              ) : (
                <div key={idx} className="h-40 rounded-xl border border-dashed border-[#1A2332]" />
              )
            })}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
