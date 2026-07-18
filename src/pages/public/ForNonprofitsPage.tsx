import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button } from '../../ui'

export function ForNonprofitsPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('forNonprofits.title')} subtitle={t('forNonprofits.subtitle')} />
      <p className="mt-6 max-w-2xl text-navy/80">{t('forNonprofits.body')}</p>
      <div className="mt-8">
        <Button href="mailto:hello@aghimmigration.com" size="lg">
          {t('forNonprofits.cta')}
        </Button>
      </div>
    </Container>
  )
}
