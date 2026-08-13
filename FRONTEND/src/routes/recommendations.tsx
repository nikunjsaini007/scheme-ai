import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Check, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/store/useProfile";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "relevance", label: "Best match" },
  { id: "financial-benefit", label: "Financial benefit" },
  { id: "education", label: "Education" },
  { id: "healthcare", label: "Healthcare" },
  { id: "housing", label: "Housing" },
  { id: "agriculture", label: "Agriculture" },
  { id: "women-child", label: "Women & Child" },
];

export const Route = createFileRoute("/recommendations")({
  head: () => ({ title: "Your Matched Schemes – Yojantra", description: "Explore government schemes matched to your profile." }),
  component: Recommendations,
});

function Recommendations() {
  const { t } = useT();
  const { answers, persona } = useProfile();
  const [filter, setFilter] = useState("relevance");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("savedSchemeIds") || "[]") as string[];
  });

  const filteredSchemes = useMemo(() => {
    const result = schemes.filter((scheme) => {
      const haystack = scheme.name + " " + scheme.summary + " " + scheme.category;
      const matchesSearch = haystack.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filter === "relevance" ||
        (filter === "financial-benefit" && scheme.benefitNote.toLowerCase().includes("₹")) ||
        (filter === "women-child" && scheme.category === "WOMEN & CHILDREN") ||
        scheme.category === filter.toUpperCase();
      return matchesSearch && matchesFilter;
    });
    return [...result].sort((a, b) => b.match - a.match);
  }, [filter, searchTerm]);

  const toggleSave = (id: string) => {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id];
    setSavedIds(next);
    window.localStorage.setItem("savedSchemeIds", JSON.stringify(next));
  };

  const profileEntries = Object.entries(answers).slice(0, 4);

  return (
    <main className="overflow-hidden bg-ivory text-ink">
      <Nav />
      <section className="edge py-28 md:py-40">
        <SectionLabel index="01" title={t("Your recommendations")} />
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow text-saffron">{t("Matched for you")}</p>
              <h1 className="display mt-6 text-[16vw] leading-[.9] md:text-[8vw]">{t("Benefits that fit.")}</h1>
              <p className="mt-7 max-w-md text-sm leading-relaxed text-ink/60">{t("These schemes are ranked by how closely their published criteria match the profile you shared.")}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="bg-ink p-7 text-ivory md:p-8">
              <div className="flex items-start justify-between"><div><p className="eyebrow text-ivory/40">{t("Your profile")}</p><p className="display mt-3 text-3xl text-saffron">{persona ? t(persona) : t("Personalized")}</p></div><Link to="/personalize" className="text-ivory/45 hover:text-saffron"><SlidersHorizontal className="size-4" /></Link></div>
              {profileEntries.length > 0 ? <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-ivory/15 pt-5">{profileEntries.map(([key, value]) => <div key={key}><dt className="eyebrow text-ivory/35">{t(key)}</dt><dd className="mt-1 text-sm text-ivory/75">{t(value)}</dd></div>)}</dl> : <p className="mt-5 text-sm leading-relaxed text-ivory/55">{t("Personalize your profile to make these matches more precise.")}</p>}
              <Link to="/personalize" className="mt-7 inline-flex items-center gap-2 border-b border-saffron pb-1 text-[10px] font-semibold tracking-[.16em] text-saffron uppercase">{t("Update profile")} <ArrowRight className="size-3" /></Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ivory-deep py-16 md:py-24">
        <div className="edge">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="display text-5xl text-saffron">{filteredSchemes.length}</p><p className="eyebrow mt-2 text-ink/45">{t("schemes found for you")}</p></div><label className="flex w-full items-center gap-3 rounded-full border border-ink/15 bg-ivory px-5 py-3 md:max-w-sm"><Search className="size-4 text-ink/40" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t("Search your matches…")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35" /></label></div>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2">{FILTERS.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={cn("shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold tracking-[.14em] uppercase transition-colors", filter === item.id ? "border-saffron bg-saffron text-white" : "border-ink/15 text-ink/55 hover:border-saffron hover:text-saffron")}>{t(item.label)}</button>)}</div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredSchemes.map((scheme, index) => <motion.article key={scheme.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }} className="group flex min-h-[390px] flex-col rounded-xl bg-white p-7 transition-transform duration-300 hover:-translate-y-1 md:p-8"><div className="flex items-center justify-between"><span className="eyebrow text-saffron">{scheme.match}% {t("match")}</span><button onClick={() => toggleSave(scheme.id)} className="text-ink/35 hover:text-saffron" aria-label={t("Save scheme")}><Bookmark className={cn("size-5", savedIds.includes(scheme.id) && "fill-saffron text-saffron")} /></button></div><p className="eyebrow mt-9 text-ink/35">{t(scheme.category)} · {t(scheme.level)}</p><h2 className="display mt-3 text-4xl leading-[.95] text-ink">{t(scheme.name)}</h2><p className="mt-5 text-sm leading-relaxed text-ink/60">{t(scheme.summary)}</p><div className="mt-auto flex items-end justify-between border-t border-ink/10 pt-6"><div><p className="display text-4xl text-saffron">{t(scheme.benefit)}</p><p className="eyebrow mt-1 text-ink/35">{t(scheme.benefitNote)}</p></div><Link to="/scheme/$id" params={{ id: scheme.id }} className="grid size-10 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-saffron" aria-label={t("View scheme")}><ArrowRight className="size-4" /></Link></div></motion.article>)}</div>
          {filteredSchemes.length === 0 && <div className="mt-10 bg-white p-12 text-center"><Check className="mx-auto size-6 text-saffron" /><p className="mt-4 text-sm text-ink/55">{t("No schemes match your search. Try another keyword or filter.")}</p></div>}
        </div>
      </section>
      <Footer />
    </main>
  );
}
