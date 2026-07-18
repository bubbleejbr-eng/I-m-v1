import { useTranslation } from 'react-i18next'
import { Hero, Container, SectionHeading, Button, JourneyCard } from '../../ui'
import { activeJourneys, comingSoonJourneys } from '../../content/journeys'

export function HomePage() {
  const { t } = useTranslation()

  const steps = [t('home.step1Title'), t('home.step2Title'), t('home.step3Title')]
  const benefits = [
    t('home.benefit1'),
    t('home.benefit2'),
    t('home.benefit3'),
    t('home.benefit4'),
    t('home.benefit5'),
    t('home.benefit6'),
    t('home.benefit7'),
    t('home.benefit8'),
  ]

  return (
    <div>
      <Hero
        eyebrow="U.S. Immigration Application Preparation"
        title={t('home.heroTitle')}
        subtitle={t('home.heroSubtitle')}
        trustLine={t('home.trustLine')}
        actions={
          <>
            <Button to="/create-account" size="lg">
              {t('home.primaryCta')}
            </Button>
            <Button to="/how-it-works" variant="outlineInverse" size="lg">
              {t('home.secondaryCta')}
            </Button>
          </>
        }
      />

      <Container className="py-16">
        <SectionHeading align="center" title={t('home.stepsTitle')} />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-navy/10 bg-white p-6 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-navy text-ivory font-semibold">
                {index + 1}
              </div>
              <p className="font-medium text-navy">{step}</p>
            </div>
          ))}
        </div>
      </Container>

      <div className="bg-white py-16">
        <Container>
          <SectionHeading align="center" title={t('home.benefitsTitle')} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-xl bg-ivory p-5 text-sm font-medium text-navy">
                {benefit}
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-16">
        <SectionHeading eyebrow="Your U.S. Immigration Situation" title={t('home.journeysSectionTitle')} subtitle={t('home.journeysSectionBody')} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeJourneys.map((journey) => (
            <JourneyCard key={journey.slug} journey={journey} />
          ))}
          {comingSoonJourneys.slice(0, 5).map((journey) => (
            <JourneyCard key={journey.slug} journey={journey} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button to="/services" variant="ghost">
            {t('common.learnMore')} →
          </Button>
        </div>
      </Container>

      <div className="bg-navy py-16 text-ivory">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              title={t('home.transparencyTitle')}
              subtitle={t('home.transparencyBody')}
              className="[&_h2]:text-ivory [&_p]:text-ivory/70"
            />
          </div>
          <div>
            <SectionHeading
              title={t('home.journeyTitle')}
              subtitle={t('home.journeyBody')}
              className="[&_h2]:text-ivory [&_p]:text-ivory/70"
            />
          </div>
        </Container>
      </div>
    </div>
  )
}
