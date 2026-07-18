/**
 * Platform role model. Mirrors the `user_roles.role` check constraint
 * in the database migrations — keep these in sync.
 */
export type AppRole =
  | 'client'
  | 'reviewer'
  | 'attorney'
  | 'nonprofit_case_manager'
  | 'org_admin'
  | 'platform_admin'

export const APP_ROLES: AppRole[] = [
  'client',
  'reviewer',
  'attorney',
  'nonprofit_case_manager',
  'org_admin',
  'platform_admin',
]

/** Roles with a fully implemented dashboard in the MVP. */
export const FULLY_IMPLEMENTED_ROLES: AppRole[] = ['client', 'reviewer', 'platform_admin']
