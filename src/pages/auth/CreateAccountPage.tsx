import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../../i18n'
import { Container, Button, DisclaimerBanner } from '../../ui'
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client'
import { legalNotices } from '../../content/brand'

export function CreateAccountPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!isSupabaseConfigured || !supabase) {
      setError('Account creation is not yet connected in this environment. Supabase project credentials are required.')
      return
    }

    setSubmitting(true)
    // The profile row and default 'client' role are created server-side
    // by the handle_new_user trigger (see
    // supabase/migrations/0019_auto_provision_and_journey_screening.sql)
    // as soon as this insert into auth.users lands — a client can never
    // insert their own user_roles row directly.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, preferred_language: i18n.language },
      },
    })
    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    navigate('/onboarding/profile')
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">{t('auth.createAccountTitle')}</h1>
        <p className="mt-2 text-sm text-navy/60">{t('auth.createAccountSubtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-navy">
                {t('auth.firstNameLabel')}
              </label>
              <input
                id="firstName"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-navy">
                {t('auth.lastNameLabel')}
              </label>
              <input
                id="lastName"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
              {t('auth.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy">
              {t('auth.passwordLabel')}
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-brick">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? '…' : t('auth.createAccountCta')}
          </Button>
        </form>

        <DisclaimerBanner className="mt-6">{legalNotices.governmentNonAffiliationShort}</DisclaimerBanner>

        <p className="mt-6 text-center text-sm text-navy/60">
          {t('auth.haveAccount')}{' '}
          <Link to="/sign-in" className="font-semibold text-brick hover:underline">
            {t('nav.signIn')}
          </Link>
        </p>
      </div>
    </Container>
  )
}
