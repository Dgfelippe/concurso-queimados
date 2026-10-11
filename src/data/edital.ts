import type { Discipline } from '../domain/types';

export const contest = {
  title: 'Concurso Público 01/2026 — Prefeitura de Queimados/RJ',
  role: 'Agente Administrativo',
  education: 'Ensino médio completo',
  board: 'Instituto de Avaliação Nacional (IAN)',
  examDate: '2026-11-22',
  startTime: '14:00',
  endTime: '17:00',
  durationMinutes: 180,
  questionsCount: 30,
  options: ['A', 'B', 'C', 'D'] as const,
  minimumScore: 50,
  examNoticeUrl: 'https://portal.ian.org.br/edital/ver/53'
};

export const disciplineRules: Record<Discipline, { label: string; questionCount: number; pointsPerQuestion: number; maxPoints: number }> = {
  portuguese: { label: 'Língua Portuguesa', questionCount: 10, pointsPerQuestion: 2, maxPoints: 20 },
  municipal_law: { label: 'Legislação Municipal', questionCount: 5, pointsPerQuestion: 1, maxPoints: 5 },
  specific_knowledge: { label: 'Conhecimentos Específicos', questionCount: 15, pointsPerQuestion: 5, maxPoints: 75 }
};

export const editalSources = {
  consultedAt: '2026-10-11',
  officialNoticeUrl: 'https://portal.ian.org.br/edital/ver/53',
  warning: 'Confira retificações, convocação, local e horário nos canais oficiais da banca e da Prefeitura.'
};
