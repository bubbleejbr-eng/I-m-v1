import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * Only the public anon key is ever used in frontend code. It is safe to
 * expose because every table is protected by Row-Level Security policies
 * (see supabase/migrations). Service-role keys, AI provider keys, and
 * payment secrets must only ever live in Supabase Edge Functions or other
 * server-side environments, never here.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
