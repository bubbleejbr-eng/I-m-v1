import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import type { AppRole } from '../../types/roles'

/**
 * Gates a page to one or more roles. Role membership is read from
 * `user_roles`, which only the platform (via controlled server-side
 * functions) can write to — a client can never grant themselves a role.
 */
export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { roles, supabaseConfigured } = useAuth()

  if (!supabaseConfigured) {
    return <>{children}</>
  }

  const authorized = roles.some((role) => allow.includes(role))
  if (!authorized) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
