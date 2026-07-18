import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button, DisclaimerBanner } from '../../ui'
import { brand } from '../../content/brand'

export function AffordableHelpPage() {
  const { t } = useTranslation()

  return (
    <Container className="py-16">
      <SectionHeading title={t('affordableHelp.title')} subtitle={t('affordableHelp.subtitle')} />
      <p className="mt-6 max-w-2xl text-navy/80">{t('affordableHelp.body')}</p>

      <div className="mt-8">
        <Button to="/create-account" size="lg">
          {t('affordableHelp.cta')}
        </Button>
      </div>

      <DisclaimerBanner className="mt-10 max-w-2xl">{t('affordableHelp.notice')}</DisclaimerBanner>

      <p className="mt-8 max-w-2xl text-sm text-navy/60">
        Requests may be routed to {brand.nonprofitPartnerName}, a separate nonprofit immigration service
        organization, when appropriate. {brand.nonprofitPartnerName} does not own or operate this software
        platform.
      </p>
    </Container>
  )
}
