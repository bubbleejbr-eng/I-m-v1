import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../i18n'
import clsx from 'clsx'

const labels: Record<string, string> = {
  en: 'English',
  es: 'Español',
}

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Language selection">
      {supportedLanguages.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void i18n.changeLanguage(lng)}
          aria-pressed={i18n.language === lng}
          className={clsx(
            'rounded-md px-2 py-1 text-sm font-medium transition-colors',
            i18n.language === lng
              ? 'bg-gold text-navy'
              : dark
                ? 'text-ivory/70 hover:text-ivory'
                : 'text-navy/60 hover:text-navy',
          )}
        >
          {labels[lng]}
        </button>
      ))}
    </div>
  )
}
