import { LineReveal, Reveal, SectionLabel } from "@/components/motion-primitives";
import { categories } from "@/data/schemes";

export function Categories() {
  return (
    <section className="edge py-28 md:py-40">
      <SectionLabel index="09" title="Categories" />
      <LineReveal
        className="display max-w-5xl text-[12vw] leading-[0.86] md:text-[6.4vw]"
        lines={["Whatever", "your journey,", "there's support."]}
      />

      <div className="mt-16 border-t border-ink/15">
        {categories.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.04}>
            <a
              href="#schemes"
              className="group flex items-center gap-6 border-b border-ink/12 py-6 transition-colors duration-300 hover:bg-ink md:py-8"
            >
              <span className="eyebrow w-10 shrink-0 text-ink/35 group-hover:text-saffron">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display text-[8vw] leading-none transition-colors duration-300 group-hover:text-saffron md:text-[3.6vw]">
                {c.name}
              </h3>
              <span className="eyebrow ml-auto shrink-0 text-ink/40 group-hover:text-ivory/60">
                {c.count} schemes
              </span>
              <span className="hidden shrink-0 text-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-saffron sm:block">
                →
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}