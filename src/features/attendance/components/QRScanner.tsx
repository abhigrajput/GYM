"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { Card } from "@/components/ui/card"

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [todayList, setTodayList] = useState<any[]>([])

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf: number
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        scanFrame()
      } catch {
        setResult({ ok: false, message: "Camera access failed" })
      }
    }

    const scanFrame = async () => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(img.data, img.width, img.height)
      if (code?.data) {
        try {
          const qrData = JSON.parse(code.data)
          const res = await fetch("/api/attendance/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrData }),
          })
          const data = await res.json()
          if (res.ok) {
            setResult({ ok: true, message: `${data.memberName} checked in • streak ${data.streakCount}` })
            setTodayList((prev) => [{ name: data.memberName, time: data.checkInTime }, ...prev].slice(0, 20))
          } else {
            setResult({ ok: false, message: data.error || "Check-in failed" })
          }
        } catch {
          setResult({ ok: false, message: "Invalid QR data" })
        }
      }
      raf = requestAnimationFrame(scanFrame)
    }

    void start()
    return () => {
      if (raf) cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card className={`overflow-hidden ${result?.ok ? "border-[#10B981]" : result && !result.ok ? "border-[#EF4444]" : ""}`}>
        <video ref={videoRef} className="h-72 w-full rounded-xl bg-black object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
      </Card>
      {result ? <Card className={result.ok ? "text-[#10B981]" : "text-[#EF4444]"}>{result.message}</Card> : null}
      <Card>
        <h3 className="font-semibold">Today&apos;s Check-ins</h3>
        <div className="mt-2 space-y-1 text-sm">
          {todayList.map((t, i) => (
            <p key={`${t.name}-${i}`}>{t.name} — {new Date(t.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
          ))}
        </div>
      </Card>
    </div>
  )
}
