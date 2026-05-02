"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GradientButton } from "@/components/ui/gradient-button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function JoinGymButton({ gymId }: { gymId: string }) {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data: { user } }) => setAuthed(!!user))
  }, [])

  const join = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/gyms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Join failed")
      toast.success("Joined!")
      router.replace("/member/dashboard")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  if (authed === null) return <p className="text-sm text-white/45">Checking session…</p>

  if (!authed) {
    return (
      <Link href={`/signup?gymId=${gymId}`}>
        <GradientButton className="w-full">Signup / Login to join</GradientButton>
      </Link>
    )
  }

  return (
    <GradientButton className="w-full" loading={loading} onClick={() => void join()}>
      Join gym
    </GradientButton>
  )
}
