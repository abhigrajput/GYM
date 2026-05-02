"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GymAnalyticsDashboard({ gymId, initialData }: { gymId: string; initialData: any }) {
  const [tab, setTab] = useState<"overview" | "revenue" | "peak" | "conflicts" | "dropout">("overview")
  const [data, setData] = useState(initialData)
  const [trafficDate, setTrafficDate] = useState(new Date().toISOString().slice(0, 10))
  const [traffic, setTraffic] = useState<any>({ conflicts: [], recommendations: [] })

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/analytics/traffic?gymId=${gymId}&date=${trafficDate}`)
      const json = await res.json()
      if (res.ok) setTraffic(json)
    }
    void load()
  }, [gymId, trafficDate])

  const projected = useMemo(() => Math.round((data?.active_members || 0) * ((data?.revenue_this_month || 0) / Math.max(1, data?.active_members || 1)) * 1.08), [data])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["overview", "Overview"],
          ["revenue", "Revenue"],
          ["peak", "Peak Hours"],
          ["conflicts", "Equipment Conflicts"],
          ["dropout", "Dropout Risk"],
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

      {tab === "overview" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="lg:col-span-2">
            <p className="text-sm text-[#94A3B8]">Monthly Revenue</p>
            <p className="text-3xl font-bold">Rs {Number(data?.revenue_this_month || 0).toLocaleString("en-IN")}</p>
          </Card>
          <Card><p>Total {data?.total_members}</p><p>Active {data?.active_members}</p><p>New {data?.new_this_month}</p><p>Churned {data?.churned_this_month}</p></Card>
          <Card>
            <div className="relative mx-auto h-24 w-24 rounded-full border-8 border-[#1A2332]">
              <div className="absolute inset-0 rounded-full border-8 border-[#0ECFB0]" style={{ clipPath: `inset(${100 - (data?.retention_rate || 0)}% 0 0 0)` }} />
              <span className="absolute inset-0 flex items-center justify-center text-sm">{data?.retention_rate || 0}%</span>
            </div>
            <p className="mt-2 text-center text-sm">Retention Rate</p>
            <p className="text-center text-xs text-[#94A3B8]">Avg streak: {data?.avg_streak || 0}</p>
          </Card>
        </div>
      ) : null}

      {tab === "revenue" ? (
        <Card>
          <div className="flex h-52 items-end gap-2">
            {(data?.revenue_last_6_months || []).map((m: any, i: number) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${i === (data.revenue_last_6_months.length - 1) ? "bg-[#0ECFB0]" : "bg-[#1A2332]"}`}
                  style={{ height: `${Math.max(10, (m.amount / Math.max(...data.revenue_last_6_months.map((x: any) => x.amount))) * 180)}px` }}
                />
                <span className="text-[10px]">{m.month}</span>
                <span className="text-[10px] text-[#94A3B8]">Rs {Number(m.amount).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-[#94A3B8]">Projected next month: Rs {projected.toLocaleString("en-IN")}</p>
        </Card>
      ) : null}

      {tab === "peak" ? (
        <Card>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 7 * 12 }).map((_, i) => {
              const intensity = Math.min(1, ((data?.peak_hours || [])[i % Math.max(1, data?.peak_hours?.length || 1)]?.avg_checkins || 0) / 10)
              const bg = intensity > 0.7 ? "#0ECFB0" : `rgba(26,35,50,${0.35 + intensity})`
              return <div key={i} className="h-6 rounded" style={{ background: bg }} />
            })}
          </div>
          <p className="mt-3 text-sm">Sabse busy time: Tuesday 6-7 PM</p>
        </Card>
      ) : null}

      {tab === "conflicts" ? (
        <Card className="space-y-3">
          <input type="date" value={trafficDate} onChange={(e) => setTrafficDate(e.target.value)} className="rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-sm" />
          {(traffic.conflicts || []).map((c: any) => (
            <div key={`${c.equipment_name}-${c.time_slot}`} className="rounded-xl border border-[#1A2332] p-3">
              <div className="flex items-center gap-2">
                {c.overflow_count > 0 ? <AlertTriangle className="h-4 w-4 text-[#F59E0B]" /> : null}
                <p className="font-semibold">{c.equipment_name}</p>
              </div>
              <p className="text-sm text-[#94A3B8]">{c.time_slot} — {c.members_wanting.length} members scheduled, only {c.equipment_quantity} available</p>
              <Button className="mt-2" variant="outline">Members shift karo</Button>
            </div>
          ))}
          <div className="space-y-1 text-sm text-[#94A3B8]">
            {(traffic.recommendations || []).map((r: string) => <p key={r}>• {r}</p>)}
          </div>
        </Card>
      ) : null}

      {tab === "dropout" ? (
        <Card className="space-y-3">
          {(data?.dropout_risk_members || []).map((m: any) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-[#1A2332] p-3">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className={`text-xs ${m.days_absent > 14 ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>{m.days_absent} days absent</p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  const res = await fetch("/api/whatsapp/reminder", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "dropout_reengagement", name: m.name, days: m.days_absent }),
                  })
                  const d = await res.json()
                  window.open(d.waUrl, "_blank")
                }}
              >
                WhatsApp bhejo
              </Button>
            </div>
          ))}
          <Button>Sabko message bhejo</Button>
        </Card>
      ) : null}
    </div>
  )
}
