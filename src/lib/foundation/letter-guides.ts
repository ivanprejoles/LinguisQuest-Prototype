
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

  m: {
    letter: "m",
    strokes: [
      {
        path: [
          { x: 65, y: 190 },
          { x: 65, y: 105 },
          { x: 105, y: 105 },
          { x: 140, y: 130 },
          { x: 140, y: 190 },
        ],
      },
      {
        path: [
          { x: 140, y: 130 },
          { x: 180, y: 105 },
          { x: 215, y: 130 },
          { x: 215, y: 190 },
        ],
      },
    ],
  },

  BA: {
  letter: "BA",
  strokes: [
    // B - vertical line
    {
      path: [
        { x: 30, y: 225 },
        { x: 30, y: 55 },
      ],
    },
    // B - upper curve
    {
      path: [
        { x: 30, y: 55 },
        { x: 85, y: 55 },
        { x: 120, y: 80 },
        { x: 120, y: 110 },
        { x: 95, y: 135 },
        { x: 30, y: 135 },
      ],
    },
    // B - lower curve
    {
      path: [
        { x: 30, y: 135 },
        { x: 95, y: 135 },
        { x: 125, y: 165 },
        { x: 125, y: 195 },
        { x: 90, y: 225 },
        { x: 30, y: 225 },
      ],
    },

    // A - left diagonal
    {
      path: [
        { x: 150, y: 225 },
        { x: 195, y: 55 },
      ],
    },
    // A - right diagonal
    {
      path: [
        { x: 195, y: 55 },
        { x: 255, y: 225 },
      ],
    },
    // A - crossbar
    {
      path: [
        { x: 170, y: 155 },
        { x: 235, y: 155 },
      ],
    },
  ],
},

Kk: {
  letter: "Kk",
  strokes: [
    // Uppercase K - vertical line
    {
      path: [
        { x: 35, y: 55 },
        { x: 35, y: 225 },
      ],
    },
    // Uppercase K - upper diagonal
    {
      path: [
        { x: 35, y: 140 },
        { x: 125, y: 55 },
      ],
    },
    // Uppercase K - lower diagonal
    {
      path: [
        { x: 35, y: 140 },
        { x: 125, y: 225 },
      ],
    },

    // Lowercase k - vertical line
    {
      path: [
        { x: 165, y: 55 },
        { x: 165, y: 225 },
      ],
    },
    // Lowercase k - upper diagonal
    {
      path: [
        { x: 165, y: 145 },
        { x: 255, y: 75 },
      ],
    },
    // Lowercase k - lower diagonal
    {
      path: [
        { x: 165, y: 145 },
        { x: 255, y: 225 },
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

export function getLetterGuide(target: string): LetterGuide[] {
  return target
    .trim()
    .split("")
    .map((letter) => letterGuides[letter])
    .filter((guide): guide is LetterGuide => Boolean(guide));
}
