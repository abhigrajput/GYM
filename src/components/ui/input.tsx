import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ className, label, error, icon, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label ? <label className="mb-2 block text-sm text-[#94A3B8]">{label}</label> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
            {icon}
          </span>
        ) : null}
        <input
          className={cn(
            "flex w-full rounded-xl border border-[#1A2332] bg-[#0F1520] px-4 py-3 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#0ECFB0] focus:outline-none",
            icon ? "pl-10" : "",
            className
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-[#EF4444]">{error}</p> : null}
    </div>
  )
}
