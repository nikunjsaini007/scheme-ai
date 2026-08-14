import { Check } from "lucide-react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { LAST_VERIFIED } from "@/data/schemes";
import { useT } from "@/lib/i18n";

const POINTS = [
  "Government scheme information",
  "Official sources",
  "Eligibility explanations",
  "Direct official application links",
  "Last verified date on every scheme",
];

export function Trust() {
  const { t } = useT();
  return (
    <section className="bg-ivory-deep py-28 md:py-40">
      <div className="edge grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionLabel index="02" title={t("Trust")} />
          <LineReveal
            className="display text-[11vw] leading-[0.86] md:text-[5.2vw]"
            lines={[t("We help you find."), <span key="g" className="text-saffron">{t("The government provides.")}</span>]}
          />
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink/60">
              {t("Yojantra is not a government department, agent or intermediary. We don't process applications, collect fees or promise approvals. We help you understand what exists and send you to the official portal.")}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <ul className="border-t border-ink/15">
            {POINTS.map((p, i) => (
              <Reveal key={p} delay={i * 0.07}>
                <li className="flex items-center gap-4 border-b border-ink/12 py-4 text-sm text-ink/80">
                  <Check className="size-4 shrink-0 text-verified" strokeWidth={2.4} />
                  {t(p)}
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3}>
            <div className="mt-8 flex items-baseline justify-between bg-white p-6">
              <div>
                <p className="eyebrow text-ink/40">{t("Last verified")}</p>
                <p className="display mt-2 text-3xl">{LAST_VERIFIED}</p>
              </div>
              <p className="max-w-[16ch] text-right text-[11px] leading-relaxed text-official">
                {t("Information verified against official government sources.")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
