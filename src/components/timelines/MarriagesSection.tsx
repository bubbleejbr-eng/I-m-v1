import { useEffect, useState } from 'react'
import { marriagesApi, type MarriageRow } from '../../lib/timelines/timelineApi'
import { Card, Button } from '../../ui'

export function MarriagesSection({ journeyId }: { journeyId: string }) {
  const [marriages, setMarriages] = useState<MarriageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [spouseName, setSpouseName] = useState('')
  const [marriageDate, setMarriageDate] = useState('')
  const [marriageLocation, setMarriageLocation] = useState('')

  async function refresh() {
    setMarriages(await marriagesApi.list(journeyId))
  }

  useEffect(() => {
    void refresh().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  async function handleAdd() {
    if (!spouseName || !marriageDate) return
    await marriagesApi.create({
      journey_id: journeyId,
      spouse_full_name: spouseName,
      marriage_date: marriageDate,
      marriage_location: marriageLocation,
      is_current: true,
    })
    setSpouseName('')
    setMarriageDate('')
    setMarriageLocation('')
    await refresh()
  }

  async function handleDelete(id: string) {
    await marriagesApi.remove(id)
    await refresh()
  }

  if (loading) return <p className="text-navy/60">Loading marriages…</p>

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-navy">Add a Marriage</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            placeholder="Spouse's full name"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={marriageDate}
            onChange={(e) => setMarriageDate(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            placeholder="Marriage location"
            value={marriageLocation}
            onChange={(e) => setMarriageLocation(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAdd()}>
          Add Marriage
        </Button>
      </Card>

      <div className="space-y-2">
        {marriages.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-3">
            <div>
              <p className="text-sm font-medium text-navy">{m.spouse_full_name}</p>
              <p className="text-xs text-navy/50">
                {m.marriage_date} · {m.marriage_location}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void handleDelete(m.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
