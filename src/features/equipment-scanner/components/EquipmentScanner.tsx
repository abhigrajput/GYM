"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ManualEquipmentForm, type EquipmentDraft } from "./ManualEquipmentForm"

const scanningMessages = [
  "Scanning equipment...",
  "Identifying machines...",
  "Preparing plan-ready data...",
]

export function EquipmentScanner({
  gymId,
  onSaved,
}: {
  gymId: string
  onSaved?: (items: EquipmentDraft[]) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [items, setItems] = useState<EquipmentDraft[]>([])
  const [manualOpen, setManualOpen] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const grouped = useMemo(
    () =>
      items.reduce((acc: Record<string, EquipmentDraft[]>, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
      }, {}),
    [items]
  )

  const handleFile = (selected: File | null) => {
    if (!selected) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setScanError("Only jpeg/png/webp allowed.")
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setScanError("Max file size is 10MB.")
      return
    }
    setScanError(null)
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const scan = async () => {
    if (!file) return
    setStep(2)
    const interval = setInterval(() => setMsgIndex((v) => (v + 1) % scanningMessages.length), 1400)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const res = await fetch("/api/equipment/scan", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Scan failed")
      const scanned = (data.equipment || []).map((e: any) => ({
        id: crypto.randomUUID(),
        name: e.name,
        category: e.category,
        quantity: e.quantity || 1,
        confidence: e.confidence || "medium",
      }))
      setItems(scanned)
      setStep(3)
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Scan failed")
      setStep(1)
    } finally {
      clearInterval(interval)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = items.map(({ name, category, quantity }) => ({ name, category, quantity }))
      const res = await fetch("/api/equipment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId, equipment: payload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      onSaved?.(items)
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (step === 2) {
    return (
      <Card className="space-y-4 text-center">
        <div className="mx-auto h-48 w-full max-w-md overflow-hidden rounded-xl border border-[#1A2332]">
          {preview ? (
            <Image
              src={preview}
              alt="scan preview"
              width={600}
              height={300}
              unoptimized
              className="h-full w-full animate-pulse object-cover"
            />
          ) : null}
        </div>
        <p className="text-lg font-semibold">AI is scanning...</p>
        <p className="text-sm text-[#94A3B8]">{scanningMessages[msgIndex]}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A2332]">
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-[#0ECFB0]" />
        </div>
      </Card>
    )
  }

  if (step === 3) {
    return (
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Results</h3>
          <p className="text-sm text-[#94A3B8]">{items.length} equipment detected</p>
        </div>
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold capitalize text-[#0ECFB0]">{category.replace("_", " ")}</h4>
            {list.map((item) => (
              <div key={item.id} className="grid grid-cols-1 gap-2 rounded-xl border border-[#1A2332] p-3 sm:grid-cols-8 sm:items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-[#0ECFB0]"
                  onChange={(e) => !e.target.checked && setItems((prev) => prev.filter((x) => x.id !== item.id))}
                />
                <Input
                  className="sm:col-span-3"
                  value={item.name}
                  onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)))}
                />
                <Input
                  className="sm:col-span-1"
                  type="number"
                  value={String(item.quantity)}
                  onChange={(e) =>
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, quantity: Number(e.target.value) || 1 } : x)))
                  }
                />
                <select
                  className="rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-sm sm:col-span-2"
                  value={item.category}
                  onChange={(e) =>
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, category: e.target.value as any } : x)))
                  }
                >
                  <option value="free_weights">free_weights</option>
                  <option value="machines">machines</option>
                  <option value="cardio">cardio</option>
                  <option value="cables">cables</option>
                  <option value="bodyweight">bodyweight</option>
                  <option value="other">other</option>
                </select>
                <span
                  className={`rounded-full px-2 py-1 text-xs sm:col-span-1 ${
                    item.confidence === "high"
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : item.confidence === "medium"
                        ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                        : "bg-[#EF4444]/20 text-[#EF4444]"
                  }`}
                >
                  {item.confidence || "medium"}
                </span>
              </div>
            ))}
          </div>
        ))}
        <Button variant="outline" onClick={() => setManualOpen((v) => !v)}>
          Add Missing Item Manually
        </Button>
        {manualOpen ? <ManualEquipmentForm items={items} onChange={setItems} /> : null}
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Confirm Details — Save"}
        </Button>
      </Card>
    )
  }

  return (
    <Card className="space-y-4">
      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#1A2332] p-8 text-center transition hover:border-[#0ECFB0]"
        onDragOver={(e) => e.preventDefault()}
      >
        <Camera className="mb-3 h-8 w-8 text-[#0ECFB0]" />
        <p className="font-semibold">Upload a gym photo</p>
        <p className="mt-1 text-sm text-[#94A3B8]">AI will automatically identify visible equipment</p>
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </label>
      {preview ? (
        <Image
          src={preview}
          alt="preview"
          width={900}
          height={300}
          unoptimized
          className="h-48 w-full rounded-xl object-cover"
        />
      ) : null}
      {scanError ? <p className="text-sm text-[#EF4444]">{scanError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setManualOpen((v) => !v)}>
          Add manually
        </Button>
        <Button onClick={scan} disabled={!file}>
          Scan
        </Button>
      </div>
      {manualOpen ? <ManualEquipmentForm items={items} onChange={setItems} /> : null}
    </Card>
  )
}
