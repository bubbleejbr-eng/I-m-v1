import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyProfile, upsertProfile } from '../../lib/onboarding/onboardingApi'
import { Button } from '../../ui'

export function ProfileStep() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [countryOfBirth, setCountryOfBirth] = useState('')
  const [countryOfResidence, setCountryOfResidence] = useState('')
  const [usState, setUsState] = useState('')
  const [preferredCommunicationMethod, setPreferredCommunicationMethod] = useState('Email')
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void getMyProfile(user.id).then((profile) => {
      if (profile) {
        setFirstName(profile.first_name ?? '')
        setMiddleName(profile.middle_name ?? '')
        setLastName(profile.last_name ?? '')
        setMobilePhone(profile.mobile_phone ?? '')
        setCountryOfBirth(profile.country_of_birth ?? '')
        setCountryOfResidence(profile.country_of_residence ?? '')
        setUsState(profile.us_state ?? '')
        setPreferredCommunicationMethod(profile.preferred_communication_method ?? 'Email')
      }
      setLoading(false)
    })
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setSubmitting(true)
    await upsertProfile(user.id, {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      mobile_phone: mobilePhone || null,
      country_of_birth: countryOfBirth,
      country_of_residence: countryOfResidence,
      us_state: usState || null,
      preferred_communication_method: preferredCommunicationMethod,
      time_zone: timeZone,
    })
    setSubmitting(false)
    navigate('/onboarding/consent')
  }

  if (loading) return <p className="text-navy/60">Loading…</p>

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-navy">{t('onboarding.stepProfileTitle')}</h1>
      <p className="mt-2 text-navy/60">{t('onboarding.stepProfileSubtitle')}</p>

      <form className="mt-8 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t('onboarding.firstName')} value={firstName} onChange={setFirstName} required autoComplete="given-name" />
          <Field label={t('onboarding.middleName')} value={middleName} onChange={setMiddleName} autoComplete="additional-name" />
          <Field label={t('onboarding.lastName')} value={lastName} onChange={setLastName} required autoComplete="family-name" />
        </div>

        <Field label={t('onboarding.mobilePhone')} value={mobilePhone} onChange={setMobilePhone} autoComplete="tel" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('onboarding.countryOfBirth')} value={countryOfBirth} onChange={setCountryOfBirth} required />
          <Field label={t('onboarding.countryOfResidence')} value={countryOfResidence} onChange={setCountryOfResidence} required />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('onboarding.usState')} value={usState} onChange={setUsState} />
          <div>
            <label className="mb-1 block text-sm font-medium text-navy">{t('onboarding.preferredCommunicationMethod')}</label>
            <select
              value={preferredCommunicationMethod}
              onChange={(e) => setPreferredCommunicationMethod(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            >
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Mail">Mail</option>
            </select>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? '…' : t('onboarding.continueButton')}
        </Button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-navy">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
      />
    </div>
  )
}
