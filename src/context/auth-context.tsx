"use client"

import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import type { Member, Profile } from "@/lib/db/types"

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  member: Member | null
  ownerGymId: string | null
  loading: boolean
  isOwner: () => boolean
  isMember: () => boolean
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  member: null,
  ownerGymId: null,
  loading: true,
  isOwner: () => false,
  isMember: () => false,
})

export function useAuthContext() {
  return useContext(AuthContext)
}
