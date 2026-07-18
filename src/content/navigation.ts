/**
 * Public site navigation, data-driven so pages/links can change without
 * touching the header/footer components.
 */
export interface NavLink {
  labelKey: string
  path: string
}

export const primaryNavLinks: NavLink[] = [
  { labelKey: 'nav.howItWorks', path: '/how-it-works' },
  { labelKey: 'nav.services', path: '/services' },
  { labelKey: 'nav.professionalReview', path: '/professional-review' },
  { labelKey: 'nav.affordableHelp', path: '/affordable-help' },
  { labelKey: 'nav.pricing', path: '/pricing' },
  { labelKey: 'nav.helpCenter', path: '/help' },
]

export const footerProductLinks: NavLink[] = [
  { labelKey: 'nav.howItWorks', path: '/how-it-works' },
  { labelKey: 'nav.services', path: '/services' },
  { labelKey: 'nav.naturalization', path: '/services/naturalization' },
  { labelKey: 'nav.professionalReview', path: '/professional-review' },
  { labelKey: 'nav.affordableHelp', path: '/affordable-help' },
  { labelKey: 'nav.pricing', path: '/pricing' },
]

export const footerCompanyLinks: NavLink[] = [
  { labelKey: 'nav.about', path: '/about' },
  { labelKey: 'nav.forAttorneys', path: '/for-attorneys' },
  { labelKey: 'nav.forNonprofits', path: '/for-nonprofits' },
  { labelKey: 'nav.helpCenter', path: '/help' },
  { labelKey: 'nav.contact', path: '/contact' },
]

export const footerLegalLinks: NavLink[] = [
  { labelKey: 'privacy.title', path: '/legal/privacy' },
  { labelKey: 'terms.title', path: '/legal/terms' },
  { labelKey: 'legalDisclaimer.title', path: '/legal/disclaimer' },
  { labelKey: 'govNonAffiliation.title', path: '/legal/government-non-affiliation' },
]
