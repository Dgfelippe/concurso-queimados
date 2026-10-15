import { describe, expect, it } from 'vitest';
import { questions } from './questions';
import { syllabusTopics } from './topics';
import { validateQuestionBank } from './question-bank';
import { selectDistinctPracticeGroups } from './question-bank-expanded';

describe('expansão do banco local para simulados', () => {
  const expanded = questions.filter((question) => question.id.startsWith('local-variation-'));

  it('adds 1,008 contextualized questions across all 24 edital topics', () => {
    expect(expanded).toHaveLength(1008);
    for (const topic of syllabusTopics) {
      expect(expanded.filter((question) => question.topicId === topic.id)).toHaveLength(42);
    }
  });

  it('keeps unique identifiers, answer keys, options, explanations, and honest provenance', () => {
    expect(new Set(expanded.map((question) => question.id)).size).toBe(expanded.length);
    expect(validateQuestionBank(questions).valid).toBe(true);
    expect(expanded.every((question) => question.provenance.kind === 'original' && question.provenance.sourceId === 'local-training-variations')).toBe(true);
    expect(expanded.every((question) => question.practiceGroupId && question.options.some((option) => option.id === question.correctOption))).toBe(true);
  });

  it('selects at most one variation of each concept for a simulation', () => {
    const selection = selectDistinctPracticeGroups([...expanded, ...questions], 30);
    const groups = selection.map((question) => question.practiceGroupId ?? question.id);
    expect(selection).toHaveLength(30);
    expect(new Set(groups).size).toBe(30);
  });
});
