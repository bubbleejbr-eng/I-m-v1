import type { AppRole } from '../types/roles'

export interface AppNavLink {
  label: string
  path: string
}

/** Data-driven nav per role so AppShell doesn't hardcode per-role branching logic beyond a lookup. */
export const appNavByRole: Record<AppRole, AppNavLink[]> = {
  client: [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Questionnaire', path: '/app/questionnaire' },
    { label: 'Timeline', path: '/app/timeline' },
    { label: 'Documents', path: '/app/documents' },
    { label: 'Checklist', path: '/app/checklist' },
    { label: 'Privacy & Security', path: '/app/dashboard' },
  ],
  reviewer: [{ label: 'Assigned Matters', path: '/app/reviewer' }],
  attorney: [{ label: 'Attorney Workspace', path: '/app/attorney' }],
  nonprofit_case_manager: [{ label: 'Nonprofit Workspace', path: '/app/nonprofit' }],
  org_admin: [{ label: 'Organization', path: '/app/org-admin' }],
  platform_admin: [{ label: 'Administration', path: '/app/admin' }],
}
