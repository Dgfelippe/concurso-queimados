import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { questions } from '../data/questions';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => localStorage.clear());

describe('navegação principal', () => {
  it('renders_navigation_destinations', () => {
    render(<MemoryRouter initialEntries={['/questoes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    const sidebar = within(screen.getByRole('complementary', { name: 'Navegação principal' }));
    expect(sidebar.getByRole('link', { name: 'Painel' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Simulados' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Caderno de erros' })).toBeInTheDocument();
  });

  it('organizes official documents, question banks, lessons and paid material in the study library', () => {
    render(<MemoryRouter initialEntries={['/fontes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Documentos oficiais e legislação' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bancos de questões e provas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Videoaulas gratuitas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plataformas e limites do plano grátis' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Material pago' })).toBeInTheDocument();
    expect(screen.getByText(/15 questões e 5 comentários de professor por dia/)).toBeInTheDocument();
    expect(screen.getByText(/Não é uma fonte 100% gratuita/)).toBeInTheDocument();
    const videoLinks = screen.getAllByRole('link', { name: /Assistir aula/ });
    expect(videoLinks.some((link) => link.getAttribute('href') === 'https://www.youtube.com/watch?v=GXyFAA5GZuU')).toBe(true);
  });

  it('shows_reference_style_landing_sections', () => {
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /Estude para Queimados com método/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Simulado com cara de prova/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Errou\? Ótimo\. É aqui que se aprende/i })).toBeInTheDocument();
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('score-portuguese')))).toHaveTextContent('20 pts');
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('score-specific_knowledge')))).toHaveTextContent('75 pts');
  });

  it('can_switch_between_reference_light_and_dark_themes', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Mudar para tema claro' }));
    expect(screen.getByTestId('app-shell')).toHaveAttribute('data-theme', 'light');
  });

  it('can_switch_theme_while_studying', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/questoes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Mudar para tema claro' }));
    expect(screen.getByTestId('app-shell')).toHaveAttribute('data-theme', 'light');
  });

  it('pauses_the_simulation_with_a_visible_resume_state', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/simulados']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /Iniciar simulado completo/i }));
    await user.click(screen.getByRole('button', { name: /Pausar/i }));
    expect(screen.getByText('SIMULADO PAUSADO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retomar prova' })).toBeInTheDocument();
    const firstOption = screen.getAllByRole('button').find((button) => button.closest('.option-list'));
    expect(firstOption).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Retomar prova' }));
    expect(screen.queryByText('SIMULADO PAUSADO')).not.toBeInTheDocument();
    expect(firstOption).toBeEnabled();
  });

  it('accepts_keyboard_answers_and_confirmation_in_practice', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/questoes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    const options = screen.getAllByRole('button').filter((button) => button.closest('.option-list'));
    await user.keyboard('a');
    expect(options[0]).toHaveClass('selected');
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Resposta Correta|Não foi dessa vez/)).toBeInTheDocument();
  });

  it('persists a stable session identifier with practice attempts', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/questoes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    const question = questions[0];
    const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
    await user.click(screen.getByText(wrongOption.text));
    await user.click(screen.getByRole('button', { name: 'Confirmar Resposta' }));

    const attempts = JSON.parse(localStorage.getItem('rq-attempts') || '[]');
    expect(attempts[0].sessionId).toEqual(expect.any(String));
    expect(attempts[0].sessionId.length).toBeGreaterThan(0);
  });

  it('persists one simulation session identifier with submitted answers', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MemoryRouter initialEntries={['/simulados']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /Iniciar simulado completo/i }));
    const firstOptionList = document.querySelector('.option-list');
    const firstOption = firstOptionList?.querySelector('button');
    expect(firstOption).toBeTruthy();
    await user.click(firstOption!);
    await user.click(screen.getByRole('button', { name: 'Entregar Prova e Ver Gabarito' }));

    const attempts = JSON.parse(localStorage.getItem('rq-attempts') || '[]');
    expect(attempts).toHaveLength(1);
    expect(attempts[0].sessionId).toEqual(expect.any(String));
  });

  it('keeps an old wrong answer in the error tutor after a later correct answer', () => {
    const question = questions[0];
    const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
    localStorage.setItem('rq-attempts', JSON.stringify([
      {
        id: 'old-wrong', questionId: question.id, selectedOption: wrongOption.id,
        correct: false, confidence: 'sure', errorReason: 'misread',
        answeredAt: '2026-10-10T10:00:00.000Z', elapsedSeconds: 10, sessionId: 'session-old'
      },
      {
        id: 'new-correct', questionId: question.id, selectedOption: question.correctOption,
        correct: true, confidence: 'sure',
        answeredAt: '2026-10-11T10:00:00.000Z', elapsedSeconds: 10, sessionId: 'session-new'
      }
    ]));

    render(<MemoryRouter initialEntries={['/erros']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    expect(screen.getAllByText(question.explanation).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em revisão').length).toBeGreaterThan(0);
  });

  it('retains the error across reloads until mastery, then reopens after a new error', async () => {
    const user = userEvent.setup();
    const question = questions[0];
    const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
    render(<MemoryRouter initialEntries={['/questoes']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);

    await user.click(screen.getByText(wrongOption.text));
    await user.click(screen.getByRole('button', { name: 'Confirmar Resposta' }));
    const firstAttempt = JSON.parse(localStorage.getItem('rq-attempts') || '[]')[0];
    await user.click(screen.getByRole('link', { name: 'Caderno de erros' }));
    expect(screen.getByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    const correctText = question.options.find((option) => option.id === question.correctOption)!.text;
    const retryArea = within(document.querySelector('.review-retry-section')!);

    await user.click(retryArea.getByRole('button', { name: new RegExp(correctText) }));
    await user.click(retryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Em revisão').length).toBeGreaterThan(0);
    const afterFirstRetry = JSON.parse(localStorage.getItem('rq-attempts') || '[]');
    expect(afterFirstRetry[1].sessionId).not.toBe(firstAttempt.sessionId);

    cleanup();
    render(<MemoryRouter initialEntries={['/erros']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    const secondRetryArea = within(document.querySelector('.review-retry-section')!);
    await user.click(secondRetryArea.getByRole('button', { name: new RegExp(correctText) }));
    await user.click(secondRetryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Dominada').length).toBeGreaterThan(0);
    const afterSecondRetry = JSON.parse(localStorage.getItem('rq-attempts') || '[]');
    expect(afterSecondRetry[2].sessionId).not.toBe(afterFirstRetry[1].sessionId);

    cleanup();
    render(<MemoryRouter initialEntries={['/erros']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    const finalRetryArea = within(document.querySelector('.review-retry-section')!);
    await user.click(finalRetryArea.getByRole('button', { name: new RegExp(wrongOption.text) }));
    await user.click(finalRetryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem('rq-attempts') || '[]')).toHaveLength(4);
  });

  it('keeps the simulated exam distribution, weighting, and elimination thresholds', async () => {
    const { disciplineRules } = await import('../data/edital');
    expect(disciplineRules.portuguese).toMatchObject({ questionCount: 10, pointsPerQuestion: 2, maxPoints: 20 });
    expect(disciplineRules.municipal_law).toMatchObject({ questionCount: 5, pointsPerQuestion: 1, maxPoints: 5 });
    expect(disciplineRules.specific_knowledge).toMatchObject({ questionCount: 15, pointsPerQuestion: 5, maxPoints: 75 });
    expect(disciplineRules.portuguese.questionCount + disciplineRules.municipal_law.questionCount + disciplineRules.specific_knowledge.questionCount).toBe(30);
    render(<MemoryRouter initialEntries={['/simulados']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
    expect(screen.getByText(/50\+ pontos e NÃO PODE ZERAR nenhuma matéria/i)).toBeInTheDocument();
  });
});
