"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Apple, Dumbbell, Home, QrCode, Target, User } from "lucide-react"
import { cn } from "@/lib/utils"

type BottomNavItem = {
  label: string
  href: string
  icon: "home" | "workout" | "progress" | "nutrition" | "profile" | "checkin"
}

const iconMap = {
  home: Home,
  workout: Dumbbell,
  progress: Target,
  nutrition: Apple,
  profile: User,
  checkin: QrCode,
}

export function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname()
  const visibleItems = items.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1A2332] bg-[#07090F]/90 px-2 py-2 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px]",
                active ? "text-[#0ECFB0]" : "text-[#94A3B8]"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "fill-[#0ECFB0]/15" : "")} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
