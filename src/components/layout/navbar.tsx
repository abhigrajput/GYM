"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X, Dumbbell, User } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type AuthState = {
  userId: string
  fullName: string | null
  role: string | null
}

export function Navbar() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle()

      setAuth({
        userId: user.id,
        fullName: profile?.full_name ?? user.email ?? "User",
        role: profile?.role ?? "member",
      })
    }

    void init()
  }, [])

  const dashboardHref = auth?.role === "owner" ? "/owner/dashboard" : "/member/dashboard"

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090F]/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[#0ECFB0]" />
          <span className="text-lg font-bold text-[#0ECFB0]">IronIQ</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          {!auth ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Register</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 rounded-xl border border-[#1A2332] bg-[#0F1520] px-3 py-2 text-sm">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1A2332]">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="max-w-[160px] truncate">{auth.fullName}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="z-50 min-w-44 rounded-xl border border-[#1A2332] bg-[#0F1520] p-1 text-sm text-white">
                  <DropdownMenu.Item asChild className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-[#1A2332]">
                    <Link href={dashboardHref}>Dashboard</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-[#1A2332]">
                    <Link href="/settings">Settings</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-[#1A2332]"
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
          className="rounded-xl border border-[#1A2332] bg-[#0F1520] p-2 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {!auth ? (
              <>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link href="/signup">Register</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href={dashboardHref}>Dashboard</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                  <Link href="/settings">Settings</Link>
                </Button>
                <Button variant="danger" className="justify-start" onClick={logout}>
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
