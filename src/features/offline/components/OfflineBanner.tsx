"use client"

import { useEffect, useState } from "react"

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const check = () => setOnline(navigator.onLine)
    window.addEventListener("online", check)
    window.addEventListener("offline", check)
    const int = setInterval(check, 5000)
    return () => {
      window.removeEventListener("online", check)
      window.removeEventListener("offline", check)
      clearInterval(int)
    }
  }, [])

  if (online || dismissed) return null
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-[#F59E0B] px-4 py-2 text-sm text-black">
      <span>Offline mode — cached workout available</span>
      <button onClick={() => setDismissed(true)} className="font-semibold">
        Dismiss
      </button>
    </div>
  )
}
