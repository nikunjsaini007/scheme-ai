import { LineReveal, Reveal } from "@/components/motion-primitives";

const COLS = [
  { title: "Product", links: ["Discover Schemes", "Eligibility Check", "AI Assistant", "Benefits"] },
  { title: "Company", links: ["About", "Privacy", "Terms", "Accessibility"] },
];

export function Footer() {
  return (
    <footer className="bg-ink pt-24 pb-32 text-ivory md:pb-16">
      <div className="edge">
        <LineReveal
          className="display text-[19vw] leading-[0.82] md:text-[11vw]"
          lines={["Know", "what's", "meant", <span key="f" className="text-saffron">for you.</span>]}
        />

        <div className="mt-24 grid gap-12 border-t border-ivory/15 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display text-2xl">
              YOJANTRA<span className="text-saffron">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/55">
              AI-powered government scheme discovery for India. Yojana + intelligent technology.
            </p>
            <p className="mt-6 text-[11px] leading-relaxed text-ivory/35">
              Independent platform. Not affiliated with any government department. All scheme data shown here is
              demonstration data.
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.title} className="md:col-span-3">
              <p className="eyebrow text-ivory/35">{c.title}</p>
              <ul className="mt-5 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#discover" className="text-sm text-ivory/70 transition-colors hover:text-saffron">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <p className="eyebrow text-ivory/35">Language</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
              <li>English</li>
              <li>हिन्दी</li>
            </ul>
          </div>
        </div>

        <Reveal className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-6">
          <p className="eyebrow text-ivory/40">Built for Bharat 🇮🇳</p>
          <p className="eyebrow text-ivory/30">© {new Date().getFullYear()} Yojantra</p>
        </Reveal>
      </div>
    </footer>
  );
}