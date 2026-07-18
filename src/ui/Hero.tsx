import type { ReactNode } from 'react'
import { Container } from './Container'

export function Hero({
  eyebrow,
  title,
  subtitle,
  actions,
  trustLine,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  trustLine?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-ivory">
      {/* Subtle horizon/route motif, not a flag or seal */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-20"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 150 C 300 80, 900 220, 1200 120 L1200 200 L0 200 Z" fill="var(--color-gold)" />
      </svg>
      <Container className="relative py-20 sm:py-28">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
          )}
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-6 text-lg text-ivory/80 sm:text-xl">{subtitle}</p>}
          {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
          {trustLine && <p className="mt-6 text-sm text-ivory/60">{trustLine}</p>}
        </div>
      </Container>
    </section>
  )
}
