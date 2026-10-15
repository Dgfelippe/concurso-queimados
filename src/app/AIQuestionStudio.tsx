import { useMemo, useState } from 'react';
import { questions } from '../data/questions';
import { getRealContestQuestions } from '../data/questions';
import { syllabusTopics } from '../data/topics';
import { studySources } from '../data/sources';
import type { Attempt, ErrorReason, OptionId, Question } from '../domain/types';
import { firebaseAiConfigured } from '../services/firebase';
import { generateTopicQuestions } from '../services/ai-study';

const reasonOptions: Record<ErrorReason, string> = {
  unknown_content: 'Não sabia o conteúdo',
  concept_confusion: 'Confundi conceitos',
  misread: 'Li rápido ou interpretei errado',
  inattention: 'Falta de atenção',
  between_options: 'Fiquei entre duas alternativas',
  calculation: 'Erro de raciocínio'
};

export function AIQuestionStudio({ onAnswer }: {
  onAnswer: (questionId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string, questionSnapshot?: Question) => void;
}) {
  const [topicId, setTopicId] = useState(syllabusTopics[0]?.id ?? '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [set, setSet] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionId | ''>('');
  const [reason, setReason] = useState<ErrorReason>('unknown_content');
  const [answered, setAnswered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [mode, setMode] = useState<'generated' | 'real'>('generated');

  const topic = useMemo(() => syllabusTopics.find((item) => item.id === topicId), [topicId]);
  const question = set[index];
  const examples = useMemo(() => questions.filter((item) => item.topicId === topicId).slice(0, 3), [topicId]);
  const realQuestions = useMemo(() => getRealContestQuestions().filter((item) => item.topicId === topicId), [topicId]);
  const realQuestionSources = useMemo(() => studySources.filter((source) => (source.category === 'questions' || source.id === 'ian-belford-2025') && source.type !== 'original' && source.url), []);

  const generate = async () => {
    setMode('generated');
    setBusy(true);
    setError('');
    setSet([]);
    setIndex(0);
    setSelected('');
    setAnswered(false);
    try {
      const next = await generateTopicQuestions({ topicId, difficulty, examples });
      setSet(next);
      setSessionId(crypto.randomUUID());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível gerar as questões agora.');
    } finally {
      setBusy(false);
    }
  };

  const openRealQuestions = () => {
    setMode('real');
    setSet(realQuestions);
    setIndex(0);
    setSelected('');
    setAnswered(false);
    setError('');
    setSessionId(crypto.randomUUID());
  };

  const confirm = () => {
    if (!question || !selected) return;
    const correct = selected === question.correctOption;
    onAnswer(question.id, selected, correct, correct ? undefined : reason, 'sure', sessionId, question);
    setAnswered(true);
  };

  const next = () => {
    setIndex((current) => current + 1);
    setSelected('');
    setReason('unknown_content');
    setAnswered(false);
  };

  return (
    <>
      <header className="page-heading">
        <span className="eyebrow">TREINO ADAPTATIVO</span>
        <h1>Questões inéditas por tópico</h1>
        <p>Gere um pequeno bloco de questões alinhadas ao edital. As respostas ficam no seu histórico e os erros entram no Caderno de Erros.</p>
      </header>

      <section className="panel ai-study-panel">
        <div className="ai-study-tabs" role="tablist" aria-label="Tipo de questão">
          <button type="button" role="tab" aria-selected={mode === 'generated'} className={mode === 'generated' ? 'active' : ''} onClick={() => { setMode('generated'); setSet([]); setError(''); }}>Novas questões</button>
          <button type="button" role="tab" aria-selected={mode === 'real'} className={mode === 'real' ? 'active' : ''} onClick={openRealQuestions}>Questões reais e fontes</button>
        </div>
        {mode === 'generated' ? <>
        <details className="ai-study-disclosure">
          <summary>Privacidade e origem do conteúdo</summary>
          <p>As novas questões e explicações são produzidas pelo Google Gemini. Quando você solicita o recurso, o enunciado, sua resposta e o tópico estudado são enviados ao Google; seu nome e e-mail não são enviados. O material serve para treino e não substitui questões oficiais. O acesso gratuito está sujeito a limites, e o Google informa que pode usar as solicitações para melhorar seus produtos.</p>
        </details>
        <div className="ai-study-controls">
          <label>Tópico do edital
            <select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSet([]); }}>
              {syllabusTopics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label>Dificuldade estimada
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}>
              <option value="easy">Fácil</option><option value="medium">Média</option><option value="hard">Difícil</option>
            </select>
          </label>
          <button className="button button-primary" type="button" onClick={generate} disabled={busy || !firebaseAiConfigured || !topicId}>
            {busy ? 'Montando questões…' : !firebaseAiConfigured ? 'IA indisponível no momento' : set.length ? 'Gerar outro bloco' : 'Gerar 3 questões'}
          </button>
        </div>

        </> : <section className="real-question-library" aria-label="Questões reais de provas anteriores">
          <label className="real-topic-filter">Filtrar por tópico do edital
            <select value={topicId} onChange={(event) => { setTopicId(event.target.value); setSet(getRealContestQuestions().filter((item) => item.topicId === event.target.value)); setIndex(0); setSelected(''); setAnswered(false); }}>
              {syllabusTopics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <p className="real-question-count">{realQuestions.length ? `${realQuestions.length} questão(ões) real(is) validada(s) neste tópico.` : 'Ainda não há questão real validada neste tópico no banco local.'}</p>
          <div className="real-source-grid">
            {realQuestionSources.map((source) => <article className="panel real-source-card" key={source.id}>
              <div className="source-meta"><span>{source.type === 'official' ? 'Fonte oficial' : 'Plataforma externa'}</span><span>{source.access}</span></div>
              <h3>{source.title}</h3><p>{source.note}</p>
              {source.url && <a href={source.url} target="_blank" rel="noreferrer" className="button button-secondary">Consultar fonte ↗</a>}
            </article>)}
          </div>
        </section>}
        {error && <p className="ai-error-message" role="alert">{error}</p>}
        {question && (
          <article className="ai-question-card">
            <div className="ai-question-meta"><span>{topic?.title}</span><span>Dificuldade estimada para estudo: {({ easy: 'fácil', medium: 'média', hard: 'difícil' } as const)[question.difficulty]}</span><span>{mode === 'real' ? `${question.provenance.banca ?? 'Banca identificada'} · ${question.provenance.year ?? 'ano não informado'}` : 'Questão nova de treino'}</span></div>
            {mode === 'real' && <p className="real-question-origin">{question.provenance.contest} · <a href={question.provenance.url} target="_blank" rel="noreferrer">conferir questão e arquivo de origem ↗</a></p>}
            <h2>{question.prompt}</h2>
            <div className="option-list">
              {question.options.map((option) => <button key={option.id} type="button" disabled={answered} aria-pressed={selected === option.id} className={`option${selected === option.id ? ' selected' : ''}${answered && option.id === question.correctOption ? ' correct' : ''}${answered && selected === option.id && selected !== question.correctOption ? ' incorrect' : ''}`} onClick={() => setSelected(option.id)}><b>{option.id}</b><span>{option.text}</span></button>)}
            </div>
            {!answered && selected && selected !== question.correctOption && <label className="review-reason-select">O que pesou nesta resposta?
              <select value={reason} onChange={(event) => setReason(event.target.value as ErrorReason)}>{Object.entries(reasonOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </label>}
            {answered && <div className="ai-question-explanation" role="status"><strong>{selected === question.correctOption ? 'Resposta correta' : `O gabarito é ${question.correctOption}`}</strong><p>{question.explanation}</p><small>{question.studyTip}</small><p className="ai-source-warning">Questão nova para treino; dificuldade estimada. Confira o material oficial antes de memorizar.</p></div>}
            {!answered ? <button className="button button-primary" type="button" disabled={!selected} onClick={confirm}>Conferir resposta</button> : index + 1 < set.length ? <button className="button button-primary" type="button" onClick={next}>Próxima questão</button> : <button className="button button-primary" type="button" onClick={() => { setSet([]); setIndex(0); setAnswered(false); setSelected(''); }}>Finalizar bloco</button>}
            <small className="ai-question-count">Questão {index + 1} de {set.length} · dificuldade estimada para estudo.</small>
          </article>
        )}
      </section>
    </>
  );
}
