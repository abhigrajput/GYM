"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ActiveWorkout } from "./ActiveWorkout"
import { useOfflineWorkout } from "@/features/offline/hooks/useOfflineWorkout"

export function WorkoutPlanView({ plan, memberId = "current" }: { plan: any; memberId?: string }) {
  const [dayIndex, setDayIndex] = useState(0)
  const [activeMode, setActiveMode] = useState(false)
  const { cachedWorkout, isFromCache } = useOfflineWorkout(memberId, plan)
  const resolvedPlan = plan || cachedWorkout
  const days = useMemo(() => resolvedPlan?.plan_json?.days || [], [resolvedPlan])
  const selectedDay = days[dayIndex]

  const dayLabels = useMemo(
    () => days.map((d: any, i: number) => d.day_name || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i] || `Day ${i + 1}`),
    [days]
  )

  if (!resolvedPlan) return null
  if (activeMode) return <ActiveWorkout exercises={selectedDay?.exercises || []} onEnd={() => setActiveMode(false)} />

  return (
    <Card className="space-y-4">
      <h3 className="text-xl font-semibold">{resolvedPlan.plan_name}</h3>
      {isFromCache ? <p className="text-xs text-[#F59E0B]">Offline cached plan loaded</p> : null}

      <div className="flex flex-wrap gap-2">
        {dayLabels.map((label: string, i: number) => (
          <button
            key={label}
            onClick={() => setDayIndex(i)}
            className={`rounded-lg border px-3 py-1 text-sm ${dayIndex === i ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {selectedDay ? (
        <div className="space-y-3">
          <section>
            <h4 className="text-sm font-semibold text-[#94A3B8]">Warmup</h4>
            <ul className="text-sm">
              {(selectedDay.warmup || []).map((w: any) => (
                <li key={`${w.exercise}-${w.duration}`}>• {w.exercise} ({w.duration})</li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-[#94A3B8]">Exercises</h4>
            {(selectedDay.exercises || []).map((ex: any) => (
              <details key={ex.name} className="rounded-xl border border-[#1A2332] p-3">
                <summary className="cursor-pointer font-semibold">
                  {ex.name} <span className="ml-2 text-xs text-[#94A3B8]">{ex.sets} x {ex.reps}</span>
                </summary>
                <p className="mt-2 text-sm text-[#94A3B8]">Equipment: {ex.equipment_required}</p>
                <p className="text-sm italic text-[#0ECFB0]">{ex.hinglish_tip}</p>
                <p className="text-xs text-[#94A3B8]">Substitution: {ex.substitution}</p>
              </details>
            ))}
          </section>
          <section>
            <h4 className="text-sm font-semibold text-[#94A3B8]">Cooldown</h4>
            <ul className="text-sm">
              {(selectedDay.cooldown || []).map((c: any) => (
                <li key={`${c.exercise}-${c.duration}`}>• {c.exercise} ({c.duration})</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      <Button onClick={() => setActiveMode(true)}>Start Today&apos;s Workout</Button>
    </Card>
  )
}
