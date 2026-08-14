import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { hydrateUser, resetPassword, signIn, signUp } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : "/dashboard",
  }),
  component: Login,
});
function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const redirect = search["redirect"];
  const [signup, setSignup] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    void hydrateUser().then((user) => {
      if (user) void navigate({ to: redirect });
    });
  }, [navigate, redirect]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (signup && !name.trim()) return setError("Please enter your name.");
    setLoading(true);
    try {
      if (signup) {
        await signUp(name, email, password);
        setError("Account created. Check your email if confirmation is enabled, then log in.");
        setSignup(false);
      } else {
        await signIn(email, password);
        void navigate({ to: redirect });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete authentication.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-ink p-12 text-ivory lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="display text-2xl">
            YOJANTRA<span className="text-saffron">.</span>
          </Link>
          <div>
            <p className="eyebrow text-saffron">AI-POWERED DISCOVERY</p>
            <h1 className="display mt-5 max-w-lg text-7xl">Benefits meant for you.</h1>
            <p className="mt-6 max-w-md text-ivory/60">
              Keep your profile, documents and scheme matches in one secure place.
            </p>
          </div>
          <p className="text-sm text-ivory/40">Built for every Indian household.</p>
        </section>
        <section className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="display text-2xl lg:hidden">
              YOJANTRA<span className="text-saffron">.</span>
            </Link>
            <div className="mt-12">
              <p className="eyebrow text-saffron">YOUR YOJANTRA ACCOUNT</p>
              <h2 className="display mt-3 text-5xl">
                {signup ? "Create account" : "Welcome back"}
              </h2>
              <p className="mt-3 text-sm text-ink/55">
                {signup
                  ? "Start discovering benefits made for you."
                  : "Pick up where you left off."}
              </p>
              <form onSubmit={submit} className="mt-8 space-y-4">
                {signup && (
                  <label className="block text-sm">
                    Full name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-saffron"
                      placeholder="Your Name"
                    />
                  </label>
                )}
                <label className="block text-sm">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 outline-none focus:border-saffron"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block text-sm">
                  Password
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-ink/15 bg-transparent px-4 py-3 pr-12 outline-none focus:border-saffron"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-5 text-ink/45"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                {!signup && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email.includes("@")) return setError("Enter your email first.");
                        try {
                          await resetPassword(email);
                          setError("Password reset email sent.");
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "Unable to send reset email.",
                          );
                        }
                      }}
                      className="text-xs text-saffron"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <button
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-saffron py-3.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "Please wait…" : signup ? "Create my account" : "Login to Yojantra"}{" "}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-ink/55">
                {signup ? "Already have an account?" : "New to Yojantra?"}{" "}
                <button
                  onClick={() => {
                    setSignup(!signup);
                    setError("");
                  }}
                  className="font-semibold text-saffron"
                >
                  {signup ? "Log in" : "Create an account"}
                </button>
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs text-ink/45">
                <ShieldCheck size={15} className="text-verified" /> Your information stays private
                and secure.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
