import { supabase } from "@/supabase";

export type SchemeRecord = {
  id: string;
  name: string;
  description: string;
  ministry: string;
  category: string;
  level: "Central" | "State";
  state: string | null;
  benefits: string[];
  eligibility: string[];
  documents_required: string[];
  application_url: string;
  status: "active" | "current" | "inactive";
  last_verified_at: string;
  source_url: string;
};

export type NormalizedUserProfile = Record<string, unknown> & {
  id: string;
  full_name: string;
  email: string;
};

export type SchemeMatch = SchemeRecord & {
  matchScore: number;
  whyMatches: string[];
};

export type RecommendationRecord = {
  id: string;
  scheme_id: string;
  scheme_name: string;
  ministry_or_department: string;
  government_level: string;
  state: string | null;
  category: string;
  short_description: string;
  match_score: number;
  match_band: "strong" | "good" | "possible";
  why_matches: string[];
  missing_requirements: string[];
  eligibility_summary: string[];
  benefits: string[];
  required_documents: string[];
  application_process: string[];
  official_application_url: string;
  official_source_url: string;
  status: string;
  last_verified_at: string;
  confidence_score: number;
  generated_at: string;
};
const safeArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

export async function fetchActiveSchemes() {
  // Primary query: follow expected status values
  const primary = await supabase
    .from("schemes")
    .select("*")
    .in("status", ["active", "current"])
    .order("last_verified_at", { ascending: false });

  if (primary.error) {
    // Surface the error to the caller so UI can display it
    throw new Error(primary.error.message || "Failed to load schemes");
  }

  let data = primary.data || [];

  // If primary returned no rows, try a permissive fallback that selects any non-inactive schemes.
  if (Array.isArray(data) && data.length === 0) {
    const fallback = await supabase
      .from("schemes")
      .select("*")
      .neq("status", "inactive")
      .order("last_verified_at", { ascending: false });
    if (fallback.error) {
      // If fallback also errors, throw the original primary error message (if any) or the fallback message
      throw new Error(fallback.error.message || "Failed to load schemes (fallback)");
    }
    data = fallback.data || [];
  }

  return (data || []).map((row) => ({
    ...row,
    benefits: safeArray(row.benefits),
    eligibility: safeArray(row.eligibility),
    documents_required: safeArray(row.documents_required),
  })) as SchemeRecord[];
}

export async function fetchUserProfile(userId: string) {
  const [{ data, error }, { data: authData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.auth.getUser(),
  ]);
  if (error) throw new Error(error.message);
  return {
    id: userId,
    ...(data as Record<string, string | null>),
    full_name: String(
      (data as Record<string, unknown>).full_name ||
        authData.user?.user_metadata?.full_name ||
        authData.user?.user_metadata?.name ||
        "",
    ),
    email: authData.user?.email || data.email || "",
  } as NormalizedUserProfile;
}

export async function fetchRecommendations(userId: string) {
  const { data, error } = await supabase
    .from("scheme_recommendations")
    .select("*")
    .eq("user_id", userId)
    .order("match_score", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row) => ({
    ...row,
    why_matches: safeArray(row.why_matches),
    missing_requirements: safeArray(row.missing_requirements),
    eligibility_summary: safeArray(row.eligibility_summary),
    benefits: safeArray(row.benefits),
    required_documents: safeArray(row.required_documents),
    application_process: safeArray(row.application_process),
  })) as RecommendationRecord[];
}

export async function generateRecommendations() {
  const { data, error } = await supabase.functions.invoke("generate-recommendations", { body: {} });
  if (error) throw new Error(error.message || "Unable to generate recommendations.");
  if (!data?.success) throw new Error(data?.error || "Unable to generate recommendations.");
  return data as { success: true; count: number; ai_explanation_available?: boolean };
}

export function matchSchemes(schemes: SchemeRecord[], profile: Record<string, unknown>) {
  const values = Object.values(profile)
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  return schemes
    .map((scheme): SchemeMatch => {
      const haystack = [scheme.name, scheme.description, scheme.category, ...scheme.eligibility]
        .join(" ")
        .toLowerCase();
      const matchedValues = values.filter((value) => value.length > 2 && haystack.includes(value));
      const score = Math.min(
        99,
        Math.round((matchedValues.length / Math.max(values.length, 1)) * 100),
      );
      return {
        ...scheme,
        matchScore: score,
        whyMatches: matchedValues.length
          ? [
              `Your profile information overlaps with ${matchedValues.length} published scheme condition${matchedValues.length === 1 ? "" : "s"}.`,
            ]
          : [
              "This scheme is shown for review against its published conditions; the authority makes the final decision.",
            ],
      };
    })
    .filter((scheme) => scheme.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
