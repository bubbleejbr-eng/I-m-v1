import { useEffect, useState } from 'react'
import { tripsApi, type TripRow } from '../../lib/timelines/timelineApi'
import { detectOverlaps } from '../../lib/timelines/gapDetection'
import { Card, Button, Alert } from '../../ui'

export function TripsSection({
  journeyId,
  onOverlapDetected,
}: {
  journeyId: string
  onOverlapDetected: (hasOverlap: boolean) => void
}) {
  const [trips, setTrips] = useState<TripRow[]>([])
  const [loading, setLoading] = useState(true)
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  async function refresh() {
    setTrips(await tripsApi.list(journeyId))
  }

  useEffect(() => {
    void refresh().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  const overlaps = detectOverlaps(trips.map((t) => ({ id: t.id, start: t.departure_date, end: t.return_date })))

  useEffect(() => {
    onOverlapDetected(overlaps.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlaps.length])

  async function handleAdd() {
    if (!departureDate || !returnDate) return
    await tripsApi.create({
      journey_id: journeyId,
      destination_country: destination,
      departure_date: departureDate,
      return_date: returnDate,
    })
    setDestination('')
    setDepartureDate('')
    setReturnDate('')
    await refresh()
  }

  async function handleDelete(id: string) {
    await tripsApi.remove(id)
    await refresh()
  }

  if (loading) return <p className="text-navy/60">Loading trips…</p>

  const overlappingIds = new Set(overlaps.flatMap((o) => [o.aId, o.bId]))

  return (
    <div className="space-y-4">
      {overlaps.length > 0 && (
        <Alert tone="warning" title="Overlapping travel dates">
          Two of your trips appear to overlap. Please review the dates highlighted below.
        </Alert>
      )}

      <Card>
        <h3 className="font-semibold text-navy">Add a Trip</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input
            placeholder="Destination country"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <div>
            <label className="mb-1 block text-xs text-navy/50">Departure date</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-navy"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-navy/50">Return date</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-navy"
            />
          </div>
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAdd()}>
          Add Trip
        </Button>
      </Card>

      <div className="space-y-2">
        {trips
          .slice()
          .sort((a, b) => (b.departure_date ?? '').localeCompare(a.departure_date ?? ''))
          .map((trip) => (
            <div
              key={trip.id}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                overlappingIds.has(trip.id) ? 'border-brick/40 bg-brick/5' : 'border-navy/10 bg-white'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-navy">{trip.destination_country}</p>
                <p className="text-xs text-navy/50">
                  {trip.departure_date} – {trip.return_date}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void handleDelete(trip.id)}>
                Remove
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}
