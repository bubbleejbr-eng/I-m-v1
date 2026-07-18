import { Outlet, useLocation } from 'react-router-dom'
import { Container, Logo, StepIndicator, LanguageSwitcher } from '../../ui'

const STEP_PATHS = ['language', 'profile', 'consent', 'journey', 'urgency']
const STEP_LABELS = ['Language', 'Profile', 'Consent', 'Journey', 'Screening']

export function OnboardingLayout() {
  const location = useLocation()
  const currentPath = location.pathname.split('/').pop() ?? ''
  const currentStepNumber = STEP_PATHS.indexOf(currentPath) + 1

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-navy/10 bg-white">
        <Container className="flex items-center justify-between py-4">
          <Logo />
          <LanguageSwitcher />
        </Container>
      </header>

      <Container className="py-10">
        {currentStepNumber > 0 && (
          <div className="mb-8">
            <StepIndicator steps={STEP_LABELS} currentStep={currentStepNumber} />
          </div>
        )}
        <Outlet />
      </Container>
    </div>
  )
}
