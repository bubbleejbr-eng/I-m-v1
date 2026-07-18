import { useTranslation } from 'react-i18next'
import { Card, Badge, ProgressBar, Button, DisclaimerBanner } from '../../ui'
import { useAuth } from '../../lib/auth/AuthContext'
import { legalNotices } from '../../content/brand'

export function ClientDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-navy/60">
            {t('dashboard.welcomeBack')}
            {user?.email ? `, ${user.email}` : ''}
          </p>
          <h1 className="text-2xl font-semibold text-navy">United States Naturalization Preparation</h1>
        </div>
        <Badge tone="gold">{t('common.demoDataBadge')}</Badge>
      </div>

      <DisclaimerBanner>{legalNotices.legalBoundaryNotice}</DisclaimerBanner>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-navy">{t('dashboard.nextStepTitle')}</h2>
          <p className="mt-2 text-navy/70">
            Complete five naturalization questions about your address history.
          </p>
          <Button size="sm" className="mt-4">
            {t('dashboard.continueApplication')}
          </Button>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/50">Overall Preparation</h2>
          <div className="mt-4">
            <ProgressBar value={35} label="Naturalization Application" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-navy/50">Questions Remaining</p>
          <p className="mt-1 text-3xl font-semibold text-navy">42</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Documents Missing</p>
          <p className="mt-1 text-3xl font-semibold text-navy">6</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Documents Under Review</p>
          <p className="mt-1 text-3xl font-semibold text-navy">1</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Professional Review</p>
          <p className="mt-1 text-lg font-semibold text-navy">Not Requested</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy">What's Coming Next</h2>
        <p className="mt-2 text-sm text-navy/60">{t('dashboard.placeholderNotice')}</p>
      </Card>
    </div>
  )
}
