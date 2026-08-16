import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/store/useProfile";
import { schemes } from "@/data/schemes";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { requireAuth } from "@/components/AuthGuard";

export const Route = createFileRoute("/saved")({
  beforeLoad: requireAuth,
  head: () => ({
    title: "Saved Schemes – Yojantra",
    description: "Your bookmarked government schemes",
  }),
  component: Saved,
});

function Saved() {
  const { t } = useT();
  const { answers } = useProfile();

  // Simple persisted saved IDs using localStorage
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(
    () => setSavedIds(JSON.parse(localStorage.getItem("savedSchemeIds") || "[]") as string[]),
    [],
  );
  const savedSchemes = schemes.filter((s) => savedIds.includes(s.id));
  const toggleSave = (id: string) => {
    const exists = savedIds.includes(id);
    const newIds = exists ? savedIds.filter((i) => i !== id) : [...savedIds, id];
    setSavedIds(newIds);
    localStorage.setItem("savedSchemeIds", JSON.stringify(newIds));
  };

  return (
    <main className="bg-ivory text-ink">
      <Nav />

      <section className="edge py-24 md:py-32">
        <SectionLabel index="01" title={t("Saved for later")} />

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-6 mb-8">
            <div>
              <p className="display text-3xl text-saffron">{savedSchemes.length}</p>
              <p className="text-sm text-ink/60">{t("schemes saved")}</p>
            </div>

            <Link
              to="/schemes"
              className="rounded-full bg-saffron py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-ivory hover:text-ink"
            >
              {t("Explore schemes →")}
            </Link>
          </div>

          {savedSchemes.length === 0 && (
            <div className="bg-ink p-8 rounded-xl text-center">
              <p className="text-2xl md:text-3xl text-saffron mb-4">♡</p>
              <h3>{t("You haven't saved any schemes yet.")}</h3>
              <p className="text-ink/60 mb-8">
                {t("Bookmark schemes you like during your search or from your recommendations.")}
              </p>
              <Link to="/schemes" className="display text-saffron uppercase">
                {t("Explore schemes →")}
              </Link>
            </div>
          )}

          {savedSchemes.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedSchemes.map((scheme) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative overflow-hidden rounded-xl bg-ink p-6 text-ivory transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-24px_rgba(17,17,17,0.55)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/40">
                      {scheme.match}% {t("match")}
                    </span>
                    <span className="text-xs text-saffron font-medium">{t(scheme.category)}</span>
                  </div>
                  <h3 className="mt-2 display text-[20vw] leading-[0.8] text-saffron md:text-[8vw]">
                    {t(scheme.name)}
                  </h3>
                  <p className="mt-2 text-sm text-ivory/60">{t(scheme.summary)}</p>
                  <p className="mt-3 text-[12px]">
                    {t("Benefit")}: {t(scheme.benefit)}
                  </p>
                  <Link
                    to="/scheme/$id"
                    params={{ id: scheme.id }}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-ivory hover:text-ink"
                  >
                    {savedIds.includes(scheme.id) ? t("Saved") : t("Save Scheme")}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
