import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contest, disciplineRules } from '../data/edital';
import { questions, type QuestionData } from '../data/questions';
import { getTopic } from '../data/topics';
import { deriveReviewQueue } from '../domain/review-state';
import type { Attempt, Discipline, ErrorReason, OptionId, Question } from '../domain/types';
import { explainMistake } from '../services/ai-study';

const disciplineLabels: Record<Discipline, string> = {
  portuguese: 'Língua Portuguesa',
  municipal_law: 'Legislação Municipal',
  specific_knowledge: 'Conhecimentos Específicos'
};

const reasonLabels: Record<ErrorReason, string> = {
  unknown_content: 'Não sabia o conteúdo / matéria',
  concept_confusion: 'Confundi conceitos parecidos',
  misread: 'Pegadinha / li o enunciado rápido demais',
  inattention: 'Falta de atenção na alternativa',
  between_options: 'Fiquei em dúvida entre duas',
  calculation: 'Erro de interpretação / raciocínio'
};

const statusLabels = {
  pending: 'Pendente',
  reviewing: 'Em revisão',
  mastered: 'Dominada'
} as const;

interface ErrorTutorProps {
  attempts: Attempt[];
  onAnswer: (
    questionId: string,
    choice: OptionId,
    correct: boolean,
    reason?: ErrorReason,
    confidence?: Attempt['confidence'],
    sessionId?: string,
    questionSnapshot?: Question
  ) => void;
}

export function ErrorTutor({ attempts, onAnswer }: ErrorTutorProps) {
  const [selectedId, setSelectedId] = useState('');
  const [choice, setChoice] = useState<OptionId | ''>('');
  const [reason, setReason] = useState<ErrorReason>('unknown_content');
  const [result, setResult] = useState<boolean | null>(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());

  const queue = useMemo(() => {
    const byId = new Map(questions.map((question) => [question.id, question]));
    attempts.forEach((attempt) => {
      if (attempt.questionSnapshot) byId.set(attempt.questionId, attempt.questionSnapshot);
    });
    const statusOrder = { pending: 0, reviewing: 1, mastered: 2 };
    return deriveReviewQueue(attempts)
      .map((item) => ({ item, question: byId.get(item.questionId) }))
      .filter((entry): entry is { item: typeof entry.item; question: QuestionData } => Boolean(entry.question))
      .sort((left, right) => {
        const urgency = statusOrder[left.item.status] - statusOrder[right.item.status];
        if (urgency) return urgency;
        const weight = disciplineRules[right.question.discipline].weightPct - disciplineRules[left.question.discipline].weightPct;
        if (weight) return weight;
        return right.item.lastAttemptAt.localeCompare(left.item.lastAttemptAt);
      });
  }, [attempts]);

  useEffect(() => {
    if (!queue.some(({ item }) => item.questionId === selectedId)) {
      setSelectedId(queue[0]?.item.questionId ?? '');
    }
  }, [queue, selectedId]);

  const selected = queue.find(({ item }) => item.questionId === selectedId);
  const question = selected?.question;
  const review = selected?.item;
  const lastWrong = review?.lastWrongAttempt;
  const topic = question ? getTopic(question.topicId) : undefined;
  const summary = {
    pending: queue.filter(({ item }) => item.status === 'pending').length,
    reviewing: queue.filter(({ item }) => item.status === 'reviewing').length,
    mastered: queue.filter(({ item }) => item.status === 'mastered').length
  };

  const chooseQuestion = (questionId: string) => {
    setSelectedId(questionId);
    setChoice('');
    setReason('unknown_content');
    setResult(null);
    setAiExplanation('');
    setAiError('');
  };

  const requestAiLesson = async () => {
    if (!question || !lastWrong) return;
    setAiBusy(true);
    setAiError('');
    try {
      setAiExplanation(await explainMistake({
        question,
        selectedOption: lastWrong.selectedOption,
        errorReason: lastWrong.errorReason ? reasonLabels[lastWrong.errorReason] : undefined
      }));
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : 'Não foi possível obter a explicação agora.');
    } finally {
      setAiBusy(false);
    }
  };

  const submit = () => {
    if (!question || !choice) return;
    const correct = choice === question.correctOption;
    if (question.id.startsWith('ai-')) {
      onAnswer(question.id, choice, correct, correct ? undefined : reason, 'sure', sessionId, question);
    } else {
      onAnswer(question.id, choice, correct, correct ? undefined : reason, 'sure', sessionId);
    }
    setResult(correct);
  };

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">APRENDER COM O ERRO</span>
        <h1>Caderno de Erros</h1>
        <p>Volte ao raciocínio que faltou, compare as alternativas e pratique até mostrar que aprendeu.</p>
      </header>

      <section className="review-summary" aria-label="Resumo das revisões">
        <div><span>Pendentes</span><strong>{summary.pending}</strong></div>
        <div><span>Em revisão</span><strong>{summary.reviewing}</strong></div>
        <div><span>Dominadas</span><strong>{summary.mastered}</strong></div>
        <p>Duas respostas corretas em sessões diferentes confirmam o domínio. Se errar novamente, a revisão recomeça.</p>
      </section>

      {!queue.length ? (
        <section className="panel review-empty">
          <span className="review-empty-mark" aria-hidden="true">✓</span>
          <h2>Seu caderno ainda está vazio</h2>
          <p>Resolva questões no banco. Quando errar, elas aparecem aqui com uma explicação para você revisar.</p>
          <Link className="button button-primary" to="/questoes">Praticar questões</Link>
        </section>
      ) : (
        <div className="review-layout">
          <aside className="review-list panel" aria-label="Questões para revisar">
            <h2>Seu histórico</h2>
            <p>Ordenado por pendência, peso na prova e data da última tentativa.</p>
            <div className="review-list-items">
              {queue.map(({ item, question: listedQuestion }) => (
                <button
                  key={item.questionId}
                  type="button"
                  className={`review-list-item${selectedId === item.questionId ? ' is-selected' : ''}`}
                  aria-pressed={selectedId === item.questionId}
                  onClick={() => chooseQuestion(item.questionId)}
                >
                  <span className={`review-status review-status-${item.status}`}>{statusLabels[item.status]}</span>
                  <strong>{listedQuestion.prompt}</strong>
                  <small>{disciplineLabels[listedQuestion.discipline]} · {item.wrongCount} {item.wrongCount === 1 ? 'erro' : 'erros'}</small>
                </button>
              ))}
            </div>
          </aside>

          {question && review && lastWrong && (
            <article className="review-lesson question-card" aria-labelledby="review-lesson-title">
              <div className="review-lesson-meta">
                <span className="badge badge-neutral">{disciplineLabels[question.discipline]}</span>
                <span className="badge badge-weight">Peso {disciplineRules[question.discipline].pointsPerQuestion.toFixed(0)}</span>
                <span className={`review-status review-status-${review.status}`}>{statusLabels[review.status]}</span>
                <span className="review-topic">{topic?.title ?? question.topicId}</span>
              </div>

              <h2 id="review-lesson-title">Aula da questão</h2>
              <p className="review-question-prompt">{question.prompt}</p>

              <section className="review-history-note">
                <strong>Na última vez, você marcou {lastWrong.selectedOption}.</strong>
                <span>{question.options.find((option) => option.id === lastWrong.selectedOption)?.text}</span>
                <small>Motivo que você registrou: {lastWrong.errorReason ? reasonLabels[lastWrong.errorReason] : 'não informado'}.</small>
              </section>

              <section className="review-teaching-section">
                <h3>1. O que a questão está cobrando</h3>
                <p>{topic?.summary ?? 'Revise o conteúdo indicado no enunciado e compare cada alternativa com o gabarito.'}</p>
              </section>

              <section className="review-teaching-section">
                <h3>2. Raciocínio para chegar ao gabarito</h3>
                <p>{question.explanation}</p>
              </section>

              <section className="review-teaching-section ai-error-tutor">
                <h3>Quer outra explicação?</h3>
                <p>O tutor pode explicar de outro jeito e partir da alternativa que você marcou. Ele usa somente o enunciado e os dados desta questão.</p>
                <button className="button button-secondary" type="button" onClick={requestAiLesson} disabled={aiBusy}>
                  {aiBusy ? 'Preparando a explicação…' : aiExplanation ? 'Gerar outra explicação' : 'Pedir explicação ao tutor IA'}
                </button>
                <small>Ao clicar, o conteúdo desta questão e a sua resposta são enviados ao Google Gemini. Seu nome e e-mail não são enviados. No nível gratuito, o Google informa que pode usar o conteúdo das solicitações para melhorar os produtos.</small>
                {aiError && <p className="ai-error-message" role="alert">{aiError}</p>}
                {aiExplanation && <div className="ai-explanation-output" aria-live="polite">{aiExplanation}</div>}
              </section>

              <section className="review-teaching-section">
                <h3>3. Análise das alternativas</h3>
                <div className="review-alternative-list">
                  {question.options.map((option) => (
                    <div className={`review-alternative${option.id === question.correctOption ? ' is-correct' : ''}`} key={option.id}>
                      <span className="review-alternative-key">{option.id}</span>
                      <div>
                        <strong>{option.text}</strong>
                        <p>{option.note}</p>
                      </div>
                      {option.id === question.correctOption && <span className="review-alternative-result">Gabarito</span>}
                    </div>
                  ))}
                </div>
              </section>

              {question.studyTip && (
                <aside className="review-study-tip">
                  <strong>Para guardar</strong>
                  <p>{question.studyTip}</p>
                </aside>
              )}

              <section className="review-retry-section" aria-label="Nova tentativa">
                <h3>4. Tente de novo sem olhar o comentário</h3>
                <div className="option-list">
                  {question.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={result !== null}
                      aria-pressed={choice === option.id}
                      className={`option${choice === option.id ? ' selected' : ''}${result !== null && option.id === question.correctOption ? ' correct' : ''}${result === false && choice === option.id ? ' incorrect' : ''}`}
                      onClick={() => setChoice(option.id)}
                    >
                      <b>{option.id}</b><span>{option.text}</span>
                    </button>
                  ))}
                </div>
                {choice && choice !== question.correctOption && result === null && (
                  <label className="review-reason-select">
                    O que pesou nesta tentativa?
                    <select value={reason} onChange={(event) => setReason(event.target.value as ErrorReason)}>
                      {Object.entries(reasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                )}
                {result !== null && (
                  <p className={`review-feedback${result ? ' is-correct' : ' is-wrong'}`} role="status">
                    {result ? 'Acertou esta tentativa. Faça outra revisão em uma sessão diferente para confirmar o domínio.' : `Ainda não foi desta vez. O gabarito é ${question.correctOption}; a questão continua na sua revisão.`}
                  </p>
                )}
                <button className="button button-primary" type="button" disabled={!choice || result !== null} onClick={submit}>
                  Conferir resposta
                </button>
              </section>
            </article>
          )}
        </div>
      )}
      <small className="review-edit-note">Referência do edital: Concurso {contest.title}.</small>
    </>
  );
}
