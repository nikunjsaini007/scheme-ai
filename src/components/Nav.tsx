import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Mic, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "DISCOVER", href: "#discover" },
  { label: "SCHEMES", href: "#schemes" },
  { label: "BENEFITS", href: "#benefits" },
  { label: "STORIES", href: "#stories" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "हि">("EN");
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "bg-ivory/90 shadow-[0_1px_30px_rgba(17,17,17,0.08)] backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="edge flex h-16 items-center justify-between gap-6 md:h-20">
          <Link to="/" className="display text-xl tracking-[-0.02em] md:text-2xl">
            YOJANTRA<span className="text-saffron">.</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="eyebrow text-ink/60 transition-colors hover:text-saffron"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex xl:gap-7">
            <button
              onClick={() => setLang(lang === "EN" ? "हि" : "EN")}
              className="eyebrow text-ink/60 transition-colors hover:text-ink"
            >
              {lang === "EN" ? "EN / हि" : "हि / EN"}
            </button>
            <a href="#assistant" className="eyebrow flex items-center gap-2 text-ink/60 hover:text-ink">
              <Mic className="size-3.5" strokeWidth={2.2} /> AI ASSISTANT
            </a>
            <a
              href="#eligibility"
              className="rounded-full bg-ink px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-saffron"
            >
              Check eligibility
            </a>
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
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="display text-[15vw] leading-[0.95] text-ivory"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
            <div className="edge absolute bottom-10 left-0 right-0 flex flex-col gap-4">
              <a
                href="#eligibility"
                onClick={() => setOpen(false)}
                className="rounded-full bg-saffron px-6 py-4 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
              >
                Check eligibility →
              </a>
              <div className="eyebrow flex justify-between text-ivory/50">
                <span>English / हिन्दी</span>
                <a href="#assistant" onClick={() => setOpen(false)}>
                  AI Assistant
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <a
          href="#eligibility"
          className="flex-1 rounded-full bg-saffron py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-white uppercase"
        >
          Check what I qualify for →
        </a>
        <a
          href="#assistant"
          aria-label="Ask Yojantra"
          className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/20"
        >
          <Mic className="size-4.5" strokeWidth={1.8} />
        </a>
      </div>
    </div>
  );
}