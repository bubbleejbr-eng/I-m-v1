# Brand Guide

## Working product name

**AGH American Immigration** — a temporary working name. Owned by **Anaya Global Holdings**.

All copy referencing the company/product name, taglines, and legal notices must be read from `src/content/brand.ts`, never hardcoded inline in a component. Changing the working name later means editing that one file (plus, in later phases, the `brand_settings` database table it will be replaced by — see `supabase/migrations/0018_admin_settings.sql`).

## Taglines

- **Primary:** "Your guided U.S. immigration application workspace."
- **Secondary:** "Prepare with confidence. Review before filing. Get professional help when you need it."

## AI assistant name

**American Immigration Guide** — configurable, stored alongside other brand values.

## Nonprofit partner name

**Anaya's Way Immigration Advocates** — a separate nonprofit immigration service organization. Never described as owning or operating this software platform.

## American-inspired design principles

- Feel recognizably connected to the U.S. immigration journey without appearing to be a government website or implying government affiliation.
- Subtle motifs only: a five-point star mark in the logo, a soft horizon/route line in the hero section. No large flags, no seals, no badges.
- Clean, document-inspired layout: generous spacing, strong headings, clear structure — calmer and easier to read than an official government form, not a copy of one.
- Plain American English first; government terminology is always explained in context (e.g., "Lawful Permanent Resident, also commonly called a green card holder").

## Approved color palette

Defined as CSS custom properties / Tailwind theme tokens in `src/index.css` and mirrored in `src/content/brand.ts`:

| Token | Hex | Use |
|---|---|---|
| Navy | `#0b1f3a` | Primary text, header/footer background, primary buttons |
| Navy Light | `#16305a` | Hover states |
| Ivory | `#faf7f0` | Page background |
| Brick | `#9a3324` | Accent, used sparingly (eyebrow text, warning/urgent tones, secondary CTA) |
| Brick Light | `#b5493a` | Hover state for brick |
| Gold | `#c9a24b` | Progress bars, active-state badges, subtle motif accents |
| Gold Light | `#e0c583` | Soft accent backgrounds |
| Gray | `#6b7280` | Muted text, neutral badges |
| Blue Accent | `#2f5d8a` | Focus rings, informational tone |

Red (brick) is used sparingly — never as a dominant color, never in a way that reads as alarm/danger by default.

## Typography

- **Headings:** `"Source Serif 4", Georgia, serif` — a serif face evokes official American documents without imitating any specific government form.
- **Body:** `"Inter", "Segoe UI", system-ui, sans-serif` — highly legible at all sizes, strong screen-reader and low-vision support.

## Logo direction

Current placeholder: an abstracted five-point star inside a thin gold ring, paired with the wordmark "AGH" + "American Immigration" in the header. No eagle, no shield-and-stars seal, no color combination that reads as an official government emblem. Final logo design is a deferred item — see `MVP_ROADMAP.md`.

## Government non-affiliation rules

Every build must:

- Display "AGH American Immigration is a private technology platform. It is not affiliated with USCIS, the Department of Homeland Security, the Department of State, any U.S. court, or any government agency." in the footer of every page and during onboarding.
- Never use the word "official" in connection with government processes.
- Never present USCIS form numbers as the primary way a user navigates the product — situations come first, form numbers are secondary, de-emphasized reference text (see `src/content/journeys.ts`).

## Prohibited visual elements

- Large flags covering the interface
- Bald eagles
- Government seals
- USCIS logos
- Department of Homeland Security logos
- Statue of Liberty clichés
- Courtroom imagery
- Gavels
- Fake government badges
- Anything that could cause a user to believe this is an official government website
- Robots as the primary visual identity
- Cartoon immigration officers
- Handcuffs
- Border walls
- Fear-based imagery
- Dense government-style layouts
- Generic stock photos of distressed immigrants
- Legal intimidation language

## Tone of voice

- Trustworthy, clear, calm, warm, modern, secure, professional.
- Premium but affordable; supportive without being informal.
- Easier to understand than a government form.
- Never fear-based, never legally intimidating, never falsely reassuring about outcomes.

## Plain-language standards

- One manageable question or small group of questions at a time.
- Explain *why* information is being requested.
- Define immigration terminology inline the first time it's used.
- Always offer "I'm not sure" as a valid answer — never force a confident answer out of an uncertain user.
- Government-style question → platform explanation pattern, e.g.:
  - Government style: "Have you EVER been arrested, cited, or detained?"
  - Platform style: "This includes many incidents, even when charges were dismissed, records were sealed, or you were told the matter would not appear on your record. Select 'I'm not sure' when you need help reviewing what happened."

## English and Spanish content guidance

- All interface text comes from `src/i18n/locales/{en,es}/common.json` — never hardcoded in a component. This is what makes future languages (Tagalog, Arabic, French, Portuguese, Urdu, Hindi, Mandarin, Vietnamese, Korean — see `src/i18n/index.ts`'s `futureLanguages`) a translation task, not an engineering one.
- American English is the default style (not British spellings).
- Spanish translations should read naturally to a broad Latin American audience, not translated word-for-word; legal/government terms get the same "plain-language explanation" treatment as in English.
- Avoid idioms that don't translate cleanly; prefer direct, warm, plain phrasing in both languages.
