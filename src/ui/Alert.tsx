import type { ReactNode } from 'react'
import clsx from 'clsx'

type AlertTone = 'info' | 'warning' | 'urgent' | 'success'

const toneClasses: Record<AlertTone, string> = {
  info: 'border-blue-accent/30 bg-blue-accent/5 text-navy',
  warning: 'border-gold/50 bg-gold-light/20 text-navy',
  urgent: 'border-brick/40 bg-brick/5 text-brick-light',
  success: 'border-green-300 bg-green-50 text-green-900',
}

/**
 * Used for risk/escalation flags. Always renders an icon + text together
 * so meaning never depends on color alone (WCAG).
 */
export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: AlertTone
  title: string
  children?: ReactNode
}) {
  return (
    <div role="alert" className={clsx('flex gap-3 rounded-xl border px-4 py-3', toneClasses[tone])}>
      <span aria-hidden="true" className="mt-0.5 text-lg leading-none">
        {tone === 'urgent' ? '⚠' : tone === 'success' ? '✓' : tone === 'warning' ? '!' : 'ⓘ'}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="mt-1 text-sm opacity-90">{children}</p>}
      </div>
    </div>
  )
}
