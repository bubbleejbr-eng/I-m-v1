# AGH American Immigration (working name)

Your guided U.S. immigration application workspace. A private technology platform — not affiliated with USCIS, the Department of Homeland Security, the Department of State, or any government agency. See `PRODUCT_GUARDRAILS.md` for the full non-negotiable constraints and `MVP_ROADMAP.md` / `BRAND_GUIDE.md` for scope and design direction.

This build covers **Phases 1–3**: design system, public marketing site, application shell, database schema with Row-Level Security, authentication, the initial role model, the client onboarding wizard, the full 28-section naturalization questionnaire engine, a secure document vault, a personalized checklist generated from confirmed answers, address/employment/travel/marriage/children timelines with gap and overlap detection, and a risk/escalation engine covering both onboarding urgency screening and full-questionnaire answers. See `MVP_ROADMAP.md` for what's next.

## Stack

React + TypeScript + Vite, React Router, Tailwind CSS v4, `react-i18next` (English/Spanish, structured for more languages later), Supabase (Postgres + Auth + Storage, all behind strict RLS).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project URL + anon key
npm run dev
```

The app renders fully without Supabase configured — public pages work, and `sign-in`/`create-account` show a clear message instead of crashing. Protected `/app/*` routes fall through to the shell (no hard auth wall) until Supabase credentials are present, so the UI stays reviewable in any environment.

### Connecting Supabase

1. Create a Supabase project.
2. Run the migrations in `supabase/migrations/` in numeric order (via the Supabase SQL editor, or `supabase db push` if you have the CLI linked to your project).
3. Run the seed files in this order to load reference data and content — none of them create any user accounts:
   1. `supabase/seed/seed.sql` — journey catalog, government forms, sample review products
   2. `supabase/seed/naturalization_content_seed.sql` — 28 questionnaire sections, ~76 questions, conditional rules, onboarding urgency-screening risk rules
   3. `supabase/seed/naturalization_checklist_and_risk_seed.sql` — 24 document categories, matching checklist rules, and the extended risk rules evaluated against full questionnaire answers
4. Copy your project's URL and anon (public) key into `.env.local` (see `.env.example`). Never put the service-role key, AI provider keys, or Stripe secret keys in frontend environment variables — those belong only in Supabase Edge Functions.
5. Create your own account through `/create-account`, then grant yourself a role by inserting a row into `user_roles` from the Supabase dashboard (client-side code cannot do this — see `PRODUCT_GUARDRAILS.md` on self-escalation).

### Verifying the database schema locally

The migrations were validated against a local PostgreSQL 16 instance with minimal stand-ins for Supabase's `auth`/`storage` schemas (all 19 migration files apply cleanly; all 60 tables end up with Row-Level Security enabled; all three seed files load without error, in order). To repeat this locally without a real Supabase project, stand up a Postgres instance, create `auth.users`/`storage.buckets`/`storage.objects` stub tables plus `auth.uid()`/`storage.foldername()` stub functions, then run the files in `supabase/migrations/` in order.

## Project structure

```
src/
  content/       Centralized branding, navigation, journey-catalog, consent, and urgency-screening data
  i18n/          react-i18next setup + en/es resource files
  lib/
    supabase/    Supabase client + hand-maintained types
    auth/        AuthContext (session + role loading)
    onboarding/  Onboarding data access + useOnboardingStatus (determines next wizard step)
    questionnaire/ Workflow content fetching, conditional-logic evaluator, shared progress computation
    dashboard/   Dashboard-specific queries (journey type, review status, recent activity)
    documents/   Document vault: upload, categorize, signed download URLs, soft delete
    checklist/   Checklist generation from checklist_rules + confirmed answers, document linking
    timelines/   Address/employment/school/trip/marriage/children CRUD + gap/overlap detection
    risk/        Risk-flag creation from answer-based and timeline-based rule evaluation
    rules/       Shared condition_expression evaluator used by both checklist and risk rules
    audit/       logAuditEvent() wrapper around the log_audit_event() RPC
  ui/            Design system primitives (Button, Card, Badge, Hero, ...)
  components/
    layout/      PublicHeader/Footer, PublicLayout, AppShell, OnboardingLayout
    auth/        ProtectedRoute, RoleGuard
    questionnaire/ QuestionField (renders one question per input_type), SectionSidebar
    timelines/   Per-entity timeline sections (Addresses, Employment, Trips, Marriages, Children)
  pages/
    public/      Marketing site (Home, How It Works, Services, Naturalization, ...)
    auth/        Sign In, Create Account
    onboarding/  5-step wizard: language, profile, consent, journey, urgency screening
    app/         Client dashboard, questionnaire, documents, checklist, timeline, Reviewer/Admin dashboards, role placeholders
  types/         Shared TypeScript types (roles)
supabase/
  migrations/    Numbered SQL migrations, one concern per file, all RLS-enabled
  seed/          Reference data + full naturalization questionnaire, checklist, and risk-rule content (no user accounts)
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) and build
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build locally
