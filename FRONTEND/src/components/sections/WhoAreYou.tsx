import { AnimatePresence, motion } from "motion/react";
import {
  GraduationCap,
  Wheat,
  Flower2,
  Briefcase,
  Store,
  UserRound,
  Accessibility,
  Home,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { personas } from "@/data/schemes";
import { useProfile } from "@/store/useProfile";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  STUDENT: GraduationCap,
  FARMER: Wheat,
  WOMAN: Flower2,
  PROFESSIONAL: Briefcase,
  ENTREPRENEUR: Store,
  "SENIOR CITIZEN": UserRound,
  "PERSON WITH DISABILITY": Accessibility,
  FAMILY: Home,
  WORKER: Wrench,
};

export function WhoAreYou() {
  const { persona, setPersona } = useProfile();
  const { t } = useT();
  const active = personas.find((p) => p.label === persona);

  return (
    <section className="edge py-28 md:py-40">
      <SectionLabel index="01" title={t("Personalization")} />
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <LineReveal
            className="display text-[18vw] leading-[0.84] lg:text-[8vw]"
            lines={[t("Who"), t("are"), t("you?")]}
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-ink/55">
              {t(
                "Pick the life you're living. We'll narrow thousands of schemes down to the ones written for people like you.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-px bg-ink/12 sm:grid-cols-3">
            {personas.map((p, i) => {
              const on = p.label === persona;
              const Icon = ICONS[p.label] ?? UserRound;
              return (
                <motion.button
                  key={p.label}
                  onClick={() => setPersona(on ? null : p.label)}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                  className={cn(
                    "group relative flex aspect-4/3 flex-col justify-between p-4 text-left transition-colors duration-300",
                    on ? "bg-saffron text-white" : "bg-ivory hover:bg-ink hover:text-ivory",
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.4} />
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
                    {t(p.label)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 bg-ink p-6 text-ivory md:p-9"
              >
                <p className="eyebrow text-saffron">{t("Show me what's available")}</p>
                <p className="display mt-3 text-3xl md:text-5xl">{t(active.label)}</p>
                <ul className="mt-7 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {active.benefits.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.06 }}
                      className="flex items-baseline gap-3 border-b border-ivory/10 py-2 text-sm text-ivory/80"
                    >
                      <span className="text-[10px] text-saffron">0{i + 1}</span>
                      {t(b)}
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-6 text-[11px] text-ivory/40">
                  {t("Indicative categories, not a decision.")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
