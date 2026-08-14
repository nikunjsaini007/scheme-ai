import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error);
const officialHost = (value: string) => {
  try { const host = new URL(value).hostname.toLowerCase(); return host.endsWith(".gov.in") || host.endsWith(".nic.in") || host === "gov.in" || host === "nic.in"; } catch { return false; }
};

type Candidate = {
  id: string; name: string; description: string; ministry: string; category: string; level: string; state: string | null;
  benefits: string[]; eligibility: string[]; documents_required: string[]; application_url: string; status: string; last_verified_at: string; source_url: string;
};
type Recommendation = {
  scheme_id: string; match_score: number; confidence_score: number; why_matches: string[]; missing_requirements: string[];
  eligibility_summary: string[]; benefits: string[]; required_documents: string[]; application_process: string[];
};
const lower = (value: unknown) => String(value ?? "").trim().toLowerCase();
const numeric = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;
function deterministicMatch(candidate: Candidate, profile: Record<string, unknown>) {
  const rules = candidate.eligibility.map(lower).join(" ");
  const reasons: string[] = [];
  const missing: string[] = [];
  const blockers: string[] = [];
  let points = 0; let applicable = 0;
  const valueCheck = (field: string, words: string[], label: string) => {
    if (!words.some((word) => rules.includes(word))) return;
    applicable += 1;
    const value = lower(profile[field]);
    if (!value) { missing.push(`${label} information is missing.`); return; }
    if (words.some((word) => value.includes(word) && rules.includes(word))) { points += 1; reasons.push(`${label} matches the published scheme conditions.`); }
    else blockers.push(`${label} does not match the published scheme conditions.`);
  };
  if (candidate.state) {
    applicable += 1;
    if (!profile.state) missing.push("State information is missing.");
    else if (lower(candidate.state) === lower(profile.state)) { points += 1; reasons.push(`Your state matches ${candidate.state}.`); }
    else blockers.push(`This scheme is listed for ${candidate.state}, not ${String(profile.state)}.`);
  }
  if (/district|local area|resid/.test(rules)) {
    applicable += 1;
    if (!profile.district) missing.push("District information is missing.");
    else if (rules.includes(lower(profile.district))) { points += 1; reasons.push("Your district is consistent with the published conditions."); }
    else blockers.push("Your district is not listed in the published conditions.");
  }
  const age = numeric(profile.age);
  if (/\bage\b|\baged\b|years? old/.test(rules)) { applicable += 1; if (!age) missing.push("Age information is missing."); else { const ranges = [...rules.matchAll(/(\d{1,3})\s*(?:-|to)\s*(\d{1,3})/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]); if (!ranges.length || ranges.some(([min, max]) => age >= min && age <= max)) { points += 1; reasons.push("Your age is consistent with the published conditions."); } else blockers.push(`Your age (${age}) does not fit the published age range.`); } }
  const income = numeric(profile.annual_income);
  if (/income|annual|lakh|rupee|₹/.test(rules)) { applicable += 1; if (!income) missing.push("Annual income information is missing."); else { const match = rules.match(/(?:up to|below|less than|not exceed|maximum)[^0-9]{0,12}(\d+(?:\.\d+)?)\s*(lakh)?/); const max = match ? Number(match[1]) * (match[2] ? 100000 : 1) : 0; if (!max || income <= max) { points += 1; reasons.push("Your annual income is within the published limit or no exact limit is available."); } else blockers.push(`Your annual income exceeds the published limit of ₹${max.toLocaleString("en-IN")}.`); } }
  valueCheck("occupation", ["farmer", "student", "employed", "self-employed", "unemployed", "homemaker", "retired", "worker", "entrepreneur"], "Your occupation");
  valueCheck("gender", ["women", "woman", "female", "girl", "men", "male"], "Your gender");
  valueCheck("category", ["sc", "st", "obc", "ews", "general", "caste"], "Your category");
  valueCheck("education_level", ["student", "school", "college", "education", "graduate", "undergraduate", "postgraduate", "diploma"], "Your education");
  if (/student|students/.test(rules) && !/occupation/.test(rules)) {
    applicable += 1;
    if (profile.is_student === null || profile.is_student === undefined) missing.push("Student status is missing.");
    else if (profile.is_student) { points += 1; reasons.push("Your student status matches the published target group."); }
    else blockers.push("This scheme is intended for students.");
  }
  valueCheck("marital_status", ["single", "married", "divorced", "widowed", "family", "household"], "Your family or marital information");
  if (/disabil|divyang|special needs/.test(rules)) { applicable += 1; if (profile.disability_status === null || profile.disability_status === undefined) missing.push("Disability information is missing."); else if (profile.disability_status) { points += 1; reasons.push("Your disability information matches a published target group."); } else blockers.push("This scheme requires disability-related eligibility."); }
  const score = applicable ? Math.round((points / applicable) * 100) : 50;
  const status = blockers.length && points === 0 ? "not_eligible" : missing.length && !blockers.length ? "needs_information" : score >= 90 ? "eligible" : score >= 60 ? "likely_eligible" : "partially_matched";
  return { score: Math.min(100, Math.max(0, score)), status, reasons, missing, blockers };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ success: false, error: "Method not allowed" }, 405);
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash";
  if (!token || !supabaseUrl || !anonKey) return response({ success: false, error: "Recommendation service is not configured" }, 503);

  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return response({ success: false, error: "Authentication required" }, 401);
  const userId = authData.user.id;
  try {
    const { data: profileRow, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (profileError || !profileRow) return response({ success: false, error: "Profile not found", stage: "profile_lookup" }, 400);
    const profile = {
      age: profileRow.age ?? null,
      gender: profileRow.gender ?? null,
      state: profileRow.state ?? null,
      district: profileRow.district ?? null,
      pincode: profileRow.pincode ?? null,
      occupation: profileRow.occupation ?? null,
      annual_income: profileRow.annual_income ?? null,
      education_level: profileRow.education_level ?? null,
      category: profileRow.category ?? null,
      disability_status: profileRow.disability_status ?? null,
      marital_status: profileRow.marital_status ?? null,
      is_student: profileRow.is_student ?? null,
    };
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "profile_loaded", user_id: userId, fields_present: Object.entries(profile).filter(([, value]) => value !== null && value !== "").map(([key]) => key) }));
    const requiredProfileFields = [profile.age, profile.occupation, profile.state, profile.annual_income];
    if (requiredProfileFields.some((value) => !value)) return response({ success: false, error: "Complete personalization before generating recommendations.", stage: "profile_validation" }, 400);
    const { data: candidates, error: schemeError } = await supabase.from("schemes").select("*").in("status", ["active", "current"]);
    if (schemeError) throw new Error(`Scheme lookup failed: ${schemeError.message}`);
    const verifiedCandidates = (candidates || []).filter((candidate: Candidate) => typeof candidate.name === "string" && candidate.name.trim().length > 0) as Candidate[];
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "schemes_loaded", user_id: userId, retrieved_count: (candidates || []).length, verified_count: verifiedCandidates.length }));
    const deterministic = new Map(verifiedCandidates.map((candidate) => [candidate.id, deterministicMatch(candidate, profile)]));
    const relevantCandidates = verifiedCandidates.filter((candidate) => deterministic.get(candidate.id)?.status !== "not_eligible");
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "eligibility_evaluated", user_id: userId, candidate_count: verifiedCandidates.length, relevant_count: relevantCandidates.length }));
    if (!verifiedCandidates.length) return response({ success: true, count: 0, message: "No verified current scheme records are available." });

    const prompt = `You are SchemeAI's government-scheme explanation layer. Deterministic eligibility scores and reasons are authoritative. Use ONLY the verified scheme candidates supplied below. Do not invent, rename, merge, or supplement schemes. Do not invent URLs, ministries, benefits, deadlines, eligibility rules, or missing profile data. Recommend only current candidates with deterministic score >= 50. Final eligibility is decided by the government authority.

USER PROFILE (null/empty means unknown; never assume it):
${JSON.stringify(profile)}

DETERMINISTIC EVALUATIONS:
${JSON.stringify(Object.fromEntries(deterministic))}

RETRIEVED RELEVANT CANDIDATES (these are the only schemes you may recommend):
${JSON.stringify(relevantCandidates)}

Return ONLY JSON in this exact shape: {"recommendations":[{"scheme_id":"candidate id","match_score":0,"confidence_score":0,"why_matches":[],"missing_requirements":[],"eligibility_summary":[],"benefits":[],"required_documents":[],"application_process":[]}]}. Scores must be based only on conditions and profile fields. Use 90-100 strong, 75-89 good, 50-74 possible; omit scores below 50. Never say the user is definitely eligible. Mention unknown important conditions as 'Need more information: [field]'. Keep arrays concise. URLs and scheme identity must come from candidates.`;
    let parsed: { recommendations?: Recommendation[] };
    let usedFallback = false;
    try {
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: "application/json" } }) });
      if (!geminiResponse.ok) throw new Error(`Gemini ${geminiResponse.status}: ${(await geminiResponse.text()).slice(0, 300)}`);
      const payload = await geminiResponse.json();
      const text = payload.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
      if (!text) throw new Error("Gemini returned an empty recommendation result");
      parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/\s*```$/, "")) as { recommendations?: Recommendation[] };
    } catch (error) {
      usedFallback = true;
      console.error(JSON.stringify({ function: "generate-recommendations", stage: "gemini_fallback", user_id: userId, error: errorText(error) }));
      parsed = { recommendations: relevantCandidates.map((candidate) => ({ scheme_id: candidate.id, match_score: deterministic.get(candidate.id)?.score || 0, confidence_score: 0.5, why_matches: deterministic.get(candidate.id)?.reasons || [], missing_requirements: deterministic.get(candidate.id)?.missing || [], eligibility_summary: deterministic.get(candidate.id)?.blockers || candidate.eligibility, benefits: candidate.benefits, required_documents: candidate.documents_required, application_process: [] })) };
    }
    const byId = new Map(verifiedCandidates.map((candidate) => [candidate.id, candidate]));
    let selectedRecommendations = parsed.recommendations || [];
    if (!selectedRecommendations.length) {
      usedFallback = true;
      selectedRecommendations = (relevantCandidates.length ? relevantCandidates : verifiedCandidates).map((candidate) => ({ scheme_id: candidate.id, match_score: deterministic.get(candidate.id)?.score || 50, confidence_score: 0.5, why_matches: deterministic.get(candidate.id)?.reasons || [], missing_requirements: deterministic.get(candidate.id)?.missing || ["Eligibility needs verification from the official scheme authority."], eligibility_summary: deterministic.get(candidate.id)?.blockers || candidate.eligibility, benefits: candidate.benefits, required_documents: candidate.documents_required, application_process: [] }));
      console.info(JSON.stringify({ function: "generate-recommendations", stage: "empty_gemini_fallback", user_id: userId, fallback_count: selectedRecommendations.length }));
    }
    const recommendations = selectedRecommendations.filter((item) => {
      const candidate = byId.get(item.scheme_id);
      return candidate && deterministic.get(item.scheme_id)?.status !== "not_eligible" && Number(item.confidence_score) >= 0 && Number(item.confidence_score) <= 1;
    }).map((item) => {
      const candidate = byId.get(item.scheme_id)!;
      const evaluation = deterministic.get(candidate.id)!;
      const score = evaluation.score;
      return { user_id: userId, scheme_id: candidate.id, scheme_name: candidate.name, ministry_or_department: candidate.ministry, government_level: candidate.level, state: candidate.state, category: candidate.category, short_description: candidate.description, match_score: score, match_band: score >= 90 ? "strong" : score >= 75 ? "good" : "possible", why_matches: [...evaluation.reasons, ...(item.why_matches || [])].slice(0, 6), missing_requirements: [...evaluation.missing, ...(item.missing_requirements || [])].slice(0, 6), eligibility_summary: [...evaluation.blockers, ...(item.eligibility_summary || candidate.eligibility)].slice(0, 8), benefits: candidate.benefits, required_documents: candidate.documents_required, application_process: item.application_process || [], official_application_url: candidate.application_url, official_source_url: candidate.source_url, status: candidate.status, last_verified_at: candidate.last_verified_at, confidence_score: Number(item.confidence_score), generated_at: new Date().toISOString() };
    }).sort((a, b) => b.match_score - a.match_score);
    const { error: deleteError } = await supabase.from("scheme_recommendations").delete().eq("user_id", userId);
    if (deleteError) throw new Error(`Recommendation cache clear failed: ${deleteError.message}`);
    if (recommendations.length) { const { error: insertError } = await supabase.from("scheme_recommendations").insert(recommendations); if (insertError) throw new Error(`Recommendation save failed: ${insertError.message}`); }
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "recommendations_saved", user_id: userId, gemini_count: selectedRecommendations.length, final_count: recommendations.length, used_fallback: usedFallback }));
    return response({ success: true, count: recommendations.length, ai_explanation_available: !usedFallback });
  } catch (error) {
    console.error(JSON.stringify({ function: "generate-recommendations", user_id: userId, error: errorText(error) }));
    return response({ success: false, error: "Unable to generate personalized recommendations right now. Please try again." }, 502);
  }
});
