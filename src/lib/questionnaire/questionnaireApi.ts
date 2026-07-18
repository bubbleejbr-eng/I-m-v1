import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

export type SectionRow = Database['public']['Tables']['questionnaire_sections']['Row']
export type QuestionRow = Database['public']['Tables']['questions']['Row']
export type QuestionOptionRow = Database['public']['Tables']['question_options']['Row']
export type ConditionalRuleRow = Database['public']['Tables']['conditional_rules']['Row']
export type UserAnswerRow = Database['public']['Tables']['user_answers']['Row']

export interface WorkflowContent {
  sections: SectionRow[]
  questions: QuestionRow[]
  optionsByQuestionId: Map<string, QuestionOptionRow[]>
  rulesByQuestionId: Map<string, ConditionalRuleRow[]>
}

/** Loads every section/question/option/conditional-rule for one published workflow version. */
export async function fetchWorkflowContent(workflowVersionId: string): Promise<WorkflowContent> {
  if (!supabase) {
    return { sections: [], questions: [], optionsByQuestionId: new Map(), rulesByQuestionId: new Map() }
  }

  const { data: sections } = await supabase
    .from('questionnaire_sections')
    .select('*')
    .eq('workflow_version_id', workflowVersionId)
    .order('sort_order')

  const sectionIds = (sections ?? []).map((s) => s.id)

  const { data: questions } = sectionIds.length
    ? await supabase.from('questions').select('*').in('section_id', sectionIds).order('sort_order')
    : { data: [] as QuestionRow[] }

  const questionIds = (questions ?? []).map((q) => q.id)

  const [{ data: options }, { data: rules }] = questionIds.length
    ? await Promise.all([
        supabase.from('question_options').select('*').in('question_id', questionIds).order('sort_order'),
        supabase.from('conditional_rules').select('*').in('question_id', questionIds),
      ])
    : [{ data: [] as QuestionOptionRow[] }, { data: [] as ConditionalRuleRow[] }]

  const optionsByQuestionId = new Map<string, QuestionOptionRow[]>()
  for (const option of options ?? []) {
    const list = optionsByQuestionId.get(option.question_id) ?? []
    list.push(option)
    optionsByQuestionId.set(option.question_id, list)
  }

  const rulesByQuestionId = new Map<string, ConditionalRuleRow[]>()
  for (const rule of rules ?? []) {
    const list = rulesByQuestionId.get(rule.question_id) ?? []
    list.push(rule)
    rulesByQuestionId.set(rule.question_id, list)
  }

  return { sections: sections ?? [], questions: questions ?? [], optionsByQuestionId, rulesByQuestionId }
}

export async function fetchAnswers(journeyId: string): Promise<Map<string, UserAnswerRow>> {
  const map = new Map<string, UserAnswerRow>()
  if (!supabase) return map

  const { data } = await supabase.from('user_answers').select('*').eq('journey_id', journeyId)
  for (const answer of data ?? []) {
    map.set(answer.question_id, answer)
  }
  return map
}

export async function saveAnswer(params: {
  journeyId: string
  questionId: string
  rawUserText: string | null
  normalizedValue: unknown
  isNotSure: boolean
}): Promise<UserAnswerRow | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_answers')
    .upsert(
      {
        journey_id: params.journeyId,
        question_id: params.questionId,
        raw_user_text: params.rawUserText,
        normalized_value: params.normalizedValue,
        is_not_sure: params.isNotSure,
        source: 'user_entered',
      },
      { onConflict: 'journey_id,question_id' },
    )
    .select()
    .single()

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save answer', error)
    return null
  }

  return data
}

export async function updateJourneyProgress(journeyId: string, preparationPercent: number): Promise<void> {
  if (!supabase) return
  await supabase
    .from('immigration_journeys')
    .update({ preparation_percent: Math.round(preparationPercent) })
    .eq('id', journeyId)
}
