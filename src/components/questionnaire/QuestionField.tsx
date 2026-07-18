import { useTranslation } from 'react-i18next'
import type { QuestionRow, QuestionOptionRow, UserAnswerRow } from '../../lib/questionnaire/questionnaireApi'

export interface AnswerDraft {
  rawUserText: string | null
  normalizedValue: unknown
  isNotSure: boolean
}

export function draftFromAnswer(answer: UserAnswerRow | undefined): AnswerDraft {
  if (!answer) return { rawUserText: null, normalizedValue: null, isNotSure: false }
  return {
    rawUserText: answer.raw_user_text,
    normalizedValue: answer.normalized_value,
    isNotSure: answer.is_not_sure,
  }
}

export function QuestionField({
  question,
  options,
  draft,
  onChange,
  onCommit,
}: {
  question: QuestionRow
  options: QuestionOptionRow[]
  draft: AnswerDraft
  /** Updates local state immediately (every keystroke/selection). */
  onChange: (next: AnswerDraft) => void
  /** Persists to Supabase (call on blur / discrete selection, not every keystroke). */
  onCommit: (next: AnswerDraft) => void
}) {
  const { t } = useTranslation()

  function setNotSure(isNotSure: boolean) {
    const next: AnswerDraft = isNotSure
      ? { rawUserText: null, normalizedValue: null, isNotSure: true }
      : { rawUserText: null, normalizedValue: null, isNotSure: false }
    onChange(next)
    onCommit(next)
  }

  const disabled = draft.isNotSure

  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <label className="block text-base font-medium text-navy" htmlFor={question.id}>
        {question.prompt_text}
      </label>
      {question.plain_language_explanation && (
        <p className="mt-1 text-sm text-navy/60">{question.plain_language_explanation}</p>
      )}

      <div className="mt-3">
        {question.input_type === 'boolean' && (
          <div className="flex gap-3" role="group" aria-labelledby={question.id}>
            {[
              { value: true, label: t('questionnaire.yes') },
              { value: false, label: t('questionnaire.no') },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const next: AnswerDraft = { rawUserText: null, normalizedValue: opt.value, isNotSure: false }
                  onChange(next)
                  onCommit(next)
                }}
                className={`rounded-lg border-2 px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  draft.normalizedValue === opt.value
                    ? 'border-navy bg-navy text-ivory'
                    : 'border-navy/20 text-navy hover:border-navy/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {question.input_type === 'select' && (
          <select
            id={question.id}
            disabled={disabled}
            value={typeof draft.normalizedValue === 'string' ? draft.normalizedValue : ''}
            onChange={(e) => {
              const next: AnswerDraft = { rawUserText: null, normalizedValue: e.target.value, isNotSure: false }
              onChange(next)
              onCommit(next)
            }}
            className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent disabled:opacity-40"
          >
            <option value="">{t('questionnaire.choosePlaceholder')}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.option_value}>
                {opt.option_label}
              </option>
            ))}
          </select>
        )}

        {question.input_type === 'multiselect' && (
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = Array.isArray(draft.normalizedValue) && draft.normalizedValue.includes(opt.option_value)
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const current = Array.isArray(draft.normalizedValue) ? draft.normalizedValue : []
                    const nextValue = selected
                      ? current.filter((v) => v !== opt.option_value)
                      : [...current, opt.option_value]
                    const next: AnswerDraft = { rawUserText: null, normalizedValue: nextValue, isNotSure: false }
                    onChange(next)
                    onCommit(next)
                  }}
                  className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                    selected ? 'border-navy bg-navy text-ivory' : 'border-navy/20 text-navy hover:border-navy/40'
                  }`}
                >
                  {opt.option_label}
                </button>
              )
            })}
          </div>
        )}

        {question.input_type === 'date' && (
          <input
            id={question.id}
            type="date"
            disabled={disabled}
            value={typeof draft.normalizedValue === 'string' ? draft.normalizedValue : ''}
            onChange={(e) => onChange({ rawUserText: null, normalizedValue: e.target.value, isNotSure: false })}
            onBlur={() => onCommit(draft)}
            className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent disabled:opacity-40"
          />
        )}

        {question.input_type === 'textarea' && (
          <textarea
            id={question.id}
            disabled={disabled}
            rows={4}
            value={draft.rawUserText ?? ''}
            onChange={(e) =>
              onChange({ rawUserText: e.target.value, normalizedValue: e.target.value.trim(), isNotSure: false })
            }
            onBlur={() => onCommit(draft)}
            className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent disabled:opacity-40"
          />
        )}

        {question.input_type === 'file' && (
          <p className="rounded-lg bg-navy/5 px-3 py-2.5 text-sm text-navy/60">
            Document upload is available in your secure document workspace (coming in a later update).
          </p>
        )}

        {(question.input_type === 'text' || question.input_type === 'not_sure') && (
          <input
            id={question.id}
            type="text"
            disabled={disabled}
            value={draft.rawUserText ?? ''}
            onChange={(e) =>
              onChange({ rawUserText: e.target.value, normalizedValue: e.target.value.trim(), isNotSure: false })
            }
            onBlur={() => onCommit(draft)}
            className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent disabled:opacity-40"
          />
        )}
      </div>

      {question.allow_not_sure && (
        <label className="mt-3 flex items-center gap-2 text-sm text-navy/60">
          <input
            type="checkbox"
            checked={draft.isNotSure}
            onChange={(e) => setNotSure(e.target.checked)}
            className="h-4 w-4 rounded border-navy/30"
          />
          {t('questionnaire.notSure')}
        </label>
      )}
    </div>
  )
}
