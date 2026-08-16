import { Counter, LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { useT } from "@/lib/i18n";

const FIGURES = [
  { value: 1.8, prefix: "₹", suffix: "L", decimals: 1, label: "Potential annual benefits" },
  { value: 17, label: "Relevant schemes" },
  { value: 8, label: "High-confidence matches" },
  { value: 6, label: "Documents still needed" },
];

export function Benefits() {
  const { t } = useT();
  return (
    <section id="benefits" className="bg-ivory-deep py-28 md:py-40">
      <div className="edge">
        <SectionLabel index="04" title={t("Benefit visualization")} />
        <LineReveal
          className="display text-[14vw] leading-[0.85] md:text-[8vw]"
          lines={[t("What could"), t("you get?")]}
        />

        <div className="mt-20 grid gap-y-14 md:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.1}>
              <div className={i % 2 ? "lg:mt-10" : ""}>
                <Counter
                  to={f.value}
                  prefix={f.prefix ?? ""}
                  suffix={f.suffix ?? ""}
                  decimals={f.decimals ?? 0}
                  className={`display block text-[16vw] leading-none md:text-[6vw] ${i === 0 ? "text-saffron" : "text-ink"}`}
                />
                <p className="mt-4 max-w-[14ch] text-[11px] tracking-[0.14em] text-ink/50 uppercase">
                  {t(f.label)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-20 max-w-lg border-t border-ink/15 pt-6 text-[12px] leading-relaxed text-ink/45">
            {t(
              "Estimated potential benefits based on matching schemes. These are indicative figures from mock data — not a guaranteed government payout, and not an approval of any application.",
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
