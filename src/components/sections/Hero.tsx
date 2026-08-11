import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { LineReveal, MagneticButton, Reveal } from "@/components/motion-primitives";
import { useProfile } from "@/store/useProfile";
import heroStudent from "@/assets/hero-student.jpg";
import farmer from "@/assets/farmer.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const blockX = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const runDemo = useProfile((s) => s.runDemo);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden pt-28 pb-16 md:pt-36">
      <motion.div
        style={{ x: blockX }}
        className="absolute top-[30vh] -left-24 hidden h-[30vh] w-56 bg-saffron/90 md:block"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />

      <div className="edge relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <motion.div style={{ y: headY }} className="lg:col-span-7 lg:pt-6">
          <Reveal delay={0.1}>
            <p className="eyebrow mb-8 text-ink/45">
              Government scheme discovery — India · {new Date().getFullYear()}
            </p>
          </Reveal>

          <LineReveal
            as="h1"
            delay={0.15}
            className="display text-[16vw] leading-[0.82] sm:text-[13vw] lg:text-[9.2vw]"
            lines={["Find the", <span key="b" className="text-saffron">Benefits</span>, "you deserve."]}
          />

          <Reveal delay={0.7} className="mt-9 max-w-md">
            <p className="text-[15px] leading-relaxed text-ink/70 md:text-base">
              Government schemes are everywhere.
              <br />
              Finding the right one shouldn't be.
            </p>
          </Reveal>

          <Reveal delay={0.85} className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton onClick={() => document.getElementById("eligibility")?.scrollIntoView()}>
              Check what I qualify for
            </MagneticButton>
            <MagneticButton
              variant="outline"
              onClick={() => document.getElementById("schemes")?.scrollIntoView()}
            >
              Explore schemes
            </MagneticButton>
            <button
              onClick={() => {
                runDemo();
                document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="eyebrow ml-1 border-b border-ink/30 pb-1 text-ink/60 transition-colors hover:border-saffron hover:text-saffron"
            >
              Try demo
            </button>
          </Reveal>
        </motion.div>

        <div className="relative lg:col-span-5">
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="grain relative h-[52vh] overflow-hidden lg:h-[64vh] lg:w-[125%]"
          >
            <motion.img
              style={{ scale: imgScale }}
              src={heroStudent}
              width={1200}
              height={1600}
              alt="A young Indian student outdoors in warm afternoon light"
              className="size-full object-cover object-center"
            />
          </motion.div>

          <motion.div
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-8 -left-4 w-56 bg-ivory p-5 shadow-[0_24px_60px_-24px_rgba(17,17,17,0.35)] md:-left-16 md:w-64"
          >
            <p className="display text-4xl leading-none">2,000+</p>
            <p className="eyebrow mt-2 text-ink/50">Schemes tracked</p>
            <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-[13px] text-ink/70">
              <p>Central + State</p>
              <p className="text-saffron">Personalized for you</p>
            </div>
          </motion.div>

          <motion.img
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
            src={farmer}
            width={1408}
            height={1008}
            loading="lazy"
            alt="An Indian farmer standing in a wheat field at golden hour"
            className="absolute -right-6 -bottom-20 hidden h-40 w-56 object-cover xl:block"
          />
        </div>
      </div>

      <div className="edge hairline mt-20 hidden justify-between pt-4 lg:flex">
        <span className="eyebrow text-ink/40">Scroll to begin</span>
        <span className="eyebrow text-ink/40">Yojana + intelligent technology</span>
      </div>
    </section>
  );
}