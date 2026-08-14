import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Mic, X, UserRound } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
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
  const user = getUser();
  const fixed = solid || location.pathname === "/personalize";
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
            <span className="display text-xl tracking-[-0.02em] md:text-2xl">YOJANTRA<span className="text-saffron">.</span></span>
            <span className="hidden h-9 w-px bg-ink/15 sm:block" aria-hidden="true" />
            <img
              src={govtOfIndia}
              alt="Government of India"
              className={cn("hidden h-9 w-10 object-contain mix-blend-multiply sm:block", dark && "rounded bg-white mix-blend-normal")}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={cn("eyebrow transition-colors hover:text-saffron", dark ? "text-ivory/65" : "text-ink/60")}
              >
                {t(l.label)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              onClick={toggle}
              className={cn("eyebrow cursor-pointer transition-colors", dark ? "text-ivory/65 hover:text-ivory" : "text-ink/60 hover:text-ink")}
              aria-label="Switch language"
            >
              <span className={lang === "en" ? "text-saffron" : ""}>EN</span>{" "}
              / <span className={lang === "hi" ? "text-saffron" : ""}>हि</span>
            </button>
            <Link to="/assistant" className={cn("eyebrow flex items-center gap-2", dark ? "text-ivory/65 hover:text-ivory" : "text-ink/60 hover:text-ink")}>
              <Mic className="size-3.5" strokeWidth={2.2} /> {t("AI ASSISTANT")}
            </Link>
            <Link
              to="/personalize"
              className={cn("rounded-full px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors hover:bg-saffron", dark ? "bg-saffron text-white hover:bg-ivory hover:text-ink" : "bg-ink text-ivory")}
            >
              {t("Check eligibility")}
            </Link>
            {user ? <><Link to="/dashboard" className={cn("eyebrow flex items-center gap-2", dark ? "text-ivory/75" : "text-ink/70")}><UserRound className="size-4 text-saffron" /> {user.full_name.split(" ")[0]}</Link><button onClick={() => { signOut(); window.location.reload(); }} className={cn("eyebrow", dark ? "text-ivory/65" : "text-ink/60")}>LOG OUT</button></> : <Link to="/login" search={{ redirect: "/dashboard" }} className="eyebrow text-saffron">LOGIN / CREATE ACCOUNT</Link>}
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
                  onClick={() => { setOpen(false); void navigate({ to: l.to }); }}
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
