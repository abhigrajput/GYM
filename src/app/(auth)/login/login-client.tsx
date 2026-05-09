"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"
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

    let { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile) {
      const emailName = user.email?.split("@")[0] || "User"
      const { data: inserted } = await supabase
        .from("profiles")
        .insert({ id: user.id, full_name: emailName, role: "member" })
        .select("role")
        .single()
      profile = inserted || { role: "member" }
    }
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
      toast.success("OTP sent")
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
    let { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    if (!profile) {
      const emailName = user.email?.split("@")[0] || "User"
      const { data: inserted } = await supabase
        .from("profiles")
        .insert({ id: user.id, full_name: emailName, role: "member" })
        .select("role")
        .single()
      profile = inserted || { role: "member" }
    }
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
    <div className="w-full max-w-sm">
      <GlassCard className="p-8 bg-[#0A0A0A]">
        <div className="mb-6">
          <p className="font-mono text-lg text-[#00FF41]">&gt; SYSTEM ACCESS</p>
          <p className="text-sm text-[#888888]">Initialize your session</p>
        </div>

        <div className="mb-6 flex border border-[#00FF41]/30 bg-black p-1">
          {(["email", "phone"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`flex-1 border-b py-2 text-xs font-mono uppercase tracking-[0.12em] transition ${
                tab === t ? "border-[#00FF41] text-[#00FF41]" : "border-transparent text-[#888888] hover:text-[#00FF41]"
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
              INITIALIZE SESSION
            </GradientButton>
            <p className="text-center text-xs text-[#888888]">Forgot password? Reset via email.</p>
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
                SEND OTP
              </GradientButton>
            ) : (
              <>
                <GlassInput label="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                <GradientButton className="w-full" onClick={() => void verifyOtp()} loading={loading}>
                  VERIFY OTP
                </GradientButton>
              </>
            )}
          </div>
        )}

        <div className="my-6 text-center text-xs text-[#666666]">— OR —</div>

        <GradientButton variant="outline" className="w-full" onClick={() => void onGoogleLogin()}>
          CONTINUE WITH GOOGLE
        </GradientButton>

        <p className="mt-6 text-center text-sm text-[#888888]">
          &gt; No account?{" "}
          <Link className="text-[#00FF41] hover:underline" href="/signup">
            CREATE ONE
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
