// store/useFoundationStore.ts
import { create } from "zustand";
import { Language, Roadmap, Stage } from "@prisma/client";

interface FoundationState {
  // Active Selected Entities
  activeLanguage: Language | null;
  activeRoadmap: Roadmap | null;
  activeStage: Stage | null;

  // Lists
  languages: Language[];
  roadmaps: Roadmap[];
  stages: Stage[];

  // Actions for Active Selections
  setActiveLanguage: (language: Language | null) => void;
  setActiveRoadmap: (roadmap: Roadmap | null) => void;
  setActiveStage: (stage: Stage | null) => void;
  resetSelections: () => void;

  // Actions for Lists
  setLanguages: (languages: Language[]) => void;
  setRoadmaps: (roadmaps: Roadmap[]) => void;
  setStages: (stages: Stage[]) => void;
}

export const useFoundationStore = create<FoundationState>((set) => ({
  activeLanguage: null,
  activeRoadmap: null,
  activeStage: null,

  languages: [],
  roadmaps: [],
  stages: [],

  setActiveLanguage: (language) =>
    set({
      activeLanguage: language,
      activeRoadmap: null, // Reset nested selections when switching language
      activeStage: null,
    }),

  setActiveRoadmap: (roadmap) =>
    set({
      activeRoadmap: roadmap,
      activeStage: null, // Reset active stage when switching roadmap
    }),

  setActiveStage: (stage) => set({ activeStage: stage }),

  resetSelections: () =>
    set({
      activeLanguage: null,
      activeRoadmap: null,
      activeStage: null,
    }),

  setLanguages: (languages) => set({ languages }),
  setRoadmaps: (roadmaps) => set({ roadmaps }),
  setStages: (stages) => set({ stages }),
}));