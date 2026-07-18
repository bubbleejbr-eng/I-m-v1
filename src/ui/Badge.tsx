import type { ReactNode } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'gold' | 'brick' | 'navy' | 'success'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  gold: 'bg-gold-light/40 text-navy',
  brick: 'bg-brick/10 text-brick',
  navy: 'bg-navy text-ivory',
  success: 'bg-green-100 text-green-800',
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
