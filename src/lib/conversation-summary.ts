
export type ConversationSummary = {
  sessionGoal: string;
  learnerLevel: string;
  preferences: string[];
  importantFacts: string[];
  vocabularyLearned: string[];
  correctionsAndDifficulties: string[];
  currentScenarioState: string;
  pendingTasks: string[];
};

/**
 * Small, intentional limits to prevent conversation memory
 * from growing into a second conversation transcript.
 */
export const SUMMARY_LIMITS = {
  sessionGoal: 100,
  learnerLevel: 24,
  currentScenarioState: 150,

  preferences: {
    items: 3,
    itemLength: 80,
  },

  importantFacts: {
    items: 3,
    itemLength: 100,
  },

  vocabularyLearned: {
    items: 8,
    itemLength: 60,
  },

  correctionsAndDifficulties: {
    items: 4,
    itemLength: 100,
  },

  pendingTasks: {
    items: 3,
    itemLength: 80,
  },
} as const;

const emptySummary = (): ConversationSummary => ({
  sessionGoal: "",
  learnerLevel: "",
  preferences: [],
  importantFacts: [],
  vocabularyLearned: [],
  correctionsAndDifficulties: [],
  currentScenarioState: "",
  pendingTasks: [],
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function cleanText(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function cleanList(
  value: unknown,
  maxItems: number,
  maxItemLength: number,
): string[] {
  if (!Array.isArray(value)) return [];

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const cleaned = cleanText(item, maxItemLength);

    if (!cleaned) continue;

    const key = cleaned.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);

    if (result.length >= maxItems) break;
  }

  return result;
}

/**
 * Combines new information with previous information.
 * Newer items take priority.
 */
function mergeLists(
  previous: string[],
  next: string[],
  maxItems: number,
  maxItemLength: number,
): string[] {
  return cleanList(
    [...next, ...previous],
    maxItems,
    maxItemLength,
  );
}

/**
 * Validates and limits a summary received from Gemini,
 * persisted storage, or an API request.
 */
export function sanitizeConversationSummary(
  value: unknown,
): ConversationSummary {
  if (!isRecord(value)) {
    return emptySummary();
  }

  return {
    sessionGoal: cleanText(
      value.sessionGoal,
      SUMMARY_LIMITS.sessionGoal,
    ),

    learnerLevel: cleanText(
      value.learnerLevel,
      SUMMARY_LIMITS.learnerLevel,
    ),

    preferences: cleanList(
      value.preferences,
      SUMMARY_LIMITS.preferences.items,
      SUMMARY_LIMITS.preferences.itemLength,
    ),

    importantFacts: cleanList(
      value.importantFacts,
      SUMMARY_LIMITS.importantFacts.items,
      SUMMARY_LIMITS.importantFacts.itemLength,
    ),

    vocabularyLearned: cleanList(
      value.vocabularyLearned,
      SUMMARY_LIMITS.vocabularyLearned.items,
      SUMMARY_LIMITS.vocabularyLearned.itemLength,
    ),

    correctionsAndDifficulties: cleanList(
      value.correctionsAndDifficulties,
      SUMMARY_LIMITS.correctionsAndDifficulties.items,
      SUMMARY_LIMITS.correctionsAndDifficulties.itemLength,
    ),

    currentScenarioState: cleanText(
      value.currentScenarioState,
      SUMMARY_LIMITS.currentScenarioState,
    ),

    pendingTasks: cleanList(
      value.pendingTasks,
      SUMMARY_LIMITS.pendingTasks.items,
      SUMMARY_LIMITS.pendingTasks.itemLength,
    ),
  };
}

/**
 * Merges a new Gemini summary into existing memory.
 *
 * Merge policy:
 * - Session goal: update when new non-empty information is supplied.
 * - Learner level: update when new non-empty information is supplied.
 * - Preferences, facts, vocabulary and difficulties: retain useful
 *   previous items, prioritizing new items.
 * - Scenario state: replace when explicitly supplied.
 * - Pending tasks: replace when explicitly supplied, including [].
 */
export function mergeConversationSummaries(
  previousValue: unknown,
  nextValue: unknown,
): ConversationSummary {
  const previous = sanitizeConversationSummary(previousValue);

  if (!isRecord(nextValue)) {
    return previous;
  }

  const next = sanitizeConversationSummary(nextValue);

  const hasField = (field: keyof ConversationSummary) =>
    Object.prototype.hasOwnProperty.call(nextValue, field);

  return {
    sessionGoal:
      next.sessionGoal || previous.sessionGoal,

    learnerLevel:
      next.learnerLevel || previous.learnerLevel,

    preferences: mergeLists(
      previous.preferences,
      next.preferences,
      SUMMARY_LIMITS.preferences.items,
      SUMMARY_LIMITS.preferences.itemLength,
    ),

    importantFacts: mergeLists(
      previous.importantFacts,
      next.importantFacts,
      SUMMARY_LIMITS.importantFacts.items,
      SUMMARY_LIMITS.importantFacts.itemLength,
    ),

    vocabularyLearned: mergeLists(
      previous.vocabularyLearned,
      next.vocabularyLearned,
      SUMMARY_LIMITS.vocabularyLearned.items,
      SUMMARY_LIMITS.vocabularyLearned.itemLength,
    ),

    correctionsAndDifficulties: mergeLists(
      previous.correctionsAndDifficulties,
      next.correctionsAndDifficulties,
      SUMMARY_LIMITS.correctionsAndDifficulties.items,
      SUMMARY_LIMITS.correctionsAndDifficulties.itemLength,
    ),

    currentScenarioState:
      hasField("currentScenarioState") &&
      typeof nextValue.currentScenarioState === "string"
        ? next.currentScenarioState
        : previous.currentScenarioState,

    pendingTasks:
      hasField("pendingTasks") &&
      Array.isArray(nextValue.pendingTasks)
        ? next.pendingTasks
        : previous.pendingTasks,
  };
}

export function createEmptyConversationSummary(
  sessionGoal = "",
): ConversationSummary {
  return {
    ...emptySummary(),
    sessionGoal: cleanText(
      sessionGoal,
      SUMMARY_LIMITS.sessionGoal,
    ),
  };
}
