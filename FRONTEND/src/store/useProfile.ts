import { create } from "zustand";

type Stage = "idle" | "matching" | "done";

type ProfileState = {
  persona: string | null;
  answers: Record<string, string>;
  stage: Stage;
  setPersona: (p: string | null) => void;
  answer: (key: string, value: string) => void;
  setStage: (s: Stage) => void;
  reset: () => void;
};

export const useProfile = create<ProfileState>((set) => ({
  persona: null,
  answers: {},
  stage: "idle",
  setPersona: (persona) => set({ persona }),
  answer: (key, value) => set((s) => ({ answers: { ...s.answers, [key]: value } })),
  setStage: (stage) => set({ stage }),
  reset: () => set({ persona: null, answers: {}, stage: "idle" }),
}));
