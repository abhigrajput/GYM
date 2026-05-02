"use client"

import { Mic, Loader2, Volume2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSpeechInput } from "@/features/voice-coach/hooks/useSpeechInput"

type VoiceState = "idle" | "listening" | "processing" | "speaking"

export function VoiceCoachButton({
  isSpeaking = false,
  onCommand,
}: {
  isSpeaking?: boolean
  onCommand?: (cmd: any) => void
}) {
  const { transcript, parsedCommand, isListening, startListening, stopListening } = useSpeechInput()
  const [state, setState] = useState<VoiceState>("idle")

  useEffect(() => {
    if (isListening) setState("listening")
    else if (isSpeaking) setState("speaking")
    else setState("idle")
  }, [isListening, isSpeaking])

  useEffect(() => {
    if (!parsedCommand) return
    setState("processing")
    if (navigator.vibrate) navigator.vibrate(30)
    onCommand?.(parsedCommand)
    const t = setTimeout(() => setState("idle"), 500)
    return () => clearTimeout(t)
  }, [onCommand, parsedCommand])

  const icon = useMemo(() => {
    if (state === "processing") return <Loader2 className="h-5 w-5 animate-spin" />
    if (state === "speaking") return <Volume2 className="h-5 w-5" />
    return <Mic className="h-5 w-5" />
  }, [state])

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {transcript ? <div className="mb-2 max-w-56 rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-xs">{transcript}</div> : null}
      <button
        className="relative rounded-full bg-[#0ECFB0] p-4 text-black shadow-lg"
        onClick={isListening ? stopListening : startListening}
      >
        {state === "listening" ? <span className="absolute inset-0 animate-ping rounded-full border-2 border-[#0ECFB0]" /> : null}
        {icon}
      </button>
    </div>
  )
}
