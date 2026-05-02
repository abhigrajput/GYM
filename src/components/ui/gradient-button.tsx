"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GradientButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit"
}

export function GradientButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  onClick,
  type = "button",
}: GradientButtonProps) {
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" }
  const variants = {
    primary:
      "bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(124,58,237,0.4)]",
    secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30",
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 justify-center",
        sizes[size],
        variants[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  )
}
