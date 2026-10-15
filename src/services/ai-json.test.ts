import { describe, expect, it } from 'vitest';
import { InvalidAiJsonError, parseAiJson } from './ai-json';

const payload = { questions: [{ prompt: 'Uma questão de treino.' }] };
const json = JSON.stringify(payload);

describe('leitura da resposta estruturada da IA', () => {
  it('reads direct JSON', () => {
    expect(parseAiJson(json)).toEqual(payload);
  });

  it('reads JSON inside a Markdown code fence', () => {
    expect(parseAiJson(`\`\`\`json\n${json}\n\`\`\``)).toEqual(payload);
  });

  it('extracts a complete JSON object surrounded by short text', () => {
    expect(parseAiJson(`Resultado:\n${json}\nFim.`)).toEqual(payload);
  });

  it('rejects empty, incomplete, or invalid JSON clearly', () => {
    for (const text of ['', '{"questions":', 'Resposta indisponível']) {
      expect(() => parseAiJson(text)).toThrow(InvalidAiJsonError);
    }
  });
});
