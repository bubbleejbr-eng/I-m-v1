import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Card, Badge } from '../../ui'
import { sampleProducts } from '../../content/samplePricing'

export function PricingPage() {
  const { t } = useTranslation()

  return (
    <Container className="py-16">
      <SectionHeading title={t('pricing.title')} subtitle={t('pricing.subtitle')} />
      <Badge tone="brick" className="mt-4">
        {t('pricing.notice')}
      </Badge>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sampleProducts.map((product) => (
          <Card key={product.nameKey} className="flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-navy">{t(product.nameKey)}</h3>
            <p className="mt-4 text-2xl font-semibold text-brick">{product.price}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-navy/40">{t('common.notLive')}</p>
          </Card>
        ))}
      </div>
    </Container>
  )
}
