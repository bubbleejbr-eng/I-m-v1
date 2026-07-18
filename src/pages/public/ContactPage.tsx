import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Button } from '../../ui'

export function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <Container className="py-16">
      <SectionHeading title={t('contact.title')} subtitle={t('contact.subtitle')} />

      {submitted ? (
        <p className="mt-8 max-w-md rounded-xl bg-green-50 p-4 text-green-900" role="status">
          Thank you. Your message has been received.
        </p>
      ) : (
        <form className="mt-8 max-w-md space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy">
              {t('contact.nameLabel')}
            </label>
            <input id="name" required className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent" />
          </div>
          <div>
            <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-navy">
              {t('contact.emailLabel')}
            </label>
            <input
              id="contactEmail"
              type="email"
              required
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy">
              {t('contact.messageLabel')}
            </label>
            <textarea
              id="message"
              required
              rows={5}
              className="w-full rounded-lg border border-navy/20 px-3 py-2.5 text-navy focus:border-blue-accent"
            />
          </div>
          <Button type="submit">{t('contact.submit')}</Button>
        </form>
      )}
    </Container>
  )
}
