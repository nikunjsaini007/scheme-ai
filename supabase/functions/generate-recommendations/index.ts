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
  benefits: string[]; eligibility: unknown; documents_required: string[]; application_url: string; status: string; last_verified_at: string; source_url: string;
};

function normalizeEligibility(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v ?? "")).filter(Boolean);
  if (value == null) return [];
  if (typeof value === "string") {
    const str = value.trim();
    // Try parse JSON array
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v ?? "")).filter(Boolean);
    } catch {
      // not JSON
    }
    return [str].filter(Boolean);
  }
  if (typeof value === "object") {
    try {
      const entries = Object.entries(value as Record<string, unknown>);
      return entries.map(([k, v]) => `${k}: ${Array.isArray(v) ? (v as any[]).join(", ") : String(v ?? "")}`).filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Return a deduplicated array of strings.
 * - Trims whitespace
 * - Removes empty strings
 * - Deduplicates case-insensitively while preserving the first-seen ordering
 */
function uniqueStrings(values: unknown): string[] {
  if (!values) return [];
  const arr = Array.isArray(values) ? values.map((v) => String(v ?? "")) : [String(values)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of arr) {
    const s = raw == null ? "" : String(raw).trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
type Recommendation = {
  scheme_id: string; match_score: number; confidence_score: number; why_matches: string[]; missing_requirements: string[];
  eligibility_summary: string[]; benefits: string[]; required_documents: string[]; application_process: string[];
};
const lower = (value: unknown) => String(value ?? "").trim().toLowerCase();
const numeric = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;
function deterministicMatch(candidate: Candidate, profile: Record<string, unknown>) {
  // Normalize eligibility to an array of strings before processing to avoid runtime errors
  const normalized = normalizeEligibility((candidate as any).eligibility);
  const tokens = normalized.map(lower);

  // Simple parser for common structured requirements inside the free-text eligibility tokens
  const req: {
    gender?: "female" | "male" | "all";
    studentRequired?: boolean;
    occupations?: string[];
    categories?: string[];
    minAge?: number | null;
    maxAge?: number | null;
    incomeMax?: number | null;
  } = {};
  for (const t of tokens) {
    if (/\b(female|woman|women|girl)\b/.test(t)) req.gender = "female";
    if (/\b(male|men)\b/.test(t)) req.gender = req.gender === "female" ? "all" : "male";
    if (/\bstudent\b/.test(t)) req.studentRequired = true;
    if (/\bfarmer\b/.test(t)) req.occupations = [...new Set([...(req.occupations || []), "farmer"])];
    if (/\b(entrepreneur|business|self[- ]?employed|selfemployed)\b/.test(t)) req.occupations = [...new Set([...(req.occupations || []), "entrepreneur"])];
    // category tokens
    if (/\b(sc|st|obc|ews|general)\b/.test(t)) {
      const found = t.match(/\b(sc|st|obc|ews|general)\b/g);
      req.categories = [...new Set([...(req.categories || []), ...(found || [])])];
    }
    // age ranges like 18-25 or 18 to 25
    const ageMatch = t.match(/(\d{1,3})\s*(?:-|to)\s*(\d{1,3})/);
    if (ageMatch) { req.minAge = Number(ageMatch[1]); req.maxAge = Number(ageMatch[2]); }
    // income hints (simple): look for 'up to X lakh' or 'below X lakh' or numbers with lakh/₹
    const incomeMatch = t.match(/(?:up to|below|less than|not exceed|maximum)?[^0-9]{0,12}(\d+(?:\.\d+)?)\s*(lakh)?/);
    if (incomeMatch) { const num = Number(incomeMatch[1]); const max = incomeMatch[2] ? num * 100000 : num; req.incomeMax = req.incomeMax ? Math.min(req.incomeMax, max) : max; }
  }

  const reasons: string[] = [];
  const missing: string[] = [];
  const blockers: string[] = [];

  // Helpers to normalize profile values
  const normGender = (v: unknown) => {
    const s = lower(v);
    if (!s) return null;
    if (/^f|female|woman|women|girl/.test(s)) return "female";
    if (/^m|male|man|men/.test(s)) return "male";
    return s || null;
  };
  const normOccupation = (v: unknown) => {
    const s = lower(v);
    if (!s) return null;
    if (s.includes("farmer")) return "farmer";
    if (s.includes("student")) return "student";
    if (s.includes("self") || s.includes("entrepreneur") || s.includes("business")) return "entrepreneur";
    if (s.includes("employ")) return "employed";
    return s;
  };
  const normCategory = (v: unknown) => {
    const s = lower(v);
    if (!s) return null;
    if (s.includes("sc")) return "sc";
    if (s.includes("st")) return "st";
    if (s.includes("obc")) return "obc";
    if (s.includes("ews")) return "ews";
    if (s.includes("general")) return "general";
    return s;
  };

  // Hard exclusion checks
  const profileGender = normGender(profile.gender);
  const profileOccupation = normOccupation(profile.occupation);
  const profileCategory = normCategory(profile.category);
  const age = numeric(profile.age);
  const income = numeric(profile.annual_income);

  // Gender hard blocker
  if (req.gender && req.gender !== "all") {
    if (!profileGender) {
      missing.push("[GENDER] Gender information is missing.");
    } else if (profileGender !== req.gender) {
      blockers.push(`[GENDER] This scheme requires ${req.gender} beneficiaries.`);
    } else {
      reasons.push("[GENDER] Your gender matches the published scheme conditions.");
    }
  }

  // Student hard blocker
  if (req.studentRequired) {
    if (profile.is_student === null || profile.is_student === undefined) missing.push("[STUDENT] Student status is missing.");
    else if (!profile.is_student) blockers.push("[STUDENT] This scheme is intended for students.");
    else reasons.push("[STUDENT] Your student status matches the published target group.");
  }

  // Occupation hard blocker (e.g., farmer)
  if (req.occupations && req.occupations.length) {
    if (!profileOccupation) missing.push("[OCCUPATION] Occupation information is missing.");
    else if (!req.occupations.includes(profileOccupation)) {
      // if occupation requirement exists and profile occupation known but not matching -> blocker
      blockers.push("[OCCUPATION] This scheme targets " + req.occupations.join(", ") + ", your occupation does not match.");
    } else reasons.push("[OCCUPATION] Your occupation matches the published scheme conditions.");
  }

  // Category blocker
  if (req.categories && req.categories.length) {
    if (!profileCategory) missing.push("[CATEGORY] Category information is missing.");
    else if (!req.categories.includes(profileCategory)) blockers.push("[CATEGORY] Your category does not match the published target group.");
    else reasons.push("[CATEGORY] Your category matches the published scheme conditions.");
  }

  // State hard blocker (candidate.state is authoritative)
  if (candidate.state) {
    if (!profile.state) missing.push("[STATE] State information is missing.");
    else if (lower(candidate.state) !== lower(profile.state)) blockers.push(`[STATE] This scheme is listed for ${candidate.state}, not ${String(profile.state)}.`);
    else reasons.push(`[STATE] Your state matches ${candidate.state}.`);
  }

  // Age checks
  if (req.minAge || req.maxAge) {
    if (!age) missing.push("[AGE] Age information is missing.");
    else {
      const min = req.minAge ?? 0; const max = req.maxAge ?? 200;
      if (age < min || age > max) blockers.push(`[AGE] Your age (${age}) does not fit the published age range.`);
      else reasons.push("[AGE] Your age is consistent with the published conditions.");
    }
  }

  // Income checks
  if (req.incomeMax) {
    if (!income) missing.push("[INCOME] Annual income information is missing.");
    else if (income > req.incomeMax) blockers.push(`[INCOME] Your annual income exceeds the published limit of ₹${req.incomeMax.toLocaleString("en-IN")}.`);
    else reasons.push("[INCOME] Your annual income is within the published limit.");
  }

  // Disability check (best-effort detection in free-text)
  if (tokens.some((t) => t.includes("disabil") || t.includes("divyang"))) {
    if (profile.disability_status === null || profile.disability_status === undefined) missing.push("[DISABILITY] Disability information is missing.");
    else if (profile.disability_status) reasons.push("[DISABILITY] Your disability information matches a published target group.");
    else blockers.push("[DISABILITY] This scheme requires disability-related eligibility.");
  }

  // Build a simple relevance scoring from positive reasons vs total considered
  const applicable = Math.max(1, reasons.length + missing.length + blockers.length);
  const points = reasons.length;
  const score = Math.round((points / applicable) * 100);

  // If any blockers exist that are clearly hard exclusions, mark not_eligible
  const hardExclusion = blockers.length > 0 && reasons.length === 0;
  const status = hardExclusion ? "not_eligible" : (missing.length && !blockers.length ? "needs_information" : score >= 90 ? "eligible" : score >= 60 ? "likely_eligible" : "partially_matched");

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
    // Log a safe diagnostic showing which profile fields are present (true/false) without printing sensitive values
    // Log a safe diagnostic showing which profile fields are present and the normalized gender for debugging
    const normalizedGender = (val: unknown) => {
      const s = String(val ?? "").trim().toLowerCase();
      if (!s) return null;
      if (/^(m|male|man|men)$/.test(s) || s.startsWith("m")) return "male";
      if (/^(f|female|woman|women|girl|daughter)$/.test(s) || s.startsWith("f") || s.includes("girl") || s.includes("daughter")) return "female";
      return s;
    };
    const genderNorm = normalizedGender(profileRow.gender);
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "profile_loaded", user_id: userId, profile_snapshot: { age: profile.age ?? null, gender_raw: profileRow.gender ?? null, gender_normalized: genderNorm, state: profile.state ?? null, district: profile.district ?? null, occupation: profile.occupation ?? null, annual_income: profile.annual_income ?? null, education_level: profile.education_level ?? null, category: profile.category ?? null, marital_status: profile.marital_status ?? null, is_student: profile.is_student ?? null } }));
    // Do not block recommendation generation when some profile fields are missing. Deterministic evaluation will mark missing fields where appropriate.
    const { data: candidates, error: schemeError } = await supabase.from("schemes").select("*").in("status", ["active", "current"]);
    if (schemeError) throw new Error(`Scheme lookup failed: ${schemeError.message}`);
    const verifiedCandidates = (candidates || []).filter((candidate: Candidate) => typeof candidate.name === "string" && candidate.name.trim().length > 0) as Candidate[];
    // Sanitize and normalize eligibility for each candidate to avoid runtime errors where eligibility is not an array
    const sanitizedCandidates = verifiedCandidates.map((candidate) => ({ ...candidate, eligibility: normalizeEligibility(candidate.eligibility) }));
    // Log eligibility shapes for debugging without leaking sensitive data
    sanitizedCandidates.forEach((c) => console.info(JSON.stringify({ function: "generate-recommendations", stage: "scheme_eligibility_shape", scheme_id: c.id, eligibility_type: typeof (c as any).eligibility, eligibility_is_array: Array.isArray((c as any).eligibility) })));
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "schemes_loaded", user_id: userId, retrieved_count: (candidates || []).length, verified_count: sanitizedCandidates.length }));

    // Build deterministic evaluations robustly — do not let one bad candidate crash the whole process
    const deterministic = new Map<string, ReturnType<typeof deterministicMatch>>();
    for (const candidate of sanitizedCandidates) {
      try {
        const evalResult = deterministicMatch(candidate as unknown as Candidate, profile);
        deterministic.set(candidate.id, evalResult);
      } catch (e) {
        console.error(JSON.stringify({ function: "generate-recommendations", stage: "deterministic_error", scheme_id: candidate.id, error: errorText(e) }));
        deterministic.set(candidate.id, { score: 50, status: "needs_information", reasons: [], missing: ["Eligibility data could not be parsed"], blockers: [] });
      }
    }

    // Log per-scheme deterministic evaluation for traceability (name, status, blockers)
    sanitizedCandidates.forEach((candidate) => {
      const evalResult = deterministic.get(candidate.id) || { status: "needs_information", reasons: [], missing: [], blockers: [] };
      console.info(JSON.stringify({ function: "generate-recommendations", stage: "scheme_evaluation", scheme_id: candidate.id, scheme_name: candidate.name, status: evalResult.status, reasons_count: (evalResult.reasons || []).length, missing_count: (evalResult.missing || []).length, blockers: evalResult.blockers }));
    });

    const relevantCandidates = sanitizedCandidates.filter((candidate) => deterministic.get(candidate.id)?.status !== "not_eligible");
    const hardExclusions = sanitizedCandidates.length - relevantCandidates.length;
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "eligibility_evaluated", user_id: userId, candidate_count: sanitizedCandidates.length, relevant_count: relevantCandidates.length, hard_exclusions: hardExclusions }));
    if (!sanitizedCandidates.length) return response({ success: true, count: 0, message: "No verified current scheme records are available." });

    // Use sanitized candidates (normalized eligibility) in the prompt to Gemini
  const prompt = `You are SchemeAI's government-scheme explanation layer. Deterministic eligibility scores and reasons are authoritative. Use ONLY the verified scheme candidates supplied below. Do not invent, rename, merge, or supplement schemes. Do not invent URLs, ministries, benefits, deadlines, eligibility rules, or missing profile data. Recommend only current candidates with deterministic score >= 50. Final eligibility is decided by the government authority.

USER PROFILE (null/empty means unknown; never assume it):
${JSON.stringify(profile)}

DETERMINISTIC EVALUATIONS:
${JSON.stringify(Object.fromEntries(deterministic))}

RETRIEVED RELEVANT CANDIDATES (these are the only schemes you may recommend):
${JSON.stringify(relevantCandidates.map((c) => ({ ...c, eligibility: c.eligibility })))}

Return ONLY JSON in this exact shape: {"recommendations":[{"scheme_id":"candidate id","match_score":0,"confidence_score":0,"why_matches":[],"missing_requirements":[],"eligibility_summary":[],"benefits":[],"required_documents":[],"application_process":[]}]}. Scores must be based only on conditions and profile fields. Use 90-100 strong, 75-89 good, 50-74 possible; omit scores below 50. Never say the user is definitely eligible. Mention unknown important conditions as 'Need more information: [field]'. Keep arrays concise. URLs and scheme identity must come from candidates.`;
    let parsed: { recommendations?: Recommendation[] };
    let usedFallback = false;

    // Log the candidate names that will be sent to Gemini for ranking/personalization
    try {
      console.info(JSON.stringify({ function: "generate-recommendations", stage: "gemini_candidates", count: relevantCandidates.length, names: relevantCandidates.map((c) => c.name) }));
    } catch (_) {
      // ignore logging failures
    }

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
      parsed = { recommendations: relevantCandidates.map((candidate) => ({ scheme_id: candidate.id, match_score: deterministic.get(candidate.id)?.score || 0, confidence_score: 0.5, why_matches: uniqueStrings(deterministic.get(candidate.id)?.reasons || []), missing_requirements: uniqueStrings(deterministic.get(candidate.id)?.missing || []), eligibility_summary: uniqueStrings(deterministic.get(candidate.id)?.blockers || (Array.isArray(candidate.eligibility) ? candidate.eligibility : normalizeEligibility(candidate.eligibility))), benefits: uniqueStrings(candidate.benefits || []), required_documents: uniqueStrings(candidate.documents_required || []), application_process: [] })) };    }
    const byId = new Map(sanitizedCandidates.map((candidate) => [candidate.id, candidate]));
    let selectedRecommendations = parsed.recommendations || [];
    if (!selectedRecommendations.length) {
      usedFallback = true;
      if (relevantCandidates.length) {
        selectedRecommendations = relevantCandidates.map((candidate) => ({ scheme_id: candidate.id, match_score: deterministic.get(candidate.id)?.score || 50, confidence_score: 0.5, why_matches: uniqueStrings(deterministic.get(candidate.id)?.reasons || []), missing_requirements: uniqueStrings(deterministic.get(candidate.id)?.missing || ["Eligibility needs verification from the official scheme authority."]), eligibility_summary: uniqueStrings(deterministic.get(candidate.id)?.blockers || (Array.isArray(candidate.eligibility) ? candidate.eligibility : normalizeEligibility(candidate.eligibility))), benefits: uniqueStrings(candidate.benefits || []), required_documents: uniqueStrings(candidate.documents_required || []), application_process: [] }));
        console.info(JSON.stringify({ function: "generate-recommendations", stage: "empty_gemini_fallback", user_id: userId, fallback_count: selectedRecommendations.length }));
      } else {
        // No eligible candidates after deterministic filtering. Do not fall back to the full catalogue.
        console.info(JSON.stringify({ function: "generate-recommendations", stage: "no_eligible_candidates", user_id: userId, total_candidates: sanitizedCandidates.length }));
        // Clear any existing cached recommendations for the user to prevent stale results
        const { error: deleteExisting } = await supabase.from("scheme_recommendations").delete().eq("user_id", userId);
        if (deleteExisting) console.error(JSON.stringify({ function: "generate-recommendations", stage: "clear_cache_failed", user_id: userId, error: deleteExisting.message }));
        return response({ success: true, count: 0, message: "No eligible schemes found for the current profile." });
      }
    }
    let recommendations = selectedRecommendations.filter((item) => {
      const candidate = byId.get(item.scheme_id);
      return candidate && deterministic.get(item.scheme_id)?.status !== "not_eligible" && Number(item.confidence_score) >= 0 && Number(item.confidence_score) <= 1;
    }).map((item) => {
      const candidate = byId.get(item.scheme_id)!;
      const evaluation = deterministic.get(candidate.id)!;
      const score = evaluation.score;
      return { user_id: userId, scheme_id: candidate.id, scheme_name: candidate.name, ministry_or_department: candidate.ministry, government_level: candidate.level, state: candidate.state, category: candidate.category, short_description: candidate.description, match_score: score, match_band: score >= 90 ? "strong" : score >= 75 ? "good" : "possible", why_matches: uniqueStrings([...(evaluation.reasons || []), ...(item.why_matches || [])]).slice(0, 6), missing_requirements: uniqueStrings([...(evaluation.missing || []), ...(item.missing_requirements || [])]).slice(0, 6), eligibility_summary: uniqueStrings([...(evaluation.blockers || []), ...(item.eligibility_summary || (Array.isArray(candidate.eligibility) ? candidate.eligibility : normalizeEligibility(candidate.eligibility)))]).slice(0, 8), benefits: uniqueStrings([...(candidate.benefits || []), ...(item.benefits || [])]), required_documents: uniqueStrings([...(candidate.documents_required || []), ...(item.required_documents || [])]), application_process: uniqueStrings(item.application_process || []), official_application_url: candidate.application_url, official_source_url: candidate.source_url, status: candidate.status, last_verified_at: candidate.last_verified_at, confidence_score: Number(item.confidence_score), generated_at: new Date().toISOString() };
    }).sort((a, b) => b.match_score - a.match_score);

    // Deduplicate by scheme_id before saving
    try {
      const seen = new Set<string>();
      const deduped: typeof recommendations = [];
      for (const r of recommendations) {
        if (seen.has(r.scheme_id)) continue;
        seen.add(r.scheme_id);
        deduped.push(r);
      }
      recommendations = deduped;
    } catch (e) {
      console.error(JSON.stringify({ function: "generate-recommendations", stage: "dedupe_failed", error: errorText(e) }));
    }

    // Log final recommendations (names) for traceability
    try {
      console.info(JSON.stringify({ function: "generate-recommendations", stage: "final_recommendations", user_id: userId, count: recommendations.length, names: recommendations.map((r) => r.scheme_name) }));
    } catch (_) {}

    const { error: deleteError } = await supabase.from("scheme_recommendations").delete().eq("user_id", userId);
    if (deleteError) throw new Error(`Recommendation cache clear failed: ${deleteError.message}`);
    if (recommendations.length) { const { error: insertError } = await supabase.from("scheme_recommendations").insert(recommendations); if (insertError) throw new Error(`Recommendation save failed: ${insertError.message}`); }
    console.info(JSON.stringify({ function: "generate-recommendations", stage: "recommendations_saved", user_id: userId, gemini_count: selectedRecommendations.length, final_count: recommendations.length, used_fallback: usedFallback }));
    const outputRecs = recommendations.map(({ user_id, ...rest }) => rest);
    return response({ success: true, count: recommendations.length, ai_explanation_available: !usedFallback, recommendations: outputRecs, aiEnhanced: !usedFallback });
  } catch (error) {
    console.error(JSON.stringify({ function: "generate-recommendations", user_id: userId, error: errorText(error) }));
    return response({ success: false, error: "Unable to generate personalized recommendations right now. Please try again." }, 502);
  }
});
