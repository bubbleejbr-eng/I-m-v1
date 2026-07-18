import { Routes, Route } from 'react-router-dom'

import { PublicLayout } from './components/layout/PublicLayout'
import { AppShell } from './components/layout/AppShell'
import { OnboardingLayout } from './components/layout/OnboardingLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { RoleGuard } from './components/auth/RoleGuard'

import { HomePage } from './pages/public/HomePage'
import { HowItWorksPage } from './pages/public/HowItWorksPage'
import { ServicesPage } from './pages/public/ServicesPage'
import { NaturalizationPage } from './pages/public/NaturalizationPage'
import { ProfessionalReviewPage } from './pages/public/ProfessionalReviewPage'
import { AffordableHelpPage } from './pages/public/AffordableHelpPage'
import { ForAttorneysPage } from './pages/public/ForAttorneysPage'
import { ForNonprofitsPage } from './pages/public/ForNonprofitsPage'
import { AboutPage } from './pages/public/AboutPage'
import { PricingPage } from './pages/public/PricingPage'
import { HelpCenterPage } from './pages/public/HelpCenterPage'
import { ContactPage } from './pages/public/ContactPage'
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage'
import { TermsOfUsePage } from './pages/public/TermsOfUsePage'
import { LegalDisclaimerPage } from './pages/public/LegalDisclaimerPage'
import { GovernmentNonAffiliationPage } from './pages/public/GovernmentNonAffiliationPage'

import { SignInPage } from './pages/auth/SignInPage'
import { CreateAccountPage } from './pages/auth/CreateAccountPage'

import { ClientDashboardPage } from './pages/app/ClientDashboardPage'
import { ReviewerDashboardPage } from './pages/app/ReviewerDashboardPage'
import { AdminDashboardPage } from './pages/app/AdminDashboardPage'
import { RolePlaceholderPage } from './pages/app/RolePlaceholderPage'
import { QuestionnairePage } from './pages/app/QuestionnairePage'

import { OnboardingIndexPage } from './pages/onboarding/OnboardingIndexPage'
import { LanguageStep } from './pages/onboarding/LanguageStep'
import { ProfileStep } from './pages/onboarding/ProfileStep'
import { ConsentStep } from './pages/onboarding/ConsentStep'
import { JourneyStep } from './pages/onboarding/JourneyStep'
import { UrgencyStep } from './pages/onboarding/UrgencyStep'

import { NotFoundPage } from './pages/public/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/naturalization" element={<NaturalizationPage />} />
        <Route path="professional-review" element={<ProfessionalReviewPage />} />
        <Route path="affordable-help" element={<AffordableHelpPage />} />
        <Route path="for-attorneys" element={<ForAttorneysPage />} />
        <Route path="for-nonprofits" element={<ForNonprofitsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="help" element={<HelpCenterPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="legal/privacy" element={<PrivacyPolicyPage />} />
        <Route path="legal/terms" element={<TermsOfUsePage />} />
        <Route path="legal/disclaimer" element={<LegalDisclaimerPage />} />
        <Route path="legal/government-non-affiliation" element={<GovernmentNonAffiliationPage />} />
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="create-account" element={<CreateAccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/onboarding" element={<ProtectedRoute />}>
        <Route element={<OnboardingLayout />}>
          <Route index element={<OnboardingIndexPage />} />
          <Route path="language" element={<LanguageStep />} />
          <Route path="profile" element={<ProfileStep />} />
          <Route path="consent" element={<ConsentStep />} />
          <Route path="journey" element={<JourneyStep />} />
          <Route path="urgency" element={<UrgencyStep />} />
        </Route>
      </Route>

      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="dashboard" element={<ClientDashboardPage />} />
          <Route path="questionnaire" element={<QuestionnairePage />} />
          <Route
            path="reviewer"
            element={
              <RoleGuard allow={['reviewer', 'platform_admin']}>
                <ReviewerDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="admin"
            element={
              <RoleGuard allow={['platform_admin']}>
                <AdminDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="attorney"
            element={
              <RoleGuard allow={['attorney', 'platform_admin']}>
                <RolePlaceholderPage
                  title="Immigration Attorney Workspace"
                  description="Attorney accounts require identity verification, bar number and jurisdiction confirmation, bar-status confirmation, conflict-check acknowledgment, and scope-of-engagement acceptance before any client matter becomes accessible. This is a protected placeholder in the MVP."
                />
              </RoleGuard>
            }
          />
          <Route
            path="nonprofit"
            element={
              <RoleGuard allow={['nonprofit_case_manager', 'platform_admin']}>
                <RolePlaceholderPage
                  title="Nonprofit Case Manager Workspace"
                  description="This workspace will support intake, referral routing, and case tracking for DOJ-recognized nonprofit organizations and accredited representatives. This is a protected placeholder in the MVP."
                />
              </RoleGuard>
            }
          />
          <Route
            path="org-admin"
            element={
              <RoleGuard allow={['org_admin', 'platform_admin']}>
                <RolePlaceholderPage
                  title="Organization Administrator Workspace"
                  description="This workspace will let organization administrators manage members, referrals, and organization-level settings. This is a protected placeholder in the MVP."
                />
              </RoleGuard>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
