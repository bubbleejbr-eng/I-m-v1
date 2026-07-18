import type { ReactNode } from 'react'
import clsx from 'clsx'

/**
 * Concise notice used at meaningful decision points (onboarding, footer,
 * checklist, AI drafts). Deliberately understated per the product
 * requirement to avoid overwhelming users with repeated long disclaimers.
 */
export function DisclaimerBanner({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'urgent'
  className?: string
}) {
  return (
    <div
      role="note"
      className={clsx(
        'rounded-xl border px-4 py-3 text-sm leading-relaxed',
        tone === 'urgent'
          ? 'border-brick/40 bg-brick/5 text-brick-light'
          : 'border-navy/15 bg-navy/5 text-navy/80',
        className,
      )}
    >
      {children}
    </div>
  )
}
