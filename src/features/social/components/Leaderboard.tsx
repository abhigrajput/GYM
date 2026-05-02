"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Leaderboard({
  rows,
  currentUserMemberId,
}: {
  rows: any[]
  currentUserMemberId?: string
}) {
  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3, 10)
  const me = useMemo(() => rows.find((r) => r.id === currentUserMemberId), [currentUserMemberId, rows])

  const share = () => {
    const text = `IronIQ Leaderboard\n${rows.slice(0, 5).map((r) => `#${r.rank} Member ${r.id.slice(0, 4)} - ${r.score}`).join("\n")}`
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-bold">Top 3 Podium</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((r, i) => (
            <div
              key={r.id}
              className={`rounded-xl border p-3 ${i === 0 ? "border-yellow-400" : i === 1 ? "border-zinc-300" : "border-amber-700"}`}
            >
              <p className="text-lg font-bold">#{r.rank}</p>
              <p className="text-sm">Member {r.id.slice(0, 4)}</p>
              <p className="text-xs text-[#94A3B8]">Score {r.score}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        {rest.map((r) => (
          <div key={r.id} className={`flex items-center justify-between rounded-xl border p-2 ${r.id === currentUserMemberId ? "border-[#0ECFB0]" : "border-[#1A2332]"}`}>
            <p>#{r.rank} Member {r.id.slice(0, 4)}</p>
            <p className="text-sm text-[#94A3B8]">{r.score}</p>
          </div>
        ))}
      </Card>

      <Card>
        <p className="text-sm">Weekly reset in: {6 - new Date().getDay()} days</p>
        {me ? <p className="mt-1 text-sm text-[#0ECFB0]">Your rank: #{me.rank}</p> : null}
        <Button className="mt-3" onClick={share}>Apna rank share karo</Button>
      </Card>
    </div>
  )
}
