import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  calculateSrsSchedule,
  DEFAULT_SRS_CONFIG,
} from "@/lib/foundation/srs-calculation";

export interface UserStageScore {
  id: string;
  userId: string;
  languageId: string;
  roadmapId: string;
  stageId: string;
  durationMs: number;
  playCount: number;
  wrongAttempts: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ScheduledStageScore extends UserStageScore {
  nextReviewAt: number;
  intervalMs: number;
}

interface SrsState {
  scoresByRoadmap: Record<string, ScheduledStageScore[]>;
  fetchedAt: Record<string, number>;
  claimedByCompletion: Record<string, boolean>;

  ensureLanguageLoaded: (languageId: string, force?: boolean) => Promise<void>;
  updateScore: (score: UserStageScore) => void;
  getDueReview: (
    languageId: string,
    now?: number
  ) => ScheduledStageScore | null;
  claimDueReview: (
    stageId: string,
    updatedAt: string | Date,
    languageId: string,
    now?: number
  ) => ScheduledStageScore | null;
  clearLanguage: (languageId: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000;
const inFlightRequests = new Map<string, Promise<void>>();

const getRoadmapKey = (languageId: string, roadmapId: string) =>
  `${languageId}:${roadmapId}`;

const getCompletionKey = (
  languageId: string,
  stageId: string,
  updatedAt: string | Date
) => `${languageId}:${stageId}:${new Date(updatedAt).getTime()}`;

const scheduleScore = (score: UserStageScore): ScheduledStageScore => {
  const normalizedScore = {
    ...score,
    createdAt: new Date(score.createdAt),
    updatedAt: new Date(score.updatedAt),
  };

  const schedule = calculateSrsSchedule(
    normalizedScore,
    Date.now(),
    DEFAULT_SRS_CONFIG
  );

  return { ...score, ...schedule };
};

export const useSrsStore = create<SrsState>()(
  persist(
    (set, get) => ({
      scoresByRoadmap: {},
      fetchedAt: {},
      claimedByCompletion: {},

      // Load every completed stage belonging to this language.
      ensureLanguageLoaded: async (languageId, force = false) => {
        const existingRequest = inFlightRequests.get(languageId);

        if (existingRequest) {
          await existingRequest;
          return;
        }

        if (
          !force &&
          Date.now() - (get().fetchedAt[languageId] || 0) <
            CACHE_DURATION
        ) {
          return;
        }

        const request = (async () => {
          const response = await fetch(
            `/api/client/languages/${languageId}/srs`
          );

          if (!response.ok) {
            throw new Error("Failed to load language SRS scores");
          }

          const data = await response.json();
          const scores: UserStageScore[] = data.scores;

          const grouped: Record<string, ScheduledStageScore[]> = {};

          scores.forEach((score) => {
            const key = getRoadmapKey(languageId, score.roadmapId);
            (grouped[key] ??= []).push(scheduleScore(score));
          });

          set((state) => {
            const otherLanguages = Object.fromEntries(
              Object.entries(state.scoresByRoadmap).filter(
                ([key]) => !key.startsWith(`${languageId}:`)
              )
            );

            return {
              scoresByRoadmap: { ...otherLanguages, ...grouped },
              fetchedAt: {
                ...state.fetchedAt,
                [languageId]: Date.now(),
              },
            };
          });
        })();

        inFlightRequests.set(languageId, request);

        try {
          await request;
        } finally {
          inFlightRequests.delete(languageId);
        }
      },

      // Add or refresh a score and recalculate its schedule.
      updateScore: (score) => {
        const key = getRoadmapKey(score.languageId, score.roadmapId);
        const scheduledScore = scheduleScore(score);

        set((state) => {
          const scores = state.scoresByRoadmap[key] ?? [];
          const exists = scores.some(
            (item) => item.stageId === score.stageId
          );

          return {
            scoresByRoadmap: {
              ...state.scoresByRoadmap,
              [key]: exists
                ? scores.map((item) =>
                    item.stageId === score.stageId
                      ? scheduledScore
                      : item
                  )
                : [...scores, scheduledScore],
            },
          };
        });
      },

      // Find only the earliest due stage across all roadmaps
      // belonging to this language.
      getDueReview: (languageId, now = Date.now()) => {
        const dueStages = Object.entries(get().scoresByRoadmap)
          .filter(([key]) => key.startsWith(`${languageId}:`))
          .flatMap(([, scores]) => scores)
          .filter((score) => score.nextReviewAt <= now)
          .sort(
            (a, b) =>
              a.nextReviewAt - b.nextReviewAt ||
              new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime()
          );

        return dueStages[0] ?? null;
      },

      // Claim just one due stage for this completion.
      claimDueReview: (stageId, updatedAt, languageId, now) => {
        const completionKey = getCompletionKey(
          languageId,
          stageId,
          updatedAt
        );

        if (get().claimedByCompletion[completionKey]) {
          return null;
        }

        const dueStage = get().getDueReview(languageId, now);

        if (!dueStage) return null;

        set((state) => ({
          claimedByCompletion: {
            ...state.claimedByCompletion,
            [completionKey]: true,
          },
        }));

        return dueStage;
      },

      clearLanguage: (languageId) => {
        set((state) => ({
          scoresByRoadmap: Object.fromEntries(
            Object.entries(state.scoresByRoadmap).filter(
              ([key]) => !key.startsWith(`${languageId}:`)
            )
          ),
          fetchedAt: Object.fromEntries(
            Object.entries(state.fetchedAt).filter(
              ([key]) => key !== languageId
            )
          ),
        }));
      },
    }),
    {
      name: "foundation-srs-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        scoresByRoadmap: state.scoresByRoadmap,
        fetchedAt: state.fetchedAt,
        claimedByCompletion: state.claimedByCompletion,
      }),
    }
  )
);
