import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, DisclaimerBanner } from '../../ui'

export function PrivacyPolicyPage() {
  const { t } = useTranslation()
  return (
    <Container className="py-16">
      <SectionHeading title={t('privacy.title')} />
      <DisclaimerBanner className="mt-6 max-w-2xl">{t('privacy.placeholderNotice')}</DisclaimerBanner>
      <div className="mt-8 max-w-2xl space-y-4 text-navy/70">
        <p>
          This placeholder describes, at a high level, the categories of information AGH American
          Immigration collects (account details, questionnaire answers, uploaded documents), how it is
          used (application preparation, document organization, professional review), and the rights
          available to users (access, correction, deletion, and data export requests through the Privacy
          &amp; Security Center in later phases).
        </p>
        <p>
          A complete, attorney-reviewed Privacy Policy will replace this placeholder before any real
          client data is processed in production.
        </p>
      </div>
    </Container>
  )
}
