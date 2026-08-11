import { motion } from "motion/react";
import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import priya from "@/assets/story-priya.jpg";
import entrepreneur from "@/assets/woman-entrepreneur.jpg";
import family from "@/assets/family-home.jpg";
import senior from "@/assets/senior.jpg";

const STORIES = [
  { img: priya, title: ["How a scholarship", "helped Priya", "stay in college."], place: "Ranchi, Jharkhand", tag: "Education" },
  { img: entrepreneur, title: ["From farmer", "to entrepreneur."], place: "Nashik, Maharashtra", tag: "Livelihood" },
  { img: family, title: ["A housing scheme", "that changed", "a family's life."], place: "Warangal, Telangana", tag: "Housing" },
  { img: senior, title: ["A pension that", "arrives on time."], place: "Kochi, Kerala", tag: "Social security" },
];

export function Stories() {
  return (
    <section id="stories" className="py-28 md:py-40">
      <div className="edge">
        <SectionLabel index="08" title="Stories" />
        <LineReveal className="display text-[13vw] leading-[0.86] md:text-[7.5vw]" lines={["Real people.", "Real benefits."]} />
        <Reveal delay={0.2}>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-ink/55">
            Illustrative stories, written from the kinds of outcomes these schemes are designed to support.
          </p>
        </Reveal>
      </div>

      <div className="edge mt-16 flex snap-x gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((s, i) => (
          <motion.article
            key={s.place}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={`group min-w-[80vw] shrink-0 snap-start sm:min-w-[52vw] lg:min-w-[30vw] ${i % 2 ? "lg:mt-16" : ""}`}
          >
            <div className="grain relative aspect-3/4 overflow-hidden">
              <img
                src={s.img}
                loading="lazy"
                alt={`${s.tag} story from ${s.place}`}
                className="size-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
              />
              <span className="absolute top-4 left-4 bg-ivory px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase">
                {s.tag}
              </span>
            </div>
            <h3 className="display mt-6 text-3xl leading-[0.92] md:text-4xl">
              {s.title.map((l, k) => (
                <span key={k} className="block">
                  {l}
                </span>
              ))}
            </h3>
            <p className="eyebrow mt-4 text-ink/40">{s.place}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}