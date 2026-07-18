-- Naturalization questionnaire content seed (Phase 2).
--
-- Populates one published workflow version for the naturalization
-- journey type, its 28 sections, a real (though intentionally not
-- exhaustive) set of plain-language questions per section, the option
-- lists those questions need, a representative set of conditional
-- rules, and the risk rules behind the onboarding urgency/safety
-- screening. Everything is keyed by natural keys (slugs, section_key,
-- question_key) with `on conflict do nothing` so this file is safe to
-- re-run.
--
-- Run supabase/seed/seed.sql first (it creates the naturalization
-- journey_type and the N-400 government_form this file depends on).

-- 1. Workflow version -------------------------------------------------

insert into public.immigration_workflow_versions
  (journey_type_id, government_form_id, version_label, jurisdiction, effective_date, status, change_summary)
select jt.id, gf.id, 'v1', 'Nationwide', current_date, 'published',
  'Initial Phase 2 naturalization questionnaire content: 28 sections, plain-language questions, and onboarding urgency screening rules.'
from public.immigration_journey_types jt
cross join public.government_forms gf
where jt.slug = 'naturalization' and gf.form_number = 'N-400'
on conflict (journey_type_id, version_label) do nothing;

-- 2. Sections -----------------------------------------------------------

insert into public.questionnaire_sections (workflow_version_id, section_key, title, sort_order)
select wv.id, v.section_key, v.title, v.sort_order
from public.immigration_workflow_versions wv
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  ('identity', 'Your Identity', 1),
  ('other_names', 'Other Names You Have Used', 2),
  ('contact_information', 'Contact Information', 3),
  ('birth_information', 'Birth Information', 4),
  ('green_card_information', 'Green Card Information', 5),
  ('permanent_resident_basis', 'How You Became a Permanent Resident', 6),
  ('addresses', 'Current and Previous Addresses', 7),
  ('employment_school', 'Employment and School History', 8),
  ('travel', 'Travel Outside the United States', 9),
  ('marital_history', 'Marital History', 10),
  ('current_spouse', 'Current Spouse', 11),
  ('former_spouses', 'Former Spouses', 12),
  ('children', 'Children', 13),
  ('taxes', 'Taxes', 14),
  ('selective_service', 'Selective Service', 15),
  ('arrests_court_history', 'Arrests, Citations, Charges, and Court History', 16),
  ('immigration_court_history', 'Immigration Court or Removal History', 17),
  ('previous_applications', 'Previous Immigration Applications', 18),
  ('memberships', 'Memberships and Organizations', 19),
  ('good_moral_character', 'Good Moral Character Questions', 20),
  ('english_civics_screening', 'English and Civics Test Screening', 21),
  ('age_residence_exceptions', 'Age and Residence-Based Test Exceptions', 22),
  ('disability_accommodation', 'Disability Accommodation Screening', 23),
  ('interpreter_information', 'Interpreter Information', 24),
  ('preparer_information', 'Preparer Information', 25),
  ('supporting_documents', 'Supporting Documents', 26),
  ('final_review', 'Final Application Review', 27),
  ('certification', 'User Certification', 28)
) as v(section_key, title, sort_order)
where jt.slug = 'naturalization' and wv.version_label = 'v1'
on conflict (workflow_version_id, section_key) do nothing;

-- 3. Questions ------------------------------------------------------------
-- input_type in ('text','textarea','date','select','multiselect','boolean','file','not_sure')

insert into public.questions (section_id, question_key, prompt_text, plain_language_explanation, input_type, allow_not_sure, sort_order)
select qs.id, v.question_key, v.prompt_text, v.plain_language_explanation, v.input_type, v.allow_not_sure, v.sort_order
from public.questionnaire_sections qs
join public.immigration_workflow_versions wv on wv.id = qs.workflow_version_id
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  -- identity
  ('identity', 'legal_first_name', 'What is your current legal first name?', 'Use the name exactly as it appears on your green card.', 'text', true, 1),
  ('identity', 'legal_middle_name', 'What is your current legal middle name, if you have one?', 'Leave this blank if you do not have a middle name.', 'text', true, 2),
  ('identity', 'legal_last_name', 'What is your current legal last name?', 'Use the name exactly as it appears on your green card.', 'text', true, 3),
  ('identity', 'gender_marker', 'What is your gender?', 'This should match the marker on your Permanent Resident Card.', 'select', true, 4),
  ('identity', 'a_number', 'What is your USCIS A-Number?', 'Your "Alien Registration Number" is an 8- or 9-digit number found on your green card, starting with the letter A.', 'text', true, 5),
  ('identity', 'ssn', 'What is your Social Security number?', 'We use this only to help complete your USCIS forms. It is stored securely and is never shown in full in your activity history.', 'text', true, 6),

  -- other_names
  ('other_names', 'has_used_other_names', 'Have you used any other names since birth?', 'This includes a maiden name, a nickname used on official documents, or a legal name change.', 'boolean', true, 1),
  ('other_names', 'other_names_list', 'List the other names you have used.', 'Include roughly when each name was used, if you remember.', 'textarea', true, 2),

  -- contact_information
  ('contact_information', 'daytime_phone', 'What is a daytime phone number where we can reach you?', 'This can be a mobile or home number.', 'text', true, 1),
  ('contact_information', 'email_address', 'What is your email address?', 'We will use this for save-and-return links and important updates.', 'text', true, 2),
  ('contact_information', 'preferred_contact_method', 'How do you prefer to be contacted?', 'You can change this later in your account settings.', 'select', true, 3),

  -- birth_information
  ('birth_information', 'date_of_birth', 'What is your date of birth?', 'Use the date of birth on your green card or birth certificate.', 'date', true, 1),
  ('birth_information', 'country_of_birth', 'What country were you born in?', 'Use the name of the country as it is known today.', 'text', true, 2),
  ('birth_information', 'city_state_of_birth', 'What city and state or province were you born in?', 'If you are not sure of the exact city, your best answer is fine — you can flag it as "not sure."', 'text', true, 3),

  -- green_card_information
  ('green_card_information', 'green_card_number', 'What is your Permanent Resident Card number?', 'This is printed on the front of your green card.', 'text', true, 1),
  ('green_card_information', 'date_became_permanent_resident', 'What date did you become a permanent resident?', 'This is the "resident since" date printed on your green card.', 'date', true, 2),
  ('green_card_information', 'green_card_expiration_date', 'What is the expiration date on your current green card?', 'This helps us flag if you may also need to renew your card.', 'date', true, 3),

  -- permanent_resident_basis
  ('permanent_resident_basis', 'basis_of_green_card', 'How did you become a permanent resident?', 'Choose the option that best matches how your green card was granted.', 'select', true, 1),
  ('permanent_resident_basis', 'basis_explanation', 'Please describe how you became a permanent resident.', 'A brief description is fine — a reviewer can help clarify details later.', 'textarea', true, 2),

  -- addresses
  ('addresses', 'current_street_address', 'What is your current home street address?', 'Use the address where you currently live, not a P.O. box.', 'text', true, 1),
  ('addresses', 'current_city_state_zip', 'What city, state, and ZIP code do you currently live in?', null, 'text', true, 2),
  ('addresses', 'date_moved_to_current_address', 'When did you move to this address?', 'Your best estimate is fine if you do not remember the exact date.', 'date', true, 3),
  ('addresses', 'previous_addresses_5_years', 'List any other addresses where you have lived in the last 5 years.', 'Include approximate dates for each address. A detailed address timeline builder is coming in a later update — for now, a list is fine.', 'textarea', true, 4),

  -- employment_school
  ('employment_school', 'current_employer_or_school', 'Who is your current employer, or what school do you attend?', 'If you are not currently working or in school, tell us what you are doing instead.', 'text', true, 1),
  ('employment_school', 'occupation', 'What is your occupation or field of study?', null, 'text', true, 2),
  ('employment_school', 'employment_start_date', 'When did you start this job or program?', null, 'date', true, 3),
  ('employment_school', 'previous_employers_5_years', 'List your employers or schools for the last 5 years.', 'Include approximate start and end dates for each. A detailed timeline builder is coming in a later update.', 'textarea', true, 4),

  -- travel
  ('travel', 'has_traveled_outside_us', 'Have you taken any trips outside the United States since becoming a permanent resident?', 'This includes short trips, not just long ones.', 'boolean', true, 1),
  ('travel', 'trips_list', 'List your trips outside the United States.', 'Include the destination and approximate departure and return dates for each trip.', 'textarea', true, 2),
  ('travel', 'longest_trip_duration', 'About how long was your longest trip outside the United States?', 'Extended trips can affect a naturalization application, so this helps us flag anything that may need a closer look.', 'select', true, 3),

  -- marital_history
  ('marital_history', 'current_marital_status', 'What is your current marital status?', null, 'select', true, 1),
  ('marital_history', 'number_of_times_married', 'How many times have you been married, including your current marriage if applicable?', null, 'select', true, 2),

  -- current_spouse
  ('current_spouse', 'spouse_full_name', 'What is your spouse''s full legal name?', null, 'text', true, 1),
  ('current_spouse', 'spouse_date_of_birth', 'What is your spouse''s date of birth?', null, 'date', true, 2),
  ('current_spouse', 'spouse_citizenship_status', 'What is your spouse''s immigration or citizenship status?', null, 'select', true, 3),
  ('current_spouse', 'marriage_date', 'What date did you get married?', null, 'date', true, 4),
  ('current_spouse', 'marriage_location', 'Where did you get married?', 'City and country is fine.', 'text', true, 5),

  -- former_spouses
  ('former_spouses', 'former_spouse_names', 'What are the full names of your former spouses?', 'List each one, in order.', 'textarea', true, 1),
  ('former_spouses', 'marriage_end_dates', 'When did each of those marriages end?', 'Approximate dates are fine.', 'textarea', true, 2),
  ('former_spouses', 'marriage_end_reason', 'How did your most recent former marriage end?', null, 'select', true, 3),

  -- children
  ('children', 'has_children', 'Do you have any children?', 'This includes biological, adopted, and stepchildren, regardless of their age or where they live.', 'boolean', true, 1),
  ('children', 'number_of_children', 'How many children do you have?', null, 'select', true, 2),
  ('children', 'children_list', 'List each child''s full name, date of birth, and current country of residence.', null, 'textarea', true, 3),

  -- taxes
  ('taxes', 'filed_us_taxes_every_year', 'Have you filed U.S. federal income taxes every year you were required to?', 'It is common to have a gap — select "No" if you are not sure this is complete, and we can flag it for a closer look.', 'boolean', true, 1),
  ('taxes', 'tax_filing_gap_explanation', 'Please describe the years you did not file, and why.', null, 'textarea', true, 2),
  ('taxes', 'owes_back_taxes', 'Do you currently owe back taxes to the IRS or a state tax authority?', 'Having a payment plan in place is common and is not automatically a problem.', 'boolean', true, 3),
  ('taxes', 'back_taxes_explanation', 'Please describe the situation, including whether you have a payment plan.', null, 'textarea', true, 4),

  -- selective_service
  ('selective_service', 'registered_with_selective_service', 'Did you register with the Selective Service?', 'This generally applies to males who lived in the United States between ages 18 and 26. Select "Not Applicable" if this never applied to you.', 'select', true, 1),
  ('selective_service', 'selective_service_number', 'What is your Selective Service registration number?', 'This is optional if you do not have it on hand — a reviewer can help you look it up.', 'text', true, 2),

  -- arrests_court_history
  ('arrests_court_history', 'has_been_arrested_cited_detained', 'Have you ever been arrested, cited, or detained by any law enforcement officer?', 'This includes many incidents, even when charges were dismissed, records were sealed, or you were told the matter would not appear on your record. Select "I''m not sure" when you need help reviewing what happened.', 'boolean', true, 1),
  ('arrests_court_history', 'arrest_details', 'Please describe what happened, including approximate dates and the outcome.', 'Do your best — a reviewer can help you gather court records afterward.', 'textarea', true, 2),

  -- immigration_court_history
  ('immigration_court_history', 'has_been_in_removal_proceedings', 'Have you ever been in immigration court or removal (deportation) proceedings?', null, 'boolean', true, 1),
  ('immigration_court_history', 'removal_case_details', 'Please describe the proceedings, including approximate dates and the outcome.', null, 'textarea', true, 2),

  -- previous_applications
  ('previous_applications', 'has_filed_previous_uscis_applications', 'Have you filed any other applications or petitions with USCIS before?', 'This includes prior green card renewals, work permits, or other immigration benefit requests.', 'boolean', true, 1),
  ('previous_applications', 'previous_applications_list', 'List the applications you filed and, if you know it, the outcome.', null, 'textarea', true, 2),

  -- memberships
  ('memberships', 'has_been_member_of_organization', 'Have you ever been a member of, or associated with, any organization, association, or club?', 'This includes professional, social, and community organizations — it does not need to be anything unusual.', 'boolean', true, 1),
  ('memberships', 'organizations_list', 'List the organizations and roughly when you were involved.', null, 'textarea', true, 2),

  -- good_moral_character
  ('good_moral_character', 'has_helped_persecute_others', 'Have you ever been involved in persecuting any person because of their race, religion, national origin, political opinion, or membership in a particular social group?', null, 'boolean', true, 1),
  ('good_moral_character', 'has_provided_false_info_to_government', 'Have you ever given false or misleading information to a U.S. government official?', null, 'boolean', true, 2),
  ('good_moral_character', 'has_claimed_us_citizenship_falsely', 'Have you ever claimed to be a U.S. citizen, in writing or any other way?', 'This question matters even if you no longer remember the exact details — select "I''m not sure" if you need help thinking it through.', 'boolean', true, 3),
  ('good_moral_character', 'additional_gmc_explanation', 'Is there anything else about your background you think a reviewer should know before you file?', 'This is optional, but it helps us flag anything that may need professional review before filing.', 'textarea', true, 4),

  -- english_civics_screening
  ('english_civics_screening', 'comfortable_with_english_interview', 'Are you comfortable being interviewed in English?', 'If not, you may want to prepare for the English and civics portions of your interview, or ask about an exception.', 'boolean', true, 1),
  ('english_civics_screening', 'needs_civics_test_help', 'Would you like help preparing for the civics test?', null, 'boolean', true, 2),

  -- age_residence_exceptions
  ('age_residence_exceptions', 'age_at_filing', 'What is your age range?', 'Some age and residence combinations qualify for English/civics test exceptions.', 'select', true, 1),
  ('age_residence_exceptions', 'years_as_permanent_resident', 'About how many years have you been a permanent resident?', null, 'select', true, 2),

  -- disability_accommodation
  ('disability_accommodation', 'has_disability_needing_accommodation', 'Do you have a disability that may require an accommodation during your naturalization process?', 'This could include an accommodation for the interview, the test, or the oath ceremony.', 'boolean', true, 1),
  ('disability_accommodation', 'accommodation_details', 'Please describe the accommodation you may need.', null, 'textarea', true, 2),

  -- interpreter_information
  ('interpreter_information', 'needs_interpreter', 'Will you need an interpreter?', null, 'boolean', true, 1),
  ('interpreter_information', 'interpreter_language', 'What language do you need an interpreter for?', null, 'text', true, 2),

  -- preparer_information
  ('preparer_information', 'had_help_preparing_application', 'Is anyone helping you prepare this application besides yourself?', 'This includes a family member, friend, or preparer, in addition to any professional review you request through this platform.', 'boolean', true, 1),
  ('preparer_information', 'preparer_name_and_relationship', 'What is that person''s name and their relationship to you?', null, 'text', true, 2),

  -- supporting_documents
  ('supporting_documents', 'reviewed_document_checklist', 'Have you reviewed your personalized document checklist?', 'You can upload and organize your supporting documents in your secure document workspace.', 'boolean', true, 1),

  -- final_review
  ('final_review', 'reviewed_all_answers', 'Have you reviewed all of your answers for accuracy?', 'Take a moment to look back over each section before certifying your application.', 'boolean', true, 1),
  ('final_review', 'additional_comments', 'Is there anything else you would like a reviewer to know?', 'This is optional.', 'textarea', true, 2),

  -- certification
  ('certification', 'certify_information_true', 'Do you certify that the information you provided is true and correct to the best of your knowledge?', 'This certification matters — please make sure every answer is accurate before confirming.', 'boolean', false, 1),
  ('certification', 'electronic_signature_full_name', 'Please type your full legal name as your electronic signature.', null, 'text', false, 2)
) as v(section_key, question_key, prompt_text, plain_language_explanation, input_type, allow_not_sure, sort_order)
where jt.slug = 'naturalization' and wv.version_label = 'v1' and qs.section_key = v.section_key
on conflict (section_id, question_key) do nothing;

-- 4. Question options -----------------------------------------------------

insert into public.question_options (question_id, option_value, option_label, sort_order)
select q.id, v.option_value, v.option_label, v.sort_order
from public.questions q
join public.questionnaire_sections qs on qs.id = q.section_id
join public.immigration_workflow_versions wv on wv.id = qs.workflow_version_id
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  ('gender_marker', 'Male', 'Male', 1),
  ('gender_marker', 'Female', 'Female', 2),

  ('preferred_contact_method', 'Email', 'Email', 1),
  ('preferred_contact_method', 'Phone', 'Phone', 2),
  ('preferred_contact_method', 'Mail', 'Mail', 3),

  ('basis_of_green_card', 'Family-based', 'Sponsored by a family member', 1),
  ('basis_of_green_card', 'Employment-based', 'Sponsored by an employer', 2),
  ('basis_of_green_card', 'Asylum or refugee status', 'Granted asylum or refugee status', 3),
  ('basis_of_green_card', 'Diversity Visa Lottery', 'Diversity Visa (DV) Lottery', 4),
  ('basis_of_green_card', 'Other', 'Something else', 5),

  ('longest_trip_duration', 'Less than 1 month', 'Less than 1 month', 1),
  ('longest_trip_duration', '1-6 months', '1 to 6 months', 2),
  ('longest_trip_duration', '6-12 months', '6 months to 1 year', 3),
  ('longest_trip_duration', 'More than 12 months', 'More than 1 year', 4),

  ('current_marital_status', 'Single', 'Single, never married', 1),
  ('current_marital_status', 'Married', 'Married', 2),
  ('current_marital_status', 'Divorced', 'Divorced', 3),
  ('current_marital_status', 'Widowed', 'Widowed', 4),
  ('current_marital_status', 'Separated', 'Separated', 5),

  ('number_of_times_married', '1', 'Once', 1),
  ('number_of_times_married', '2', 'Twice', 2),
  ('number_of_times_married', '3', 'Three times', 3),
  ('number_of_times_married', '4+', 'Four or more times', 4),

  ('spouse_citizenship_status', 'U.S. Citizen', 'U.S. Citizen', 1),
  ('spouse_citizenship_status', 'Permanent Resident', 'Permanent Resident (green card holder)', 2),
  ('spouse_citizenship_status', 'Neither', 'Neither', 3),

  ('marriage_end_reason', 'Divorce', 'Divorce', 1),
  ('marriage_end_reason', 'Death', 'Death of spouse', 2),
  ('marriage_end_reason', 'Annulment', 'Annulment', 3),

  ('number_of_children', '1', '1', 1),
  ('number_of_children', '2', '2', 2),
  ('number_of_children', '3', '3', 3),
  ('number_of_children', '4+', '4 or more', 4),

  ('registered_with_selective_service', 'Yes', 'Yes', 1),
  ('registered_with_selective_service', 'No', 'No', 2),
  ('registered_with_selective_service', 'Not Applicable', 'Not applicable to me', 3),

  ('age_at_filing', 'Under 50', 'Under 50', 1),
  ('age_at_filing', '50-55', '50 to 55', 2),
  ('age_at_filing', '55-65', '55 to 65', 3),
  ('age_at_filing', '65+', '65 or older', 4),

  ('years_as_permanent_resident', 'Less than 3', 'Less than 3 years', 1),
  ('years_as_permanent_resident', '3-5', '3 to 5 years', 2),
  ('years_as_permanent_resident', '5+', '5 or more years', 3)
) as v(question_key, option_value, option_label, sort_order)
where jt.slug = 'naturalization' and wv.version_label = 'v1' and q.question_key = v.question_key
on conflict do nothing;

-- 5. Conditional rules ------------------------------------------------------

insert into public.conditional_rules (question_id, depends_on_question_id, condition_operator, condition_value)
select q.id, dq.id, v.condition_operator, v.condition_value
from public.immigration_workflow_versions wv
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  ('other_names_list', 'has_used_other_names', 'equals', 'true'),
  ('basis_explanation', 'basis_of_green_card', 'equals', 'Other'),
  ('trips_list', 'has_traveled_outside_us', 'equals', 'true'),
  ('longest_trip_duration', 'has_traveled_outside_us', 'equals', 'true'),
  ('spouse_full_name', 'current_marital_status', 'equals', 'Married'),
  ('spouse_date_of_birth', 'current_marital_status', 'equals', 'Married'),
  ('spouse_citizenship_status', 'current_marital_status', 'equals', 'Married'),
  ('marriage_date', 'current_marital_status', 'equals', 'Married'),
  ('marriage_location', 'current_marital_status', 'equals', 'Married'),
  ('former_spouse_names', 'number_of_times_married', 'not_equals', '1'),
  ('marriage_end_dates', 'number_of_times_married', 'not_equals', '1'),
  ('marriage_end_reason', 'number_of_times_married', 'not_equals', '1'),
  ('number_of_children', 'has_children', 'equals', 'true'),
  ('children_list', 'has_children', 'equals', 'true'),
  ('tax_filing_gap_explanation', 'filed_us_taxes_every_year', 'equals', 'false'),
  ('back_taxes_explanation', 'owes_back_taxes', 'equals', 'true'),
  ('selective_service_number', 'registered_with_selective_service', 'equals', 'Yes'),
  ('arrest_details', 'has_been_arrested_cited_detained', 'equals', 'true'),
  ('removal_case_details', 'has_been_in_removal_proceedings', 'equals', 'true'),
  ('previous_applications_list', 'has_filed_previous_uscis_applications', 'equals', 'true'),
  ('organizations_list', 'has_been_member_of_organization', 'equals', 'true'),
  ('accommodation_details', 'has_disability_needing_accommodation', 'equals', 'true'),
  ('interpreter_language', 'needs_interpreter', 'equals', 'true'),
  ('preparer_name_and_relationship', 'had_help_preparing_application', 'equals', 'true')
) as v(question_key, depends_on_key, condition_operator, condition_value)
join public.questionnaire_sections qs on qs.workflow_version_id = wv.id
join public.questions q on q.section_id = qs.id and q.question_key = v.question_key
join public.questionnaire_sections dqs on dqs.workflow_version_id = wv.id
join public.questions dq on dq.section_id = dqs.id and dq.question_key = v.depends_on_key
where jt.slug = 'naturalization' and wv.version_label = 'v1'
on conflict do nothing;

-- 6. Urgency/safety screening risk rules (Onboarding Step 5) ---------------

insert into public.risk_rules (workflow_version_id, rule_key, flag_category, flag_label, explanation_template, approval_status, last_reviewed_at)
select wv.id, v.rule_key, v.flag_category, v.flag_label, v.explanation_template, 'published', now()
from public.immigration_workflow_versions wv
join public.immigration_journey_types jt on jt.id = wv.journey_type_id
cross join (values
  ('currently_detained', 'urgent', 'Currently in Immigration Detention', 'You indicated that you are currently detained by immigration authorities. Your situation may require prompt attention from a qualified immigration professional.'),
  ('immigration_court_hearing', 'urgent', 'Upcoming Immigration Court Hearing', 'You indicated that you have an upcoming immigration court hearing. Do not rely only on this platform for a court matter or legal strategy.'),
  ('deadline_within_30_days', 'urgent', 'USCIS Deadline Within 30 Days', 'You indicated that you have a USCIS deadline within 30 days. Professional review is recommended given the short timeline.'),
  ('received_rfe', 'urgent', 'Received a Request for Evidence', 'You indicated that you received a Request for Evidence (RFE) from USCIS. RFE responses have strict deadlines — professional review is recommended.'),
  ('received_noid', 'urgent', 'Received a Notice of Intent to Deny', 'You indicated that you received a Notice of Intent to Deny (NOID). NOID responses have strict deadlines — professional review is recommended.'),
  ('received_denial', 'urgent', 'Received a Denial', 'You indicated that you received a denial from USCIS. Professional review is recommended before deciding on next steps.'),
  ('received_nta', 'urgent', 'Received a Notice to Appear', 'You indicated that you received a Notice to Appear (NTA). This places you in immigration court proceedings, which this platform does not handle — prompt professional review is strongly recommended.'),
  ('prior_removal_order', 'urgent', 'Prior Removal Order', 'You indicated that you have a prior removal order. This significantly affects a naturalization application — professional review is strongly recommended before proceeding.'),
  ('safety_concern', 'urgent', 'Immediate Safety Concern', 'You indicated an immediate safety concern. If you are in danger, please contact local emergency services. A qualified professional can also help with immigration-related safety concerns.'),
  ('needs_interpreter', 'informational', 'Interpreter Requested', 'You indicated that you will need an interpreter. We will keep this preference with your journey.'),
  ('needs_disability_accommodation', 'informational', 'Disability Accommodation Requested', 'You indicated that you may need a disability accommodation. We will keep this preference with your journey.')
) as v(rule_key, flag_category, flag_label, explanation_template)
where jt.slug = 'naturalization' and wv.version_label = 'v1'
on conflict (workflow_version_id, rule_key) do nothing;

-- 7. Urgent review product --------------------------------------------------

insert into public.review_products (product_key, product_name, description, sample_price_cents, is_sample_pricing)
values (
  'urgent_review',
  'Urgent Immigration Review Request',
  'Triage request submitted from the onboarding urgency/safety screening. Routed for prompt professional attention.',
  0,
  true
)
on conflict (product_key) do nothing;
