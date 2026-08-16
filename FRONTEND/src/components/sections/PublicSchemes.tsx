import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ExternalLink, Search } from "lucide-react";
import { motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { fetchActiveSchemes, type SchemeRecord } from "@/lib/schemeCatalog";

const INITIAL_COUNT = 6;
const PAGE_SIZE = 12;

type SortKey = "recent" | "az" | "central" | "state";

function sortSchemes(schemes: SchemeRecord[], sortBy: SortKey): SchemeRecord[] {
  const copy = [...schemes];
  switch (sortBy) {
    case "az":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "recent":
      return copy.sort(
        (a, b) => new Date(b.last_verified_at).getTime() - new Date(a.last_verified_at).getTime(),
      );
    case "central":
      return copy.sort((a, b) => {
        if (a.level === "Central" && b.level !== "Central") return -1;
        if (a.level !== "Central" && b.level === "Central") return 1;
        return 0;
      });
    case "state":
      return copy.sort((a, b) => {
        if (a.level === "State" && b.level !== "State") return -1;
        if (a.level !== "State" && b.level === "State") return 1;
        return 0;
      });
    default:
      return copy;
  }
}

export function PublicSchemes() {
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [expanded, setExpanded] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    void fetchActiveSchemes()
      .then(setSchemes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(schemes.map((s) => s.category))).sort(),
    [schemes],
  );

  const filtered = useMemo(() => {
    const haystack = (scheme: SchemeRecord) =>
      [
        scheme.name,
        scheme.description,
        scheme.ministry,
        scheme.category,
        scheme.level,
        scheme.state || "",
        ...scheme.benefits,
        ...scheme.eligibility,
      ]
        .join(" ")
        .toLowerCase();

    const q = search.toLowerCase();
    return schemes.filter(
      (scheme) =>
        haystack(scheme).includes(q) && (category === "All" || scheme.category === category),
    );
  }, [schemes, search, category]);

  const sorted = useMemo(() => sortSchemes(filtered, sortBy), [filtered, sortBy]);

  const visibleSchemes = useMemo(
    () => sorted.slice(0, expanded ? displayCount : INITIAL_COUNT),
    [sorted, expanded, displayCount],
  );

  const hasMore = expanded && displayCount < sorted.length;

  const handleExploreAll = () => {
    setLoadingMore(true);
    // Simulate brief loading for smooth UX
    setTimeout(() => {
      setExpanded(true);
      setDisplayCount(PAGE_SIZE);
      setLoadingMore(false);
    }, 300);
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, 200);
  };

  return (
    <section id="schemes" className="edge py-28 md:py-40">
      <SectionLabel index="01" title="Public scheme discovery" />
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <LineReveal
            className="display text-[14vw] leading-[0.86] md:text-[7vw]"
            lines={["Explore Current", "Government Schemes"]}
          />
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
              These are general scheme records verified from official sources. Complete your profile
              to request AI-assisted recommendations.
            </p>
            <Link
              to="/personalize"
              className="mt-7 inline-flex items-center gap-2 border-b border-saffron pb-1 text-[10px] font-semibold tracking-[.16em] text-saffron uppercase"
            >
              Find Schemes I&apos;m Eligible For <ArrowRight className="size-3" />
            </Link>
          </div>
        </Reveal>
      </div>

      {loading && (
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex min-h-[410px] flex-col rounded-xl bg-white p-7 md:p-8">
              <div className="h-4 w-24 animate-pulse rounded bg-ink/10" />
              <div className="mt-8 h-3 w-20 animate-pulse rounded bg-ink/10" />
              <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-ink/10" />
              <div className="mt-4 h-3 w-full animate-pulse rounded bg-ink/10" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-ink/10" />
              <div className="mt-auto pt-7">
                <div className="h-3 w-28 animate-pulse rounded bg-ink/10" />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-16 bg-ivory-deep p-8 text-sm text-ink/60">
          Current scheme information is temporarily unavailable. {error}
        </p>
      )}
      {!loading && !error && schemes.length === 0 && (
        <p className="mt-16 bg-ivory-deep p-8 text-sm text-ink/60">
          No current schemes are available right now.
        </p>
      )}
      {!loading && !error && schemes.length > 0 && (
        <>
          <div className="mt-12 flex flex-col gap-3 md:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-full border border-ink/15 bg-ivory-deep px-5 py-3">
              <Search className="size-4 text-ink/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search schemes, benefits, farmers, students…"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
              />
            </label>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="appearance-none rounded-full border border-ink/15 bg-ivory-deep px-5 py-3 pr-10 text-sm"
                >
                  <option>All</option>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortKey)}
                  className="appearance-none rounded-full border border-ink/15 bg-ivory-deep px-5 py-3 pr-10 text-sm"
                >
                  <option value="recent">Recently Verified</option>
                  <option value="az">A–Z</option>
                  <option value="central">Central First</option>
                  <option value="state">State First</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
              </div>
            </div>
          </div>

          {expanded && (
            <p className="mt-6 text-sm text-ink/50">
              {sorted.length} {sorted.length === 1 ? "scheme" : "schemes"} available
            </p>
          )}

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleSchemes.map((scheme, index) => (
              <motion.article
                key={scheme.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % PAGE_SIZE) * 0.04 }}
                className="flex min-h-[410px] flex-col rounded-xl bg-white p-7 md:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="eyebrow text-saffron">{scheme.level} scheme</span>
                  <span className="eyebrow text-ink/35">{scheme.status}</span>
                </div>
                <p className="eyebrow mt-8 text-ink/40">{scheme.category}</p>
                <h2 className="display mt-3 text-4xl leading-[.95]">{scheme.name}</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink/60">{scheme.description}</p>
                <dl className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
                  <div>
                    <dt className="eyebrow text-ink/35">Ministry / department</dt>
                    <dd className="mt-1 text-ink/75">{scheme.ministry}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink/35">Main benefit</dt>
                    <dd className="mt-1 text-ink/75">
                      {scheme.benefits[0] || "See official scheme details"}
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink/35">For</dt>
                    <dd className="mt-1 text-ink/75">
                      {scheme.eligibility[0] || "See official eligibility"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex items-center justify-between pt-7">
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={scheme.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border-b border-ink pb-1 text-[10px] font-semibold tracking-[.16em] uppercase hover:border-saffron hover:text-saffron"
                    >
                      View Details <ArrowRight className="size-3" />
                    </a>
                    <a
                      href={scheme.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-semibold tracking-[.14em] text-ink/45 uppercase hover:text-saffron"
                    >
                      Official Website
                    </a>
                  </div>
                  <a
                    href={scheme.source_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Official source for ${scheme.name}`}
                    className="text-ink/40 hover:text-saffron"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <p className="mt-10 text-center text-sm text-ink/50">
              No schemes match your search. Try a different keyword or category.
            </p>
          )}

          {!expanded && sorted.length > INITIAL_COUNT && (
            <div className="mt-12 text-center">
              <button
                onClick={handleExploreAll}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-[11px] font-semibold tracking-[.16em] text-ivory uppercase transition-colors hover:bg-ink/80 disabled:opacity-50"
              >
                {loadingMore ? "Loading Schemes…" : "Explore All Schemes"}
                {!loadingMore && <ArrowRight className="size-3" />}
              </button>
            </div>
          )}

          {expanded && hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-8 py-4 text-[11px] font-semibold tracking-[.16em] uppercase transition-colors hover:border-ink/40 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load More"}
                {!loadingMore && <ChevronDown className="size-3" />}
              </button>
            </div>
          )}

          {expanded && !hasMore && sorted.length > 0 && (
            <p className="mt-12 text-center text-sm text-ink/40">Showing all available schemes</p>
          )}
        </>
      )}
    </section>
  );
}
