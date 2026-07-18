import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import type { SectionRow } from '../../lib/questionnaire/questionnaireApi'

export function SectionSidebar({
  sections,
  currentSectionId,
  completion,
  onSelect,
}: {
  sections: SectionRow[]
  currentSectionId: string | null
  completion: Map<string, { answered: number; total: number }>
  onSelect: (sectionId: string) => void
}) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('questionnaire.sectionsTitle') ?? 'Sections'} className="space-y-1">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">
        {t('questionnaire.sectionsTitle')}
      </h2>
      {sections.map((section, index) => {
        const stats = completion.get(section.id) ?? { answered: 0, total: 0 }
        const isComplete = stats.total > 0 && stats.answered >= stats.total
        const isCurrent = section.id === currentSectionId
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={clsx(
              'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              isCurrent ? 'bg-navy text-ivory' : 'text-navy/80 hover:bg-navy/5',
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={clsx(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                  isComplete ? 'bg-gold text-navy' : isCurrent ? 'bg-ivory/20 text-ivory' : 'bg-navy/10 text-navy/50',
                )}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              {section.title}
            </span>
            {stats.total > 0 && (
              <span className={clsx('text-xs', isCurrent ? 'text-ivory/70' : 'text-navy/40')}>
                {stats.answered}/{stats.total}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
