import { evaluateCondition } from './conditionalLogic'
import type { AnswerDraft } from '../../components/questionnaire/QuestionField'
import { draftFromAnswer } from '../../components/questionnaire/QuestionField'
import type { WorkflowContent, UserAnswerRow, QuestionRow } from './questionnaireApi'

export function buildDraftsFromAnswers(
  questions: QuestionRow[],
  answers: Map<string, UserAnswerRow>,
): Map<string, AnswerDraft> {
  const drafts = new Map<string, AnswerDraft>()
  for (const question of questions) {
    drafts.set(question.id, draftFromAnswer(answers.get(question.id)))
  }
  return drafts
}

/** Re-keys a drafts-by-question-id map by question_key, for rule engines that address questions by key (see src/lib/rules/ruleCondition.ts). */
export function buildAnswerByQuestionKey(
  questions: QuestionRow[],
  drafts: Map<string, AnswerDraft>,
): Map<string, AnswerDraft> {
  const byKey = new Map<string, AnswerDraft>()
  for (const question of questions) {
    const draft = drafts.get(question.id)
    if (draft) byKey.set(question.question_key, draft)
  }
  return byKey
}

export function isAnswered(draft: AnswerDraft | undefined): boolean {
  if (!draft) return false
  if (draft.isNotSure) return true
  if (draft.normalizedValue === null || draft.normalizedValue === undefined) return false
  if (typeof draft.normalizedValue === 'string') return draft.normalizedValue.trim().length > 0
  if (Array.isArray(draft.normalizedValue)) return draft.normalizedValue.length > 0
  return true
}

export function computeVisibleQuestionIds(content: WorkflowContent, drafts: Map<string, AnswerDraft>): Set<string> {
  const visible = new Set<string>()
  for (const question of content.questions) {
    const rules = content.rulesByQuestionId.get(question.id) ?? []
    const allPass = rules.every((rule) => {
      const dependsOnDraft = drafts.get(rule.depends_on_question_id)
      return evaluateCondition(
        rule.condition_operator,
        rule.condition_value,
        dependsOnDraft && (dependsOnDraft.normalizedValue !== null || dependsOnDraft.isNotSure)
          ? { normalizedValue: dependsOnDraft.normalizedValue, isNotSure: dependsOnDraft.isNotSure }
          : undefined,
      )
    })
    if (allPass) visible.add(question.id)
  }
  return visible
}

export interface SectionCompletion {
  answered: number
  total: number
}

export interface QuestionnaireProgress {
  bySection: Map<string, SectionCompletion>
  overallAnswered: number
  overallTotal: number
  overallPercent: number
  /** First section (in sort order) that still has an unanswered visible question, if any. */
  nextIncompleteSectionId: string | null
}

export function computeProgress(content: WorkflowContent, drafts: Map<string, AnswerDraft>): QuestionnaireProgress {
  const visibleQuestionIds = computeVisibleQuestionIds(content, drafts)
  const bySection = new Map<string, SectionCompletion>()
  let overallAnswered = 0
  let overallTotal = 0
  let nextIncompleteSectionId: string | null = null

  for (const section of content.sections) {
    const questionsInSection = content.questions.filter(
      (q) => q.section_id === section.id && visibleQuestionIds.has(q.id),
    )
    const answered = questionsInSection.filter((q) => isAnswered(drafts.get(q.id))).length
    bySection.set(section.id, { answered, total: questionsInSection.length })
    overallAnswered += answered
    overallTotal += questionsInSection.length
    if (nextIncompleteSectionId === null && answered < questionsInSection.length) {
      nextIncompleteSectionId = section.id
    }
  }

  const overallPercent = overallTotal > 0 ? Math.round((overallAnswered / overallTotal) * 100) : 0

  return { bySection, overallAnswered, overallTotal, overallPercent, nextIncompleteSectionId }
}
