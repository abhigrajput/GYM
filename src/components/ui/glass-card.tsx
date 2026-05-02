"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  id?: string
  hover?: boolean
  glow?: "purple" | "cyan" | "pink" | "none"
  animate?: boolean
  onClick?: () => void
}

const glowClass = {
  purple: "shadow-[0_0_30px_rgba(124,58,237,0.3)] border-purple-500/20",
  cyan: "shadow-[0_0_30px_rgba(6,182,212,0.3)] border-cyan-500/20",
  pink: "shadow-[0_0_30px_rgba(236,72,153,0.3)] border-pink-500/20",
  none: "border-white/10",
}

const base =
  "relative rounded-2xl border backdrop-blur-xl bg-white/[0.04]"

export function GlassCard({
  children,
  className,
  id,
  hover = false,
  glow = "none",
  animate = true,
  onClick,
}: GlassCardProps) {
  const cls = cn(
    base,
    hover && "cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:scale-[1.02]",
    glowClass[glow],
    className
  )

  if (animate) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onClick}
        className={cls}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div id={id} onClick={onClick} className={cls} role={onClick ? "button" : undefined}>
      {children}
    </div>
  )
}
