import { Navigate } from 'react-router-dom'
import { useOnboardingStatus } from '../../lib/onboarding/useOnboardingStatus'

const STEP_ROUTES: Record<string, string> = {
  profile: '/onboarding/profile',
  consent: '/onboarding/consent',
  journey: '/onboarding/journey',
  urgency: '/onboarding/urgency',
  done: '/app/dashboard',
}

export function OnboardingIndexPage() {
  const { loading, nextStep } = useOnboardingStatus()

  if (loading) {
    return <p className="text-navy/60">Loading your onboarding progress…</p>
  }

  return <Navigate to={STEP_ROUTES[nextStep]} replace />
}
