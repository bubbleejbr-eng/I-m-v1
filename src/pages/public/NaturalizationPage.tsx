import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button, DisclaimerBanner, Badge } from '../../ui'
import { naturalizationSections } from '../../content/naturalizationSections'

export function NaturalizationPage() {
  const { t } = useTranslation()

  return (
    <Container className="py-16">
      <Badge tone="gold">{t('services.activeLabel')}</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">{t('naturalization.title')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-navy/70">{t('naturalization.subtitle')}</p>
      <p className="mt-2 text-sm font-medium text-navy/40">{t('naturalization.formNote')}</p>

      <p className="mt-6 max-w-2xl text-navy/80">{t('naturalization.intro')}</p>

      <DisclaimerBanner className="mt-8 max-w-2xl">
        <strong className="font-semibold">{t('naturalization.disclaimerHeading')}: </strong>
        {t('naturalization.disclaimerBody')}
      </DisclaimerBanner>

      <div className="mt-12">
        <SectionHeading title={t('naturalization.sectionsTitle')} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {naturalizationSections.map((section, index) => (
            <div key={section} className="flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-4">
              <span className="mt-0.5 text-sm font-semibold text-gold">{index + 1}</span>
              <span className="text-sm font-medium text-navy">{section}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-navy p-8 text-center text-ivory">
        <h2 className="text-xl font-semibold">{t('naturalization.ctaTitle')}</h2>
        <div className="mt-5">
          <Button to="/create-account" size="lg">
            {t('naturalization.cta')}
          </Button>
        </div>
      </div>
    </Container>
  )
}
