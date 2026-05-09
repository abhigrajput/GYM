"use client"

import { GlassCard } from "./glass-card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  glow?: "purple" | "cyan" | "pink" | "none"
  prefix?: string
  suffix?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  glow,
  prefix,
  suffix,
}: StatCardProps) {
  const displayChange =
    changeType === "up" ? "text-[#00FF41]" : changeType === "down" ? "text-[#FF0040]" : "text-[#888888]"

  return (
    <GlassCard glow={glow} className="p-5 bg-[#0A0A0A]">
      <div className="flex items-start justify-between mb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#888888]">{title}</p>
        {icon && <div className="text-[#00FF41]/60">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <p className="font-heading text-3xl font-bold text-[#00FF41]">
          {prefix}
          {value}
          {suffix}
        </p>
        {change && (
          <span className={cn("mb-1 text-xs font-medium", displayChange)}>
            {change}
          </span>
        )}
      </div>
    </GlassCard>
  )
}
