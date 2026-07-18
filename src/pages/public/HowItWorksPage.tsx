import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button, GovNonAffiliationNotice } from '../../ui'

export function HowItWorksPage() {
  const { t } = useTranslation()

  const steps = [
    { heading: t('howItWorks.step1Heading'), body: t('howItWorks.step1Body') },
    { heading: t('howItWorks.step2Heading'), body: t('howItWorks.step2Body') },
    { heading: t('howItWorks.step3Heading'), body: t('howItWorks.step3Body') },
    { heading: t('howItWorks.step4Heading'), body: t('howItWorks.step4Body') },
    { heading: t('howItWorks.step5Heading'), body: t('howItWorks.step5Body') },
  ]

  return (
    <Container className="py-16">
      <SectionHeading title={t('howItWorks.title')} subtitle={t('howItWorks.subtitle')} />

      <div className="mt-10 space-y-6">
        {steps.map((step) => (
          <div key={step.heading} className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="text-lg font-semibold text-navy">{step.heading}</h3>
            <p className="mt-2 text-navy/70">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button to="/create-account" size="lg">
          {t('home.primaryCta')}
        </Button>
      </div>

      <GovNonAffiliationNotice className="mt-10" />
    </Container>
  )
}
