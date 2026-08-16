import { motion } from "motion/react";
import { Check, TriangleAlert } from "lucide-react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";

export function WhyQualify() {
  const scheme = schemes[0]!;
  const { t } = useT();

  return (
    <section className="edge py-28 md:py-40">
      <SectionLabel index="05" title={t("Transparency")} />

      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <LineReveal
            className="display text-[13vw] leading-[0.85] lg:text-[6.4vw]"
            lines={[t("Don't just"), t("take our"), t("word for it.")]}
          />
          <LineReveal
            delay={0.25}
            className="display mt-6 text-[10vw] leading-[0.9] text-saffron lg:text-[4.4vw]"
            lines={[t("See why you match.")]}
          />
          <Reveal delay={0.35}>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink/55">
              {t(
                "Every match is shown alongside the criteria it was measured against — including the ones you don't clear yet.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal>
            <div className="bg-white p-7 md:p-10">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-saffron">
                  {scheme.match}% {t("match")}
                </span>
                <span className="eyebrow text-ink/40">{t(scheme.level)}</span>
              </div>
              <h3 className="display mt-4 text-3xl md:text-5xl">{t(scheme.name)}</h3>

              <ul className="mt-9 space-y-0">
                {scheme.criteria.map((c, i) => (
                  <motion.li
                    key={c.label}
                    initial={{ opacity: 0, x: -14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 border-b border-ink/10 py-3.5 text-sm"
                  >
                    {c.ok ? (
                      <Check className="size-4 shrink-0 text-verified" strokeWidth={2.4} />
                    ) : (
                      <TriangleAlert className="size-4 shrink-0 text-saffron" strokeWidth={2.2} />
                    )}
                    <span className={c.ok ? "text-ink/80" : "text-saffron"}>{t(c.label)}</span>
                    <span className="eyebrow ml-auto text-ink/35">
                      {c.ok ? t("Met") : t("Action needed")}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 bg-ivory-deep p-5">
                <p className="eyebrow text-ink/40">{t("In plain words")}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">{t(scheme.reason)}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
