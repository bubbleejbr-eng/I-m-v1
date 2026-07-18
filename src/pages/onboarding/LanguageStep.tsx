import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { upsertProfile } from '../../lib/onboarding/onboardingApi'
import { supportedLanguages } from '../../i18n'
import { Button } from '../../ui'

const labels: Record<string, string> = { en: 'English', es: 'Español' }

export function LanguageStep() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  async function choose(language: string) {
    await i18n.changeLanguage(language)
    if (user) {
      await upsertProfile(user.id, { preferred_language: language })
    }
    navigate('/onboarding/profile')
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-semibold text-navy">{t('onboarding.stepLanguageTitle')}</h1>
      <p className="mt-2 text-navy/60">{t('onboarding.stepLanguageSubtitle')}</p>

      <div className="mt-8 flex flex-col gap-3">
        {supportedLanguages.map((lng) => (
          <Button
            key={lng}
            variant={i18n.language === lng ? 'primary' : 'outline'}
            size="lg"
            onClick={() => void choose(lng)}
          >
            {labels[lng]}
          </Button>
        ))}
      </div>
    </div>
  )
}
