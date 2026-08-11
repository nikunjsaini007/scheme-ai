import { Reveal, LineReveal } from "@/components/motion-primitives";

const STEPS = [
  { n: "01", t: "Check eligibility", d: "Answer a few plain questions about your life." },
  { n: "02", t: "Understand benefit", d: "See what the scheme actually pays, and when." },
  { n: "03", t: "Prepare documents", d: "Know exactly what to collect before you start." },
  { n: "04", t: "Apply", d: "We hand you off to the official government portal." },
  { n: "05", t: "Track application", d: "Keep your application ID and deadlines in one place." },
];

export function Journey() {
  return (
    <section className="bg-ink py-28 text-ivory md:py-40">
      <div className="edge">
        <LineReveal className="display text-[12vw] leading-[0.88] md:text-[6vw]" lines={["From curious", "to applied."]} />
      </div>
      <div className="mt-16 flex snap-x gap-px overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.n}
            delay={i * 0.07}
            className="min-w-[78vw] shrink-0 snap-start border-l border-ivory/15 sm:min-w-[46vw] lg:min-w-[26vw]"
          >
            <div className="h-full px-6 md:px-9">
              <p className="display text-[22vw] leading-[0.8] text-saffron/90 md:text-[9vw]">{s.n}</p>
              <h3 className="display mt-6 text-2xl md:text-3xl">{s.t}</h3>
              <p className="mt-4 max-w-[26ch] text-sm text-ivory/55">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="edge mt-8">
        <p className="eyebrow text-ivory/30">Scroll sideways →</p>
      </div>
    </section>
  );
}