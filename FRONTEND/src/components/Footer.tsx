import { LineReveal, Reveal } from "@/components/motion-primitives";
import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { useLang } from "@/store/useLang";

const COLS = [
  { title: "Product", links: [{ label: "Discover Schemes", to: "/schemes" }, { label: "Eligibility Check", to: "/personalize" }, { label: "AI Assistant", to: "/assistant" }, { label: "Saved Schemes", to: "/saved" }] },
  { title: "Company", links: [{ label: "About", to: "/about" }, { label: "Privacy", to: "/about" }, { label: "Terms", to: "/about" }, { label: "Accessibility", to: "/about" }] },
];

export function Footer() {
  const { t } = useT();
  const setLang = useLang((s) => s.setLang);
  return (
    <footer className="bg-ink pt-24 pb-32 text-ivory md:pb-16">
      <div className="edge">
        <LineReveal
          className="display text-[19vw] leading-[0.82] md:text-[11vw]"
          lines={[t("Know"), t("what's"), t("meant"), <span key="f" className="text-saffron">{t("for you.")}</span>]}
        />

        <div className="mt-24 grid gap-12 border-t border-ivory/15 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="display text-2xl">
              YOJANTRA<span className="text-saffron">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/55">
              {t("AI-powered government scheme discovery for India. Yojana + intelligent technology.")}
            </p>
            <p className="mt-6 text-[11px] leading-relaxed text-ivory/35">
              {t("Independent platform. Not affiliated with any government department. All scheme data shown here is demonstration data.")}
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.title} className="md:col-span-3">
              <p className="eyebrow text-ivory/35">{t(c.title)}</p>
              <ul className="mt-5 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-ivory/70 transition-colors hover:text-saffron">{t(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <p className="eyebrow text-ivory/35">{t("Language")}</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
              <li>
                <button onClick={() => setLang("en")} className="transition-colors hover:text-saffron">
                  English
                </button>
              </li>
              <li>
                <button onClick={() => setLang("hi")} className="transition-colors hover:text-saffron">
                  हिन्दी
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Reveal className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-6">
          <p className="eyebrow text-ivory/40">{t("Built for Bharat 🇮🇳")}</p>
          <p className="eyebrow text-ivory/30">© {new Date().getFullYear()} Yojantra</p>
        </Reveal>
      </div>
    </footer>
  );
}
