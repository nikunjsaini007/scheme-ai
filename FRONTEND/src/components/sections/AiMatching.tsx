import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Counter, LineReveal, Reveal } from "@/components/motion-primitives";
import { useT } from "@/lib/i18n";

const ORBITS = ["YOUR PROFILE", "GOVERNMENT DATABASE", "ELIGIBILITY RULES", "LOCATION", "BENEFITS"];
const STATS = [
  { n: 47, label: "Relevant schemes found" },
  { n: 17, label: "Strong matches" },
  { n: 8, label: "High-priority benefits" },
  { n: 4, label: "Deadlines approaching" },
];

export function AiMatching() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const { t } = useT();

  return (
    <section id="matching" ref={ref} className="edge overflow-hidden py-28 text-center md:py-44">
      <LineReveal className="display text-[14vw] leading-[0.86] md:text-[7.5vw]" lines={[t("Reading"), t("your profile.")]} />

      <div className="relative mx-auto mt-20 flex h-[320px] w-full max-w-3xl items-center justify-center md:h-[420px]">
        <motion.div
          animate={inView ? { scale: [0.9, 1.04, 1], opacity: 1 } : {}}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute size-32 rounded-full bg-saffron opacity-0 blur-[2px] md:size-40"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute size-[300px] rounded-full border border-ink/12 md:size-[400px]"
        >
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-ink" />
        </motion.div>
        <div className="absolute size-[200px] rounded-full border border-dashed border-ink/12 md:size-[270px]" />
        <span className="display relative z-10 text-2xl text-white md:text-3xl">Y</span>

        {ORBITS.map((o, i) => {
          const angle = (i / ORBITS.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.span
              key={o}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 + i * 0.16, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bg-ivory px-2 text-[9px] font-semibold tracking-[0.18em] text-ink/60 uppercase md:text-[10px]"
              style={{
                left: `calc(50% + ${Math.cos(angle) * 42}%)`,
                top: `calc(50% + ${Math.sin(angle) * 42}%)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {t(o)}
            </motion.span>
          );
        })}
      </div>

      <LineReveal className="display mt-10 text-[12vw] leading-none text-saffron md:text-[6vw]" lines={[t("Your matches")]} />

      <div className="mt-16 grid grid-cols-2 gap-px bg-ink/12 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="bg-ivory">
            <div className="p-6 text-left md:p-8">
              <Counter to={s.n} className="display block text-5xl md:text-6xl" />
              <p className="mt-3 text-[11px] tracking-[0.14em] text-ink/50 uppercase">{t(s.label)}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="mt-6 text-left text-[11px] text-ink/40">
          {t("Not a government decision.")}
        </p>
      </Reveal>
    </section>
  );
}