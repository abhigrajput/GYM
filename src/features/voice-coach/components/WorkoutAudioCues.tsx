"use client"

import { useEffect, useRef } from "react"
import { useVoiceCoach } from "@/features/voice-coach/hooks/useVoiceCoach"

const motivation = [
  "Bas thoda aur bhai!",
  "Teri progress dekh — pehle se bahut better hai!",
  "Ye set tere liye easy lagega aaj!",
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
        `Chalte hain bhai! ${currentExercise.name} — ${currentExercise.sets} sets, ${currentExercise.reps} reps. ${
          currentExercise.hinglish_tip || "Form pe focus rakho."
        }`
      )
    }
  }, [currentExercise, enabled, speak])

  useEffect(() => {
    if (!enabled) return
    if (setsCompleted > prevSetRef.current && setsCompleted <= totalSets) {
      speak(`Set ${setsCompleted} ho gaya! ${restSeconds} seconds rest le. ${motivation[Math.floor(Math.random() * motivation.length)]}`)
    }
    prevSetRef.current = setsCompleted
  }, [enabled, restSeconds, setsCompleted, speak, totalSets])

  useEffect(() => {
    if (!enabled) return
    if (restSeconds === 3) speak("3... 2... 1... next set shuru!")
  }, [enabled, restSeconds, speak])

  useEffect(() => {
    if (!enabled) return
    if (totalSets > 0 && setsCompleted === totalSets && nextExercise) {
      speak(`Exercise complete! Next hai ${nextExercise}.`)
    }
  }, [enabled, nextExercise, setsCompleted, speak, totalSets])

  useEffect(() => {
    if (!enabled) return
    if (totalSets > 0 && setsCompleted > totalSets) {
      speak("Bhai aaj ka workout complete! Mast kiya tune aaj. Kal phir milenge!")
    }
  }, [enabled, setsCompleted, speak, totalSets])

  return <span className="hidden">{isSpeaking ? "speaking" : "idle"}</span>
}
