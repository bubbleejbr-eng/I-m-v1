import { useTranslation } from 'react-i18next'
import { DisclaimerBanner } from './DisclaimerBanner'

export function GovNonAffiliationNotice({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <DisclaimerBanner className={className}>
      <strong className="font-semibold">{t('govNonAffiliation.title')}: </strong>
      {t('footer.governmentNotice')}
    </DisclaimerBanner>
  )
}
