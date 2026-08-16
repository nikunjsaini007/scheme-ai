// Deterministic demo recommendation engine for Yojantra
// This engine uses the user's real profile to generate personalized demo recommendations

import { demoSchemes, type DemoScheme } from "@/data/demoSchemes";

export type DemoRecommendation = {
  scheme_id: string;
  scheme_name: string;
  category: string;
  match_score: number;
  match_band: "strong" | "good" | "possible";
  why_matches: string[];
  missing_requirements: string[];
  eligibility_summary: string[];
  benefits: string[];
  required_documents: string[];
  application_url: string;
  source_url: string;
  is_demo: true;
};

type UserProfile = {
  age: number | null;
  gender: string | null;
  state: string | null;
  district: string | null;
  occupation: string | null;
  annual_income: number | null;
  education_level: string | null;
  category: string | null;
  is_student: boolean | null;
  disability_status: boolean | null;
  marital_status: string | null;
};

const normalizeOccupation = (value: string | null): string => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("student")) return "student";
  if (lower.includes("farmer")) return "farmer";
  if (lower.includes("self") || lower.includes("business")) return "self_employed";
  if (lower.includes("employ")) return "employed";
  if (lower.includes("unemploy")) return "unemployed";
  if (lower.includes("daily") || lower.includes("wage")) return "daily_wage";
  if (lower.includes("retire")) return "retired";
  if (lower.includes("home")) return "homemaker";
  if (lower.includes("agri")) return "agricultural_worker";
  return value.toLowerCase();
};

const normalizeCategory = (value: string | null): string => {
  if (!value) return "";
  const lower = value.toLowerCase().trim();
  if (lower.includes("obc")) return "obc";
  if (lower.includes("sc") || lower.includes("dalit")) return "sc";
  if (lower.includes("st") || lower.includes("tribal")) return "st";
  if (lower.includes("ews") || lower.includes("economically weaker")) return "ews";
  if (lower === "general" || lower === "open") return "general";
  return lower;
};

const normalizeGender = (value: string | null): string => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("female") || lower.includes("woman") || lower.includes("women"))
    return "female";
  if (lower.includes("male") || lower.includes("man") || lower.includes("men")) return "male";
  return lower;
};

const normalizeEducation = (value: string | null): string => {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.includes("doctorate") || lower.includes("phd")) return "postgraduate";
  if (lower.includes("postgraduate") || lower.includes("master")) return "postgraduate";
  if (lower.includes("graduate") || lower.includes("bachelor")) return "undergraduate";
  if (lower.includes("higher secondary") || lower.includes("12th")) return "higher_secondary";
  if (lower.includes("secondary") || lower.includes("10th")) return "secondary";
  if (lower.includes("primary")) return "primary";
  if (lower.includes("diploma")) return "diploma";
  return lower;
};

function scoreScheme(
  scheme: DemoScheme,
  profile: UserProfile,
): { score: number; reasons: string[]; missing: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const missing: string[] = [];
  let totalWeight = 0;

  // Gender check
  if (scheme.target_gender !== "all") {
    totalWeight += 15;
    const userGender = normalizeGender(profile.gender);
    if (!userGender) {
      missing.push("Gender information needed for this scheme");
    } else if (userGender === scheme.target_gender) {
      score += 15;
      reasons.push(`Your gender matches this scheme's target group`);
    }
  }

  // Age check
  if (scheme.min_age !== null || scheme.max_age !== null) {
    totalWeight += 15;
    if (profile.age === null) {
      missing.push("Age information needed for eligibility check");
    } else {
      const minAge = scheme.min_age ?? 0;
      const maxAge = scheme.max_age ?? 150;
      if (profile.age >= minAge && profile.age <= maxAge) {
        score += 15;
        reasons.push(`Your age (${profile.age}) falls within the eligible range`);
      }
    }
  }

  // Income check
  if (scheme.max_income !== null) {
    totalWeight += 20;
    if (profile.annual_income === null) {
      missing.push("Income information needed for eligibility check");
    } else if (profile.annual_income <= scheme.max_income!) {
      score += 20;
      reasons.push(
        `Your income (₹${profile.annual_income.toLocaleString("en-IN")}) is within the scheme limit`,
      );
    }
  }

  // State check
  if (scheme.states.length > 0 && scheme.states[0] !== "all") {
    totalWeight += 15;
    const userState = profile.state?.trim();
    if (!userState) {
      missing.push("State information needed for this scheme");
    } else if (scheme.states.some((s) => s.toLowerCase() === userState.toLowerCase())) {
      score += 15;
      reasons.push(`Your state (${userState}) matches this scheme's target region`);
    }
  }

  // Occupation check
  if (scheme.occupations.length > 0 && scheme.occupations[0] !== "all") {
    totalWeight += 10;
    const userOccupation = normalizeOccupation(profile.occupation);
    if (!userOccupation) {
      missing.push("Occupation information needed for better matching");
    } else if (scheme.occupations.includes(userOccupation)) {
      score += 10;
      reasons.push(`Your occupation matches this scheme's target group`);
    }
  }

  // Education check
  if (scheme.education_levels.length > 0 && scheme.education_levels[0] !== "all") {
    totalWeight += 10;
    const userEducation = normalizeEducation(profile.education_level);
    if (!userEducation) {
      missing.push("Education level needed for eligibility check");
    } else if (scheme.education_levels.includes(userEducation)) {
      score += 10;
      reasons.push(`Your education level matches the target group`);
    }
  }

  // Category check
  if (scheme.categories.length > 0) {
    totalWeight += 10;
    const userCategory = normalizeCategory(profile.category);
    if (!userCategory) {
      missing.push("Category information needed for targeted schemes");
    } else if (scheme.categories.includes(userCategory)) {
      score += 10;
      reasons.push(
        `Your category (${userCategory.toUpperCase()}) matches this scheme's target group`,
      );
    }
  }

  // Student check
  if (scheme.student_only) {
    totalWeight += 15;
    if (profile.is_student === null) {
      missing.push("Student status needed for this scheme");
    } else if (profile.is_student === true) {
      score += 15;
      reasons.push("Your student status qualifies you for this scheme");
    }
  }

  // Normalize score to 0-100
  const normalizedScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;

  // Give baseline score to schemes with no specific requirements
  const finalScore = totalWeight === 0 ? 60 : normalizedScore;

  return { score: finalScore, reasons, missing };
}

export function generateDemoRecommendations(profile: UserProfile): DemoRecommendation[] {
  const recommendations: DemoRecommendation[] = [];

  for (const scheme of demoSchemes) {
    const { score, reasons, missing } = scoreScheme(scheme, profile);

    // Only include schemes with score >= 50
    if (score < 50) continue;

    const matchBand = score >= 90 ? "strong" : score >= 75 ? "good" : "possible";

    // Build eligibility summary
    const eligibilitySummary = scheme.eligibility.map((e) => `Demo requirement: ${e}`);

    recommendations.push({
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      category: scheme.category,
      match_score: score,
      match_band: matchBand,
      why_matches:
        reasons.length > 0 ? reasons : ["This scheme may be relevant based on your profile"],
      missing_requirements: missing,
      eligibility_summary: eligibilitySummary,
      benefits: scheme.benefits,
      required_documents: scheme.documents_required,
      application_url: scheme.application_url,
      source_url: scheme.source_url,
      is_demo: true,
    });
  }

  // Sort by match score descending
  recommendations.sort((a, b) => b.match_score - a.match_score);

  return recommendations;
}

export function getDemoSchemeById(id: string): DemoScheme | undefined {
  return demoSchemes.find((s) => s.id === id);
}
