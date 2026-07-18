import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyActiveJourney, type JourneyRow } from '../../lib/onboarding/onboardingApi'
import {
  fetchWorkflowContent,
  fetchAnswers,
  saveAnswer,
  updateJourneyProgress,
  type WorkflowContent,
  type UserAnswerRow,
} from '../../lib/questionnaire/questionnaireApi'
import { buildDraftsFromAnswers, computeProgress, computeVisibleQuestionIds } from '../../lib/questionnaire/progress'
import { logAuditEvent } from '../../lib/audit/logAuditEvent'
import { SectionSidebar } from '../../components/questionnaire/SectionSidebar'
import { QuestionField, draftFromAnswer, type AnswerDraft } from '../../components/questionnaire/QuestionField'
import { Button, Card, ProgressBar } from '../../ui'

export function QuestionnairePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [content, setContent] = useState<WorkflowContent | null>(null)
  const [drafts, setDrafts] = useState<Map<string, AnswerDraft>>(new Map())
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [certificationError, setCertificationError] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)

      if (activeJourney?.workflow_version_id) {
        const [workflowContent, answers] = await Promise.all([
          fetchWorkflowContent(activeJourney.workflow_version_id),
          fetchAnswers(activeJourney.id),
        ])
        setContent(workflowContent)
        setDrafts(buildDraftsFromAnswers(workflowContent.questions, answers))
        setCurrentSectionId(workflowContent.sections[0]?.id ?? null)
      }
      setLoading(false)
    })()
  }, [user])

  const visibleQuestionIds = useMemo(() => {
    if (!content) return new Set<string>()
    return computeVisibleQuestionIds(content, drafts)
  }, [content, drafts])

  const progress = useMemo(() => {
    if (!content) return null
    return computeProgress(content, drafts)
  }, [content, drafts])

  const sectionCompletion = progress?.bySection ?? new Map<string, { answered: number; total: number }>()
  const overallProgress = progress?.overallPercent ?? 0

  useEffect(() => {
    if (journey && overallProgress !== journey.preparation_percent) {
      void updateJourneyProgress(journey.id, overallProgress)
    }
    // Only re-run when the computed percent actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overallProgress, journey?.id])

  if (loading) return <p className="text-navy/60">Loading your questionnaire…</p>

  if (!journey || !content || content.sections.length === 0) {
    return (
      <Card>
        <p className="text-navy/70">
          You don't have an active naturalization questionnaire yet.{' '}
          <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding/journey')}>
            Choose your journey
          </Button>
        </p>
      </Card>
    )
  }

  const sortedSections = content.sections
  const currentSectionIndex = sortedSections.findIndex((s) => s.id === currentSectionId)
  const currentSection = sortedSections[currentSectionIndex] ?? sortedSections[0]
  const isLastSection = currentSectionIndex === sortedSections.length - 1
  const currentQuestions = content.questions
    .filter((q) => q.section_id === currentSection.id && visibleQuestionIds.has(q.id))
    .sort((a, b) => a.sort_order - b.sort_order)

  function updateDraft(questionId: string, next: AnswerDraft) {
    setDrafts((prev) => new Map(prev).set(questionId, next))
  }

  async function commitDraft(questionId: string, next: AnswerDraft) {
    if (!journey) return
    setSaveStatus('saving')
    const saved = await saveAnswer({
      journeyId: journey.id,
      questionId,
      rawUserText: next.rawUserText,
      normalizedValue: next.normalizedValue,
      isNotSure: next.isNotSure,
    })
    if (saved) {
      setDrafts((prev) => new Map(prev).set(questionId, draftFromAnswer(saved as UserAnswerRow)))
      void logAuditEvent({
        eventType: 'answer_changed',
        journeyId: journey.id,
        targetTable: 'user_answers',
        targetId: questionId,
      })
    }
    setSaveStatus('saved')
  }

  function goToSection(sectionId: string) {
    setCurrentSectionId(sectionId)
    setCertificationError(false)
  }

  function goNext() {
    if (!content) return
    if (isLastSection) {
      const certifyQuestion = content.questions.find((q) => q.question_key === 'certify_information_true')
      const certifyDraft = certifyQuestion ? drafts.get(certifyQuestion.id) : undefined
      if (certifyQuestion && certifyDraft?.normalizedValue !== true) {
        setCertificationError(true)
        return
      }
      navigate('/app/dashboard')
      return
    }
    setCurrentSectionId(sortedSections[currentSectionIndex + 1].id)
    setCertificationError(false)
  }

  function goPrevious() {
    if (currentSectionIndex === 0) return
    setCurrentSectionId(sortedSections[currentSectionIndex - 1].id)
    setCertificationError(false)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" to="/app/dashboard">
          ← {t('questionnaire.backToDashboard')}
        </Button>
        <div className="w-48">
          <ProgressBar value={overallProgress} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <SectionSidebar
            sections={sortedSections}
            currentSectionId={currentSection.id}
            completion={sectionCompletion}
            onSelect={goToSection}
          />
        </aside>

        <div>
          <h1 className="text-2xl font-semibold text-navy">{currentSection.title}</h1>

          <div className="mt-6 space-y-4">
            {currentQuestions.length === 0 && (
              <p className="text-sm text-navy/50">Nothing to answer in this section yet.</p>
            )}
            {currentQuestions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                options={content.optionsByQuestionId.get(question.id) ?? []}
                draft={drafts.get(question.id) ?? { rawUserText: null, normalizedValue: null, isNotSure: false }}
                onChange={(next) => updateDraft(question.id, next)}
                onCommit={(next) => void commitDraft(question.id, next)}
              />
            ))}
          </div>

          {certificationError && (
            <p role="alert" className="mt-4 text-sm font-medium text-brick">
              {t('questionnaire.confirmCertification')}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={goPrevious} disabled={currentSectionIndex === 0}>
              {t('questionnaire.previous')}
            </Button>
            <span className="text-xs text-navy/40">
              {saveStatus === 'saving' ? t('questionnaire.saving') : saveStatus === 'saved' ? t('questionnaire.saved') : ''}
            </span>
            <Button onClick={goNext}>{isLastSection ? t('onboarding.finishButton') : t('questionnaire.finishSection')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
