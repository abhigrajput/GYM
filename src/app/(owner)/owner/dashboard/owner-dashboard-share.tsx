"use client"

import { useState } from "react"
import { toast } from "sonner"
import { GradientButton } from "@/components/ui/gradient-button"

export function OwnerDashboardShare({ gymCode }: { gymCode: string }) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ironiq.vercel.app"
  const shareText = `Join my gym on IronIQ! Code: ${gymCode} — ${origin}/join/${gymCode}`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gymCode)
      setCopied(true)
      toast.success("Gym code copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Copy failed")
    }
  }

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success("Share text copied")
    } catch {
      toast.error("Copy failed")
    }
  }

  const wa = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void copyCode()}
        className="rounded border border-[#00FF41]/40 bg-black px-4 py-2 font-mono text-sm text-[#00FF41] hover:border-[#00FF41]"
      >
        GYM CODE: {gymCode}
        {copied ? " ✓" : ""}
      </button>
      <GradientButton size="sm" variant="outline" onClick={() => void shareLink()}>
        COPY LINK
      </GradientButton>
      <GradientButton size="sm" variant="ghost" onClick={wa}>
        WhatsApp
      </GradientButton>
    </div>
  )
}
