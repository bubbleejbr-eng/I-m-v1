import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/common.json'
import es from './locales/es/common.json'

/**
 * Supported languages for the MVP. The `future` list documents languages
 * the platform is structured to support later without an architecture
 * change — every string must come from a resource file, never be
 * hardcoded in a component, so adding a language is a translation task
 * only.
 */
export const supportedLanguages = ['en', 'es'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export const futureLanguages = [
  'tl', // Tagalog
  'ar', // Arabic
  'fr', // French
  'pt', // Portuguese
  'ur', // Urdu
  'hi', // Hindi
  'zh', // Mandarin
  'vi', // Vietnamese
  'ko', // Korean
] as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      es: { common: es },
    },
    fallbackLng: 'en',
    supportedLngs: [...supportedLanguages],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
