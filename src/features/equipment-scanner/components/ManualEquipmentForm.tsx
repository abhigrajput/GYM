"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type EquipmentDraft = {
  id: string
  name: string
  category: "free_weights" | "machines" | "cardio" | "cables" | "bodyweight" | "other"
  quantity: number
  confidence?: "high" | "medium" | "low"
}

const suggestions: { name: string; category: EquipmentDraft["category"] }[] = [
  { name: "Flat Bench", category: "machines" },
  { name: "Dumbbell Rack", category: "free_weights" },
  { name: "Barbell", category: "free_weights" },
  { name: "Squat Rack", category: "machines" },
  { name: "Treadmill", category: "cardio" },
  { name: "Pull-up Bar", category: "bodyweight" },
  { name: "Cable Machine", category: "cables" },
  { name: "Leg Press", category: "machines" },
  { name: "Smith Machine", category: "machines" },
  { name: "Incline Bench", category: "machines" },
]

export function ManualEquipmentForm({
  items,
  onChange,
}: {
  items: EquipmentDraft[]
  onChange: (items: EquipmentDraft[]) => void
}) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<EquipmentDraft["category"]>("machines")
  const [quantity, setQuantity] = useState(1)

  const addItem = () => {
    if (!name.trim()) return
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        quantity: Math.max(1, quantity),
        confidence: "high",
      },
    ])
    setName("")
    setQuantity(1)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.name}
            className="rounded-full border border-[#1A2332] px-3 py-1 text-xs hover:border-[#0ECFB0]"
            onClick={() => {
              setName(s.name)
              setCategory(s.category)
            }}
            type="button"
          >
            {s.name}
          </button>
        ))}
      </div>
      <Input label="Equipment Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div>
        <label className="mb-2 block text-sm text-[#94A3B8]">Category</label>
        <select
          className="w-full rounded-xl border border-[#1A2332] bg-[#0F1520] px-4 py-3 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value as EquipmentDraft["category"])}
        >
          <option value="free_weights">Free Weights</option>
          <option value="machines">Machines</option>
          <option value="cardio">Cardio</option>
          <option value="cables">Cables</option>
          <option value="bodyweight">Bodyweight</option>
          <option value="other">Other</option>
        </select>
      </div>
      <Input label="Quantity" type="number" value={String(quantity)} onChange={(e) => setQuantity(Number(e.target.value))} />
      <Button onClick={addItem}>Add Equipment</Button>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-[#1A2332] p-2 text-sm">
            {item.name} ({item.quantity}) - {item.category}
          </div>
        ))}
      </div>
    </div>
  )
}
