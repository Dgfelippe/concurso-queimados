import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorTutor } from './ErrorTutor';
import { questions } from '../data/questions';
import { getTopic } from '../data/topics';
import type { Attempt } from '../domain/types';

afterEach(cleanup);

const question = questions[0];
const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
const missedAttempt: Attempt = {
  id: 'attempt-1',
  questionId: question.id,
  selectedOption: wrongOption.id,
  correct: false,
  confidence: 'doubt',
  errorReason: 'misread',
  answeredAt: '2026-10-10T10:00:00.000Z',
  elapsedSeconds: 30,
  sessionId: 'session-1'
};

describe('ErrorTutor', () => {
  it('teaches the missed question with its topic, explanation and all alternatives', () => {
    render(<ErrorTutor attempts={[missedAttempt]} onAnswer={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Aula da questão/i })).toBeInTheDocument();
    expect(screen.getAllByText(question.prompt).length).toBeGreaterThan(1);
    expect(screen.getByText(getTopic(question.topicId)!.summary)).toBeInTheDocument();
    expect(screen.getAllByText(question.explanation).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pegadinha \/ li o enunciado rápido demais/i)).toBeInTheDocument();
    for (const option of question.options) expect(screen.getAllByText(option.note).length).toBeGreaterThan(0);
  });

  it('records a new answer from the lesson with a session identifier', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(<ErrorTutor attempts={[missedAttempt]} onAnswer={onAnswer} />);

    await user.click(screen.getByRole('button', { name: new RegExp(question.options.find((option) => option.id === question.correctOption)!.text) }));
    await user.click(screen.getByRole('button', { name: /Conferir resposta/i }));

    expect(onAnswer).toHaveBeenCalledWith(question.id, question.correctOption, true, undefined, 'sure', expect.any(String));
    expect(screen.getByText(/Acertou esta tentativa/i)).toBeInTheDocument();
  });

  it('shows the review status counts and keeps mastered questions available', () => {
    const masteredAttempts: Attempt[] = [
      missedAttempt,
      { ...missedAttempt, id: 'attempt-2', correct: true, selectedOption: question.correctOption, answeredAt: '2026-10-11T10:00:00.000Z', sessionId: 'session-2', errorReason: undefined },
      { ...missedAttempt, id: 'attempt-3', correct: true, selectedOption: question.correctOption, answeredAt: '2026-10-12T10:00:00.000Z', sessionId: 'session-3', errorReason: undefined }
    ];
    render(<ErrorTutor attempts={masteredAttempts} onAnswer={vi.fn()} />);

    expect(screen.getByText('Dominadas')).toBeInTheDocument();
    expect(screen.getByText(question.prompt, { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
