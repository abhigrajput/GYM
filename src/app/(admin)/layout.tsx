export const dynamic = "force-dynamic"

import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

const nav = [
  { href: "/admin/dashboard", label: "> OVERVIEW", emoji: "📊" },
  { href: "/admin/dashboard#users", label: "> USERS", emoji: "👥" },
  { href: "/admin/dashboard#gyms", label: "> GYMS", emoji: "🏋️" },
  { href: "/admin/dashboard#ai", label: "> AI USAGE", emoji: "🤖" },
  { href: "/admin/dashboard#revenue", label: "> REVENUE", emoji: "💰" },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role,full_name").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") redirect("/member/dashboard")

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside className="hidden w-56 shrink-0 border-r border-[#00FF41]/30 bg-[#070707] p-4 md:block">
        <Link href="/admin/dashboard" className="block font-heading text-xl font-bold text-[#00FF41]">
          IronIQ Admin
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-[#888888] hover:bg-[#00FF41]/10 hover:text-[#00FF41]"
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-xs text-white/40">{profile?.full_name}</p>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
