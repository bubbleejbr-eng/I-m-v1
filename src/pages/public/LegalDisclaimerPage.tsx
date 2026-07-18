import { useTranslation } from 'react-i18next'
import { Container, SectionHeading } from '../../ui'

export function LegalDisclaimerPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('legalDisclaimer.title')} />
      <div className="mt-8 max-w-2xl space-y-4 text-navy/80">
        <p>{t('legalDisclaimer.body1')}</p>
        <p>{t('legalDisclaimer.body2')}</p>
      </div>
    </Container>
  )
}
