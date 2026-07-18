import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

export type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']

export async function getJourneyTypeById(journeyTypeId: string) {
  if (!supabase) return null
  const { data } = await supabase
    .from('immigration_journey_types')
    .select('*')
    .eq('id', journeyTypeId)
    .maybeSingle()
  return data
}

export async function getLatestReviewRequestStatus(journeyId: string): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('review_requests')
    .select('status')
    .eq('journey_id', journeyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.status ?? null
}

export async function getRecentAuditLogs(userId: string, limit = 5): Promise<AuditLogRow[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('actor_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
