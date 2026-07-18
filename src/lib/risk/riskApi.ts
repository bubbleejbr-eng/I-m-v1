import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'
import type { AnswerDraft } from '../../components/questionnaire/QuestionField'
import { evaluateRuleCondition, type RuleCondition } from '../rules/ruleCondition'
import { logAuditEvent } from '../audit/logAuditEvent'

export type RiskRuleRow = Database['public']['Tables']['risk_rules']['Row']
export type RiskFlagRow = Database['public']['Tables']['risk_flags']['Row']

export async function fetchRiskRules(workflowVersionId: string): Promise<RiskRuleRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('risk_rules')
    .select('*')
    .eq('workflow_version_id', workflowVersionId)
    .eq('approval_status', 'published')
  return data ?? []
}

export async function fetchRiskFlags(journeyId: string): Promise<RiskFlagRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('risk_flags')
    .select('*')
    .eq('journey_id', journeyId)
    .order('created_at', { ascending: false })
  return data ?? []
}

/**
 * Evaluates every risk_rule with a condition tied to a specific
 * answer (rule_key not in the timeline-only set) and creates a
 * risk_flags row for each newly-triggered one. Never re-flags a rule
 * that already has a flag for this journey, so a client
 * acknowledging/resolving a flag isn't immediately re-created next
 * visit purely because the underlying answer hasn't changed.
 */
export async function evaluateAnswerRiskRules(params: {
  journeyId: string
  rules: RiskRuleRow[]
  answerByQuestionKey: Map<string, AnswerDraft>
  existingFlags: RiskFlagRow[]
}): Promise<RiskFlagRow[]> {
  if (!supabase) return params.existingFlags

  const existingRuleIds = new Set(params.existingFlags.map((f) => f.risk_rule_id))
  const answerBasedRules = params.rules.filter((rule) => rule.condition_expression !== null)

  const toCreate = answerBasedRules.filter((rule) => {
    if (existingRuleIds.has(rule.id)) return false
    return evaluateRuleCondition(rule.condition_expression as RuleCondition, params.answerByQuestionKey)
  })

  if (toCreate.length === 0) return params.existingFlags

  const { data, error } = await supabase
    .from('risk_flags')
    .insert(
      toCreate.map((rule) => ({
        journey_id: params.journeyId,
        risk_rule_id: rule.id,
        triggering_explanation: rule.explanation_template,
      })),
    )
    .select()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create risk flags', error)
    return params.existingFlags
  }

  if (data && data.length > 0) {
    await logAuditEvent({
      eventType: 'flag_created',
      journeyId: params.journeyId,
      targetTable: 'risk_flags',
      description: `${data.length} flag(s) created from questionnaire answers`,
    })
  }

  return [...params.existingFlags, ...(data ?? [])]
}

/**
 * Creates a risk_flags row for a timeline-detected condition
 * (address/employment gap, travel overlap) if one doesn't already
 * exist for this journey + rule_key.
 */
export async function ensureTimelineRiskFlag(params: {
  journeyId: string
  ruleKey: string
  rules: RiskRuleRow[]
  existingFlags: RiskFlagRow[]
}): Promise<RiskFlagRow[]> {
  if (!supabase) return params.existingFlags

  const rule = params.rules.find((r) => r.rule_key === params.ruleKey)
  if (!rule) return params.existingFlags

  const alreadyFlagged = params.existingFlags.some((f) => f.risk_rule_id === rule.id)
  if (alreadyFlagged) return params.existingFlags

  const { data, error } = await supabase
    .from('risk_flags')
    .insert({ journey_id: params.journeyId, risk_rule_id: rule.id, triggering_explanation: rule.explanation_template })
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create timeline risk flag', error)
    return params.existingFlags
  }

  await logAuditEvent({
    eventType: 'flag_created',
    journeyId: params.journeyId,
    targetTable: 'risk_flags',
    targetId: data.id,
    description: `Timeline flag created: ${params.ruleKey}`,
  })

  return [...params.existingFlags, data]
}

export async function resolveRiskFlag(flagId: string, resolvedBy: string, journeyId: string): Promise<void> {
  if (!supabase) return
  await supabase
    .from('risk_flags')
    .update({ status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date().toISOString() })
    .eq('id', flagId)
  await logAuditEvent({ eventType: 'flag_resolved', journeyId, targetTable: 'risk_flags', targetId: flagId })
}
