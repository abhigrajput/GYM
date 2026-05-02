"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WorkoutAudioCues } from "@/features/voice-coach/components/WorkoutAudioCues"
import { VoiceCoachButton } from "@/features/voice-coach/components/VoiceCoachButton"
import { useVoiceCoach } from "@/features/voice-coach/hooks/useVoiceCoach"

type Exercise = {
  name: string
  sets: number
  reps: string
  rest_seconds: number
  equipment_required: string
  hinglish_tip?: string
  substitution?: string
}

export function ActiveWorkout({ exercises, onEnd }: { exercises: Exercise[]; onEnd?: () => void }) {
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setDone, setSetDone] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [weightInput, setWeightInput] = useState("")
  const [repsInput, setRepsInput] = useState("")
  const { isSpeaking } = useVoiceCoach()
  const memberId = "current"

  const exercise = exercises[exerciseIndex]
  const progress = useMemo(() => ((exerciseIndex + 1) / Math.max(1, exercises.length)) * 100, [exerciseIndex, exercises.length])

  const logSet = () => {
    const nextSet = setDone + 1
    setSetDone(nextSet)
    setRestTimer(exercise?.rest_seconds || 60)
    const timer = setInterval(() => {
      setRestTimer((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)

    const payload = {
      member_id: memberId,
      measured_at: new Date().toISOString().slice(0, 10),
      weight: Number(weightInput || 0) || null,
      notes: `${exercise.name} set ${nextSet} reps ${repsInput || "-"}`,
    }
    if (!navigator.onLine) {
      const key = `ironiq_pending_logs_${memberId}`
      const queue = JSON.parse(localStorage.getItem(key) || "[]")
      queue.push(payload)
      localStorage.setItem(key, JSON.stringify(queue))
    } else {
      void fetch("/api/progress/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }
  }

  const nextExercise = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((v) => v + 1)
      setSetDone(0)
      setRestTimer(0)
    } else {
      onEnd?.()
    }
  }

  const flushQueue = async () => {
    const key = `ironiq_pending_logs_${memberId}`
    const queue = JSON.parse(localStorage.getItem(key) || "[]")
    if (!queue.length) return
    for (const item of queue) {
      await fetch("/api/progress/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
    }
    localStorage.removeItem(key)
  }

  useEffect(() => {
    const onOnline = () => {
      void flushQueue()
    }
    window.addEventListener("online", onOnline)
    return () => window.removeEventListener("online", onOnline)
  }, [])

  if (!exercise) return null

  return (
    <div className="min-h-screen bg-[#07090F] p-4">
      <div className="mb-3 flex justify-end">
        <button
          className="rounded-full border border-[#1A2332] px-3 py-1 text-sm"
          onClick={() => setVoiceEnabled((v) => !v)}
        >
          🔊 Voice {voiceEnabled ? "On" : "Off"}
        </button>
      </div>
      <div className="mb-4 h-2 rounded-full bg-[#1A2332]">
        <div className="h-2 rounded-full bg-[#0ECFB0]" style={{ width: `${progress}%` }} />
      </div>
      <Card className="space-y-4">
        <p className="text-sm text-[#94A3B8]">
          Exercise {exerciseIndex + 1} of {exercises.length}
        </p>
        <h2 className="text-2xl font-bold">{exercise.name}</h2>
        <p className="text-sm">{exercise.equipment_required}</p>
        <p className="rounded-full bg-[#1A2332] px-3 py-1 text-sm inline-block">
          {exercise.sets} sets x {exercise.reps}
        </p>
        <p className="text-sm italic text-[#0ECFB0]">{exercise.hinglish_tip}</p>

        <div className="grid grid-cols-2 gap-2">
          <Input label="Weight (kg)" type="number" placeholder="20" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
          <Input label="Reps" type="number" placeholder="12" value={repsInput} onChange={(e) => setRepsInput(e.target.value)} />
        </div>
        <Button onClick={logSet}>Log Set ({setDone}/{exercise.sets})</Button>
        {restTimer > 0 ? <p className="text-sm text-[#F59E0B]">Rest timer: {restTimer}s</p> : null}

        <Button variant="outline" onClick={nextExercise}>
          Next Exercise
        </Button>

        {!showConfirmEnd ? (
          <Button variant="danger" onClick={() => setShowConfirmEnd(true)}>
            End Workout
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="danger" onClick={onEnd}>
              Confirm End
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirmEnd(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
      <WorkoutAudioCues
        currentExercise={exercise}
        setsCompleted={setDone}
        totalSets={exercise.sets}
        restSeconds={restTimer}
        nextExercise={exercises[exerciseIndex + 1]?.name}
        enabled={voiceEnabled}
      />
      <VoiceCoachButton
        isSpeaking={isSpeaking && voiceEnabled}
        onCommand={(cmd) => {
          if (!voiceEnabled || !cmd) return
          if (cmd.action === "next") nextExercise()
          if (cmd.action === "start_timer") setRestTimer(exercise.rest_seconds || 60)
          if (cmd.action === "skip_day") onEnd?.()
          if ("exercise" in cmd) {
            setWeightInput(String(cmd.weight))
            setRepsInput(String(cmd.reps))
          }
        }}
      />
    </div>
  )
}
