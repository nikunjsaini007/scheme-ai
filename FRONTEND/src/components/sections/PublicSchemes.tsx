import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Search } from "lucide-react";
import { motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { fetchActiveSchemes, type SchemeRecord } from "@/lib/schemeCatalog";

export function PublicSchemes() {
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    void fetchActiveSchemes()
      .then(setSchemes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="schemes" className="edge py-28 md:py-40">
      <SectionLabel index="01" title="Public scheme discovery" />
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <LineReveal className="display text-[14vw] leading-[0.86] md:text-[7vw]" lines={["Explore Current", "Government Schemes"]} />
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-lg text-sm leading-relaxed text-ink/60">
              Discover currently available government schemes and benefits across India.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.25} className="lg:col-span-4 lg:col-start-9">
          <div className="bg-ink p-7 text-ivory md:p-8">
            <p className="eyebrow text-saffron">Not personalized</p>
            <p className="mt-4 text-sm leading-relaxed text-ivory/70">
              These are general scheme records verified from official sources. Complete your profile to request AI-assisted recommendations.
            </p>
            <Link to="/personalize" className="mt-7 inline-flex items-center gap-2 border-b border-saffron pb-1 text-[10px] font-semibold tracking-[.16em] text-saffron uppercase">
              Find Schemes I&apos;m Eligible For <ArrowRight className="size-3" />
            </Link>
          </div>
        </Reveal>
      </div>

      {loading && <p className="mt-16 text-sm text-ink/55">Loading current schemes…</p>}
      {error && <p className="mt-16 bg-ivory-deep p-8 text-sm text-ink/60">Current scheme information is temporarily unavailable. {error}</p>}
      {!loading && !error && schemes.length === 0 && (
        <p className="mt-16 bg-ivory-deep p-8 text-sm text-ink/60">No verified current schemes are available yet.</p>
      )}
      {!loading && !error && schemes.length > 0 && <div className="mt-12 flex flex-col gap-3 md:flex-row"><label className="flex flex-1 items-center gap-3 rounded-full border border-ink/15 bg-ivory-deep px-5 py-3"><Search className="size-4 text-ink/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search schemes, benefits, farmers, students…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-ink/15 bg-ivory-deep px-5 py-3 text-sm"><option>All</option>{Array.from(new Set(schemes.map((scheme) => scheme.category))).sort().map((item) => <option key={item}>{item}</option>)}</select></div>}
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {schemes.slice(0, 6).filter((scheme) => { const haystack = [scheme.name, scheme.description, scheme.ministry, scheme.category, scheme.level, scheme.state || "", ...scheme.benefits, ...scheme.eligibility].join(" ").toLowerCase(); return haystack.includes(search.toLowerCase()) && (category === "All" || scheme.category === category); }).map((scheme, index) => (
          <motion.article key={scheme.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="flex min-h-[410px] flex-col rounded-xl bg-white p-7 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow text-saffron">{scheme.level} scheme</span>
              <span className="eyebrow text-ink/35">{scheme.status}</span>
            </div>
            <p className="eyebrow mt-8 text-ink/40">{scheme.category}</p>
            <h2 className="display mt-3 text-4xl leading-[.95]">{scheme.name}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">{scheme.description}</p>
            <dl className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
              <div><dt className="eyebrow text-ink/35">Ministry / department</dt><dd className="mt-1 text-ink/75">{scheme.ministry}</dd></div>
              <div><dt className="eyebrow text-ink/35">Main benefit</dt><dd className="mt-1 text-ink/75">{scheme.benefits[0] || "See official scheme details"}</dd></div>
              <div><dt className="eyebrow text-ink/35">For</dt><dd className="mt-1 text-ink/75">{scheme.eligibility[0] || "See official eligibility"}</dd></div>
            </dl>
            <div className="mt-auto flex items-center justify-between pt-7">
              <div className="flex flex-wrap items-center gap-4"><a href={scheme.application_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-ink pb-1 text-[10px] font-semibold tracking-[.16em] uppercase hover:border-saffron hover:text-saffron">View Details <ArrowRight className="size-3" /></a><a href={scheme.application_url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold tracking-[.14em] text-ink/45 uppercase hover:text-saffron">Official Website</a></div>
              <a href={scheme.source_url} target="_blank" rel="noreferrer" aria-label={`Official source for ${scheme.name}`} className="text-ink/40 hover:text-saffron"><ExternalLink className="size-4" /></a>
            </div>
          </motion.article>
        ))}
      </div>
      {!loading && !error && schemes.length > 6 && <div className="mt-10 text-center"><Link to="/schemes" className="inline-flex items-center gap-2 border-b border-ink pb-1 text-[10px] font-semibold tracking-[.16em] uppercase hover:border-saffron hover:text-saffron">Explore all schemes <ArrowRight className="size-3" /></Link></div>}
    </section>
  );
}
