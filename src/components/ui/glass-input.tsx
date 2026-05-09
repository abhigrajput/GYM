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
        {label && <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#00FF41]">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00FF41]/70">{icon}</div>}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-none border-b px-4 py-3 text-sm font-mono",
              "bg-black border-b-[rgba(0,255,65,0.35)] border-x-0 border-t-0",
              "text-white placeholder:text-[#888888]",
              "focus:outline-none focus:border-b-[#00FF41] focus:shadow-[0_8px_24px_-12px_rgba(0,255,65,0.8)]",
              "transition-all duration-200",
              icon && "pl-10",
              rightIcon && "pr-10",
              error && "border-b-[#FF0040] focus:border-b-[#FF0040]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF41]/70">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs text-[#FF0040]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#888888]">{hint}</p>}
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"
