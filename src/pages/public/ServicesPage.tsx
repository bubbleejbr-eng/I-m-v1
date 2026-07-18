import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, JourneyCard } from '../../ui'
import { journeyCatalog } from '../../content/journeys'

export function ServicesPage() {
  const { t } = useTranslation()

  return (
    <Container className="py-16">
      <SectionHeading title={t('services.title')} subtitle={t('services.subtitle')} />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {journeyCatalog.map((journey) => (
          <JourneyCard key={journey.slug} journey={journey} />
        ))}
      </div>
    </Container>
  )
}
