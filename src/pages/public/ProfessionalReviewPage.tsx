import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Card, DisclaimerBanner } from '../../ui'
import { legalNotices } from '../../content/brand'

export function ProfessionalReviewPage() {
  const { t } = useTranslation()

  const products = [
    t('professionalReview.product1'),
    t('professionalReview.product2'),
    t('professionalReview.product3'),
    t('professionalReview.product4'),
    t('professionalReview.product5'),
    t('professionalReview.product6'),
    t('professionalReview.product7'),
    t('professionalReview.product8'),
  ]

  return (
    <Container className="py-16">
      <SectionHeading title={t('professionalReview.title')} subtitle={t('professionalReview.subtitle')} />
      <p className="mt-6 max-w-2xl text-navy/80">{t('professionalReview.body')}</p>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-navy">{t('professionalReview.productsTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <Card key={product}>
              <p className="font-medium text-navy">{product}</p>
            </Card>
          ))}
        </div>
      </div>

      <DisclaimerBanner className="mt-10">{legalNotices.legalBoundaryNotice}</DisclaimerBanner>
    </Container>
  )
}
