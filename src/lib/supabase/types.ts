/**
 * Hand-maintained subset of the generated Supabase types, covering only
 * the tables referenced by frontend code so far. Once the schema
 * stabilizes, replace this file with `supabase gen types typescript`.
 */
import type { AppRole } from '../../types/roles'

/** Reduces the Row/Insert/Update/Relationships boilerplate PostgREST's types expect. */
type Table<Row, RequiredInsertKeys extends keyof Row> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>
  Update: Partial<Row>
  Relationships: []
}

export type ConditionOperator = 'equals' | 'not_equals' | 'includes' | 'is_answered'
export type QuestionInputType = 'text' | 'textarea' | 'date' | 'select' | 'multiselect' | 'boolean' | 'file' | 'not_sure'
export type AnswerSource = 'user_entered' | 'ai_extracted_unconfirmed' | 'ai_extracted_confirmed'
export type RiskFlagCategory = 'informational' | 'consistency' | 'professional_review_recommended' | 'urgent'
export type RiskFlagStatus = 'open' | 'resolved' | 'overridden'
export type JourneyStatus = 'in_progress' | 'ready_for_review' | 'in_review' | 'completed' | 'withdrawn'
export type ReviewRequestStatus =
  | 'draft' | 'payment_pending' | 'submitted' | 'intake_review' | 'awaiting_assignment'
  | 'assigned' | 'under_review' | 'clarification_requested' | 'client_responded'
  | 'review_completed' | 'consultation_scheduled' | 'engagement_offered'
  | 'engagement_accepted' | 'closed' | 'declined' | 'refunded'

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string
          first_name: string
          middle_name: string | null
          last_name: string
          email: string
          mobile_phone: string | null
          country_of_birth: string | null
          country_of_residence: string | null
          us_state: string | null
          preferred_language: string
          preferred_communication_method: string | null
          time_zone: string | null
          marketing_consent: boolean
          created_at: string
          updated_at: string
        },
        'id'
      >
      user_roles: Table<
        { id: string; user_id: string; role: AppRole; organization_id: string | null; created_at: string },
        'user_id' | 'role'
      >
      consents: Table<
        {
          id: string
          user_id: string
          consent_type: string
          accepted: boolean
          accepted_at: string | null
          withdrawn_at: string | null
          created_at: string
        },
        'user_id' | 'consent_type' | 'accepted'
      >
      immigration_journey_types: Table<
        {
          id: string
          slug: string
          situation_label: string
          description: string
          agency: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        },
        never
      >
      immigration_workflow_versions: Table<
        {
          id: string
          journey_type_id: string
          government_form_id: string | null
          version_label: string
          jurisdiction: string | null
          form_edition_date: string | null
          effective_date: string | null
          retirement_date: string | null
          status: 'draft' | 'legal_review' | 'approved' | 'published' | 'retired'
          created_at: string
          updated_at: string
        },
        never
      >
      immigration_journeys: Table<
        {
          id: string
          client_id: string
          journey_type_id: string
          workflow_version_id: string | null
          organization_id: string | null
          status: JourneyStatus
          preparation_percent: number
          is_urgent: boolean
          urgency_screening_completed_at: string | null
          created_at: string
          updated_at: string
        },
        'client_id' | 'journey_type_id'
      >
      questionnaire_sections: Table<
        { id: string; workflow_version_id: string; section_key: string; title: string; sort_order: number },
        never
      >
      questions: Table<
        {
          id: string
          section_id: string
          question_key: string
          prompt_text: string
          plain_language_explanation: string | null
          input_type: QuestionInputType
          allow_not_sure: boolean
          sort_order: number
        },
        never
      >
      question_options: Table<
        { id: string; question_id: string; option_value: string; option_label: string; sort_order: number },
        never
      >
      conditional_rules: Table<
        {
          id: string
          question_id: string
          depends_on_question_id: string
          condition_operator: ConditionOperator
          condition_value: string | null
        },
        never
      >
      user_answers: Table<
        {
          id: string
          journey_id: string
          question_id: string
          raw_user_text: string | null
          normalized_value: unknown
          is_not_sure: boolean
          source: AnswerSource
          confirmed_at: string | null
          created_at: string
          updated_at: string
        },
        'journey_id' | 'question_id'
      >
      risk_rules: Table<
        {
          id: string
          workflow_version_id: string
          rule_key: string
          flag_category: RiskFlagCategory
          flag_label: string
          explanation_template: string
          approval_status: string
        },
        never
      >
      risk_flags: Table<
        {
          id: string
          journey_id: string
          risk_rule_id: string
          triggering_explanation: string
          status: RiskFlagStatus
          created_at: string
          updated_at: string
        },
        'journey_id' | 'risk_rule_id' | 'triggering_explanation'
      >
      review_products: Table<
        {
          id: string
          product_key: string
          product_name: string
          description: string | null
          sample_price_cents: number
          is_sample_pricing: boolean
          is_active: boolean
        },
        never
      >
      review_requests: Table<
        {
          id: string
          journey_id: string
          review_product_id: string
          status: ReviewRequestStatus
          government_form_id: string | null
          filing_deadline: string | null
          preferred_language: string | null
          current_jurisdiction: string | null
          description: string | null
          questions_for_reviewer: string | null
          shares_case_materials: boolean
          created_at: string
          updated_at: string
        },
        'journey_id' | 'review_product_id'
      >
      audit_logs: Table<
        {
          id: string
          actor_id: string | null
          actor_role: AppRole | null
          event_type: string
          journey_id: string | null
          target_table: string | null
          target_id: string | null
          description: string | null
          created_at: string
        },
        'event_type'
      >
    }
    Views: Record<string, never>
    Functions: {
      log_audit_event: {
        Args: {
          p_event_type: string
          p_journey_id?: string | null
          p_target_table?: string | null
          p_target_id?: string | null
          p_description?: string | null
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
