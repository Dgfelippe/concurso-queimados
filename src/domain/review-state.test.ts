import { describe, expect, it } from 'vitest';
import type { Attempt } from './types';
import { deriveReviewQueue } from './review-state';

const attempt = (id: string, correct: boolean, sessionId?: string, errorReason?: Attempt['errorReason']): Attempt => ({
  id,
  questionId: 'q-1',
  selectedOption: correct ? 'A' : 'B',
  correct,
  confidence: 'sure',
  errorReason,
  answeredAt: `2026-10-${id.padStart(2, '0')}T10:00:00.000Z`,
  elapsedSeconds: 0,
  sessionId
});

describe('deriveReviewQueue', () => {
  it('keeps a question after its first wrong answer', () => {
    const [item] = deriveReviewQueue([attempt('01', false, 's1', 'misread')]);
    expect(item).toMatchObject({ questionId: 'q-1', status: 'pending', wrongCount: 1, correctSessions: 0, latestErrorReason: 'misread' });
    expect(item.lastWrongAttempt?.id).toBe('01');
  });

  it('keeps a corrected question in review until a second distinct session', () => {
    const [item] = deriveReviewQueue([attempt('01', false, 's1'), attempt('02', true, 's2')]);
    expect(item).toMatchObject({ status: 'reviewing', wrongCount: 1, correctSessions: 1 });
  });

  it('does not count repeated correct answers in one session twice', () => {
    const [item] = deriveReviewQueue([
      attempt('01', false, 's1'),
      attempt('02', true, 's2'),
      attempt('03', true, 's2')
    ]);
    expect(item).toMatchObject({ status: 'reviewing', correctSessions: 1 });
  });

  it('marks mastery after correct answers in two distinct sessions', () => {
    const [item] = deriveReviewQueue([
      attempt('01', false, 's1'),
      attempt('02', true, 's2'),
      attempt('03', true, 's3')
    ]);
    expect(item).toMatchObject({ status: 'mastered', correctSessions: 2 });
  });

  it('reopens a mastered question after another wrong answer', () => {
    const [item] = deriveReviewQueue([
      attempt('01', false, 's1'),
      attempt('02', true, 's2'),
      attempt('03', true, 's3'),
      attempt('04', false, 's4', 'inattention')
    ]);
    expect(item).toMatchObject({ status: 'pending', correctSessions: 0, wrongCount: 2, latestErrorReason: 'inattention' });
  });

  it('keeps legacy errors but does not count correct answers without a session', () => {
    const [item] = deriveReviewQueue([attempt('01', false), attempt('02', true)]);
    expect(item).toMatchObject({ status: 'reviewing', wrongCount: 1, correctSessions: 0 });
  });

  it('returns items ordered by most recent attempt', () => {
    const result = deriveReviewQueue([
      { ...attempt('01', false, 's1'), questionId: 'q-old' },
      { ...attempt('03', false, 's2'), questionId: 'q-new' }
    ]);
    expect(result.map((item) => item.questionId)).toEqual(['q-new', 'q-old']);
  });
});
