import { Card, Badge } from '../../ui'

export function ReviewerDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Reviewer Workspace</h1>
        <p className="mt-1 text-navy/60">
          You can only see matters that have been explicitly assigned to you.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Assigned Matters</h2>
          <Badge tone="neutral">0 assigned</Badge>
        </div>
        <p className="mt-2 text-sm text-navy/60">
          No matters are currently assigned to you. Assignment and completeness-review tools ship in Phase 4.
        </p>
      </Card>
    </div>
  )
}
