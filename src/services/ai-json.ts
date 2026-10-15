export class InvalidAiJsonError extends Error {
  constructor() {
    super('Não foi possível interpretar as questões após uma nova tentativa. Tente novamente ou inicie com o banco local.');
    this.name = 'InvalidAiJsonError';
  }
}

/** Accepts JSON returned directly, inside a Markdown fence, or surrounded by brief text. */
export function parseAiJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    if (start < 0) throw new InvalidAiJsonError();

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < cleaned.length; index += 1) {
      const char = cleaned[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === '\\') escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === '{') depth += 1;
      else if (char === '}') {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(start, index + 1));
          } catch {
            throw new InvalidAiJsonError();
          }
        }
      }
    }
    throw new InvalidAiJsonError();
  }
}
