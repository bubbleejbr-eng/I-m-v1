import { useEffect, useState } from 'react'
import { employmentsApi, schoolsApi, type EmploymentRow, type SchoolRow } from '../../lib/timelines/timelineApi'
import { detectGaps } from '../../lib/timelines/gapDetection'
import { Card, Button, Alert } from '../../ui'

export function EmploymentSection({
  journeyId,
  onGapDetected,
}: {
  journeyId: string
  onGapDetected: (hasGap: boolean) => void
}) {
  const [employments, setEmployments] = useState<EmploymentRow[]>([])
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(true)

  const [employerName, setEmployerName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [employmentStart, setEmploymentStart] = useState('')
  const [employmentEnd, setEmploymentEnd] = useState('')

  const [schoolName, setSchoolName] = useState('')
  const [schoolStart, setSchoolStart] = useState('')
  const [schoolEnd, setSchoolEnd] = useState('')

  async function refresh() {
    const [e, s] = await Promise.all([employmentsApi.list(journeyId), schoolsApi.list(journeyId)])
    setEmployments(e)
    setSchools(s)
  }

  useEffect(() => {
    void refresh().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId])

  const combinedRanges = [
    ...employments.map((e) => ({ id: e.id, start: e.start_date, end: e.end_date })),
    ...schools.map((s) => ({ id: s.id, start: s.start_date, end: s.end_date })),
  ]
  const gaps = detectGaps(combinedRanges, 30)

  useEffect(() => {
    onGapDetected(gaps.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaps.length])

  async function handleAddEmployment() {
    if (!employerName || !employmentStart) return
    await employmentsApi.create({
      journey_id: journeyId,
      employer_name: employerName,
      occupation,
      start_date: employmentStart,
      end_date: employmentEnd || null,
      is_current: !employmentEnd,
    })
    setEmployerName('')
    setOccupation('')
    setEmploymentStart('')
    setEmploymentEnd('')
    await refresh()
  }

  async function handleAddSchool() {
    if (!schoolName || !schoolStart) return
    await schoolsApi.create({
      journey_id: journeyId,
      school_name: schoolName,
      start_date: schoolStart,
      end_date: schoolEnd || null,
    })
    setSchoolName('')
    setSchoolStart('')
    setSchoolEnd('')
    await refresh()
  }

  if (loading) return <p className="text-navy/60">Loading employment and school history…</p>

  return (
    <div className="space-y-4">
      {gaps.length > 0 && (
        <Alert tone="warning" title="Possible employment or school history gap">
          We found a gap of more than 30 days between two of your jobs or schools. Please review your entries
          below or add the missing period.
        </Alert>
      )}

      <Card>
        <h3 className="font-semibold text-navy">Add Employment</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Employer name"
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            placeholder="Occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={employmentStart}
            onChange={(e) => setEmploymentStart(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={employmentEnd}
            onChange={(e) => setEmploymentEnd(e.target.value)}
            placeholder="End date (blank if current)"
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAddEmployment()}>
          Add Employment
        </Button>
      </Card>

      <div className="space-y-2">
        {employments.map((e) => (
          <div key={e.id} className="rounded-xl border border-navy/10 bg-white p-3">
            <p className="text-sm font-medium text-navy">
              {e.employer_name} — {e.occupation}
            </p>
            <p className="text-xs text-navy/50">
              {e.start_date} – {e.end_date ?? 'Present'}
            </p>
          </div>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-navy">Add School</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="School name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={schoolStart}
            onChange={(e) => setSchoolStart(e.target.value)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
          <input
            type="date"
            value={schoolEnd}
            onChange={(e) => setSchoolEnd(e.target.value)}
            placeholder="End date"
            className="rounded-lg border border-navy/20 px-3 py-2 text-navy"
          />
        </div>
        <Button size="sm" className="mt-3" onClick={() => void handleAddSchool()}>
          Add School
        </Button>
      </Card>

      <div className="space-y-2">
        {schools.map((s) => (
          <div key={s.id} className="rounded-xl border border-navy/10 bg-white p-3">
            <p className="text-sm font-medium text-navy">{s.school_name}</p>
            <p className="text-xs text-navy/50">
              {s.start_date} – {s.end_date ?? 'Present'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
