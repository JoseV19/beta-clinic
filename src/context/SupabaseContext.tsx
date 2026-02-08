import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClerkSupabaseClient } from '../lib/supabaseClient'
import type { Profile, AppRole } from '../types/database'

/* ── Context value ──────────────────────────────────────────────────────── */

interface SupabaseContextValue {
  /** Supabase client autenticado con el JWT de Clerk */
  supabase: SupabaseClient
  /** Perfil del usuario en public.profiles (null si no logueado) */
  profile: Profile | null
  /** Role shortcut: profile.role */
  role: AppRole | null
  /** true mientras se carga la sesión y el perfil */
  loading: boolean
  /** Re-fetch manual del perfil */
  refreshProfile: () => Promise<void>
}

const SupabaseCtx = createContext<SupabaseContextValue | undefined>(undefined)

/* ── Provider ───────────────────────────────────────────────────────────── */

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded: authLoaded } = useClerkAuth()
  const { user, isLoaded: userLoaded } = useUser()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  /* ── Stable Supabase client ───────────────────────────────────────── */
  // Use a ref so the custom fetch always calls the latest getToken
  // without recreating the Supabase client on every render.

  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const supabase = useMemo(
    () =>
      createClerkSupabaseClient(() =>
        getTokenRef.current({ template: 'supabase' }),
      ),
    [], // created once — token is always fresh via ref
  )

  /* ── Sync profile ─────────────────────────────────────────────────── */

  const syncProfile = useCallback(
    async (clerkUser: NonNullable<typeof user>) => {
      // 1. Try to fetch existing profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clerkUser.id)
        .maybeSingle()

      if (existing) {
        setProfile(existing as Profile)
        return
      }

      // 2. Profile doesn't exist → create it with Clerk data
      const fullName =
        clerkUser.fullName ??
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ??
        ''

      const { data: created } = await supabase
        .from('profiles')
        .insert({
          id: clerkUser.id,
          full_name: fullName,
          role: 'patient' as AppRole,
          avatar_url: clerkUser.imageUrl ?? null,
          phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
        })
        .select()
        .single()

      if (created) {
        setProfile(created as Profile)
      }
    },
    [supabase],
  )

  /* ── Effect: sync on auth change ──────────────────────────────────── */

  useEffect(() => {
    if (!authLoaded || !userLoaded) return

    if (!isSignedIn || !user) {
      setProfile(null)
      setLoading(false)
      return
    }

    let cancelled = false

    setLoading(true)
    syncProfile(user).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [authLoaded, userLoaded, isSignedIn, user?.id, syncProfile])

  /* ── Public refresh ───────────────────────────────────────────────── */

  const refreshProfile = useCallback(async () => {
    if (user) await syncProfile(user)
  }, [user, syncProfile])

  /* ── Value ────────────────────────────────────────────────────────── */

  const value: SupabaseContextValue = {
    supabase,
    profile,
    role: profile?.role ?? null,
    loading,
    refreshProfile,
  }

  return <SupabaseCtx.Provider value={value}>{children}</SupabaseCtx.Provider>
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export function useSupabase() {
  const ctx = useContext(SupabaseCtx)
  if (!ctx) throw new Error('useSupabase must be used within SupabaseProvider')
  return ctx
}
