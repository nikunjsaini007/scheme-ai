import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Bookmark } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { categories, schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schemes")({
  head: () => ({ title: "Discover Schemes – Yojantra", description: "Search and explore Indian government schemes." }),
  component: Schemes,
});

function Schemes() {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [year, setYear] = useState("ALL");
  const [saved, setSaved] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("savedSchemeIds") || "[]") as string[];
  });

  const filtered = useMemo(() => schemes.filter((scheme) => {
    const haystack = `${scheme.name} ${scheme.summary} ${scheme.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "ALL" || scheme.category === category) && (level === "ALL" || scheme.level === level) && (year === "ALL" || String(scheme.year ?? "") === year);
  }), [category, level, query, year]);

  const toggleSave = (id: string) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next);
    window.localStorage.setItem("savedSchemeIds", JSON.stringify(next));
  };

  return <main className="bg-ivory-deep text-ink">
    <Nav />
    <section className="edge py-28 md:py-40">
      <SectionLabel index="01" title={t("Discover schemes")} />
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div><h1 className="display max-w-2xl text-6xl leading-[.85] md:text-8xl">{t("Find support that fits your life.")}</h1><p className="mt-6 max-w-md text-sm text-ink/60">{t("Browse government benefits, understand the criteria, and follow the official application steps.")}</p></div>
        <Link to="/personalize" className="rounded-full bg-saffron px-6 py-3.5 text-center text-[11px] font-semibold tracking-[.16em] text-white uppercase">{t("Personalize your search →")}</Link>
      </div>
      <div className="mt-16 grid gap-3 border-y border-ink/15 py-5 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="flex items-center gap-3 border-b border-ink/15 pb-3 md:border-b-0 md:pb-0"><Search className="size-4 text-ink/45" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search schemes…")} className="w-full bg-transparent text-sm outline-none" /></label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-xs uppercase outline-none"><option value="ALL">{t("All categories")}</option>{categories.map((item) => <option key={item.name} value={item.name}>{t(item.name)}</option>)}</select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-xs uppercase outline-none"><option value="ALL">{t("All levels")}</option><option value="CENTRAL GOVERNMENT">{t("Central government")}</option><option value="STATE GOVERNMENT">{t("State government")}</option></select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-xs uppercase outline-none"><option value="ALL">{t("All years")}</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option></select>
      </div>
      <p className="mt-8 text-sm text-ink/55">{filtered.length} {t("schemes found")}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((scheme, i) => <Reveal key={scheme.id} delay={i * .04}>
          <article className="flex h-full flex-col bg-ink p-7 text-ivory rounded-xl">
            <div className="flex items-center justify-between"><span className="eyebrow text-saffron">{scheme.match}% {t("match")}</span><button onClick={() => toggleSave(scheme.id)} aria-label={t("Save scheme")} className="text-ivory/60 hover:text-saffron"><Bookmark className={cn("size-4", saved.includes(scheme.id) && "fill-saffron text-saffron")} /></button></div>
            <div className="mt-6 flex flex-wrap gap-2"><p className="eyebrow text-ivory/40">{t(scheme.category)}</p>{scheme.year && <span className={cn("eyebrow", scheme.status === "UPCOMING" ? "text-saffron" : "text-ivory/40")}>{scheme.year} · {t(scheme.status ?? "ACTIVE")}</span>}</div><h2 className="display mt-2 text-4xl text-saffron">{t(scheme.name)}</h2><p className="mt-4 text-sm text-ivory/65">{t(scheme.summary)}</p>
            <div className="mt-auto pt-8"><p className="display text-5xl">{t(scheme.benefit)}</p><p className="eyebrow mt-2 text-ivory/40">{t(scheme.benefitNote)}</p><Link to="/scheme/$id" params={{ id: scheme.id }} className="mt-6 inline-flex border-b border-saffron pb-1 text-[11px] font-semibold tracking-[.16em] text-saffron uppercase">{t("View scheme →")}</Link></div>
          </article>
        </Reveal>)}
      </div>
    </section>
    <Footer />
  </main>;
}
