import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyActiveJourney, type JourneyRow } from '../../lib/onboarding/onboardingApi'
import { fetchWorkflowContent, fetchAnswers } from '../../lib/questionnaire/questionnaireApi'
import { buildDraftsFromAnswers, buildAnswerByQuestionKey } from '../../lib/questionnaire/progress'
import {
  fetchChecklistRules,
  fetchChecklistItems,
  ensureChecklistGenerated,
  linkDocumentToChecklistItem,
  type ChecklistRuleRow,
  type ChecklistItemRow,
} from '../../lib/checklist/checklistApi'
import { uploadDocument } from '../../lib/documents/documentsApi'
import { Card, Badge } from '../../ui'

const REQUIREMENT_LABELS: Record<ChecklistRuleRow['requirement_level'], string> = {
  generally_requested: 'Generally Requested',
  conditional: 'Conditional',
  recommended: 'Recommended',
  professional_review_item: 'Professional Review Item',
}

const STATUS_LABELS: Record<ChecklistItemRow['status'], string> = {
  outstanding: 'Outstanding',
  uploaded: 'Uploaded',
  in_review: 'In Review',
  accepted: 'Accepted',
  needs_replacement: 'Needs Replacement',
}

export function ChecklistPage() {
  const { user } = useAuth()
  const uploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [loading, setLoading] = useState(true)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [rules, setRules] = useState<ChecklistRuleRow[]>([])
  const [items, setItems] = useState<ChecklistItemRow[]>([])
  const [uploadingRuleId, setUploadingRuleId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)

      if (activeJourney?.workflow_version_id) {
        const [content, answers, checklistRules, existingItems] = await Promise.all([
          fetchWorkflowContent(activeJourney.workflow_version_id),
          fetchAnswers(activeJourney.id),
          fetchChecklistRules(activeJourney.workflow_version_id),
          fetchChecklistItems(activeJourney.id),
        ])
        const drafts = buildDraftsFromAnswers(content.questions, answers)
        const answerByQuestionKey = buildAnswerByQuestionKey(content.questions, drafts)

        setRules(checklistRules)
        const generatedItems = await ensureChecklistGenerated({
          journeyId: activeJourney.id,
          rules: checklistRules,
          existingItems,
          answerByQuestionKey,
        })
        setItems(generatedItems)
      }
      setLoading(false)
    })()
  }, [user])

  async function handleUploadForRule(rule: ChecklistRuleRow, item: ChecklistItemRow, file: File | undefined) {
    if (!file || !user || !journey) return
    setUploadingRuleId(rule.id)
    const document = await uploadDocument({
      journeyId: journey.id,
      userId: user.id,
      file,
      categoryId: rule.document_category_id,
    })
    if (document) {
      await linkDocumentToChecklistItem(item.id, document.id, journey.id)
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, document_id: document.id, status: 'uploaded' } : i)))
    }
    setUploadingRuleId(null)
  }

  if (loading) return <p className="text-navy/60">Loading your checklist…</p>

  if (!journey) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-navy/70">You don't have an active immigration journey yet.</p>
      </Card>
    )
  }

  const itemsByRuleId = new Map(items.map((item) => [item.checklist_rule_id, item]))
  const sortedRules = [...rules].sort((a, b) => a.document_name.localeCompare(b.document_name))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Your Personalized Checklist</h1>
        <p className="mt-1 text-navy/60">
          Based on your answers, here is what may be needed for your naturalization application. Items marked
          "Professional Review Item" are generally requested for a qualified professional to review before filing.
        </p>
      </div>

      <div className="space-y-3">
        {sortedRules.map((rule) => {
          const item = itemsByRuleId.get(rule.id)
          if (!item) return null
          return (
            <Card key={rule.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy">{rule.document_name}</h3>
                    <Badge tone={rule.requirement_level === 'professional_review_item' ? 'brick' : 'neutral'}>
                      {REQUIREMENT_LABELS[rule.requirement_level]}
                    </Badge>
                    <Badge tone={item.status === 'accepted' ? 'success' : 'neutral'}>{STATUS_LABELS[item.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-navy/60">{rule.plain_language_explanation}</p>
                  {item.reviewer_comment && (
                    <p className="mt-2 rounded-lg bg-gold-light/20 p-2 text-sm text-navy">
                      Reviewer comment: {item.reviewer_comment}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    ref={(el) => {
                      uploadInputRefs.current[rule.id] = el
                    }}
                    type="file"
                    className="hidden"
                    onChange={(e) => void handleUploadForRule(rule, item, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingRuleId === rule.id}
                    onClick={() => uploadInputRefs.current[rule.id]?.click()}
                    className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-ivory hover:bg-navy-light disabled:opacity-50"
                  >
                    {uploadingRuleId === rule.id ? 'Uploading…' : item.document_id ? 'Replace' : 'Upload'}
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
