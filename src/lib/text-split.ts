export function splitTextIntoChunks(text: string, maxLength = 180): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];

  const chunks: string[] = [];
  let current = "";

  const addPart = (part: string) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    if (trimmed.length <= maxLength) {
      const combined = current ? `${current} ${trimmed}` : trimmed;

      if (combined.length <= maxLength) {
        current = combined;
      } else {
        if (current) chunks.push(current);
        current = trimmed;
      }

      return;
    }

    // If a sentence is too long, split it at clause boundaries.
    const clauses = trimmed.split(/(?<=[,;:])\s+/);

    for (const clause of clauses) {
      if (clause.length <= maxLength) {
        const combined = current ? `${current} ${clause}` : clause;

        if (combined.length <= maxLength) {
          current = combined;
        } else {
          if (current) chunks.push(current);
          current = clause;
        }

        continue;
      }

      // Last resort: split at word boundaries.
      const words = clause.split(/\s+/);

      for (const word of words) {
        const combined = current ? `${current} ${word}` : word;

        if (combined.length <= maxLength) {
          current = combined;
        } else {
          if (current) chunks.push(current);
          current = word;
        }
      }
    }
  };

  for (const sentence of sentences) {
    addPart(sentence);
  }

  if (current) chunks.push(current);

  return chunks;
}