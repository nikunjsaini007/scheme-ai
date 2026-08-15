import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { LineReveal, Reveal } from "@/components/motion-primitives";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/store/useProfile";
import { cn } from "@/lib/utils";
import { getUser, updateProfile } from "@/lib/auth";
import { requireAuth } from "@/components/AuthGuard";
import { fetchUserProfile, generateRecommendations } from "@/lib/schemeCatalog";

const incomeValue = (value: string) => value.includes("Below") ? 100000 : value.includes("1–2.5") || value.includes("1–2.5") ? 175000 : value.includes("2.5–5") ? 375000 : value.includes("5–8") ? 650000 : value.includes("8–10") ? 900000 : value.includes("Above") ? 1000000 : Number(value) || null; // helper kept for legacy parsing

export const Route = createFileRoute("/personalize")({
  beforeLoad: requireAuth,
  head: () => ({ title: "Personalize – Yojantra", description: "Tell us about yourself to find government schemes you qualify for" }),
  component: Personalize,
});

function Personalize() {
  const router = useRouter();
  const { t } = useT();
  const { answers, stage, answer, setPersona, setStage, reset } = useProfile();
  const [question, setQuestion] = useState(0); // restore minimal step state used by the 'Start over' action
  const [saving, setSaving] = useState(false);


  // Progress overlay state for the "See my matches" flow
  const [progressVisible, setProgressVisible] = useState(false);
  const [stepLabels, setStepLabels] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [dbProfile, setDbProfile] = useState<any | null>(null);

  // Detailed profile fields (for final personalization form)
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<string>("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [maritalStatus, setMaritalStatus] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("english");
  const [selectedIncomeNumeric, setSelectedIncomeNumeric] = useState<number | null>(null);

  // When dbProfile loads, populate detailed fields
  useEffect(() => {
    if (!dbProfile) return;
    setFullName(String(dbProfile.full_name || ""));
    setDateOfBirth(String(dbProfile.date_of_birth || ""));
    setGender(String(dbProfile.gender || ""));
    setDistrict(String(dbProfile.district || ""));
    setPincode(String(dbProfile.pincode || ""));
    setEducationLevel(String(dbProfile.education_level || ""));
    setMaritalStatus(String(dbProfile.marital_status || ""));
    setPreferredLanguage(String(dbProfile.preferred_language || "english"));
    setSelectedIncomeNumeric(dbProfile.annual_income ?? null);
  }, [dbProfile]);

  // Compute form completion progress from visible fields (single source of truth)
  const complete = stage === "done";
  const filledCount = [
    dbProfile?.age ?? answers.AGE,
    answers.OCCUPATION || dbProfile?.occupation,
    answers.STATE || dbProfile?.state,
    selectedIncomeNumeric ?? dbProfile?.annual_income,
  ].filter(Boolean).length;
  const totalRequired = 4; // age, occupation, state, annual_income
  const progress = complete ? 1 : Math.min(1, filledCount / totalRequired);

  // Whether minimal required fields are present to enable Save (computed after state declarations)
  const isFormValid = Boolean(
    (dbProfile?.age ?? answers.AGE) &&
    (answers.OCCUPATION || dbProfile?.occupation) &&
    (answers.STATE || dbProfile?.state) &&
    (selectedIncomeNumeric ?? dbProfile?.annual_income)
  );

  useEffect(() => {
    // Load saved profile and populate the form before rendering
    const user = getUser();
    if (!user) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    fetchUserProfile(user.id).then((profile) => {
      setDbProfile(profile);
      // Populate answers from saved profile values (do not overwrite empty values)
      const savedAnswers: Record<string, string> = {
        AGE: String(profile.age ?? ""),
        OCCUPATION: String(profile.occupation ?? ""),
        STATE: String(profile.state ?? ""),
        CATEGORY: String(profile.category ?? ""),
        "ANNUAL FAMILY INCOME": String(profile.annual_income ?? ""),
      };
      Object.entries(savedAnswers).forEach(([key, value]) => { if (value) answer(key, value); });
      if (savedAnswers.OCCUPATION) setPersona(savedAnswers.OCCUPATION.toUpperCase());
      // If profile_completed is true, mark stage accordingly
      if ((profile as any).profile_completed) setStage("done");
    }).catch((err) => {
      // show a console message in development, but keep UX friendly
      // leave the form in first-time state if fetch fails
      // (the existing error handling elsewhere will surface save errors)
      // eslint-disable-next-line no-console
      console.error("Unable to load saved profile:", err?.message || err);
    }).finally(() => setLoadingProfile(false));
  }, [answer, setPersona, setStage]);

  // removed legacy choose/step flow — single save flow below
  const next = async () => {
    const user = getUser();
    if (!user) {
      // Not authenticated — do not attempt save
      setSaveError("You must be signed in to save your profile.");
      return;
    }

    // Validate visible required fields
    const ageVal = dbProfile?.age ?? answers.AGE ?? null;
    const occupationVal = answers.OCCUPATION || dbProfile?.occupation || "";
    const stateVal = answers.STATE || dbProfile?.state || "";
    const incomeVal = selectedIncomeNumeric ?? dbProfile?.annual_income ?? null;
    const formValid = Boolean(ageVal && occupationVal && stateVal && incomeVal);
    if (!formValid) {
      setSaveError("Please complete Age, Occupation, State and Annual income before saving.");
      return;
    }

    setSaving(true);
    setProgressVisible(true);
    const steps = [
      "Saving your profile",
      "Finding relevant schemes",
      "Checking eligibility",
      "Ranking your matches",
      "Preparing recommendations",
    ];
    setStepLabels(steps);
    setCompleted(new Array(steps.length).fill(false));
    setStepIndex(0);

    try {
      const base = dbProfile || {};
      const mergedUser = {
        id: user.id,
        email: base.email || user.email || "",
        full_name: fullName || base.full_name || "",
        phone: base.phone || "",
        avatar_url: base.avatar_url || "",
        date_of_birth: dateOfBirth || base.date_of_birth || "",
        age: Number.parseInt(String(ageVal || ""), 10) || null,
        gender: gender || base.gender || "",
        state: stateVal,
        district: district || base.district || "",
        pincode: pincode || base.pincode || "",
        occupation: occupationVal,
        annual_income: incomeVal,
        education_level: educationLevel || base.education_level || "",
        category: (answers.CATEGORY && String(answers.CATEGORY).toLowerCase()) || base.category || "",
        disability_status: base.disability_status ?? null,
        marital_status: maritalStatus || base.marital_status || "",
        is_student: (occupationVal || "").toLowerCase() === "student",
        profile_completed: true,
        preferred_language: preferredLanguage || base.preferred_language || "english",
        updated_at: new Date().toISOString(),
      };

      // Step 1: Save profile
      await updateProfile(mergedUser);
      setCompleted((c) => {
        const copy = [...c];
        copy[0] = true;
        return copy;
      });
      setStepIndex(1);

      // Step 2: Fetch fresh profile and update local cache
      const refreshed = await fetchUserProfile(user.id);
      setDbProfile(refreshed);

      // Step 3: Trigger recommendation generation (server-side eligibility + Gemini)
      setStepIndex(2);
      const result = await generateRecommendations();

      setCompleted((c) => c.map((v, i) => (i <= 3 ? true : v)));
      setStepIndex(4);
      setStage("matching");

      const fromDashboard = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'dashboard';
      await router.navigate({ to: fromDashboard ? "/dashboard" : "/my-matches" });
    } catch (e: any) {
      console.error("Profile save failed:", e?.message || e, e?.code, e?.details, e?.hint);
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
      setProgressVisible(false);
    }
    };

    if (loadingProfile) {
    return (
      <main className="min-h-screen bg-ivory text-ink">
        <Nav />
        <section className="edge flex min-h-[72vh] items-center py-32">
          <div className="max-w-2xl">
            <h2 className="display text-3xl">Loading your saved profile…</h2>
            <p className="mt-4 text-sm text-ink/60">Please wait while we load your saved personalization. You can review or update this information anytime.</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (complete) {
    return (
      <main className="min-h-screen bg-ivory text-ink">
        <Nav />
        <section className="edge flex min-h-[72vh] items-center py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="grid size-14 place-items-center rounded-full bg-saffron text-white"><Sparkles className="size-6" /></div>
            <p className="eyebrow mt-8 text-saffron">{t("Your profile is ready")}</p>
            <h1 className="display mt-4 text-6xl leading-[0.9] md:text-8xl">{t("Ready to find your benefits?")}</h1>
            <p className="mt-7 max-w-md text-sm leading-relaxed text-ink/60">{t("We’ll use your answers to surface schemes that are relevant to your situation. You can always change them later.")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={() => { setStage("matching"); void router.navigate({ to: "/my-matches" }); }} className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[.16em] text-ivory uppercase transition-colors hover:bg-saffron">{t("Find my schemes")} <ArrowRight className="size-4" /></button>
              <button onClick={() => { reset(); setQuestion(0); }} className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-4 text-[11px] font-semibold tracking-[.16em] text-ink/65 uppercase hover:border-saffron hover:text-saffron"><RotateCcw className="size-3.5" />{t("Start over")}</button>
            </div>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ivory text-ink">
      <Nav />
      {progressVisible && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/30">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Preparing your personalized matches</h3>
            <p className="mt-2 text-sm text-ink/60">We’ll use your saved profile to find relevant government schemes. This may take a moment.</p>
            <ul className="mt-4 space-y-3">
              {stepLabels.map((label, i) => (
                <li key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full border ${completed[i] ? "bg-verified/10 border-verified" : i === stepIndex ? "border-saffron animate-pulse" : "border-ink/15"}`} />
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      {completed[i] ? <div className="text-xs text-ink/60">Completed</div> : i === stepIndex ? <div className="text-xs text-ink/60">In progress…</div> : <div className="text-xs text-ink/60">Pending</div>}
                    </div>
                  </div>
                  {completed[i] ? <div className="text-sm text-verified">✓</div> : null}
                </li>
              ))}
            </ul>
            {saveError && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
          </div>
        </div>
      )}
      <section className="edge relative py-28 md:py-40">
        <div className="pointer-events-none absolute -right-32 top-40 size-80 rounded-full bg-saffron/10 blur-3xl" />
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-saffron">01 / {t("Personalization")}</p>
              <LineReveal as="h1" className="display mt-8 text-[17vw] leading-[0.9] md:text-[9vw]" lines={[t("A better way"), t("to discover.")]} />
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink/55">{t("Answer a few simple questions. We’ll narrow thousands of schemes down to the ones written for people like you.")}</p>
            </Reveal>
            <div className="mt-14 hidden border-t border-ink/15 pt-6 lg:block"><p className="eyebrow text-ink/35">{t("Your answers stay private")}</p><p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/55">{t("This demo keeps your profile in your browser. Yojantra never collects fees or processes applications.")}</p></div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="eyebrow text-saffron">{t("Personalization")}</p>
                <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-ink/10 sm:w-72">
                  <motion.div className="h-full rounded-full bg-saffron" animate={{ width: `${Math.max(progress, 0.08) * 100}%` }} />
                </div>
              </div>
              <Link to="/" className="eyebrow text-ink/40 hover:text-saffron">{t("Exit")}</Link>
            </div>
            <div className="rounded-2xl bg-white p-6 text-ink shadow-[0_20px_70px_-35px_rgba(17,17,17,.35)] sm:p-9">
              <p className="eyebrow text-saffron">{t("Tell us about you")}</p>
              <h2 className="display mt-5 max-w-lg text-4xl leading-[0.92] sm:text-6xl">{t("Tell us about you")}</h2>

              {/* Detailed profile section (Personal Details, Location, Education & Employment, Financials) */}
              <div className="mt-6 grid gap-4">
                <div>
                  <label className="text-xs font-semibold">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm" placeholder="Full name" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold">Date of birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDateOfBirth(val);
                        if (val) {
                          const dob = new Date(val);
                          const now = new Date();
                          let ageNum = now.getFullYear() - dob.getFullYear();
                          const m = now.getMonth() - dob.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) ageNum -= 1;
                          answer("AGE", String(ageNum));
                          setDbProfile((p: any) => ({ ...(p || {}), age: ageNum }));
                        } else {
                          answer("AGE", "");
                          setDbProfile((p: any) => ({ ...(p || {}), age: null }));
                        }
                      }}
                      className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Pincode</label>
                    <input value={pincode} onChange={(e) => setPincode(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm" placeholder="PIN code" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold">State</label>
                    <select value={answers.STATE || dbProfile?.state || ""} onChange={(e) => { answer("STATE", e.target.value); setDbProfile((p:any) => ({ ...p, state: e.target.value })); }} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select state</option>
                      <option>Haryana</option>
                      <option>Maharashtra</option>
                      <option>Kerala</option>
                      <option>Tamil Nadu</option>
                      <option>Uttar Pradesh</option>
                      <option>West Bengal</option>
                      <option>Gujarat</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">District</label>
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm" placeholder="District" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold">Occupation</label>
                    <select value={answers.OCCUPATION || dbProfile?.occupation || ""} onChange={(e) => { answer("OCCUPATION", e.target.value); setPersona(e.target.value.toUpperCase()); }} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="farmer">Farmer</option>
                      <option value="agricultural_worker">Agricultural worker</option>
                      <option value="self_employed">Self-employed</option>
                      <option value="business_owner">Business owner</option>
                      <option value="employed">Private sector employee</option>
                      <option value="government_employee">Government employee</option>
                      <option value="daily_wage">Daily wage worker</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="homemaker">Homemaker</option>
                      <option value="retired">Retired</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Education</label>
                    <select value={educationLevel || dbProfile?.education_level || ""} onChange={(e) => setEducationLevel(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="no_formal_education">No formal education</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="higher_secondary">Higher Secondary</option>
                      <option value="diploma">Diploma</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="doctorate">Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold">Annual income</label>
                    <select
                      value={String(selectedIncomeNumeric ?? "")}
                      onChange={(e) => {
                        const num = e.target.value ? Number(e.target.value) : null;
                        setSelectedIncomeNumeric(num);
                        answer("ANNUAL FAMILY INCOME", num ? String(num) : "");
                        setDbProfile((p: any) => ({ ...(p || {}), annual_income: num }));
                      }}
                      className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option value={100000}>Below ₹1 lakh</option>
                      <option value={175000}>₹1–2.5 lakh</option>
                      <option value={375000}>₹2.5–5 lakh</option>
                      <option value={650000}>₹5–8 lakh</option>
                      <option value={900000}>₹8–10 lakh</option>
                      <option value={1000000}>Above ₹10 lakh</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Category</label>
                    <select value={answers.CATEGORY?.toLowerCase() || dbProfile?.category || ""} onChange={(e) => answer("CATEGORY", e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="general">General</option>
                      <option value="obc">OBC</option>
                      <option value="sc">SC</option>
                      <option value="st">ST</option>
                      <option value="ews">EWS</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold">Marital status</label>
                    <select value={maritalStatus || dbProfile?.marital_status || ""} onChange={(e) => setMaritalStatus(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                      <option value="separated">Separated</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Preferred language</label>
                    <select value={preferredLanguage || dbProfile?.preferred_language || "english"} onChange={(e) => setPreferredLanguage(e.target.value)} className="mt-2 w-full rounded-md border border-ink/10 px-3 py-2 text-sm">
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="tamil">Tamil</option>
                      <option value="telugu">Telugu</option>
                      <option value="bengali">Bengali</option>
                      <option value="marathi">Marathi</option>
                      <option value="gujarati">Gujarati</option>
                      <option value="kannada">Kannada</option>
                      <option value="malayalam">Malayalam</option>
                      <option value="punjabi">Punjabi</option>
                      <option value="odia">Odia</option>
                      <option value="assamese">Assamese</option>
                      <option value="urdu">Urdu</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
                <Link to="/dashboard" className="eyebrow text-ink/40 hover:text-ink">{t("Cancel")}</Link>
                <button disabled={saving || !isFormValid} onClick={() => void next()} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[10px] font-semibold tracking-[.16em] text-ivory uppercase transition-colors hover:bg-saffron disabled:opacity-30">{saving ? "Saving…" : t("Save & See my matches")} <ArrowRight className="size-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="border-t border-ink/10 bg-ivory-deep py-6"><div className="edge flex flex-wrap items-center justify-between gap-4"><p className="eyebrow text-ink/45">{t("No right or wrong answers")}</p><p className="text-sm text-ink/55">{t("You’re in control of your profile.")}</p></div></div>
      <Footer />
    </main>
  );
}
