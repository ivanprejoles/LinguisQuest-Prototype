
export interface GuidePoint {
  x: number;
  y: number;
}

export interface LetterStroke {
  path: GuidePoint[];
  direction?: "forward" | "reverse";
}

export interface LetterGuide {
  letter: string;
  strokes: LetterStroke[];
}
