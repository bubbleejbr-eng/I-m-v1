import { Card } from '../../ui'

const modules = [
  'Users',
  'Organizations',
  'U.S. Immigration Journeys',
  'USCIS Forms',
  'Workflow Versions',
  'Questionnaire Sections',
  'Evidence Rules',
  'Risk Flags & Escalation Rules',
  'Professional Reviewers',
  'Review Products & Pricing',
  'Translations',
  'Audit Logs',
  'Brand Configuration',
  'Platform Settings',
]

export function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Platform Administration</h1>
        <p className="mt-1 text-navy/60">
          All administrator access to client information is logged. Administrators cannot silently
          impersonate a client.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module}>
            <h2 className="text-sm font-semibold text-navy">{module}</h2>
            <p className="mt-2 text-xs text-navy/50">Module scaffold. Editing tools ship in later phases.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
