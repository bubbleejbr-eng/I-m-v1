-- Naturalization document categories, checklist rules, and extended
-- risk rules (Phase 3).
--
-- Depends on supabase/seed/seed.sql and
-- supabase/seed/naturalization_content_seed.sql having already run
-- (needs the naturalization journey_type, its published workflow
-- version, and its questions). Safe to re-run — everything is keyed by
-- natural keys with `on conflict do nothing`.

-- 1. Document categories -----------------------------------------------

insert into public.document_categories (journey_type_id, category_key, category_label, sort_order)
select jt.id, v.category_key, v.category_label, v.sort_order
from public.immigration_journey_types jt
cross join (values
  ('green_card_front', 'Green Card, Front', 1),
  ('green_card_back', 'Green Card, Back', 2),
  ('current_passport', 'Current Passport', 3),
  ('expired_passport', 'Expired Passport', 4),
  ('state_identification', 'State Identification', 5),
  ('marriage_certificate', 'Marriage Certificate', 6),
  ('divorce_decree', 'Divorce Decree', 7),
  ('spouse_citizenship_proof', 'Spouse''s Proof of U.S. Citizenship', 8),
  ('tax_transcript', 'Tax Transcript', 9),
  ('irs_payment_agreement', 'IRS Payment Agreement', 10),
  ('selective_service_record', 'Selective Service Record', 11),
  ('child_support_evidence', 'Child-Support Evidence', 12),
  ('court_disposition', 'Court Disposition', 13),
  ('arrest_record', 'Arrest Record', 14),
  ('police_record', 'Police Record', 15),
  ('travel_evidence', 'Travel Evidence', 16),
  ('employment_record', 'Employment Record', 17),
  ('school_record', 'School Record', 18),
  ('legal_name_change_document', 'Legal Name-Change Document', 19),
  ('disability_accommodation_documentation', 'Disability Accommodation Documentation', 20),
  ('prior_uscis_filing', 'Prior USCIS Filing', 21),
  ('uscis_notice', 'USCIS Notice', 22),
  ('immigration_court_document', 'Immigration Court Document', 23),
  ('other_supporting_evidence', 'Other Supporting Evidence', 24)
) as v(category_key, category_label, sort_order)
where jt.slug = 'naturalization'
on conflict (journey_type_id, category_key) do nothing;

-- 2. Checklist rules ------------------------------------------------------
-- condition_expression is null for items shown to every client, or
-- {"question_key": "...", "operator": "equals"|"not_equals", "value": ...}
-- for items generated only when the client's answer matches.

insert into public.checklist_rules (
  workflow_version_id, document_category_id, rule_key, document_name,
  plain_language_explanation, requirement_level, condition_expression,
  approval_status, last_reviewed_at
)
select
  wv.id, dc.id, v.rule_key, dc.category_label, v.explanation, v.requirement_level,
  v.condition_expression::jsonb, 'published', now()
from public.immigration_workflow_versions wv
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
join public.document_categories dc on dc.journey_type_id = jt.id
cross join (values
  ('green_card_front', 'green_card_front_rule', 'Shows your permanent resident status and A-Number.', 'generally_requested', null),
  ('green_card_back', 'green_card_back_rule', 'Confirms your green card is current and unexpired.', 'generally_requested', null),
  ('current_passport', 'current_passport_rule', 'Used to confirm identity and travel history.', 'generally_requested', null),
  ('expired_passport', 'expired_passport_rule', 'If you have one, it can help confirm past travel dates.', 'conditional', null),
  ('state_identification', 'state_id_rule', 'A state driver''s license or ID card can help confirm your address history.', 'recommended', null),
  ('marriage_certificate', 'marriage_certificate_rule', 'Required if you are including marital history in your application.', 'conditional', '{"question_key":"current_marital_status","operator":"equals","value":"Married"}'),
  ('divorce_decree', 'divorce_decree_rule', 'Required if a previous marriage ended in divorce.', 'conditional', '{"question_key":"current_marital_status","operator":"equals","value":"Divorced"}'),
  ('spouse_citizenship_proof', 'spouse_citizenship_rule', 'Helps confirm your spouse''s citizenship status.', 'conditional', '{"question_key":"spouse_citizenship_status","operator":"equals","value":"U.S. Citizen"}'),
  ('tax_transcript', 'tax_transcript_rule', 'Shows your U.S. federal tax filing history.', 'generally_requested', null),
  ('irs_payment_agreement', 'irs_payment_rule', 'If you owe back taxes, this shows you have an active payment plan.', 'conditional', '{"question_key":"owes_back_taxes","operator":"equals","value":true}'),
  ('selective_service_record', 'selective_service_rule', 'Confirms your Selective Service registration status.', 'conditional', '{"question_key":"registered_with_selective_service","operator":"equals","value":"Yes"}'),
  ('child_support_evidence', 'child_support_rule', 'If applicable, shows your child-support payment history.', 'conditional', null),
  ('court_disposition', 'court_disposition_rule', 'The official outcome of any arrest, citation, or charge is generally requested for professional review.', 'professional_review_item', '{"question_key":"has_been_arrested_cited_detained","operator":"equals","value":true}'),
  ('arrest_record', 'arrest_record_rule', 'Official arrest records help a reviewer assess your situation accurately.', 'professional_review_item', '{"question_key":"has_been_arrested_cited_detained","operator":"equals","value":true}'),
  ('police_record', 'police_record_rule', 'A police clearance or incident report can help clarify your history.', 'professional_review_item', '{"question_key":"has_been_arrested_cited_detained","operator":"equals","value":true}'),
  ('travel_evidence', 'travel_evidence_rule', 'Boarding passes or stamped passport pages can help confirm your travel history.', 'recommended', null),
  ('employment_record', 'employment_record_rule', 'Pay stubs or offer letters can help confirm your employment history.', 'recommended', null),
  ('school_record', 'school_record_rule', 'Transcripts or enrollment letters can help confirm your school history.', 'recommended', null),
  ('legal_name_change_document', 'name_change_rule', 'Required if you have legally changed your name.', 'conditional', '{"question_key":"has_used_other_names","operator":"equals","value":true}'),
  ('disability_accommodation_documentation', 'disability_doc_rule', 'Supports a request for a disability accommodation during your process.', 'conditional', '{"question_key":"has_disability_needing_accommodation","operator":"equals","value":true}'),
  ('prior_uscis_filing', 'prior_filing_rule', 'Copies of prior USCIS filings can help a reviewer see your full history.', 'recommended', null),
  ('uscis_notice', 'uscis_notice_rule', 'If you received any notice from USCIS, please add a copy here.', 'conditional', null),
  ('immigration_court_document', 'court_document_rule', 'Documents from any immigration court proceedings are generally requested for professional review.', 'professional_review_item', '{"question_key":"has_been_in_removal_proceedings","operator":"equals","value":true}'),
  ('other_supporting_evidence', 'other_evidence_rule', 'Anything else you think may support your application.', 'recommended', null)
) as v(category_key, rule_key, explanation, requirement_level, condition_expression)
where jt.slug = 'naturalization' and wv.version_label = 'v1' and dc.category_key = v.category_key
on conflict (workflow_version_id, rule_key) do nothing;

-- 3. Extended risk rules (beyond onboarding's urgent-only screening) -----

insert into public.risk_rules (workflow_version_id, rule_key, flag_category, flag_label, explanation_template, condition_expression, approval_status, last_reviewed_at)
select wv.id, v.rule_key, v.flag_category, v.flag_label, v.explanation_template, v.condition_expression::jsonb, 'published', now()
from public.immigration_workflow_versions wv
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  ('arrest_history', 'professional_review_recommended', 'Arrest, Citation, or Detention',
   'You indicated a prior arrest, citation, or detention. Professional immigration review is recommended before filing.',
   '{"question_key":"has_been_arrested_cited_detained","operator":"equals","value":true}'),
  ('removal_proceedings_history', 'professional_review_recommended', 'Immigration Court or Removal History',
   'You indicated prior immigration court or removal proceedings. Professional review is recommended before filing.',
   '{"question_key":"has_been_in_removal_proceedings","operator":"equals","value":true}'),
  ('back_taxes_owed', 'professional_review_recommended', 'Unpaid Taxes',
   'You indicated you currently owe back taxes. Professional review is recommended to address this before filing.',
   '{"question_key":"owes_back_taxes","operator":"equals","value":true}'),
  ('tax_filing_gap', 'professional_review_recommended', 'Tax Filing Gap',
   'You indicated a gap in your U.S. tax filing history. Professional review is recommended before filing.',
   '{"question_key":"filed_us_taxes_every_year","operator":"equals","value":false}'),
  ('extended_trip', 'professional_review_recommended', 'Extended Trip Outside the United States',
   'You indicated a trip outside the United States lasting 6 months or more. Extended travel can affect a naturalization application. Professional immigration review is recommended before filing.',
   '{"question_key":"longest_trip_duration","operator":"includes","value":["6-12 months","More than 12 months"]}'),
  ('possible_false_citizenship_claim', 'professional_review_recommended', 'Possible False Claim to U.S. Citizenship',
   'You indicated a possible false claim to U.S. citizenship. This significantly affects a naturalization application — professional review is strongly recommended.',
   '{"question_key":"has_claimed_us_citizenship_falsely","operator":"equals","value":true}'),
  ('false_info_to_government', 'professional_review_recommended', 'Information Given to a Government Official',
   'You indicated giving false or misleading information to a government official. Professional review is recommended before filing.',
   '{"question_key":"has_provided_false_info_to_government","operator":"equals","value":true}'),
  ('persecution_involvement', 'professional_review_recommended', 'Possible Involvement in Persecution',
   'You indicated possible involvement in persecuting others. Professional review is required before filing.',
   '{"question_key":"has_helped_persecute_others","operator":"equals","value":true}'),
  ('complex_marital_history', 'professional_review_recommended', 'Complex Marital History',
   'Your marital history includes three or more marriages. Professional review is recommended to ensure consistency across your application.',
   '{"question_key":"number_of_times_married","operator":"includes","value":["3","4+"]}'),
  ('english_interview_concern', 'informational', 'English Interview Preparation',
   'You indicated you may not be comfortable being interviewed in English. Consider preparing for the English and civics portions of your interview, or review possible exceptions.',
   '{"question_key":"comfortable_with_english_interview","operator":"equals","value":false}'),
  ('selective_service_not_registered', 'informational', 'Selective Service Registration',
   'You indicated you did not register with the Selective Service. This may need to be addressed depending on your circumstances — professional review can help clarify.',
   '{"question_key":"registered_with_selective_service","operator":"equals","value":"No"}'),
  ('address_history_gap', 'consistency', 'Address History Gap',
   'We found a gap of more than 30 days between two of your addresses. Please review your address history for accuracy, or add the missing period.',
   null),
  ('employment_history_gap', 'consistency', 'Employment or School History Gap',
   'We found a gap of more than 30 days between two of your jobs or schools. Please review your employment and school history for accuracy, or add the missing period.',
   null),
  ('travel_dates_overlap', 'consistency', 'Overlapping Travel Dates',
   'Two of your trips outside the United States appear to overlap in dates. Please review your travel history for accuracy.',
   null)
) as v(rule_key, flag_category, flag_label, explanation_template, condition_expression)
where jt.slug = 'naturalization' and wv.version_label = 'v1'
on conflict (workflow_version_id, rule_key) do nothing;
