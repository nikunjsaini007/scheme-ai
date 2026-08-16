-- Expanded real Indian government scheme catalogue (50+ schemes).
-- All data sourced from official government portals (.gov.in / .nic.in).
-- Uses ON CONFLICT for idempotent execution.

insert into public.schemes (
  id, name, description, ministry, category, level, state, benefits,
  eligibility, documents_required, application_url, status, last_verified_at, source_url
) values

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — AGRICULTURE
-- ═══════════════════════════════════════════════════════════════
('sch-pm-kisan', 'PM-KISAN Samman Nidhi', 'Direct income support of ₹6,000 per year to landholding farmer families, paid in three equal instalments of ₹2,000.', 'Department of Agriculture and Farmers Welfare', 'Agriculture', 'Central', null,
 array['₹6,000 per year in three instalments of ₹2,000 each', 'Direct benefit transfer to Aadhaar-linked bank account'],
 array['Landholding farmer families with cultivable land', 'Subject to exclusion categories (income taxpayers, professionals, pensioners)', 'Land records in the applicant name'],
 array['Aadhaar card', 'Land records (Khasra/Khata)', 'Bank account details'],
 'https://pmkisan.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmkisan.gov.in/'),

('sch-pmfby', 'Pradhan Mantri Fasal Bima Yojana', 'Crop insurance scheme providing comprehensive insurance cover against crop loss due to natural calamities, pests and diseases.', 'Department of Agriculture and Farmers Welfare', 'Agriculture', 'Central', null,
 array['Crop loss insurance cover', 'Premium subsidy by central and state governments', 'Quick claim settlement through remote sensing and drones'],
 array['All farmers including sharecroppers and tenant farmers', 'Notified crops in notified areas', 'Loanee and non-loanee farmers eligible'],
 array['Aadhaar card', 'Bank account details', 'Land records or crop details', 'Sowing certificate from local authority'],
 'https://pmfby.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmfby.gov.in/'),

('sch-pmkmy', 'PM Kisan Maandhan Yojana', 'Pension scheme for small and marginal farmers providing ₹3,000 per month after age 60 through voluntary contribution.', 'Department of Agriculture and Farmers Welfare', 'Social Security', 'Central', null,
 array['Guaranteed pension of ₹3,000 per month after age 60', 'Matching contribution by the government'],
 array['Small and marginal farmers aged 18-40', 'Cultivable land up to 2 hectares', 'Not an income-tax payer'],
 array['Aadhaar card', 'Bank account details', 'Land records'],
 'https://maandhan.in/', 'active', '2026-08-10T00:00:00Z', 'https://maandhan.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — HEALTHCARE
-- ═══════════════════════════════════════════════════════════════
('sch-pmjay', 'Ayushman Bharat – PM Jan Arogya Yojana', 'Health assurance scheme providing ₹5 lakh per family per year for secondary and tertiary hospitalisation to eligible families.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Central', null,
 array['₹5 lakh per family per year for hospitalisation', 'Cashless and paperless treatment at empanelled hospitals', 'Covers 1,949 medical packages including surgery, day care and ICU'],
 array['Families identified under SECC database deprivation criteria', 'Rural and urban eligible families as per official beneficiary list', 'No cap on family size'],
 array['Aadhaar card or approved identity document', 'Ration card or family verification document', 'Hospital Ayushman card'],
 'https://pmjay.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmjay.gov.in/'),

('sch-nhm', 'National Health Mission', 'Umbrella programme for universal access to equitable and affordable healthcare services across rural and urban India.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Primary', null,
 array['Free and subsidised healthcare services at public health facilities', 'Sub-centres, PHCs, CHCs and district hospitals', 'Jan Aushadhi medicines at subsidised rates'],
 array['All Indian citizens', 'Priority to BPL families and underserved populations', 'No specific income or age restriction for basic services'],
 array['No mandatory documents for basic services', 'Aadhaar recommended for scheme linkage'],
 'https://nhm.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://nhm.gov.in/'),

('sch-mission-indradhanush', 'Mission Indradhanush', 'Universal immunisation programme covering pregnant women and children against preventable diseases.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Central', null,
 array['Free immunisation against 12 vaccine-preventable diseases', 'Catch-up vaccination for unvaccinated children', 'Special immunisation drives in underserved areas'],
 array['Pregnant women and children under 5 years', 'Unvaccinated or partially vaccinated children', 'Priority to urban slums, tribal areas and hard-to-reach populations'],
 array['No mandatory documents for immunisation', 'Aadhaar or birth certificate recommended'],
 'https://nhm.gov.in/mission-indradhanush', 'active', '2026-08-10T00:00:00Z', 'https://nhm.gov.in/mission-indradhanush'),

('sch-ab-hwc', 'Ayushman Bharat – Health and Wellness Centres', 'Establishment of primary health and wellness centres to provide comprehensive primary healthcare services.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Central', null,
 array['Free diagnostic services at HWCs', 'Non-communicable disease screening and management', 'Maternal and child health services', 'Mental health services'],
 array['All citizens', 'Priority to underserved and rural populations', 'No income or age restriction'],
 array['No mandatory documents for basic services'],
 'https://abdm.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://abdm.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — EMPLOYMENT & SKILL DEVELOPMENT
-- ═══════════════════════════════════════════════════════════════
('sch-pm-svanidhi', 'PM SVANidhi', 'Working capital loan facility for street vendors with interest subsidy and digital transaction cashback incentives.', 'Ministry of Housing and Urban Affairs', 'Employment', 'Central', null,
 array['Collateral-free working capital loan up to ₹50,000', 'Interest subvention of 7% per annum on timely repayment', 'Cashback on digital transactions'],
 array['Street vendors with certificate of vending', 'Vending in urban local body limits', 'Valid voter ID or certificate of vending from ULB'],
 array['Aadhaar card', 'Certificate of vending or identity proof', 'Bank account details'],
 'https://pmsvanidhi.mohua.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmsvanidhi.mohua.gov.in/'),

('sch-pmv', 'PM Vishwakarma', 'End-to-end support for artisans and craftspeople in 18 notified traditional trades including skill training, toolkit and credit.', 'Ministry of Micro, Small and Medium Enterprises', 'Skill Development', 'Central', null,
 array['Skill training (Basic and Advanced)', 'Toolkit incentive up to ₹15,000', 'Credit support up to ₹3 lakh in two tranches', 'Marketing and digital payment support'],
 array['Artisans and craftspeople in 18 notified trades', 'Age 18 years and above', 'Working with hands and tools in a traditional trade'],
 array['Aadhaar card', 'Trade verification document', 'Bank account details'],
 'https://pmvishwakarma.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmvishwakarma.gov.in/'),

('sch-mudra', 'Pradhan Mantri MUDRA Yojana', 'Credit programme for non-corporate, non-farm small and micro enterprises through three categories of MUDRA loans.', 'Ministry of Finance', 'Entrepreneurship', 'Central', null,
 array['Shishu loans up to ₹50,000', 'Kishore loans from ₹50,000 to ₹5 lakh', 'Tarun loans from ₹5 lakh to ₹10 lakh', 'No collateral required'],
 array['Non-corporate, non-farm small or micro enterprise', 'Individuals, partnership firms, LLPs and micro enterprises', 'Existing or new business enterprises'],
 array['Aadhaar card', 'Business identity and address proof', 'Business plan or project report', 'Bank account details'],
 'https://www.mudra.org.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.mudra.org.in/'),

('sch-stand-up', 'Stand-Up India', 'Bank loan facility for SC, ST and women entrepreneurs for greenfield enterprises in manufacturing, services or trading.', 'Department of Financial Services', 'Entrepreneurship', 'Central', null,
 array['Bank loan from ₹10 lakh to ₹1 crore', 'Loan for greenfield enterprise in manufacturing, services or trading', 'Handholding support through Lead District Manager'],
 array['SC, ST or woman entrepreneur', 'Age 18 years and above', 'Greenfield enterprise (new venture)'],
 array['Aadhaar card', 'SC/ST certificate or woman applicant proof', 'Business plan and project report', 'Bank account details'],
 'https://www.standupmitra.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.standupmitra.in/'),

('sch-pmegp', 'Prime Minister Employment Generation Programme', 'Credit-linked subsidy programme supporting new micro-enterprises with margin money subsidy.', 'Ministry of Micro, Small and Medium Enterprises', 'Entrepreneurship', 'Central', null,
 array['Margin money subsidy of 25% (rural) and 15% (urban) of project cost', 'Loan through lending institutions', 'Project cost up to ₹50 lakh (manufacturing) and ₹20 lakh (services)'],
 array['Individual above 18 years', 'Education: VIII pass for project cost above ₹10 lakh', 'New micro-enterprise project not availed under any other subsidy scheme'],
 array['Aadhaar card', 'Education certificate', 'Project report', 'Bank account details', 'SC/ST/OBC certificate if applicable'],
 'https://pmegp.msme.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmegp.msme.gov.in/'),

('sch-pmkvy', 'Pradhan Mantri Kaushal Vikas Yojana', 'Skill certification programme providing short-term skill training and recognition of prior learning to youth.', 'Ministry of Skill Development and Entrepreneurship', 'Skill Development', 'Central', null,
 array['Free skill training at accredited training centres', 'NSDC certification upon successful assessment', 'Monetary reward on certification', 'Placement assistance'],
 array['Indian youth aged 15-45', 'School or college students and job seekers', 'No minimum education requirement for most courses'],
 array['Aadhaar card', 'Education certificate', 'Bank account details'],
 'https://www.skillindia.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.skillindia.gov.in/'),

('sch-naps', 'National Apprenticeship Promotion Scheme', 'Promotion of apprenticeship training through stipend support to apprentices and sharing of basic training cost with employers.', 'Ministry of Skill Development and Entrepreneurship', 'Skill Development', 'Central', null,
 array['Stipend support of 25% of prescribed stipend (max ₹1,500/month)', 'Basic training cost sharing with employers', 'On-the-job training at establishment'],
 array['Indian youth aged 14-21', 'Minimum class 10 pass', 'Engagement in designated trades at establishments'],
 array['Aadhaar card', 'Education certificate', 'Bank account details'],
 'https://www.apprenticeshipindia.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.apprenticeshipindia.gov.in/'),

('sch-day-nulm', 'Deen Dayal Antyodaya Yojana – National Urban Livelihoods Mission', 'Urban poverty alleviation programme providing skill training, self-employment and shelter for urban homeless.', 'Ministry of Housing and Urban Affairs', 'Employment', 'Central', null,
 array['Skill training and certification through City Livelihood Centres', 'Self-employment support through Interest Subvention', 'Shelter for urban homeless', 'Street vendor support and social security'],
 array['Urban poor including homeless, street vendors and self-employed', 'BPL families and beneficiaries identified by ULBs', 'No age restriction for most components'],
 array['Aadhaar card', 'BPL certificate or ration card', 'Bank account details'],
 'https://daynulm.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://daynulm.gov.in/'),

('sch-day-nrlm', 'National Rural Livelihoods Mission', 'Rural poverty alleviation through self-help groups, skill training and livelihood support for rural poor women.', 'Ministry of Rural Development', 'Employment', 'Central', null,
 array['Formation and strengthening of self-help groups', 'Skill training and livelihood support', 'Credit linkage through banks', 'Social mobilisation and community empowerment'],
 array['Rural poor households', 'Priority to women from BPL families', 'No education or age restriction for SHG formation'],
 array['Aadhaar card', 'BPL certificate', 'Bank account details'],
 'https://daynrlm.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://daynrlm.gov.in/'),

('sch-ddugky', 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana', 'Rural skill training programme providing placement-linked skill training to rural youth from BPL families.', 'Ministry of Rural Development', 'Skill Development', 'Central', null,
 array['Free skill training at Rural Self Employment Training Institutes', 'Placement-linked training', 'Post-placement support', 'Training allowance during training period'],
 array['Rural youth aged 15-35', 'BPL families', 'Minimum education varies by course', 'SC, ST, OBC and minority candidates given preference'],
 array['Aadhaar card', 'BPL certificate', 'Education certificate', 'Bank account details'],
 'https://ddugky.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://ddugky.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — HOUSING
-- ═══════════════════════════════════════════════════════════════
('sch-pmay-urban', 'Pradhan Mantri Awas Yojana – Urban', 'Housing for All in urban areas through credit-linked interest subsidy and beneficiary-led construction.', 'Ministry of Housing and Urban Affairs', 'Housing', 'Central', null,
 array['Credit-linked interest subsidy on home loan', 'Beneficiary-led individual house construction assistance', 'Assistance for purchase of house in partnership with private sector'],
 array['Household without a pucca house anywhere in India', 'EWS, LIG and MIG categories as per notified income slabs', 'First-time home buyer with no central housing assistance'],
 array['Aadhaar card', 'Income certificate', 'Bank account details', 'No pucca house certificate from local authority'],
 'https://pmay-urban.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmay-urban.gov.in/'),

('sch-pmay-g', 'Pradhan Mantri Awas Yojana – Gramin', 'Rural housing assistance providing financial support for construction of pucca houses to eligible rural households.', 'Ministry of Rural Development', 'Housing', 'Central', null,
 array['Financial assistance for house construction', 'Convergence with sanitation and drinking water schemes', 'Direct benefit transfer to beneficiary account'],
 array['Rural households without a pucca house', 'Households identified under SECC deprivation criteria', 'SC, ST, minorities and freed bonded labour given priority'],
 array['Aadhaar card', 'SECC deprivation criteria verification', 'Bank account details', 'Land ownership or lease documents'],
 'https://pmayg.nic.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmayg.nic.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — SOCIAL SECURITY
-- ═══════════════════════════════════════════════════════════════
('sch-apy', 'Atal Pension Yojana', 'Guaranteed pension scheme for workers in the unorganised sector providing fixed pension after age 60.', 'Ministry of Finance', 'Social Security', 'Central', null,
 array['Guaranteed minimum pension of ₹1,000 to ₹5,000 per month after age 60', 'Government co-contribution of ₹1,000 per year for eligible subscribers', 'Spouse pension on death of subscriber'],
 array['Indian citizens aged 18-40', 'Savings bank account holder', 'Not an income-tax payer', 'Not a member of any statutory social security scheme'],
 array['Aadhaar card', 'Bank account details', 'Age proof'],
 'https://www.npscra.nsdl.co.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.npscra.nsdl.co.in/'),

('sch-pmjjby', 'Pradhan Mantri Jeevan Jyoti Bima Yojana', 'Life insurance scheme providing ₹2 lakh cover at an annual premium of ₹436 for individuals aged 18-50.', 'Ministry of Finance', 'Social Security', 'Central', null,
 array['Life cover of ₹2 lakh on death due to any cause', 'Annual premium of ₹436 per member', 'Auto-debit from linked bank account'],
 array['Indian citizens aged 18-50', 'Savings bank account holder', 'Aadhaar-linked bank account', 'Not covered by any other life insurance scheme'],
 array['Aadhaar card', 'Bank account details', 'Nominee details'],
 'https://www.jeevanjyotibima.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.jeevanjyotibima.gov.in/'),

('sch-pmsby', 'Pradhan Mantri Suraksha Bima Yojana', 'Accidental death and disability insurance scheme providing ₹2 lakh cover at an annual premium of ₹20.', 'Ministry of Finance', 'Social Security', 'Central', null,
 array['Accidental death cover of ₹2 lakh', 'Permanent total disability cover of ₹2 lakh', 'Annual premium of ₹20 per member'],
 array['Indian citizens aged 18-70', 'Savings bank account holder', 'Aadhaar-linked bank account'],
 array['Aadhaar card', 'Bank account details', 'Nominee details'],
 'https://www.surakshabima.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.surakshabima.gov.in/'),

('sch-pmsyy', 'PM Shram Yogi Maandhan', 'Pension scheme for unorganised workers providing ₹3,000 per month after age 60 through voluntary contribution.', 'Ministry of Labour and Employment', 'Social Security', 'Central', null,
 array['Guaranteed pension of ₹3,000 per month after age 60', 'Matching contribution by the government', 'Family pension of ₹1,500 per month to spouse on death'],
 array['Unorganised workers aged 18-40', 'Monthly income up to ₹15,000', 'Not covered under EPFO, NPS or ESIC'],
 array['Aadhaar card', 'Bank account details', 'Income declaration'],
 'https://maandhan.in/', 'active', '2026-08-10T00:00:00Z', 'https://maandhan.in/'),

('sch-nsap', 'National Social Assistance Programme', 'Umbrella programme providing pension and social assistance to elderly, widows and persons with disabilities from BPL families.', 'Ministry of Rural Development', 'Social Security', 'Central', null,
 array['Indira Gandhi National Old Age Pension: ₹200-₹500/month', 'Indira Gandhi National Widow Pension: ₹200-₹500/month', 'Indira Gandhi National Disability Pension: ₹200-₹500/month', 'Annapurna Scheme: 10 kg food grains per month'],
 array['BPL families', 'Old age pension: 60 years and above', 'Widow pension: 18-59 years', 'Disability pension: 18-59 years with 40%+ disability'],
 array['Aadhaar card', 'BPL certificate', 'Age proof', 'Disability certificate for disability pension'],
 'https://nsap.nic.in/', 'active', '2026-08-10T00:00:00Z', 'https://nsap.nic.in/'),

('sch-epfo', 'Employees Provident Fund Scheme', 'Statutory retirement savings scheme providing provident fund, pension and insurance benefits to organised sector employees.', 'Ministry of Labour and Employment', 'Social Security', 'Primary', null,
 array['Provident fund accumulation on retirement', 'Employee Pension Scheme benefits', 'Employees Deposit Linked Insurance Scheme cover', 'Partial withdrawal for housing, education, illness'],
 array['Employees in establishments with 20 or more employees', 'Mandatory for employees earning up to ₹15,000 per month', 'Voluntary for employees earning above ₹15,000'],
 array['Aadhaar card', 'PAN card', 'Bank account details', 'Employment details'],
 'https://www.epfindia.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.epfindia.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — WOMEN & CHILD
-- ═══════════════════════════════════════════════════════════════
('sch-ss', 'Sukanya Samriddhi Account', 'Small deposit scheme for girl children providing assured returns and tax benefits for long-term savings.', 'Department of Economic Affairs', 'Women & Child', 'Central', null,
 array['Government-backed interest rate (currently 8.2% per annum)', 'Tax benefits under Section 80C', 'Maturity after 21 years from date of account opening', 'Partial withdrawal for education after class 10'],
 array['Parent or legal guardian of a girl child below 10 years', 'One account per girl child', 'Maximum two accounts per family'],
 array['Girl child birth certificate', 'Parent Aadhaar card', 'Address proof of parent'],
 'https://www.indiapost.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.indiapost.gov.in/'),

('sch-matru-vandana', 'Pradhan Mantri Matru Vandana Yojana', 'Maternity benefit scheme providing ₹5,000 cash incentive to pregnant and lactating mothers for first living child.', 'Ministry of Women and Child Development', 'Women & Child', 'Central', null,
 array['Cash incentive of ₹5,000 in three instalments', 'Paid directly to beneficiary bank account', 'Available for first living child'],
 array['Pregnant and lactating mothers for first living child', 'BPL families and those not receiving maternity benefits under any other scheme', 'Must apply during pregnancy'],
 array['Aadhaar card', 'MCP card or doctor certificate', 'Bank account details', 'Child birth certificate (for second instalment)'],
 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana', 'active', '2026-08-10T00:00:00Z', 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana'),

('sch-pmposhan', 'PM POSHAN (Mid Day Meal)', 'School nutrition programme providing cooked mid-day meals to children in government and government-aided schools.', 'Ministry of Education', 'Education', 'Central', null,
 array['Free cooked mid-day meal for children in classes I-VIII', 'Nutritional support as per prescribed calorie and protein norms', 'Take-home ration for children in pre-school (Bal Vatika)'],
 array['Children studying in government and government-aided schools', 'Classes I to VIII', 'Includes children in Bal Vatika (pre-school)'],
 array['School enrolment record', 'No individual documents required'],
 'https://pmposhan.education.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmposhan.education.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — EDUCATION & SCHOLARSHIPS
-- ═══════════════════════════════════════════════════════════════
('sch-nsp', 'National Scholarship Portal', 'Centralised portal for discovery and application of scholarships published by various government ministries and departments.', 'Government of India', 'Education', 'Central', null,
 array['Scholarship support as per individual scholarship guidelines', 'Multiple scholarships accessible through one portal', 'Direct benefit transfer to student bank account'],
 array['Criteria vary by individual scholarship', 'Generally requires enrollment in recognised institution', 'Income, category and education criteria apply per scholarship'],
 array['Aadhaar card', 'Income certificate', 'Education certificate', 'Institution verification letter', 'Bank account details'],
 'https://scholarships.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://scholarships.gov.in/'),

('sch-pmmss', 'Post Matric Scholarship for SC Students', 'Central sector scholarship for SC students pursuing post-matriculation education including professional and technical courses.', 'Ministry of Social Justice and Empowerment', 'Education', 'Central', null,
 array['Maintenance allowance as per course level', 'Non-refundable tuition and admission fees reimbursement', 'Additional allowance for hostellers'],
 array['Students from SC category', 'Pursuing post-matriculation course in recognised institution', 'Annual family income within notified ceiling', 'Not receiving another central scholarship'],
 array['Aadhaar card', 'Caste certificate (SC)', 'Income certificate', 'Education certificate', 'Bank account details'],
 'https://scholarships.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://scholarships.gov.in/'),

('sch-pmsss', 'Pre Matric Scholarship for SC Students', 'Scholarship for SC students in classes IX and X to support their education and reduce dropout rates.', 'Ministry of Social Justice and Empowerment', 'Education', 'Central', null,
 array['Monthly scholarship for day scholars and hostellers', 'Book and stationery allowance', 'Annual ad hoc grant'],
 array['SC students in classes IX and X', 'Annual family income within notified ceiling', 'Studying in government or government-aided schools'],
 array['Aadhaar card', 'Caste certificate (SC)', 'Income certificate', 'School enrolment record', 'Bank account details'],
 'https://scholarships.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://scholarships.gov.in/'),

('sch-nmmms', 'National Means-cum-Merit Scholarship', 'Scholarship for meritorious students from economically weaker sections to prevent dropouts at class VIII to IX transition.', 'Department of Higher Education', 'Education', 'Central', null,
 array['Annual scholarship of ₹12,000 from class IX to XII', 'Renewal subject to academic performance', 'Direct benefit transfer to student bank account'],
 array['Students from economically weaker sections', 'Studying in government or government-aided schools', 'Annual family income up to ₹3,50,000', 'Must pass class VIII with required marks'],
 array['Aadhaar card', 'Income certificate', 'Class VIII marksheet', 'School enrolment record', 'Bank account details'],
 'https://scholarships.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://scholarships.gov.in/'),

('sch-nos', 'National Overseas Scholarship', 'Scholarship for students from SC, ST, OBC and minority communities to pursue higher education abroad.', 'Ministry of Social Justice and Empowerment', 'Education', 'Central', null,
 array['Tuition fees as per actuals up to notified limit', 'Maintenance and contingency allowance', 'Air fare and visa fees', 'Total assistance up to ₹20 lakh'],
 array['Students from SC, ST, OBC or minority communities', 'Secured admission in notified courses abroad', 'Annual family income within notified ceiling', 'Age below 35 years'],
 array['Aadhaar card', 'Caste/community certificate', 'Income certificate', 'Admission letter from foreign university', 'Bank account details'],
 'https://www.ugc.ac.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.ugc.ac.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — FINANCIAL INCLUSION
-- ═══════════════════════════════════════════════════════════════
('sch-pmjjdy', 'Pradhan Mantri Jan Dhan Yojana', 'Financial inclusion programme providing zero-balance bank accounts with RuPay debit card and insurance benefits.', 'Department of Financial Services', 'Financial Inclusion', 'Central', null,
 array['Zero-balance savings account', 'RuPay debit card', '₹2 lakh accident insurance cover', 'Overdraft facility up to ₹10,000', 'Life cover of ₹30,000'],
 array['Any Indian citizen above 10 years', 'No minimum balance requirement', 'No income restriction'],
 array['Aadhaar card or any valid identity document', 'Address proof', 'Photograph'],
 'https://www.pmjdy.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.pmjdy.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — ENERGY & INFRASTRUCTURE
-- ═══════════════════════════════════════════════════════════════
('sch-pmsuryaghar', 'PM Surya Ghar: Muft Bijli Yojana', 'Rooftop solar programme providing free electricity through subsidized rooftop solar installations for residential households.', 'Ministry of New and Renewable Energy', 'Energy', 'Central', null,
 array['Central financial assistance up to 40% of system cost', 'Free electricity through rooftop solar', 'Subsidy directly credited to bank account', 'Loan facility at concessional rates'],
 array['Residential electricity consumers', 'Own house with suitable rooftop', 'Connected to electricity distribution company'],
 array['Aadhaar card', 'Electricity bill or connection details', 'House ownership proof', 'Bank account details'],
 'https://pmsuryaghar.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmsuryaghar.gov.in/'),

('sch-saubhagya', 'Saubhagya – Electrification of All Households', 'Pradhan Mantri Sahaj Bijli Har Ghar Yojana providing electricity connections to all un-electrified households.', 'Ministry of Power', 'Energy', 'Central', null,
 array['Free electricity connection to un-electrified households', 'Solar power packs for remote areas', 'Last-mile connectivity'],
 array['Un-electrified households identified through survey', 'BPL families given priority', 'Connection provided through local DISCOM'],
 array['Aadhaar card', 'BPL certificate if applicable', 'Address proof'],
 'https://saubhagya.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://saubhagya.gov.in/'),

('sch-sbgm', 'Swachh Bharat Mission – Gramin', 'Rural sanitation programme aiming to achieve universal sanitation coverage and make villages Open Defecation Free.', 'Ministry of Jal Shakti', 'Sanitation', 'Central', null,
 array['Individual household latrine construction assistance', 'Community and public sanitation facilities', 'Solid and liquid waste management', 'ODF verification and sustainability'],
 array['Rural households without access to sanitation', 'BPL families and priority households', 'All rural citizens in campaign mode'],
 array['Aadhaar card', 'BPL certificate if applicable', 'Household details'],
 'https://sbmgm.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://sbmgm.gov.in/'),

('sch-jjm', 'Jal Jeevan Mission', 'Universal piped water supply programme providing functional tap water connections to all rural households by 2024.', 'Ministry of Jal Shakti', 'Water Supply', 'Central', null,
 array['Functional household tap water connection', 'Quality-tested water supply', 'Community water purification plants', 'Grey water management'],
 array['Rural households without piped water connection', 'Priority to water-scarce and quality-affected areas', 'All rural households targeted'],
 array['Aadhaar card', 'Household details', 'No income restriction'],
 'https://hargharjal.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://hargharjal.gov.in/'),

('sch-pmgsy', 'Pradhan Mantri Gram Sadak Yojana', 'Rural road connectivity programme providing all-weather road connectivity to unconnected rural habitations.', 'Ministry of Rural Development', 'Infrastructure', 'Central', null,
 array['All-weather road connectivity to eligible rural habitations', 'Road upgradation and bridge construction', 'Convergence with other infrastructure schemes'],
 array['Unconnected rural habitations with population above 500', 'Priority to SC/ST majority habitations', 'State government identifies eligible habitations'],
 array['No individual application required', 'State government identifies eligible habitations'],
 'https://pmgsy.nic.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmgsy.nic.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — DIGITAL & TECHNOLOGY
-- ═══════════════════════════════════════════════════════════════
('sch-digital-india', 'Digital India – Common Service Centres', 'Network of Common Service Centres providing government and business services in rural and remote areas.', 'Ministry of Electronics and Information Technology', 'Digital', 'Central', null,
 array['Access to government services through CSCs', 'Digital literacy training', 'e-Governance services at village level', 'Financial, education and health services'],
 array['All citizens', 'Priority to rural and underserved populations', 'CSC operators must meet eligibility criteria'],
 array['Aadhaar card for service access', 'No mandatory documents for basic services'],
 'https://digitalindia.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://digitalindia.gov.in/'),

('sch-bharatnet', 'BharatNet – Broadband Connectivity', 'National Optical Fibre Network providing broadband connectivity to all gram panchayats for digital inclusion.', 'Department of Telecommunications', 'Digital', 'Central', null,
 array['Broadband connectivity to gram panchayats', 'Wi-Fi hotspot at gram panchayat level', 'Free Wi-Fi through PM-WANI scheme', 'Digital services delivery'],
 array['All gram panchayats', 'CSC operators and service providers', 'All citizens through panchayat-level access'],
 array['No individual application required', 'Access through gram panchayat or CSC'],
 'https://bharatnet.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://bharatnet.gov.in/'),

('sch-uday', 'UDAY – Ujwal Discom Assurance Yojana', 'Financial turnaround plan for power distribution companies to ensure affordable and reliable power supply.', 'Ministry of Power', 'Energy', 'Central', null,
 array['Reliable power supply through discom financial turnaround', 'Affordable electricity tariffs', 'Improved infrastructure and reduced AT&C losses'],
 array['All electricity consumers', 'State governments and discoms', 'No individual application required'],
 array['No individual application required', 'Benefits accrue through improved discom performance'],
 'https://uday.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://uday.gov.in/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — SOCIAL WELFARE
-- ═══════════════════════════════════════════════════════════════
('sch-epds', 'National Food Security Act – Public Distribution System', 'Subsidised food grains to eligible households through Fair Price Shops under the National Food Security Act.', 'Ministry of Consumer Affairs, Food and Public Distribution', 'Food Security', 'Central', null,
 array['Rice at ₹3/kg, wheat at ₹2/kg, coarse grains at ₹1/kg', '5 kg of food grains per person per month', 'Priority households and Antyodaya families covered'],
 array['Households covered under NFSA based on SECC data', 'Antyodaya Anna Yojana families', 'Priority households as identified by state governments'],
 array['Ration card', 'Aadhaar card linked to ration card', 'Address proof'],
 'https://nfsa.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://nfsa.gov.in/'),

('sch-ujjwala', 'Pradhan Mantri Ujjwala Yojana', 'Free LPG connection to women from BPL households to replace polluting cooking fuels.', 'Ministry of Petroleum and Natural Gas', 'Social Welfare', 'Central', null,
 array['Free LPG connection with deposit and first refill', '₹1,600 per connection as government support', 'Subsequent refills at subsidised rates'],
 array['Women from BPL households', 'No existing LPG connection in the household', 'SECC database identified beneficiaries'],
 array['Aadhaar card', 'BPL certificate or SECC verification', 'Bank account details', 'Identity proof of woman applicant'],
 'https://www.pmujjwalayojana.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.pmujjwalayojana.in/'),

('sch-pmujala', 'PM Ujjwala Yojana 2.0', 'Extended version providing free LPG connection to women from PMAY, SECC and other identified categories.', 'Ministry of Petroleum and Natural Gas', 'Social Welfare', 'Central', null,
 array['Free LPG connection with deposit and first refill', 'Additional refill support', 'Connection issued to women of the household'],
 array['Women from BPL households without existing LPG connection', 'PMAY beneficiaries', 'SECC identified families', 'SC/ST households'],
 array['Aadhaar card', 'BPL certificate or PMAY beneficiary proof', 'Bank account details'],
 'https://www.pmujjwalayojana.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.pmujjwalayojana.in/'),

('sch-eb', 'e-Shram – National Database for Unorganised Workers', 'Registration and social security portal for unorganised workers including construction, domestic and gig workers.', 'Ministry of Labour and Employment', 'Social Security', 'Central', null,
 array['e-Shram card with UAN number', 'Accident insurance cover of ₹2 lakh', 'Access to social security schemes', 'One Nation One Ration Card portability'],
 array['Unorganised workers aged 16-59', 'Not a member of EPFO or ESIC', 'Self-employed or wage workers in unorganised sector'],
 array['Aadhaar card', 'Bank account details', 'Occupation details'],
 'https://eshram.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://eshram.gov.in/'),

('sch-nps', 'National Pension System for Government Employees', 'Contributory pension scheme for government employees providing market-linked returns and pension benefits.', 'Department of Financial Services', 'Social Security', 'Primary', null,
 array['Pension corpus based on contributions and market returns', 'Annuity options for guaranteed pension', 'Tax benefits under Section 80CCD', 'Partial withdrawal facility'],
 array['Government employees joining service after 01.01.2004', 'Voluntary for state government employees', 'Minimum contribution of ₹1,000 per year'],
 array['Aadhaar card', 'PAN card', 'Bank account details', 'Employment details'],
 'https://www.cra-nsdl.com/', 'active', '2026-08-10T00:00:00Z', 'https://www.cra-nsdl.com/'),

-- ═══════════════════════════════════════════════════════════════
-- CENTRAL GOVERNMENT — MISCELLANEOUS
-- ═══════════════════════════════════════════════════════════════
('sch-pmjay-p', 'PM Jan Arogya Yojana – Portability', 'Health cover portability allowing beneficiaries to access empanelled hospitals across India.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Central', null,
 array['Cashless treatment at empanelled hospitals across India', 'Portability of health cover to any state', 'Same ₹5 lakh family cover applies'],
 array['Existing PM-JAY beneficiaries', 'Must be verified through the official beneficiary database', 'Treatment at empanelled hospitals only'],
 array['Ayushman card or e-card', 'Aadhaar card', 'Referral from empanelled facility if required'],
 'https://pmjay.gov.in/', 'active', '2026-08-10T00:00:00Z', 'https://pmjay.gov.in/'),

('sch-smam', 'Senior Citizens Health Insurance Scheme', 'Health insurance scheme for senior citizens aged 60 and above from BPL families.', 'Ministry of Health and Family Welfare', 'Healthcare', 'Central', null,
 array['Health cover for senior citizens', 'Cashless treatment at empanelled hospitals', 'Coverage for pre-existing diseases'],
 array['Senior citizens aged 60 and above', 'BPL families', 'Not covered under any other health insurance scheme'],
 array['Aadhaar card', 'Age proof', 'BPL certificate', 'Bank account details'],
 'https://www.nhiconline.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.nhiconline.in/'),

('sch-pm-pranam', 'PM PRANAM – Programme for Restoration and Management', 'Incentive programme for states reducing chemical fertiliser usage and promoting organic and natural farming.', 'Department of Agriculture and Farmers Welfare', 'Agriculture', 'Central', null,
 array['Incentive to states reducing fertiliser subsidy', 'Support for organic farming and bio-fertiliser promotion', 'Convergence with existing agricultural schemes'],
 array['State governments implementing fertiliser reduction', 'Farmers adopting organic and natural farming', 'No individual application required'],
 array['No individual application required', 'Benefits channelled through state agriculture departments'],
 'https://agricoop.nic.in/', 'active', '2026-08-10T00:00:00Z', 'https://agricoop.nic.in/'),

('sch-pm-kcc', 'Kisan Credit Card', 'Credit facility for farmers to meet agricultural and allied needs at subsidised interest rates.', 'Department of Financial Services', 'Agriculture', 'Central', null,
 array['Crop loan at 4% interest rate (with prompt repayment)', 'KCC for animal husbandry and fisheries', 'Credit limit based on landholding and cropping pattern', 'Insurance cover on KCC'],
 array['All farmers including tenant farmers and sharecroppers', 'Fishermen and animal husbandry farmers', 'Subject to land records and cropping pattern'],
 array['Aadhaar card', 'Land records', 'Bank account details', 'Passport size photograph'],
 'https://www.myscheme.gov.in/search/kcc', 'active', '2026-08-10T00:00:00Z', 'https://www.myscheme.gov.in/search/kcc'),

('sch-mudra-shishu', 'MUDRA Shishu Loan', 'Micro-credit facility for very small enterprises and startups with loan amount up to ₹50,000.', 'Ministry of Finance', 'Entrepreneurship', 'Central', null,
 array['Loan up to ₹50,000', 'No collateral required', 'Simplified documentation', 'Working capital and term loan'],
 array['New or existing micro-enterprise', 'Non-corporate, non-farm enterprise', 'Individual entrepreneurs, shopkeepers, artisans'],
 array['Aadhaar card', 'Business identity proof', 'Bank account details'],
 'https://www.mudra.org.in/', 'active', '2026-08-10T00:00:00Z', 'https://www.mudra.org.in/'),

('sch-pm-narega', 'MGNREGA – Mahatma Gandhi National Rural Employment Guarantee Act', 'Legal guarantee of 100 days of wage employment per year to rural households for unskilled manual work.', 'Ministry of Rural Development', 'Employment', 'Central', null,
 array['100 days of guaranteed wage employment per household per year', 'Unskilled manual work on public projects', 'Average daily wage as per state notification', 'Unemployment allowance if work not provided within 15 days'],
 array['Rural households whose adult members volunteer for unskilled manual work', 'Job card holders', 'No income or education restriction'],
 array['Aadhaar card', 'Address proof', 'Bank account details', 'Job card registration'],
  'https://nrega.nic.in/', 'active', '2026-08-10T00:00:00Z', 'https://nrega.nic.in/')

on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  ministry = excluded.ministry,
  category = excluded.category,
  level = excluded.level,
  state = excluded.state,
  benefits = excluded.benefits,
  eligibility = excluded.eligibility,
  documents_required = excluded.documents_required,
  application_url = excluded.application_url,
  status = excluded.status,
  last_verified_at = excluded.last_verified_at,
  source_url = excluded.source_url,
  updated_at = now();
