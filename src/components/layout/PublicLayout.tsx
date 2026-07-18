import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'

export function PublicLayout() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
