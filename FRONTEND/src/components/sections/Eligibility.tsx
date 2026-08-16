import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LineReveal, MagneticButton, Reveal, SectionLabel } from "@/components/motion-primitives";
import { useProfile } from "@/store/useProfile";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  { key: "AGE", options: ["18–25", "26–40", "41–60", "60+"] },
  {
    key: "STATE",
    options: ["Haryana", "Kerala", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "Other"],
  },
  {
    key: "OCCUPATION",
    options: ["Student", "Farmer", "Salaried", "Self-employed", "Homemaker", "Retired"],
  },
  {
    key: "ANNUAL FAMILY INCOME",
    options: ["Below ₹1L", "₹1L – ₹2L", "₹2L – ₹5L", "₹5L – ₹8L", "Above ₹8L"],
  },
  { key: "CATEGORY", options: ["General", "OBC", "SC", "ST", "EWS", "Prefer not to say"] },
  {
    key: "EDUCATION",
    options: ["Below class 10", "Class 10–12", "Graduate", "Post-graduate", "Vocational"],
  },
];

export function Eligibility() {
  const [step, setStep] = useState(0);
  const { answers, answer, setStage } = useProfile();
  const { t, lang } = useT();
  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]!;

  return (
    <section id="eligibility" className="bg-ink py-28 text-ivory md:py-40">
      <div className="edge">
        <Reveal className="mb-10 flex items-baseline gap-4 border-t border-ivory/15 pt-4">
          <span className="eyebrow text-saffron">02</span>
          <span className="eyebrow text-ivory/40">{t("Eligibility")}</span>
        </Reveal>

        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LineReveal
              className="display text-[14vw] leading-[0.85] lg:text-[6vw]"
              lines={[t("Let's see"), t("what fits.")]}
            />
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-xs text-sm leading-relaxed text-ivory/50">
                {t(
                  "No forms. Just a short conversation. Nothing you answer here leaves your browser in this demo.",
                )}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex items-center justify-between border-b border-ivory/15 pb-4">
              <span className="eyebrow text-ivory/40">
                {String(Math.min(step + 1, QUESTIONS.length)).padStart(2, "0")} /{" "}
                {String(QUESTIONS.length).padStart(2, "0")}
              </span>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="eyebrow text-ivory/40 hover:text-saffron"
                >
                  {t("← Back")}
                </button>
              )}
            </div>
            <div className="relative mt-1 h-px w-full bg-ivory/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-saffron"
                animate={{
                  width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key={q.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-10"
                >
                  <p className="display text-4xl md:text-6xl">{t(q.key)}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {q.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => {
                          answer(q.key, o);
                          setStep((s) => s + 1);
                        }}
                        className={cn(
                          "rounded-full border px-6 py-3.5 text-sm transition-all duration-300",
                          answers[q.key] === o
                            ? "border-saffron bg-saffron text-white"
                            : "border-ivory/25 text-ivory/80 hover:border-saffron hover:bg-saffron hover:text-white",
                        )}
                      >
                        {t(o)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-10 text-[11px] tracking-wide text-ivory/30">
                    {t(
                      "Also asked in the full flow: gender, and any special conditions such as disability or single-parent household.",
                    )}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-12"
                >
                  <p className="display text-4xl leading-[0.9] md:text-6xl">
                    {lang === "hi" ? (
                      <>
                        अपने <span className="text-saffron">लाभ</span> खोजने के लिए तैयार हैं?
                      </>
                    ) : (
                      <>
                        Ready to find
                        <br />
                        your <span className="text-saffron">benefits?</span>
                      </>
                    )}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <MagneticButton
                      onClick={() => {
                        setStage("matching");
                        document.getElementById("matching")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {t("Find my schemes")}
                    </MagneticButton>
                    <MagneticButton variant="light" onClick={() => setStep(0)}>
                      {t("Start over")}
                    </MagneticButton>
                  </div>
                  <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-ivory/15 pt-6 sm:grid-cols-3">
                    {QUESTIONS.map((qq) => (
                      <div key={qq.key}>
                        <dt className="eyebrow text-ivory/35">{t(qq.key)}</dt>
                        <dd className="mt-1 text-sm text-ivory/85">{t(answers[qq.key] ?? "—")}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
