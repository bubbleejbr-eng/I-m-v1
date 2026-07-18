import { useState } from 'react'
import { NavLink as RouterNavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { Logo, Button, Container, LanguageSwitcher } from '../../ui'
import { primaryNavLinks } from '../../content/navigation'

export function PublicHeader() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-ivory/95 backdrop-blur">
      <Container className="flex h-18 items-center justify-between py-3">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {primaryNavLinks.map((link) => (
            <RouterNavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition-colors hover:text-brick',
                  isActive ? 'text-brick' : 'text-navy/80',
                )
              }
            >
              {t(link.labelKey)}
            </RouterNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Button to="/sign-in" variant="ghost" size="sm">
            {t('nav.signIn')}
          </Button>
          <Button to="/create-account" size="sm">
            {t('nav.createAccount')}
          </Button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-navy/20 p-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-label={t('nav.menu')}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </Container>

      {menuOpen && (
        <div className="border-t border-navy/10 bg-ivory lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {primaryNavLinks.map((link) => (
              <RouterNavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-navy/80 hover:bg-navy/5"
              >
                {t(link.labelKey)}
              </RouterNavLink>
            ))}
            <div className="mt-2 flex items-center gap-3 px-3">
              <LanguageSwitcher />
            </div>
            <div className="mt-3 flex flex-col gap-2 px-3">
              <Button to="/sign-in" variant="outline" size="sm">
                {t('nav.signIn')}
              </Button>
              <Button to="/create-account" size="sm">
                {t('nav.createAccount')}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
