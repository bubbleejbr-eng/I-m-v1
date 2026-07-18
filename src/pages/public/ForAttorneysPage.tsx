import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button } from '../../ui'

export function ForAttorneysPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('forAttorneys.title')} subtitle={t('forAttorneys.subtitle')} />
      <p className="mt-6 max-w-2xl text-navy/80">{t('forAttorneys.body')}</p>
      <div className="mt-8">
        <Button href="mailto:hello@aghimmigration.com" size="lg">
          {t('forAttorneys.cta')}
        </Button>
      </div>
    </Container>
  )
}
