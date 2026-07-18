import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth/AuthContext'
import {
  getMyActiveJourney,
  getRiskRulesForWorkflow,
  submitUrgencyScreening,
  requestUrgentReview,
  type JourneyRow,
  type RiskRuleRow,
} from '../../lib/onboarding/onboardingApi'
import { urgencyScreeningItems } from '../../content/urgencyScreening'
import { Button, DisclaimerBanner } from '../../ui'

export function UrgencyStep() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [riskRules, setRiskRules] = useState<RiskRuleRow[]>([])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [urgentReviewRequested, setUrgentReviewRequested] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)
      if (activeJourney?.workflow_version_id) {
        setRiskRules(await getRiskRulesForWorkflow(activeJourney.workflow_version_id))
      }
      setLoading(false)
    })()
  }, [user])

  const anyUrgentChecked = urgencyScreeningItems.some((item) => item.urgent && checked[item.ruleKey])

  async function handleSubmit() {
    if (!journey) return
    setSubmitting(true)
    const checkedRuleKeys = Object.entries(checked)
      .filter(([, isChecked]) => isChecked)
      .map(([key]) => key)

    await submitUrgencyScreening({
      journeyId: journey.id,
      checkedRuleKeys,
      riskRules,
      isAnyUrgent: anyUrgentChecked,
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  async function handleRequestUrgentReview() {
    if (!journey) return
    await requestUrgentReview(journey.id)
    setUrgentReviewRequested(true)
  }

  if (loading) return <p className="text-navy/60">Loading…</p>

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl text-center">
        {anyUrgentChecked && (
          <div className="mb-6 space-y-4">
            <DisclaimerBanner tone="urgent">{t('onboarding.urgentNotice')}</DisclaimerBanner>
            {urgentReviewRequested ? (
              <p className="font-medium text-navy">{t('onboarding.urgentReviewSubmitted')}</p>
            ) : (
              <Button variant="secondary" onClick={() => void handleRequestUrgentReview()}>
                {t('onboarding.requestUrgentReview')}
              </Button>
            )}
          </div>
        )}
        <Button size="lg" to="/app/dashboard">
          {t('onboarding.finishButton')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-navy">{t('onboarding.stepUrgencyTitle')}</h1>
      <p className="mt-2 text-navy/60">{t('onboarding.stepUrgencySubtitle')}</p>

      <div className="mt-8 space-y-3">
        {urgencyScreeningItems.map((item) => (
          <label key={item.ruleKey} className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-4">
            <input
              type="checkbox"
              checked={checked[item.ruleKey] ?? false}
              onChange={(e) => setChecked((prev) => ({ ...prev, [item.ruleKey]: e.target.checked }))}
              className="mt-1 h-5 w-5 rounded border-navy/30"
            />
            <span className="text-sm text-navy/80">{t(item.labelKey)}</span>
          </label>
        ))}
      </div>

      <div className="mt-8">
        <Button size="lg" disabled={submitting} onClick={() => void handleSubmit()}>
          {submitting ? '…' : t('onboarding.continueButton')}
        </Button>
      </div>
    </div>
  )
}
