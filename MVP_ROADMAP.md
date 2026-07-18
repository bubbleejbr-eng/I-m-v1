# MVP Roadmap

## Product vision

AGH American Immigration is an AI-assisted U.S. immigration application preparation, document organization, quality-control, professional-review, and case-tracking platform — not an AI law firm, and not a replacement for an immigration attorney. It helps immigrants and their families understand a process, select the right situation (not form number), complete a guided questionnaire, organize documents and evidence, get a personalized checklist, catch missing/conflicting information, generate confirmable drafts, and request professional or nonprofit help when appropriate.

Long-term, the platform aims to be the operating system for U.S. immigration application preparation and professional review, eventually serving individuals, families, attorneys, DOJ-recognized nonprofits and accredited representatives, employers, universities, and community organizations — built as a modular foundation now so new immigration journeys can be added without a rebuild.

## Phase descriptions

**Phase 1 — Foundation (this build).** American-inspired design system, full public marketing site, application shell, Supabase connection, complete database schema with Row-Level Security, initial role model, authentication, government non-affiliation notices, and GitHub sync.

**Phase 2 — Onboarding & questionnaire.** Client onboarding (language selection, consent flow, journey selection, urgency/safety screening), client dashboard, and the full naturalization questionnaire with save-and-resume.

**Phase 3 — Documents & readiness.** Secure document vault, personalized USCIS checklist, address/employment/travel/marriage timelines, and the risk/escalation engine.

**Phase 4 — Human review.** Reviewer dashboard, professional-review request flow, assignment workflow, reviewer notes (internal vs. client-visible), client clarification requests, and the admin workflow editor.

**Phase 5 — AI assistant.** American Immigration Guide AI service, explanations, factual summaries, consistency review, prompt versioning, AI audit records, and the client-approval gate on every AI draft.

**Phase 6 — Money & operations.** Test-mode payments, affordable-help pathway, nonprofit routing, manual USCIS case-status module, notifications, privacy-conscious analytics, and the help center.

## Acceptance criteria (full MVP, tracked against `PRODUCT_GUARDRAILS.md`)

1. Account creation works.
2. English/Spanish language selection works.
3. Consent and government non-affiliation acknowledgments are captured.
4. Naturalization journey selection works.
5. Multi-section naturalization questionnaire completes.
6. Answers autosave.
7. Conditional questions work.
8. Private document upload works.
9. Personalized naturalization checklist is generated.
10. Test inconsistencies are detected.
11. Professional-review flags display correctly.
12. Client dashboard shows progress and next steps.
13. Professional-review requests can be submitted.
14. Reviewers can access only assigned matters.
15. Admins can edit workflow questions and rules.
16. Row-Level Security prevents cross-user access.
17. Key activity appears in the audit log.
18. Mobile and desktop layouts both work.
19. The platform clearly identifies as private technology.
20. No implied government affiliation anywhere.
21. No guarantee of immigration approval anywhere.
22. No G-28 is ever generated automatically.
23. No payment ever triggers automatic legal representation.
24. Nothing is ever submitted to USCIS automatically.
25. Code is synchronized to GitHub.
26. Components and branding are centralized and reusable.

Phase 1 status against this list: items 19, 20, 21, 22, 23, 24, 25, 26, and 18 (responsive layout) are satisfied now. Items 1–17 require Phases 2–4 and are scaffolded (routes, tables, RLS) but not feature-complete.

Phase 2 status against this list: items 1–7 are now functionally complete — account creation, language selection, consent capture, naturalization journey selection, the full 28-section questionnaire with autosave and conditional logic, and progress tracking all work end-to-end against a connected Supabase project. Item 8 (document upload) remains Phase 3. Items 9–17 (checklist, flags beyond onboarding urgency screening, reviewer assignment, admin editing) remain Phases 3–4.

## Deferred immigration journeys (require legal review before activation)

T visa, U visa, VAWA, asylum, removal defense/immigration court, waivers, criminal inadmissibility, fraud or misrepresentation, prior removal orders, and other complex humanitarian cases. These require separate legal review, enhanced confidentiality protections, qualified professional approval, and specialized escalation rules before any client-facing activation. They exist today only as inactive "Coming Soon" cards and inactive `immigration_journey_types` rows (`is_active = false`).

## Security dependencies

- Multi-factor authentication (placeholder only in Phase 1's Privacy & Security Center design).
- Identity verification for professional accounts.
- Virus scanning integration for document uploads (schema has a `virus_scan_status` column; no scanner is wired up yet).
- Signed/expiring URL generation must move server-side (Edge Function) before real documents are stored — the anon key alone should never be relied on to gate file access in production.
- Breach-response procedure and data-retention schedule (documented placeholders only).

## Legal-review dependencies

- Every `immigration_workflow_versions`, `checklist_rules`, and `risk_rules` row must go through `draft → legal_review → approved → published` before it can affect a real client, per the schema's `approval_status`/`status` columns.
- Placeholder Privacy Policy, Terms of Use, and Legal Disclaimer pages (Phase 1) must be replaced with attorney-reviewed content before any real client data is processed.
- Naturalization questionnaire content (sections, question text, plain-language explanations) needs qualified legal review before Phase 2 activation, even though the section list itself is scaffolded now.

## Professional-verification requirements

Before any attorney or nonprofit case manager account can access a real client matter: identity verification, bar number, licensing jurisdiction, bar-status confirmation, professional contact information, conflict-check acknowledgment, scope-of-engagement acceptance, and a separate authorization step per matter (`review_assignments` / `representation_engagements`). None of this is satisfied by account creation alone — see `professional_verifications` in the schema, which is admin-write-only.

## Government API limitations

No USCIS or other government system is scraped or called. `case_status_records` is manual-entry only, with a link to the official USCIS case-status page and a placeholder column set aside for a future official API integration once one exists and is authorized.

## Payment dependencies

Stripe integration is structural only in Phase 1 (schema + sample pricing UI, all marked "Sample Pricing — Not Live"). Live payments require: a Stripe account, webhook-driven Edge Function to write `payments`/`refunds` (client can only ever read its own rows), and explicit business sign-off before flipping `is_test_mode` off anywhere.

## Open compliance questions

- What retention period applies to uploaded immigration documents and answers after account closure or matter completion?
- Do any users fall under enhanced protections for VAWA/T/U-visa-related data (8 U.S.C. § 1367) even during the "Coming Soon" phase, e.g. if a client mentions a sensitive situation in a general support ticket?
- What jurisdictions' unauthorized-practice-of-law rules constrain reviewer (non-attorney) language, and does that vary by state?
- What is the escalation SLA for "urgent" flags (detention, court hearing, imminent deadline)?

## Recommended future integrations

- Official USCIS Case Status API, once available and authorized.
- A production virus-scanning service for document uploads.
- SMS/WhatsApp notification providers (Twilio or similar) once email is live.
- An e-signature provider for engagement agreements and G-28 execution.
- Identity-verification provider for professional (attorney) onboarding.

## Recommended exact command for Phase 3

> Phase 2 is complete and functional. Begin Phase 3: build the secure document vault (private storage bucket already migrated in Phase 1), generate the personalized USCIS checklist from `checklist_rules` against a client's confirmed answers, add address/employment/travel/marriage timeline UIs with date-gap and overlap detection, and extend the risk/escalation engine beyond onboarding's urgent-only screening to informational and consistency flags evaluated against full questionnaire answers.
