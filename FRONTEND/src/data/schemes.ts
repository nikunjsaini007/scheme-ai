export type Scheme = {
  id: string;
  name: string;
  match: number;
  benefit: string;
  benefitNote: string;
  category: string;
  level: "CENTRAL GOVERNMENT" | "STATE GOVERNMENT";
  summary: string;
  deadlineDays?: number;
  whoCanApply: string[];
  whatYouGet: string[];
  documents: { name: string; why: string; how: string; mandatory: boolean }[];
  howToApply: string[];
  source: string;
  criteria: { label: string; ok: boolean }[];
  reason: string;
};

export const LAST_VERIFIED = "10 AUG 2026";

const commonDocs = {
  aadhaar: {
    name: "Aadhaar",
    why: "Used to confirm identity and prevent duplicate applications.",
    how: "Available from any Aadhaar Seva Kendra or the UIDAI portal.",
    mandatory: true,
  },
  income: {
    name: "Income Certificate",
    why: "Confirms your family income falls under the scheme's stated limit.",
    how: "Issued by your Tehsil / SDM office or state e-district portal.",
    mandatory: true,
  },
  bank: {
    name: "Bank Account",
    why: "Benefits are transferred directly to a bank account in your name.",
    how: "Any bank branch; a zero-balance Jan Dhan account also works.",
    mandatory: true,
  },
  education: {
    name: "Education Certificate",
    why: "Shows your current course and institution match the requirement.",
    how: "Issued by your school, college or university office.",
    mandatory: true,
  },
  caste: {
    name: "Caste Certificate",
    why: "Required only for category-reserved components of the scheme.",
    how: "Issued by your Tehsildar or state e-district portal.",
    mandatory: false,
  },
  land: {
    name: "Land Records",
    why: "Confirms cultivable land holding in your name.",
    how: "Available from your village Patwari or the state land records portal.",
    mandatory: true,
  },
};

export const schemes: Scheme[] = [
  {
    id: "post-matric-scholarship",
    name: "Post-Matric Scholarship",
    match: 94,
    benefit: "₹50,000",
    benefitNote: "Maximum annual assistance",
    category: "EDUCATION",
    level: "CENTRAL GOVERNMENT",
    summary: "For students pursuing higher education after class 10.",
    deadlineDays: 18,
    whoCanApply: [
      "Students enrolled in a recognised post-matriculation course",
      "Annual family income within the notified ceiling",
      "Indian citizen with a valid Aadhaar",
      "Not already receiving another central scholarship",
    ],
    whatYouGet: [
      "Maintenance allowance paid across the academic year",
      "Reimbursement of non-refundable tuition and admission fees",
      "Additional allowance for hostel residents",
    ],
    documents: [commonDocs.aadhaar, commonDocs.income, commonDocs.bank, commonDocs.education, commonDocs.caste],
    howToApply: [
      "Register on the National Scholarship Portal with your Aadhaar",
      "Complete the student profile and select your institution",
      "Upload the required documents as scanned copies",
      "Submit before the deadline and note your application ID",
      "Your institution verifies the application at its end",
    ],
    source: "National Scholarship Portal — scholarships.gov.in",
    criteria: [
      { label: "Age requirement", ok: true },
      { label: "State requirement", ok: true },
      { label: "Income requirement", ok: true },
      { label: "Student status", ok: true },
      { label: "Education requirement", ok: true },
      { label: "Income certificate required", ok: false },
    ],
    reason:
      "You appear eligible because your family income is below the scheme's stated limit and your education status matches the requirement.",
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN",
    match: 91,
    benefit: "₹6,000",
    benefitNote: "Per year, in three instalments",
    category: "AGRICULTURE",
    level: "CENTRAL GOVERNMENT",
    summary: "Income support for landholding farmer families.",
    deadlineDays: 42,
    whoCanApply: [
      "Landholding farmer families with cultivable land",
      "Land records in the applicant's name",
      "Aadhaar-linked bank account",
    ],
    whatYouGet: ["₹2,000 transferred every four months", "Direct benefit transfer to your bank account"],
    documents: [commonDocs.aadhaar, commonDocs.land, commonDocs.bank],
    howToApply: [
      "Visit the PM-KISAN portal or your nearest Common Service Centre",
      "Complete new farmer registration with land details",
      "Verify Aadhaar and bank account linkage",
      "Track instalment status through the beneficiary page",
    ],
    source: "PM-KISAN — pmkisan.gov.in",
    criteria: [
      { label: "Land holding requirement", ok: true },
      { label: "State requirement", ok: true },
      { label: "Aadhaar linkage", ok: true },
      { label: "Land record in own name", ok: false },
    ],
    reason:
      "You appear eligible because your household holds cultivable land in a covered state and your bank account is Aadhaar-linked.",
  },
  {
    id: "pmay",
    name: "PMAY",
    match: 87,
    benefit: "₹2.67L",
    benefitNote: "Interest subsidy on a home loan",
    category: "HOUSING",
    level: "CENTRAL GOVERNMENT",
    summary: "Housing support for families without a pucca home.",
    whoCanApply: [
      "Family does not own a pucca house anywhere in India",
      "Household income within the notified slab",
      "No prior central housing assistance received",
    ],
    whatYouGet: ["Credit-linked interest subsidy", "Assistance towards construction or purchase"],
    documents: [commonDocs.aadhaar, commonDocs.income, commonDocs.bank],
    howToApply: [
      "Apply through the PMAY portal or your urban local body",
      "Submit household and income details",
      "Await verification by the local authority",
    ],
    source: "PMAY — pmaymis.gov.in",
    criteria: [
      { label: "Housing status", ok: true },
      { label: "Income requirement", ok: true },
      { label: "First-time assistance", ok: true },
    ],
    reason:
      "You appear eligible because your household income falls within the notified slab and no pucca house is registered to your family.",
  },
  {
    id: "skill-india",
    name: "Skill India",
    match: 83,
    benefit: "FREE",
    benefitNote: "Certified short-term training",
    category: "SKILL DEVELOPMENT",
    level: "CENTRAL GOVERNMENT",
    summary: "Short-term certified training with placement support.",
    whoCanApply: ["Indian citizens aged 15–45", "School or college students and job seekers"],
    whatYouGet: ["Free certified training", "Assessment and certification", "Placement assistance"],
    documents: [commonDocs.aadhaar, commonDocs.education],
    howToApply: ["Find a training centre on the Skill India portal", "Enrol in a course aligned to your interest"],
    source: "Skill India — skillindiadigital.gov.in",
    criteria: [
      { label: "Age requirement", ok: true },
      { label: "Education requirement", ok: true },
    ],
    reason: "You appear eligible because your age and education level fall inside the training criteria.",
  },
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat",
    match: 78,
    benefit: "₹5L",
    benefitNote: "Annual family health cover",
    category: "HEALTHCARE",
    level: "CENTRAL GOVERNMENT",
    summary: "Cashless secondary and tertiary hospital care.",
    whoCanApply: ["Families identified under the deprivation criteria", "Verified through the beneficiary database"],
    whatYouGet: ["Cashless treatment at empanelled hospitals", "Cover for the whole family, no cap per member"],
    documents: [commonDocs.aadhaar, commonDocs.income],
    howToApply: ["Check eligibility on the PM-JAY portal", "Get your Ayushman card issued at a CSC or hospital desk"],
    source: "PM-JAY — pmjay.gov.in",
    criteria: [
      { label: "Household criteria", ok: true },
      { label: "Database verification", ok: false },
    ],
    reason: "You may be eligible if your household appears in the identified beneficiary database.",
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi",
    match: 74,
    benefit: "8.2%",
    benefitNote: "Assured annual interest for a girl child",
    category: "WOMEN & CHILDREN",
    level: "CENTRAL GOVERNMENT",
    summary: "Long-term savings account for a girl child under 10.",
    whoCanApply: ["Parent or guardian of a girl child below 10 years", "One account per girl child"],
    whatYouGet: ["Assured interest reviewed quarterly", "Tax benefit on deposits", "Maturity after 21 years"],
    documents: [commonDocs.aadhaar, commonDocs.bank],
    howToApply: ["Open the account at a post office or authorised bank", "Deposit a minimum amount each year"],
    source: "India Post — indiapost.gov.in",
    criteria: [
      { label: "Girl child in family", ok: true },
      { label: "Age of child below 10", ok: true },
    ],
    reason: "You appear eligible because your household includes a girl child under the age limit.",
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi",
    match: 69,
    benefit: "₹50,000",
    benefitNote: "Collateral-free working capital",
    category: "BUSINESS",
    level: "CENTRAL GOVERNMENT",
    summary: "Micro-credit for street vendors, in escalating tranches.",
    whoCanApply: ["Street vendors with a certificate of vending", "Vending in urban local body limits"],
    whatYouGet: ["Collateral-free loan", "Interest subvention on timely repayment", "Cashback on digital transactions"],
    documents: [commonDocs.aadhaar, commonDocs.bank],
    howToApply: ["Apply via the PM SVANidhi portal or a lending branch", "Attach your certificate of vending"],
    source: "PM SVANidhi — pmsvanidhi.mohua.gov.in",
    criteria: [
      { label: "Vendor status", ok: true },
      { label: "Certificate of vending", ok: false },
    ],
    reason: "You may be eligible once a certificate of vending is issued by your urban local body.",
  },
  {
    id: "atal-pension",
    name: "Atal Pension Yojana",
    match: 66,
    benefit: "₹5,000",
    benefitNote: "Guaranteed monthly pension after 60",
    category: "SOCIAL SECURITY",
    level: "CENTRAL GOVERNMENT",
    summary: "Contributory pension for workers in the unorganised sector.",
    whoCanApply: ["Indian citizens aged 18–40", "Holding a savings bank account", "Not an income-tax payer"],
    whatYouGet: ["Guaranteed pension from age 60", "Spouse pension on death of subscriber"],
    documents: [commonDocs.aadhaar, commonDocs.bank],
    howToApply: ["Enrol through your bank or post office", "Set up auto-debit for contributions"],
    source: "PFRDA — npscra.nsdl.co.in",
    criteria: [
      { label: "Age requirement", ok: true },
      { label: "Bank account", ok: true },
    ],
    reason: "You appear eligible because your age and account status match the enrolment window.",
  },
];

export const getScheme = (id: string) => schemes.find((s) => s.id === id);

export const personas = [
  { icon: "🎓", label: "STUDENT", benefits: ["Scholarships", "Education support", "Skill development", "Hostel assistance", "Loan subsidies", "Internships", "State schemes"] },
  { icon: "🌾", label: "FARMER", benefits: ["Income support", "Crop insurance", "Soil health", "Irrigation subsidy", "Kisan credit", "Equipment support", "State schemes"] },
  { icon: "👩", label: "WOMAN", benefits: ["Self-employment", "Maternity benefit", "Girl child savings", "Safety & shelter", "Skill training", "Group lending"] },
  { icon: "💼", label: "PROFESSIONAL", benefits: ["Pension schemes", "Housing subsidy", "Health cover", "Tax-linked savings", "Upskilling"] },
  { icon: "🏪", label: "ENTREPRENEUR", benefits: ["Mudra loans", "Stand-Up India", "Working capital", "Cluster support", "Export assistance"] },
  { icon: "👴", label: "SENIOR CITIZEN", benefits: ["Old age pension", "Health cover", "Senior savings", "Assistive devices", "Travel concessions"] },
  { icon: "♿", label: "PERSON WITH DISABILITY", benefits: ["Assistive devices", "Scholarships", "Employment support", "Travel concessions", "Home modification"] },
  { icon: "🏠", label: "FAMILY", benefits: ["Housing support", "Ration entitlements", "Health cover", "Cooking gas", "Child nutrition"] },
  { icon: "🔧", label: "WORKER", benefits: ["Provident fund", "Accident cover", "Skill certification", "Vishwakarma support", "Welfare board benefits"] },
];

export const categories = [
  { name: "EDUCATION", count: 412 },
  { name: "AGRICULTURE", count: 368 },
  { name: "HEALTHCARE", count: 254 },
  { name: "HOUSING", count: 141 },
  { name: "EMPLOYMENT", count: 297 },
  { name: "WOMEN & CHILDREN", count: 233 },
  { name: "BUSINESS", count: 186 },
  { name: "SOCIAL SECURITY", count: 158 },
  { name: "SKILL DEVELOPMENT", count: 129 },
  { name: "SENIOR CITIZENS", count: 94 },
];

export const states = [
  { name: "HARYANA", count: 147, top: ["EDUCATION", "AGRICULTURE", "EMPLOYMENT", "WOMEN", "HOUSING"] },
  { name: "KERALA", count: 163, top: ["HEALTHCARE", "EDUCATION", "FISHERIES", "WOMEN", "SOCIAL SECURITY"] },
  { name: "MAHARASHTRA", count: 208, top: ["AGRICULTURE", "BUSINESS", "HOUSING", "EDUCATION", "SKILLS"] },
  { name: "TAMIL NADU", count: 191, top: ["EDUCATION", "WOMEN", "HEALTHCARE", "EMPLOYMENT", "HOUSING"] },
  { name: "UTTAR PRADESH", count: 224, top: ["AGRICULTURE", "HOUSING", "EDUCATION", "SOCIAL SECURITY", "SKILLS"] },
  { name: "LADAKH", count: 61, top: ["TOURISM", "AGRICULTURE", "EDUCATION", "SOLAR", "HOUSING"] },
  { name: "WEST BENGAL", count: 176, top: ["EDUCATION", "WOMEN", "AGRICULTURE", "HEALTHCARE", "SKILLS"] },
  { name: "GUJARAT", count: 182, top: ["BUSINESS", "AGRICULTURE", "SKILLS", "HOUSING", "EDUCATION"] },
];

export const demoPersona = {
  name: "Aarav Sharma",
  age: 20,
  state: "Haryana",
  occupation: "Engineering Student",
  education: "B.Tech",
  income: "₹3,00,000",
};