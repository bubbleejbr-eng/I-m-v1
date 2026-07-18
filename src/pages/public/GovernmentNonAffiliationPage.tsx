import { useTranslation } from 'react-i18next'
import { Container, SectionHeading } from '../../ui'

export function GovernmentNonAffiliationPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('govNonAffiliation.title')} />
      <p className="mt-8 max-w-2xl text-navy/80">{t('govNonAffiliation.body')}</p>
    </Container>
  )
}
