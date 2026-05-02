"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, icon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-white/60">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl px-4 py-3 text-sm",
              "bg-white/[0.05] border border-white/10",
              "text-white placeholder:text-white/30",
              "backdrop-blur-glass",
              "focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(124,58,237,0.2)]",
              "transition-all duration-200",
              icon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500/50 focus:border-red-500/50",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"
