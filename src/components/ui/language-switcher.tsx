"use client"

import { cn } from "@/lib/utils"
import type { Lang } from "@/lib/i18n/translations"

const options: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
]

interface LanguageSwitcherProps {
  lang: Lang
  onChange: (lang: Lang) => void
  className?: string
}

export function LanguageSwitcher({ lang, onChange, className }: LanguageSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.05] p-1 backdrop-blur-xl",
        className
      )}
    >
      {options.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition",
            lang === code
              ? "bg-gradient-to-r from-violet-600/80 to-cyan-500/80 text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
              : "text-white/50 hover:text-white/90"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
