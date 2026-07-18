import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Logo, LanguageSwitcher } from '../../ui'
import { brand } from '../../content/brand'
import { footerProductLinks, footerCompanyLinks, footerLegalLinks } from '../../content/navigation'

function LinkColumn({ title, links }: { title: string; links: { labelKey: string; path: string }[] }) {
  const { t } = useTranslation()
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ivory/60">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.path}>
            <Link to={link.path} className="text-sm text-ivory/80 hover:text-gold">
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PublicFooter() {
  const { t } = useTranslation()

  return (
    <footer className="bg-navy text-ivory">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm text-ivory/70">{brand.taglinePrimary}</p>
            <div className="mt-4">
              <LanguageSwitcher dark />
            </div>
          </div>
          <LinkColumn title={t('footer.product')} links={footerProductLinks} />
          <LinkColumn title={t('footer.company')} links={footerCompanyLinks} />
          <LinkColumn title={t('footer.legal')} links={footerLegalLinks} />
        </div>

        <div className="mt-10 rounded-xl border border-ivory/15 bg-white/5 p-4 text-sm leading-relaxed text-ivory/70">
          {t('footer.governmentNotice')}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-ivory/10 pt-6 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.companyName}. {t('footer.rights')}
          </p>
          <p>{t('footer.companyOwner')}</p>
        </div>
      </Container>
    </footer>
  )
}
