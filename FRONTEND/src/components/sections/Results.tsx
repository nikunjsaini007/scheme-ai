import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { demoPersona, schemes } from "@/data/schemes";
import { useProfile } from "@/store/useProfile";
import { useT } from "@/lib/i18n";
import farmer from "@/assets/for-schemes/farmer.jpg";
import family from "@/assets/for-schemes/family-home.jpg";

const EASE = [0.16, 1, 0.3, 1] as const;

function MatchBadge({ value, tone = "dark" }: { value: number; tone?: "dark" | "light" }) {
  const { t } = useT();
  return (
    <span
      className={`text-[11px] font-semibold tracking-[0.16em] uppercase ${tone === "dark" ? "text-saffron" : "text-saffron"}`}
    >
      {value}% {t("match")}
    </span>
  );
}

export function Results() {
  const demo = useProfile((s) => s.demo);
  const { t, lang } = useT();
  const feature = schemes[0]!;
  const wide = schemes[1]!;
  const rest = schemes.slice(2);
  const hero3 = rest[0]!;
  const firstName = demoPersona.name.split(" ")[0];

  return (
    <section id="results" className="edge py-28 md:py-40">
      <SectionLabel index="03" title={t("Your results")} />

      {demo && (
        <Reveal className="mb-12">
          <div className="border border-ink/15 bg-ivory-deep p-6 md:p-9">
            <p className="eyebrow text-saffron">{t("Demo profile")}</p>
            <p className="display mt-3 text-3xl leading-[0.9] md:text-5xl">
              {t("We found 17 schemes")}
              <br />
              {lang === "hi" ? `${firstName} के लिए।` : `for ${firstName}.`}
            </p>
            <dl className="mt-7 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(demoPersona).map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-ink/40">{t(k)}</dt>
                  <dd className="mt-1">{t(String(v))}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      )}

      <LineReveal
        className="display text-[15vw] leading-[0.85] md:text-[8vw]"
        lines={[t("These"), t("are for you.")]}
      />
      <Reveal delay={0.2}>
        <p className="mt-7 max-w-md text-sm leading-relaxed text-ink/55">
          {t(
            "Mock results, ranked by how closely a scheme's stated criteria line up with the profile above.",
          )}
        </p>
      </Reveal>

      <div id="schemes" className="mt-16 grid gap-6 lg:grid-cols-12">
        {/* Feature card — dark, oversized number */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="group relative overflow-hidden bg-ink p-8 text-ivory md:p-12 lg:col-span-7"
        >
          <div className="flex items-center justify-between">
            <MatchBadge value={feature.match} />
            {feature.deadlineDays && (
              <span className="eyebrow text-ivory/45">
                {t("Deadline")} · {feature.deadlineDays} {t("days")}
              </span>
            )}
          </div>
          <p className="display mt-10 text-[22vw] leading-[0.8] text-saffron md:text-[9vw]">
            {feature.benefit}
          </p>
          <p className="eyebrow mt-4 text-ivory/45">
            {t(feature.benefitNote.replace("Maximum", "Potential"))}
          </p>
          <h3 className="display mt-10 text-4xl md:text-6xl">{t(feature.name)}</h3>
          <p className="mt-4 max-w-sm text-sm text-ivory/65">{t(feature.summary)}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ivory/15 pt-6">
            <span className="eyebrow text-ivory/45">{t(feature.category)}</span>
            <span className="eyebrow text-ivory/45">{t(feature.level)}</span>
            <Link
              to="/scheme/$id"
              params={{ id: feature.id }}
              className="eyebrow ml-auto border-b border-saffron pb-1 text-saffron"
            >
              {t("Explore scheme →")}
            </Link>
          </div>
        </motion.div>

        {/* Image + text card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="lg:col-span-5"
        >
          <Link to="/scheme/$id" params={{ id: wide.id }} className="group block h-full bg-white">
            <div className="grain relative h-56 overflow-hidden md:h-72">
              <img
                src={farmer}
                width={1408}
                height={1008}
                loading="lazy"
                alt="An Indian farmer in a wheat field"
                className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
            </div>
            <div className="p-7 md:p-9">
              <MatchBadge value={wide.match} />
              <h3 className="display mt-4 text-4xl">{t(wide.name)}</h3>
              <p className="display mt-6 text-6xl text-saffron">{wide.benefit}</p>
              <p className="eyebrow mt-2 text-ink/45">{t(wide.benefitNote)}</p>
              <p className="mt-6 border-t border-ink/10 pt-5 text-[11px] tracking-[0.14em] text-ink/45 uppercase">
                {t(wide.category)} · {t(wide.level)}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Wide horizontal card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="lg:col-span-12"
        >
          <Link
            to="/scheme/$id"
            params={{ id: hero3.id }}
            className="group grid overflow-hidden bg-white md:grid-cols-12"
          >
            <div className="grain relative h-48 overflow-hidden md:col-span-5 md:h-auto">
              <img
                src={family}
                width={1408}
                height={1008}
                loading="lazy"
                alt="An Indian family outside their newly built home"
                className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-between p-7 md:col-span-7 md:p-12">
              <div>
                <MatchBadge value={hero3.match} />
                <h3 className="display mt-4 text-5xl md:text-7xl">{t(hero3.name)}</h3>
                <p className="mt-5 max-w-md text-sm text-ink/60">{t(hero3.summary)}</p>
              </div>
              <div className="mt-10 flex flex-wrap items-baseline gap-8">
                <div>
                  <p className="display text-5xl text-saffron">{hero3.benefit}</p>
                  <p className="eyebrow mt-2 text-ink/45">{t(hero3.benefitNote)}</p>
                </div>
                <span className="eyebrow ml-auto text-ink/45">{t(hero3.category)}</span>
                <span className="eyebrow border-b border-ink pb-1 group-hover:border-saffron group-hover:text-saffron">
                  {t("Explore scheme →")}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Remaining compact editorial cards */}
        {rest.slice(1).map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
            className="lg:col-span-4"
          >
            <Link
              to="/scheme/$id"
              params={{ id: s.id }}
              className={`group flex h-full flex-col justify-between p-7 transition-colors duration-500 md:p-9 ${
                i % 3 === 1
                  ? "bg-ivory-deep hover:bg-ink hover:text-ivory"
                  : "bg-white hover:bg-saffron hover:text-white"
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold tracking-[0.16em] uppercase group-hover:text-white">
                  {s.match}% {t("match")}
                </span>
                <h3 className="display mt-4 text-3xl leading-[0.92] md:text-4xl">{t(s.name)}</h3>
                <p className="mt-4 text-sm opacity-65">{t(s.summary)}</p>
              </div>
              <div className="mt-10">
                <p className="display text-5xl">{s.benefit}</p>
                <p className="mt-2 text-[10px] tracking-[0.16em] uppercase opacity-55">
                  {t(s.benefitNote)}
                </p>
                <p className="mt-6 border-t border-current/15 pt-4 text-[10px] tracking-[0.16em] uppercase opacity-55">
                  {t(s.category)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
