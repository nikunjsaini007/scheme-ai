import { create } from "zustand";

type Stage = "idle" | "matching" | "done";

type ProfileState = {
  persona: string | null;
  answers: Record<string, string>;
  stage: Stage;
  demo: boolean;
  setPersona: (p: string | null) => void;
  answer: (key: string, value: string) => void;
  setStage: (s: Stage) => void;
  runDemo: () => void;
  reset: () => void;
};

export const useProfile = create<ProfileState>((set) => ({
  persona: null,
  answers: {},
  stage: "idle",
  demo: false,
  setPersona: (persona) => set({ persona }),
  answer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
  setStage: (stage) => set({ stage }),
  runDemo: () =>
    set({
      demo: true,
      persona: "STUDENT",
      stage: "done",
      answers: {
        AGE: "18–25",
        STATE: "Haryana",
        OCCUPATION: "Student",
        "ANNUAL FAMILY INCOME": "₹2L – ₹5L",
        CATEGORY: "General",
        EDUCATION: "Graduate",
      },
    }),
  reset: () => set({ persona: null, answers: {}, stage: "idle", demo: false }),
}));