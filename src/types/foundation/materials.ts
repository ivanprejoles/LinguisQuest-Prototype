export type ActivityType =
  | "sentenceBuilder"
  | "tracing"
  | "multipleChoice"
  | "tapWhatYouHear"
  | "fillInTheBlank"
  | "matching";

export type AudioMode = "recorded" | "speech";

// RIGHT
// SENTENCE BUILDER
export interface SentenceBuilderPayload {
  type: "sentenceBuilder";
  question: string;
  scrambledWordBank: string[];
  correctSentenceArray: string[];
  audioType: AudioMode;
  audioUrl: "__SPEECH__" | null;
  audioFile: File | null;
  isValid: boolean;
}

// LETTER TRACING
export interface LetterTracingPayload {
  type: "tracing";
  targetLetter: string;
  question: string;
  isValid: boolean;
}

// RIGHT
// FILL IN THE BLANK
export interface FillInTheBlankOption {
  id: string;
  word: string;
  isCorrect: boolean;
}

export interface FillInTheBlankPayload {
  type: "fillInTheBlank";
  fullSentence: string;
  audioType: AudioMode;
  audioUrl: "__SPEECH__" | null;
  mainAudio: File | null;
  blankedWordIndex: number | null;
  targetWord: string;
  options: FillInTheBlankOption[];
  correctAnswerId: string;
  isValid: boolean;
}

// TAP WHAT YOU HEAR
export interface TapWhatYouHearPayload {
  type: "tapWhatYouHear";
  question: string;
  targetSentence: string;
  audioType: AudioMode;
  audioUrl: "__SPEECH__" | null;
  audioFile: File | null;
  wordBank: string[];
  correctSequence: string[];
  isValid: boolean;
}

// MULTIPLE CHOICE
export interface MultipleChoiceOption {
  id: string;
  text: string;
  imageUrl: string | null;
  imageFileId: string | null;
}

export interface MultipleChoicePayload {
  type: "multipleChoice";
  question: string;
  options: MultipleChoiceOption[];
  correctAnswer: string;
  isValid: boolean;
}

// MATCHING PAIRS
export interface MatchingPairItem {
  id: string;
  sourceText: string; // Target language word/phrase
  targetText: string; // Translation (e.g., English)
}

export interface MatchingPairsPayload {
  type: "matching";
  question: string;
  pairs: Array<{
    id: string;
    sourceText: string;
    targetText: string;
  }>;
  isValid: boolean;
}

// Discriminated union for all possible payloads
export type ActivityPayload =
  | SentenceBuilderPayload
  | LetterTracingPayload
  | FillInTheBlankPayload
  | TapWhatYouHearPayload
  // extend as you create the remaining payloads:
  // | MultipleChoicePayload
  // | TapWhatYouHearPayload
  // | FillInTheBlankPayload
  | { type: ActivityType; isValid: boolean; [key: string]: any };