"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Goal = "fat_loss" | "muscle_gain" | "strength" | "endurance" | "aesthetics"
type Level = "beginner" | "intermediate" | "advanced"

const goalOptions: { key: Goal; title: string; subtitle: string; icon: string; desc: string }[] = [
  { key: "fat_loss", title: "Fat Loss", subtitle: "Cut", icon: "🔥", desc: "Calorie burn + lean muscle" },
  { key: "muscle_gain", title: "Muscle Gain", subtitle: "Build", icon: "💪", desc: "Progressive overload focus" },
  { key: "strength", title: "Strength", subtitle: "Power", icon: "⚡", desc: "Power and heavy compounds" },
  { key: "endurance", title: "Endurance", subtitle: "Stamina", icon: "🏃", desc: "Longer sessions and capacity" },
  { key: "aesthetics", title: "Aesthetics", subtitle: "Look Better", icon: "✨", desc: "Symmetry and definition" },
]

const generatingMessages = [
  "Analyzing your goal...",
  "Checking available equipment...",
  "Building your plan...",
  "Almost ready...",
]

export function PlanGenerator({
  memberId,
  gymId,
  equipment,
  onGenerated,
}: {
  memberId: string
  gymId: string | null
  equipment: { name: string; category: string; quantity: number }[]
  onGenerated: (plan: any) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [goal, setGoal] = useState<Goal>("muscle_gain")
  const [level, setLevel] = useState<Level>("beginner")
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [injuries, setInjuries] = useState("")
  const [medical, setMedical] = useState("")
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [plan, setPlan] = useState<any>(null)

  const runGenerate = async () => {
    setStep(4)
    const int = setInterval(() => setLoadingMessageIndex((v) => (v + 1) % generatingMessages.length), 1200)
    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          gymId: gymId || null,
          level,
          goal,
          daysPerWeek,
          injuries: [injuries, medical].filter(Boolean).join("; "),
          equipment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed generating plan")
      setPlan(data.plan)
      setStep(5)
      onGenerated(data.plan)
    } finally {
      clearInterval(int)
    }
  }

  const firstDay = plan?.plan_json?.days?.[0]
  const dayOverview = plan?.plan_json?.days || []

  const actionDisabled = useMemo(() => step === 4, [step])

  if (step === 4) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-[#0ECFB0]/30" />
          <p className="text-xl font-bold text-[#0ECFB0]">IronIQ</p>
          <p className="mt-3">{generatingMessages[loadingMessageIndex]}</p>
        </Card>
      </div>
    )
  }

  if (step === 5) {
    return (
      <Card className="space-y-4">
        <h2 className="text-2xl font-bold">Your plan is ready.</h2>
        <p className="text-[#94A3B8]">{plan?.plan_name}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {dayOverview.map((day: any) => (
            <div key={day.day_number} className="rounded-xl border border-[#1A2332] p-3">
              <p className="font-semibold">{day.day_name}</p>
              <p className="text-xs text-[#94A3B8]">{(day.muscle_groups || []).join(", ")}</p>
            </div>
          ))}
        </div>
        {firstDay ? (
          <div className="space-y-2 rounded-xl border border-[#1A2332] p-3">
            <p className="font-semibold">{firstDay.day_name}</p>
            {(firstDay.exercises || []).map((ex: any) => (
              <div key={ex.name} className="rounded-lg border border-[#1A2332] p-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{ex.name}</p>
                  <span className="rounded-full bg-[#1A2332] px-2 py-0.5 text-xs">
                    {ex.sets} x {ex.reps}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">{ex.equipment_required}</p>
                <p className="text-xs italic text-[#0ECFB0]">{ex.hinglish_tip}</p>
                <details className="text-xs text-[#94A3B8]">
                  <summary>Substitution</summary>
                  {ex.substitution}
                </details>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <Button>Start Plan</Button>
          <Button variant="ghost" onClick={() => setStep(1)}>
            Generate Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      {step === 1 ? (
        <>
          <h3 className="text-lg font-semibold">STEP 1 — Goal Selection</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goalOptions.map((item) => (
              <button
                key={item.key}
                className={`rounded-2xl border p-4 text-left ${goal === item.key ? "border-[#0ECFB0]" : "border-[#1A2332]"}`}
                onClick={() => setGoal(item.key)}
              >
                <p className="text-xl">{item.icon}</p>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-[#94A3B8]">{item.subtitle}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{item.desc}</p>
              </button>
            ))}
          </div>
          <Button onClick={() => setStep(2)}>Next</Button>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <h3 className="text-lg font-semibold">STEP 2 — Level Check</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { key: "beginner", text: "Beginner (< 6 months)" },
              { key: "intermediate", text: "Intermediate (6mo - 2yr)" },
              { key: "advanced", text: "Advanced (2yr+)" },
            ].map((item) => (
              <button
                key={item.key}
                className={`rounded-xl border p-3 text-left ${level === item.key ? "border-[#0ECFB0]" : "border-[#1A2332]"}`}
                onClick={() => setLevel(item.key as Level)}
              >
                {item.text}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </>
      ) : null}

      {step === 3 ? (
        <>
          <h3 className="text-lg font-semibold">STEP 3 — Schedule</h3>
          <div className="flex flex-wrap gap-2">
            {[3, 4, 5, 6].map((d) => (
              <button
                key={d}
                className={`rounded-xl border px-4 py-2 ${daysPerWeek === d ? "border-[#0ECFB0]" : "border-[#1A2332]"}`}
                onClick={() => setDaysPerWeek(d)}
              >
                {d}
              </button>
            ))}
          </div>
          <textarea
            className="min-h-24 w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3 text-sm"
            placeholder="Describe injuries, e.g. bad knees or shoulder pain"
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
          />
          <textarea
            className="min-h-20 w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3 text-sm"
            placeholder="Medical conditions (optional)"
            value={medical}
            onChange={(e) => setMedical(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="ghost" disabled={actionDisabled} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button disabled={actionDisabled} onClick={runGenerate}>
              Generate Plan
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  )
}
