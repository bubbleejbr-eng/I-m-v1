import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { getJourneyTypes, createJourney, getMyActiveJourney, type JourneyTypeRow } from '../../lib/onboarding/onboardingApi'
import { Card, Badge, Button } from '../../ui'

export function JourneyStep() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)
  const [journeyTypes, setJourneyTypes] = useState<JourneyTypeRow[]>([])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const existing = await getMyActiveJourney(user.id)
      if (existing) {
        navigate('/onboarding/urgency')
        return
      }
      setJourneyTypes(await getJourneyTypes())
      setLoading(false)
    })()
  }, [user, navigate])

  async function selectJourney(journeyTypeId: string) {
    if (!user) return
    setCreating(journeyTypeId)
    await createJourney(user.id, journeyTypeId)
    setCreating(null)
    navigate('/onboarding/urgency')
  }

  if (loading) return <p className="text-navy/60">Loading…</p>

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-navy">{t('onboarding.stepJourneyTitle')}</h1>
      <p className="mt-2 text-navy/60">{t('onboarding.stepJourneySubtitle')}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {journeyTypes.map((journeyType) => (
          <Card key={journeyType.id} className="flex h-full flex-col justify-between">
            <div>
              <Badge tone={journeyType.is_active ? 'gold' : 'neutral'}>
                {journeyType.is_active ? t('services.activeLabel') : t('common.comingSoon')}
              </Badge>
              <h3 className="mt-3 text-lg font-semibold text-navy">{journeyType.situation_label}</h3>
              <p className="mt-2 text-sm text-navy/70">{journeyType.description}</p>
            </div>
            <div className="mt-6">
              {journeyType.is_active ? (
                <Button
                  size="sm"
                  className="w-full"
                  disabled={creating !== null}
                  onClick={() => void selectJourney(journeyType.id)}
                >
                  {creating === journeyType.id ? '…' : t('common.getStarted')}
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full" disabled aria-disabled="true">
                  {t('common.comingSoon')}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-sm text-navy/50">{t('onboarding.comingSoonNotice')}</p>
    </div>
  )
}
