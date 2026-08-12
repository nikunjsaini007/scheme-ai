import { create } from "zustand";

export type Lang = "en" | "hi";

type LangState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

export const useLang = create<LangState>((set) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
  toggle: () => set((s) => ({ lang: s.lang === "en" ? "hi" : "en" })),
}));
