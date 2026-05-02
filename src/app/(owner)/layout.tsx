export const dynamic = "force-dynamic"

import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "owner") redirect("/member/dashboard")

  const ownerNav = [
    { label: "Dashboard", href: "/owner/dashboard", icon: "home" as const },
    { label: "Members", href: "/owner/members", icon: "users" as const },
    { label: "Equipment", href: "/owner/equipment", icon: "dumbbell" as const },
    { label: "Analytics", href: "/owner/analytics", icon: "chart" as const },
    { label: "Attendance", href: "/owner/attendance", icon: "calendar" as const },
    { label: "Schedule", href: "/owner/schedule", icon: "calendar" as const },
    { label: "Settings", href: "/owner/settings", icon: "settings" as const },
  ]

  return (
    <div className="min-h-screen bg-[#07090F] text-[#F1F5F9] md:flex">
      <Sidebar navItems={ownerNav} role="owner" name={profile?.full_name} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav
        items={[
          { label: "Home", href: "/owner/dashboard", icon: "home" },
          { label: "Workout", href: "/owner/equipment", icon: "workout" },
          { label: "Progress", href: "/owner/analytics", icon: "progress" },
          { label: "Nutrition", href: "/owner/schedule", icon: "nutrition" },
          { label: "Profile", href: "/owner/settings", icon: "profile" },
        ]}
      />
    </div>
  )
}
