/**
 * Onboarding Step 5 (Urgency and Safety Screening) checklist. Each item
 * maps 1:1 to a seeded `risk_rules.rule_key` for the client's chosen
 * workflow version (see supabase/seed/naturalization_content_seed.sql).
 * `urgent: true` items drive the "may require prompt attention" notice
 * and the urgent-review action; the other two are recorded as
 * informational preferences only.
 */
export interface UrgencyScreeningItem {
  ruleKey: string
  labelKey: string
  urgent: boolean
}

export const urgencyScreeningItems: UrgencyScreeningItem[] = [
  { ruleKey: 'currently_detained', labelKey: 'onboarding.urgency.detained', urgent: true },
  { ruleKey: 'immigration_court_hearing', labelKey: 'onboarding.urgency.courtHearing', urgent: true },
  { ruleKey: 'deadline_within_30_days', labelKey: 'onboarding.urgency.deadline30Days', urgent: true },
  { ruleKey: 'received_rfe', labelKey: 'onboarding.urgency.receivedRfe', urgent: true },
  { ruleKey: 'received_noid', labelKey: 'onboarding.urgency.receivedNoid', urgent: true },
  { ruleKey: 'received_denial', labelKey: 'onboarding.urgency.receivedDenial', urgent: true },
  { ruleKey: 'received_nta', labelKey: 'onboarding.urgency.receivedNta', urgent: true },
  { ruleKey: 'prior_removal_order', labelKey: 'onboarding.urgency.priorRemovalOrder', urgent: true },
  { ruleKey: 'safety_concern', labelKey: 'onboarding.urgency.safetyConcern', urgent: true },
  { ruleKey: 'needs_interpreter', labelKey: 'onboarding.urgency.needsInterpreter', urgent: false },
  { ruleKey: 'needs_disability_accommodation', labelKey: 'onboarding.urgency.needsAccommodation', urgent: false },
]
