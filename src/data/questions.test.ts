import { describe, expect, it } from 'vitest';
import { questions } from './questions';
import { syllabusTopics } from './topics';
import { validateQuestionBank } from './question-bank';

describe('banco inicial do edital', () => {
  it('covers_every_syllabus_topic', () => {
    const bankTopics = new Set(questions.map((question) => question.topicId));
    expect([...syllabusTopics.map((topic) => topic.id)].every((topicId) => bankTopics.has(topicId))).toBe(true);
  });

  it('has_at_least_sixty_identified_training_questions', () => {
    expect(questions).toHaveLength(60);
    expect(questions.every((question) => question.provenance.kind === 'original')).toBe(true);
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
});
