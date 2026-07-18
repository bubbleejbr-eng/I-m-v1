import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Container, Button } from '../../ui'
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client'

export function SignInPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!isSupabaseConfigured || !supabase) {
      setError('Sign-in is not yet connected in this environment. Supabase project credentials are required.')
      return
    }

    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    navigate('/app/dashboard')
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-navy">{t('auth.signInTitle')}</h1>
        <p className="mt-2 text-sm text-navy/60">{t('auth.signInSubtitle')}</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
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
              autoComplete="current-password"
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
            {submitting ? '…' : t('auth.signInCta')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          {t('auth.noAccount')}{' '}
          <Link to="/create-account" className="font-semibold text-brick hover:underline">
            {t('nav.createAccount')}
          </Link>
        </p>
      </div>
    </Container>
  )
}
