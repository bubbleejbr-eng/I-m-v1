import { Outlet, Link, NavLink as RouterNavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Logo, LanguageSwitcher, Button } from '../../ui'
import { useAuth } from '../../lib/auth/AuthContext'
import { appNavByRole } from '../../content/appNavigation'
import { brand } from '../../content/brand'

export function AppShell() {
  const { roles, signOut, user } = useAuth()

  const links = roles.length > 0 ? roles.flatMap((role) => appNavByRole[role] ?? []) : appNavByRole.client

  const uniqueLinks = Array.from(new Map(links.map((link) => [link.path, link])).values())

  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      <a href="#app-main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className="border-b border-navy/10 bg-navy text-ivory lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <Logo dark />
        </div>
        <nav className="flex flex-col gap-1 p-4" aria-label="Application">
          {uniqueLinks.map((link) => (
            <RouterNavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                clsx(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-ivory/10 text-gold' : 'text-ivory/80 hover:bg-ivory/5',
                )
              }
            >
              {link.label}
            </RouterNavLink>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Link to="/" className="text-xs text-ivory/50 hover:text-ivory/80">
            ← Back to public site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-navy/70">{brand.productName}</p>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user?.email && <span className="hidden text-sm text-navy/60 sm:inline">{user.email}</span>}
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign Out
            </Button>
          </div>
        </header>
        <main id="app-main-content" className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
