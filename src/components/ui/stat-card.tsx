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
  return (
    <GlassCard glow={glow} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</p>
        {icon && <div className="text-white/30">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold font-heading text-white">
          {prefix}
          {value}
          {suffix}
        </p>
        {change && (
          <span
            className={cn(
              "text-xs font-medium mb-1",
              changeType === "up" && "text-emerald-400",
              changeType === "down" && "text-red-400",
              changeType === "neutral" && "text-white/40"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </GlassCard>
  )
}
