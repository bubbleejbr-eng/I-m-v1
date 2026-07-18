import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, DisclaimerBanner } from '../../ui'

export function TermsOfUsePage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('terms.title')} />
      <DisclaimerBanner className="mt-6 max-w-2xl">{t('terms.placeholderNotice')}</DisclaimerBanner>
      <div className="mt-8 max-w-2xl space-y-4 text-navy/70">
        <p>
          This placeholder outlines the intended structure of the Terms of Use: acceptance of terms,
          description of the service as a technology platform (not a law firm), user responsibilities
          (truthful information), payment terms, limitation of liability, and dispute resolution.
        </p>
        <p>
          A complete, attorney-reviewed Terms of Use will replace this placeholder before launch.
        </p>
      </div>
    </Container>
  )
}
