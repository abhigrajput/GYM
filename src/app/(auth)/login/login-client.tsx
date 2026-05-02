"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Dumbbell, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const onEmailLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message || "Login failed")
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Session not found. Please login again.")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const nextRoute = profile?.role === "owner" ? "/owner/dashboard" : "/member/dashboard"
    router.replace(nextRoute)
    setLoading(false)
  }

  const onGoogleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    })
    if (error) toast.error(error.message || "Google login failed")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="border-[#1A2332] bg-[#0F1520]">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[#0ECFB0]">
            <Dumbbell className="h-5 w-5" />
            <span className="text-2xl font-bold">IronIQ</span>
          </div>
          <h1 className="text-2xl font-bold">Wapas aa gaye 💪</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Login karein aur apna workout continue karein</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@example.com"
            icon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
          />

          <Button className="w-full" onClick={onEmailLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="relative py-1">
            <div className="border-t border-[#1A2332]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F1520] px-2 text-xs text-[#94A3B8]">
              ya phir
            </span>
          </div>

          <Button variant="outline" className="w-full text-white" onClick={onGoogleLogin}>
            Continue with Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-[#94A3B8]">
          Naya account?{" "}
          <Link className="text-[#0ECFB0] hover:underline" href="/signup">
            Register karein
          </Link>
        </p>
      </Card>
    </motion.div>
  )
}
