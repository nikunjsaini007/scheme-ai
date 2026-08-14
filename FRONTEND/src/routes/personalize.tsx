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

const QUESTIONS = [
  { title: "Which age group are you in?", key: "AGE", options: ["18–25", "26–40", "41–60", "60+"] },
  { title: "What best describes your situation?", key: "OCCUPATION", options: ["Student", "Farmer", "Unemployed", "Entrepreneur", "Job Seeker", "Salaried", "Homemaker", "Retired"] },
  { title: "Which state or union territory do you live in?", key: "STATE", options: ["Haryana", "Maharashtra", "Kerala", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Gujarat", "Other"] },
  { title: "What kind of support are you looking for?", key: "CATEGORY", options: ["Education", "Healthcare", "Housing", "Employment", "Agriculture", "Business", "Women & Child", "Social Security"] },
  { title: "What is your family's annual income?", key: "ANNUAL FAMILY INCOME", options: ["Below ₹2L", "₹2L – ₹5L", "₹5L – ₹10L", "Above ₹10L"] },
] as const;
const incomeValue = (value: string) => value.includes("Below") ? 100000 : value.includes("2L") && value.includes("5L") ? 350000 : value.includes("5L") && value.includes("10L") ? 750000 : value.includes("Above") ? 1000000 : Number(value) || null;

export const Route = createFileRoute("/personalize")({
  beforeLoad: requireAuth,
  head: () => ({ title: "Personalize – Yojantra", description: "Tell us about yourself to find government schemes you qualify for" }),
  component: Personalize,
});

function Personalize() {
  const router = useRouter();
  const { t } = useT();
  const { answers, stage, answer, setPersona, setStage, reset } = useProfile();
  const [question, setQuestion] = useState(0);
  const [saving, setSaving] = useState(false);
  const current = QUESTIONS[question]!;
  const selected = answers[current.key];
  const complete = stage === "done";
  const progress = complete ? 1 : (question + (selected ? 1 : 0)) / QUESTIONS.length;

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    void fetchUserProfile(user.id).then((profile) => {
      const savedAnswers: Record<string, string> = {
        AGE: String(profile.age || ""),
        OCCUPATION: String(profile.occupation || ""),
        STATE: String(profile.state || ""),
        CATEGORY: String(profile.category || ""),
        "ANNUAL FAMILY INCOME": String(profile.annual_income || ""),
      };
      Object.entries(savedAnswers).forEach(([key, value]) => { if (value) answer(key, value); });
      if (savedAnswers.OCCUPATION) setPersona(savedAnswers.OCCUPATION.toUpperCase());
    }).catch(() => undefined);
  }, [answer, setPersona]);

  const choose = (value: string) => {
    answer(current.key, value);
    if (current.key === "OCCUPATION") setPersona(value.toUpperCase());
  };

  const next = async () => {
    if (question < QUESTIONS.length - 1) setQuestion((value) => value + 1);
    else {
      const user = getUser();
      if (user) {
        setSaving(true);
        try {
          const latestAnswers = { ...answers, [current.key]: selected || "" };
          const savedProfile = {
            ...user,
            age: Number.parseInt(latestAnswers.AGE || "", 10) || null,
            occupation: latestAnswers.OCCUPATION || "",
            annual_income: incomeValue(latestAnswers["ANNUAL FAMILY INCOME"] || ""),
            category: user.category || "",
            state: latestAnswers.STATE || "",
            is_student: (latestAnswers.OCCUPATION || "").toLowerCase() === "student",
          };
          await updateProfile(savedProfile);
          await fetchUserProfile(user.id);
          setStage("matching");
          await generateRecommendations();
          await router.navigate({ to: "/recommendations" });
        } finally {
          setSaving(false);
        }
      }
      if (!user) setStage("done");
    }
  };

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
              <button onClick={() => { setStage("matching"); void router.navigate({ to: "/recommendations" }); }} className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[.16em] text-ivory uppercase transition-colors hover:bg-saffron">{t("Find my schemes")} <ArrowRight className="size-4" /></button>
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
            <div className="mb-8 flex items-end justify-between"><div><p className="eyebrow text-ink/40">{t("Question")} {String(question + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}</p><div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-ink/10 sm:w-72"><motion.div className="h-full rounded-full bg-saffron" animate={{ width: `${Math.max(progress, .08) * 100}%` }} /></div></div><Link to="/" className="eyebrow text-ink/40 hover:text-saffron">{t("Exit")}</Link></div>
            <motion.div key={current.key} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="rounded-2xl bg-white p-6 text-ink shadow-[0_20px_70px_-35px_rgba(17,17,17,.35)] sm:p-9">
              <p className="eyebrow text-saffron">{t("Tell us about you")}</p><h2 className="display mt-5 max-w-lg text-4xl leading-[0.92] sm:text-6xl">{t(current.title)}</h2>
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">{current.options.map((option) => <button key={option} onClick={() => choose(option)} className={cn("group flex items-center justify-between rounded-xl border border-ink/15 px-5 py-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-saffron hover:bg-saffron hover:text-white", selected === option && "border-saffron bg-saffron text-white")}><span>{t(option)}</span><span className={cn("grid size-5 place-items-center rounded-full border border-ink/20", selected === option && "border-white bg-white/20")}>{selected === option && <Check className="size-3" />}</span></button>)}</div>
              <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6"><button disabled={question === 0 || saving} onClick={() => setQuestion((value) => Math.max(0, value - 1))} className="eyebrow text-ink/40 transition-colors hover:text-ink disabled:opacity-30">{t("← Back")}</button><button disabled={!selected || saving} onClick={() => void next()} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[10px] font-semibold tracking-[.16em] text-ivory uppercase transition-colors hover:bg-saffron disabled:opacity-30">{saving ? "Saving…" : question === QUESTIONS.length - 1 ? t("See my matches") : t("Continue")} <ArrowRight className="size-3.5" /></button></div>
            </motion.div>
          </div>
        </div>
      </section>
      <div className="border-t border-ink/10 bg-ivory-deep py-6"><div className="edge flex flex-wrap items-center justify-between gap-4"><p className="eyebrow text-ink/45">{t("No right or wrong answers")}</p><p className="text-sm text-ink/55">{t("You’re in control of your profile.")}</p></div></div>
      <Footer />
    </main>
  );
}
