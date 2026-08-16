import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

type Candidate = {
  id: string;
  name: string;
  description: string;
  ministry: string;
  category: string;
  level: string;
  state: string | null;
  benefits: string[];
  eligibility: unknown;
  documents_required: string[];
  application_url: string;
  status: string;
  last_verified_at: string;
  source_url: string;
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
      return entries
        .map(
          ([k, v]) => `${k}: ${Array.isArray(v) ? (v as unknown[]).join(", ") : String(v ?? "")}`,
        )
        .filter(Boolean);
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
  scheme_id: string;
  match_score: number;
  confidence_score: number;
  why_matches: string[];
  missing_requirements: string[];
  eligibility_summary: string[];
  benefits: string[];
  required_documents: string[];
  application_process: string[];
};
const lower = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();
const numeric = (value: unknown) => Number(String(value ?? "").replace(/[^0-9.]/g, "")) || 0;
function deterministicMatch(candidate: Candidate, profile: Record<string, unknown>) {
  // Normalize eligibility to an array of strings before processing to avoid runtime errors
  const normalized = normalizeEligibility(candidate.eligibility);
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
    if (/\bfarmer\b/.test(t))
      req.occupations = [...new Set([...(req.occupations || []), "farmer"])];
    if (/\b(entrepreneur|business|self[- ]?employed|selfemployed)\b/.test(t))
      req.occupations = [...new Set([...(req.occupations || []), "entrepreneur"])];
    // category tokens
    if (/\b(sc|st|obc|ews|general)\b/.test(t)) {
      const found = t.match(/\b(sc|st|obc|ews|general)\b/g);
      req.categories = [...new Set([...(req.categories || []), ...(found || [])])];
    }
    // age ranges like 18-25 or 18 to 25
    const ageMatch = t.match(/(\d{1,3})\s*(?:-|to)\s*(\d{1,3})/);
    if (ageMatch) {
      req.minAge = Number(ageMatch[1]);
      req.maxAge = Number(ageMatch[2]);
    }
    // income hints (simple): look for 'up to X lakh' or 'below X lakh' or numbers with lakh/₹
    const incomeMatch = t.match(
      /(?:up to|below|less than|not exceed|maximum)?[^0-9]{0,12}(\d+(?:\.\d+)?)\s*(lakh)?/,
    );
    if (incomeMatch) {
      const num = Number(incomeMatch[1]);
      const max = incomeMatch[2] ? num * 100000 : num;
      req.incomeMax = req.incomeMax ? Math.min(req.incomeMax, max) : max;
    }
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
    if (s.includes("self") || s.includes("entrepreneur") || s.includes("business"))
      return "entrepreneur";
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
    if (profile.is_student === null || profile.is_student === undefined)
      missing.push("[STUDENT] Student status is missing.");
    else if (!profile.is_student) blockers.push("[STUDENT] This scheme is intended for students.");
    else reasons.push("[STUDENT] Your student status matches the published target group.");
  }

  // Occupation hard blocker (e.g., farmer)
  if (req.occupations && req.occupations.length) {
    if (!profileOccupation) missing.push("[OCCUPATION] Occupation information is missing.");
    else if (!req.occupations.includes(profileOccupation)) {
      // if occupation requirement exists and profile occupation known but not matching -> blocker
      blockers.push(
        "[OCCUPATION] This scheme targets " +
          req.occupations.join(", ") +
          ", your occupation does not match.",
      );
    } else reasons.push("[OCCUPATION] Your occupation matches the published scheme conditions.");
  }

  // Category blocker
  if (req.categories && req.categories.length) {
    if (!profileCategory) missing.push("[CATEGORY] Category information is missing.");
    else if (!req.categories.includes(profileCategory))
      blockers.push("[CATEGORY] Your category does not match the published target group.");
    else reasons.push("[CATEGORY] Your category matches the published scheme conditions.");
  }

  // State hard blocker (candidate.state is authoritative)
  if (candidate.state) {
    if (!profile.state) missing.push("[STATE] State information is missing.");
    else if (lower(candidate.state) !== lower(profile.state))
      blockers.push(
        `[STATE] This scheme is listed for ${candidate.state}, not ${String(profile.state)}.`,
      );
    else reasons.push(`[STATE] Your state matches ${candidate.state}.`);
  }

  // Age checks
  if (req.minAge || req.maxAge) {
    if (!age) missing.push("[AGE] Age information is missing.");
    else {
      const min = req.minAge ?? 0;
      const max = req.maxAge ?? 200;
      if (age < min || age > max)
        blockers.push(`[AGE] Your age (${age}) does not fit the published age range.`);
      else reasons.push("[AGE] Your age is consistent with the published conditions.");
    }
  }

  // Income checks
  if (req.incomeMax) {
    if (!income) missing.push("[INCOME] Annual income information is missing.");
    else if (income > req.incomeMax)
      blockers.push(
        `[INCOME] Your annual income exceeds the published limit of ₹${req.incomeMax.toLocaleString("en-IN")}.`,
      );
    else reasons.push("[INCOME] Your annual income is within the published limit.");
  }

  // Disability check (best-effort detection in free-text)
  if (tokens.some((t) => t.includes("disabil") || t.includes("divyang"))) {
    if (profile.disability_status === null || profile.disability_status === undefined)
      missing.push("[DISABILITY] Disability information is missing.");
    else if (profile.disability_status)
      reasons.push("[DISABILITY] Your disability information matches a published target group.");
    else blockers.push("[DISABILITY] This scheme requires disability-related eligibility.");
  }

  // ──────────────────────────────────────────────────────────
  // WEIGHTED SCORING
  // ──────────────────────────────────────────────────────────
  // Only award points for conditions that actually apply to this scheme.
  // Hard blockers = 0 score regardless of reasons.
  let score = 0;
  let totalWeight = 0;

  const hasHardBlocker = blockers.length > 0;

  // Gender match: +15 if scheme has gender requirement and user matches
  if (req.gender && req.gender !== "all") {
    totalWeight += 15;
    if (!hasHardBlocker && profileGender === req.gender) score += 15;
  }

  // State match: +20 if scheme is state-specific and user matches
  if (candidate.state) {
    totalWeight += 20;
    if (!hasHardBlocker && profile.state && lower(candidate.state) === lower(profile.state))
      score += 20;
  }

  // Age match: +15 if scheme has age requirement and user matches
  if (req.minAge || req.maxAge) {
    totalWeight += 15;
    if (!hasHardBlocker && age) {
      const min = req.minAge ?? 0;
      const max = req.maxAge ?? 200;
      if (age >= min && age <= max) score += 15;
    }
  }

  // Income match: +20 if scheme has income requirement and user matches
  if (req.incomeMax) {
    totalWeight += 20;
    if (!hasHardBlocker && income && income <= req.incomeMax) score += 20;
  }

  // Occupation match: +15 if scheme has occupation requirement and user matches
  if (req.occupations && req.occupations.length) {
    totalWeight += 15;
    if (!hasHardBlocker && profileOccupation && req.occupations.includes(profileOccupation))
      score += 15;
  }

  // Category match: +10 if scheme has category requirement and user matches
  if (req.categories && req.categories.length) {
    totalWeight += 10;
    if (!hasHardBlocker && profileCategory && req.categories.includes(profileCategory)) score += 10;
  }

  // Education bonus: +5 if scheme is education-related and user is a student or graduate
  if (tokens.some((t) => /education|scholarship|student|college|university/.test(t))) {
    totalWeight += 5;
    if (
      !hasHardBlocker &&
      (profile.is_student ||
        lower(profile.education_level).includes("graduate") ||
        lower(profile.education_level).includes("postgraduate"))
    )
      score += 5;
  }

  // Student bonus: +5 if scheme is student-related
  if (req.studentRequired) {
    totalWeight += 5;
    if (!hasHardBlocker && profile.is_student) score += 5;
  }

  // Normalize score to 0-100
  const normalizedScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;

  // If no specific conditions were parsed, give a baseline score for schemes with no requirements
  const finalScore =
    totalWeight === 0 && !hasHardBlocker
      ? 50 // Schemes with no detectable requirements get a baseline score
      : normalizedScore;

  // If any blockers exist that are clearly hard exclusions, mark not_eligible
  const hardExclusion = blockers.length > 0 && reasons.length === 0;
  const status = hardExclusion
    ? "not_eligible"
    : missing.length && !blockers.length
      ? "needs_information"
      : finalScore >= 90
        ? "eligible"
        : finalScore >= 60
          ? "likely_eligible"
          : finalScore > 0
            ? "partially_matched"
            : "needs_information";

  return { score: Math.min(100, Math.max(0, finalScore)), status, reasons, missing, blockers };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return response({ success: false, error: "Method not allowed" }, 405);
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
  if (!token || !supabaseUrl || !anonKey)
    return response({ success: false, error: "Recommendation service is not configured" }, 503);

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: "Bearer " + token } },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user)
    return response({ success: false, error: "Authentication required" }, 401);
  const userId = authData.user.id;

  try {
    // ──────────────────────────────────────────────────────────
    // STEP 1: Load authenticated user's profile
    // ──────────────────────────────────────────────────────────
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileError || !profileRow)
      return response({ success: false, error: "Profile not found", stage: "profile_lookup" }, 400);

    const profile = {
      age: profileRow.age ?? null,
      gender: profileRow.gender ?? null,
      state: profileRow.state ?? null,
      district: profileRow.district ?? null,
      pincode: profileRow.pincode ?? null,
      occupation: profileRow.occupation ?? null,
      annual_income: profileRow.annual_income ?? profileRow.income ?? null,
      education_level: profileRow.education_level ?? null,
      category: profileRow.category ?? null,
      disability_status: profileRow.disability_status ?? null,
      marital_status: profileRow.marital_status ?? null,
      is_student: profileRow.is_student ?? null,
    };

    console.info(
      JSON.stringify({
        function: "generate-recommendations",
        stage: "profile_loaded",
        user_id: userId,
        fields_present: Object.entries(profile)
          .filter(([_, v]) => v !== null && v !== undefined && v !== "")
          .map(([k]) => k),
      }),
    );

    // ──────────────────────────────────────────────────────────
    // STEP 2: Load verified schemes from the local catalogue
    // ──────────────────────────────────────────────────────────
    const { data: candidates, error: schemeError } = await supabase
      .from("schemes")
      .select("*")
      .in("status", ["active", "current"]);
    if (schemeError) throw new Error(`Scheme lookup failed: ${schemeError.message}`);
    const verifiedCandidates = (candidates || []).filter(
      (c: Candidate) => typeof c.name === "string" && c.name.trim().length > 0,
    ) as Candidate[];
    const sanitizedCandidates = verifiedCandidates.map((c) => ({
      ...c,
      eligibility: normalizeEligibility(c.eligibility),
    }));
    console.info(
      JSON.stringify({
        function: "generate-recommendations",
        stage: "schemes_loaded",
        user_id: userId,
        retrieved_count: (candidates || []).length,
        verified_count: sanitizedCandidates.length,
      }),
    );

    if (!sanitizedCandidates.length) {
      return response({
        success: true,
        count: 0,
        message: "No scheme candidates are available in the schemes table.",
      });
    }

    // ──────────────────────────────────────────────────────────
    // STEP 3: Run deterministic eligibility on local catalogue
    // ──────────────────────────────────────────────────────────
    const deterministic = new Map<string, ReturnType<typeof deterministicMatch>>();
    for (const candidate of sanitizedCandidates) {
      try {
        deterministic.set(
          candidate.id,
          deterministicMatch(candidate as unknown as Candidate, profile),
        );
      } catch (e) {
        console.error(
          JSON.stringify({
            function: "generate-recommendations",
            stage: "deterministic_error",
            scheme_id: candidate.id,
            error: errorText(e),
          }),
        );
        deterministic.set(candidate.id, {
          score: 0,
          status: "needs_information",
          reasons: [],
          missing: ["Eligibility data could not be parsed"],
          blockers: [],
        });
      }
    }

    const relevantCandidates = sanitizedCandidates.filter(
      (c) => deterministic.get(c.id)?.status !== "not_eligible",
    );
    console.info(
      JSON.stringify({
        function: "generate-recommendations",
        stage: "eligibility_evaluated",
        user_id: userId,
        candidate_count: sanitizedCandidates.length,
        relevant_count: relevantCandidates.length,
        hard_exclusions: sanitizedCandidates.length - relevantCandidates.length,
      }),
    );

    // ──────────────────────────────────────────────────────────
    // STEP 4: Gemini — rank existing schemes
    // ──────────────────────────────────────────────────────────
    let geminiRankings: Recommendation[] = [];
    let usedFallback = false;
    let geminiError = "";

    if (apiKey) {
      const discoveryPrompt = `You are Yojantra, an AI-powered Indian government scheme recommendation engine. Your task is to rank and explain the most relevant schemes for this user from the candidate pool below.

USER PROFILE:
${JSON.stringify(profile)}

DETERMINISTIC EVALUATIONS (authoritative — do NOT override hard blockers):
${JSON.stringify(Object.fromEntries(deterministic))}

CANDIDATE SCHEMES (already loaded from the verified database):
${JSON.stringify(relevantCandidates.map((c) => ({ id: c.id, name: c.name, description: c.description, category: c.category, level: c.level, state: c.state, ministry: c.ministry, eligibility: c.eligibility, benefits: c.benefits, documents_required: c.documents_required, application_url: c.application_url, source_url: c.source_url })))}

INSTRUCTIONS:
1. Select the TOP 10 most relevant schemes for THIS user from the candidates above.
2. For each selected scheme, provide:
   - scheme_id: the exact ID from the candidates list
   - match_score: 0-100 based on how well it matches the user's profile
   - why_matches: 2-3 specific reasons why this scheme matches the user
   - missing_requirements: any information needed to confirm eligibility
   - eligibility_summary: plain-language explanation of eligibility
   - benefits: key benefits the user would receive
   - required_documents: documents needed to apply
   - application_process: step-by-step application process

RULES:
- ONLY select scheme IDs that exist in the candidates list above
- NEVER override a deterministic blocker (gender, state, age, income, occupation, category mismatch)
- NEVER invent schemes, URLs, deadlines, or benefits
- Prioritize schemes where the user clearly matches the eligibility criteria
- If the user's profile has gaps (missing fields), note them in missing_requirements
- Use simple, clear language for explanations
- Sort by match_score descending

Return ONLY JSON:
{
  "recommendations": [
    {
      "scheme_id": "existing-id",
      "match_score": 0,
      "why_matches": ["reason 1", "reason 2"],
      "missing_requirements": ["req 1"],
      "eligibility_summary": "plain language explanation",
      "benefits": ["benefit 1", "benefit 2"],
      "required_documents": ["doc 1", "doc 2"],
      "application_process": ["step 1", "step 2"]
    }
  ]
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      try {
        console.info(
          JSON.stringify({
            function: "generate-recommendations",
            stage: "gemini_request_start",
            user_id: userId,
            gemini_model: model,
            candidate_count: relevantCandidates.length,
          }),
        );

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: discoveryPrompt }] }],
              tools: [{ google_search: {} }],
              generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
            }),
            signal: controller.signal,
          },
        );
        clearTimeout(timeoutId);

        console.info(
          JSON.stringify({
            function: "generate-recommendations",
            stage: "gemini_response_status",
            user_id: userId,
            status: geminiResponse.status,
            ok: geminiResponse.ok,
          }),
        );

        if (!geminiResponse.ok) {
          const errText = await geminiResponse.text();
          throw new Error(`Gemini ${geminiResponse.status}: ${errText.slice(0, 300)}`);
        }

        const respText = await geminiResponse.text();
        const payload = JSON.parse(respText);
        const text = payload.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text || "")
          .join("")
          .trim();
        if (!text) throw new Error("Gemini returned empty text");

        const parsed = JSON.parse(text.replace(/^```json\s*/i, "").replace(/\s*```$/, ""));
        geminiRankings = parsed.recommendations || [];
        console.info(
          JSON.stringify({
            function: "generate-recommendations",
            stage: "gemini_parsed",
            user_id: userId,
            rankings_count: geminiRankings.length,
          }),
        );
      } catch (error) {
        clearTimeout(timeoutId);
        geminiError = errorText(error);
        usedFallback = true;
        console.error(
          JSON.stringify({
            function: "generate-recommendations",
            stage: "gemini_failed",
            user_id: userId,
            error: geminiError,
          }),
        );
      }
    } else {
      usedFallback = true;
      console.info(
        JSON.stringify({
          function: "generate-recommendations",
          stage: "gemini_skipped",
          user_id: userId,
          reason: "GEMINI_API_KEY not configured",
        }),
      );
    }

    // ──────────────────────────────────────────────────────────
    // STEP 5: Build final recommendations
    // ──────────────────────────────────────────────────────────
    // Use only the existing catalogue candidates (no discovered schemes)
    const allCandidates = sanitizedCandidates;

    // ──────────────────────────────────────────────────────────
    // STEP 5: Build final recommendations
    // ──────────────────────────────────────────────────────────
    // Merge Gemini rankings for existing schemes with deterministic scores
    const rankingMap = new Map(geminiRankings.map((r) => [r.scheme_id, r]));

    const recommendations: Array<Record<string, unknown>> = [];

    for (const candidate of allCandidates) {
      const evalResult = deterministic.get(candidate.id);
      if (!evalResult || evalResult.status === "not_eligible") continue;

      const geminiRanking = rankingMap.get(candidate.id);
      const score = evalResult.score;

      // Merge deterministic evaluation with Gemini insights
      recommendations.push({
        user_id: userId,
        scheme_id: candidate.id,
        scheme_name: candidate.name,
        ministry_or_department: candidate.ministry,
        government_level: candidate.level,
        state: candidate.state,
        category: candidate.category,
        short_description: candidate.description,
        match_score: score,
        match_band:
          score >= 90 ? "strong" : score >= 75 ? "good" : score >= 60 ? "possible" : "low",
        why_matches: uniqueStrings([
          ...(evalResult.reasons || []),
          ...(geminiRanking?.why_matches || []),
        ]).slice(0, 6),
        missing_requirements: uniqueStrings([
          ...(evalResult.missing || []),
          ...(geminiRanking?.missing_requirements || []),
        ]).slice(0, 6),
        eligibility_summary: uniqueStrings([
          ...(evalResult.blockers || []),
          ...(geminiRanking?.eligibility_summary || []),
        ]).slice(0, 8),
        benefits: uniqueStrings([
          ...(candidate.benefits || []),
          ...(geminiRanking?.benefits || []),
        ]),
        required_documents: uniqueStrings([
          ...(candidate.documents_required || []),
          ...(geminiRanking?.required_documents || []),
        ]),
        application_process: uniqueStrings(geminiRanking?.application_process || []),
        official_application_url: candidate.application_url || "",
        official_source_url: candidate.source_url || "",
        status: candidate.status || "active",
        last_verified_at: candidate.last_verified_at || new Date().toISOString(),
        confidence_score: Math.min(1, score / 100),
        generated_at: new Date().toISOString(),
      });
    }

    // Sort by match score descending
    recommendations.sort((a, b) => (b.match_score as number) - (a.match_score as number));

    // Deduplicate by scheme_id
    const seen = new Set<string>();
    const deduped: typeof recommendations = [];
    for (const r of recommendations) {
      if (seen.has(r.scheme_id as string)) continue;
      seen.add(r.scheme_id as string);
      deduped.push(r);
    }

    // Filter: only keep schemes with match_score >= 50
    const finalRecommendations = deduped.filter((r) => (r.match_score as number) >= 50);

    console.info(
      JSON.stringify({
        function: "generate-recommendations",
        stage: "recommendations_built",
        user_id: userId,
        total_before_dedup: recommendations.length,
        after_dedup: deduped.length,
        after_score_filter: finalRecommendations.length,
      }),
    );

    // ──────────────────────────────────────────────────────────
    // STEP 8: Save to scheme_recommendations
    // ──────────────────────────────────────────────────────────
    const { error: deleteError } = await supabase
      .from("scheme_recommendations")
      .delete()
      .eq("user_id", userId);
    if (deleteError) throw new Error(`Recommendation cache clear failed: ${deleteError.message}`);

    if (finalRecommendations.length) {
      const { error: insertError } = await supabase
        .from("scheme_recommendations")
        .insert(finalRecommendations);
      if (insertError) throw new Error(`Recommendation save failed: ${insertError.message}`);
    }

    console.info(
      JSON.stringify({
        function: "generate-recommendations",
        stage: "recommendations_saved",
        user_id: userId,
        final_count: finalRecommendations.length,
        used_fallback: usedFallback,
        gemini_error: geminiError || null,
      }),
    );

    const outputRecs = finalRecommendations.map(({ user_id, ...rest }) => rest);
    return response({
      success: true,
      count: finalRecommendations.length,
      ai_explanation_available: !usedFallback,
      recommendations: outputRecs,
      aiEnhanced: !usedFallback,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        function: "generate-recommendations",
        user_id: userId,
        error: errorText(error),
      }),
    );
    return response(
      {
        success: false,
        error: "Unable to generate personalized recommendations right now. Please try again.",
      },
      502,
    );
  }
});
