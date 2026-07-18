# Product Guardrails

These guardrails are non-negotiable constraints on AGH American Immigration (working name). Every contributor — human or AI — must treat them as hard requirements, not suggestions. Where code and this document disagree, this document wins and the code is a bug.

1. The platform is a private U.S. immigration technology platform.
2. The platform is not affiliated with USCIS or any government agency.
3. The platform is not a law firm.
4. The platform does not guarantee outcomes.
5. The platform does not fabricate facts.
6. The platform does not automatically deny eligibility.
7. The platform does not automatically file with USCIS.
8. The platform does not automatically generate a G-28.
9. No attorney-client relationship exists without an express professional engagement.
10. Real client information may not be used in development.
11. Every immigration workflow requires versioning and qualified review.
12. High-risk immigration issues must be escalated.
13. Every AI-generated factual document requires client confirmation.
14. Sensitive immigration information requires access controls and audit logging.
15. Government logos, seals, and misleading branding are prohibited.
16. Professional review and legal representation must remain clearly separate.

## How these guardrails show up in the codebase

- **Non-affiliation:** `src/content/brand.ts` (`legalNotices`) centralizes every non-affiliation and boundary notice; `GovNonAffiliationNotice` and the public footer render it on every page. Dedicated pages exist at `/legal/government-non-affiliation` and `/legal/disclaimer`.
- **No eligibility determination:** the naturalization workflow copy (`src/pages/public/NaturalizationPage.tsx`, `src/i18n/locales/*/common.json` under `naturalization.disclaimerBody`) explicitly states the platform identifies items that may need documentation or review — never an eligibility conclusion. The `risk_flags` table (see `supabase/migrations/0007_checklist_and_risk.sql`) stores a `triggering_explanation`, never a verdict.
- **No automatic G-28 / representation:** `representation_engagements` (`0010_professional_review.sql`) requires separate booleans for conflict check, professional acceptance, and client acceptance — none of which a payment record can set. `payments` and `review_requests` have no foreign key or trigger that touches `representation_engagements`.
- **No automatic USCIS filing:** no code path calls, scrapes, or submits to any government system. `case_status_records` is manual-entry only, with a link out to the official USCIS case-status page.
- **Versioned workflows:** `immigration_workflow_versions`, `checklist_rules`, and `risk_rules` all carry `status`/`approval_status` (`draft` → `legal_review` → `approved` → `published` → `retired`), an `effective_date`, and a `legal_reviewer_id`. `immigration_journeys` pins a `workflow_version_id` at creation so a later rule change never silently changes an in-progress matter's requirements.
- **Client confirmation of AI output:** `ai_generations` stores `client_approved_at` separately from `generated_output`; the required user-visible notice is `legalNotices.aiDraftNotice` in `src/content/brand.ts`.
- **Access control & audit logging:** every table in `supabase/migrations/` has Row-Level Security enabled (verified: 60/60 tables). `audit_logs` has no update/delete policy for any role, including `platform_admin` — it is append-only by design. `reviewer_notes.is_client_visible` enforces the internal/client-visible split.
- **No self-escalation:** `user_roles` only allows a user to `select` their own rows; `insert`/`update`/`delete` require `is_platform_admin()`. `professional_verifications` is admin-write-only — no professional can verify themselves.
- **Real data:** demo/sample data lives only in `supabase/seed/seed.sql` (reference catalogs — journey types, forms, review products) and is clearly labeled; no seed script inserts a fabricated `auth.users` row standing in for a real client.
- **Brand/legal prohibitions:** see `BRAND_GUIDE.md` for the full list of prohibited visual elements (flags, eagles, seals, USCIS/DHS logos, badges, courtroom imagery).

## Review checklist for new features

Before merging anything that touches client-facing copy, AI output, workflow rules, or professional review:

- [ ] Does this state or imply a legal conclusion (eligibility, approval likelihood)? If yes, stop — route it through a versioned, legally-reviewed rule instead.
- [ ] Does this create, offer, or reference representation without going through `representation_engagements`'s full authorization chain?
- [ ] Does new AI-generated content flow through client confirmation before being treated as fact?
- [ ] Does the new table/column have Row-Level Security enabled with an owner-or-admin (or narrower) policy?
- [ ] Does anything log sensitive content (SSNs, passport numbers, full answers, document contents) into `audit_logs.description`? If yes, redact it.
- [ ] Does any visual asset use a flag, seal, eagle, badge, or government logo? If yes, remove it.
