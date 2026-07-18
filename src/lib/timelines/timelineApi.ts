import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

type TimelineTable = 'addresses' | 'employments' | 'schools' | 'trips' | 'marriages' | 'children'

/**
 * supabase-js's `.from()` typing resolves Row/Insert/Update through
 * deeply conditional types keyed on a literal table-name argument;
 * that inference doesn't survive being routed through a generic type
 * parameter (a known PostgREST-js limitation, not specific to our
 * schema). `table` is still constrained to `TimelineTable` at every
 * call site below, and every exported function keeps a precise,
 * table-specific signature via the Row/Insert/Update generics — the
 * `any` is confined to the query-builder call itself.
 */
function makeCrud<K extends TimelineTable>(table: K) {
  type Row = Database['public']['Tables'][K]['Row']
  type Insert = Database['public']['Tables'][K]['Insert']
  type Update = Database['public']['Tables'][K]['Update']

  return {
    list: async (journeyId: string): Promise<Row[]> => {
      if (!supabase) return []
      const query = supabase.from(table) as ReturnType<typeof supabase.from>
      const { data } = await query.select('*').eq('journey_id', journeyId)
      return (data ?? []) as unknown as Row[]
    },
    create: async (values: Insert): Promise<Row | null> => {
      if (!supabase) return null
      const query = supabase.from(table) as ReturnType<typeof supabase.from>
      const { data, error } = await query.insert(values).select().single()
      if (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to create ${table} row`, error)
        return null
      }
      return data as unknown as Row
    },
    update: async (id: string, values: Update): Promise<void> => {
      if (!supabase) return
      const query = supabase.from(table) as ReturnType<typeof supabase.from>
      await query.update(values).eq('id', id)
    },
    remove: async (id: string): Promise<void> => {
      if (!supabase) return
      const query = supabase.from(table) as ReturnType<typeof supabase.from>
      await query.delete().eq('id', id)
    },
  }
}

export const addressesApi = makeCrud('addresses')
export const employmentsApi = makeCrud('employments')
export const schoolsApi = makeCrud('schools')
export const tripsApi = makeCrud('trips')
export const marriagesApi = makeCrud('marriages')
export const childrenApi = makeCrud('children')

export type AddressRow = Database['public']['Tables']['addresses']['Row']
export type EmploymentRow = Database['public']['Tables']['employments']['Row']
export type SchoolRow = Database['public']['Tables']['schools']['Row']
export type TripRow = Database['public']['Tables']['trips']['Row']
export type MarriageRow = Database['public']['Tables']['marriages']['Row']
export type ChildRow = Database['public']['Tables']['children']['Row']
