-- Reference-data seed for local development. Safe to re-run.
-- Does not create any user accounts — demo client sign-up must go
-- through Supabase Auth (see README.md) since auth.users cannot be
-- safely seeded with plain SQL.

insert into public.government_forms (form_number, form_title, agency) values
  ('N-400', 'Application for Naturalization', 'USCIS'),
  ('I-90', 'Application to Replace Permanent Resident Card', 'USCIS'),
  ('I-130', 'Petition for Alien Relative', 'USCIS'),
  ('I-129F', 'Petition for Alien Fiancé(e)', 'USCIS'),
  ('I-765', 'Application for Employment Authorization', 'USCIS'),
  ('I-485', 'Application to Register Permanent Residence or Adjust Status', 'USCIS'),
  ('I-751', 'Petition to Remove Conditions on Residence', 'USCIS')
on conflict (form_number) do nothing;

insert into public.immigration_journey_types (slug, situation_label, description, agency, is_active, sort_order) values
  ('naturalization', 'I Want to Become a U.S. Citizen', 'Prepare information for a United States naturalization application.', 'USCIS', true, 1),
  ('green-card-renewal', 'Renew or Replace a Green Card', 'Prepare to renew or replace a Permanent Resident Card.', 'USCIS', false, 2),
  ('family-petition', 'Petition for a Family Member', 'Start a family-based immigrant petition.', 'USCIS', false, 3),
  ('marriage-green-card', 'Marriage-Based Green Card', 'Prepare information after marrying a U.S. citizen or permanent resident.', 'USCIS', false, 4),
  ('bring-spouse', 'Bring My Spouse to the United States', 'Prepare to petition for a spouse living abroad or in the United States.', 'USCIS', false, 5),
  ('bring-parents', 'Bring My Parents to the United States', 'Prepare to petition for a parent.', 'USCIS', false, 6),
  ('bring-children', 'Bring My Children to the United States', 'Prepare to petition for a child.', 'USCIS', false, 7),
  ('fiance-visa', 'Fiancé Visa', 'Prepare to petition for a fiancé or fiancée living abroad.', 'USCIS', false, 8),
  ('employment-authorization', 'Employment Authorization', 'Renew or apply for permission to work in the United States.', 'USCIS', false, 9),
  ('adjustment-of-status', 'Adjustment of Status', 'Prepare to apply for a green card while remaining in the United States.', 'USCIS', false, 10),
  ('consular-processing', 'Consular Processing', 'Prepare for an immigrant visa interview outside the United States.', 'USCIS', false, 11),
  ('remove-conditions', 'Remove Conditions on Residence', 'Prepare to remove conditions on a two-year conditional green card.', 'USCIS', false, 12),
  ('humanitarian-assistance', 'Humanitarian Immigration Assistance', 'Get connected with humanitarian immigration resources.', 'USCIS', false, 13),
  ('t-visa', 'T Visa Preparation Support', 'Support for trafficking survivors exploring immigration options.', 'USCIS', false, 14),
  ('u-visa', 'U Visa Preparation Support', 'Support for crime victims exploring immigration options.', 'USCIS', false, 15),
  ('vawa', 'VAWA Immigration Assistance', 'Confidential support for survivors of abuse exploring immigration options.', 'USCIS', false, 16),
  ('asylum', 'Asylum Preparation Support', 'Support for people seeking protection in the United States.', 'USCIS', false, 17),
  ('rfe-review', 'Request for Evidence Review', 'Get help understanding a Request for Evidence from USCIS.', 'USCIS', false, 18),
  ('noid-review', 'Notice of Intent to Deny Review', 'Get help understanding a Notice of Intent to Deny from USCIS.', 'USCIS', false, 19),
  ('denial-review', 'USCIS Denial Review', 'Get help understanding a USCIS denial and possible next steps.', 'USCIS', false, 20),
  ('document-review', 'Immigration Document Review', 'Request a review of documents you have already prepared.', 'USCIS', false, 21),
  ('attorney-review', 'Immigration Attorney Review', 'Request review of your application by an immigration attorney.', 'USCIS', false, 22)
on conflict (slug) do nothing;

insert into public.review_products (product_key, product_name, description, sample_price_cents, is_sample_pricing) values
  ('preparation_workspace', 'U.S. Immigration Preparation Workspace', 'Access to the guided questionnaire, document vault, and personalized checklist.', 4900, true),
  ('completeness_review', 'Application Completeness Review', 'A non-legal review of questionnaire completeness and document organization.', 12900, true),
  ('professional_consultation', 'Immigration Professional Consultation', 'A scheduled consultation with a member of our professional network.', 9900, true),
  ('attorney_application_review', 'Attorney Application Review', 'Attorney review of a prepared application package.', 34900, true),
  ('nonprofit_assistance_request', 'Nonprofit Assistance Request', 'Routing to nonprofit or sliding-scale assistance options.', 0, true)
on conflict (product_key) do nothing;

insert into public.organizations (name, organization_type) values
  ('Anaya''s Way Immigration Advocates', 'nonprofit')
on conflict do nothing;
