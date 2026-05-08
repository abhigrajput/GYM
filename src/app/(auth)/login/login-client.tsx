"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Dumbbell, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassInput } from "@/components/ui/glass-input"
import { GradientButton } from "@/components/ui/gradient-button"

type Tab = "email" | "phone"

export default function LoginClient() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
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
      toast.error("Session not found.")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const next =
      profile?.role === "owner"
        ? "/owner/dashboard"
        : profile?.role === "admin"
          ? "/admin/dashboard"
          : "/member/dashboard"
    router.replace(next)
    setLoading(false)
  }

  const sendOtp = async () => {
    setLoading(true)
    const supabase = createClient()
    const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized })
    if (error) toast.error(error.message || "OTP failed")
    else {
      toast.success("OTP bhej diya!")
      setOtpSent(true)
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    const supabase = createClient()
    const normalized = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`
    const { error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token: otp,
      type: "sms",
    })
    if (error) {
      toast.error(error.message || "Verify failed")
      setLoading(false)
      return
    }
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.replace("/member/dashboard")
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const next =
      profile?.role === "owner"
        ? "/owner/dashboard"
        : profile?.role === "admin"
          ? "/admin/dashboard"
          : "/member/dashboard"
    router.replace(next)
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
      <GlassCard className="p-8">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-cyan-400" />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
              IronIQ
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">Wapas aa gaye 💪</h1>
          <p className="mt-1 text-sm text-white/55">Login karo aur continue karo</p>
        </div>

        <div className="mb-6 flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(["email", "phone"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                tab === t ? "bg-white/10 text-white shadow-inner" : "text-white/45 hover:text-white"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "email" ? "Email" : "Phone OTP"}
            </button>
          ))}
        </div>

        {tab === "email" ? (
          <div className="space-y-4">
            <GlassInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              icon={<Mail className="h-4 w-4" />}
            />
            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
            />
            <GradientButton className="w-full" onClick={() => void onEmailLogin()} loading={loading}>
              Login
            </GradientButton>
            <p className="text-center text-xs text-white/45">Forgot password? Reset via email from Supabase Auth.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <GlassInput
              label="Phone (+91)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
            />
            {!otpSent ? (
              <GradientButton className="w-full" onClick={() => void sendOtp()} loading={loading}>
                OTP Bhejo
              </GradientButton>
            ) : (
              <>
                <GlassInput label="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                <GradientButton className="w-full" onClick={() => void verifyOtp()} loading={loading}>
                  Verify
                </GradientButton>
              </>
            )}
          </div>
        )}

        <div className="relative my-6 py-1">
          <div className="border-t border-white/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050B12] px-2 text-xs text-white/40">
            ya phir
          </span>
        </div>

        <GradientButton variant="secondary" className="w-full" onClick={() => void onGoogleLogin()}>
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-white text-[10px] font-bold text-blue-600">
            G
          </span>
          Google se login karo
        </GradientButton>

        <p className="mt-6 text-center text-sm text-white/50">
          Naya account?{" "}
          <Link className="text-cyan-400 hover:underline" href="/signup">
            Signup
          </Link>
        </p>
      </GlassCard>
    </motion.div>
  )
}
