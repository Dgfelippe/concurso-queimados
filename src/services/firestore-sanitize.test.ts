import { describe, expect, it } from 'vitest';
import { firestoreSafe } from './firestore-sanitize';

describe('serialização para Firestore', () => {
  it('omits undefined optional fields at every object depth', () => {
    expect(firestoreSafe({
      id: 'attempt-1',
      errorReason: undefined,
      questionSnapshot: { id: 'question-1', note: undefined }
    })).toEqual({ id: 'attempt-1', questionSnapshot: { id: 'question-1' } });
  });

  it('preserves arrays and replaces unsupported undefined array entries with null', () => {
    expect(firestoreSafe({ values: ['first', undefined, { extra: undefined }] })).toEqual({
      values: ['first', null, {}]
    });
  });

  it('preserves dates', () => {
    const date = new Date('2026-10-14T00:00:00Z');
    expect(firestoreSafe({ date }).date).toBe(date);
  });
});
