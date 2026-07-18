import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import type { AppRole } from '../../types/roles'

interface AuthContextValue {
  user: User | null
  session: Session | null
  roles: AppRole[]
  loading: boolean
  supabaseConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [roles, setRoles] = useState<AppRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let isMounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session?.user) {
      setRoles([])
      return
    }

    let isMounted = true
    void supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        if (!isMounted) return
        setRoles((data ?? []).map((row) => row.role))
      })

    return () => {
      isMounted = false
    }
  }, [session?.user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      roles,
      loading,
      supabaseConfigured: isSupabaseConfigured,
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
    }),
    [session, roles, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
