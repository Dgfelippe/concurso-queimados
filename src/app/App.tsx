import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { navigationItems } from './navigation';
import { questions } from '../data/questions';
import { syllabusTopics } from '../data/topics';
import { contest, disciplineRules, scheduleTimeline } from '../data/edital';
import { sourceLinks } from '../data/sources';
import { dossieQueimados } from '../data/queimados-dossie';
import type { Attempt, Discipline, ErrorReason, OptionId } from '../domain/types';
import { ErrorTutor } from './ErrorTutor';
import '../styles/global.css';

const labels: Record<Discipline, string> = {
  portuguese: 'Língua Portuguesa',
  municipal_law: 'Legislação Municipal',
  specific_knowledge: 'Conhecimentos Específicos'
};

const errorLabels: Record<ErrorReason, string> = {
  unknown_content: 'Não sabia o conteúdo / matéria',
  concept_confusion: 'Confundi conceitos parecidos',
  misread: 'Pegadinha / Li o enunciado rápido demais',
  inattention: 'Falta de atenção na alternativa',
  between_options: 'Fiquei em dúvida entre duas',
  calculation: 'Erro de interpretação / raciocínio'
};

const storedAttempts = (): Attempt[] => {
  try {
    return JSON.parse(localStorage.getItem('rq-attempts') || '[]') as Attempt[];
  } catch {
    return [];
  }
};

const prettyDate = (date: string) => {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
};

/* =========================================================================
   COMPONENTE: CABEÇALHO DE PÁGINA
   ========================================================================= */
function PageTitle({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </section>
  );
}

const networkPoints = Array.from({ length: 54 }, (_, index) => {
  const angle = index * 2.399963;
  const radius = Math.sqrt((index + 0.5) / 54) * 126;
  return { x: 160 + Math.cos(angle) * radius, y: 150 + Math.sin(angle) * radius };
});

function QuestionGlobe() {
  return (
    <div className="hero-visual" aria-label="Ilustração das três matérias do concurso">
      <span className="visual-caption visual-caption-top">{questions.length} QUESTÕES NO BANCO</span>
      <svg className="network-globe" viewBox="0 0 320 300" role="img" aria-label="Rede de pontos coloridos representando as matérias">
        <defs><clipPath id="globe-clip"><circle cx="160" cy="150" r="126" /></clipPath></defs>
        <circle cx="160" cy="150" r="126" className="globe-outline" />
        <g clipPath="url(#globe-clip)" className="globe-lines">
          {networkPoints.map((point, index) => {
            const next = networkPoints[(index + 7) % networkPoints.length];
            const alternate = networkPoints[(index + 15) % networkPoints.length];
            return <g key={index}><line x1={point.x} y1={point.y} x2={next.x} y2={next.y} /><line x1={point.x} y1={point.y} x2={alternate.x} y2={alternate.y} /></g>;
          })}
          {networkPoints.map((point, index) => <circle key={`node-${index}`} cx={point.x} cy={point.y} r={index % 5 === 0 ? 2.6 : 1.7} className={`globe-dot tone-${index % 3}`} />)}
        </g>
        <path d="M25 190 C95 160 225 170 295 125" className="globe-orbit" />
        <path d="M42 233 C115 210 211 219 278 183" className="globe-orbit secondary" />
      </svg>
      <span className="visual-caption visual-caption-bottom">CADA PONTO É UMA QUESTÃO</span>
      <div className="visual-legend"><span><i className="legend-portuguese" />Português</span><span><i className="legend-law" />Legislação</span><span><i className="legend-specific" />Específicos</span></div>
    </div>
  );
}

/* =========================================================================
   PÁGINA 1: PAINEL GERAL (DASHBOARD HUMANIZADO)
   ========================================================================= */
function LandingPage({ attempts, theme, onToggleTheme }: { attempts: Attempt[]; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : null;
  const targetDate = new Date(`${contest.examDate}T14:00:00`).getTime();
  const days = Math.max(0, Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24)));
  const featuredQuestion = questions.find((question) => question.discipline === 'portuguese') ?? questions[0];
  const topicNames = syllabusTopics.map((topic) => topic.title);

  return (
    <div className="reference-landing">
      <header className="landing-header">
        <NavLink className="landing-brand" to="/" aria-label="Queimados Agente, início"><span className="landing-brand-mark">Q</span><span><b>Queimados</b><small>· Agente</small></span></NavLink>
        <div className="landing-header-actions">
          <button className="theme-toggle" type="button" aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} onClick={onToggleTheme}><span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span></button>
          <NavLink className="landing-signin" to="/questoes">Entrar</NavLink>
        </div>
      </header>

      <section className="reference-hero">
        <div className="hero-copy">
          <div className="exam-date-pill"><span className="status-dot" /> Prova prevista para {prettyDate(contest.examDate)} · faltam <b>{days}</b> dias</div>
          <h1>Estude para Queimados com <span>método</span>, não no improviso.</h1>
          <p>Questões por assunto do edital, simulados no formato da prova e comentários que explicam o porquê de cada alternativa. Um passo de cada vez, com o que você precisa para avançar.</p>
          <div className="hero-actions"><NavLink className="landing-cta" to="/questoes">Começar a estudar <span aria-hidden="true">→</span></NavLink><small>É grátis. Seu progresso fica salvo neste navegador.</small></div>
        </div>
        <QuestionGlobe />
      </section>

      <div className="topic-marquee" aria-label="Assuntos do edital"><div className="topic-marquee-track">{[...topicNames, ...topicNames].map((name, index) => <span key={`${name}-${index}`}>{name}<i>•</i></span>)}</div></div>

      <section className="feature-cards" aria-label="Como funciona o preparatório">
        <article className="feature-card"><span>01</span><h2>Questões por assunto do edital</h2><p>Português, Legislação e Específicos organizados do jeito que você estuda, com a origem da questão identificada.</p></article>
        <article className="feature-card"><span>02</span><h2>Simulado com cara de prova</h2><p>30 questões, relógio de até 3 horas e os mesmos pesos do edital: 2, 1 e 5.</p></article>
        <article className="feature-card"><span>03</span><h2>Comentário em cada questão</h2><p>Veja por que a alternativa correta funciona e use os erros para escolher o que revisar.</p></article>
      </section>

      <section className="practice-showcase">
        <div className="showcase-question-wrap">
          <div className="showcase-question-card">
            <div className="showcase-tags"><span>{labels[featuredQuestion.discipline]}</span><span>{syllabusTopics.find((topic) => topic.id === featuredQuestion.topicId)?.title}</span></div>
            <p className="showcase-prompt">{featuredQuestion.prompt}</p>
            <div className="showcase-options">{featuredQuestion.options.slice(0, 3).map((option) => <div className={`showcase-option${option.id === featuredQuestion.correctOption ? ' is-answer' : ''}`} key={option.id}><b>{option.id === featuredQuestion.correctOption ? '✓' : option.id}</b><span>{option.text}</span></div>)}</div>
            <small className="showcase-origin">{featuredQuestion.provenance.label}</small>
          </div>
          <div className="showcase-timer"><small>TEMPO DE PROVA</small><b>03:00:00</b></div>
          <div className="showcase-score"><small>SEU APROVEITAMENTO</small><b>{accuracy === null ? '—' : `${accuracy}%`}</b></div>
        </div>
        <div className="showcase-copy"><span className="eyebrow">NA PRÁTICA</span><h2>Errou? Ótimo. É aqui que se aprende.</h2><p>Cada resposta tem comentário e explicação. Você entende o raciocínio, identifica o tipo de erro e pode voltar à questão depois.</p><NavLink to="/erros" className="handwritten-hint">Abra seu caderno de erros ↗</NavLink><p className="key-hint">No treino: use as teclas A, B, C, D e Enter.</p></div>
      </section>

      <section className="exam-score-panel"><div className="score-panel-kicker">COMO A PROVA OBJETIVA É MONTADA</div><div className="score-bar" aria-hidden="true"><i /><i /><i /></div><div className="score-columns">{(Object.keys(disciplineRules) as Discipline[]).map((discipline) => <article className={`score-column score-${discipline}`} key={discipline}><strong>{disciplineRules[discipline].maxPoints}<small> pts</small></strong><h3>{labels[discipline]}</h3><p>{disciplineRules[discipline].questionCount} questões, peso {disciplineRules[discipline].pointsPerQuestion}</p></article>)}</div><div className="score-rule">São 100 pontos no total. Fica de fora quem fizer menos de 50 ou zerar alguma disciplina.</div></section>

      <aside className="honest-note"><span aria-hidden="true">ⓘ</span><p>A data da prova ({prettyDate(contest.examDate)}) ainda é prevista; confira os canais da Prefeitura e da banca. Cada questão informa sua origem: prova anterior ou item de treino. Use os comentários junto com o edital e mantenha uma rotina que você consiga sustentar.</p></aside>
      <footer className="landing-footer"><span>Feito para quem estuda para Queimados/RJ e sabe que cada ponto conta.</span><span>Preparatório independente, sem vínculo com a Prefeitura ou a banca.</span></footer>
    </div>
  );
}

/* =========================================================================
   PÁGINA 2: GUIA COMPLETO DO EDITAL OFICIAL 01/2026
   ========================================================================= */
function EditalGuidePage() {
  return (
    <>
      <PageTitle kicker="EDITAL OFICIAL 01/2026" title="Guia Definitivo do Concurso de Queimados">
        Todas as informações essenciais do edital de abertura publicado pelo Instituto de Avaliação Nacional (IAN) para o cargo de Agente Administrativo e visão geral do certame.
      </PageTitle>

      <div className="edital-card-grid">
        <div className="info-box">
          <h3>Cargo em Destaque</h3>
          <p>{contest.role}</p>
          <small>{contest.department} · {contest.educationRequired}</small>
        </div>

        <div className="info-box">
          <h3>Remuneração & Benefícios</h3>
          <p>R$ {contest.baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <small>+ {contest.benefits} (Item 2.1.1 do Edital)</small>
        </div>

        <div className="info-box">
          <h3>Total de Vagas do Cargo</h3>
          <p>{contest.totalVacancies} imediatas + CR</p>
          <small>{contest.vacanciesAmpla} Ampla Concorrência | {contest.vacanciesPcd} PcD | {contest.vacanciesCotas} Cotas Étnicas</small>
        </div>

        <div className="info-box">
          <h3>Data & Horário da Prova</h3>
          <p>22/11/2026 · Domingo (Tarde)</p>
          <small>Horário: 14h às 17h (Portões fecham às 14h em ponto)</small>
        </div>

        <div className="info-box">
          <h3>Duração & Permanência</h3>
          <p>3 Horas de Prova (180 min)</p>
          <small>Saída mínima: após 1h. Levar caderno: somente após 2h de prova.</small>
        </div>

        <div className="info-box">
          <h3>O que levar no dia</h3>
          <p>Caneta transparente + Doc. Físico</p>
          <small>Caneta azul ou preta em tubo transparente. Documento ORIGINAL físico com foto (digital não é aceito!).</small>
        </div>
      </div>

      <section className="panel" style={{ marginTop: '20px' }}>
        <h2>
          <span>Estrutura de Pontuação e Regras Eliminatórias</span>
          <span className="badge badge-alert">Cuidado Redobrado</span>
        </h2>
        <p>
          A prova objetiva vale no total <strong>100 pontos</strong> e possui critérios eliminatórios estritos que você precisa memorizar:
        </p>
        <div className="plan-list">
          <div className="plan-row">
            <b>Língua Portuguesa</b>
            <span>10 questões · Peso 2,0 por questão</span>
            <strong>Máx. 20 pontos</strong>
          </div>
          <div className="plan-row">
            <b>Legislação Municipal</b>
            <span>5 questões · Peso 1,0 por questão (Lei Orgânica e Lei 1.060/2011)</span>
            <strong>Máx. 5 pontos</strong>
          </div>
          <div className="plan-row">
            <b>Conhecimentos Específicos</b>
            <span>15 questões · Peso 5,0 por questão (Administração, O&M, AFO, RH, Estoques, Arquivo, Informática)</span>
            <strong>Máx. 75 pontos</strong>
          </div>
        </div>

        <div className="pegadinha-alert" style={{ marginTop: '16px' }}>
          <strong>⚠️ REGRAS DE ELIMINAÇÃO SUMÁRIA (Item 9.1.13 e 9.1.14 do Edital):</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
            <li>Será REPROVADO quem fizer menos de 50% dos pontos (menos de 50 pontos).</li>
            <li>Será REPROVADO E ELIMINADO AUTOMATICAMENTE o candidato que obtiver <strong>NOTA ZERO</strong> em qualquer uma das três disciplinas!</li>
          </ul>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '24px' }}>
        <h2>Cronograma Oficial do Concurso (Anexo II do Edital)</h2>
        <div className="timeline">
          {scheduleTimeline.map((item, idx) => (
            <div key={idx} className={`timeline-item ${item.phase === 'highlight' ? 'highlight' : ''}`}>
              <span className="timeline-date">{item.date}</span>
              <span className="timeline-desc">
                {item.phase === 'highlight' ? <strong>{item.event}</strong> : item.event}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* =========================================================================
   PÁGINA 3: BANCO DE QUESTÕES & PRÁTICA INTERATIVA
   ========================================================================= */
function Practice({
  onAnswer,
  allowedIds,
  simulation = false
}: {
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string) => void;
  allowedIds?: string[];
  simulation?: boolean;
}) {
  const [discipline, setDiscipline] = useState<Discipline | 'all'>('all');
  const [topic, setTopic] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'real' | 'training'>('all');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<OptionId | ''>('');
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState<ErrorReason>('unknown_content');
  const [confidence, setConfidence] = useState<Attempt['confidence']>('sure');
  const [showTip, setShowTip] = useState(false);

  const pool = useMemo(() => {
    return questions.filter((q) => {
      if (allowedIds && !allowedIds.includes(q.id)) return false;
      if (discipline !== 'all' && q.discipline !== discipline) return false;
      if (topic !== 'all' && q.topicId !== topic) return false;
      if (filterType === 'real' && q.provenance.kind === 'original') return false;
      if (filterType === 'training' && q.provenance.kind !== 'original') return false;
      return true;
    });
  }, [discipline, topic, filterType, allowedIds]);

  const q = pool.length ? pool[index % pool.length] : undefined;

  useEffect(() => {
    setIndex(0);
    setChoice('');
    setShow(false);
    setShowTip(false);
  }, [discipline, topic, filterType]);

  const submit = () => {
    if (!q || !choice) return;
    const isCorrect = choice === q.correctOption;
    onAnswer(q.id, choice, isCorrect, isCorrect ? undefined : reason, confidence, sessionId);
    setShow(true);
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setChoice('');
    setShow(false);
    setShowTip(false);
  };

  useEffect(() => {
    const handleKeyboardAnswer = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName) || target.isContentEditable)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const key = event.key.toUpperCase();
      if (!show && ['A', 'B', 'C', 'D'].includes(key)) {
        event.preventDefault();
        setChoice(key as OptionId);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (show) nextQuestion();
        else if (choice) submit();
      }
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [choice, confidence, q?.id, reason, show]);

  const isRealContest = q && (q.provenance.kind === 'official' || q.provenance.kind === 'third_party');

  return (
    <>
      <PageTitle
        kicker={simulation ? 'TREINO COM TEMPO' : 'PRÁTICA ATIVA'}
        title={simulation ? 'Simulado por Matéria' : 'Banco de Questões Comentadas'}
      >
        Pratique questões de concursos anteriores e itens inéditos de treino. Confira a origem indicada em cada questão e use os comentários para decidir o que revisar.
      </PageTitle>

      <div className="filter-pill-group">
        <button
          className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          Todas as Questões ({questions.length})
        </button>
        <button
          className={`filter-pill ${filterType === 'real' ? 'active' : ''}`}
          onClick={() => setFilterType('real')}
        >
          Provas anteriores com fonte ({questions.filter((item) => item.provenance.kind !== 'original').length})
        </button>
        <button
          className={`filter-pill ${filterType === 'training' ? 'active' : ''}`}
          onClick={() => setFilterType('training')}
        >
          Treino Direcionado no Conteúdo
        </button>
      </div>

      <div className="filters">
        <label>
          Disciplina
          <select value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline | 'all')}>
            <option value="all">Todas as Disciplinas</option>
            {Object.entries(labels).map(([k, v]) => (
              <option key={k} value={k}>
                {v} ({disciplineRules[k as Discipline].weightPct}% da nota)
              </option>
            ))}
          </select>
        </label>

        <label>
          Tópico do Edital
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">Todos os Assuntos</option>
            {syllabusTopics
              .filter((t) => discipline === 'all' || t.discipline === discipline)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </label>
      </div>

      {q ? (
        <article className="question-card">
          <div className="question-meta">
            <div className="question-meta-tags">
              <span className="badge badge-neutral">{labels[q.discipline]}</span>
              {isRealContest ? (
                <span className="badge badge-real">
                  {q.provenance.banca ? `${q.provenance.banca} · ${q.provenance.year || ''}` : 'Concurso Anterior'}
                </span>
              ) : (
                <span className="badge badge-neutral">Inédita / Treino</span>
              )}
              <span className="badge badge-weight">
                {q.discipline === 'specific_knowledge' ? 'Peso 5,0 (Específica)' : q.discipline === 'portuguese' ? 'Peso 2,0' : 'Peso 1,0'}
              </span>
            </div>
            <div style={{ color: '#5f7771', fontSize: '12px' }}>
          {q.provenance.contest ? `${q.provenance.contest} · ${q.provenance.year}` : q.provenance.label}
            </div>
          </div>

          <h2>{q.prompt}</h2>

          <div className="option-list">
            {q.options.map((o) => (
              <button
                key={o.id}
                disabled={show}
                aria-pressed={choice === o.id}
                onClick={() => setChoice(o.id)}
                className={`option${choice === o.id ? ' selected' : ''}${
                  show && o.id === q.correctOption ? ' correct' : ''
                }${show && choice === o.id && choice !== q.correctOption ? ' incorrect' : ''}`}
              >
                <b>{o.id}</b>
                <span>{o.text}</span>
              </button>
            ))}
          </div>

          {!show && (
            <div className="question-controls">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', color: '#506862' }}>
                  Nível de Certeza:
                  <select value={confidence} onChange={(e) => setConfidence(e.target.value as Attempt['confidence'])} style={{ minHeight: '36px', marginTop: '4px' }}>
                    <option value="sure">Tenho certeza</option>
                    <option value="doubt">Em dúvida</option>
                    <option value="guess">Chutei</option>
                  </select>
                </label>

                {choice && choice !== q.correctOption && (
                  <label style={{ fontSize: '12px', color: '#506862' }}>
                    Motivo do erro:
                    <select value={reason} onChange={(e) => setReason(e.target.value as ErrorReason)} style={{ minHeight: '36px', marginTop: '4px' }}>
                      {Object.entries(errorLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowTip(!showTip)}
                >
                  💡 {showTip ? 'Ocultar orientação' : 'Ver orientação'}
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!choice}
                  onClick={submit}
                >
                  Confirmar Resposta
                </button>
              </div>
            </div>
          )}

          {showTip && !show && (
            <div className="pegadinha-alert" style={{ marginTop: '16px' }}>
            <strong>Uma forma de começar:</strong> identifique o que o enunciado pede e procure no tópico a regra que resolve a questão.
            </div>
          )}

          {show && (
            <div className={`feedback ${choice === q.correctOption ? 'is-correct' : 'is-wrong'}`}>
              <strong>
                {choice === q.correctOption ? '✓ Resposta Correta! Excelente!' : '✕ Não foi dessa vez. Revise a fundamentação:'}
              </strong>
              <p>{q.explanation}</p>
              <div style={{ marginTop: '16px' }}>
                <button className="button button-primary" onClick={nextQuestion}>
                  Próxima Questão →
                </button>
              </div>
            </div>
          )}

          <div className="question-count">
            Questão {index + 1} de {pool.length} disponíveis neste filtro
          </div>
        </article>
      ) : (
        <div className="panel">
          <h2>Nenhuma questão encontrada</h2>
          <p>Tente ajustar os filtros acima para visualizar mais questões do banco.</p>
          <button className="button button-secondary" onClick={() => { setDiscipline('all'); setTopic('all'); setFilterType('all'); }}>
            Limpar Filtros
          </button>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   PÁGINA 4: SIMULADOR REALISTA (3 HORAS / 30 QUESTÕES)
   ========================================================================= */
function ExamSimulator({
  onAnswer
}: {
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string) => void;
}) {
  const [items, setItems] = useState<typeof questions>([]);
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(contest.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    points: number;
    correct: number;
    zero: string[];
    by: Record<Discipline, { hits: number; total: number; points: number }>;
    elapsed: number;
  }>(null);

  // Timer
  useEffect(() => {
    if (!items.length || result || isPaused) return;
    const timer = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [items.length, result, isPaused]);

  useEffect(() => {
    if (items.length && seconds === 0 && !result) {
      finish();
    }
  }, [seconds]);

  const begin = () => {
    // Monta a prova exata: 10 de Português, 5 de Legislação Municipal, 15 de Conhecimentos Específicos
    const getSample = (d: Discipline, count: number) => {
      return [...questions.filter((q) => q.discipline === d)].sort(() => Math.random() - 0.5).slice(0, count);
    };

    const simItems = [
      ...getSample('portuguese', disciplineRules.portuguese.questionCount),
      ...getSample('municipal_law', disciplineRules.municipal_law.questionCount),
      ...getSample('specific_knowledge', disciplineRules.specific_knowledge.questionCount)
    ];

    setItems(simItems);
    setAnswers({});
    setIndex(0);
    setSeconds(contest.durationMinutes * 60);
    setIsPaused(false);
    setSessionId(crypto.randomUUID());
    setResult(null);
  };

  const finish = () => {
    if (!items.length || result) return;
    const by: Record<Discipline, { hits: number; total: number; points: number }> = {
      portuguese: { hits: 0, total: 0, points: 0 },
      municipal_law: { hits: 0, total: 0, points: 0 },
      specific_knowledge: { hits: 0, total: 0, points: 0 }
    };

    let hits = 0;
    for (const q of items) {
      const isCorrect = answers[q.id] === q.correctOption;
      by[q.discipline].total++;
      if (isCorrect) {
        hits++;
        by[q.discipline].hits++;
        by[q.discipline].points += disciplineRules[q.discipline].pointsPerQuestion;
      }
      if (answers[q.id]) {
        onAnswer(q.id, answers[q.id], isCorrect, isCorrect ? undefined : 'unknown_content', 'sure', sessionId ?? undefined);
      }
    }

    const totalPoints = Object.values(by).reduce((acc, curr) => acc + curr.points, 0);
    const zeroDisc = (Object.keys(by) as Discipline[]).filter((d) => by[d].hits === 0).map((d) => labels[d]);

    setResult({
      points: totalPoints,
      correct: hits,
      zero: zeroDisc,
      by,
      elapsed: contest.durationMinutes * 60 - seconds
    });
  };

  const q = items[index];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = items.length ? Math.round((answeredCount / items.length) * 100) : 0;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (result) {
    const isApproved = result.points >= contest.minimumScore && result.zero.length === 0;
    return (
      <>
        <PageTitle
          kicker="RESULTADO OFICIAL DO SIMULADO"
          title={`${result.points.toFixed(1)} de 100 Pontos`}
        >
          Você acertou {result.correct} de {items.length} questões em {Math.floor(result.elapsed / 60)} minutos e {result.elapsed % 60} segundos. Este resultado é um diagnóstico de treino, não uma previsão de classificação.
        </PageTitle>

        <section className="panel">
          <h2>
            <span>{isApproved ? '🎉 Parabéns! Você seria Classificado(a)' : '⚠️ Atenção aos Critérios de Aprovação'}</span>
            <span className={`badge ${isApproved ? 'badge-real' : 'badge-alert'}`}>
              {isApproved ? 'Critérios mínimos atingidos' : 'Critérios mínimos não atingidos'}
            </span>
          </h2>

          {result.zero.length > 0 && (
            <div className="pegadinha-alert" style={{ background: '#feeaea', borderColor: '#e53935', color: '#991b1b', marginBottom: '20px' }}>
              <strong>⛔ ELIMINAÇÃO AUTOMÁTICA (Item 9.1.13):</strong> Você obteve NOTA ZERO em {result.zero.join(', ')}. No edital de Queimados, zerar qualquer disciplina acarreta eliminação imediata, independentemente da nota total!
            </div>
          )}

          {result.points < contest.minimumScore && (
            <div className="pegadinha-alert" style={{ marginBottom: '20px' }}>
              <strong>Pontuação Mínima Não Atingida:</strong> O edital exige no mínimo 50,0 pontos no somatório total da prova objetiva.
            </div>
          )}

          <h3 style={{ margin: '20px 0 10px', fontSize: '16px' }}>Desempenho por Disciplina:</h3>
          <div className="plan-list">
            {(Object.keys(result.by) as Discipline[]).map((d) => {
              const item = result.by[d];
              return (
                <div className="plan-row" key={d}>
                  <b>{labels[d]}</b>
                  <span>{item.hits} de {item.total} acertos ({item.total ? Math.round((item.hits / item.total) * 100) : 0}%)</span>
                  <strong>{item.points.toFixed(1)} / {disciplineRules[d].maxPoints} pts</strong>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="button button-primary" onClick={begin}>
              Refazer Novo Simulado (3 Horas)
            </button>
            <button className="button button-secondary" onClick={() => setResult(null)}>
              Voltar ao Início do Simulado
            </button>
          </div>
        </section>

        <section className="panel" style={{ marginTop: '24px' }}>
          <h2>Revisão Detalhada das 30 Questões do Simulado</h2>
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            {items.map((simQ, idx) => {
              const userPick = answers[simQ.id];
              const hit = userPick === simQ.correctOption;
              return (
                <div key={simQ.id} style={{ padding: '16px', border: '1px solid #d8e3de', borderRadius: '12px', background: hit ? '#f4fbf7' : '#fff7f7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', fontWeight: 700 }}>
                    <span style={{ color: hit ? '#13794b' : '#b92828' }}>
                      Questão {idx + 1}: {hit ? '✓ Acertou' : '✕ Errou'} (Sua resposta: {userPick || 'Em branco'} | Gabarito: {simQ.correctOption})
                    </span>
                    <span style={{ color: '#68827b' }}>{labels[simQ.discipline]}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#172c2b' }}>{simQ.prompt}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#465f58', lineHeight: 1.5 }}>
                    <strong>Comentário:</strong> {simQ.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <PageTitle kicker="FORMATO OFICIAL DO EDITAL 01/2026" title="Simulador de Prova Completa">
          30 questões autorais de treino na distribuição e nos pesos previstos no edital, com cronômetro de até 3 horas e critérios de aprovação do certame.
        </PageTitle>

        <section className="panel">
          <h2>Como funciona o Simulado:</h2>
          <ul>
            <li><strong>10 questões de Português</strong> (peso 2,0 = até 20 pontos)</li>
            <li><strong>05 questões de Legislação Municipal</strong> (peso 1,0 = até 5 pontos)</li>
            <li><strong>15 questões de Conhecimentos Específicos</strong> (peso 5,0 = até 75 pontos)</li>
            <li><strong>Tempo total:</strong> 3 horas (180 minutos) com alerta regressivo.</li>
            <li><strong>Critério eliminatório:</strong> Precisa de 50+ pontos e NÃO PODE ZERAR nenhuma matéria!</li>
          </ul>

          <div className="pegadinha-alert" style={{ margin: '20px 0' }}>
            <strong>💡 Dica do Concurseiro:</strong> Reserve os últimos 20 minutos apenas para revisar o cartão-resposta e garantir que nenhuma questão ficou em branco.
          </div>

          <button className="button button-primary" onClick={begin}>
            Iniciar simulado completo →
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <section className={`exam-header${isPaused ? ' is-paused' : ''}`} aria-label="Painel do simulado">
        <div className="exam-header-main">
          <div className="exam-header-copy">
            <span className="eyebrow" style={{ margin: 0 }}>{isPaused ? 'PAUSA ATIVA' : 'SIMULADO EM ANDAMENTO'}</span>
            <div className="exam-title-line">Questão {String(index + 1).padStart(2, '0')} <span>/ {items.length}</span><i>·</i>{labels[q.discipline]}</div>
          </div>
          <div className="exam-controls">
            <button className="button button-secondary exam-pause-button" type="button" onClick={() => setIsPaused((paused) => !paused)} aria-label={isPaused ? 'Retomar prova' : 'Pausar prova'}>
              {isPaused ? '▶ Retomar' : 'Ⅱ Pausar'}
            </button>
            <div className="exam-clock-shell"><span className="exam-clock-orbit" aria-hidden="true" /><div className={`exam-clock ${seconds < 1800 ? 'warning' : ''}`} aria-label={`Tempo restante ${hh}:${mm}:${ss}`}>◷ {hh}:{mm}:{ss}</div></div>
          </div>
        </div>
        <div className="exam-hud">
          <div className="exam-hud-orb" aria-label={`${answeredCount} de ${items.length} questões respondidas`}>
            <svg viewBox="0 0 52 52" aria-hidden="true"><circle className="hud-ring-bg" cx="26" cy="26" r="21" /><circle className="hud-ring-value" cx="26" cy="26" r="21" style={{ strokeDasharray: `${(progressPercent / 100) * 132} 132` }} /></svg>
            <strong>{String(answeredCount).padStart(2, '0')}</strong>
          </div>
          <div className="exam-hud-progress">
            <div className="exam-progress-labels"><span>PROGRESSO DA PROVA</span><span>{answeredCount} respondidas <i>·</i> {items.length - answeredCount} em branco</span></div>
            <div className="exam-progress-track" role="progressbar" aria-label="Progresso do simulado" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={answeredCount}><span style={{ width: `${progressPercent}%` }} /></div>
            <div className="exam-hud-foot"><span>{disciplineRules[q.discipline].pointsPerQuestion.toFixed(0)} pts esta questão</span><span>Pesos do edital 2 · 1 · 5</span></div>
          </div>
        </div>
      </section>

      <article className="question-card">
        {isPaused && <div className="exam-paused-banner" role="status"><span aria-hidden="true">Ⅱ</span><div><strong>SIMULADO PAUSADO</strong><small>O cronômetro parou e as respostas estão bloqueadas. Retome quando estiver pronto.</small></div></div>}
        <div className="question-meta">
          <div className="exam-question-label"><span>QUESTÃO {String(index + 1).padStart(2, '0')}</span><span>·</span><span>{labels[q.discipline]}</span></div>
          <span className="badge badge-weight">
            Valor: {disciplineRules[q.discipline].pointsPerQuestion.toFixed(1)} pts
          </span>
        </div>

        <h2>{q.prompt}</h2>

        <div className="option-list">
          {q.options.map((o) => (
            <button
              key={o.id}
              disabled={isPaused}
              className={`option${answers[q.id] === o.id ? ' selected' : ''}`}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
            >
              <b>{o.id}</b>
              <span>{o.text}</span>
            </button>
          ))}
        </div>

        <div style={{ margin: '24px 0 10px', fontSize: '12px', fontWeight: 700, color: '#566e67' }}>
          CARTÃO DE RESPOSTAS (CLIQUE PARA NAVEGAR):
        </div>
        <div className="sim-nav">
          {items.map((it, i) => (
            <button
              key={it.id}
              disabled={isPaused}
              className={`sim-number${answers[it.id] ? ' answered' : ''}${i === index ? ' current' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir para questão ${i + 1}${answers[it.id] ? ', respondida' : ', em branco'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="sim-actions">
          <button
            className="button button-secondary"
            disabled={index === 0 || isPaused}
            onClick={() => setIndex((i) => i - 1)}
          >
            ← Questão Anterior
          </button>
          <button
            className="button button-secondary"
            disabled={index === items.length - 1 || isPaused}
            onClick={() => setIndex((i) => i + 1)}
          >
            Próxima Questão →
          </button>
          <button
            className="button button-primary"
            disabled={isPaused}
            onClick={() => {
              const answeredCount = Object.keys(answers).length;
              if (
                window.confirm(
                  `Deseja realmente entregar a prova agora?\nVocê preencheu ${answeredCount} de ${items.length} questões.`
                )
              ) {
                finish();
              }
            }}
          >
            Entregar Prova e Ver Gabarito
          </button>
        </div>
      </article>
    </>
  );
}

/* =========================================================================
   PÁGINA 5: DOSSIÊ QUEIMADOS & RESUMOS LEGISLATIVOS
   ========================================================================= */
function DossieQueimadosPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <PageTitle kicker="CONTEÚDO ESTRATÉGICO" title="Dossiê de Legislação Municipal de Queimados">
        Resumos esquematizados, pontos quentes e alertas de pegadinhas frequentes da Lei Orgânica e do Estatuto dos Servidores (Lei nº 1.060/2011).
      </PageTitle>

      <div style={{ display: 'grid', gap: '16px' }}>
        {dossieQueimados.map((section, sIdx) => (
          <section className="panel" key={sIdx}>
            <h2>
              <span>{section.title}</span>
              <span className="badge badge-real">{section.badge}</span>
            </h2>

            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {section.keyPoints.map((item, pIdx) => {
                const uniqueKey = sIdx * 10 + pIdx;
                const isOpen = openIndex === uniqueKey;
                return (
                  <div className="law-item" key={pIdx}>
                    <div
                      className="law-header"
                      onClick={() => setOpenIndex(isOpen ? null : uniqueKey)}
                    >
                      <span>📌 {item.heading}</span>
                      <span>{isOpen ? '▲' : '▼'}</span>
                    </div>
                    {isOpen && (
                      <div className="law-body">
                        <p style={{ margin: 0 }}>{item.description}</p>
                        {item.importantAlert && (
                          <div className="pegadinha-alert">
                            <strong>⚠️ PONTO QUENTE EM PROVA:</strong> {item.importantAlert}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

/* =========================================================================
   PÁGINA 6: CADERNO DE ERROS (INTELIGÊNCIA DE REVISÃO)
   ========================================================================= */
function CadernoErros({
  attempts,
  onAnswer
}: {
  attempts: Attempt[];
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string) => void;
}) {
  return <ErrorTutor attempts={attempts} onAnswer={onAnswer} />;
}

/* =========================================================================
   PÁGINA 7: PLANO DE ESTUDO & CICLO DE HORAS
   ========================================================================= */
function StudyPlan({ attempts }: { attempts: Attempt[] }) {
  const [minutes, setMinutes] = useState(() => Number(localStorage.getItem('rq-minutes') || 90));
  const total = attempts.length;

  return (
    <>
      <PageTitle kicker="ROTINA EQUILIBRADA" title="Ciclo de Estudos Personalizado">
        Distribua suas horas de estudo diárias proporcionalmente ao peso do edital de Queimados.
      </PageTitle>

      <section className="panel">
        <label>
          Quantos minutos você tem para estudar por dia?
          <input
            type="number"
            min="20"
            max="600"
            step="10"
            value={minutes}
            onChange={(e) => {
              const n = Math.max(20, Number(e.target.value));
              setMinutes(n);
              localStorage.setItem('rq-minutes', String(n));
            }}
            style={{ maxWidth: '240px', marginTop: '6px' }}
          />
        </label>

        <div className="plan-list">
          {[
            ['Conhecimentos Específicos', 'O núcleo decisivo: 75% da sua nota (Administração, O&M, AFO, RH, Materiais)', Math.round(minutes * 0.55)],
            ['Língua Portuguesa', 'Interpretação de textos e gramática prevista no conteúdo programático (20% da prova)', Math.round(minutes * 0.25)],
            ['Legislação Municipal', 'Leitura da Lei Orgânica e Lei 1.060/2011 (Imprescindível não zerar!)', Math.round(minutes * 0.12)],
            ['Revisão do Caderno de Erros', 'Refazer questões erradas e fixar conceitos difíceis', Math.round(minutes * 0.08)]
          ].map(([a, b, c]) => (
            <div className="plan-row" key={String(a)}>
              <b>{a}</b>
              <span>{b}</span>
              <strong>{c} min/dia</strong>
            </div>
          ))}
        </div>

        <p className="muted">
          Total de questões resolvidas até o momento: <strong>{total}</strong>. A constância de 1 hora por dia supera maratonas de fim de semana.
        </p>
      </section>
    </>
  );
}

/* =========================================================================
   PÁGINA 8: PROGRESSO & ESTATÍSTICAS
   ========================================================================= */
function Progress({ attempts }: { attempts: Attempt[] }) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;

  return (
    <>
      <PageTitle kicker="SEU PAINEL DE DADOS" title="Evolução e Estatísticas">
        Acompanhe seus índices de acerto por matéria e descubra onde focar seus próximos esforços de revisão.
      </PageTitle>

      <div className="metric-grid">
        <Metric label="Total Resolvidas" value={total} />
        <Metric label="Acertos" value={correct} />
        <Metric label="Erros" value={total - correct} />
        <Metric label="Taxa de Precisão" value={`${total ? Math.round((correct / total) * 100) : 0}%`} />
      </div>

      <section className="panel">
        <h2>Desempenho por Matéria</h2>
        {Object.entries(labels).map(([key, label]) => {
          const set = attempts.filter((a) => questions.find((q) => q.id === a.questionId)?.discipline === key);
          const pct = set.length ? Math.round((set.filter((a) => a.correct).length / set.length) * 100) : 0;
          return (
            <div className="progress-row" key={key}>
              <div>
                <span>{label}</span>
                <b>{pct}% ({set.length} resolvidas)</b>
              </div>
              <progress value={pct} max="100" />
            </div>
          );
        })}
      </section>

      <section className="panel" style={{ marginTop: '20px' }}>
        <h2>Principais Causas de Erro Registradas</h2>
        {Object.entries(errorLabels).map(([key, label]) => {
          const n = attempts.filter((a) => a.errorReason === key).length;
          return n ? (
            <div className="plan-row" key={key}>
              <span>{label}</span>
              <b>{n} ocorrência(s)</b>
            </div>
          ) : null;
        })}
        {!attempts.some((a) => a.errorReason) && (
          <p className="muted">Seus motivos de erro aparecerão aqui quando você marcar ao errar uma questão.</p>
        )}
      </section>

      <div style={{ marginTop: '24px' }}>
        <button
          className="button button-secondary"
          onClick={() => {
            if (window.confirm('Tem certeza de que deseja resetar todo o histórico de questões deste dispositivo?')) {
              localStorage.removeItem('rq-attempts');
              window.location.reload();
            }
          }}
        >
          Resetar Histórico deste Navegador
        </button>
      </div>
    </>
  );
}

/* =========================================================================
   COMPONENTE PRINCIPAL (LAYOUT & ROTAS)
   ========================================================================= */
function AppContent() {
  const [attempts, setAttempts] = useState<Attempt[]>(storedAttempts);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('rq-theme') === 'light' ? 'light' : 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    localStorage.setItem('rq-attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('rq-theme', theme);
  }, [theme]);

  const record = (
    questionId: string,
    selectedOption: OptionId,
    correct: boolean,
    errorReason?: ErrorReason,
    confidence: Attempt['confidence'] = 'sure',
    sessionId?: string
  ) => {
    setAttempts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        questionId,
        selectedOption,
        correct,
        errorReason,
        confidence,
        sessionId,
        answeredAt: new Date().toISOString(),
        elapsedSeconds: 0
      }
    ]);
  };

  return (
    <div className={`app-shell${isLanding ? ' landing-shell' : ''}`} data-testid="app-shell" data-theme={theme}>
      <aside className="sidebar" aria-label="Navegação principal">
        <NavLink className="brand" to="/" end>
          <span className="brand-symbol">Q</span>
          <span className="brand-name">
            Rumo a <b>Queimados</b>
            <small>Preparatório 2026</small>
          </span>
        </NavLink>

        <div className="nav-caption">ESTUDOS & TREINO</div>
        <nav className="side-navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="status-dot" /> Suas respostas ficam salvas neste navegador.
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">PREFEITURA MUNICIPAL DE QUEIMADOS · RJ</span>
            <span className="topbar-title">Preparatório — Agente Administrativo</span>
          </div>
          <div className="topbar-actions">
            <div className="topbar-date">
              <span className="status-dot" /> Prova em <b>{prettyDate(contest.examDate)} (Tarde)</b>
            </div>
            <button className="workspace-theme-toggle" type="button" aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}>
              <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
              <span>{theme === 'dark' ? 'Tema claro' : 'Tema escuro'}</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage attempts={attempts} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} />} />
            <Route path="/edital" element={<EditalGuidePage />} />
            <Route path="/questoes" element={<Practice onAnswer={record} />} />
            <Route path="/simulados" element={<ExamSimulator onAnswer={record} />} />
            <Route path="/erros" element={<CadernoErros attempts={attempts} onAnswer={record} />} />
            <Route path="/legislacao" element={<DossieQueimadosPage />} />
            <Route
              path="/conteudos"
              element={
                <>
                  <PageTitle kicker="EDITAL VERTICALIZADO" title="Conteúdos Programáticos Oficiais">
                    Consulte todo o conteúdo programático do edital de Agente Administrativo e acesse as questões específicas de cada matéria.
                  </PageTitle>
                  {Object.entries(labels).map(([discipline, label]) => (
                    <section className="panel syllabus" key={discipline} style={{ marginBottom: '16px' }}>
                      <h2>
                        <span>{label}</span>
                        <span className="badge badge-neutral">
                          {syllabusTopics.filter((t) => t.discipline === discipline).length} tópicos
                        </span>
                      </h2>
                      {syllabusTopics
                        .filter((t) => t.discipline === discipline)
                        .map((t) => (
                          <details key={t.id} style={{ padding: '12px 0', borderTop: '1px solid #e1ebe6' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#163330' }}>
                              {t.title}
                            </summary>
                            <p style={{ margin: '8px 0', color: '#526b64', fontSize: '13.5px' }}>{t.summary}</p>
                            <button className="text-button" onClick={() => navigate('/questoes')}>
                              Praticar questões deste tema →
                            </button>
                          </details>
                        ))}
                    </section>
                  ))}
                </>
              }
            />
            <Route path="/plano" element={<StudyPlan attempts={attempts} />} />
            <Route path="/progresso" element={<Progress attempts={attempts} />} />
            <Route
              path="/fontes"
              element={
                <>
                  <PageTitle kicker="BIBLIOTECA DE ESTUDO" title="Aulas, questões e fontes confiáveis">
                    Materiais organizados para estudar o edital de Agente Administrativo de Queimados. Comece pelo documento oficial, estude um tópico e pratique questões logo depois.
                  </PageTitle>
                  {([
                    ['official', 'Documentos oficiais e legislação'],
                    ['questions', 'Bancos de questões e provas'],
                    ['videos', 'Videoaulas gratuitas'],
                    ['platforms', 'Plataformas e limites do plano grátis'],
                    ['paid', 'Material pago']
                  ] as const).map(([category, heading]) => {
                    const items = sourceLinks.filter((source) => source.category === category);
                    if (!items.length) return null;
                    return (
                      <section className="source-group" key={category} aria-labelledby={`sources-${category}`}>
                        <div className="source-group-heading">
                          <h2 id={`sources-${category}`}>{heading}</h2>
                          <span>{items.length} {items.length === 1 ? 'recurso' : 'recursos'}</span>
                        </div>
                        <div className="source-grid">
                          {items.map((s) => (
                            <article className="panel source" key={s.id}>
                              <div className="source-meta">
                                <span>{s.discipline || (s.type === 'official' ? 'Fonte oficial' : 'Material complementar')}</span>
                                <span>{s.access}</span>
                              </div>
                              <h3>{s.title}</h3>
                              <p>{s.note}</p>
                              {s.url && (
                                <a href={s.url} target="_blank" rel="noreferrer" className="button button-secondary" style={{ display: 'inline-flex' }}>
                                  {s.type === 'official' ? 'Abrir fonte oficial ↗' : category === 'videos' ? 'Assistir aula ↗' : category === 'questions' ? 'Praticar questões ↗' : 'Ver detalhes ↗'}
                                </a>
                              )}
                            </article>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </>
              }
            />
            <Route
              path="*"
              element={<PageTitle kicker="404" title="Página Não Encontrada" />}
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <div>
            <strong>Rumo a Queimados 2026</strong> — Feito de concurseiro para concurseiro.
          </div>
          <span>Banca examinadora: Instituto de Avaliação Nacional (IAN)</span>
        </footer>
      </div>

      <nav className="mobile-navigation">
        {navigationItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <span>{item.icon}</span>
            <small>{item.shortLabel}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function App() {
  return <AppContent />;
}
