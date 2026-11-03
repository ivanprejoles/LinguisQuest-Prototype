export type SrsTimeUnit = "seconds" | "minutes" | "hours" | "days";

export interface SrsConfig {
  baseInterval: number;
  baseUnit: SrsTimeUnit;

  fastCompletionThresholdMs: number;
  fastWinMultiplier: number;
  normalWinMultiplier: number;

  playCountMultiplier: number;
  wrongAttemptMultiplier: number;

  minimumInterval: number;
  minimumUnit: SrsTimeUnit;

  maximumInterval: number;
  maximumUnit: SrsTimeUnit;
}

export const DEFAULT_SRS_CONFIG: SrsConfig = {
  // Default first interval: 1 day.
  baseInterval: 1,
  baseUnit: "seconds",

  fastCompletionThresholdMs: 45_000,
  fastWinMultiplier: 2.5,
  normalWinMultiplier: 1.5,

  // Each additional play increases the interval by 15%.
  playCountMultiplier: 1.15,

  // Each wrong attempt reduces the interval by 30%.
  wrongAttemptMultiplier: 0.7,

  minimumInterval: 1,
  minimumUnit: "minutes",

  maximumInterval: 30,
  maximumUnit: "days",
};

const UNIT_IN_MS: Record<SrsTimeUnit, number> = {
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

export function toMilliseconds(
  value: number,
  unit: SrsTimeUnit
): number {
  return value * UNIT_IN_MS[unit];
}

export interface SrsScoreInput {
  stageId: string;
  durationMs: number;
  playCount: number;
  wrongAttempts: number;
  updatedAt: string | Date;
}

export interface SrsSchedule {
  intervalMs: number;
  nextReviewAt: number;
  isDue: boolean;
}

export function calculateSrsSchedule(
  score: SrsScoreInput,
  now = Date.now(),
  config: SrsConfig = DEFAULT_SRS_CONFIG
): SrsSchedule {
  const originTime = new Date(score.updatedAt).getTime();

  if (!Number.isFinite(originTime)) {
    throw new Error(`Invalid updatedAt for stage ${score.stageId}`);
  }

  const baseIntervalMs = toMilliseconds(
    config.baseInterval,
    config.baseUnit
  );

  const minimumIntervalMs = toMilliseconds(
    config.minimumInterval,
    config.minimumUnit
  );

  const maximumIntervalMs = toMilliseconds(
    config.maximumInterval,
    config.maximumUnit
  );

  const isFastCompletion =
    score.durationMs < config.fastCompletionThresholdMs;

  const performanceMultiplier = isFastCompletion
    ? config.fastWinMultiplier
    : config.normalWinMultiplier;

  const safePlayCount = Math.max(1, score.playCount);
  const safeWrongAttempts = Math.max(0, score.wrongAttempts);

  const playMultiplier = Math.pow(
    config.playCountMultiplier,
    safePlayCount - 1
  );

  const mistakeMultiplier = Math.pow(
    config.wrongAttemptMultiplier,
    safeWrongAttempts
  );

  const calculatedInterval =
    baseIntervalMs *
    performanceMultiplier *
    playMultiplier *
    mistakeMultiplier;

  const intervalMs = Math.min(
    maximumIntervalMs,
    Math.max(minimumIntervalMs, calculatedInterval)
  );

  const nextReviewAt = originTime + intervalMs;

  return {
    intervalMs,
    nextReviewAt,
    isDue: nextReviewAt <= now,
  };
}