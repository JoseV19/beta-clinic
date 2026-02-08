import { useUser } from '@clerk/clerk-react'
import { usePersistentState } from './usePersistentState'

/* ── Types ─────────────────────────────────────────────── */

export type AppRole = 'doctor' | 'patient' | 'admin'

export interface RoleInfo {
  /** Current resolved role (Clerk metadata → localStorage fallback) */
  role: AppRole
  /** Update the local role (for demo / onboarding) */
  setRole: (role: AppRole) => void
  /** Whether the role has been determined */
  isReady: boolean
  /** Home route for the current role */
  homeRoute: string
}

/* ── Role → home route mapping ────────────────────────── */

const ROLE_HOME: Record<AppRole, string> = {
  doctor: '/dashboard',
  admin: '/dashboard',
  patient: '/mi-salud',
}

/* ── Hook ─────────────────────────────────────────────── */

/**
 * Resolves the current user's role.
 *
 * Priority:
 *  1. Clerk `user.publicMetadata.role` (set by backend/Clerk dashboard)
 *  2. localStorage `beta_user_role` (set during onboarding / demo)
 *  3. Defaults to `'doctor'` for existing onboarded users
 *
 * In production, roles should be set via Clerk Dashboard or a backend
 * endpoint that calls `clerkClient.users.updateUserMetadata()`.
 */
export function useRole(): RoleInfo {
  const { user, isLoaded } = useUser()
  const [localRole, setLocalRole] = usePersistentState<AppRole>('beta_user_role', 'doctor')

  // Prefer Clerk metadata if available
  const clerkRole = (user?.publicMetadata as { role?: string } | undefined)?.role as
    | AppRole
    | undefined

  const role: AppRole = clerkRole ?? localRole
  const homeRoute = ROLE_HOME[role]

  return {
    role,
    setRole: setLocalRole,
    isReady: isLoaded,
    homeRoute,
  }
}
