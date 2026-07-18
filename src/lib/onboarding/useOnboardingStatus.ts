import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  getMyProfile,
  getMyConsents,
  getMyActiveJourney,
  type ProfileRow,
  type ConsentRow,
  type JourneyRow,
} from './onboardingApi'
import { onboardingConsents } from '../../content/onboardingConsents'

export type OnboardingStep = 'language' | 'profile' | 'consent' | 'journey' | 'urgency' | 'done'

interface OnboardingStatus {
  loading: boolean
  profile: ProfileRow | null
  consents: Map<string, ConsentRow>
  activeJourney: JourneyRow | null
  nextStep: OnboardingStep
  refresh: () => Promise<void>
}

function isProfileComplete(profile: ProfileRow | null): boolean {
  if (!profile) return false
  return Boolean(profile.first_name && profile.last_name && profile.country_of_birth && profile.country_of_residence)
}

function isConsentComplete(consents: Map<string, ConsentRow>): boolean {
  return onboardingConsents
    .filter((c) => c.required)
    .every((c) => consents.get(c.consentType)?.accepted === true)
}

/** Central source of truth for "where should this client be in onboarding right now." */
export function useOnboardingStatus(): OnboardingStatus {
  const { user, supabaseConfigured } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [consents, setConsents] = useState<Map<string, ConsentRow>>(new Map())
  const [activeJourney, setActiveJourney] = useState<JourneyRow | null>(null)

  const refresh = useCallback(async () => {
    if (!user || !supabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [profileResult, consentsResult, journeyResult] = await Promise.all([
      getMyProfile(user.id),
      getMyConsents(user.id),
      getMyActiveJourney(user.id),
    ])
    setProfile(profileResult)
    setConsents(consentsResult)
    setActiveJourney(journeyResult)
    setLoading(false)
  }, [user, supabaseConfigured])

  useEffect(() => {
    void refresh()
  }, [refresh])

  let nextStep: OnboardingStep = 'done'
  if (!isProfileComplete(profile)) nextStep = 'profile'
  else if (!isConsentComplete(consents)) nextStep = 'consent'
  else if (!activeJourney) nextStep = 'journey'
  else if (!activeJourney.urgency_screening_completed_at) nextStep = 'urgency'

  return { loading, profile, consents, activeJourney, nextStep, refresh }
}
