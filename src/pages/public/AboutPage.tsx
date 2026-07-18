import { useTranslation } from 'react-i18next'
import { Container, SectionHeading } from '../../ui'

export function AboutPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('about.title')} subtitle={t('about.subtitle')} />
      <div className="mt-8 max-w-2xl space-y-4 text-navy/80">
        <p>{t('about.body1')}</p>
        <p>{t('about.body2')}</p>
        <p>{t('about.body3')}</p>
      </div>
    </Container>
  )
}
