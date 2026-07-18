/**
 * Pure date-gap and date-overlap detection, kept dependency-free and
 * separately testable from the Supabase-backed timeline CRUD layer.
 */
export interface DateRange {
  id: string
  start: string | null
  end: string | null
}

export interface DetectedGap {
  beforeId: string
  afterId: string
  gapDays: number
}

export interface DetectedOverlap {
  aId: string
  bId: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(earlierIso: string, laterIso: string): number {
  const earlier = new Date(earlierIso).getTime()
  const later = new Date(laterIso).getTime()
  return Math.round((later - earlier) / (1000 * 60 * 60 * 24))
}

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd
}

/**
 * Flags a gap whenever consecutive (sorted by start date) ranges leave
 * more than `gapThresholdDays` uncovered between them. A range with no
 * end date is treated as ongoing (extends to today) — matching
 * `is_current` addresses/employments.
 */
export function detectGaps(ranges: DateRange[], gapThresholdDays = 30): DetectedGap[] {
  const withStart = ranges
    .filter((r): r is DateRange & { start: string } => Boolean(r.start))
    .sort((a, b) => a.start.localeCompare(b.start))

  const gaps: DetectedGap[] = []
  for (let i = 0; i < withStart.length - 1; i++) {
    const current = withStart[i]
    const next = withStart[i + 1]
    const currentEnd = current.end ?? todayIso()
    const gapDays = daysBetween(currentEnd, next.start)
    if (gapDays > gapThresholdDays) {
      gaps.push({ beforeId: current.id, afterId: next.id, gapDays })
    }
  }
  return gaps
}

/** Flags any two ranges (both with a start and end date) whose spans overlap. */
export function detectOverlaps(ranges: DateRange[]): DetectedOverlap[] {
  const withBothDates = ranges.filter((r): r is DateRange & { start: string; end: string } => Boolean(r.start && r.end))

  const overlaps: DetectedOverlap[] = []
  for (let i = 0; i < withBothDates.length; i++) {
    for (let j = i + 1; j < withBothDates.length; j++) {
      const a = withBothDates[i]
      const b = withBothDates[j]
      if (rangesOverlap(a.start, a.end, b.start, b.end)) {
        overlaps.push({ aId: a.id, bId: b.id })
      }
    }
  }
  return overlaps
}
