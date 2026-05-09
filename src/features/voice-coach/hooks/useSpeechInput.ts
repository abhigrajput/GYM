"use client"

import { useMemo, useRef, useState } from "react"

type ParsedCommand =
  | { action: "skip_day" | "next" | "start_timer" }
  | { exercise: string; weight: number; reps: number }
  | null

function parseTranscript(text: string): ParsedCommand {
  const t = text.toLowerCase()
  if (t.includes("skip day") || t.includes("skip today")) return { action: "skip_day" }
  if (t.includes("next exercise")) return { action: "next" }
  if (t.includes("timer start")) return { action: "start_timer" }

  const match = t.match(/(\d+)\s*(kilo|kg)?\s+(.+?)\s+(\d+)\s*(rep|reps)/)
  if (match) {
    return {
      weight: Number(match[1]),
      exercise: match[3].trim(),
      reps: Number(match[4]),
    }
  }
  return null
}

export function useSpeechInput() {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null

  const startListening = () => {
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.")
      return
    }
    setError(null)
    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (e: any) => setError(e.error || "Speech recognition error")
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript || ""
      setTranscript(text)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop?.()
    setIsListening(false)
  }

  const parsedCommand = useMemo(() => parseTranscript(transcript), [transcript])

  return { transcript, parsedCommand, isListening, startListening, stopListening, error }
}
