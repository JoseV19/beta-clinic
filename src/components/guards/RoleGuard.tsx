import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useRole, type AppRole } from '../../hooks/useRole'
import LoadingScreen from '../ui/LoadingScreen'

/* ── Props ─────────────────────────────────────────────── */

interface RoleGuardProps {
  /** Roles that are allowed to access the wrapped routes */
  allowedRoles: AppRole[]
  /**
   * Where to redirect when the user IS authenticated but has the wrong role.
   * Defaults to `/acceso-denegado`.
   */
  fallback?: string
}

/* ── Component ─────────────────────────────────────────── */

/**
 * Route-level guard that enforces role-based access.
 *
 * Usage:
 * ```tsx
 * <Route element={<RoleGuard allowedRoles={['doctor', 'admin']} />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * ```
 *
 * Flow:
 *  1. Not loaded yet  → <LoadingScreen />
 *  2. Not signed in   → redirect to /sign-in (preserving original URL)
 *  3. Wrong role      → redirect to fallback (default: /acceso-denegado)
 *  4. Correct role    → <Outlet /> (renders child routes)
 */
export default function RoleGuard({
  allowedRoles,
  fallback = '/acceso-denegado',
}: RoleGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { role, isReady } = useRole()
  const location = useLocation()

  /* ── 1. Still loading auth or role ──────────────────── */
  if (!isLoaded || !isReady) {
    return <LoadingScreen />
  }

  /* ── 2. Not signed in → login ───────────────────────── */
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  /* ── 3. Signed in, wrong role → denied ──────────────── */
  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallback} state={{ from: location }} replace />
  }

  /* ── 4. Authorized → render children ────────────────── */
  return <Outlet />
}
