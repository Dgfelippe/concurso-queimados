import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { questions } from '../data/questions';

const { authState, signInMock } = vi.hoisted(() => ({
  authState: { currentUser: { uid: 'test-user', displayName: 'Diogo' } as { uid: string; displayName: string } | null },
  signInMock: vi.fn(() => Promise.resolve())
}));

vi.mock('../services/firebase', () => ({
  firebaseConfigured: true,
  firebaseAiConfigured: false,
  observeAuth: (callback: (user: unknown) => void) => {
    callback(authState.currentUser);
    return () => {};
  },
  loadCloudLearning: async () => ({ attempts: [], simulations: [] }),
  syncLocalLearning: async () => {},
  subscribeToCloudLearning: () => () => {},
  saveCloudAttempt: async () => {},
  saveCloudSimulation: async () => {},
  signInWithGoogle: signInMock,
  signOutOfGoogle: async () => {}
}));

async function renderApp(initialEntries = ['/']) {
  render(<MemoryRouter initialEntries={initialEntries} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></MemoryRouter>);
  if (authState.currentUser) await screen.findByTestId('app-shell');
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  localStorage.clear();
  authState.currentUser = { uid: 'test-user', displayName: 'Diogo' };
  signInMock.mockClear();
});

describe('navegação principal', () => {
  it('renders_navigation_destinations', async () => {
    await renderApp(['/questoes']);
    const sidebar = within(screen.getByRole('complementary', { name: 'Navegação principal' }));
    expect(sidebar.getByRole('link', { name: 'Painel' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Simulados' })).toBeInTheDocument();
    expect(sidebar.getByRole('link', { name: 'Caderno de erros' })).toBeInTheDocument();
  });

  it('organizes official documents, question banks, lessons and paid material in the study library', async () => {
    await renderApp(['/fontes']);
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

  it('shows_reference_style_landing_sections', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { name: /Estude para Queimados com método/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Simulado com cara de prova/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Errou\? Ótimo\. É aqui que se aprende/i })).toBeInTheDocument();
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('score-portuguese')))).toHaveTextContent('20 pts');
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains('score-specific_knowledge')))).toHaveTextContent('75 pts');
  });

  it('can_switch_between_reference_light_and_dark_themes', async () => {
    const user = userEvent.setup();
    await renderApp();
    await user.click(screen.getByRole('button', { name: 'Mudar para tema claro' }));
    expect(screen.getByTestId('app-shell')).toHaveAttribute('data-theme', 'light');
  });

  it('can_switch_theme_while_studying', async () => {
    const user = userEvent.setup();
    await renderApp(['/questoes']);
    await user.click(screen.getByRole('button', { name: 'Mudar para tema claro' }));
    expect(screen.getByTestId('app-shell')).toHaveAttribute('data-theme', 'light');
  });

  it('pauses_the_simulation_with_a_visible_resume_state', async () => {
    const user = userEvent.setup();
    await renderApp(['/simulados']);
    await user.click(screen.getByRole('button', { name: /Iniciar com banco local/i }));
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
    await renderApp(['/questoes']);
    const options = screen.getAllByRole('button').filter((button) => button.closest('.option-list'));
    await user.keyboard('a');
    expect(options[0]).toHaveClass('selected');
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Resposta Correta|Não foi dessa vez/)).toBeInTheDocument();
  });

  it('persists a stable session identifier with practice attempts', async () => {
    const user = userEvent.setup();
    await renderApp(['/questoes']);
    const question = questions[0];
    const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
    await user.click(screen.getByText(wrongOption.text));
    await user.click(screen.getByRole('button', { name: 'Confirmar Resposta' }));

    const attempts = JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]');
    expect(attempts[0].sessionId).toEqual(expect.any(String));
    expect(attempts[0].sessionId.length).toBeGreaterThan(0);
  });

  it('persists one simulation session identifier with submitted answers', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderApp(['/simulados']);
    await user.click(screen.getByRole('button', { name: /Iniciar com banco local/i }));
    const firstOptionList = document.querySelector('.option-list');
    const firstOption = firstOptionList?.querySelector('button');
    expect(firstOption).toBeTruthy();
    await user.click(firstOption!);
    await user.click(screen.getByRole('button', { name: 'Entregar Prova e Ver Gabarito' }));

    const attempts = JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]');
    expect(attempts).toHaveLength(1);
    expect(attempts[0].sessionId).toEqual(expect.any(String));
  });

  it('completes a full 30-question simulation and shows the result by subject', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderApp(['/simulados']);
    await user.click(screen.getByRole('button', { name: /Iniciar com banco local/i }));

    for (let index = 0; index < 30; index++) {
      const firstOption = document.querySelector('.option-list button');
      expect(firstOption, `questão ${index + 1} deve exibir alternativas`).toBeTruthy();
      await user.click(firstOption!);
      if (index < 29) {
        await user.click(screen.getByRole('button', { name: 'Próxima Questão →' }));
      }
    }

    await user.click(screen.getByRole('button', { name: 'Entregar Prova e Ver Gabarito' }));
    expect(screen.getByRole('heading', { name: /de 100 Pontos/ })).toBeInTheDocument();
    expect(screen.getByText('Desempenho por Disciplina:')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Revisão Detalhada das 30 Questões do Simulado' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]')).toHaveLength(30);
    expect(JSON.parse(localStorage.getItem('rq-simulations:test-user') || '[]')).toHaveLength(1);
  }, 30000);

  it('opens the AI study page and clearly reports missing cloud configuration', async () => {
    const user = userEvent.setup();
    await renderApp(['/estudo-ia']);
    expect(screen.getByRole('heading', { name: 'Questões inéditas por tópico' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IA indisponível no momento' })).toBeDisabled();
    expect(screen.getByRole('tab', { name: 'Questões reais e fontes' })).toBeInTheDocument();
    expect(screen.getByText('Privacidade e limites do recurso')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Questões reais e fontes' }));
    expect(screen.queryByText(/As questões reais mostram banca, concurso e link da prova/)).not.toBeInTheDocument();
  });

  it('keeps an old wrong answer in the error tutor after a later correct answer', async () => {
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

    await renderApp(['/erros']);

    expect(await screen.findByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    expect(screen.getAllByText(question.explanation).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em revisão').length).toBeGreaterThan(0);
  });

  it('retains the error across reloads until mastery, then reopens after a new error', async () => {
    const user = userEvent.setup();
    const question = questions[0];
    const wrongOption = question.options.find((option) => option.id !== question.correctOption)!;
    await renderApp(['/questoes']);

    await user.click(screen.getByText(wrongOption.text));
    await user.click(screen.getByRole('button', { name: 'Confirmar Resposta' }));
    const firstAttempt = JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]')[0];
    await user.click(screen.getByRole('link', { name: 'Caderno de erros' }));
    expect(await screen.findByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    const correctText = question.options.find((option) => option.id === question.correctOption)!.text;
    const retryArea = within(document.querySelector('.review-retry-section')!);

    await user.click(retryArea.getByRole('button', { name: new RegExp(correctText) }));
    await user.click(retryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Em revisão').length).toBeGreaterThan(0);
    const afterFirstRetry = JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]');
    expect(afterFirstRetry[1].sessionId).not.toBe(firstAttempt.sessionId);

    cleanup();
    await renderApp(['/erros']);
    expect(await screen.findByRole('heading', { name: 'Aula da questão' })).toBeInTheDocument();
    const secondRetryArea = within(document.querySelector('.review-retry-section')!);
    await user.click(secondRetryArea.getByRole('button', { name: new RegExp(correctText) }));
    await user.click(secondRetryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Dominada').length).toBeGreaterThan(0);
    const afterSecondRetry = JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]');
    expect(afterSecondRetry[2].sessionId).not.toBe(afterFirstRetry[1].sessionId);

    cleanup();
    await renderApp(['/erros']);
    await screen.findByRole('heading', { name: 'Aula da questão' });
    const finalRetryArea = within(document.querySelector('.review-retry-section')!);
    await user.click(finalRetryArea.getByRole('button', { name: new RegExp(wrongOption.text) }));
    await user.click(finalRetryArea.getByRole('button', { name: 'Conferir resposta' }));
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem('rq-attempts:test-user') || '[]')).toHaveLength(4);
  });

  it('keeps the simulated exam distribution, weighting, and elimination thresholds', async () => {
    const { disciplineRules } = await import('../data/edital');
    expect(disciplineRules.portuguese).toMatchObject({ questionCount: 10, pointsPerQuestion: 2, maxPoints: 20 });
    expect(disciplineRules.municipal_law).toMatchObject({ questionCount: 5, pointsPerQuestion: 1, maxPoints: 5 });
    expect(disciplineRules.specific_knowledge).toMatchObject({ questionCount: 15, pointsPerQuestion: 5, maxPoints: 75 });
    expect(disciplineRules.portuguese.questionCount + disciplineRules.municipal_law.questionCount + disciplineRules.specific_knowledge.questionCount).toBe(30);
    await renderApp(['/simulados']);
    expect(screen.getByText(/50\+ pontos e NÃO PODE ZERAR nenhuma matéria/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Simulado com IA indisponível' })).toBeDisabled();
  });

  it('requires Google entry before showing protected study content', async () => {
    authState.currentUser = null;
    await renderApp(['/questoes']);
    expect(screen.getByRole('heading', { name: /Seu próximo passo começa com foco/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Banco de Questões Comentadas' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar com Google' })).toBeEnabled();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar com Google' }));
    expect(signInMock).toHaveBeenCalledOnce();
  });
});
