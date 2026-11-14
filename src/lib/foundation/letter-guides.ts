
import type { LetterGuide } from "./letter-guide-types";

export const letterGuides: Record<string, LetterGuide> = {
  A: {
    letter: "A",
    strokes: [
      {
        path: [
          { x: 55, y: 225 },
          { x: 140, y: 45 },
        ],
      },
      {
        path: [
          { x: 140, y: 45 },
          { x: 225, y: 225 },
        ],
      },
      {
        path: [
          { x: 90, y: 145 },
          { x: 190, y: 145 },
        ],
      },
    ],
  },

  B: {
    letter: "B",
    strokes: [
      {
        path: [
          { x: 75, y: 225 },
          { x: 75, y: 45 },
        ],
      },
      {
        path: [
          { x: 75, y: 45 },
          { x: 155, y: 45 },
          { x: 210, y: 75 },
          { x: 210, y: 110 },
          { x: 175, y: 135 },
          { x: 75, y: 135 },
        ],
      },
      {
        path: [
          { x: 75, y: 135 },
          { x: 175, y: 135 },
          { x: 220, y: 165 },
          { x: 220, y: 195 },
          { x: 180, y: 225 },
          { x: 75, y: 225 },
        ],
      },
    ],
  },

  K: {
    letter: "K",
    strokes: [
      {
        path: [
          { x: 80, y: 45 },
          { x: 80, y: 225 },
        ],
      },
      {
        path: [
          { x: 210, y: 45 },
          { x: 80, y: 140 },
        ],
      },
      {
        path: [
          { x: 80, y: 140 },
          { x: 220, y: 225 },
        ],
      },
    ],
  },

  M: {
    letter: "M",
    strokes: [
      {
        path: [
          { x: 55, y: 225 },
          { x: 55, y: 45 },
        ],
      },
      {
        path: [
          { x: 55, y: 45 },
          { x: 140, y: 145 },
        ],
      },
      {
        path: [
          { x: 140, y: 145 },
          { x: 225, y: 45 },
        ],
      },
      {
        path: [
          { x: 225, y: 45 },
          { x: 225, y: 225 },
        ],
      },
    ],
  },
};

export function getLetterGuide(letter: string): LetterGuide | undefined {
  return letterGuides[letter.trim().toUpperCase()];
}
