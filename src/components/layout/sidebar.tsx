"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Apple,
  BarChart3,
  Calendar,
  Dumbbell,
  Home,
  Settings,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  icon: "home" | "dumbbell" | "target" | "apple" | "trophy" | "settings" | "users" | "chart" | "calendar"
}

type SidebarProps = {
  navItems: NavItem[]
  role: "member" | "owner"
  name?: string | null
}

const iconMap = {
  home: Home,
  dumbbell: Dumbbell,
  target: Target,
  apple: Apple,
  trophy: Trophy,
  settings: Settings,
  users: Users,
  chart: BarChart3,
  calendar: Calendar,
}

export function Sidebar({ navItems, role, name }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[#1A2332] bg-[#0F1520] md:flex md:flex-col">
      <div className="border-b border-[#1A2332] px-5 py-5">
        <Link href="/" className="text-xl font-bold text-[#0ECFB0]">
          IronIQ
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active ? "bg-[#0ECFB0]/15 text-[#0ECFB0]" : "text-[#94A3B8] hover:bg-[#1A2332] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#1A2332] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1A2332]">
            <User className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-medium text-white">{name || "IronIQ User"}</p>
            <p className="text-xs text-[#94A3B8] capitalize">{role}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  )
}
