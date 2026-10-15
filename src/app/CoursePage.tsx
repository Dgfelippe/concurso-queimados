import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Attempt, CourseAssessment, CourseProgress, CourseResult, OptionId, Question, TopicCourseProgress } from '../domain/types';
import { syllabusTopics } from '../data/topics';
import { getCourseUnits } from '../data/course-lessons';
import { firebaseAiConfigured, loadCloudCourseProgress, saveCloudCourseProgress } from '../services/firebase';
import { generateCourseAssessment } from '../services/ai-study';
import { getAiUserMessage } from '../services/ai-errors';

const PASS_SCORE = 8;
const municipalLawSources = {
  organic: 'https://previqueimados.rj.gov.br/wp-content/uploads/2014/07/LEI_ORGANICA_MUNICIPAL.pdf',
  statute: 'https://previqueimados.rj.gov.br/legislacao/leis-municipais/'
};

type AnswerHandler = (
  questionId: string,
  selectedOption: OptionId,
  correct: boolean,
  reason?: Attempt['errorReason'],
  confidence?: Attempt['confidence'],
  sessionId?: string,
  questionSnapshot?: Question
) => void;

const initialProgress = (): CourseProgress => ({ version: 1, topics: {}, updatedAt: new Date(0).toISOString() });

function emptyTopicProgress(): TopicCourseProgress {
  return { currentLevel: 1, passedLevels: [], bestScores: {}, updatedAt: new Date().toISOString() };
}

function readProgress(uid: string): CourseProgress {
  try {
    const saved = JSON.parse(localStorage.getItem(`rq-course-progress:${uid}`) || 'null') as CourseProgress | null;
    if (saved?.version === 1 && saved.topics && typeof saved.topics === 'object') return saved;
  } catch { /* Ignore a damaged local copy and start a clean progress record. */ }
  return initialProgress();
}

function mergeProgress(local: CourseProgress, remote: CourseProgress | null): CourseProgress {
  if (!remote || remote.version !== 1) return local;
  const topics = { ...remote.topics };
  for (const [topicId, localTopic] of Object.entries(local.topics)) {
    const remoteTopic = topics[topicId];
    topics[topicId] = !remoteTopic || localTopic.updatedAt > remoteTopic.updatedAt ? localTopic : remoteTopic;
  }
  return { version: 1, topics, updatedAt: local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt };
}

function patchTopic(progress: CourseProgress, topicId: string, patch: Partial<TopicCourseProgress>): CourseProgress {
  const previous = progress.topics[topicId] ?? emptyTopicProgress();
  const updatedAt = new Date().toISOString();
  return {
    version: 1,
    updatedAt,
    topics: { ...progress.topics, [topicId]: { ...previous, ...patch, updatedAt } }
  };
}

export function CoursePage({ accountUid, onAnswer, onSync }: {
  accountUid: string;
  onAnswer: AnswerHandler;
  onSync?: (status: 'syncing' | 'synced' | 'offline') => void;
}) {
  const { topicId = '' } = useParams();
  const topic = syllabusTopics.find((item) => item.id === topicId);
  const units = topic ? getCourseUnits(topic) : undefined;
  const [progress, setProgress] = useState<CourseProgress>(() => readProgress(accountUid));
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<OptionId | ''>('');

  useEffect(() => {
    let active = true;
    setReady(false);
    const local = readProgress(accountUid);
    setProgress(local);
    void loadCloudCourseProgress(accountUid).then((remote) => {
      if (!active) return;
      setProgress(mergeProgress(local, remote));
    }).catch(() => {
      if (active) onSync?.('offline');
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, [accountUid, onSync]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(`rq-course-progress:${accountUid}`, JSON.stringify(progress));
    onSync?.('syncing');
    void saveCloudCourseProgress(accountUid, progress)
      .then(() => onSync?.('synced'))
      .catch(() => onSync?.('offline'));
  }, [accountUid, onSync, progress, ready]);

  const topicProgress = topic ? progress.topics[topic.id] ?? emptyTopicProgress() : null;
  const currentLevel = topicProgress ? Math.min(3, topicProgress.currentLevel) as 1 | 2 | 3 : 1;
  const unit = units?.[currentLevel - 1];
  const active = topicProgress?.activeAssessment;
  const question = active?.items[active.index];
  const lastResult = topicProgress?.lastResult;
  const allTopicsComplete = Object.values(progress.topics).filter((item) => item.currentLevel === 4).length;

  const scoreAssessment = (assessment: CourseAssessment): CourseResult => {
    const score = assessment.items.reduce((sum, item) => sum + (assessment.answers[item.id] === item.correctOption ? 1 : 0), 0);
    const passed = score >= PASS_SCORE;
    const updated = patchTopic(progress, topicId, {
      currentLevel: passed ? Math.min(4, assessment.level + 1) as 1 | 2 | 3 | 4 : assessment.level,
      passedLevels: passed
        ? [...new Set([...(topicProgress?.passedLevels ?? []), assessment.level])].sort()
        : topicProgress?.passedLevels ?? [],
      bestScores: {
        ...(topicProgress?.bestScores ?? {}),
        [String(assessment.level)]: Math.max(topicProgress?.bestScores?.[String(assessment.level)] ?? 0, score)
      },
      activeAssessment: undefined
    });
    const result: CourseResult = {
      level: assessment.level,
      score,
      passed,
      completedAt: new Date().toISOString(),
      items: assessment.items,
      answers: assessment.answers
    };
    updated.topics[topicId] = { ...updated.topics[topicId], lastResult: result };
    setProgress(updated);
    assessment.items.forEach((item) => {
      const answer = assessment.answers[item.id];
      if (answer) onAnswer(item.id, answer, answer === item.correctOption, answer === item.correctOption ? undefined : 'unknown_content', 'sure', assessment.id, item);
    });
    setSelectedOption('');
    return result;
  };

  const startAssessment = async () => {
    if (!topic || !unit || !firebaseAiConfigured) return;
    setBusy(true);
    setError('');
    try {
      const items = await generateCourseAssessment({ topicId: topic.id, level: currentLevel, unit });
      const assessment: CourseAssessment = {
        id: crypto.randomUUID(),
        level: currentLevel,
        items,
        answers: {},
        index: 0,
        startedAt: new Date().toISOString()
      };
      setProgress((previous) => patchTopic(previous, topic.id, { activeAssessment: assessment }));
      setSelectedOption('');
    } catch (cause) {
      setError(getAiUserMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const saveAnswer = (choice: OptionId) => {
    if (!topic || !active || !question) return;
    setSelectedOption(choice);
    const updatedAssessment = { ...active, answers: { ...active.answers, [question.id]: choice } };
    setProgress((previous) => patchTopic(previous, topic.id, { activeAssessment: updatedAssessment }));
  };

  const navigateAssessment = (index: number) => {
    if (!topic || !active) return;
    const boundedIndex = Math.max(0, Math.min(active.items.length - 1, index));
    setProgress((previous) => patchTopic(previous, topic.id, { activeAssessment: { ...active, index: boundedIndex } }));
    setSelectedOption(active.answers[active.items[boundedIndex]?.id] ?? '');
  };

  const cancelAssessment = () => {
    if (!topic) return;
    setProgress((previous) => patchTopic(previous, topic.id, { activeAssessment: undefined }));
    setSelectedOption('');
    setError('');
  };

  const topicIndex = useMemo(() => syllabusTopics.findIndex((item) => item.id === topicId), [topicId]);
  const previousTopic = syllabusTopics[topicIndex - 1];
  const nextTopic = syllabusTopics[topicIndex + 1];

  if (!topic || !units || !unit || !units[0] || !units[1] || !units[2]) {
    return <section className="panel course-not-found"><h1>Este tópico ainda não tem uma trilha de aulas.</h1><p>Escolha um conteúdo programático para continuar.</p><Link className="button button-secondary" to="/conteudos">Voltar aos conteúdos</Link></section>;
  }

  if (!ready) return <section className="panel course-loading" role="status">Carregando seu progresso de estudo…</section>;

  return (
    <div className="course-page">
      <Link to="/conteudos" className="course-back-link">← Todos os conteúdos</Link>
      <header className="page-heading course-heading">
        <span className="eyebrow">TRILHA DO EDITAL · {topic.discipline === 'portuguese' ? 'LÍNGUA PORTUGUESA' : topic.discipline === 'municipal_law' ? 'LEGISLAÇÃO MUNICIPAL' : 'CONHECIMENTOS ESPECÍFICOS'}</span>
        <h1>{topic.title}</h1>
        <p>{topic.summary}</p>
      </header>

      <section className="panel course-level-map" aria-label="Etapas da trilha">
        <div className="course-level-heading"><div><span className="eyebrow">DO BÁSICO AO AVANÇADO</span><h2>Sua trilha de aprendizagem</h2></div><span className="course-map-count">{topicProgress?.passedLevels.length ?? 0}/3 etapas concluídas</span></div>
        <div className="course-level-steps">
          {units.map((step, index) => {
            const level = index + 1;
            const passed = topicProgress?.passedLevels.includes(level) ?? false;
            const locked = level > currentLevel;
            return <div key={step.title} className={`course-level-step${passed ? ' is-passed' : ''}${level === currentLevel && !passed ? ' is-current' : ''}${locked ? ' is-locked' : ''}`}><span>{passed ? '✓' : level}</span><div><strong>{level === 1 ? 'Fundamentos' : level === 2 ? 'Aplicação' : 'Avançado'}</strong><small>{locked ? 'Conclua a etapa anterior' : step.title}</small></div></div>;
          })}
          <div className={`course-level-step course-level-finish${topicProgress?.currentLevel === 4 ? ' is-passed' : ' is-locked'}`}><span>{topicProgress?.currentLevel === 4 ? '✓' : '★'}</span><div><strong>Apto ao simulado</strong><small>Após aprovação nas três etapas</small></div></div>
        </div>
      </section>

      {active ? (
        <section className="panel course-assessment-panel" aria-label="Prova de fixação">
          <div className="course-assessment-top"><div><span className="eyebrow">AVALIAÇÃO DA ETAPA {active.level}</span><h2>{unit.title}</h2></div><button className="text-button" type="button" onClick={cancelAssessment}>Cancelar avaliação</button></div>
          <div className="course-question-progress"><span>Questão {active.index + 1} de 10</span><span>{Object.keys(active.answers).length} respondidas</span><progress value={Object.keys(active.answers).length} max={10} /></div>
          {question && <article className="course-test-question"><h3>{question.prompt}</h3><div className="option-list">{question.options.map((option) => <button type="button" key={option.id} aria-pressed={(selectedOption || active.answers[question.id]) === option.id} className={`option${(selectedOption || active.answers[question.id]) === option.id ? ' selected' : ''}`} onClick={() => saveAnswer(option.id)}><b>{option.id}</b><span>{option.text}</span></button>)}</div></article>}
          <div className="course-assessment-actions">
            <button className="button button-secondary" type="button" onClick={() => navigateAssessment(active.index - 1)} disabled={active.index === 0}>← Anterior</button>
            {active.index < 9 ? <button className="button button-primary" type="button" onClick={() => navigateAssessment(active.index + 1)}>Próxima questão →</button> : <button className="button button-primary" type="button" onClick={() => scoreAssessment(active)} disabled={Object.keys(active.answers).length < 10}>Entregar prova</button>}
          </div>
          <div className="course-question-jump" aria-label="Navegar pelas questões">{active.items.map((item, index) => <button type="button" key={item.id} className={`${index === active.index ? 'current' : ''}${active.answers[item.id] ? ' answered' : ''}`} aria-label={`Ir para a questão ${index + 1}`} onClick={() => navigateAssessment(index)}>{index + 1}</button>)}</div>
          <p className="course-assessment-footnote">A aprovação exige 8 acertos. Você pode sair da página e voltar depois; a avaliação fica salva na sua conta.</p>
          <details className="course-privacy"><summary>Sobre esta avaliação</summary><p>O tópico e o conteúdo da aula são enviados ao Google Gemini para preparar questões novas de treino. Seu nome e e-mail não são enviados. Elas não são questões oficiais de provas anteriores e podem conter erro; confira as fontes indicadas, especialmente em legislação. O acesso gratuito tem limites de uso.</p></details>
        </section>
      ) : topicProgress?.currentLevel === 4 ? (
        <><section className="panel course-ready-panel"><span className="course-ready-icon" aria-hidden="true">✓</span><div><span className="eyebrow">ETAPA CONCLUÍDA</span><h2>Você está apto para o simulado deste tópico.</h2><p>As três etapas foram aprovadas. Revise seus erros quando quiser ou siga para o simulado geral.</p></div><Link className="button button-primary" to="/simulados">Ir para simulados</Link></section>{lastResult && <CourseResultView result={lastResult} onReview={() => document.getElementById('course-last-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />}</>
      ) : (
        <section className="panel course-lesson-panel">
          <div className="course-lesson-heading"><div><span className="eyebrow">ETAPA {currentLevel} · {currentLevel === 1 ? 'FUNDAMENTOS' : currentLevel === 2 ? 'APLICAÇÃO' : 'AVANÇADO'}</span><h2>{unit.title}</h2></div><span className="badge badge-neutral">Aula {currentLevel} de 3</span></div>
          <p className="course-objective"><strong>Ao final desta etapa:</strong> {unit.objective}</p>
          <div className="course-lesson-copy"><p>{unit.lesson}</p><div className="course-example"><strong>Exemplo explicado</strong><p>{unit.example}</p></div><div className="course-exam-focus"><strong>Como isso aparece na prova</strong><p>{unit.examFocus}</p></div></div>

          {topic.id === 'lm-organica' && <div className="course-source-note"><strong>Texto legal de referência</strong><p>A fonte oficial consultada é a 4ª edição (2011). Confira as emendas mais recentes e o texto indicado no edital antes de memorizar artigos.</p><a href={municipalLawSources.organic} target="_blank" rel="noreferrer">Abrir Lei Orgânica na fonte municipal ↗</a></div>}
          {topic.id === 'lm-estatuto' && <div className="course-source-note"><strong>Texto legal de referência</strong><p>O PDF disponibilizado para estudo informa alteração pela Lei nº 1.366/2017. Confirme se o edital ou a Prefeitura publicou atualização posterior antes de usar artigos e prazos como regra vigente.</p><a href={`${import.meta.env.BASE_URL}docs/lei-1060-2011-versao-enviada.pdf`} target="_blank" rel="noreferrer">Abrir PDF de estudo da Lei nº 1.060/2011 ↗</a><a href={municipalLawSources.statute} target="_blank" rel="noreferrer">Consultar lista oficial de leis municipais ↗</a></div>}

          <div className="course-assessment-start"><div><strong>Prova de fixação</strong><p>10 questões novas sobre esta aula. Para avançar, acerte pelo menos 8.</p></div><button type="button" className="button button-primary" onClick={startAssessment} disabled={busy || !firebaseAiConfigured}>{busy ? 'Preparando sua prova…' : !firebaseAiConfigured ? 'Avaliação indisponível no momento' : lastResult?.level === currentLevel ? 'Refazer avaliação' : 'Começar avaliação'}</button></div>
          <details className="course-privacy"><summary>Como a prova é preparada</summary><p>O tópico e o conteúdo desta aula são enviados ao Google Gemini para montar as questões. Seu nome e e-mail não são enviados. As questões são novas para treino, não são provas oficiais e podem conter erro; confira o conteúdo legal nas fontes indicadas. O acesso gratuito tem limites de uso.</p></details>
          {error && <p className="course-error" role="alert">{error}</p>}

          {lastResult && <CourseResultView result={lastResult} onReview={() => document.getElementById('course-last-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />}
        </section>
      )}

      <section className="course-navigation-row" aria-label="Navegar entre tópicos">
        {previousTopic ? <Link className="button button-secondary" to={`/conteudos/${previousTopic.id}`}>← {previousTopic.title}</Link> : <span />}
        <span>{allTopicsComplete} de {syllabusTopics.length} tópicos concluídos</span>
        {nextTopic ? <Link className="button button-secondary" to={`/conteudos/${nextTopic.id}`}>{nextTopic.title} →</Link> : <Link className="button button-primary" to="/simulados">Ir ao simulado geral →</Link>}
      </section>
    </div>
  );
}

function CourseResultView({ result, onReview }: { result: CourseResult; onReview: () => void }) {
  return <section className={`course-result ${result.passed ? 'passed' : 'retry'}`} id="course-last-result" aria-live="polite">
    <div className="course-result-heading"><div><span className="eyebrow">RESULTADO · ETAPA {result.level}</span><h3>{result.score}/10 acertos</h3></div><span className="course-result-status">{result.passed ? 'Etapa aprovada' : `Meta: ${PASS_SCORE}/10`}</span></div>
    <p>{result.passed ? result.level === 3 ? 'Você concluiu o nível avançado e está apto para o simulado deste tópico.' : 'Etapa aprovada. O próximo nível já está liberado.' : 'Revise os itens abaixo. A etapa continua disponível para nova tentativa.'}</p>
    <button type="button" className="text-button" onClick={onReview}>Revisar explicações das 10 questões ↓</button>
    <div className="course-result-list">{result.items.map((item, index) => {
      const answer = result.answers[item.id];
      const correct = answer === item.correctOption;
      return <article key={item.id} className={`course-result-item ${correct ? 'correct' : 'wrong'}`}><div className="course-result-item-title"><span>{index + 1}. {correct ? 'Acerto' : answer ? 'Revisar' : 'Não respondida'}</span><small>Sua resposta: {answer ?? 'em branco'} · Gabarito: {item.correctOption}</small></div><h4>{item.prompt}</h4><p>{item.explanation}</p><div className="course-result-notes">{item.options.map((option) => <p key={option.id}><strong>{option.id}.</strong> {option.note}</p>)}</div>{item.studyTip && <small className="course-study-tip">Para guardar: {item.studyTip}</small>}</article>;
    })}</div>
  </section>;
}
