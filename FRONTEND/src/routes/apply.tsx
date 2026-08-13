import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { useT } from "@/lib/i18n";

const STEPS = [
  { title: "Find your scheme", detail: "Use search or personalize your profile to find benefits relevant to your situation." },
  { title: "Read the criteria", detail: "Check who can apply, what you receive, the deadline, and documents required." },
  { title: "Prepare documents", detail: "Keep identity, income, bank, education, or land records ready as applicable." },
  { title: "Apply officially", detail: "Use the official government portal or visit a nearby Common Service Centre." },
  { title: "Track your application", detail: "Save your application ID and follow updates through the official portal." },
];

export const Route = createFileRoute("/apply")({
  head: () => ({ title: "How to apply – Yojantra", description: "A simple guide to applying for Indian government schemes." }),
  component: Apply,
});

function Apply() {
  const { t } = useT();
  return <main className="overflow-hidden bg-ivory text-ink">
    <Nav />
    <section className="edge py-28 md:py-40">
      <SectionLabel index="01" title={t("Application guide")} />
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LineReveal as="h1" className="display text-[16vw] leading-[.86] md:text-[8vw]" lines={[t("From discovery"), t("to done.")]} />
          <p className="mt-8 max-w-md text-base leading-relaxed text-ink/60">{t("Government applications can feel complicated. This five-step guide helps you move from finding a scheme to applying with confidence.")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/schemes" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 text-[11px] font-semibold tracking-[.16em] text-ivory uppercase hover:bg-saffron">{t("Explore schemes")} <ArrowRight className="size-4" /></Link>
            <Link to="/personalize" className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-4 text-[11px] font-semibold tracking-[.16em] text-ink/65 uppercase hover:border-saffron hover:text-saffron">{t("Check eligibility")}</Link>
          </div>
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9">
          <div className="bg-ink p-8 text-ivory md:p-10"><p className="eyebrow text-saffron">{t("Important")}</p><p className="display mt-6 text-4xl leading-[.9] md:text-5xl">{t("Yojantra helps you discover. The government decides.")}</p><p className="mt-6 text-sm leading-relaxed text-ivory/55">{t("We never collect fees, submit applications, or promise approvals. Always verify details on the official portal.")}</p></div>
        </Reveal>
      </div>
    </section>
    <section className="bg-ivory-deep py-24 md:py-32"><div className="edge"><p className="eyebrow text-saffron">{t("The journey")}</p><div className="mt-8 border-t border-ink/15">{STEPS.map((step, i) => <Reveal key={step.title} delay={i * .05}><div className="grid gap-4 border-b border-ink/12 py-7 md:grid-cols-[80px_1fr_1fr] md:items-center"><span className="display text-4xl text-saffron">{String(i + 1).padStart(2, "0")}</span><h2 className="display text-3xl md:text-4xl">{t(step.title)}</h2><p className="max-w-sm text-sm leading-relaxed text-ink/60">{t(step.detail)}</p></div></Reveal>)}</div></div></section>
    <section className="edge py-24"><div className="grid gap-10 md:grid-cols-2"><div><p className="eyebrow text-ink/40">{t("Before you submit")}</p><ul className="mt-6 space-y-4">{["Check the deadline", "Use only the official portal", "Review every document", "Save your acknowledgement"].map((item) => <li key={item} className="flex gap-3 text-sm text-ink/75"><Check className="size-4 shrink-0 text-verified" />{t(item)}</li>)}</ul></div><div className="bg-white p-8"><p className="eyebrow text-ink/40">{t("Need a starting point?")}</p><p className="display mt-4 text-4xl">{t("Find a scheme that fits you.")}</p><Link to="/schemes" className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] font-semibold tracking-[.16em] uppercase hover:border-saffron hover:text-saffron">{t("Browse schemes")} <ExternalLink className="size-3.5" /></Link></div></div></section>
    <Footer />
  </main>;
}
