import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Badge, ProgressBar, Button, DisclaimerBanner } from '../../ui'
import { useAuth } from '../../lib/auth/AuthContext'
import { legalNotices } from '../../content/brand'
import { getMyActiveJourney, type JourneyRow } from '../../lib/onboarding/onboardingApi'
import { fetchWorkflowContent, fetchAnswers, type WorkflowContent } from '../../lib/questionnaire/questionnaireApi'
import { buildDraftsFromAnswers, computeProgress } from '../../lib/questionnaire/progress'
import {
  getJourneyTypeById,
  getLatestReviewRequestStatus,
  getRecentAuditLogs,
  type AuditLogRow,
} from '../../lib/dashboard/dashboardApi'

const AUDIT_EVENT_LABELS: Record<string, string> = {
  answer_changed: 'Updated an answer',
  journey_created: 'Started a new immigration journey',
  consent_accepted: 'Recorded a consent',
  profile_updated: 'Updated your profile',
  review_requested: 'Requested a professional review',
  flag_created: 'A screening flag was recorded',
}

export function ClientDashboardPage() {
  const { t } = useTranslation()
  const { user, supabaseConfigured } = useAuth()

  const [loading, setLoading] = useState(true)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [journeyLabel, setJourneyLabel] = useState<string>('')
  const [nextSectionTitle, setNextSectionTitle] = useState<string | null>(null)
  const [questionsRemaining, setQuestionsRemaining] = useState(0)
  const [reviewStatus, setReviewStatus] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<AuditLogRow[]>([])

  useEffect(() => {
    if (!user || !supabaseConfigured) {
      setLoading(false)
      return
    }

    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)

      if (activeJourney) {
        const journeyType = await getJourneyTypeById(activeJourney.journey_type_id)
        setJourneyLabel(journeyType?.situation_label ?? '')

        if (activeJourney.workflow_version_id) {
          const [content, answers]: [WorkflowContent, Awaited<ReturnType<typeof fetchAnswers>>] = await Promise.all([
            fetchWorkflowContent(activeJourney.workflow_version_id),
            fetchAnswers(activeJourney.id),
          ])
          const drafts = buildDraftsFromAnswers(content.questions, answers)
          const progress = computeProgress(content, drafts)
          setQuestionsRemaining(progress.overallTotal - progress.overallAnswered)

          const nextSection = content.sections.find((s) => s.id === progress.nextIncompleteSectionId)
          setNextSectionTitle(nextSection?.title ?? null)
        }

        const [status, logs] = await Promise.all([
          getLatestReviewRequestStatus(activeJourney.id),
          getRecentAuditLogs(user.id, 5),
        ])
        setReviewStatus(status)
        setRecentActivity(logs)
      }

      setLoading(false)
    })()
  }, [user, supabaseConfigured])

  if (!supabaseConfigured) {
    return <DemoDashboard />
  }

  if (loading) {
    return <p className="text-navy/60">Loading your dashboard…</p>
  }

  if (!journey) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-xl font-semibold text-navy">{t('dashboard.noActiveJourney')}</h1>
        <div className="mt-6">
          <Button to="/onboarding/journey">{t('dashboard.startJourney')}</Button>
        </div>
      </Card>
    )
  }

  const overallPercent = journey.preparation_percent

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-navy/60">
            {t('dashboard.welcomeBack')}
            {user?.email ? `, ${user.email}` : ''}
          </p>
          <h1 className="text-2xl font-semibold text-navy">{journeyLabel}</h1>
        </div>
        {journey.is_urgent && <Badge tone="brick">{t('dashboard.urgentBadge')}</Badge>}
      </div>

      <DisclaimerBanner>{legalNotices.legalBoundaryNotice}</DisclaimerBanner>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-navy">{t('dashboard.nextStepTitle')}</h2>
          <p className="mt-2 text-navy/70">
            {nextSectionTitle
              ? t('dashboard.nextQuestionAction', { section: nextSectionTitle })
              : t('dashboard.allSectionsComplete')}
          </p>
          <Button size="sm" className="mt-4" to="/app/questionnaire">
            {t('dashboard.continueApplication')}
          </Button>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/50">
            {t('dashboard.overallPreparation')}
          </h2>
          <div className="mt-4">
            <ProgressBar value={overallPercent} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.questionsRemaining')}</p>
          <p className="mt-1 text-3xl font-semibold text-navy">{questionsRemaining}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.reviewStatus')}</p>
          <p className="mt-1 text-lg font-semibold text-navy">{reviewStatus ?? t('dashboard.reviewStatusNotRequested')}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.documentsComingSoon')}</p>
          <p className="mt-1 text-lg font-semibold text-navy/40">—</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy">{t('dashboard.recentActivityTitle')}</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-2 text-sm text-navy/60">{t('dashboard.noRecentActivity')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentActivity.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm text-navy/70">
                <span>{AUDIT_EVENT_LABELS[log.event_type] ?? log.event_type}</span>
                <span className="text-navy/40">{new Date(log.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

/** Shown when Supabase isn't configured in this environment, so the dashboard UI stays reviewable. */
function DemoDashboard() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-navy/60">{t('dashboard.welcomeBack')}, Maria Santos</p>
          <h1 className="text-2xl font-semibold text-navy">United States Naturalization Preparation</h1>
        </div>
        <Badge tone="gold">{t('common.demoDataBadge')}</Badge>
      </div>

      <DisclaimerBanner>{legalNotices.legalBoundaryNotice}</DisclaimerBanner>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <h2 className="text-lg font-semibold text-navy">{t('dashboard.nextStepTitle')}</h2>
          <p className="mt-2 text-navy/70">Complete five naturalization questions about your address history.</p>
          <Button size="sm" className="mt-4" disabled>
            {t('dashboard.continueApplication')}
          </Button>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/50">
            {t('dashboard.overallPreparation')}
          </h2>
          <div className="mt-4">
            <ProgressBar value={35} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.questionsRemaining')}</p>
          <p className="mt-1 text-3xl font-semibold text-navy">42</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.reviewStatus')}</p>
          <p className="mt-1 text-lg font-semibold text-navy">{t('dashboard.reviewStatusNotRequested')}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.documentsComingSoon')}</p>
          <p className="mt-1 text-lg font-semibold text-navy/40">—</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy">What's Coming Next</h2>
        <p className="mt-2 text-sm text-navy/60">{t('dashboard.placeholderNotice')}</p>
      </Card>
    </div>
  )
}
