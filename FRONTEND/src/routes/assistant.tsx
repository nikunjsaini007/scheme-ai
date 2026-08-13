import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ChevronRight, Mic, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/store/useProfile";
import assistantProfile from "@/assets/aiAssistantProfile.png";
import { cn } from "@/lib/utils";

type Message = { id: number; text: string; user: boolean };

const PROMPTS = [
  "What scholarships can I get as a student?",
  "What documents do I need?",
  "Am I eligible for healthcare support?",
];

export const Route = createFileRoute("/assistant")({
  head: () => ({ title: "Antra AI Assistant – Yojantra", description: "Ask Antra about government scheme eligibility, benefits, and applications." }),
  component: Assistant,
});

function Assistant() {
  const { t } = useT();
  const { persona, answers } = useProfile();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);

  const respond = (question: string) => {
    const lower = question.toLowerCase();
    if (lower.includes("scholar")) return t("The Post-Matric Scholarship looks like a strong starting point. It can support recognised post-matric courses with maintenance and fee assistance. Open the scheme page to check the full criteria.");
    if (lower.includes("document")) return t("Most schemes need Aadhaar, proof of income, and a bank account. Some also ask for education, caste, or land records. The exact list is shown on each scheme page.");
    if (lower.includes("health") || lower.includes("eligible")) return t("Ayushman Bharat may help eligible families with cashless hospital care. Eligibility is checked against the official beneficiary database, so confirm before applying.");
    return t("I can help you understand schemes, eligibility, benefits, documents, and application steps. Try asking about a need, scheme, or life situation.");
  };

  const ask = (question: string) => {
    if (!question.trim() || typing) return;
    const clean = question.trim();
    setMessages((items) => [...items, { id: Date.now(), text: clean, user: true }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((items) => [...items, { id: Date.now() + 1, text: respond(clean), user: false }]);
      setTyping(false);
    }, 650);
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <main className="overflow-hidden bg-ivory text-ink">
      <Nav />
      <section className="edge py-28 md:py-40">
        <SectionLabel index="01" title={t("AI assistant")} />
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-saffron">{t("Ask. Understand. Act.")}</p>
              <h1 className="display mt-7 text-[16vw] leading-[.9] md:text-[8vw]">{t("Your scheme guide.")}</h1>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink/60">{t("A calmer way to understand government benefits. Ask in plain language and get a clear next step.")}</p>
            </Reveal>
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-saffron text-white">
              <motion.div animate={{ scale: [1, 1.08, 1], opacity: [.2, .35, .2] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -right-12 -top-12 size-48 rounded-full bg-saffron blur-3xl" />
              <img src={assistantProfile} alt={t("Antra AI assistant")} className="h-64 w-full object-cover opacity-90" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent p-6 pt-20"><div className="flex items-center gap-3"><img src={assistantProfile} alt="" className="size-10 rounded-full border-2 border-white object-cover" /><div><p className="text-sm">{t("Antra")}</p><p className="eyebrow text-white/65">{t("Here to make schemes clearer")}</p></div></div></div>
            </div>
            <div className="mt-10 border-t border-ink/15 pt-6"><p className="eyebrow text-ink/40">{t("Your context")}</p><div className="mt-4 flex flex-wrap gap-2">{(persona ? [persona, ...Object.values(answers).slice(0, 2)] : ["No profile yet"]).map((item) => <span key={item} className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/60">{t(item)}</span>)}</div><Link to="/personalize" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.16em] text-saffron uppercase hover:text-ink">{t("Personalize your context")} <ArrowRight className="size-3.5" /></Link></div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-[0_24px_80px_-35px_rgba(17,17,17,.25)]">
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5"><div className="flex items-center gap-3"><div className="relative"><span className="absolute inset-0 animate-ping rounded-full bg-saffron/30" /><img src={assistantProfile} alt="" className="relative size-10 rounded-full border-2 border-saffron object-cover" /></div><div><p className="text-sm font-medium">{t("Antra")}</p><p className="eyebrow text-ink/40">{t("Government scheme assistant")}</p></div></div><button onClick={() => { setMessages([]); setInput(""); }} className="text-ink/35 hover:text-saffron" aria-label={t("Clear chat")}><RotateCcw className="size-4" /></button></div>
              <div className="h-[390px] space-y-5 overflow-y-auto p-6 sm:p-8">{messages.length === 0 && <div className="flex min-h-[260px] flex-col items-center justify-center text-center"><motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }} className="grid size-16 place-items-center rounded-full border border-saffron/40 bg-saffron/10"><img src={assistantProfile} alt={t("Antra AI assistant")} className="size-14 rounded-full object-cover" /></motion.div><h2 className="display mt-7 text-3xl">{t("What can I help you find?")}</h2><p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/50">{t("Ask about schemes, documents, benefits, or eligibility.")}</p></div>}{messages.map((message) => <motion.div key={message.id} initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn("flex min-w-0 gap-3", message.user && "justify-end")}><div className={cn("min-w-0 max-w-[88%] overflow-y-auto break-words rounded-xl px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere]", message.user ? "max-h-32 rounded-br-sm bg-saffron text-white" : "max-h-40 rounded-bl-sm bg-ivory-deep text-ink/80")}><div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.14em] opacity-50">{message.user ? <UserRound className="size-3" /> : <img src={assistantProfile} alt="" className="size-4 rounded-full object-cover" />}{message.user ? t("You") : t("Antra")}</div>{message.text}</div></motion.div>)}{typing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-ink/40"><img src={assistantProfile} alt="" className="size-5 rounded-full object-cover" /><span className="flex gap-1"><i className="size-1.5 animate-bounce rounded-full bg-saffron" /><i className="size-1.5 animate-bounce rounded-full bg-saffron [animation-delay:150ms]" /><i className="size-1.5 animate-bounce rounded-full bg-saffron [animation-delay:300ms]" /></span></motion.div>}</div>
              <div className="border-t border-ink/10 p-4"><div className="mb-4 flex gap-2 overflow-x-auto pb-1">{PROMPTS.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="shrink-0 rounded-full border border-ink/15 px-3 py-2 text-[10px] text-ink/55 hover:border-saffron hover:text-saffron">{t(prompt)}</button>)}</div><form onSubmit={send} className="flex items-center gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t("Type your question…")} className="min-w-0 flex-1 rounded-full border border-ink/15 bg-ivory px-4 py-3 text-sm outline-none placeholder:text-ink/30 focus:border-saffron" /><button type="button" className="hidden size-10 place-items-center rounded-full border border-ink/15 text-ink/40 hover:border-saffron hover:text-saffron sm:grid" aria-label={t("Voice input")}><Mic className="size-4" /></button><button type="submit" className="grid size-11 shrink-0 place-items-center rounded-full bg-saffron text-white hover:bg-ink" aria-label={t("Send")}><Send className="size-4" /></button></form></div>
            </div>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/40">{t("Demo guidance only. Always verify eligibility and apply through the official government portal.")}</p>
          </div>
        </div>
      </section>
      <section className="bg-ivory-deep py-24 md:py-32"><div className="edge"><div className="flex items-end justify-between gap-6"><div><p className="eyebrow text-saffron">{t("Explore while you ask")}</p><h2 className="display mt-4 text-5xl md:text-7xl">{t("Start with these.")}</h2></div><Link to="/schemes" className="hidden items-center gap-2 text-[11px] font-semibold tracking-[.16em] uppercase hover:text-saffron sm:flex">{t("All schemes")} <ChevronRight className="size-4" /></Link></div><div className="mt-10 grid gap-4 md:grid-cols-3">{schemes.slice(0, 3).map((scheme, index) => <Reveal key={scheme.id} delay={index * .08}><Link to="/scheme/$id" params={{ id: scheme.id }} className="group block bg-white p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8"><div className="flex items-center justify-between"><span className="eyebrow text-saffron">{scheme.match}% {t("match")}</span><ArrowRight className="size-4 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-saffron" /></div><h3 className="display mt-8 text-3xl">{t(scheme.name)}</h3><p className="mt-4 text-sm leading-relaxed text-ink/55">{t(scheme.summary)}</p><p className="display mt-10 text-4xl text-saffron">{t(scheme.benefit)}</p></Link></Reveal>)}</div></div></section>
      <Footer />
    </main>
  );
}
