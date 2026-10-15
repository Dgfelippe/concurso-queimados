export type Discipline = 'portuguese' | 'municipal_law' | 'specific_knowledge';
export type OptionId = 'A' | 'B' | 'C' | 'D';
export type QuestionSourceKind = 'official' | 'third_party' | 'original';

export interface QuestionOption {
  id: OptionId;
  text: string;
  note: string;
}

export interface QuestionProvenance {
  kind: QuestionSourceKind;
  label: string;
  sourceId: string;
  url?: string;
  banca?: string;
  contest?: string;
  year?: number;
}

export interface Question {
  id: string;
  /** Links contextual variations of one concept so a single exam can avoid repeats. */
  practiceGroupId?: string;
  discipline: Discipline;
  topicId: string;
  prompt: string;
  options: QuestionOption[];
  correctOption: OptionId;
  explanation: string;
  studyTip?: string;
  provenance: QuestionProvenance;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyProfile {
  id: 'main';
  studyMinutesPerDay: number;
  daysOfWeek: number[];
  confidence: Record<Discipline, number>;
  hasPreviousExperience: boolean;
  preferredStart: 'explanation' | 'questions';
  examDate: string;
  createdAt: string;
}

export type ErrorReason = 'unknown_content' | 'concept_confusion' | 'misread' | 'inattention' | 'between_options' | 'calculation';
export type ResponseConfidence = 'sure' | 'doubt' | 'guess';

export interface Attempt {
  id: string;
  questionId: string;
  selectedOption: OptionId;
  correct: boolean;
  confidence: ResponseConfidence;
  errorReason?: ErrorReason;
  answeredAt: string;
  elapsedSeconds: number;
  sessionId?: string;
  /** Retains generated questions so the error tutor can teach them after reload or sync. */
  questionSnapshot?: Question;
}

export interface Review {
  id: string;
  questionId: string;
  attemptId: string;
  dueAt: string;
  intervalDays: number;
  completedAt?: string;
}

export interface ReviewQueueItem {
  questionId: string;
  status: 'pending' | 'reviewing' | 'mastered';
  wrongCount: number;
  correctSessions: number;
  lastWrongAttempt: Attempt;
  lastAttemptAt: string;
  latestErrorReason?: ErrorReason;
}

export interface TopicStat {
  topicId: string;
  attempts: number;
  correct: number;
  distinctSessions: number;
  accuracy: number;
}

export interface StudyTask {
  id: string;
  kind: 'explanation' | 'practice' | 'review' | 'simulation';
  title: string;
  topicId?: string;
  discipline?: Discipline;
  estimatedMinutes: number;
  completed: boolean;
}

export interface StudyDay {
  date: string;
  tasks: StudyTask[];
}

export interface SimulationSession {
  id: string;
  questionIds: string[];
  mode: 'full' | 'discipline';
  startedAt: string;
  durationSeconds: number;
  answers: Record<string, OptionId>;
  finishedAt?: string;
  score?: number;
  correct?: number;
  totalQuestions?: number;
}

export interface DisciplineScore {
  discipline: Discipline;
  correct: number;
  total: number;
  points: number;
  maxPoints: number;
}

export interface SimulationResult {
  sessionId: string;
  totalCorrect: number;
  totalWrong: number;
  points: number;
  maxPoints: 100;
  byDiscipline: Record<Discipline, DisciplineScore>;
  elapsedSeconds: number;
  belowMinimum: boolean;
  zeroDiscipline: Discipline[];
}

export interface StoredAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  addedAt: string;
  sourceLabel: string;
  blob: Blob;
}

export interface StudyBackup {
  format: 'rumo-queimados-backup';
  version: 1;
  exportedAt: string;
  profile: StudyProfile | null;
  attempts: Attempt[];
  reviews: Review[];
  simulations: SimulationSession[];
}
