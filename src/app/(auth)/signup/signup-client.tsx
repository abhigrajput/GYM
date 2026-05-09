"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, UserRound } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassInput } from "@/components/ui/glass-input"
import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"

type Role = "member" | "owner"

export default function SignupClient() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [role, setRole] = useState<Role>("member")
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [age, setAge] = useState("")
  const [bodyWeight, setBodyWeight] = useState("")
  const [height, setHeight] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("muscle_gain")
  const [daysPerWeek, setDaysPerWeek] = useState("4")

  const [gymName, setGymName] = useState("")
  const [gymAddress, setGymAddress] = useState("")
  const [monthlyFee, setMonthlyFee] = useState("500")
  const [whatsapp, setWhatsapp] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const stepTitle = useMemo(() => {
    if (step === 1) return "> SELECT ROLE"
    if (step === 2) return "> ENTER CREDENTIALS"
    return "> CONFIRM IDENTITY"
  }, [step])

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (fullName.length < 2) e.fullName = "Name is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email"
    if (password.length < 8) e.password = "Minimum 8 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      toast.error(signUpError?.message || "Signup failed")
      setLoading(false)
      return
    }

    const userId = signUpData.user.id

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      phone,
      role,
      city,
    })
    if (profileError) {
      toast.error(profileError.message)
      setLoading(false)
      return
    }

    if (role === "owner") {
      const { data: chainData, error: chainError } = await supabase
        .from("gym_chains")
        .insert({
          name: `${gymName} Chain`,
          owner_id: userId,
        })
        .select("id")
        .single()

      if (chainError) {
        toast.error(chainError.message)
        setLoading(false)
        return
      }

      const { data: gymRow, error: gymError } = await supabase
        .from("gyms")
        .insert({
          chain_id: chainData.id,
          owner_id: userId,
          name: gymName,
          address: gymAddress,
          city,
          phone: whatsapp || phone,
          whatsapp: whatsapp || phone,
          monthly_fee: Number(monthlyFee) || 500,
        })
        .select("id, gym_code")
        .single()

      if (gymError) {
        toast.error(gymError.message)
        setLoading(false)
        return
      }

      const { error: subErr } = await supabase.from("subscriptions").insert({
        gym_id: gymRow.id,
        plan: "pro",
        amount: 2000,
        status: "active",
      })
      if (subErr) {
        toast.message("Subscription row skipped — run DB migration.", { duration: 4000 })
      }

      router.replace("/owner/dashboard")
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase.from("members").insert({
      profile_id: userId,
      age: Number(age) || null,
      body_weight: Number(bodyWeight) || null,
      height: Number(height) || null,
      goal: fitnessGoal,
      days_per_week: Number(daysPerWeek) || 4,
      language_preference: "en",
    })

    if (memberError) {
      toast.error(memberError.message)
      setLoading(false)
      return
    }

    toast.success("Account ready. Join a gym from your dashboard.")
    router.replace("/member/dashboard")
    setLoading(false)
  }

  return (
    <GlassCard className="p-6 sm:p-8 bg-[#0A0A0A]">
      <h1 className="font-mono text-lg text-[#00FF41]">{stepTitle}</h1>
      <p className="mb-6 text-xs text-[#888888]">Secure account provisioning sequence</p>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                role === "member" ? "border-[#00FF41] bg-[#00FF41]/10" : "border-[#00FF41]/20 bg-black"
              )}
              onClick={() => setRole("member")}
            >
              <UserRound className="mb-2 h-6 w-6 text-violet-300" />
              <h2 className="font-heading text-white">MEMBER</h2>
              <p className="mt-1 text-xs text-[#888888]">Free • AI Coach • Progress Tracking</p>
            </button>
            <button
              type="button"
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                role === "owner" ? "border-[#00FF41] bg-[#00FF41]/10" : "border-[#00FF41]/20 bg-black"
              )}
              onClick={() => setRole("owner")}
            >
              <Building2 className="mb-2 h-6 w-6 text-cyan-300" />
              <h2 className="font-heading text-white">GYM OWNER</h2>
              <p className="mt-1 text-xs text-white/45">₹2,000/mo • Manage Members • Analytics</p>
            </button>
          </div>
          <GradientButton className="w-full" onClick={() => setStep(2)}>
            NEXT STEP
          </GradientButton>
        </div>
      ) : step === 2 ? (
        <div className="space-y-3">
          <GlassInput label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
          <GlassInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <GlassInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <GlassInput label="Phone (+91)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <GlassInput label="City" value={city} onChange={(e) => setCity(e.target.value)} />

          {role === "member" ? (
            <>
              <GlassInput label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              <GlassInput label="Weight (kg)" type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} />
              <GlassInput label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              <div>
                <label className="text-sm text-white/55">Goal</label>
                <select
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white"
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                  <option value="aesthetics">Aesthetics</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/55">Days / week</label>
                <select
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                >
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <GlassInput label="Gym Name" value={gymName} onChange={(e) => setGymName(e.target.value)} />
              <GlassInput label="Address" value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} />
              <GlassInput label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <GlassInput label="Monthly fee (₹)" type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} />
            </>
          )}

          <div className="flex gap-2 pt-2">
            <GradientButton variant="ghost" className="flex-1" onClick={() => setStep(1)}>
              BACK
            </GradientButton>
            <GradientButton
              className="flex-1"
              onClick={() => {
                if (validateStep2()) setStep(3)
              }}
            >
              NEXT
            </GradientButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded border border-[#00FF41]/20 bg-black p-4 text-sm text-white/80">
            <p>
              <strong className="text-white">{fullName}</strong> · {email}
            </p>
            <p className="mt-2">
              {role === "member" ? `Member · ${city}` : `Owner · ${gymName} · ${city}`}
            </p>
            <p className="mt-3 text-white/50">Confirm details before account deployment.</p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-[#888888]">Deploying account...</p>
          ) : (
            <div className="flex gap-2">
              <GradientButton variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                EDIT
              </GradientButton>
              <GradientButton className="flex-1" onClick={() => void onSubmit()} loading={loading}>
                DEPLOY ACCOUNT
              </GradientButton>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}
