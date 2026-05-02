"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function NutritionPlan({
  memberId,
  goal,
  bodyWeight,
  initialPlan,
}: {
  memberId: string
  goal: string
  bodyWeight: number
  initialPlan?: any
}) {
  const [tab, setTab] = useState<"meal" | "supplements" | "new">("meal")
  const [plan, setPlan] = useState<any>(initialPlan || null)
  const [diet, setDiet] = useState<"veg" | "egg" | "nonveg">("veg")
  const [budget, setBudget] = useState("200")
  const [allergies, setAllergies] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const res = await fetch("/api/ai/nutrition-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId,
        goal,
        bodyWeight,
        isVegetarian: diet === "veg",
        isEggetarian: diet === "egg",
        dailyBudget: Number(budget),
        allergies,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setPlan(data.plan)
      setTab("meal")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["meal", "Meal Plan"],
          ["supplements", "Supplement Guide"],
          ["new", "Generate New Plan"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rounded-xl border px-3 py-2 text-sm ${tab === k ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`}
            onClick={() => setTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "meal" ? (
        <Card className="space-y-4">
          {!plan ? <p className="text-sm text-[#94A3B8]">No nutrition plan yet. Generate one.</p> : null}
          {plan ? (
            <>
              <p className="text-2xl font-bold">{plan.daily_calories} kcal</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  ["Protein", plan.protein_grams, "#10B981"],
                  ["Carbs", plan.carb_grams, "#0EA5E9"],
                  ["Fat", plan.fat_grams, "#F59E0B"],
                ].map(([name, value, color]: any) => (
                  <div key={name} className="rounded-xl border border-[#1A2332] p-2">
                    <p className="text-xs text-[#94A3B8]">{name}</p>
                    <p className="font-semibold">{value}g</p>
                    <div className="mt-2 h-2 rounded bg-[#1A2332]">
                      <div className="h-2 rounded" style={{ width: `${Math.min(100, Number(value) / 3)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {(plan.meals || []).map((meal: any) => (
                  <Card
                    key={`${meal.time}-${meal.name}`}
                    className={`${meal.is_pre_workout ? "border-[#0ECFB0]" : ""} ${meal.is_post_workout ? "border-[#10B981]" : ""}`}
                  >
                    <span className="rounded-full bg-[#1A2332] px-2 py-0.5 text-xs">{meal.time}</span>
                    <p className="mt-1 font-semibold">{meal.name}</p>
                    <ul className="mt-2 text-sm text-[#94A3B8]">
                      {(meal.foods || []).map((f: any) => (
                        <li key={`${f.item}-${f.quantity}`}>• {f.item} ({f.quantity}) — {f.calories} cal, {f.protein}g protein</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-xs">{meal.total_calories} cal • {meal.total_protein}g protein</p>
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </Card>
      ) : null}

      {tab === "supplements" ? (
        <Card className="space-y-3">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            <Card className="border-[#10B981]">
              <p className="font-semibold text-[#10B981]">Essential</p>
              {(plan?.supplement_guide?.essential || []).map((i: string) => <p key={i} className="text-sm">{i}</p>)}
            </Card>
            <Card className="border-[#F59E0B]">
              <p className="font-semibold text-[#F59E0B]">Optional</p>
              {(plan?.supplement_guide?.optional || []).map((i: string) => <p key={i} className="text-sm">{i}</p>)}
            </Card>
            <Card className="border-[#EF4444]">
              <p className="font-semibold text-[#EF4444]">Avoid</p>
              {(plan?.supplement_guide?.avoid || []).map((i: string) => <p key={i} className="text-sm">{i}</p>)}
            </Card>
          </div>
          <Card className="border-[#EF4444]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
              <div>
                <p className="font-semibold text-[#EF4444]">SCAM WARNING</p>
                <p className="text-sm text-[#94A3B8]">{plan?.supplement_guide?.scam_warning}</p>
                <p className="mt-2 text-sm">Budget options: MuscleBlaze Whey Rs 2,499/kg, Big Muscles Creatine Rs 499</p>
              </div>
            </div>
          </Card>
        </Card>
      ) : null}

      {tab === "new" ? (
        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              ["veg", "Vegetarian"],
              ["egg", "Eggetarian"],
              ["nonveg", "Non-Vegetarian"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`rounded-xl border px-3 py-2 text-sm ${diet === value ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`}
                onClick={() => setDiet(value as any)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["100", "150", "200", "300"].map((b) => (
              <button
                key={b}
                className={`rounded-xl border px-3 py-2 text-sm ${budget === b ? "border-[#0ECFB0] text-[#0ECFB0]" : "border-[#1A2332]"}`}
                onClick={() => setBudget(b)}
              >
                ₹{b}+
              </button>
            ))}
          </div>
          <textarea
            className="min-h-24 w-full rounded-xl border border-[#1A2332] bg-[#0F1520] p-3 text-sm"
            placeholder="Allergies (optional)"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Naya Plan Banao"}
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
