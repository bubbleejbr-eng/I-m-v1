import { supabase } from '../supabase/client'

/**
 * Thin wrapper around the log_audit_event() RPC (see
 * supabase/migrations/0016_audit_and_security.sql). Never pass full
 * document contents, SSNs, passport numbers, or full answer text in
 * `description` — only a short, non-sensitive summary.
 */
export async function logAuditEvent(params: {
  eventType: string
  journeyId?: string
  targetTable?: string
  targetId?: string
  description?: string
}) {
  if (!supabase) return

  await supabase.rpc('log_audit_event', {
    p_event_type: params.eventType,
    p_journey_id: params.journeyId ?? null,
    p_target_table: params.targetTable ?? null,
    p_target_id: params.targetId ?? null,
    p_description: params.description ?? null,
  })
}
