import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, FileCheck2, FileText, LogOut, MapPin, Pencil, Sparkles, UserRound } from "lucide-react";
import { Nav } from "@/components/Nav";
import { getUser, profileCompletion, signOut } from "@/lib/auth";
import { requireAuth } from "@/components/AuthGuard";
import { listDocuments } from "@/lib/documents";
import { fetchUserProfile, fetchActiveSchemes, fetchRecommendations } from "@/lib/schemeCatalog";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  component: Dashboard,
});

function Dashboard() {
  const user = getUser()!;
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<{ status: string }[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown>>({ ...user });
  const [schemesCount, setSchemesCount] = useState<number | null>(null);
  const [recommendationsCount, setRecommendationsCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    void listDocuments(user.id).then(setDocuments);
    void fetchUserProfile(user.id).then(setProfile).catch(() => setProfile({ ...user }));

    // Fetch active schemes count (real data) — show nothing if unavailable
    void fetchActiveSchemes()
      .then((s) => setSchemesCount(Array.isArray(s) ? s.length : null))
      .catch(() => setSchemesCount(null));

    // Fetch recommendation count for this user — if available
    void fetchRecommendations(user.id)
      .then((recs) => setRecommendationsCount(Array.isArray(recs) ? recs.length : 0))
      .catch(() => setRecommendationsCount(null));

    // Read saved schemes from localStorage (client-side persisted bookmarks)
    try {
      const savedIds = JSON.parse(localStorage.getItem("savedSchemeIds") || "[]");
      setSavedCount(Array.isArray(savedIds) ? savedIds.length : 0);
    } catch {
      setSavedCount(null);
    }
  }, [user.id]);

  const logout = () => {
    signOut();
    void navigate({ to: "/login", search: { redirect: "/dashboard" } });
  };
  const completion = profileCompletion(profile);

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <Nav />
      <section className="edge py-28 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow text-saffron">PERSONAL DASHBOARD</p>
            <h1 className="display mt-3 text-5xl md:text-7xl">
              Welcome back, {String(profile.full_name || user.full_name).split(" ")[0]} 👋
            </h1>
            <p className="mt-3 text-ink/55">Your path to the benefits you deserve starts here.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Sparkles />} value={schemesCount === null ? "—" : String(schemesCount)} label="current schemes in catalogue" />
          <Stat
            icon={<FileCheck2 />}
            value={String(documents.filter((doc) => doc.status === "Analyzed").length)}
            label="documents analyzed"
          />
          <Stat
            icon={<Bell />}
            value={String(documents.filter((doc) => doc.status !== "Analyzed").length)}
            label="documents needing analysis"
          />
          <Stat icon={<FileText />} value={savedCount === null ? "—" : String(savedCount)} label="saved schemes" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl bg-ink p-7 text-ivory">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-saffron">PROFILE</p>
                <h2 className="mt-3 text-2xl">Make your matches sharper</h2>
              </div>
              <Link to="/personalize?from=dashboard" className="rounded-full bg-saffron p-3">
                <Pencil size={16} />
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-full bg-saffron text-xl font-semibold">
                {String(profile.full_name || user.full_name).slice(0, 1)}
              </div>
              <div>
                <p className="font-medium">{String(profile.full_name || user.full_name)}</p>
                <p className="text-sm text-ivory/55">{user.email}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-ivory/65">
              <span>
                <MapPin className="mr-1 inline size-4 text-saffron" />
                {[profile.state, profile.district].filter(Boolean).join(", ") || "Not provided"}
              </span>
              <span>
                <UserRound className="mr-1 inline size-4 text-saffron" />
                {profile.occupation || "Not provided"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <Action
              href="/documents"
              icon={<FileText />}
              title="AI document centre"
              copy="Upload and analyze your certificates"
            />
            <Action
              href="/my-matches"
              icon={<Sparkles />}
              title="Your recommendations"
              copy={
                recommendationsCount === null
                  ? "Recommendations: Not available"
                  : recommendationsCount === 0
                  ? "No matches yet"
                  : `${recommendationsCount} scheme${recommendationsCount === 1 ? "" : "s"} matched to your profile`
              }
            />
            <Action
              href="/saved"
              icon={<Bell />}
              title="Saved schemes"
              copy="Keep track of benefits you care about"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/45 p-5">
      <div className="text-saffron">{icon}</div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-ink/55">{label}</p>
    </div>
  );
}

function Action({ href, icon, title, copy }: { href: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 rounded-xl border border-ink/10 bg-white/45 p-5 transition hover:-translate-y-0.5 hover:border-saffron"
    >
      <span className="text-saffron">{icon}</span>
      <span>
        <b className="block">{title}</b>
        <small className="text-ink/55">{copy}</small>
      </span>
    </Link>
  );
}
