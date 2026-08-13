import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LineReveal, MagneticButton, Reveal } from "@/components/motion-primitives";
import { useProfile } from "@/store/useProfile";
import { useT } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import narendraModi from "@/assets/Narendra-Modi.jpeg";
import youthTech from "@/assets/generation-youth-tech.jpg";
import educationTech from "@/assets/modern-education-tech.jpg";
import modernFamily from "@/assets/modern-family.jpg";
import healthcareTech from "@/assets/modern-healthcare-tech.webp";
import governmentSchemes from "@/assets/Schemes-of-Indian-Government.jpg";
import womanEntrepreneur from "@/assets/woman-entreprenuer.jpeg";

const HERO_SLIDES = [
  { image: narendraModi, label: "Public service and governance", alt: "Narendra Modi" },
  { image: governmentSchemes, label: "Government schemes for every stage of life", alt: "Government of India schemes" },
  { image: youthTech, label: "Youth, skills and opportunity", alt: "Young people using technology" },
  { image: educationTech, label: "Education and digital learning", alt: "Modern education technology" },
  { image: modernFamily, label: "Family welfare and support", alt: "A modern Indian family" },
  { image: healthcareTech, label: "Healthcare access for everyone", alt: "Modern healthcare technology" },
  { image: womanEntrepreneur, label: "Women and entrepreneurship", alt: "An Indian woman entrepreneur" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const blockX = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const runDemo = useProfile((s) => s.runDemo);
  const { t } = useT();
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % HERO_SLIDES.length), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const previousSlide = () => setSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () => setSlide((current) => (current + 1) % HERO_SLIDES.length);
  const activeSlide = HERO_SLIDES[slide]!;

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden pt-28 pb-16 md:pt-36">
      <motion.div
        style={{ x: blockX }}
        className="absolute bottom-[14vh] left-[8%] hidden h-28 w-44 bg-saffron/90 md:block"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />

      <div className="edge relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <motion.div style={{ y: headY }} className="lg:col-span-7 lg:pt-6">
          <Reveal delay={0.1}>
            <p className="eyebrow mb-8 text-ink/45">
              {t("Government scheme discovery ·")} {new Date().getFullYear()}
            </p>
          </Reveal>

          <LineReveal
            as="h1"
            delay={0.15}
            className="display text-[16vw] leading-[0.82] sm:text-[13vw] lg:text-[9.2vw]"
            lines={[t("Find the"), <span key="b" className="hero-benefit">{t("Benefits")}</span>, t("you deserve.")]}
          />

          <Reveal delay={0.7} className="mt-9 max-w-md">
            <p className="text-[15px] leading-relaxed text-ink/70 md:text-base">
              {t("Government schemes are everywhere.")}
              <br />
              {t("Finding the right one shouldn't be.")}
            </p>
          </Reveal>

          <Reveal delay={0.85} className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/personalize" className="rounded-full bg-ink px-6 py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-saffron">
              {t("Check what I qualify for")}
            </Link>
            <Link to="/schemes" className="rounded-full border border-ink/25 px-6 py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-ink uppercase transition-colors hover:border-saffron hover:text-saffron">
              {t("Explore schemes")}
            </Link>
            <button
              onClick={() => {
                runDemo();
                document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="eyebrow ml-1 border-b border-ink/30 pb-1 text-ink/60 transition-colors hover:border-saffron hover:text-saffron"
            >
              {t("Try demo")}
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
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSlide.alt}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ scale: imgScale }}
                src={activeSlide.image}
                width={1200}
                height={1600}
                alt={activeSlide.alt}
                className="size-full object-cover object-center"
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/70 to-transparent p-5 pt-24 text-white">
              <p className="eyebrow text-white/80">{t(activeSlide.label)}</p>
              <div className="flex gap-2">
                <button onClick={previousSlide} className="grid size-9 place-items-center rounded-full border border-white/40 bg-ink/20 backdrop-blur-sm hover:bg-saffron" aria-label={t("Previous image")}><ChevronLeft className="size-4" /></button>
                <button onClick={nextSlide} className="grid size-9 place-items-center rounded-full border border-white/40 bg-ink/20 backdrop-blur-sm hover:bg-saffron" aria-label={t("Next image")}><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </motion.div>

          <motion.div
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-8 -left-4 w-56 bg-ivory p-5 shadow-[0_24px_60px_-24px_rgba(17,17,17,0.35)] md:-left-16 md:w-64"
          >
            <p className="display text-4xl leading-none">2,000+</p>
            <p className="eyebrow mt-2 text-ink/50">{t("Schemes tracked")}</p>
            <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-[13px] text-ink/70">
              <p>{t("Central + State")}</p>
              <p className="text-saffron">{t("Personalized for you")}</p>
            </div>
          </motion.div>

          <div className="absolute bottom-[-5.5rem] left-1/2 flex -translate-x-1/2 gap-1.5" aria-label={t("Hero image selector")}>
            {HERO_SLIDES.map((item, index) => (
              <button
                key={item.alt}
                onClick={() => setSlide(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === slide ? "w-8 bg-saffron" : "w-1.5 bg-ink/25 hover:bg-saffron/60",
                )}
                aria-label={t("Show image") + " " + (index + 1)}
                aria-current={index === slide}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="edge hairline mt-20 hidden justify-between pt-4 lg:flex">
        <span className="eyebrow text-ink/40">{t("Scroll to begin")}</span>
        <span className="eyebrow text-ink/40">{t("Yojana + intelligent technology")}</span>
      </div>
    </section>
  );
}
