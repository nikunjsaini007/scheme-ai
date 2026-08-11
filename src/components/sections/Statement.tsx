import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LineReveal, Reveal } from "@/components/motion-primitives";

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section id="discover" ref={ref} className="relative bg-ivory-deep py-28 md:py-44">
      <div className="edge">
        <LineReveal
          className="display text-[13vw] leading-[0.85] md:text-[10vw]"
          lines={["India has", "thousands of", "schemes."]}
        />

        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5 md:col-start-7">
            <Reveal>
              <p className="text-xl leading-snug text-ink/80 md:text-2xl">
                But knowing a scheme exists doesn't mean knowing you qualify for it.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink/55">
                Eligibility is buried in circulars, income slabs, state notifications and PDFs. Most people never
                find out what was already meant for them.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <motion.div style={{ x }} className="mt-24 flex items-baseline gap-8 whitespace-nowrap">
        <span className="display text-[24vw] leading-[0.8] text-saffron">You.</span>
        <span className="display text-[24vw] leading-[0.8] text-ink/8">You.</span>
        <span className="display text-[24vw] leading-[0.8] text-ink/5">You.</span>
      </motion.div>

      <div className="edge mt-16">
        <LineReveal
          className="display max-w-4xl text-[9vw] leading-[0.88] md:text-[5.4vw]"
          lines={["Yojantra connects", "the two."]}
        />
      </div>
    </section>
  );
}