import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bookmark, RefreshCw, Search, Check, AlertTriangle, X } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { getUser } from "@/lib/auth";
import { fetchRecommendations, generateRecommendations, type RecommendationRecord } from "@/lib/schemeCatalog";
import { requireAuth } from "@/components/AuthGuard";
import { supabase } from "@/supabase";
import { getScheme } from "@/data/schemes";

const FILTERS = ["All", "Eligible", "Likely eligible", "Possible match", "Need more information", "Education", "Employment", "Financial", "Healthcare", "Housing", "Agriculture", "Women & Child", "Entrepreneurship", "State Schemes", "Central Schemes"];

export const Route = createFileRoute("/my-matches")({
  beforeLoad: requireAuth,
  head: () => ({ title: "Your Scheme Matches – Yojantra", description: "Government schemes matched to your profile" }),
  component: MyMatches,
});

function MyMatches() {
  const user = getUser();
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const inFlight = useRef(false);
  const phases = ["Understanding your profile…", "Checking scheme eligibility…", "Finding relevant government schemes…", "Preparing your matches…"];

  const load = useCallback(async (refresh = false) => {
    if (!user || inFlight.current) return;
    inFlight.current = true;
    setError("");
    setNotice("");
    try {
      let rows = await fetchRecommendations(user.id);
      const { data: savedRows } = await supabase.from("saved_schemes").select("scheme_id").eq("user_id", user.id);
      setSavedIds((savedRows || []).map((row) => String(row.scheme_id)));
      if (refresh || rows.length === 0) {
        setGenerating(true);
        setPhaseIndex(0);
        const result = await generateRecommendations();
        if (result.ai_explanation_available === false) setError("AI explanations are temporarily unavailable, but your eligible schemes are still available.");
        rows = await fetchRecommendations(user.id);
      }

      const annotated = (rows || []).map((r) => {
        try {
          const local = getScheme((r as any).scheme_id);
          const deadlineDays = local?.deadlineDays ?? null;
          const benefitStr = local?.benefit ?? "";
          const parsedBenefitAmount = (() => {
            if (!benefitStr) return null;
            const cleaned = String(benefitStr).replace(/,/g, "").trim();
            const rupeeMatch = cleaned.match(/₹\s*([0-9,.]+)\s*([kKmMlL]?)/);
            if (rupeeMatch) {
              let num = Number(rupeeMatch[1].replace(/,/g, ""));
              const suf = (rupeeMatch[2] || "").toLowerCase();
              if (suf === "l") num *= 100000;
              if (suf === "k") num *= 1000;
              if (suf === "m") num *= 1000000;
              return Math.round(num);
            }
            const alt = cleaned.match(/^([0-9.]+)\s*(lakh|l|k|m)?$/i);
            if (alt) {
              let num = Number(alt[1]);
              const suf = (alt[2] || "").toLowerCase();
              if (suf === "l" || suf === "lakh") num *= 100000;
              if (suf === "k") num *= 1000;
              if (suf === "m") num *= 1000000;
              return Math.round(num);
            }
            return null;
          })();

          // Parse bracket-prefixed field messages produced by the recommendation generator
          const fieldEvaluations: Record<string, { status: "MATCH" | "MISMATCH" | "UNKNOWN"; messages: string[] }> = {};
          const pushField = (tag: string, status: "MATCH" | "MISMATCH" | "UNKNOWN", text: string) => {
            if (!fieldEvaluations[tag]) fieldEvaluations[tag] = { status, messages: [] };
            fieldEvaluations[tag].messages.push(text);
            // Upgrade status precedence: MISMATCH > UNKNOWN > MATCH
            if (status === "MISMATCH") fieldEvaluations[tag].status = "MISMATCH";
            else if (status === "UNKNOWN" && fieldEvaluations[tag].status !== "MISMATCH") fieldEvaluations[tag].status = "UNKNOWN";
          };

          (r.why_matches || []).forEach((m: string) => {
            const mtag = (m.match(/^\[([^\]]+)\]/) || [])[1];
            if (mtag) pushField(mtag, "MATCH", m.replace(/^\[[^\]]+\]\s*/, ""));
          });
          (r.missing_requirements || []).forEach((m: string) => {
            const mtag = (m.match(/^\[([^\]]+)\]/) || [])[1] || "GENERAL";
            pushField(mtag, "UNKNOWN", m.replace(/^\[[^\]]+\]\s*/, ""));
          });
          (r.eligibility_summary || []).forEach((m: string) => {
            const mtag = (m.match(/^\[([^\]]+)\]/) || [])[1] || "GENERAL";
            pushField(mtag, "MISMATCH", m.replace(/^\[[^\]]+\]\s*/, ""));
          });

          return { ...r, deadlineDays, parsedBenefitAmount, fieldEvaluations } as unknown as RecommendationRecord & { deadlineDays?: number | null; parsedBenefitAmount?: number | null; fieldEvaluations?: any };
        } catch {
          return r;
        }
      });

      annotated.sort((a: any, b: any) => {
        const aEligible = !(a.missing_requirements && a.missing_requirements.length);
        const bEligible = !(b.missing_requirements && b.missing_requirements.length);
        if (aEligible !== bEligible) return aEligible ? -1 : 1;
        const aDeadline = typeof a.deadlineDays === "number" ? a.deadlineDays : Infinity;
        const bDeadline = typeof b.deadlineDays === "number" ? b.deadlineDays : Infinity;
        if (aDeadline !== bDeadline) return aDeadline - bDeadline;
        const aScore = typeof a.match_score === 'number' ? a.match_score : -1;
        const bScore = typeof b.match_score === 'number' ? b.match_score : -1;
        return bScore - aScore;
      });

      setRecommendations(annotated as RecommendationRecord[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to generate personalized recommendations right now. Please try again.");
    } finally {
      setLoading(false);
      setGenerating(false);
      inFlight.current = false;
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!generating) return;
    const timer = window.setInterval(() => setPhaseIndex((current) => (current + 1) % phases.length), 1600);
    return () => window.clearInterval(timer);
  }, [generating, phases.length]);
  const filtered = useMemo(() => recommendations.filter((item) => {
    const matchesSearch = `${item.scheme_name} ${item.short_description} ${item.category} ${item.ministry_or_department}`.toLowerCase().includes(search.toLowerCase());
  // Determine match status from the actual numeric score when available
  const score = typeof item.match_score === "number" ? item.match_score : null;
  const status = item.missing_requirements && item.missing_requirements.length ? "Need more information" : score === null ? "Match score unavailable" : score >= 90 ? "Eligible" : score >= 75 ? "Likely eligible" : score >= 60 ? "Possible match" : score >= 50 ? "Low confidence" : "Below threshold";
  // Do not show schemes below the 50% threshold in personalized matches
  if (typeof score === "number" && score < 50) return false;
  const matchesFilter = filter === "All" || filter === status || (filter === "Strong Matches" && score !== null && score >= 90) || (filter === "State Schemes" && item.government_level === "State") || (filter === "Central Schemes" && item.government_level === "Central") || item.category.toLowerCase().includes(filter.replace(" & ", " ").toLowerCase());
  return matchesSearch && matchesFilter;
  }), [filter, recommendations, search]);
  const toggleSave = async (id: string) => {
    if (!user) return;
    const isSaved = savedIds.includes(id);
    const result = isSaved
      ? await supabase.from("saved_schemes").delete().eq("user_id", user.id).eq("scheme_id", id)
      : await supabase.from("saved_schemes").upsert({ user_id: user.id, scheme_id: id }, { onConflict: "user_id,scheme_id" });
    if (!result.error) setSavedIds((current) => isSaved ? current.filter((item) => item !== id) : [...current, id]);
  };
  const [showMaximizer, setShowMaximizer] = useState(false);
  const phase = generating ? phases[phaseIndex] : "";

  const groups = useMemo(() => {
    const map = new Map<string, any>();
    for (const r of recommendations) {
      const cat = (r.category || "Other").toUpperCase();
      if (!map.has(cat)) map.set(cat, { items: [], total: 0, eligibleCount: 0, docs: new Set<string>() });
      const bucket = map.get(cat);
      bucket.items.push(r);
      const amt = (r as any).parsedBenefitAmount || 0;
      if (amt) bucket.total += amt;
      if (!(r.missing_requirements && r.missing_requirements.length)) bucket.eligibleCount += 1;
      (r.required_documents || []).forEach((d: string) => bucket.docs.add(d));
    }
    return Array.from(map.entries()).map(([category, v]) => ({ category, items: v.items, total: v.total, eligibleCount: v.eligibleCount, requiredDocuments: Array.from(v.docs) }));
  }, [recommendations]);

  return <main className="overflow-hidden bg-ivory text-ink"><Nav />
    <section className="edge py-16 md:py-24">
      <div className="max-w-3xl">
        <h1 className="display text-4xl">Your Scheme Matches</h1>
        <p className="mt-3 text-sm text-ink/60">Government schemes matched to your profile</p>
      </div>
    </section>
    <section className="edge py-8 md:py-16"><SectionLabel index="01" title="Personalized recommendations" />
      <div className="mt-4 flex items-center justify-between gap-4"><div className="relative w-full max-w-md"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search matches" className="w-full rounded-full border border-ink/10 py-3 px-4 text-sm" /><Search className="absolute right-3 top-3 size-4 text-ink/40" /></div><div className="flex items-center gap-2"><button onClick={() => void load(true)} className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[10px] font-semibold tracking-[.14em] uppercase"><RefreshCw className="size-4" />Refresh</button><button onClick={() => setShowMaximizer((s) => !s)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[10px] font-semibold tracking-[.14em] text-ivory uppercase">Maximize benefits</button></div></div>
      {showMaximizer && (
        <div className="mt-8 bg-white p-6">
          <h3 className="text-lg font-semibold">Benefit Maximizer</h3>
          <p className="mt-2 text-sm text-ink/60">Grouped opportunities that may be potentially useful together. This does not guarantee combinability — check the official scheme rules before applying.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {groups.length === 0 && <p className="text-sm text-ink/60">No grouped opportunities available.</p>}
            {groups.map((g) => (
              <div key={g.category} className="rounded border border-ink/12 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eyebrow text-ink/60">{g.category}</p>
                    <p className="mt-1 font-semibold">{g.items.length} potential schemes</p>
                    {g.total > 0 && <p className="mt-1 text-saffron">Estimated published total: ₹{g.total.toLocaleString('en-IN')}</p>}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-ink/60">Eligible: {g.eligibleCount}</p>
                    <p className="text-ink/60">Docs: {g.requiredDocuments.slice(0,3).join(', ')}{g.requiredDocuments.length>3?'...':''}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <p className="font-medium">Potential opportunities</p>
                  <ul className="mt-2 space-y-2">
                    {g.items.slice(0,4).map((it: any) => (
                      <li key={it.scheme_id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{it.scheme_name}</p>
                          <p className="text-xs text-ink/60">{it.short_description}</p>
                          <p className="text-xs text-ink/60 mt-1">{it.missing_requirements.length ? 'Needs more information' : 'Eligible / Likely eligible'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {it.parsedBenefitAmount ? <div className="text-sm text-saffron">₹{(it.parsedBenefitAmount).toLocaleString('en-IN')}</div> : <div className="text-xs text-ink/60">Benefit depends on assessment</div>}
                          <button onClick={() => void toggleSave(it.scheme_id)} className="text-[11px] font-semibold text-saffron">Save</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {g.items.length > 4 && <p className="mt-2 text-xs text-ink/50">Showing top 4 — open individual scheme pages for full details.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <div className="mt-12 bg-white p-8 text-sm text-red-700">{error}</div>}
      {!loading && !generating && !error && recommendations.length === 0 && <div className="mt-12 bg-white p-10 text-center"><p className="text-sm leading-relaxed text-ink/60">We couldn't confirm strong matches yet.</p><Link to="/personalize" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-[10px] font-semibold tracking-[.16em] text-ivory uppercase">Complete My Profile</Link><Link to="/schemes" className="ml-3 mt-6 inline-flex rounded-full border border-ink/20 px-5 py-3 text-[10px] font-semibold tracking-[.16em] uppercase">Explore All Current Schemes</Link></div>}
      <div className="mt-10 flex gap-2 overflow-x-auto pb-2">{FILTERS.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold tracking-[.14em] uppercase ${filter === item ? "border-saffron bg-saffron text-white" : "border-ink/15 text-ink/55"}`}>{item}</button>)}</div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item, index) => <RecommendationCard key={item.id} item={item} index={index} saved={savedIds.includes(item.scheme_id)} onSave={() => toggleSave(item.scheme_id)} />)}</div>
    </section>
    <Footer /></main>;
}

function RecommendationCard({ item, index, saved, onSave }: { item: RecommendationRecord & { deadlineDays?: number | null; parsedBenefitAmount?: number | null }; index: number; saved: boolean; onSave: () => void }) {
  const score = typeof item.match_score === 'number' ? item.match_score : null;
  const band = score === null ? "Match score unavailable" : score >= 90 ? "Strong Match" : score >= 75 ? "Likely eligible" : score >= 60 ? "Possible match" : score >= 50 ? "Low confidence" : "Below threshold";
  const best = score !== null && score >= 90;
  const parsedAmount = (item as any).parsedBenefitAmount ?? null;
  const highBenefit = parsedAmount && parsedAmount >= 100000; // conservative threshold — only when amount is published
  const deadlineDays = (item as any).deadlineDays;
  const deadlineTag = typeof deadlineDays === "number" ? (deadlineDays < 0 ? `🔴 Deadline passed` : deadlineDays === 0 ? `🔴 Deadline today` : deadlineDays <= 7 ? `🟠 Due in ${deadlineDays} days` : `🟢 Open`) : `⚪ No fixed deadline announced`;

  const [showDetails, setShowDetails] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="flex min-h-[560px] flex-col rounded-xl bg-white p-7 md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="eyebrow text-saffron">{score === null ? 'Match score unavailable' : `${Math.round(score)}% · ${band}`}</span>
            {best && <span className="ml-2 rounded-full bg-verified/10 px-2 py-1 text-[11px] font-medium text-verified">Best Match</span>}
            {highBenefit && <span className="ml-2 rounded-full border border-ink/12 px-2 py-1 text-[11px] font-medium">High benefit</span>}
            <span className="ml-2 rounded-full border border-ink/12 px-2 py-1 text-[11px] font-medium">{deadlineTag}</span>
          </div>
          <p className="eyebrow mt-4 text-ink/35">{item.category} · {item.government_level}</p>
          <h2 className="display mt-3 text-4xl leading-[.95]">{item.scheme_name}</h2>
        </div>
        <button onClick={() => void onSave()} aria-label="Save scheme" className="text-ink/35 hover:text-saffron">
          <Bookmark className={`size-5 ${saved ? "fill-saffron text-saffron" : ""}`} />
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/60">{item.short_description}</p>
      <p className="mt-5 text-sm text-ink/75"><strong>Why you match:</strong> {item.why_matches.join(" ")}</p>

      <div className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm text-ink/70">
        <p><strong>Benefits:</strong> {item.benefits.join("; ")}</p>
        <p><strong>Eligibility:</strong> {item.eligibility_summary.join("; ")}</p>
        <p><strong>Documents:</strong> {item.required_documents.join(", ")}</p>
        {item.missing_requirements.length > 0 && <p className="text-saffron"><strong>Missing information:</strong> {item.missing_requirements.join("; ")}</p>}
        {parsedAmount && (
          <p><strong>Estimated published benefit:</strong> ₹{parsedAmount.toLocaleString("en-IN")} {item.match_score ? null : null}</p>
        )}
        <button onClick={() => setShowDetails((s) => !s)} className="mt-2 text-[11px] font-semibold text-ink/60">{showDetails ? 'Hide eligibility details' : 'Show eligibility details'}</button>
        {showDetails && (
          <div className="mt-3 rounded bg-ivory p-3 text-sm text-ink/70">
            {item.fieldEvaluations && Object.keys(item.fieldEvaluations).length > 0 && (
              <div className="mb-3">
                <div className="mb-2"><strong>Eligibility by field</strong></div>
                <ul className="mb-3 space-y-2">
                  {Object.entries(item.fieldEvaluations).map(([field, info]: any) => (
                    <li key={field} className="flex items-start gap-3">
                      {info.status === 'MATCH' ? <Check className="size-4 text-verified mt-1" /> : info.status === 'MISMATCH' ? <X className="size-4 text-ink/50 mt-1" /> : <AlertTriangle className="size-4 text-saffron mt-1" />}
                      <div>
                        <div className="font-medium">{field}</div>
                        <div className="text-xs text-ink/60">{info.messages.join(' ')}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-2"><strong>Matched reasons</strong></div>
            <ul className="mb-3 space-y-1">
              {(item.why_matches || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2"><Check className="size-4 text-verified mt-1" /> <span>{r}</span></li>
              ))}
            </ul>
            <div className="mb-2"><strong>Missing / additional information needed</strong></div>
            <ul className="mb-3 space-y-1 text-saffron">
              {(item.missing_requirements || []).map((m, i) => (
                <li key={i} className="flex items-start gap-2"><AlertTriangle className="size-4 text-saffron mt-1" /> <span>{m}</span></li>
              ))}
            </ul>
            <div className="mb-2"><strong>Potential blockers</strong></div>
            <ul className="space-y-1 text-ink/60">
              {(item.eligibility_summary || []).map((b, i) => (
                <li key={i} className="flex items-start gap-2"><X className="size-4 text-ink/50 mt-1" /> <span>{b}</span></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
        <a href={item.official_application_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-[10px] font-semibold tracking-[.14em] text-ivory uppercase">Apply Officially <ArrowRight className="size-3" /></a>
        <a href={item.official_source_url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold tracking-[.14em] uppercase hover:text-saffron">View Full Details</a>
      </div>

      <p className="mt-5 text-[10px] text-ink/40">{item.status} · Verified {new Date(item.last_verified_at).toLocaleDateString()}</p>
    </motion.article>
  );
}