import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bookmark, RefreshCw, Search } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { getUser } from "@/lib/auth";
import { fetchRecommendations, generateRecommendations, type RecommendationRecord } from "@/lib/schemeCatalog";
import { requireAuth } from "@/components/AuthGuard";
import { supabase } from "@/supabase";

const FILTERS = ["All", "Eligible", "Likely eligible", "Partially matched", "Need more information", "Education", "Employment", "Financial", "Healthcare", "Housing", "Agriculture", "Women & Child", "Entrepreneurship", "State Schemes", "Central Schemes"];

export const Route = createFileRoute("/recommendations")({
  beforeLoad: requireAuth,
  head: () => ({ title: "Your Personalized Schemes – Yojantra", description: "AI-matched government schemes based on the information you provided." }),
  component: Recommendations,
});

function Recommendations() {
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
      setRecommendations(rows);
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
    const status = item.missing_requirements.length ? "Need more information" : item.match_band === "strong" ? "Eligible" : item.match_band === "good" ? "Likely eligible" : "Partially matched";
    const matchesFilter = filter === "All" || filter === status || (filter === "Strong Matches" && item.match_band === "strong") || (filter === "State Schemes" && item.government_level === "State") || (filter === "Central Schemes" && item.government_level === "Central") || item.category.toLowerCase().includes(filter.replace(" & ", " ").toLowerCase());
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
  const phase = generating ? phases[phaseIndex] : "";

  return <main className="overflow-hidden bg-ivory text-ink"><Nav /><section className="edge py-28 md:py-40"><SectionLabel index="01" title="Personalized recommendations" /><div className="grid gap-12 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-8"><Reveal><p className="eyebrow text-saffron">AI-assisted recommendations</p><h1 className="display mt-6 text-[15vw] leading-[.9] md:text-[8vw]">Your Personalized Schemes 🎯</h1><p className="mt-7 max-w-lg text-sm leading-relaxed text-ink/60">AI-matched government schemes based on the information you provided. This is guidance, not a guarantee of eligibility; check final requirements on the official portal.</p></Reveal></div><button onClick={() => void load(true)} disabled={loading || generating} className="inline-flex items-center gap-2 border-b border-ink pb-1 text-[10px] font-semibold tracking-[.16em] uppercase hover:border-saffron hover:text-saffron disabled:opacity-40 lg:col-span-3 lg:col-start-10"><RefreshCw className={`size-3 ${generating ? "animate-spin" : ""}`} /> Refresh Recommendations</button></div></section><section className="bg-ivory-deep py-16 md:py-24"><div className="edge"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="display text-5xl text-saffron">{filtered.length}</p><p className="eyebrow mt-2 text-ink/45">verified profile matches</p></div><label className="flex w-full items-center gap-3 rounded-full border border-ink/15 bg-ivory px-5 py-3 md:max-w-sm"><Search className="size-4 text-ink/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recommendations…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35" /></label></div>{generating && <div className="mt-12 bg-ink p-10 text-ivory"><p className="eyebrow text-saffron">SchemeAI AI</p><p className="display mt-4 text-3xl">{phase}</p><div className="mt-6 h-1 overflow-hidden bg-ivory/15"><motion.div className="h-full w-1/3 bg-saffron" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.8 }} /></div></div>}{error && <div className="mt-12 bg-white p-8 text-sm text-red-700">{error}</div>}{!loading && !generating && !error && recommendations.length === 0 && <div className="mt-12 bg-white p-10 text-center"><p className="text-sm leading-relaxed text-ink/60">We couldn&apos;t find strong matches based on your current information.</p><Link to="/personalize" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-[10px] font-semibold tracking-[.16em] text-ivory uppercase">Update My Profile</Link><Link to="/schemes" className="ml-3 mt-6 inline-flex rounded-full border border-ink/20 px-5 py-3 text-[10px] font-semibold tracking-[.16em] uppercase">Explore All Current Schemes</Link></div>}<div className="mt-10 flex gap-2 overflow-x-auto pb-2">{FILTERS.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold tracking-[.14em] uppercase ${filter === item ? "border-saffron bg-saffron text-white" : "border-ink/15 text-ink/55"}`}>{item}</button>)}</div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item, index) => <RecommendationCard key={item.id} item={item} index={index} saved={savedIds.includes(item.scheme_id)} onSave={() => toggleSave(item.scheme_id)} />)}</div></div></section><Footer /></main>;
}

function RecommendationCard({ item, index, saved, onSave }: { item: RecommendationRecord; index: number; saved: boolean; onSave: () => void }) {
  const band = item.match_band === "strong" ? "🟢 Strong Match" : item.match_band === "good" ? "🔵 Good Match" : "🟡 Possible Match";
  return <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }} className="flex min-h-[560px] flex-col rounded-xl bg-white p-7 md:p-8"><div className="flex items-center justify-between"><span className="eyebrow text-saffron">{item.match_score}% · {band}</span><button onClick={() => void onSave()} aria-label="Save scheme" className="text-ink/35 hover:text-saffron"><Bookmark className={`size-5 ${saved ? "fill-saffron text-saffron" : ""}`} /></button></div><p className="eyebrow mt-8 text-ink/35">{item.category} · {item.government_level}</p><h2 className="display mt-3 text-4xl leading-[.95]">{item.scheme_name}</h2><p className="mt-4 text-sm leading-relaxed text-ink/60">{item.short_description}</p><p className="mt-5 text-sm text-ink/75"><strong>Why you match:</strong> {item.why_matches.join(" ")}</p><div className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm text-ink/70"><p><strong>Benefits:</strong> {item.benefits.join("; ")}</p><p><strong>Eligibility:</strong> {item.eligibility_summary.join("; ")}</p><p><strong>Documents:</strong> {item.required_documents.join(", ")}</p>{item.missing_requirements.length > 0 && <p className="text-saffron"><strong>Missing information:</strong> {item.missing_requirements.join("; ")}</p>}</div><div className="mt-auto flex flex-wrap items-center gap-4 pt-7"><a href={item.official_application_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-[10px] font-semibold tracking-[.14em] text-ivory uppercase">Apply Officially <ArrowRight className="size-3" /></a><a href={item.official_source_url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold tracking-[.14em] uppercase hover:text-saffron">View Full Details</a></div><p className="mt-5 text-[10px] text-ink/40">{item.status} · Verified {new Date(item.last_verified_at).toLocaleDateString()}</p></motion.article>;
}
