import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LineReveal, Reveal } from "@/components/motion-primitives";
import { getScheme, LAST_VERIFIED, type Scheme } from "@/data/schemes";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/scheme/$id")({
  loader: ({ params }) => {
    const scheme = getScheme(params.id);
    if (!scheme) throw notFound();
    return { scheme };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Scheme unavailable — Yojantra" }, { name: "robots", content: "noindex" }] };
    }
    const { scheme } = loaderData;
    const title = `${scheme.name} — eligibility & benefits | Yojantra`;
    const description = `${scheme.summary} Potential benefit ${scheme.benefit}. See who can apply, documents needed and how to apply officially.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SchemeDetail,
});

function SchemeDetail() {
  const { scheme } = Route.useLoaderData() as { scheme: Scheme };
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useT();

  return (
    <main className="overflow-x-hidden bg-ivory text-ink">
      <Nav />

      <section className="edge pt-32 pb-16 md:pt-44">
        <Reveal>
          <Link to="/schemes" className="eyebrow text-ink/40 hover:text-saffron">
            {t("← All schemes")}
          </Link>
        </Reveal>
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="eyebrow text-saffron">{scheme.match}% {t("match")}</span>
              <span className="eyebrow text-ink/40">{t(scheme.level)}</span>
              <span className="eyebrow text-ink/40">{t(scheme.category)}</span>
              {scheme.year && <span className="eyebrow text-ink/40">{scheme.year} · {t(scheme.status ?? "ACTIVE")}</span>}
            </div>
            <LineReveal
              as="h1"
              className="display mt-6 text-[14vw] leading-[0.84] lg:text-[7vw]"
              lines={t(scheme.name).split(" ").map((w) => w)}
            />
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-base text-ink/65">{t(scheme.summary)}</p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="bg-ink p-8 text-ivory md:p-10">
              <p className="display text-[18vw] leading-none text-saffron lg:text-[7vw]">{scheme.benefit}</p>
              <p className="eyebrow mt-4 text-ivory/45">{t(scheme.benefitNote)}</p>
              {scheme.deadlineDays && (
                <div className="mt-8 flex items-baseline justify-between border-t border-ivory/15 pt-6">
                  <span className="eyebrow text-ivory/45">{t("Deadline")}</span>
                  <span className="display text-3xl">{scheme.deadlineDays} {t("days")}</span>
                </div>
              )}
              <a
                href="#apply"
                className="mt-8 flex items-center justify-center gap-3 rounded-full bg-saffron px-6 py-4 text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-ivory hover:text-ink"
              >
                {t("How to apply →")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="edge grid gap-14 py-16 lg:grid-cols-2 lg:py-24">
        {[
          { title: "Who can apply", items: scheme.whoCanApply },
          { title: "What you get", items: scheme.whatYouGet },
        ].map((block) => (
          <Reveal key={block.title}>
            <h2 className="display text-4xl md:text-5xl">{t(block.title)}</h2>
            <ul className="mt-8 border-t border-ink/15">
              {block.items.map((it) => (
                <li key={it} className="flex gap-4 border-b border-ink/12 py-4 text-sm text-ink/75">
                  <Check className="mt-0.5 size-4 shrink-0 text-verified" strokeWidth={2.4} />
                  {t(it)}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </section>

      <section className="bg-ivory-deep py-24">
        <div className="edge">
          <LineReveal className="display text-[12vw] leading-[0.88] md:text-[6vw]" lines={[t("What you'll need")]} />
          <div className="mt-12 border-t border-ink/15">
            {scheme.documents.map((d) => (
              <div key={d.name} className="border-b border-ink/12">
                <button
                  onClick={() => setOpen(open === d.name ? null : d.name)}
                  className="group flex w-full items-center gap-4 py-6 text-left"
                >
                  <Check className="size-4 shrink-0 text-verified" strokeWidth={2.4} />
                  <span className="display text-2xl transition-colors group-hover:text-saffron md:text-3xl">
                    {t(d.name)}
                  </span>
                  <span
                    className={`eyebrow ml-auto ${d.mandatory ? "text-ink/40" : "text-official"}`}
                  >
                    {d.mandatory ? t("Mandatory") : t("If applicable")}
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${open === d.name ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === d.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pb-8 md:grid-cols-2 md:pl-8">
                        <div>
                          <p className="eyebrow text-ink/40">{t("Why it's required")}</p>
                          <p className="mt-2 text-sm text-ink/75">{t(d.why)}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-ink/40">{t("How to obtain it")}</p>
                          <p className="mt-2 text-sm text-ink/75">{t(d.how)}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="edge py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <LineReveal className="display text-[12vw] leading-[0.88] md:text-[5.4vw]" lines={[t("How to apply")]} />
            <ol className="mt-12 border-t border-ink/15">
              {scheme.howToApply.map((s, i) => (
                <Reveal key={s} delay={i * 0.06}>
                  <li className="flex gap-6 border-b border-ink/12 py-6">
                    <span className="display text-3xl text-saffron md:text-4xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-sm text-ink/75 md:text-base">{t(s)}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <Reveal className="lg:col-span-4 lg:col-start-9">
            <div className="bg-white p-8">
              <p className="eyebrow text-ink/40">{t("Official source")}</p>
              <p className="mt-3 text-lg leading-snug">{scheme.source}</p>
              <a
                href="#apply"
                className="mt-6 inline-flex items-center gap-2 border-b border-ink pb-1 text-[11px] font-semibold tracking-[0.16em] uppercase hover:border-saffron hover:text-saffron"
              >
                {t("Go to official portal")} <ExternalLink className="size-3.5" />
              </a>
              <div className="mt-8 border-t border-ink/12 pt-6">
                <p className="eyebrow text-ink/40">{t("Last verified")}</p>
                <p className="display mt-2 text-2xl">{LAST_VERIFIED}</p>
              </div>
              <p className="mt-6 text-[11px] leading-relaxed text-ink/45">
                {t("Demo data. Applications are submitted only on the official government portal — Yojantra never collects fees or processes applications.")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
