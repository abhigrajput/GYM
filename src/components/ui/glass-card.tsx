"use client"

import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  id?: string
  hover?: boolean
  glow?: "purple" | "cyan" | "pink" | "none" | boolean
  animate?: boolean
  onClick?: () => void
}

export function CyberCard({
  children,
  className,
  id,
  hover = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  const showGlow = glow === true || glow === "purple" || glow === "cyan" || glow === "pink"

  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-sm border border-[rgba(0,255,65,0.2)] bg-[#111111]",
        "before:absolute before:left-0 before:right-0 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-[#00FF41] before:to-transparent",
        hover &&
          "cursor-pointer transition-all duration-200 hover:border-[rgba(0,255,65,0.5)] hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]",
        showGlow && "shadow-[0_0_20px_rgba(0,255,65,0.3)]",
        className
      )}
      role={onClick ? "button" : undefined}
    >
      {children}
    </div>
  )
}

export { CyberCard as GlassCard }
