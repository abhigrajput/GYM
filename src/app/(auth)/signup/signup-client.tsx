"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, UserRound } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Role = "member" | "owner"

export default function SignupClient() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
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

  const stepTitle = useMemo(() => (step === 1 ? "Step 1: Role Select Karein" : "Step 2: Details Bharein"), [step])

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

      const { error: gymError } = await supabase.from("gyms").insert({
        chain_id: chainData.id,
        owner_id: userId,
        name: gymName,
        address: gymAddress,
        city,
        monthly_fee: Number(monthlyFee) || 500,
      })

      if (gymError) {
        toast.error(gymError.message)
        setLoading(false)
        return
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
    })

    if (memberError) {
      toast.error(memberError.message)
      setLoading(false)
      return
    }

    toast.success("Ab apne gym owner se join karo ya gym code daalo")
    router.replace("/member/dashboard")
    setLoading(false)
  }

  return (
    <Card className="border-[#1A2332] bg-[#0F1520]">
      <h1 className="text-xl font-bold">{stepTitle}</h1>
      <p className="mt-1 text-sm text-[#94A3B8]">IronIQ onboarding in 2 quick steps.</p>

      {step === 1 ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              className={`rounded-2xl border p-4 text-left transition ${
                role === "member" ? "border-[#0ECFB0] bg-[#0ECFB0]/5" : "border-[#1A2332]"
              }`}
              onClick={() => setRole("member")}
            >
              <UserRound className="mb-2 h-6 w-6 text-[#0ECFB0]" />
              <h2 className="font-semibold">Main Member Hoon</h2>
              <p className="mt-1 text-xs text-[#94A3B8]">Workout plans, progress tracking, AI coach</p>
            </button>
            <button
              className={`rounded-2xl border p-4 text-left transition ${
                role === "owner" ? "border-[#0ECFB0] bg-[#0ECFB0]/5" : "border-[#1A2332]"
              }`}
              onClick={() => setRole("owner")}
            >
              <Building2 className="mb-2 h-6 w-6 text-[#0ECFB0]" />
              <h2 className="font-semibold">Main Gym Owner Hoon</h2>
              <p className="mt-1 text-xs text-[#94A3B8]">Manage members, equipment, analytics</p>
            </button>
          </div>
          <Button className="w-full" onClick={() => setStep(2)}>
            Aage Badho
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Priya Kulkarni" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Strong password" />
          <Input label="Phone (+91)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nagpur" />

          {role === "member" ? (
            <>
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="24" />
              <Input
                label="Body Weight (kg)"
                type="number"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder="68"
              />
              <Input label="Height (cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="172" />
              <div>
                <label className="mb-2 block text-sm text-[#94A3B8]">Fitness Goal</label>
                <select
                  className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] px-4 py-3 text-sm text-white focus:border-[#0ECFB0] focus:outline-none"
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
                <label className="mb-2 block text-sm text-[#94A3B8]">Days per week</label>
                <select
                  className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] px-4 py-3 text-sm text-white focus:border-[#0ECFB0] focus:outline-none"
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
              <Input label="Gym Name" value={gymName} onChange={(e) => setGymName(e.target.value)} placeholder="IronIQ Fitness Hubli" />
              <Input
                label="Gym Address"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                placeholder="Vidyanagar Main Road"
              />
              <Input
                label="Monthly Fee (₹)"
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                placeholder="799"
              />
            </>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={onSubmit} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
