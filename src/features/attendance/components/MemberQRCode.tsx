"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function MemberQRCode({
  memberId,
  memberName,
  gymName,
}: {
  memberId: string
  memberName: string
  gymName: string
}) {
  const [image, setImage] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/attendance/qr?memberId=${memberId}`)
    const data = await res.json()
    if (res.ok) setImage(data.qrImageBase64)
    setLoading(false)
  }, [memberId])

  useEffect(() => {
    void load()
    const int = setInterval(() => void load(), 4 * 60 * 1000)
    return () => clearInterval(int)
  }, [load])

  return (
    <Card className="space-y-3 text-center">
      <p className="text-sm text-[#94A3B8]">Show karo gym owner ko</p>
      {image ? (
        <Image
          src={image}
          alt="Member QR"
          width={256}
          height={256}
          unoptimized
          className="mx-auto h-64 w-64 rounded-xl bg-white p-2"
        />
      ) : (
        <p>{loading ? "Loading..." : "QR unavailable"}</p>
      )}
      <p className="font-semibold">{memberName}</p>
      <p className="text-sm text-[#94A3B8]">{gymName}</p>
      <div className="flex justify-center gap-2">
        <Button onClick={load}>Refresh</Button>
        <Button
          variant="outline"
          onClick={() => {
            const a = document.createElement("a")
            a.href = image
            a.download = "ironiq-qr.png"
            a.click()
          }}
        >
          Download QR
        </Button>
      </div>
    </Card>
  )
}
