import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl border border-navy/10 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  )
}
