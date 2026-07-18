export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-sm font-medium text-navy/70">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className="h-3 w-full overflow-hidden rounded-full bg-navy/10"
      >
        <div
          className="h-full rounded-full bg-gold transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
