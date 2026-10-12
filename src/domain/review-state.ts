import type { Attempt, ReviewQueueItem } from './types';

/**
 * Builds the review queue from the persisted answer history. A question is
 * only mastered after correct answers in two different, identified sessions.
 */
export function deriveReviewQueue(attempts: Attempt[]): ReviewQueueItem[] {
  const grouped = new Map<string, Attempt[]>();

  for (const attempt of attempts) {
    const questionAttempts = grouped.get(attempt.questionId) ?? [];
    questionAttempts.push(attempt);
    grouped.set(attempt.questionId, questionAttempts);
  }

  const items: ReviewQueueItem[] = [];

  for (const [questionId, questionAttempts] of grouped) {
    const ordered = [...questionAttempts].sort((left, right) =>
      left.answeredAt.localeCompare(right.answeredAt) || left.id.localeCompare(right.id)
    );
    let lastWrongAttempt: Attempt | undefined;
    let lastAttempt = ordered[0];
    let wrongCount = 0;
    let correctSessions = new Set<string>();

    for (const attempt of ordered) {
      lastAttempt = attempt;
      if (!attempt.correct) {
        wrongCount += 1;
        lastWrongAttempt = attempt;
        correctSessions = new Set<string>();
      } else if (attempt.sessionId) {
        correctSessions.add(attempt.sessionId);
      }
    }

    if (!lastWrongAttempt || !lastAttempt) continue;

    const status = correctSessions.size >= 2
      ? 'mastered'
      : lastAttempt.correct
        ? 'reviewing'
        : 'pending';

    items.push({
      questionId,
      status,
      wrongCount,
      correctSessions: correctSessions.size,
      lastWrongAttempt,
      lastAttemptAt: lastAttempt.answeredAt,
      latestErrorReason: lastWrongAttempt.errorReason
    });
  }

  return items.sort((left, right) => right.lastAttemptAt.localeCompare(left.lastAttemptAt));
}
