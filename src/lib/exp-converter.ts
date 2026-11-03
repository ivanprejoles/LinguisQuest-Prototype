
export function getMedalProgress(xp: number) {
  const safeXp = Math.max(0, Number(xp) || 0);

  if (safeXp >= 500) {
    return {
      medal: "gold" as const,
      nextMedalXp: null,
      xpIntoTier: 250,
    };
  }

  if (safeXp >= 250) {
    return {
      medal: "silver" as const,
      nextMedalXp: 500,
      xpIntoTier: safeXp - 250,
    };
  }

  return {
    medal: "bronze" as const,
    nextMedalXp: 250,
    xpIntoTier: safeXp,
  };
}
