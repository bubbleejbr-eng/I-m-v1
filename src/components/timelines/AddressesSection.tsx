import { useEffect, useState } from 'react'
import { addressesApi, type AddressRow } from '../../lib/timelines/timelineApi'
import { detectGaps } from '../../lib/timelines/gapDetection'
import { Card, Button, Alert } from '../../ui'

export function AddressesSection({
  journeyId,
  onGapDetected,
}: {
  journeyId: string
  onGapDetected: (hasGap: boolean) => void
}) {
  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [street, setStreet] = useState('')
  const [cityStateZip, setCityStateZip] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function refresh() {
    setAddresses(await addressesApi.list(journeyId))
  }

  useEffect(() => {
    void refresh().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  const gaps = detectGaps(
    addresses.map((a) => ({ id: a.id, start: a.start_date, end: a.end_date })),
    30,
  )

  useEffect(() => {
    onGapDetected(gaps.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaps.length])

  async function handleAdd() {
    if (!street || !startDate) return
    await addressesApi.create({
      journey_id: journeyId,
      street_line1: street,
      city: cityStateZip,
      start_date: startDate,
      end_date: endDate || null,
      is_current: !endDate,
    })
    setStreet('')
    setCityStateZip('')
    setStartDate('')
    setEndDate('')
    await refresh()
  }

  async function handleDelete(id: string) {
    await addressesApi.remove(id)
    await refresh()
  }

  if (loading) return <p className="text-navy/60">Loading addresses…</p>

  return (
    <div className="space-y-4">
      {gaps.length > 0 && (
        <Alert tone="warning" title="Possible address history gap">
          We found a gap of more than 30 days between two of your addresses. Please review your entries below or
          add the missing period.
        </Alert>
      )}

      <Card>
        <h3 className="font-semibold text-navy">Add an Address</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Street address"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            placeholder="City, state, ZIP"
            value={cityStateZip}
            onChange={(e) => setCityStateZip(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <div>
            <label className="mb-1 block text-xs text-navy/50">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-navy"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-navy/50">End date (leave blank if current)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-navy"
            />
          </div>
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAdd()}>
          Add Address
        </Button>
      </Card>

      <div className="space-y-2">
        {addresses
          .slice()
          .sort((a, b) => (b.start_date ?? '').localeCompare(a.start_date ?? ''))
          .map((address) => (
            <div key={address.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-navy">
                  {address.street_line1}, {address.city}
                </p>
                <p className="text-xs text-navy/50">
                  {address.start_date} – {address.end_date ?? 'Present'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void handleDelete(address.id)}>
                Remove
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}
