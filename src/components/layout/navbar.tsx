"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X, Dumbbell, User } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslation } from "@/hooks/useTranslation"
import type { Lang } from "@/lib/i18n/translations"

type AuthState = {
  userId: string
  fullName: string | null
  role: string | null
}

export function Navbar() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, setLang } = useTranslation(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setAuth(null)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle()

      setAuth({
        userId: user.id,
        fullName: profile?.full_name ?? user.email ?? "User",
        role: profile?.role ?? "member",
      })
    }

    void init()
  }, [])

  const dashboardHref =
    auth?.role === "owner" ? "/owner/dashboard" : auth?.role === "admin" ? "/admin/dashboard" : "/member/dashboard"

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020408]/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-violet-400" />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-lg font-bold text-transparent">
            IronIQ
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher lang={lang} onChange={(l: Lang) => setLang(l)} />
          {!auth ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-white/80">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                <Link href="/signup">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="max-w-[160px] truncate">{auth.fullName}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="z-50 min-w-44 rounded-xl border border-white/10 bg-[#050B12]/95 p-1 text-sm text-white backdrop-blur-xl">
                  <DropdownMenu.Item asChild className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-white/10">
                    <Link href={dashboardHref}>Dashboard</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-white/10"
                    onSelect={logout}
                  >
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>

        <button
          className="rounded-xl border border-white/10 bg-white/[0.05] p-2 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="mb-3 flex justify-center">
            <LanguageSwitcher lang={lang} onChange={(l: Lang) => setLang(l)} />
          </div>
          <div className="flex flex-col gap-2">
            {!auth ? (
              <>
                <Button asChild variant="ghost" className="justify-start text-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="justify-start bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                  <Link href="/signup">Register</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="justify-start text-white">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
                <Button variant="ghost" className="justify-start text-red-400" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
