import { AnimatePresence, motion } from "motion/react";
import { Mic } from "lucide-react";
import { useState } from "react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";

const TOP = schemes.slice(0, 3);

export function Assistant() {
  const [listening, setListening] = useState(false);
  const { t } = useT();

  return (
    <section id="assistant" className="edge py-28 md:py-40">
      <SectionLabel index="06" title={t("AI assistant")} />

      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <LineReveal
            className="display text-[22vw] leading-[0.84] lg:text-[9vw]"
            lines={[t("Just"), t("ask.")]}
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-ink/55">
              {t(
                "Government schemes don't have to sound complicated. Speak or type in English, Hindi or Hinglish.",
              )}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <button
              onClick={() => setListening((v) => !v)}
              className={`mt-10 flex w-full items-center gap-4 rounded-full px-6 py-4 text-left transition-colors duration-300 ${
                listening ? "bg-saffron text-white" : "bg-ink text-ivory hover:bg-saffron"
              }`}
            >
              <Mic className="size-5 shrink-0" strokeWidth={1.8} />
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                {listening ? t("Listening…") : t("Ask Yojantra")}
              </span>
              <span className="ml-auto flex h-6 items-end gap-[3px]">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full bg-current"
                    animate={listening ? { height: [4, 20, 8, 24, 6] } : { height: 4 }}
                    transition={
                      listening
                        ? { duration: 1.1, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </span>
            </button>
            <AnimatePresence>
              {listening && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-ink/60 italic"
                >
                  {t("“I am a farmer from Haryana earning ₹2 lakh a year.”")}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="mt-4 text-[11px] tracking-[0.14em] text-ink/35 uppercase">
              English · हिन्दी · Hinglish
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Reveal>
            <div className="ml-auto max-w-lg bg-ink px-6 py-5 text-ivory">
              <p className="eyebrow text-ivory/40">{t("You")}</p>
              <p className="mt-3 text-[15px] leading-relaxed">
                {t(
                  "I am a 20 year old engineering student from Haryana. My family income is ₹3 lakh. What can I get?",
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-5 max-w-xl bg-white p-6 md:p-8">
              <p className="eyebrow text-saffron">Yojantra</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/85">
                {t("You may qualify for 7 schemes. Your strongest matches are below.")}
              </p>

              <div className="mt-6 space-y-px bg-ink/10">
                {TOP.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.12, duration: 0.6 }}
                    className="flex items-center gap-5 bg-white px-4 py-4"
                  >
                    <span className="display text-2xl text-saffron">{s.match}%</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t(s.name)}</p>
                      <p className="text-[11px] tracking-[0.14em] text-ink/40 uppercase">
                        {t(s.category)}
                      </p>
                    </div>
                    <span className="display ml-auto shrink-0 text-lg">{s.benefit}</span>
                  </motion.div>
                ))}
              </div>

              <p className="mt-6 text-[15px] text-ink/85">
                {t("Want me to explain the best one?")}
              </p>
              <p className="mt-5 border-t border-ink/10 pt-4 text-[11px] text-ink/40">
                {t("Yojantra explains scheme criteria — it never decides your application.")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
