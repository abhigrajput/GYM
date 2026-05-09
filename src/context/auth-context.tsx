"use client"

import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import type { Member, Profile } from "@/lib/db/types"
import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  member: Member | null
  ownerGymId: string | null
  loading: boolean
  isOwner: () => boolean
  isMember: () => boolean
  isAdmin: () => boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  member: null,
  ownerGymId: null,
  loading: true,
  isOwner: () => false,
  isMember: () => false,
  isAdmin: () => false,
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export async function ensureProfileFallback(user: User) {
  const supabase = createClient()
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: user.email?.split("@")[0] || "User",
      role: "member",
    })
  }
}
