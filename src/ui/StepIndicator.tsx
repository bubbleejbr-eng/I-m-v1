import clsx from 'clsx'

export function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-3" aria-label="Progress steps">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isComplete = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                isComplete && 'bg-gold text-navy',
                isCurrent && 'bg-navy text-ivory',
                !isComplete && !isCurrent && 'bg-navy/10 text-navy/50',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {stepNumber}
            </span>
            <span className={clsx('text-sm font-medium', isCurrent ? 'text-navy' : 'text-navy/60')}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
