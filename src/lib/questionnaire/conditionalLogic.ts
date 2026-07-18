import type { ConditionOperator } from '../supabase/types'

export interface AnswerLookup {
  normalizedValue: unknown
  isNotSure: boolean
}

/**
 * Evaluates one conditional_rules row against the current answer map.
 * Kept deliberately simple (four operators) rather than a general
 * expression engine — see conditional_rules in
 * supabase/migrations/0004_questionnaire.sql for the operator
 * vocabulary this must stay in sync with.
 */
export function evaluateCondition(
  operator: ConditionOperator,
  conditionValue: string | null,
  dependsOnAnswer: AnswerLookup | undefined,
): boolean {
  if (operator === 'is_answered') {
    return Boolean(dependsOnAnswer) && !dependsOnAnswer?.isNotSure && isPresent(dependsOnAnswer?.normalizedValue)
  }

  if (!dependsOnAnswer || dependsOnAnswer.isNotSure) return false

  const value = dependsOnAnswer.normalizedValue

  if (operator === 'includes') {
    if (Array.isArray(value)) return value.map(String).includes(String(conditionValue))
    return String(value) === String(conditionValue)
  }

  const stringValue = normalizedToComparableString(value)

  if (operator === 'equals') return stringValue === conditionValue
  if (operator === 'not_equals') return stringValue !== conditionValue

  return false
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function normalizedToComparableString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}
