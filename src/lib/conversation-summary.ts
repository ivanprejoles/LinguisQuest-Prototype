
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

export const SUMMARY_LIMITS = {
  textLength: 500,
  listItems: 20,
  listItemLength: 200,
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

// Explicitly use number so callers can pass 500, 200, or other limits.
function cleanText(
  value: unknown,
  maxLength: number = SUMMARY_LIMITS.textLength,
): string {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    const cleaned = cleanText(item, SUMMARY_LIMITS.listItemLength);

    if (!cleaned) continue;

    const key = cleaned.toLocaleLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);

    if (result.length >= SUMMARY_LIMITS.listItems) break;
  }

  return result;
}

function mergeLists(
  previous: string[],
  next: string[],
  limit: number = SUMMARY_LIMITS.listItems,
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  // Prioritize newly generated information.
  for (const item of [...next, ...previous]) {
    const cleaned = cleanText(item, SUMMARY_LIMITS.listItemLength);

    if (!cleaned) continue;

    const key = cleaned.toLocaleLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);

    if (result.length >= limit) break;
  }

  return result;
}

/**
 * Validates and bounds a summary returned by Gemini or received
 * from the client. All input is treated as untrusted.
 */
export function sanitizeConversationSummary(
  value: unknown,
): ConversationSummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return emptySummary();
  }

  const data = value as Record<string, unknown>;

  return {
    sessionGoal: cleanText(data.sessionGoal),
    learnerLevel: cleanText(data.learnerLevel),
    preferences: cleanList(data.preferences),
    importantFacts: cleanList(data.importantFacts),
    vocabularyLearned: cleanList(data.vocabularyLearned),
    correctionsAndDifficulties: cleanList(
      data.correctionsAndDifficulties,
    ),
    currentScenarioState: cleanText(data.currentScenarioState),
    pendingTasks: cleanList(data.pendingTasks),
  };
}

/**
 * Keeps useful learning history while allowing the current scenario
 * and pending tasks to reflect Gemini's latest understanding.
 */
export function mergeConversationSummaries(
  previousValue: unknown,
  nextValue: unknown,
): ConversationSummary {
  const previous = sanitizeConversationSummary(previousValue);
  const next = sanitizeConversationSummary(nextValue);

  const nextIsObject =
    nextValue !== null &&
    typeof nextValue === "object" &&
    !Array.isArray(nextValue);

  const nextHasPendingTasks =
    nextIsObject &&
    Array.isArray(
      (nextValue as Record<string, unknown>).pendingTasks,
    );

  return {
    sessionGoal: next.sessionGoal || previous.sessionGoal,
    learnerLevel: next.learnerLevel || previous.learnerLevel,

    preferences: mergeLists(
      previous.preferences,
      next.preferences,
    ),

    importantFacts: mergeLists(
      previous.importantFacts,
      next.importantFacts,
    ),

    vocabularyLearned: mergeLists(
      previous.vocabularyLearned,
      next.vocabularyLearned,
    ),

    correctionsAndDifficulties: mergeLists(
      previous.correctionsAndDifficulties,
      next.correctionsAndDifficulties,
    ),

    currentScenarioState:
      next.currentScenarioState || previous.currentScenarioState,

    pendingTasks: nextHasPendingTasks
      ? next.pendingTasks
      : previous.pendingTasks,
  };
}

export function createEmptyConversationSummary(
  sessionGoal = "",
): ConversationSummary {
  return {
    ...emptySummary(),
    sessionGoal: cleanText(sessionGoal),
  };
}
