"use client"

import { cn } from "@/lib/utils"

interface GradientButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "outline" | "ghost" | "danger" | "secondary"
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
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" }
  const variants = {
    primary: "border border-[#00FF41] bg-[#00FF41] text-black shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_40px_rgba(0,255,65,0.5)]",
    outline: "border border-[#00FF41] bg-transparent text-[#00FF41] hover:bg-[#00FF41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]",
    secondary: "border border-[#00FF41] bg-transparent text-[#00FF41] hover:bg-[#00FF41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]",
    ghost: "border-transparent bg-transparent text-[#888888] hover:text-[#00FF41]",
    danger: "border border-[#FF0040] bg-transparent text-[#FF0040] hover:bg-[#FF0040] hover:text-black",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-sm font-heading uppercase tracking-[0.1em] transition-all duration-200",
        "[clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)]",
        sizes[size],
        variants[variant],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
      )}
      {children}
    </button>
  )
}
