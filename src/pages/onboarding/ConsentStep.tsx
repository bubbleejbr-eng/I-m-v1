import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyConsents, recordConsent } from '../../lib/onboarding/onboardingApi'
import { onboardingConsents } from '../../content/onboardingConsents'
import { Button } from '../../ui'

export function ConsentStep() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // Every box starts unchecked, per product requirement — never
  // pre-check a consent box, even when re-visiting this step.
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void getMyConsents(user.id).then(() => setLoading(false))
  }, [user])

  const requiredMissing = onboardingConsents.some((c) => c.required && !checked[c.consentType])

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    await Promise.all(
      onboardingConsents
        .filter((c) => checked[c.consentType])
        .map((c) => recordConsent(user.id, c.consentType, true)),
    )
    setSubmitting(false)
    navigate('/onboarding/journey')
  }

  if (loading) return <p className="text-navy/60">Loading…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-navy">{t('onboarding.stepConsentTitle')}</h1>
      <p className="mt-2 text-navy/60">{t('onboarding.stepConsentSubtitle')}</p>

      <div className="mt-8 space-y-3">
        {onboardingConsents.map((consent) => (
          <label
            key={consent.consentType}
            className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-4"
          >
            <input
              type="checkbox"
              checked={checked[consent.consentType] ?? false}
              onChange={(e) => setChecked((prev) => ({ ...prev, [consent.consentType]: e.target.checked }))}
              className="mt-1 h-5 w-5 rounded border-navy/30"
            />
            <span className="text-sm text-navy/80">
              {t(consent.labelKey)}
              {!consent.required && <span className="ml-2 text-xs text-navy/40">(optional)</span>}
            </span>
          </label>
        ))}
      </div>

      {requiredMissing && <p className="mt-4 text-sm text-navy/50">{t('onboarding.consentRequiredNotice')}</p>}

      <div className="mt-8">
        <Button size="lg" disabled={requiredMissing || submitting} onClick={() => void handleSubmit()}>
          {submitting ? '…' : t('onboarding.continueButton')}
        </Button>
      </div>
    </div>
  )
}
