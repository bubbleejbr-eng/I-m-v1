/**
 * Onboarding consent checkboxes (Step 3). Every box must render
 * unchecked by default — never pre-check a consent box. `required`
 * boxes must all be checked before the wizard will proceed; marketing
 * consent is the only optional one.
 */
export interface ConsentDefinition {
  consentType: string
  labelKey: string
  required: boolean
}

export const onboardingConsents: ConsentDefinition[] = [
  { consentType: 'terms_of_use', labelKey: 'onboarding.consent.termsOfUse', required: true },
  { consentType: 'privacy_policy', labelKey: 'onboarding.consent.privacyPolicy', required: true },
  { consentType: 'electronic_communication', labelKey: 'onboarding.consent.electronicCommunication', required: true },
  {
    consentType: 'government_non_affiliation_understanding',
    labelKey: 'onboarding.consent.governmentNonAffiliation',
    required: true,
  },
  {
    consentType: 'no_attorney_client_relationship_understanding',
    labelKey: 'onboarding.consent.noAttorneyClientRelationship',
    required: true,
  },
  {
    consentType: 'truthful_information_confirmation',
    labelKey: 'onboarding.consent.truthfulInformation',
    required: true,
  },
  { consentType: 'ai_processing_consent', labelKey: 'onboarding.consent.aiProcessing', required: true },
  { consentType: 'document_processing_consent', labelKey: 'onboarding.consent.documentProcessing', required: true },
  { consentType: 'marketing_consent', labelKey: 'onboarding.consent.marketing', required: false },
]
