"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Member, Profile } from "@/lib/db/types"
import { AuthContext, useAuthContext } from "@/context/auth-context"

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [ownerGymId, setOwnerGymId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser ?? null)

      if (!currentUser) {
        setProfile(null)
        setMember(null)
        setOwnerGymId(null)
        setLoading(false)
        return
      }

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle()
      setProfile((currentProfile as Profile | null) ?? null)

      if (currentProfile?.role === "member") {
        const { data: currentMember } = await supabase
          .from("members")
          .select("*")
          .eq("profile_id", currentUser.id)
          .maybeSingle()
        setMember((currentMember as Member | null) ?? null)
        setOwnerGymId(null)
      } else if (currentProfile?.role === "owner") {
        const { data: gym } = await supabase
          .from("gyms")
          .select("id")
          .eq("owner_id", currentUser.id)
          .maybeSingle()
        setOwnerGymId(gym?.id ?? null)
        setMember(null)
      } else {
        setMember(null)
        setOwnerGymId(null)
      }

      setLoading(false)
    }

    void load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load()
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      member,
      ownerGymId,
      loading,
      isOwner: () => profile?.role === "owner",
      isMember: () => profile?.role === "member",
    }),
    [user, profile, member, ownerGymId, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useUser() {
  const { user, profile, loading } = useAuthContext()
  return { user, profile, loading }
}
