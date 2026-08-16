import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { schemes, LAST_VERIFIED } from "@/data/schemes";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    title: "About Yojantra",
    description: "Learn about Yojantra — AI-powered discovery of Indian government schemes",
  }),
  component: About,
});

function About() {
  const { t } = useT();

  return (
    <main className="overflow-x-hidden bg-ivory text-ink">
      <Nav />

      <section className="edge py-28 md:py-40">
        <SectionLabel index="01" title={t("About Yojantra")} />

        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="eyebrow text-saffron mb-4">{t("We help you find")}</p>
            <p className="display text-4xl md:text-6xl leading-[0.8] text-ink mb-6">
              {t("Yojantra")}
            </p>
            <p className="text-ink/60 leading-relaxed">
              {t(
                "A free discovery layer over India's government schemes -  matching, eligibility checks and official links, without the paperwork maze.",
              )}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 text-sm text-ink/55">{t("What Yojantra is")}:</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              {t(
                "A free discovery layer over India's government schemes -  matching, eligibility checks and official links, without the paperwork maze.",
              )}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 text-sm text-ink/55">{t("Why it was created")}:</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              {t(
                "Most benefits never reach the people they were made for - not because they aren't eligible, but because they never find out.",
              )}
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <p className="mt-8 text-sm text-ink/55">{t("How scheme information is verified")}:</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              {t(
                "Scheme information is manually researched and cross-checked against official sources, then stamped with a last-verified date.",
              )}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-8 text-sm text-ink/55">{t("Data sources")}:</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              {t("Official government portals and notified sources. Last verified: ")}{" "}
              <span className="text-saffron">{LAST_VERIFIED}</span>
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <p className="mt-8 text-sm text-ink/55">{t("Privacy")}:</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              {t(" We never collect fees or process applications.")}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <a
                href="mailto:hello@yojantra.in"
                className="flex items-center gap-2 rounded-bg bg-saffron px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-saffron/90"
              >
                <span>{t("hello@yojantra.in")}</span>
              </a>
              <a
                href="#contact"
                className="flex items-center gap-2 rounded-bg bg-ivory px-4 py-2 text-sm font-medium text-ink/60 transition-colors hover:bg-ivory/90"
              >
                {t("Contact")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
