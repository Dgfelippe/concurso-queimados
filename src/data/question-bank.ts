import { z } from 'zod';
import type { Question } from '../domain/types';

const questionSchema = z.object({
  id: z.string().min(1),
  discipline: z.enum(['portuguese', 'municipal_law', 'specific_knowledge']),
  topicId: z.string().min(1),
  prompt: z.string().min(10),
  options: z.array(z.object({ id: z.enum(['A', 'B', 'C', 'D', 'E']), text: z.string().min(1), note: z.string().min(1) })).min(4).max(5),
  correctOption: z.enum(['A', 'B', 'C', 'D', 'E']),
  explanation: z.string().min(1),
  provenance: z.object({ kind: z.enum(['official', 'third_party', 'original']), label: z.string().min(1), sourceId: z.string().min(1), url: z.string().url().optional(), banca: z.string().optional(), contest: z.string().optional(), year: z.number().optional() }),
  difficulty: z.enum(['easy', 'medium', 'hard'])
}).superRefine((question, context) => {
  const expectedOptionIds = ['A', 'B', 'C', 'D', 'E'].slice(0, question.options.length);
  if (question.options.some((option, index) => option.id !== expectedOptionIds[index])) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'As alternativas precisam estar identificadas em sequência de A até E.' });
  }
  const provenance = question.provenance;
  if (provenance.kind !== 'original' && (!provenance.url || !provenance.banca || !provenance.contest || !provenance.year)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['provenance'], message: 'Questão histórica exige URL, banca, concurso e ano verificáveis.' });
  }
  if (provenance.kind === 'original' && (provenance.banca || provenance.contest || provenance.year)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['provenance'], message: 'Questão autoral não pode alegar banca, concurso ou ano de aplicação.' });
  }
});

export interface QuestionBankValidation {
  valid: boolean;
  errors: string[];
}

export function validateQuestionBank(value: unknown): QuestionBankValidation {
  if (!Array.isArray(value)) return { valid: false, errors: ['O banco precisa ser uma lista de questões.'] };
  const errors: string[] = [];
  value.forEach((item, index) => {
    const parsed = questionSchema.safeParse(item);
    if (!parsed.success) errors.push(`Questão ${index + 1}: origem, gabarito ou conteúdo incompleto.`);
    else if (!parsed.data.options.some((option) => option.id === parsed.data.correctOption)) errors.push(`Questão ${index + 1}: gabarito fora das alternativas.`);
  });
  const ids = value.filter((item): item is Question => typeof item === 'object' && item !== null && 'id' in item).map((item) => item.id);
  if (new Set(ids).size !== ids.length) errors.push('Há identificadores de questão repetidos.');
  return { valid: errors.length === 0, errors };
}
