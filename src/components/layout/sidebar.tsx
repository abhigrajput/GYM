"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Apple,
  BarChart3,
  Calendar,
  Dumbbell,
  Home,
  QrCode,
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
  icon:
    | "home"
    | "dumbbell"
    | "target"
    | "apple"
    | "trophy"
    | "settings"
    | "users"
    | "chart"
    | "calendar"
    | "qr"
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
  qr: QrCode,
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
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-white/[0.03] backdrop-blur-xl md:flex md:flex-col md:w-[240px]">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
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
                active
                  ? "bg-gradient-to-r from-violet-600/25 to-cyan-500/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                  : "text-white/60 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-cyan-300")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <User className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-medium text-white">{name || "IronIQ User"}</p>
            <p className="text-xs text-white/50 capitalize">{role}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  )
}
