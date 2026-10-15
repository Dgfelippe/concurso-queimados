import type { Question } from '../domain/types';
import { questions } from './questions';

export type CourseLevel = 1 | 2 | 3;

/**
 * Retorna uma prova fixa do banco embarcado no app. A escolha é determinística:
 * o aluno sempre pode continuar uma tentativa após recarregar a página e não
 * depende de uma chamada externa para receber as questões.
 */
export function getPreparedCourseAssessment(topicId: string, level: CourseLevel): Question[] {
  const pool = questions
    .filter((question) => question.topicId === topicId && question.provenance.kind === 'original')
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id, 'pt-BR'));

  if (pool.length < 10) return [];

  // Cada nível usa um bloco próprio de dez itens previamente carregados.
  const start = (level - 1) * 10;
  const selected = Array.from({ length: 10 }, (_, index) => pool[(start + index) % pool.length]);
  return selected.map((question, index) => ({
    ...question,
    id: `course-${topicId}-level-${level}-${String(index + 1).padStart(2, '0')}-${question.id}`
  }));
}
