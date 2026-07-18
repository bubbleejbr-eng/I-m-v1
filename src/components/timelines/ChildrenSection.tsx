import { useEffect, useState } from 'react'
import { childrenApi, type ChildRow } from '../../lib/timelines/timelineApi'
import { Card, Button } from '../../ui'

export function ChildrenSection({ journeyId }: { journeyId: string }) {
  const [children, setChildren] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [countryOfResidence, setCountryOfResidence] = useState('')

  async function refresh() {
    setChildren(await childrenApi.list(journeyId))
  }

  useEffect(() => {
    void refresh().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  async function handleAdd() {
    if (!fullName) return
    await childrenApi.create({
      journey_id: journeyId,
      full_name: fullName,
      date_of_birth: dateOfBirth || null,
      current_country_of_residence: countryOfResidence,
    })
    setFullName('')
    setDateOfBirth('')
    setCountryOfResidence('')
    await refresh()
  }

  async function handleDelete(id: string) {
    await childrenApi.remove(id)
    await refresh()
  }

  if (loading) return <p className="text-navy/60">Loading children…</p>

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-navy">Add a Child</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            placeholder="Current country of residence"
            value={countryOfResidence}
            onChange={(e) => setCountryOfResidence(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAdd()}>
          Add Child
        </Button>
      </Card>

      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-navy">{child.full_name}</p>
              <p className="text-xs text-navy/50">
                {child.date_of_birth} · {child.current_country_of_residence}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void handleDelete(child.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
