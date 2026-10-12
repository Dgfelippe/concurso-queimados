import type { Discipline } from '../domain/types';

export interface ContestRoleInfo {
  role: string;
  department: string;
  workloadHours: number;
  salary: number;
  immediateVacancies: number;
  vacanciesPcd: number;
  vacanciesCotas: number;
  vacanciesAmpla: number;
  hasCr: boolean;
  examDate: string;
  examShift: 'manhã' | 'tarde';
  examTime: string;
}

export const contest = {
  title: 'Concurso Público 01/2026 — Prefeitura Municipal de Queimados/RJ',
  board: 'Instituto de Avaliação Nacional (IAN)',
  boardUrl: 'https://www.ian.org.br',
  officialNoticeUrl: 'https://portal.ian.org.br/edital/ver/53',
  totalVacanciesAllRoles: 463,
  educationRequired: 'Ensino Médio Completo',
  
  // Dados específicos do cargo em foco: Agente Administrativo
  role: 'Agente Administrativo',
  department: 'Secretaria Municipal de Administração (SEMAD)',
  workload: '40 horas semanais',
  baseSalary: 3422.60,
  benefits: 'Auxílio Transporte e Auxílio Saúde (item 2.1.1 do Edital)',
  totalVacancies: 54,
  vacanciesAmpla: 40,
  vacanciesPcd: 3,
  vacanciesCotas: 11,
  hasCr: true,
  
  // Datas e horários oficiais
  registrationStart: '2026-09-09',
  registrationEnd: '2026-10-13',
  paymentDeadline: '2026-10-14',
  registrationFee: 120.00,
  pixAvailable: true,
  
  examDate: '2026-11-22',
  examDayOfWeek: 'Domingo',
  examShift: 'Tarde',
  startTime: '14:00',
  endTime: '17:00',
  gatesOpen: '13:00',
  gatesClose: '14:00',
  durationMinutes: 180,
  minimumStayMinutes: 60,
  takeNotebookMinutes: 120,
  
  // Estrutura da prova
  questionsCount: 30,
  options: ['A', 'B', 'C', 'D'] as const,
  minimumScore: 50,
  maxScore: 100,
  criticalRules: [
    'É eliminado quem fizer menos de 50 pontos no total (50%).',
    'É ELIMINADO quem obtiver nota ZERO em qualquer uma das três disciplinas!',
    'Caneta permitida: esferográfica de TUBO TRANSPARENTE, tinta azul ou preta.',
    'Documento exigido: ORIGINAL físico com foto (RG, CNH, CTPS). NÃO será aceito documento digital no celular.',
    'Pode levar o caderno de questões somente após 2 (duas) horas de prova.'
  ]
};

export const disciplineRules: Record<Discipline, { label: string; questionCount: number; pointsPerQuestion: number; maxPoints: number; weightPct: number }> = {
  portuguese: { 
    label: 'Língua Portuguesa', 
    questionCount: 10, 
    pointsPerQuestion: 2.0, 
    maxPoints: 20,
    weightPct: 20
  },
  municipal_law: { 
    label: 'Legislação Municipal', 
    questionCount: 5, 
    pointsPerQuestion: 1.0, 
    maxPoints: 5,
    weightPct: 5
  },
  specific_knowledge: { 
    label: 'Conhecimentos Específicos', 
    questionCount: 15, 
    pointsPerQuestion: 5.0, 
    maxPoints: 75,
    weightPct: 75
  }
};

export const scheduleTimeline = [
  { date: '08/09/2026', event: 'Publicação do Edital de Abertura nº 01/2026', phase: 'past' },
  { date: '09/09 a 13/10/2026', event: 'Período oficial de inscrições no site www.ian.org.br', phase: 'past' },
  { date: '14/10/2026', event: 'Último dia para pagamento do boleto bancário / PIX', phase: 'current' },
  { date: '23/10/2026', event: 'Divulgação das inscrições deferidas e lista PcD / Cotas', phase: 'upcoming' },
  { date: '30/10/2026', event: 'Homologação final das inscrições confirmadas', phase: 'upcoming' },
  { date: '17/11/2026', event: 'Publicação do Edital de Convocação com locais e salas de prova', phase: 'upcoming' },
  { date: '20/11/2026', event: 'Aplicação da prova para cargos de Saúde e Educação (Feriado Nacional)', phase: 'upcoming' },
  { date: '22/11/2026', event: 'PROVA OBJETIVA: Agente Administrativo (Tarde - 14h às 17h)', phase: 'highlight' },
  { date: '23/11/2026', event: 'Divulgação do Gabarito Preliminar da Prova Objetiva', phase: 'upcoming' },
  { date: '24 e 25/11/2026', event: 'Prazo para envio de recursos contra gabarito e questões', phase: 'upcoming' },
  { date: '18/12/2026', event: 'Divulgação da Classificação Preliminar e Gabarito Definitivo', phase: 'upcoming' },
  { date: '30/12/2026', event: 'Classificação Final da Prova Objetiva', phase: 'upcoming' }
];

export const editalSources = {
  consultedAt: '2026-10-11',
  officialNoticeUrl: 'https://portal.ian.org.br/edital/ver/53',
  warning: 'Resumo para estudo. Confira o edital de abertura, anexos, emendas e retificações na página oficial do concurso.'
};
