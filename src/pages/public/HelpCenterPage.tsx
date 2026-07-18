import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container, SectionHeading, Card } from '../../ui'
import { helpCenterCategories } from '../../content/helpCenterCategories'

export function HelpCenterPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = helpCenterCategories.filter((c) => c.toLowerCase().includes(query.toLowerCase()))

  return (
    <Container className="py-16">
      <SectionHeading title={t('helpCenter.title')} subtitle={t('helpCenter.subtitle')} />

      <label htmlFor="help-search" className="sr-only">
        {t('helpCenter.searchPlaceholder')}
      </label>
      <input
        id="help-search"
        type="search"
        placeholder={t('helpCenter.searchPlaceholder') ?? ''}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mt-6 w-full max-w-md rounded-lg border border-navy/20 px-4 py-3 text-navy focus:border-blue-accent"
      />

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-navy">{t('helpCenter.categoriesTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <Card key={category}>
              <p className="font-medium text-navy">{category}</p>
              <p className="mt-2 text-xs text-navy/50">Articles coming soon.</p>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  )
}
