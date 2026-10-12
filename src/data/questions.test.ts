import { describe, expect, it } from 'vitest';
import { questions } from './questions';
import { syllabusTopics } from './topics';
import { validateQuestionBank } from './question-bank';
import { studySources } from './sources';

describe('banco inicial do edital', () => {
  it('covers_every_syllabus_topic', () => {
    const bankTopics = new Set(questions.map((question) => question.topicId));
    expect([...syllabusTopics.map((topic) => topic.id)].every((topicId) => bankTopics.has(topicId))).toBe(true);
  });

  it('has_at_least_sixty_identified_questions_including_real_exams', () => {
    expect(questions.length).toBeGreaterThanOrEqual(60);
    const hasRealContestQuestions = questions.some((q) => q.provenance.kind === 'official' || q.provenance.kind === 'third_party');
    expect(hasRealContestQuestions).toBe(true);
    expect(questions.every((q) => Boolean(q.provenance.label && q.provenance.sourceId))).toBe(true);
  });

  it('has_four_unique_options_and_a_valid_answer_key', () => {
    for (const question of questions) {
      expect(question.options.map((option) => option.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(new Set(question.options.map((option) => option.text)).size).toBe(4);
      expect(question.options.some((option) => option.id === question.correctOption)).toBe(true);
    }
  });

  it('has_a_complete_simulation_distribution', () => {
    expect(questions.filter((question) => question.discipline === 'portuguese').length).toBeGreaterThanOrEqual(10);
    expect(questions.filter((question) => question.discipline === 'municipal_law').length).toBeGreaterThanOrEqual(5);
    expect(questions.filter((question) => question.discipline === 'specific_knowledge').length).toBeGreaterThanOrEqual(15);
  });

  it('rejects_missing_or_unverifiable_provenance', () => {
    expect(validateQuestionBank(questions).valid).toBe(true);
    expect(validateQuestionBank([{ ...questions[0], provenance: undefined }]).valid).toBe(false);
  });

  it('requires a direct source for each historical question and blocks false claims on original items', () => {
    const historical = questions.filter((question) => question.provenance.kind !== 'original');
    expect(historical.length).toBeGreaterThan(0);
    expect(historical.every((question) => Boolean(question.provenance.url && question.provenance.banca && question.provenance.contest && question.provenance.year))).toBe(true);
    expect(questions.filter((question) => question.provenance.kind === 'original').every((question) => !question.provenance.banca && !question.provenance.contest && !question.provenance.year)).toBe(true);
  });

  it('includes one source-verifiable IAN question and links the public proof sources', () => {
    const realQuestion = questions.find((question) => question.id === 'ian-2016-paty-excel-days');
    expect(realQuestion).toMatchObject({
      provenance: {
        kind: 'third_party', banca: 'IAN', year: 2016,
        contest: 'Câmara Municipal de Paty dos Alferes — Agente Administrativo',
        url: expect.stringContaining('qconcursos.com')
      },
      correctOption: 'B'
    });
    expect(studySources.some((source) => source.id === 'ian-2016-paty-pdf' && source.url?.endsWith('.pdf'))).toBe(true);
    expect(studySources.some((source) => source.id === 'ian-belford-2025' && source.type === 'official')).toBe(true);
  });

  it('adds one fully explained original question for every syllabus topic', () => {
    const added = questions.filter((question) => question.id.startsWith('supp-'));
    expect(added).toHaveLength(syllabusTopics.length);
    expect(new Set(added.map((question) => question.topicId))).toEqual(new Set(syllabusTopics.map((topic) => topic.id)));
    for (const question of added) {
      expect(new Set(question.options.map((option) => option.note)).size).toBe(4);
      expect(question.options.every((option) => option.note.length >= 30)).toBe(true);
      expect(question.explanation.length).toBeGreaterThan(40);
    }
  });

  it('rejects historical questions without a direct reference and original questions with exam claims', () => {
    const historicalWithoutUrl = { ...questions[0], provenance: { kind: 'official' as const, label: 'IAN', sourceId: 'ian-previous-exam', banca: 'IAN', contest: 'Exemplo', year: 2016 } };
    const originalWithClaim = { ...questions[0], provenance: { kind: 'original' as const, label: 'Treino autoral', sourceId: 'original-training', banca: 'IAN', year: 2016 } };
    expect(validateQuestionBank([historicalWithoutUrl]).valid).toBe(false);
    expect(validateQuestionBank([originalWithClaim]).valid).toBe(false);
  });
});
