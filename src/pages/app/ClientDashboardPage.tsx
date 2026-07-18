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
import { listDocuments } from '../../lib/documents/documentsApi'
import { fetchRiskFlags, type RiskFlagRow } from '../../lib/risk/riskApi'

const AUDIT_EVENT_LABELS: Record<string, string> = {
  answer_changed: 'Updated an answer',
  journey_created: 'Started a new immigration journey',
  consent_accepted: 'Recorded a consent',
  profile_updated: 'Updated your profile',
  review_requested: 'Requested a professional review',
  flag_created: 'A screening flag was recorded',
  document_uploaded: 'Uploaded a document',
  document_deleted: 'Removed a document',
  checklist_rule_applied: 'Linked a document to your checklist',
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
  const [documentCount, setDocumentCount] = useState(0)
  const [openFlags, setOpenFlags] = useState<RiskFlagRow[]>([])

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

        const [status, logs, documents, flags] = await Promise.all([
          getLatestReviewRequestStatus(activeJourney.id),
          getRecentAuditLogs(user.id, 5),
          listDocuments(activeJourney.id),
          fetchRiskFlags(activeJourney.id),
        ])
        setReviewStatus(status)
        setRecentActivity(logs)
        setDocumentCount(documents.length)
        setOpenFlags(flags.filter((f) => f.status === 'open'))
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.questionsRemaining')}</p>
          <p className="mt-1 text-3xl font-semibold text-navy">{questionsRemaining}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.reviewStatus')}</p>
          <p className="mt-1 text-lg font-semibold text-navy">{reviewStatus ?? t('dashboard.reviewStatusNotRequested')}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Documents Uploaded</p>
          <p className="mt-1 text-3xl font-semibold text-navy">{documentCount}</p>
          <Button variant="ghost" size="sm" className="mt-1 px-0" to="/app/documents">
            Manage documents →
          </Button>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Open Flags</p>
          <p className="mt-1 text-3xl font-semibold text-navy">{openFlags.length}</p>
          <Button variant="ghost" size="sm" className="mt-1 px-0" to="/app/checklist">
            View checklist →
          </Button>
        </Card>
      </div>

      {openFlags.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-navy">Items That May Need a Closer Look</h2>
          <ul className="mt-3 space-y-2">
            {openFlags.map((flag) => (
              <li key={flag.id} className="text-sm text-navy/70">
                {flag.triggering_explanation}
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3 px-0" to="/app/timeline">
            Review your timeline →
          </Button>
        </Card>
      )}

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.questionsRemaining')}</p>
          <p className="mt-1 text-3xl font-semibold text-navy">42</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">{t('dashboard.reviewStatus')}</p>
          <p className="mt-1 text-lg font-semibold text-navy">{t('dashboard.reviewStatusNotRequested')}</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Documents Uploaded</p>
          <p className="mt-1 text-3xl font-semibold text-navy">3</p>
        </Card>
        <Card>
          <p className="text-sm text-navy/50">Open Flags</p>
          <p className="mt-1 text-3xl font-semibold text-navy">1</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-navy">What's Coming Next</h2>
        <p className="mt-2 text-sm text-navy/60">
          This dashboard is a functional placeholder here because Supabase isn't connected in this environment.
          Once connected, it shows your real progress, uploaded documents, personalized checklist, and any
          flags from your timeline or questionnaire answers.
        </p>
      </Card>
    </div>
  )
}
