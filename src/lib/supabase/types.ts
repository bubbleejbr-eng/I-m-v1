/**
 * Hand-maintained subset of the generated Supabase types, covering only
 * the tables referenced by frontend code in this phase. Once the schema
 * stabilizes, replace this file with `supabase gen types typescript`.
 */
import type { AppRole } from '../../types/roles'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AppRole
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['user_roles']['Row']> & {
          user_id: string
          role: AppRole
        }
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
        Relationships: []
      }
      consents: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          accepted: boolean
          accepted_at: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['consents']['Row']> & {
          user_id: string
          consent_type: string
          accepted: boolean
        }
        Update: Partial<Database['public']['Tables']['consents']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
