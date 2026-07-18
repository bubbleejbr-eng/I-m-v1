/**
 * Centralized branding configuration.
 *
 * Every page and component should read company name, product name,
 * taglines, legal notices, and color tokens from this file (or from
 * `brand_settings` in the database once the admin brand editor ships)
 * instead of hardcoding copy inline. Changing the working product name
 * later means editing this file only.
 */

export const brand = {
  companyName: 'Anaya Global Holdings',
  productName: 'AGH American Immigration',
  productNameShort: 'AGH',

  taglinePrimary: 'Your guided U.S. immigration application workspace.',
  taglineSecondary:
    'Prepare with confidence. Review before filing. Get professional help when you need it.',

  aiAssistantName: 'American Immigration Guide',

  nonprofitPartnerName: "Anaya's Way Immigration Advocates",

  contact: {
    supportEmail: 'support@aghimmigration.com',
    generalEmail: 'hello@aghimmigration.com',
  },

  social: {
    // Reserved for future use; intentionally empty in the MVP.
  },

  colors: {
    navy: '#0b1f3a',
    navyLight: '#16305a',
    ivory: '#faf7f0',
    white: '#ffffff',
    brick: '#9a3324',
    brickLight: '#b5493a',
    gold: '#c9a24b',
    goldLight: '#e0c583',
    gray: '#6b7280',
    grayLight: '#e5e7eb',
    blueAccent: '#2f5d8a',
  },

  fonts: {
    heading: '"Source Serif 4", "Georgia", serif',
    body: '"Inter", "Segoe UI", system-ui, sans-serif',
  },
} as const

/**
 * Legal / government non-affiliation notices.
 * Keep concise. Display at meaningful decision points only —
 * not repeated on every screen.
 */
export const legalNotices = {
  governmentNonAffiliationShort:
    'AGH American Immigration is a private technology platform. It is not affiliated with USCIS, the Department of Homeland Security, the Department of State, any U.S. court, or any government agency.',

  legalBoundaryNotice:
    'AGH American Immigration is a private immigration technology platform. It is not a law firm, does not replace an attorney, and does not guarantee eligibility, approval, or any immigration result. Automated preparation tools and general educational information are not a substitute for individualized legal advice.',

  governmentNonAffiliationFull:
    'Not affiliated with USCIS, the Department of Homeland Security, the Department of State, the Executive Office for Immigration Review, or any U.S. government agency.',

  transparencyNotice:
    'USCIS forms are available free from the United States government. AGH American Immigration charges only for its technology, guided preparation tools, document organization, quality review, and optional professional services.',

  urgentReviewNotice:
    'Your situation may require prompt attention from a qualified immigration professional. You may continue organizing your information here, but do not rely only on this platform for an urgent deadline, court matter, or legal strategy.',

  aiDraftNotice:
    'Generated from the information you provided. Review every statement carefully. Correct anything that is incomplete or inaccurate before approving.',

  affordableHelpNotice:
    'Submitting this request does not guarantee that an attorney or nonprofit organization can accept your matter. Your information will be used to identify possible review, referral, or assistance options.',

  samplePricingNotice: 'Sample Pricing — Not Live',
} as const

export type Brand = typeof brand
