/**
 * U.S. immigration journey catalog shown to clients.
 *
 * This is presentation data for the MVP. In later phases this list is
 * replaced by the `immigration_journey_types` table so administrators
 * can edit it without a code deployment. Journeys are organized around
 * plain-language situations, not USCIS form numbers — the form number
 * is shown only as secondary, de-emphasized reference text.
 */

export type JourneyStatus = 'active' | 'coming_soon'

export interface JourneyCardContent {
  slug: string
  situationLabel: string
  description: string
  formReference?: string
  status: JourneyStatus
}

export const journeyCatalog: JourneyCardContent[] = [
  {
    slug: 'naturalization',
    situationLabel: 'I Want to Become a U.S. Citizen',
    description: 'Prepare information for a United States naturalization application.',
    formReference: 'Common USCIS form: N-400',
    status: 'active',
  },
  {
    slug: 'green-card-renewal',
    situationLabel: 'Renew or Replace a Green Card',
    description: 'Prepare to renew or replace a Permanent Resident Card.',
    formReference: 'Common USCIS form: I-90',
    status: 'coming_soon',
  },
  {
    slug: 'family-petition',
    situationLabel: 'Petition for a Family Member',
    description: 'Start a family-based immigrant petition.',
    formReference: 'Common USCIS form: I-130',
    status: 'coming_soon',
  },
  {
    slug: 'marriage-green-card',
    situationLabel: 'Marriage-Based Green Card',
    description: 'Prepare information after marrying a U.S. citizen or permanent resident.',
    status: 'coming_soon',
  },
  {
    slug: 'bring-spouse',
    situationLabel: 'Bring My Spouse to the United States',
    description: 'Prepare to petition for a spouse living abroad or in the United States.',
    status: 'coming_soon',
  },
  {
    slug: 'bring-parents',
    situationLabel: 'Bring My Parents to the United States',
    description: 'Prepare to petition for a parent.',
    status: 'coming_soon',
  },
  {
    slug: 'bring-children',
    situationLabel: 'Bring My Children to the United States',
    description: 'Prepare to petition for a child.',
    status: 'coming_soon',
  },
  {
    slug: 'fiance-visa',
    situationLabel: 'Fiancé Visa',
    description: 'Prepare to petition for a fiancé or fiancée living abroad.',
    formReference: 'Common USCIS form: I-129F',
    status: 'coming_soon',
  },
  {
    slug: 'employment-authorization',
    situationLabel: 'Employment Authorization',
    description: 'Renew or apply for permission to work in the United States.',
    formReference: 'Common USCIS form: I-765',
    status: 'coming_soon',
  },
  {
    slug: 'adjustment-of-status',
    situationLabel: 'Adjustment of Status',
    description: 'Prepare to apply for a green card while remaining in the United States.',
    formReference: 'Common USCIS form: I-485',
    status: 'coming_soon',
  },
  {
    slug: 'consular-processing',
    situationLabel: 'Consular Processing',
    description: 'Prepare for an immigrant visa interview outside the United States.',
    status: 'coming_soon',
  },
  {
    slug: 'remove-conditions',
    situationLabel: 'Remove Conditions on Residence',
    description: 'Prepare to remove conditions on a two-year conditional green card.',
    formReference: 'Common USCIS form: I-751',
    status: 'coming_soon',
  },
  {
    slug: 'humanitarian-assistance',
    situationLabel: 'Humanitarian Immigration Assistance',
    description: 'Get connected with humanitarian immigration resources.',
    status: 'coming_soon',
  },
  {
    slug: 't-visa',
    situationLabel: 'T Visa Preparation Support',
    description: 'Support for trafficking survivors exploring immigration options.',
    status: 'coming_soon',
  },
  {
    slug: 'u-visa',
    situationLabel: 'U Visa Preparation Support',
    description: 'Support for crime victims exploring immigration options.',
    status: 'coming_soon',
  },
  {
    slug: 'vawa',
    situationLabel: 'VAWA Immigration Assistance',
    description: 'Confidential support for survivors of abuse exploring immigration options.',
    status: 'coming_soon',
  },
  {
    slug: 'asylum',
    situationLabel: 'Asylum Preparation Support',
    description: 'Support for people seeking protection in the United States.',
    status: 'coming_soon',
  },
  {
    slug: 'rfe-review',
    situationLabel: 'Request for Evidence Review',
    description: 'Get help understanding a Request for Evidence from USCIS.',
    status: 'coming_soon',
  },
  {
    slug: 'noid-review',
    situationLabel: 'Notice of Intent to Deny Review',
    description: 'Get help understanding a Notice of Intent to Deny from USCIS.',
    status: 'coming_soon',
  },
  {
    slug: 'denial-review',
    situationLabel: 'USCIS Denial Review',
    description: 'Get help understanding a USCIS denial and possible next steps.',
    status: 'coming_soon',
  },
  {
    slug: 'document-review',
    situationLabel: 'Immigration Document Review',
    description: 'Request a review of documents you have already prepared.',
    status: 'coming_soon',
  },
  {
    slug: 'attorney-review',
    situationLabel: 'Immigration Attorney Review',
    description: 'Request review of your application by an immigration attorney.',
    status: 'coming_soon',
  },
]

export const activeJourneys = journeyCatalog.filter((j) => j.status === 'active')
export const comingSoonJourneys = journeyCatalog.filter((j) => j.status === 'coming_soon')
