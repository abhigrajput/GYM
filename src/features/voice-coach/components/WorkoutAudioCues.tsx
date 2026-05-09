"use client"

import { useEffect, useRef } from "react"
import { useVoiceCoach } from "@/features/voice-coach/hooks/useVoiceCoach"

const motivation = [
  "One more rep. Stay focused.",
  "Your progress is improving every session.",
  "This set is under control. Keep form tight.",
]

export function WorkoutAudioCues({
  currentExercise,
  setsCompleted,
  totalSets,
  restSeconds,
  nextExercise,
  enabled = true,
}: {
  currentExercise?: { name: string; sets: number; reps: string; hinglish_tip?: string }
  setsCompleted: number
  totalSets: number
  restSeconds: number
  nextExercise?: string
  enabled?: boolean
}) {
  const { speak, isSpeaking } = useVoiceCoach()
  const prevSetRef = useRef(setsCompleted)
  const prevExerciseRef = useRef(currentExercise?.name)

  useEffect(() => {
    if (!enabled || !currentExercise) return
    if (prevExerciseRef.current !== currentExercise.name) {
      prevExerciseRef.current = currentExercise.name
      speak(
        `Let's go. ${currentExercise.name} — ${currentExercise.sets} sets, ${currentExercise.reps} reps. ${
          currentExercise.hinglish_tip || "Keep your form strict."
        }`
      )
    }
  }, [currentExercise, enabled, speak])

  useEffect(() => {
    if (!enabled) return
    if (setsCompleted > prevSetRef.current && setsCompleted <= totalSets) {
      speak(`Set ${setsCompleted} complete. Rest for ${restSeconds} seconds. ${motivation[Math.floor(Math.random() * motivation.length)]}`)
    }
    prevSetRef.current = setsCompleted
  }, [enabled, restSeconds, setsCompleted, speak, totalSets])

  useEffect(() => {
    if (!enabled) return
    if (restSeconds === 3) speak("3... 2... 1... start next set.")
  }, [enabled, restSeconds, speak])

  useEffect(() => {
    if (!enabled) return
    if (totalSets > 0 && setsCompleted === totalSets && nextExercise) {
      speak(`Exercise complete. Next: ${nextExercise}.`)
    }
  }, [enabled, nextExercise, setsCompleted, speak, totalSets])

  useEffect(() => {
    if (!enabled) return
    if (totalSets > 0 && setsCompleted > totalSets) {
      speak("Workout complete. Great effort today. See you tomorrow.")
    }
  }, [enabled, setsCompleted, speak, totalSets])

  return <span className="hidden">{isSpeaking ? "speaking" : "idle"}</span>
}
