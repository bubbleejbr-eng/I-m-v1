import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'
import { logAuditEvent } from '../audit/logAuditEvent'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type ConsentRow = Database['public']['Tables']['consents']['Row']
export type JourneyTypeRow = Database['public']['Tables']['immigration_journey_types']['Row']
export type JourneyRow = Database['public']['Tables']['immigration_journeys']['Row']
export type RiskRuleRow = Database['public']['Tables']['risk_rules']['Row']

export async function getMyProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data
}

export async function upsertProfile(userId: string, fields: Partial<ProfileRow>): Promise<void> {
  if (!supabase) return
  await supabase.from('profiles').update(fields).eq('id', userId)
  await logAuditEvent({ eventType: 'profile_updated', targetTable: 'profiles', targetId: userId })
}

export async function getMyConsents(userId: string): Promise<Map<string, ConsentRow>> {
  const map = new Map<string, ConsentRow>()
  if (!supabase) return map
  const { data } = await supabase.from('consents').select('*').eq('user_id', userId)
  for (const consent of data ?? []) {
    // Keep only the most recent row per type.
    const existing = map.get(consent.consent_type)
    if (!existing || existing.created_at < consent.created_at) {
      map.set(consent.consent_type, consent)
    }
  }
  return map
}

export async function recordConsent(userId: string, consentType: string, accepted: boolean): Promise<void> {
  if (!supabase) return
  await supabase.from('consents').insert({
    user_id: userId,
    consent_type: consentType,
    accepted,
    accepted_at: accepted ? new Date().toISOString() : null,
  })
  await logAuditEvent({ eventType: 'consent_accepted', targetTable: 'consents', description: consentType })
}

export async function getJourneyTypes(): Promise<JourneyTypeRow[]> {
  if (!supabase) return []
  const { data } = await supabase.from('immigration_journey_types').select('*').order('sort_order')
  return data ?? []
}

export async function getMyActiveJourney(userId: string): Promise<JourneyRow | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('immigration_journeys')
    .select('*')
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

/** Creates a journey pinned to the journey type's currently published workflow version. */
export async function createJourney(userId: string, journeyTypeId: string): Promise<JourneyRow | null> {
  if (!supabase) return null

  const { data: workflowVersion } = await supabase
    .from('immigration_workflow_versions')
    .select('id')
    .eq('journey_type_id', journeyTypeId)
    .eq('status', 'published')
    .maybeSingle()

  const { data, error } = await supabase
    .from('immigration_journeys')
    .insert({
      client_id: userId,
      journey_type_id: journeyTypeId,
      workflow_version_id: workflowVersion?.id ?? null,
    })
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create journey', error)
    return null
  }

  await logAuditEvent({ eventType: 'journey_created', journeyId: data.id, targetTable: 'immigration_journeys' })
  return data
}

export async function getRiskRulesForWorkflow(workflowVersionId: string): Promise<RiskRuleRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('risk_rules')
    .select('*')
    .eq('workflow_version_id', workflowVersionId)
    .eq('approval_status', 'published')
  return data ?? []
}

/**
 * Records the onboarding urgency/safety screening result: marks the
 * journey urgent if any urgent-category item was checked, inserts one
 * risk_flags row per checked item, and stamps
 * urgency_screening_completed_at so the wizard doesn't re-ask.
 */
export async function submitUrgencyScreening(params: {
  journeyId: string
  checkedRuleKeys: string[]
  riskRules: RiskRuleRow[]
  isAnyUrgent: boolean
}): Promise<void> {
  if (!supabase) return

  const rows = params.checkedRuleKeys
    .map((ruleKey) => {
      const rule = params.riskRules.find((r) => r.rule_key === ruleKey)
      if (!rule) return null
      return {
        journey_id: params.journeyId,
        risk_rule_id: rule.id,
        triggering_explanation: rule.explanation_template,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (rows.length > 0) {
    await supabase.from('risk_flags').insert(rows)
  }

  await supabase
    .from('immigration_journeys')
    .update({
      is_urgent: params.isAnyUrgent,
      urgency_screening_completed_at: new Date().toISOString(),
    })
    .eq('id', params.journeyId)

  await logAuditEvent({
    eventType: 'flag_created',
    journeyId: params.journeyId,
    targetTable: 'risk_flags',
    description: `Onboarding urgency screening: ${rows.length} item(s) flagged`,
  })
}

export async function requestUrgentReview(journeyId: string): Promise<void> {
  if (!supabase) return

  const { data: product } = await supabase
    .from('review_products')
    .select('id')
    .eq('product_key', 'urgent_review')
    .maybeSingle()

  if (!product) return

  await supabase.from('review_requests').insert({
    journey_id: journeyId,
    review_product_id: product.id,
    status: 'submitted',
    description: 'Urgent review requested during onboarding safety screening.',
  })

  await logAuditEvent({ eventType: 'review_requested', journeyId, targetTable: 'review_requests' })
}
