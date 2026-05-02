export const dynamic = "force-dynamic"

import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

const nav = [
  { href: "/admin/dashboard", label: "Overview", emoji: "📊" },
  { href: "/admin/dashboard#users", label: "All Users", emoji: "👥" },
  { href: "/admin/dashboard#gyms", label: "All Gyms", emoji: "🏋️" },
  { href: "/admin/dashboard#ai", label: "AI Usage", emoji: "🤖" },
  { href: "/admin/dashboard#revenue", label: "Revenue", emoji: "💰" },
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
    <div className="mesh-bg flex min-h-screen text-white">
      <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-black/30 p-4 backdrop-blur-xl md:block">
        <Link href="/admin/dashboard" className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text font-heading text-xl font-bold text-transparent">
          IronIQ Admin
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"
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
