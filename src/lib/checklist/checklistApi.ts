import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'
import type { AnswerDraft } from '../../components/questionnaire/QuestionField'
import { evaluateRuleCondition, type RuleCondition } from '../rules/ruleCondition'
import { logAuditEvent } from '../audit/logAuditEvent'

export type ChecklistRuleRow = Database['public']['Tables']['checklist_rules']['Row']
export type ChecklistItemRow = Database['public']['Tables']['checklist_items']['Row']

export async function fetchChecklistRules(workflowVersionId: string): Promise<ChecklistRuleRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('checklist_rules')
    .select('*')
    .eq('workflow_version_id', workflowVersionId)
    .eq('approval_status', 'published')
  return data ?? []
}

export async function fetchChecklistItems(journeyId: string): Promise<ChecklistItemRow[]> {
  if (!supabase) return []
  const { data } = await supabase.from('checklist_items').select('*').eq('journey_id', journeyId)
  return data ?? []
}

/**
 * Creates a checklist_items row for every checklist_rule whose
 * condition currently matches this journey's answers and that doesn't
 * already have one. Safe to call repeatedly (e.g. every time the
 * client visits the checklist) — it only ever adds rows, never
 * removes one a client might already be acting on, even if a later
 * answer change makes the rule's condition no longer match.
 */
export async function ensureChecklistGenerated(params: {
  journeyId: string
  rules: ChecklistRuleRow[]
  existingItems: ChecklistItemRow[]
  answerByQuestionKey: Map<string, AnswerDraft>
}): Promise<ChecklistItemRow[]> {
  if (!supabase) return params.existingItems

  const existingRuleIds = new Set(params.existingItems.map((item) => item.checklist_rule_id))
  const toCreate = params.rules.filter((rule) => {
    if (existingRuleIds.has(rule.id)) return false
    return evaluateRuleCondition(rule.condition_expression as RuleCondition | null, params.answerByQuestionKey)
  })

  if (toCreate.length === 0) return params.existingItems

  const { data, error } = await supabase
    .from('checklist_items')
    .insert(toCreate.map((rule) => ({ journey_id: params.journeyId, checklist_rule_id: rule.id })))
    .select()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate checklist items', error)
    return params.existingItems
  }

  return [...params.existingItems, ...(data ?? [])]
}

export async function linkDocumentToChecklistItem(itemId: string, documentId: string, journeyId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('checklist_items').update({ document_id: documentId, status: 'uploaded' }).eq('id', itemId)
  await logAuditEvent({
    eventType: 'checklist_rule_applied',
    journeyId,
    targetTable: 'checklist_items',
    targetId: itemId,
  })
}

export async function updateChecklistItemNotes(itemId: string, clientNotes: string): Promise<void> {
  if (!supabase) return
  await supabase.from('checklist_items').update({ client_notes: clientNotes }).eq('id', itemId)
}
