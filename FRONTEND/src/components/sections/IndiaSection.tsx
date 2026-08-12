import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { states } from "@/data/schemes";
import { useT } from "@/lib/i18n";

const INDIA =
  "M148,18 L175,40 L205,35 L215,70 L255,95 L300,105 L330,120 L355,140 L340,160 L305,150 L290,175 L300,205 L285,230 L270,275 L250,330 L225,395 L205,440 L190,400 L170,340 L150,290 L120,250 L95,225 L70,200 L58,170 L80,150 L95,120 L120,95 L110,60 L130,30 Z";

const PINS: Record<string, { x: number; y: number }> = {
  HARYANA: { x: 140, y: 90 },
  KERALA: { x: 190, y: 400 },
  MAHARASHTRA: { x: 150, y: 250 },
  "TAMIL NADU": { x: 215, y: 385 },
  "UTTAR PRADESH": { x: 200, y: 130 },
  LADAKH: { x: 152, y: 32 },
  "WEST BENGAL": { x: 268, y: 165 },
  GUJARAT: { x: 92, y: 195 },
};

export function IndiaSection() {
  const [active, setActive] = useState("HARYANA");
  const { t, lang } = useT();
  const state = states.find((s) => s.name === active)!;

  return (
    <section className="bg-ivory-deep py-28 md:py-40">
      <div className="edge">
        <SectionLabel index="07" title={t("Across India")} />
        <LineReveal
          className="display text-[17vw] leading-[0.84] md:text-[9vw]"
          lines={
            lang === "hi"
              ? [<span key="l" className="text-saffron">{t("Ladakh")}</span>, t("From"), t("to Kerala.")]
              : [t("From"), <span key="l" className="text-saffron">{t("Ladakh")}</span>, t("to Kerala.")]
          }
        />

        <div className="mt-20 grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <svg viewBox="0 0 400 460" className="h-auto w-full max-w-sm" aria-hidden>
              <path d={INDIA} fill="oklch(0.15 0 0 / 0.06)" stroke="oklch(0.15 0 0 / 0.25)" strokeWidth="1.5" />
              {states.map((s) => {
                const p = PINS[s.name]!;
                const on = s.name === active;
                return (
                  <g key={s.name} onClick={() => setActive(s.name)} className="cursor-pointer">
                    <circle cx={p.x} cy={p.y} r={on ? 9 : 5} fill={on ? "oklch(0.688 0.198 32)" : "oklch(0.15 0 0)"} />
                    <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                  </g>
                );
              })}
            </svg>
            <div className="mt-8 flex flex-wrap gap-2">
              {states.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setActive(s.name)}
                  className={`rounded-full border px-4 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors ${
                    s.name === active
                      ? "border-saffron bg-saffron text-white"
                      : "border-ink/20 text-ink/60 hover:border-ink"
                  }`}
                >
                  {t(s.name)}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="display text-[13vw] leading-[0.86] md:text-[5.5vw]">{t(state.name)}</p>
                <div className="mt-6 flex items-baseline gap-4">
                  <span className="display text-6xl text-saffron md:text-8xl">{state.count}</span>
                  <span className="eyebrow text-ink/45">{t("schemes listed")}</span>
                </div>
                <ul className="mt-10 border-t border-ink/15">
                  {state.top.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-baseline justify-between border-b border-ink/12 py-4 text-sm tracking-[0.14em] uppercase"
                    >
                      <span>{t(c)}</span>
                      <span className="text-ink/35">0{i + 1}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[11px] text-ink/40">
                  {t("Illustrative map and counts from mock data. Deadlines and benefits vary by state notification.")}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}