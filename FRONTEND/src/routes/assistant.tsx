import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import {
  ArrowRight,
  ChevronRight,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal, SectionLabel } from "@/components/motion-primitives";
import { schemes } from "@/data/schemes";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/store/useProfile";
import assistantProfile from "@/assets/aiAssistantProfile.png";
import { cn } from "@/lib/utils";
import { askAntra } from "@/lib/antra";
import { getUser } from "@/lib/auth";
import { fetchUserProfile } from "@/lib/schemeCatalog";
import { renderMarkdown } from "@/lib/renderMarkdown";

type Message = { id: number; text: string; user: boolean };

const PROMPTS = [
  "What scholarships can I get as a student?",
  "What documents do I need?",
  "Am I eligible for healthcare support?",
];

/** Map Yojantra preferred_language values to Web Speech API BCP-47 tags */
const VOICE_LANG_MAP: Record<string, string> = {
  english: "en-IN",
  hindi: "hi-IN",
  bengali: "bn-IN",
  tamil: "ta-IN",
  telugu: "te-IN",
  marathi: "mr-IN",
  gujarati: "gu-IN",
  kannada: "kn-IN",
  malayalam: "ml-IN",
  punjabi: "pa-IN",
  odia: "or-IN",
  assamese: "as-IN",
  urdu: "ur-IN",
};

export const Route = createFileRoute("/assistant")({
  head: () => ({
    title: "Antra AI Assistant – Yojantra",
    description: "Ask Antra about government scheme eligibility, benefits, and applications.",
  }),
  component: Assistant,
});

function Assistant() {
  const { t } = useT();
  const { persona, answers } = useProfile();
  const [dbProfile, setDbProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);

  // Voice assistant states
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const [speakResponses, setSpeakResponses] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null); // null = not yet detected
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Detect speech recognition support on client only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Clean markdown text for TTS - removes formatting symbols that would be spoken aloud
  const cleanTextForSpeech = useCallback((text: string): string => {
    return (
      text
        // Remove bold/italic markers
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
        // Remove headings
        .replace(/^#{1,6}\s+/gm, "")
        // Remove code formatting
        .replace(/`(.+?)`/g, "$1")
        // Remove markdown links but keep the text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        // Remove list markers at start of lines
        .replace(/^[\s]*[-*+]\s+/gm, "")
        .replace(/^[\s]*\d+\.\s+/gm, "")
        // Replace multiple newlines with period+space for natural pauses
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, ". ")
        // Clean up multiple spaces
        .replace(/\s{2,}/g, " ")
        // Clean up multiple periods
        .replace(/\.{2,}/g, ".")
        .trim()
    );
  }, []);

  // Voice selection state
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Load and select preferred voice
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      setVoicesLoaded(true);

      // Get user's preferred language
      const preferredLang = dbProfile?.preferred_language?.toLowerCase() || "english";
      const langMap: Record<string, string[]> = {
        english: ["en-IN", "en-US", "en-GB"],
        hindi: ["hi-IN"],
        bengali: ["bn-IN"],
        tamil: ["ta-IN"],
        telugu: ["te-IN"],
        marathi: ["mr-IN"],
        gujarati: ["gu-IN"],
        kannada: ["kn-IN"],
        malayalam: ["ml-IN"],
        punjabi: ["pa-IN"],
        odia: ["or-IN"],
        assamese: ["as-IN"],
        urdu: ["ur-IN"],
      };

      const preferredLangs = langMap[preferredLang] || ["en-IN", "en-US"];

      // Female voice indicators — common in voice names across browsers/OSes
      const isFemaleVoice = (v: SpeechSynthesisVoice): boolean => {
        const name = v.name.toLowerCase();
        return (
          name.includes("female") ||
          name.includes("samantha") ||
          name.includes("karen") ||
          name.includes("zira") ||
          name.includes("hazel") ||
          name.includes("susan") ||
          name.includes("alice") ||
          name.includes("anna") ||
          name.includes("helena") ||
          name.includes("milena") ||
          name.includes("linda") ||
          name.includes("monica") ||
          name.includes("paulina") ||
          name.includes("laura") ||
          name.includes("fiona") ||
          name.includes("veena") ||
          name.includes("aditi")
        );
      };

      // Find best matching voice with female preference
      let selectedVoice: SpeechSynthesisVoice | null = null;

      // 1. Female voice matching preferred language (local first)
      for (const lang of preferredLangs) {
        const langPrefix = lang.split("-")[0];
        selectedVoice =
          voices.find(
            (v) => v.lang.startsWith(langPrefix) && v.localService && isFemaleVoice(v),
          ) || null;
        if (selectedVoice) break;
      }

      // 2. Female voice matching preferred language (any)
      if (!selectedVoice) {
        for (const lang of preferredLangs) {
          const langPrefix = lang.split("-")[0];
          selectedVoice =
            voices.find((v) => v.lang.startsWith(langPrefix) && isFemaleVoice(v)) || null;
          if (selectedVoice) break;
        }
      }

      // 3. Any local voice for the preferred language
      if (!selectedVoice) {
        for (const lang of preferredLangs) {
          const langPrefix = lang.split("-")[0];
          selectedVoice =
            voices.find((v) => v.lang.startsWith(langPrefix) && v.localService) || null;
          if (selectedVoice) break;
        }
      }

      // 4. Any voice for the preferred language
      if (!selectedVoice) {
        for (const lang of preferredLangs) {
          const langPrefix = lang.split("-")[0];
          selectedVoice = voices.find((v) => v.lang.startsWith(langPrefix)) || null;
          if (selectedVoice) break;
        }
      }

      // 5. Any female English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en") && isFemaleVoice(v)) || null;
      }

      // 6. Any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en")) || null;
      }

      // 7. Final fallback to first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        setPreferredVoice(selectedVoice);
      }
    };

    // Voices might not be immediately available
    loadVoices();

    // Handle voiceschanged event (fires when voices are loaded)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [dbProfile?.preferred_language]);

  // Get voice language for speech recognition (BCP-47 format)
  const getVoiceLang = useCallback(() => {
    const preferred = dbProfile?.preferred_language;
    if (preferred && typeof preferred === "string") {
      return VOICE_LANG_MAP[preferred.toLowerCase()] || "en-IN";
    }
    return "en-IN";
  }, [dbProfile]);

  // Get voice language for TTS (uses voice's lang if available)
  const getTTSLang = useCallback(() => {
    if (preferredVoice) return preferredVoice.lang;
    const preferred = dbProfile?.preferred_language;
    if (preferred && typeof preferred === "string") {
      return VOICE_LANG_MAP[preferred.toLowerCase()] || "en-IN";
    }
    return "en-IN";
  }, [dbProfile, preferredVoice]);

  const speakText = useCallback(
    (text: string) => {
      try {
        if (!speakResponses) return;
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const cleanText = cleanTextForSpeech(text);
        if (!cleanText) return;

        const utter = new SpeechSynthesisUtterance(cleanText);

        // Use selected voice if available
        if (preferredVoice) {
          utter.voice = preferredVoice;
          utter.lang = preferredVoice.lang;
        } else {
          utter.lang = getTTSLang();
        }

        // Natural speech settings
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1.0;

        utter.onstart = () => setSpeaking(true);
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);

        window.speechSynthesis.speak(utter);
      } catch {
        // silently fail; keep text assistant working
      }
    },
    [speakResponses, preferredVoice, getTTSLang, cleanTextForSpeech],
  );

  // Load authoritative profile on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingProfile(true);
      try {
        const user = getUser();
        if (!user) {
          setDbProfile(null);
          return;
        }
        const profile = await fetchUserProfile(user.id);
        if (!cancelled) setDbProfile(profile);
      } catch (e) {
        // ignore — UI will show fallback
        if (!cancelled) setDbProfile(null);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const ask = async (question: string, optSpeak = true) => {
    if (!question.trim() || typing) return;
    const clean = question.trim();
    setMessages((items) => [...items, { id: Date.now(), text: clean, user: true }]);
    setInput("");
    setTyping(true);
    try {
      // Ensure we have the authoritative profile read from the database
      const user = await fetchUserProfile(getUser()?.id || "");
      setDbProfile(user);
      const profileForAI: Record<string, unknown> = {
        age: user.age ?? null,
        gender: (String(user.gender || "") || null) as unknown,
        state: user.state ?? null,
        district: user.district ?? null,
        pincode: user.pincode ?? null,
        occupation: user.occupation ?? null,
        annual_income: user.annual_income ?? null,
        education_level: user.education_level ?? null,
        category: user.category ?? null,
        marital_status: user.marital_status ?? null,
        is_student: user.is_student ?? null,
        disability_status: user.disability_status ?? null,
      };

      const text = await askAntra({
        data: {
          question: clean,
          history: messages.map((message) => ({
            role: message.user ? "user" : "model",
            text: message.text,
          })),
          // pass authoritative DB profile (not local store) to the server
          profile: profileForAI as Record<string, string>,
          schemes: schemes.map(({ name, summary, benefit, category, match }) => ({
            name,
            summary,
            benefit,
            category,
            match,
          })),
        },
      });
      setMessages((items) => [...items, { id: Date.now() + 1, text, user: false }]);
      if (optSpeak) speakText(text);
    } catch (error) {
      const errText =
        error instanceof Error
          ? error.message
          : "Antra is temporarily unavailable. Please try again later.";
      setMessages((items) => [...items, { id: Date.now() + 1, text: errText, user: false }]);
    } finally {
      setTyping(false);
    }
  };

  const send = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  const startListening = () => {
    setVoiceError(null);

    // Check for secure context (HTTPS or localhost) - required for SpeechRecognition in most browsers
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setVoiceError(
        t("Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost."),
      );
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError(
        t("Voice input isn't supported in this browser. You can type your message instead."),
      );
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    const recog = new SR();
    recog.lang = getVoiceLang();
    recog.continuous = false;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    let finalTranscript = "";
    recog.onresult = (ev: any) => {
      let interimTranscript = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const transcript = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      // Show interim results in input for better UX
      const displayText = finalTranscript + interimTranscript;
      if (displayText.trim()) {
        setInput((prev) => (prev ? prev + " " + displayText.trim() : displayText.trim()));
      }
    };
    recog.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recog.onerror = (ev: any) => {
      setListening(false);
      recognitionRef.current = null;
      const errType = ev.error;
      if (errType === "not-allowed" || errType === "service-not-allowed") {
        setVoiceError(
          t(
            "Microphone access was blocked. Please allow microphone access in your browser settings, then try again.",
          ),
        );
      } else if (errType === "no-speech") {
        setVoiceError(t("No speech detected. Try again when you're ready."));
      } else if (errType === "network") {
        setVoiceError(t("Network error. Please check your connection and try again."));
      } else if (errType === "audio-capture") {
        setVoiceError(t("No microphone found. Please connect a microphone and try again."));
      } else if (errType === "bad-grammar") {
        setVoiceError(t("Speech recognition grammar error. Please try again."));
      } else if (errType !== "aborted") {
        setVoiceError(t("Could not recognize speech. Please try again."));
      }
    };
    recognitionRef.current = recog;
    setListening(true);
    try {
      recog.start();
    } catch {
      setListening(false);
      setVoiceError(t("Could not start voice input. Please try again."));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
    setVoiceError(null);
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
              <h1 className="display mt-7 text-[16vw] leading-[.9] md:text-[8vw]">
                {t("Your scheme guide.")}
              </h1>
              <p className="mt-8 max-w-sm text-sm leading-relaxed text-ink/60">
                {t(
                  "A calmer way to understand government benefits. Ask in plain language and get a clear next step.",
                )}
              </p>
            </Reveal>
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-saffron text-white">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -right-12 -top-12 size-48 rounded-full bg-saffron blur-3xl"
              />
              <img
                src={assistantProfile}
                alt={t("Antra AI assistant")}
                className="h-64 w-full object-cover opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent p-6 pt-20">
                <div className="flex items-center gap-3">
                  <img
                    src={assistantProfile}
                    alt=""
                    className="size-10 rounded-full border-2 border-white object-cover"
                  />
                  <div>
                    <p className="text-sm">{t("Antra")}</p>
                    <p className="eyebrow text-white/65">{t("Here to make schemes clearer")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 border-t border-ink/15 pt-6">
              <p className="eyebrow text-ink/40">{t("Your context")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {loadingProfile ? (
                  <span className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/60">
                    Loading profile…
                  </span>
                ) : dbProfile ? (
                  // Build a concise set of profile chips using only present fields
                  [
                    dbProfile.gender ? String(dbProfile.gender) : null,
                    dbProfile.age ? `Age: ${dbProfile.age}` : null,
                    dbProfile.state ? String(dbProfile.state) : null,
                    dbProfile.occupation ? String(dbProfile.occupation) : null,
                    dbProfile.category ? String(dbProfile.category) : null,
                    dbProfile.annual_income
                      ? `Income: ₹${Number(dbProfile.annual_income).toLocaleString("en-IN")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={String(item)}
                        className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/60"
                      >
                        {item}
                      </span>
                    ))
                ) : (
                  <span className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/60">
                    No profile yet
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  to="/personalize"
                  className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[.16em] text-saffron uppercase hover:text-ink"
                >
                  {t("Personalize your context")} <ArrowRight className="size-3.5" />
                </Link>
                <button
                  onClick={async () => {
                    setLoadingProfile(true);
                    try {
                      const user = getUser();
                      if (user) {
                        const refreshed = await fetchUserProfile(user.id);
                        setDbProfile(refreshed);
                      }
                    } catch {
                    } finally {
                      setLoadingProfile(false);
                    }
                  }}
                  className="text-xs text-ink/50 underline"
                >
                  Refresh profile
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white text-ink shadow-[0_24px_80px_-35px_rgba(17,17,17,.25)]">
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute inset-0 animate-ping rounded-full bg-saffron/30" />
                    <img
                      src={assistantProfile}
                      alt=""
                      className="relative size-10 rounded-full border-2 border-saffron object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("Antra")}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMessages([]);
                    setInput("");
                  }}
                  className="text-ink/35 hover:text-saffron"
                  aria-label={t("Clear chat")}
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
              <div className="h-[390px] space-y-5 overflow-y-auto p-6 sm:p-8">
                {messages.length === 0 && (
                  <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="grid size-16 place-items-center rounded-full border border-saffron/40 bg-saffron/10"
                    >
                      <img
                        src={assistantProfile}
                        alt={t("Antra AI assistant")}
                        className="size-14 rounded-full object-cover"
                      />
                    </motion.div>
                    <h2 className="display mt-7 text-3xl">{t("What can I help you find?")}</h2>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/50">
                      {t("Ask about schemes, documents, benefits, or eligibility.")}
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn("flex min-w-0 gap-3", message.user && "justify-end")}
                  >
                    <div
                      className={cn(
                        "min-w-0 max-w-[88%] overflow-y-auto break-words rounded-xl px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere]",
                        message.user
                          ? "max-h-32 rounded-br-sm bg-saffron text-white"
                          : "max-h-40 rounded-bl-sm bg-ivory-deep text-ink/80",
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[.14em] opacity-50">
                        {message.user ? (
                          <UserRound className="size-3" />
                        ) : (
                          <img
                            src={assistantProfile}
                            alt=""
                            className="size-4 rounded-full object-cover"
                          />
                        )}
                        {message.user ? t("You") : t("Antra")}
                      </div>
                      {message.user ? (
                        message.text
                      ) : (
                        <div
                          className="space-y-2 [&_ul]:list-inside [&_ul]:list-disc [&_ol]:list-inside [&_ol]:list-decimal [&_li]:ml-2 [&_p]:leading-relaxed [&_strong]:font-semibold [&_code]:rounded bg-ink/5 [&_code]:px-1 [&_code]:text-xs"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-ink/40"
                  >
                    <img
                      src={assistantProfile}
                      alt=""
                      className="size-5 rounded-full object-cover"
                    />
                    <span className="flex gap-1">
                      <i className="size-1.5 animate-bounce rounded-full bg-saffron" />
                      <i className="size-1.5 animate-bounce rounded-full bg-saffron [animation-delay:150ms]" />
                      <i className="size-1.5 animate-bounce rounded-full bg-saffron [animation-delay:300ms]" />
                    </span>
                  </motion.div>
                )}
                {voiceError && <p className="mt-2 text-xs text-saffron/80">{voiceError}</p>}
              </div>
              <div className="border-t border-ink/10 p-4">
                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => ask(prompt)}
                      className="shrink-0 rounded-full border border-ink/15 px-3 py-2 text-[10px] text-ink/55 hover:border-saffron hover:text-saffron"
                    >
                      {t(prompt)}
                    </button>
                  ))}
                </div>
                <form onSubmit={send} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={t("Type your question…")}
                    className="min-w-0 flex-1 rounded-full border border-ink/15 bg-ivory px-4 py-3 text-sm outline-none placeholder:text-ink/30 focus:border-saffron"
                  />
                  <div className="flex items-center gap-2">
                    {voiceSupported === false ? (
                      <span
                        className="size-10 place-items-center rounded-full border border-ink/15 text-ink/20 sm:grid"
                        title={t("Voice input isn't supported in this browser")}
                      >
                        <MicOff className="size-4" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => (listening ? stopListening() : startListening())}
                        className={cn(
                          "size-10 place-items-center rounded-full border sm:grid",
                          listening
                            ? "border-saffron bg-saffron text-white animate-pulse"
                            : "border-ink/15 text-ink/40 hover:border-saffron hover:text-saffron",
                        )}
                        aria-label={listening ? t("Stop listening") : t("Voice input")}
                      >
                        <Mic className="size-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSpeakResponses((s) => !s)}
                      title={speakResponses ? t("Speak responses: on") : t("Speak responses: off")}
                      className="size-10 place-items-center rounded-full border border-ink/15 text-ink/40 hover:border-saffron hover:text-saffron"
                    >
                      {speakResponses ? "🔊" : "🔈"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-saffron text-white hover:bg-ink"
                    aria-label={t("Send")}
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/40">
              {t("Always verify eligibility and apply through the official government portal.")}
            </p>
          </div>
        </div>
      </section>
      <section className="bg-ivory-deep py-24 md:py-32">
        <div className="edge">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-saffron">{t("Explore while you ask")}</p>
              <h2 className="display mt-4 text-5xl md:text-7xl">{t("Start with these.")}</h2>
            </div>
            <Link
              to="/schemes"
              className="hidden items-center gap-2 text-[11px] font-semibold tracking-[.16em] uppercase hover:text-saffron sm:flex"
            >
              {t("All schemes")} <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {schemes.slice(0, 3).map((scheme, index) => (
              <Reveal key={scheme.id} delay={index * 0.08}>
                <Link
                  to="/scheme/$id"
                  params={{ id: scheme.id }}
                  className="group block bg-white p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-saffron">
                      {scheme.match}% {t("match")}
                    </span>
                    <ArrowRight className="size-4 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-saffron" />
                  </div>
                  <h3 className="display mt-8 text-3xl">{t(scheme.name)}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink/55">{t(scheme.summary)}</p>
                  <p className="display mt-10 text-4xl text-saffron">{t(scheme.benefit)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
