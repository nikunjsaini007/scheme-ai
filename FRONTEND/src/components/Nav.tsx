import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Mic, X, UserRound, Bell, Check, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabase";
import { useT } from "@/lib/i18n";
import { useLang } from "@/store/useLang";
import govtOfIndia from "@/assets/govt-of-india.png";
import { getUser, signOut } from "@/lib/auth";

const LINKS = [
  { label: "HOME", to: "/" },
  { label: "SCHEMES", to: "/schemes" },
  { label: "PERSONALIZE", to: "/personalize" },
  { label: "SAVED", to: "/saved" },
  { label: "ABOUT", to: "/about" },
];

export function Nav({ dark: darkProp = false }: { dark?: boolean }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const lang = useLang((s) => s.lang);
  const toggle = useLang((s) => s.toggle);
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const dark = darkProp;
  // Defer reading auth state until the client to avoid SSR/client hydration mismatch
  const [clientUser, setClientUser] = useState<any | null>(null);
  const fixed = solid || location.pathname === "/personalize";
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // populate client-side user after hydration
    try {
      setClientUser(getUser());
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadNotifications = async () => {
      const user = getUser();
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("inbox_entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) {
          // treat missing table or other errors as empty inbox
          console.error("Inbox fetch failed:", error);
          if (!mounted) return;
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        if (!mounted) return;
        setNotifications((data as any) || []);
        setUnreadCount(
          ((data as any) || []).filter((n: any) => !n.is_read && n.is_read !== true).length,
        );
      } catch (e) {
        console.error("Inbox fetch failed:", e);
        if (!mounted) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    loadNotifications();
    const sub = setInterval(loadNotifications, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(sub);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("inbox_entries").update({ is_read: true }).eq("id", id);
      setNotifications((cur) => cur.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };
  const markAllRead = async () => {
    const user = getUser();
    if (!user) return;
    try {
      await supabase
        .from("inbox_entries")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setNotifications((cur) => cur.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          fixed
            ? dark
              ? "bg-ink/90 text-ivory shadow-[0_1px_30px_rgba(0,0,0,0.18)] backdrop-blur-md"
              : "bg-ivory/90 shadow-[0_1px_30px_rgba(17,17,17,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="edge flex h-16 items-center justify-between gap-6 md:h-20">
          <Link to="/" className={cn("flex items-center gap-3", dark && "text-ivory")}>
            <span className="display text-xl tracking-[-0.02em] md:text-2xl">
              YOJANTRA<span className="text-saffron">.</span>
            </span>
            <span className="hidden h-9 w-px bg-ink/15 sm:block" aria-hidden="true" />
            <img
              src={govtOfIndia}
              alt="Government of India"
              className={cn(
                "hidden h-9 w-10 object-contain mix-blend-multiply sm:block",
                dark && "rounded bg-white mix-blend-normal",
              )}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={cn(
                  "eyebrow transition-colors hover:text-saffron",
                  dark ? "text-ivory/65" : "text-ink/60",
                )}
              >
                {t(l.label)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              onClick={toggle}
              className={cn(
                "eyebrow cursor-pointer transition-colors",
                dark ? "text-ivory/65 hover:text-ivory" : "text-ink/60 hover:text-ink",
              )}
              aria-label="Switch language"
            >
              <span className={lang === "en" ? "text-saffron" : ""}>EN</span> /{" "}
              <span className={lang === "hi" ? "text-saffron" : ""}>हि</span>
            </button>
            <Link
              to="/assistant"
              className={cn(
                "eyebrow flex items-center gap-2",
                dark ? "text-ivory/65 hover:text-ivory" : "text-ink/60 hover:text-ink",
              )}
            >
              <Mic className="size-3.5" strokeWidth={2.2} /> {t("AI ASSISTANT")}
            </Link>
            <Link
              to="/personalize"
              className={cn(
                "rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-saffron",
                dark ? "bg-saffron text-white hover:bg-ivory hover:text-ink" : "bg-ink text-ivory",
              )}
            >
              {t("Check eligibility")}
            </Link>
            {clientUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen((s) => !s)}
                    className="text-ink/60 hover:text-saffron"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-2 -top-1 inline-flex items-center justify-center rounded-full bg-saffron px-1 text-[11px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-[320px] rounded-lg bg-white p-4 shadow-lg z-50 text-ink">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Notifications</p>
                        <button onClick={() => void markAllRead()} className="text-sm text-ink/50">
                          Mark all read
                        </button>
                      </div>
                      <div className="mt-2 max-h-64 overflow-auto">
                        {notifications.length === 0 && (
                          <p className="text-sm text-ink/60">No notifications</p>
                        )}
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`mt-2 flex items-start gap-3 rounded p-2 ${n.is_read ? "bg-ivory" : "bg-ivory-deep/5"}`}
                          >
                            <div className="mt-1">
                              {n.is_read ? (
                                <Check className="size-4 text-verified" />
                              ) : (
                                <XCircle className="size-4 text-saffron" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-xs text-ink/60">{n.body}</p>
                              <div className="mt-1 flex gap-2 text-xs">
                                <button
                                  onClick={() => void markAsRead(n.id)}
                                  className="text-ink/50"
                                >
                                  Mark read
                                </button>
                                {n.data?.scheme_id && (
                                  <a href={`/scheme/${n.data.scheme_id}`} className="text-saffron">
                                    View
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className={cn(
                    "eyebrow flex items-center gap-2",
                    dark ? "text-ivory/75" : "text-ink/70",
                  )}
                >
                  <UserRound className="size-4 text-saffron" /> {clientUser.full_name.split(" ")[0]}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    window.location.reload();
                  }}
                  className={cn("eyebrow", dark ? "text-ivory/65" : "text-ink/60")}
                >
                  LOG OUT
                </button>
              </>
            ) : (
              <Link
                to="/login"
                search={{ redirect: "/dashboard" }}
                className="eyebrow text-saffron"
              >
                LOGIN / CREATE ACCOUNT
              </Link>
            )}
          </div>

          <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="size-6" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 92% 5%)" }}
            animate={{ clipPath: "circle(140% at 92% 5%)" }}
            exit={{ clipPath: "circle(0% at 92% 5%)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-ink text-ivory lg:hidden"
          >
            <div className="edge flex h-16 items-center justify-between">
              <span className="display text-xl">
                YOJANTRA<span className="text-saffron">.</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-6" strokeWidth={1.6} />
              </button>
            </div>
            <div className="edge mt-10 flex flex-col gap-2">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.label}
                  onClick={() => {
                    setOpen(false);
                    void navigate({ to: l.to });
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="display text-[15vw] leading-[0.95] text-ivory"
                >
                  {t(l.label)}
                </motion.div>
              ))}
            </div>
            <div className="edge absolute bottom-10 left-0 right-0 flex flex-col gap-4">
              <Link
                to="/personalize"
                onClick={() => setOpen(false)}
                className="rounded-full bg-saffron px-6 py-4 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
              >
                {t("Check eligibility")} →
              </Link>
              <div className="eyebrow flex justify-between text-ivory/50">
                <button onClick={toggle}>English / हिन्दी</button>
                <Link to="/assistant" onClick={() => setOpen(false)}>
                  {t("AI Assistant")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileStickyCta() {
  const { t } = useT();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <Link
          to="/personalize"
          className="flex-1 rounded-full bg-saffron py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
        >
          {t("Check what I qualify for")} →
        </Link>
        <Link
          to="/assistant"
          aria-label="Ask Yojantra"
          className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/20"
        >
          <Mic className="size-4.5" strokeWidth={1.8} />
        </Link>
      </div>
    </div>
  );
}
