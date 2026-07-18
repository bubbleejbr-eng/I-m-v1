import { Card, Badge } from '../../ui'

export function RolePlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <Badge tone="neutral">Protected Placeholder</Badge>
        <h1 className="mt-3 text-2xl font-semibold text-navy">{title}</h1>
        <p className="mt-2 text-navy/70">{description}</p>
      </Card>
    </div>
  )
}
