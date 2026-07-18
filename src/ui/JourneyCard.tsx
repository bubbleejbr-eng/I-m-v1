import { useTranslation } from 'react-i18next'
import { Card } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'
import type { JourneyCardContent } from '../content/journeys'

export function JourneyCard({ journey }: { journey: JourneyCardContent }) {
  const { t } = useTranslation()
  const isActive = journey.status === 'active'

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge tone={isActive ? 'gold' : 'neutral'}>
            {isActive ? t('services.activeLabel') : t('common.comingSoon')}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold text-navy">{journey.situationLabel}</h3>
        <p className="mt-2 text-sm text-navy/70">{journey.description}</p>
        {journey.formReference && (
          <p className="mt-3 text-xs font-medium text-navy/40">{journey.formReference}</p>
        )}
      </div>
      <div className="mt-6">
        {isActive ? (
          <Button to={`/services/naturalization`} size="sm" className="w-full">
            {t('common.getStarted')}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full" disabled aria-disabled="true">
            {t('common.comingSoon')}
          </Button>
        )}
      </div>
    </Card>
  )
}
