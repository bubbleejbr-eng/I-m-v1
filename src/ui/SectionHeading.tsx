import type { ReactNode } from 'react'
import clsx from 'clsx'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={clsx('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brick">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-semibold text-navy sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-navy/70">{subtitle}</p>}
    </div>
  )
}
