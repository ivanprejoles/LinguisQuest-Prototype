
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type StoryOutcome = 'win' | 'loss';

export interface StoryProgress {
  sessionId: string;
  currentNodeId: string;
  winCount: number;
  lossCount: number;
}

interface StoryProgressState {
  progress: Record<string, StoryProgress>;
  dirty: Record<string, boolean>;

  setCheckpoint: (
    sessionId: string,
    currentNodeId: string,
  ) => void;

  hydrate: (progress: StoryProgress) => void;

  recordOutcome: (
    sessionId: string,
    startingNodeId: string,
    outcome: StoryOutcome,
  ) => void;

  markClean: (sessionId: string) => void;
}

export const useStoryProgressStore =
  create<StoryProgressState>()(
    persist(
      (set) => ({
        progress: {},
        dirty: {},

        setCheckpoint: (sessionId, currentNodeId) =>
          set((state) => {
            const previous = state.progress[sessionId];

            if (previous?.currentNodeId === currentNodeId) {
              return state;
            }

            return {
              progress: {
                ...state.progress,
                [sessionId]: {
                  sessionId,
                  currentNodeId,
                  winCount: previous?.winCount ?? 0,
                  lossCount: previous?.lossCount ?? 0,
                },
              },
              dirty: {
                ...state.dirty,
                [sessionId]: true,
              },
            };
          }),

        hydrate: (progress) =>
          set((state) => {
            // Never replace unsaved local progress with server data.
            if (state.dirty[progress.sessionId]) {
              return state;
            }

            return {
              progress: {
                ...state.progress,
                [progress.sessionId]: progress,
              },
            };
          }),

        recordOutcome: (sessionId, startingNodeId, outcome) =>
          set((state) => {
            const previous = state.progress[sessionId];

            if (!previous) {
              return state;
            }

            return {
              progress: {
                ...state.progress,
                [sessionId]: {
                  ...previous,
                  currentNodeId: startingNodeId,
                  winCount:
                    previous.winCount + (outcome === 'win' ? 1 : 0),
                  lossCount:
                    previous.lossCount + (outcome === 'loss' ? 1 : 0),
                },
              },
              dirty: {
                ...state.dirty,
                [sessionId]: true,
              },
            };
          }),

        markClean: (sessionId) =>
          set((state) => ({
            dirty: {
              ...state.dirty,
              [sessionId]: false,
            },
          })),
      }),
      {
        name: 'story-progress',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          progress: state.progress,
          dirty: state.dirty,
        }),
      },
    ),
  );
