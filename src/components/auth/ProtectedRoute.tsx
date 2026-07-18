import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'

export function ProtectedRoute() {
  const { user, loading, supabaseConfigured } = useAuth()
  const location = useLocation()

  if (!supabaseConfigured) {
    // Supabase not connected yet in this environment; allow through so
    // the shell UI remains reviewable, but this must never happen in
    // a deployed environment with real client data.
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-navy">
        <p>Loading your workspace…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <Outlet />
}
