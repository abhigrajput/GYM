"use client"

import { useCallback, useEffect, useState } from "react"

export function useVoiceCoach() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const hindi = voices.find((v) => v.lang.toLowerCase().startsWith("hi"))
      const english = voices.find((v) => v.lang.toLowerCase().startsWith("en"))
      setVoice(hindi || english || voices[0] || null)
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string, rate = 0.85, pitch = 1) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return
      stopSpeaking()
      const utterance = new SpeechSynthesisUtterance(text)
      if (voice) utterance.voice = voice
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [stopSpeaking, voice]
  )

  return { speak, stopSpeaking, isSpeaking }
}
