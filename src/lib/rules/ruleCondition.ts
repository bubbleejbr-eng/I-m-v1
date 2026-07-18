import type { AnswerDraft } from '../../components/questionnaire/QuestionField'

/**
 * The condition_expression shape stored on checklist_rules and
 * risk_rules: `null` means "applies to everyone"; otherwise a single
 * check against one questionnaire answer, addressed by question_key
 * (not question_id, since rule seed data is written before questions
 * exist in a given environment — see supabase/seed/*.sql).
 */
export interface RuleCondition {
  question_key: string
  operator: 'equals' | 'not_equals' | 'includes' | 'is_answered'
  value?: unknown
}

/**
 * Distinct from src/lib/questionnaire/conditionalLogic.ts, which links
 * one question to another by id for in-questionnaire show/hide logic.
 * This evaluator answers a different question — "does this rule apply
 * to this journey's answers" — against a rule_condition_expression
 * keyed by question_key.
 */
export function evaluateRuleCondition(
  condition: RuleCondition | null | undefined,
  answerByQuestionKey: Map<string, AnswerDraft>,
): boolean {
  if (!condition) return true

  const draft = answerByQuestionKey.get(condition.question_key)

  if (condition.operator === 'is_answered') {
    return Boolean(draft) && !draft?.isNotSure && isPresent(draft?.normalizedValue)
  }

  if (!draft || draft.isNotSure) return false

  const answerValue = draft.normalizedValue

  if (condition.operator === 'includes') {
    if (Array.isArray(condition.value)) {
      return condition.value.map(String).includes(String(answerValue))
    }
    if (Array.isArray(answerValue)) {
      return answerValue.map(String).includes(String(condition.value))
    }
    return false
  }

  if (condition.operator === 'equals') return answerValue === condition.value
  if (condition.operator === 'not_equals') return answerValue !== condition.value

  return false
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}
