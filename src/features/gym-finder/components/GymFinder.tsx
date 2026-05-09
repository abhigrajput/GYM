"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { GlassInput } from "@/components/ui/glass-input"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Building2, Home, Trees, Search } from "lucide-react"

type GymRow = {
  id: string
  name: string
  city: string
  address: string | null
  equipment_count: number
  member_count: number
  gym_code: string | null
}

export function GymFinder({ memberId }: { memberId: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<"search" | "code" | "solo">("search")
  const [query, setQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [results, setResults] = useState<GymRow[]>([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [joining, setJoining] = useState(false)

  const search = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set("query", query)
      if (cityFilter) params.set("city", cityFilter)
      const res = await fetch(`/api/gyms/search?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.gyms || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }, [query, cityFilter])

  useEffect(() => {
    void search()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  const joinGym = async (gymId?: string, gymCode?: string) => {
    setJoining(true)
    try {
      const res = await fetch("/api/gyms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId, gymCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Join failed")
      toast.success("Gym joined successfully.")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Join failed")
    } finally {
      setJoining(false)
    }
  }

  const setEnvironment = async (env: string, equipment?: string[]) => {
    setJoining(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout_environment: env,
          home_equipment: equipment || [],
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Update failed")
      toast.success("Environment set. Generate your plan next.")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed")
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["search", "code", "solo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              tab === t
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            )}
          >
            {t === "search" ? "Search Gym" : t === "code" ? "Gym Code" : "No Gym"}
          </button>
        ))}
      </div>

      {tab === "search" && (
        <GlassCard className="p-5" glow="purple">
          <GlassInput
            label="Search city or gym name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
          <div className="mt-3">
            <label className="text-xs text-white/50">City filter</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Nagpur"
            />
          </div>
          <GradientButton className="mt-4 w-full" onClick={() => void search()} loading={loading}>
            Search
          </GradientButton>
          <div className="mt-4 space-y-3">
            {results.map((g) => (
              <div
                key={g.id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">{g.name}</p>
                  <p className="text-xs text-white/50">
                    {g.city} · {g.equipment_count} equipment · {g.member_count} members
                  </p>
                </div>
                <GradientButton size="sm" onClick={() => void joinGym(g.id)} loading={joining}>
                  Join
                </GradientButton>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === "code" && (
        <GlassCard className="p-5" glow="cyan">
          <GlassInput
            label="6-character gym code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono tracking-[0.3em] uppercase"
            maxLength={8}
          />
          <GradientButton className="mt-4 w-full" onClick={() => void joinGym(undefined, code)} loading={joining}>
            Join with Code
          </GradientButton>
        </GlassCard>
      )}

      {tab === "solo" && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Train at Home",
              icon: Home,
              env: "home",
              extra: (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Dumbbells", "Resistance Bands", "Pull-up Bar", "Yoga Mat", "None"].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      className="rounded-lg border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                      onClick={() => void setEnvironment("home", eq === "None" ? [] : [eq])}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              ),
            },
            {
              title: "Train Outdoors",
              icon: Trees,
              env: "outdoor",
            },
            {
              title: "Skip for Now",
              icon: Building2,
              env: "any",
            },
          ].map((c, i) => (
            <motion.div key={c.env} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5" hover glow={i === 0 ? "purple" : i === 1 ? "cyan" : "pink"}>
                <c.icon className="mb-2 h-8 w-8 text-cyan-300" />
                <p className="font-heading text-lg font-semibold">{c.title}</p>
                {"extra" in c && c.extra}
                <GradientButton className="mt-4 w-full" variant="secondary" onClick={() => void setEnvironment(c.env)} loading={joining}>
                  Select
                </GradientButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
