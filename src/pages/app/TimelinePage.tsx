import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth/AuthContext'
import { getMyActiveJourney, type JourneyRow } from '../../lib/onboarding/onboardingApi'
import { fetchRiskRules, fetchRiskFlags, ensureTimelineRiskFlag, type RiskRuleRow, type RiskFlagRow } from '../../lib/risk/riskApi'
import { AddressesSection } from '../../components/timelines/AddressesSection'
import { EmploymentSection } from '../../components/timelines/EmploymentSection'
import { TripsSection } from '../../components/timelines/TripsSection'
import { MarriagesSection } from '../../components/timelines/MarriagesSection'
import { ChildrenSection } from '../../components/timelines/ChildrenSection'
import { Card } from '../../ui'
import clsx from 'clsx'

type Tab = 'addresses' | 'employment' | 'trips' | 'marriages' | 'children'

const TABS: { key: Tab; label: string }[] = [
  { key: 'addresses', label: 'Addresses' },
  { key: 'employment', label: 'Employment & School' },
  { key: 'trips', label: 'Travel' },
  { key: 'marriages', label: 'Marriages' },
  { key: 'children', label: 'Children' },
]

export function TimelinePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [journey, setJourney] = useState<JourneyRow | null>(null)
  const [riskRules, setRiskRules] = useState<RiskRuleRow[]>([])
  const [riskFlags, setRiskFlags] = useState<RiskFlagRow[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('addresses')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    void (async () => {
      const activeJourney = await getMyActiveJourney(user.id)
      setJourney(activeJourney)
      if (activeJourney?.workflow_version_id) {
        const [rules, flags] = await Promise.all([
          fetchRiskRules(activeJourney.workflow_version_id),
          fetchRiskFlags(activeJourney.id),
        ])
        setRiskRules(rules)
        setRiskFlags(flags)
      }
      setLoading(false)
    })()
  }, [user])

  async function handleGapDetected(ruleKey: string, detected: boolean) {
    if (!journey || !detected || riskRules.length === 0) return
    const updated = await ensureTimelineRiskFlag({ journeyId: journey.id, ruleKey, rules: riskRules, existingFlags: riskFlags })
    setRiskFlags(updated)
  }

  if (loading) return <p className="text-navy/60">Loading your timeline…</p>

  if (!journey) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-navy/70">You don't have an active immigration journey yet.</p>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Your Immigration Timeline</h1>
        <p className="mt-1 text-navy/60">
          Build a detailed history of your addresses, employment, travel, marriages, and children. We'll flag any
          gaps or overlapping dates so you can review them before filing.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-navy/10 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key ? 'bg-navy text-ivory' : 'text-navy/70 hover:bg-navy/5',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'addresses' && (
        <AddressesSection journeyId={journey.id} onGapDetected={(v) => void handleGapDetected('address_history_gap', v)} />
      )}
      {activeTab === 'employment' && (
        <EmploymentSection
          journeyId={journey.id}
          onGapDetected={(v) => void handleGapDetected('employment_history_gap', v)}
        />
      )}
      {activeTab === 'trips' && (
        <TripsSection journeyId={journey.id} onOverlapDetected={(v) => void handleGapDetected('travel_dates_overlap', v)} />
      )}
      {activeTab === 'marriages' && <MarriagesSection journeyId={journey.id} />}
      {activeTab === 'children' && <ChildrenSection journeyId={journey.id} />}
    </div>
  )
}
