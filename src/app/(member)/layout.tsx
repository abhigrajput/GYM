export const dynamic = "force-dynamic"

import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function MemberLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle()
  if (profile?.role === "owner") redirect("/owner/dashboard")
  if (profile?.role === "admin") redirect("/admin/dashboard")

  const memberNav = [
    { label: "Dashboard", href: "/member/dashboard", icon: "home" as const },
    { label: "Workout", href: "/member/workout", icon: "dumbbell" as const },
    { label: "Progress", href: "/member/progress", icon: "target" as const },
    { label: "Nutrition", href: "/member/nutrition", icon: "apple" as const },
    { label: "Leaderboard", href: "/member/leaderboard", icon: "trophy" as const },
    { label: "QR Check-in", href: "/member/qr", icon: "qr" as const },
    { label: "Settings", href: "/member/settings", icon: "settings" as const },
  ]

  return (
    <div className="mesh-bg min-h-screen text-[var(--text-primary)] md:flex">
      <Sidebar navItems={memberNav} role="member" name={profile?.full_name} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav
        items={[
          { label: "Home", href: "/member/dashboard", icon: "home" },
          { label: "Workout", href: "/member/workout", icon: "workout" },
          { label: "Progress", href: "/member/progress", icon: "progress" },
          { label: "Nutrition", href: "/member/nutrition", icon: "nutrition" },
          { label: "Check-in", href: "/member/qr", icon: "checkin" },
        ]}
      />
    </div>
  )
}
