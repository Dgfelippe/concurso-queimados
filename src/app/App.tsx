import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { navigationItems } from './navigation';
import { questions } from '../data/questions';
import { syllabusTopics } from '../data/topics';
import { contest, disciplineRules, scheduleTimeline } from '../data/edital';
import { sourceLinks } from '../data/sources';
import { dossieQueimados } from '../data/queimados-dossie';
import type { Attempt, Discipline, ErrorReason, OptionId, Question } from '../domain/types';
import type { SimulationSession } from '../domain/types';
import {
  firebaseConfigured,
  loadCloudLearning,
  observeAuth,
  saveCloudAttempt,
  saveCloudSimulation,
  signInWithGoogle,
  signOutOfGoogle,
  subscribeToCloudLearning,
  syncLocalLearning,
  type User
} from '../services/firebase';
import { ErrorTutor } from './ErrorTutor';
import { AIQuestionStudio } from './AIQuestionStudio';
import { generateSimulationQuestions } from '../services/ai-study';
import { getAiUserMessage } from '../services/ai-errors';
import { selectDistinctPracticeGroups } from '../data/question-bank-expanded';
import { firebaseAiConfigured } from '../services/firebase';
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

const storedSimulations = (): SimulationSession[] => {
  try {
    return JSON.parse(localStorage.getItem('rq-simulations') || '[]') as SimulationSession[];
  } catch {
    return [];
  }
};

interface SavedActiveSimulation {
  items: Question[];
  answers: Record<string, OptionId>;
  index: number;
  seconds: number;
  isPaused: boolean;
  deadlineAt: number | null;
  sessionId: string;
  startedAt: string;
}

function readActiveSimulation(storageKey: string): SavedActiveSimulation | null {
  try {
    const data = JSON.parse(localStorage.getItem(`${storageKey}:data`) || 'null') as Pick<SavedActiveSimulation, 'items' | 'sessionId' | 'startedAt'> | null;
    const progress = JSON.parse(localStorage.getItem(`${storageKey}:progress`) || 'null') as Omit<SavedActiveSimulation, 'items' | 'sessionId' | 'startedAt'> | null;
    if (!data || !Array.isArray(data.items) || data.items.length === 0 || !data.sessionId || !progress || typeof progress.seconds !== 'number') return null;
    const seconds = progress.isPaused || !progress.deadlineAt
      ? Math.max(0, progress.seconds)
      : Math.max(0, Math.ceil((progress.deadlineAt - Date.now()) / 1000));
    return { ...data, ...progress, seconds, isPaused: true };
  } catch {
    return null;
  }
}

function clearActiveSimulation(storageKey: string) {
  localStorage.removeItem(`${storageKey}:data`);
  localStorage.removeItem(`${storageKey}:progress`);
}

function mergeById<T extends { id: string }>(local: T[], remote: T[]) {
  const merged = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) merged.set(item.id, item);
  return [...merged.values()];
}

const prettyDate = (date: string) => {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
  } catch {
    return date;
  }
};

function BrandLogo({ theme }: { theme: 'dark' | 'light' }) {
  const logo = theme === 'light' ? 'dg-concursos-logo-light.svg' : 'dg-concursos-logo.svg';
  return <img className="landing-brand-logo" src={`${import.meta.env.BASE_URL}${logo}`} alt="Dg Concursos" width="176" height="44" />;
}

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

const globeRadius = 108;
const networkPoints = Array.from({ length: 54 }, (_, index) => {
  const vertical = 1 - (2 * (index + 0.5)) / 54;
  const ringRadius = Math.sqrt(1 - vertical * vertical);
  const angle = index * 2.399963;
  return {
    x: Math.cos(angle) * ringRadius * globeRadius,
    y: vertical * globeRadius,
    z: Math.sin(angle) * ringRadius * globeRadius
  };
});
const networkEdges = networkPoints.flatMap((_, index) => [
  [index, (index + 7) % networkPoints.length] as const,
  [index, (index + 15) % networkPoints.length] as const
]);

function projectGlobe(rotationX: number, rotationY: number) {
  const sinX = Math.sin(rotationX);
  const cosX = Math.cos(rotationX);
  const sinY = Math.sin(rotationY);
  const cosY = Math.cos(rotationY);

  return networkPoints.map((point) => {
    const rotatedX = point.x * cosY + point.z * sinY;
    const depthAfterY = -point.x * sinY + point.z * cosY;
    const rotatedY = point.y * cosX - depthAfterY * sinX;
    const depth = point.y * sinX + depthAfterY * cosX;
    const perspective = 680 / (680 - depth);

    return {
      x: 160 + rotatedX * perspective,
      y: 150 + rotatedY * perspective,
      depth: depth / globeRadius
    };
  });
}

function QuestionGlobe() {
  const globeRef = useRef<SVGSVGElement>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const animationFrame = useRef<number | null>(null);
  const initialNodes = projectGlobe(0, 0);

  const animateGlobe = () => {
    const svg = globeRef.current;
    if (!svg) {
      animationFrame.current = null;
      return;
    }

    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.16;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.16;
    const projectedNodes = projectGlobe(currentRotation.current.x, currentRotation.current.y);
    const nodeElements = svg.querySelectorAll<SVGCircleElement>('.globe-dot');
    nodeElements.forEach((node, index) => {
      const point = projectedNodes[index];
      const front = (point.depth + 1) / 2;
      node.setAttribute('cx', point.x.toFixed(2));
      node.setAttribute('cy', point.y.toFixed(2));
      node.setAttribute('r', ((index % 5 === 0 ? 2.6 : 1.7) * (0.66 + front * 0.55)).toFixed(2));
      node.setAttribute('opacity', (0.22 + front * 0.78).toFixed(2));
    });

    const edgeElements = svg.querySelectorAll<SVGLineElement>('.globe-edge');
    edgeElements.forEach((line, index) => {
      const [startIndex, endIndex] = networkEdges[index];
      const start = projectedNodes[startIndex];
      const end = projectedNodes[endIndex];
      const depth = (start.depth + end.depth) / 2;
      line.setAttribute('x1', start.x.toFixed(2));
      line.setAttribute('y1', start.y.toFixed(2));
      line.setAttribute('x2', end.x.toFixed(2));
      line.setAttribute('y2', end.y.toFixed(2));
      line.setAttribute('opacity', (0.07 + ((depth + 1) / 2) * 0.3).toFixed(2));
    });

    const orbits = svg.querySelectorAll<SVGPathElement>('.globe-orbit');
    orbits[0]?.setAttribute('transform', `rotate(${(currentRotation.current.y * 180) / Math.PI} 160 150)`);
    orbits[1]?.setAttribute('transform', `rotate(${(currentRotation.current.x * 180) / Math.PI} 160 150)`);

    const unsettled = Math.abs(targetRotation.current.x - currentRotation.current.x) > 0.001 ||
      Math.abs(targetRotation.current.y - currentRotation.current.y) > 0.001;
    animationFrame.current = unsettled ? requestAnimationFrame(animateGlobe) : null;
  };

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  return (
    <div
      className="hero-visual"
      aria-label="Ilustração interativa das três matérias do concurso"
      onPointerMove={(event) => {
        if (event.pointerType === 'touch' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const previous = lastPointer.current;
        if (previous) {
          const deltaX = Math.max(-80, Math.min(80, event.clientX - previous.x));
          const deltaY = Math.max(-80, Math.min(80, event.clientY - previous.y));
          targetRotation.current.y += deltaX * 0.015;
          targetRotation.current.x -= deltaY * 0.012;
        }
        lastPointer.current = { x: event.clientX, y: event.clientY };
        if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(animateGlobe);
      }}
      onPointerLeave={() => { lastPointer.current = null; }}
    >
      <span className="visual-caption visual-caption-top">{questions.length} QUESTÕES NO BANCO</span>
      <svg ref={globeRef} className="network-globe" viewBox="0 0 320 300" role="img" aria-label="Esfera tridimensional giratória com pontos e conexões das matérias">
        <defs>
          <clipPath id="globe-clip"><circle cx="160" cy="150" r="126" /></clipPath>
          <radialGradient id="globe-shading" cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#445174" stopOpacity=".23" />
            <stop offset="72%" stopColor="#17202e" stopOpacity=".14" />
            <stop offset="100%" stopColor="#090c12" stopOpacity=".58" />
          </radialGradient>
        </defs>
        <circle cx="160" cy="150" r="126" className="globe-outline" />
        <g clipPath="url(#globe-clip)">
          <g className="globe-lines">
            {networkEdges.map(([startIndex, endIndex], index) => {
              const start = initialNodes[startIndex];
              const end = initialNodes[endIndex];
              return <line key={`edge-${index}`} className="globe-edge" x1={start.x} y1={start.y} x2={end.x} y2={end.y} opacity="0.22" />;
            })}
          </g>
          <g className="globe-nodes">
            {initialNodes.map((point, index) => <circle key={`node-${index}`} cx={point.x} cy={point.y} r={index % 5 === 0 ? 2.6 : 1.7} opacity={0.22 + ((point.depth + 1) / 2) * 0.78} className={`globe-dot tone-${index % 3}`} />)}
          </g>
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
function LandingPage({ attempts, theme, onToggleTheme, account, onSignOut }: { attempts: Attempt[]; theme: 'dark' | 'light'; onToggleTheme: () => void; account: User | null; onSignOut: () => void }) {
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : null;
  const targetDate = new Date(`${contest.examDate}T14:00:00`).getTime();
  const days = Math.max(0, Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24)));
  const featuredQuestion = questions.find((question) => question.discipline === 'portuguese') ?? questions[0];
  const topicNames = syllabusTopics.map((topic) => topic.title);

  return (
    <div className="reference-landing">
      <header className="landing-header">
        <NavLink className="landing-brand" to="/" aria-label="Dg Concursos, início"><BrandLogo theme={theme} /></NavLink>
        <div className="landing-header-actions">
          <button className="theme-toggle" type="button" aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} onClick={onToggleTheme}><span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span></button>
          <button className="landing-signin" type="button" onClick={onSignOut}>Sair</button>
        </div>
      </header>

      <section className="reference-hero">
        <div className="hero-copy">
          <div className="exam-date-pill"><span className="status-dot" /> Prova prevista para {prettyDate(contest.examDate)} · faltam <b>{days}</b> dias</div>
          <h1>Estude para Queimados com <span>método</span>, não no improviso.</h1>
          <p>Questões por assunto do edital, simulados no formato da prova e comentários que explicam o porquê de cada alternativa. Um passo de cada vez, com o que você precisa para avançar.</p>
          <div className="hero-actions"><NavLink className="landing-cta" to="/questoes">Começar a estudar <span aria-hidden="true">→</span></NavLink><small>É grátis. {account ? 'Seu progresso está vinculado à sua conta Google.' : firebaseConfigured ? 'Entre com Google para sincronizar entre aparelhos.' : 'Seu progresso fica salvo neste navegador.'}</small></div>
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
      <footer className="landing-footer"><span>Dg Concursos · Cada edital é um novo passo na sua preparação.</span><span>Material independente, sem vínculo com a Prefeitura ou a banca.</span></footer>
    </div>
  );
}

function EntryPage({
  theme,
  onToggleTheme,
  onSignIn,
  status,
  configured
}: {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSignIn: () => void;
  status: 'local' | 'syncing' | 'synced' | 'offline';
  configured: boolean;
}) {
  const targetDate = new Date(`${contest.examDate}T14:00:00`).getTime();
  const days = Math.max(0, Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24)));
  const busy = status === 'syncing';

  return (
    <main className="entry-page" data-theme={theme}>
      <div className="entry-wrap">
        <header className="landing-header entry-header">
          <NavLink className="landing-brand" to="/" aria-label="Dg Concursos, início"><BrandLogo theme={theme} /></NavLink>
          <div className="landing-header-actions">
            <button className="theme-toggle" type="button" aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} onClick={onToggleTheme}><span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span></button>
            <button className="landing-signin" type="button" onClick={onSignIn} disabled={!configured || busy}>Entrar</button>
          </div>
        </header>

        <section className="entry-hero">
          <div className="entry-copy">
            <div className="exam-date-pill"><span className="status-dot" /> Prova prevista para {prettyDate(contest.examDate)} · faltam <b>{days}</b> dias</div>
            <span className="eyebrow entry-eyebrow">PREPARATÓRIO · AGENTE ADMINISTRATIVO</span>
            <h1>Seu próximo passo começa com <span>foco.</span></h1>
            <p>Entre com sua conta Google para abrir as questões, simulados, revisões e acompanhar seu progresso de onde estiver.</p>
            <button className="entry-google-button" type="button" onClick={onSignIn} disabled={!configured || busy}>
              <span className="google-mark" aria-hidden="true">G</span>
              <span>{busy ? 'Conectando com o Google…' : 'Entrar com Google'}</span>
              {!busy && <span className="entry-arrow" aria-hidden="true">→</span>}
            </button>
            <div className="entry-assurance"><span aria-hidden="true">⌁</span><span>Seu histórico fica na sua conta e acompanha você no celular e no computador.</span></div>
            {!configured && <p className="entry-alert" role="alert">O acesso seguro ainda não foi configurado neste ambiente. Abra o site publicado para entrar.</p>}
            {configured && status === 'offline' && <p className="entry-alert" role="alert">Não foi possível concluir o acesso. Verifique sua conexão e tente novamente.</p>}
          </div>
          <div className="entry-visual-wrap">
            <div className="entry-visual-card">
              <div className="entry-visual-heading"><span className="status-dot" /> SUA PREPARAÇÃO, NO SEU RITMO</div>
              <QuestionGlobe />
              <div className="entry-visual-footer"><span>Questões comentadas</span><i /><span>Progresso sincronizado</span></div>
            </div>
          </div>
        </section>

        <section className="entry-benefits" aria-label="O que você encontra após entrar">
          <article><span>01</span><strong>Pratique</strong><small>Questões por matéria e simulados.</small></article>
          <article><span>02</span><strong>Entenda</strong><small>Revisões guiadas para aprender com os erros.</small></article>
          <article><span>03</span><strong>Acompanhe</strong><small>Seu histórico e desempenho sincronizados.</small></article>
        </section>
        <footer className="entry-footer"><span>Preparação para concursos públicos, começando por Queimados/RJ.</span><span>Acesso gratuito com sua conta Google.</span></footer>
      </div>
    </main>
  );
}

function EntryLoading({ theme }: { theme: 'dark' | 'light' }) {
  return <main className="entry-loading" data-theme={theme} role="status"><span className="entry-loading-mark">DG</span><strong>Preparando seu espaço de estudo</strong><small>Estamos carregando sua conta e seu histórico.</small><span className="entry-loading-bar" /></main>;
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
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string, questionSnapshot?: Question) => void;
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
        Pratique itens alinhados aos tópicos do edital. Quando houver uma questão de prova anterior com fonte consultável, a banca e a origem aparecem junto do enunciado.
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
          {' '}({questions.filter((item) => item.provenance.kind === 'original').length})
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
  onAnswer,
  onSimulation,
  storageKey
}: {
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string, questionSnapshot?: Question) => void;
  onSimulation: (session: SimulationSession) => void;
  storageKey: string;
}) {
  const [pendingSession, setPendingSession] = useState<SavedActiveSimulation | null>(() => readActiveSimulation(storageKey));
  const [items, setItems] = useState<typeof questions>([]);
  const [preparing, setPreparing] = useState(false);
  const [simulatorError, setSimulatorError] = useState('');
  const [simulatorStatus, setSimulatorStatus] = useState('');
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(contest.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    points: number;
    correct: number;
    zero: string[];
    by: Record<Discipline, { hits: number; total: number; points: number }>;
    elapsed: number;
  }>(null);

  useEffect(() => {
    if (!items.length || !sessionId || result) return;
    localStorage.setItem(`${storageKey}:data`, JSON.stringify({ items, sessionId, startedAt }));
  }, [items, result, sessionId, startedAt, storageKey]);

  useEffect(() => {
    if (!items.length || !sessionId || result) return;
    localStorage.setItem(`${storageKey}:progress`, JSON.stringify({
      answers,
      index,
      seconds,
      isPaused,
      deadlineAt: isPaused ? null : Date.now() + seconds * 1000
    }));
  }, [answers, index, isPaused, items.length, result, seconds, sessionId, storageKey]);

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

  const begin = async (withAi = true) => {
    setSimulatorError('');
    setSimulatorStatus('');
    setPreparing(true);
    try {
      const shuffle = <T,>(values: T[]) => {
        const shuffled = [...values];
        for (let cursor = shuffled.length - 1; cursor > 0; cursor--) {
          const other = Math.floor(Math.random() * (cursor + 1));
          [shuffled[cursor], shuffled[other]] = [shuffled[other], shuffled[cursor]];
        }
        return shuffled;
      };
      const generatedByDiscipline: Record<Discipline, Question[]> = { portuguese: [], municipal_law: [], specific_knowledge: [] };
      if (withAi) {
        if (!firebaseAiConfigured) throw new Error('A geração em tempo real ainda depende de ativar Firebase AI Logic, App Check e a chave pública do reCAPTCHA no projeto. Você pode iniciar agora pelo banco local.');
        const selectedTopics = (['portuguese', 'municipal_law', 'specific_knowledge'] as Discipline[]).map((discipline) => {
          const candidates = syllabusTopics.filter((topic) => topic.discipline === discipline);
          return candidates[Math.floor(Math.random() * candidates.length)];
        });
        const generated = await generateSimulationQuestions({
          topics: selectedTopics.map((topic) => ({ topicId: topic.id, examples: questions.filter((question) => question.topicId === topic.id) })),
          difficulty: 'medium',
          onQuotaWait: (milliseconds) => setSimulatorStatus(`Limite momentâneo do serviço. Nova tentativa em cerca de ${Math.ceil(milliseconds / 1000)} segundos…`)
        });
        Object.assign(generatedByDiscipline, generated);
      }

      // Cada prova combina itens inéditos recém-gerados com itens do banco local.
      // Questões reais são identificadas e incluídas com a respectiva procedência.
      const getSample = (discipline: Discipline, count: number) => {
        const generated = shuffle(generatedByDiscipline[discipline]).slice(0, Math.min(3, count));
        const remaining = count - generated.length;
        const historical = discipline === 'specific_knowledge' ? questions.filter((item) => item.discipline === discipline && item.provenance.kind !== 'original') : [];
        const verified = shuffle(historical).slice(0, 1);
        const verifiedIds = new Set(verified.map((item) => item.id));
        const bank = shuffle(questions.filter((item) => item.discipline === discipline && !verifiedIds.has(item.id)));
        const localNeeded = Math.max(0, remaining - verified.length);
        const picked = [...generated, ...verified, ...selectDistinctPracticeGroups(bank, localNeeded)];
        return shuffle(picked).slice(0, count);
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
    setStartedAt(new Date().toISOString());
    setPendingSession(null);
    setResult(null);
    } catch (cause) {
      setSimulatorError(getAiUserMessage(cause));
    } finally {
      setPreparing(false);
      setSimulatorStatus('');
    }
  };

  const finish = () => {
    if (!items.length || result) return;
    clearActiveSimulation(storageKey);
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
        onAnswer(q.id, answers[q.id], isCorrect, isCorrect ? undefined : 'unknown_content', 'sure', sessionId ?? undefined, q.id.startsWith('ai-') ? q : undefined);
      }
    }

    const totalPoints = Object.values(by).reduce((acc, curr) => acc + curr.points, 0);
    const zeroDisc = (Object.keys(by) as Discipline[]).filter((d) => by[d].hits === 0).map((d) => labels[d]);

    const elapsedSeconds = contest.durationMinutes * 60 - seconds;
    if (sessionId && startedAt) {
      onSimulation({
        id: sessionId,
        questionIds: items.map((item) => item.id),
        mode: 'full',
        startedAt,
        durationSeconds: elapsedSeconds,
        answers,
        finishedAt: new Date().toISOString(),
        score: totalPoints,
        correct: hits,
        totalQuestions: items.length
      });
    }

    setResult({
      points: totalPoints,
      correct: hits,
      zero: zeroDisc,
      by,
      elapsed: elapsedSeconds
    });
  };

  const q = items[index];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = items.length ? Math.round((answeredCount / items.length) * 100) : 0;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const startAfterCancellingSaved = (withAi: boolean) => {
    clearActiveSimulation(storageKey);
    setPendingSession(null);
    void begin(withAi);
  };

  const resumeSavedSession = () => {
    if (!pendingSession) return;
    setItems(pendingSession.items);
    setAnswers(pendingSession.answers || {});
    setIndex(Math.min(Math.max(pendingSession.index, 0), pendingSession.items.length - 1));
    setSeconds(pendingSession.seconds);
    setSessionId(pendingSession.sessionId);
    setStartedAt(pendingSession.startedAt);
    setIsPaused(false);
    setPendingSession(null);
  };

  if (!items.length && pendingSession) {
    const savedHours = String(Math.floor(pendingSession.seconds / 3600)).padStart(2, '0');
    const savedMinutes = String(Math.floor((pendingSession.seconds % 3600) / 60)).padStart(2, '0');
    const savedSeconds = String(pendingSession.seconds % 60).padStart(2, '0');
    const savedAnsweredCount = Object.keys(pendingSession.answers || {}).length;
    return (
      <>
        <PageTitle kicker="SIMULADO SALVO" title="Você pode continuar de onde parou">
          Sua prova ficou guardada neste aparelho. Escolha continuar ou cancelar esta tentativa para começar outra.
        </PageTitle>
        <section className="panel resume-simulation-card" aria-label="Simulado salvo">
          <div className="resume-simulation-summary">
            <span className="resume-simulation-icon" aria-hidden="true">◷</span>
            <div>
              <strong>Simulado em andamento</strong>
              <p>Questão {pendingSession.index + 1} de {pendingSession.items.length} · {savedAnsweredCount} respondidas · tempo restante {savedHours}:{savedMinutes}:{savedSeconds}</p>
            </div>
          </div>
          <div className="simulator-start-actions">
            <button className="button button-primary" type="button" onClick={resumeSavedSession}>Continuar de onde parei</button>
            <button className="button button-secondary" type="button" onClick={() => startAfterCancellingSaved(false)} disabled={preparing}>Cancelar e iniciar outro com o banco local</button>
            <button className="button button-secondary" type="button" onClick={() => startAfterCancellingSaved(true)} disabled={preparing || !firebaseAiConfigured}>Cancelar e gerar outro com questões novas</button>
          </div>
          {preparing && <p role="status" className="muted">Preparando um novo simulado…</p>}
          {simulatorError && <p className="ai-error-message" role="alert">{simulatorError}</p>}
        </section>
      </>
    );
  }

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
            <button className="button button-primary" onClick={() => void begin(true)}>
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
                  <p className="exam-provenance">{simQ.id.startsWith('ai-') ? 'Questão nova de treino · dificuldade estimada' : simQ.provenance.kind === 'original' ? simQ.provenance.label : <>{simQ.provenance.banca} · {simQ.provenance.contest} · {simQ.provenance.year} · <a href={simQ.provenance.url} target="_blank" rel="noreferrer">fonte ↗</a></>}</p>
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
        <PageTitle kicker="FORMATO DO EDITAL 01/2026 · TREINO DINÂMICO" title="Simulador de Prova Completa">
          Cada prova mistura questões inéditas recém-geradas pela IA com itens do banco de treino, mantendo a distribuição e os pesos do edital. Questões reais aparecem com banca, concurso, ano e link de origem.
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
            <strong>Como os itens são escolhidos:</strong> a IA cria novas questões por tópico do edital; o restante vem do banco local embaralhado, que reúne {questions.length.toLocaleString('pt-BR')} itens nos conteúdos do edital. {questions.filter((item) => item.provenance.kind !== 'original').length} questão tem prova anterior e fonte consultável; as demais são itens autorais e variações para treino. Reserve os últimos 20 minutos para revisar o cartão-resposta.
          </div>

          {simulatorError && <p className="ai-error-message" role="alert">{simulatorError}</p>}
          <div className="simulator-start-actions">
          <button className="button button-primary" aria-label={firebaseAiConfigured ? 'Iniciar simulado completo com IA' : 'Simulado com IA indisponível'} onClick={() => void begin(true)} disabled={preparing || !firebaseAiConfigured}>
            {preparing ? 'Gerando questões e montando prova…' : firebaseAiConfigured ? 'Gerar simulado com IA →' : 'Simulado com IA indisponível'}
          </button>
          <button className="button button-secondary" onClick={() => void begin(false)} disabled={preparing}>
            Iniciar com banco local
          </button>
          </div>
          {simulatorStatus && <p role="status" className="muted">{simulatorStatus}</p>}
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
        <div className={`exam-provenance ${q.provenance.kind === 'original' ? 'is-original' : 'is-real'}`}>
          {q.id.startsWith('ai-') ? 'Questão nova de treino · dificuldade estimada' : q.provenance.kind === 'original' ? q.provenance.label : <>{q.provenance.banca ?? 'Banca não identificada'} · {q.provenance.contest ?? 'Concurso não identificado'} · {q.provenance.year ?? 'ano não informado'} · <a href={q.provenance.url} target="_blank" rel="noreferrer">ver fonte ↗</a></>}
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
  onAnswer: (qId: string, choice: OptionId, correct: boolean, reason?: ErrorReason, confidence?: Attempt['confidence'], sessionId?: string, questionSnapshot?: Question) => void;
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
function PerformanceRadar({ attempts, simulations }: { attempts: Attempt[]; simulations: SimulationSession[] }) {
  const totalTopics = new Set(questions.map((question) => question.topicId)).size || 1;
  const completedTopics = new Set(attempts.map((attempt) => questions.find((question) => question.id === attempt.questionId)?.topicId).filter(Boolean));
  const activeDays = new Set(attempts
    .filter((attempt) => Date.now() - new Date(attempt.answeredAt).getTime() <= 28 * 24 * 60 * 60 * 1000)
    .map((attempt) => attempt.answeredAt.slice(0, 10))).size;
  const correct = attempts.filter((attempt) => attempt.correct).length;
  const bestExam = Math.max(0, ...simulations.map((simulation) => simulation.score ?? 0));
  const metrics = [
    { label: 'Precisão', value: attempts.length ? Math.round(correct / attempts.length * 100) : 0 },
    { label: 'Regularidade', value: Math.min(100, Math.round(activeDays / 20 * 100)) },
    { label: 'Volume', value: Math.min(100, attempts.length) },
    { label: 'Cobertura do edital', value: Math.min(100, Math.round(completedTopics.size / totalTopics * 100)) },
    { label: 'Simulados', value: Math.round(bestExam) }
  ];
  const center = { x: 180, y: 145 };
  const radius = 94;
  const angleAt = (index: number) => -Math.PI / 2 + index * Math.PI * 2 / metrics.length;
  const pointAt = (index: number, distance: number) => ({ x: center.x + Math.cos(angleAt(index)) * distance, y: center.y + Math.sin(angleAt(index)) * distance });
  const polygon = (scale: number) => metrics.map((_, index) => {
    const point = pointAt(index, radius * scale);
    return `${point.x},${point.y}`;
  }).join(' ');
  const performancePolygon = metrics.map((metric, index) => {
    const point = pointAt(index, radius * metric.value / 100);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <section className="panel performance-panel" aria-labelledby="performance-5d-title">
      <div className="performance-heading">
        <div><span className="eyebrow">VISÃO EM CINCO DIMENSÕES</span><h2 id="performance-5d-title">Seu desempenho 5D</h2></div>
        <p>Cada eixo mostra uma parte diferente da sua preparação. O gráfico ganha forma conforme você estuda.</p>
      </div>
      <div className="performance-layout">
        <svg className="performance-radar" viewBox="0 0 360 290" role="img" aria-label={`Gráfico de desempenho em cinco dimensões: ${metrics.map((metric) => `${metric.label} ${metric.value}%`).join(', ')}.`} data-testid="performance-radar">
          <defs><linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8490ff" stopOpacity=".44"/><stop offset="1" stopColor="#36d8bd" stopOpacity=".18"/></linearGradient></defs>
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => <polygon key={scale} points={polygon(scale)} className="radar-grid" />)}
          {metrics.map((metric, index) => {
            const endpoint = pointAt(index, radius);
            const label = pointAt(index, 122);
            return <g key={metric.label}><line x1={center.x} y1={center.y} x2={endpoint.x} y2={endpoint.y} className="radar-axis"/><text x={label.x} y={label.y} textAnchor={Math.cos(angleAt(index)) > .35 ? 'start' : Math.cos(angleAt(index)) < -.35 ? 'end' : 'middle'} className="radar-label">{metric.label}</text></g>;
          })}
          {attempts.length > 0 && <polygon points={performancePolygon} className="radar-value" />}
          {attempts.length > 0 && metrics.map((metric, index) => {
            const point = pointAt(index, radius * metric.value / 100);
            return <circle key={metric.label} cx={point.x} cy={point.y} r="4" className="radar-dot" />;
          })}
        </svg>
        <div className="performance-metrics" aria-label="Valores das cinco dimensões">
          {metrics.map((metric) => <div className="performance-metric" key={metric.label}><span>{metric.label}</span><strong>{metric.value}%</strong></div>)}
        </div>
      </div>
      {!attempts.length && <p className="muted">Resolva algumas questões para o gráfico começar a refletir seu ritmo e seus pontos fortes.</p>}
    </section>
  );
}

function Progress({ attempts, simulations, account }: { attempts: Attempt[]; simulations: SimulationSession[]; account: User | null }) {
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

      <PerformanceRadar attempts={attempts} simulations={simulations} />

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

      <section className="panel simulation-history" aria-labelledby="simulation-history-title">
        <h2 id="simulation-history-title">Histórico de simulados completos</h2>
        {simulations.length ? (
          <div className="simulation-history-list">
            {[...simulations].sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || '')).map((simulation) => (
              <article className="simulation-history-item" key={simulation.id}>
                <div><strong>{new Date(simulation.finishedAt || simulation.startedAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</strong><small>{simulation.correct ?? 0} de {simulation.totalQuestions ?? simulation.questionIds.length} acertos · {Math.floor(simulation.durationSeconds / 60)} min</small></div>
                <b>{(simulation.score ?? 0).toFixed(1)} pontos</b>
              </article>
            ))}
          </div>
        ) : <p className="muted">Quando você concluir um simulado, o resultado e as respostas ficam registrados aqui.</p>}
      </section>

      {!account && <div style={{ marginTop: '24px' }}>
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
      </div>}
    </>
  );
}

function CloudAccountControl({
  account,
  status,
  onSignOut
}: {
  account: User | null;
  status: 'local' | 'syncing' | 'synced' | 'offline';
  onSignOut: () => void;
}) {
  if (!firebaseConfigured || !account) return null;
  const statusText = status === 'syncing' ? 'Sincronizando seu histórico…' : status === 'synced' ? 'Histórico sincronizado' : status === 'offline' ? 'Sem conexão com a nuvem; seus dados seguem salvos neste aparelho.' : 'Entre para manter seu histórico em outros aparelhos.';
  return (
    <div className="cloud-account-control">
      <span className="cloud-account-name">{account.displayName || 'Conta Google'}</span>
      <button className="cloud-account-button" type="button" onClick={onSignOut}>Sair</button>
      <small className="cloud-sync-status" role="status">{statusText}</small>
    </div>
  );
}

/* =========================================================================
   COMPONENTE PRINCIPAL (LAYOUT & ROTAS)
   ========================================================================= */
function AppContent() {
  const [attempts, setAttempts] = useState<Attempt[]>(() => firebaseConfigured ? [] : storedAttempts());
  const [simulations, setSimulations] = useState<SimulationSession[]>(() => firebaseConfigured ? [] : storedSimulations());
  const attemptsRef = useRef(attempts);
  const simulationsRef = useRef(simulations);
  attemptsRef.current = attempts;
  simulationsRef.current = simulations;
  const [account, setAccount] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [cloudReady, setCloudReady] = useState(!firebaseConfigured);
  const [cloudStatus, setCloudStatus] = useState<'local' | 'syncing' | 'synced' | 'offline'>('local');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('rq-theme') === 'light' ? 'light' : 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const primaryMobilePaths = ['/', '/questoes', '/simulados', '/erros'];
  const additionalMobileItems = navigationItems.filter((item) => !primaryMobilePaths.includes(item.path));
  const isAdditionalMobileRoute = additionalMobileItems.some((item) => location.pathname === item.path);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!authReady) return;
    const attemptKey = account ? `rq-attempts:${account.uid}` : 'rq-attempts';
    const simulationKey = account ? `rq-simulations:${account.uid}` : 'rq-simulations';
    localStorage.setItem(attemptKey, JSON.stringify(attempts));
    localStorage.setItem(simulationKey, JSON.stringify(simulations));
    if (account) localStorage.setItem('rq-cloud-owner', account.uid);
  }, [account, attempts, authReady, simulations]);

  useEffect(() => {
    if (!firebaseConfigured) return;
    let cancelled = false;
    let stopLearning = () => {};
    const unsubscribe = observeAuth((user) => {
      setAuthReady(false);
      setAccount(user);
      if (!user) {
        stopLearning();
        if (cancelled) return;
        setAttempts(storedAttempts());
        setSimulations(storedSimulations());
        setCloudReady(true);
        setCloudStatus('local');
        setAuthReady(true);
        return;
      }

      setCloudReady(false);
      setCloudStatus('syncing');
      const owner = localStorage.getItem('rq-cloud-owner');
      const localAttemptKey = `rq-attempts:${user.uid}`;
      const localSimulationKey = `rq-simulations:${user.uid}`;
      const accountAttempts = JSON.parse(localStorage.getItem(localAttemptKey) || '[]') as Attempt[];
      const accountSimulations = JSON.parse(localStorage.getItem(localSimulationKey) || '[]') as SimulationSession[];
      const importedAttempts = accountAttempts.length || owner ? accountAttempts : storedAttempts();
      const importedSimulations = accountSimulations.length || owner ? accountSimulations : storedSimulations();

      void loadCloudLearning(user.uid).then(async (remote) => {
        if (cancelled) return;
        // Start from this Google account's own local copy plus its cloud copy.
        // Never merge the previous account's in-memory state into another account.
        const mergedAttempts = mergeById(importedAttempts, remote.attempts);
        const mergedSimulations = mergeById(importedSimulations, remote.simulations);
        localStorage.setItem(localAttemptKey, JSON.stringify(mergedAttempts));
        localStorage.setItem(localSimulationKey, JSON.stringify(mergedSimulations));
        localStorage.setItem('rq-cloud-owner', user.uid);
        if (!owner) {
          localStorage.removeItem('rq-attempts');
          localStorage.removeItem('rq-simulations');
        }
        setAttempts(mergedAttempts);
        setSimulations(mergedSimulations);
        setCloudReady(true);
        setAuthReady(true);
        try {
          await syncLocalLearning(user.uid, mergedAttempts, mergedSimulations);
          if (!cancelled) setCloudStatus('synced');
        } catch {
          if (!cancelled) setCloudStatus('offline');
        }
        stopLearning = subscribeToCloudLearning(user.uid, {
          onAttempts: (remoteAttempts) => setAttempts((local) => mergeById(local, remoteAttempts)),
          onSimulations: (remoteSimulations) => setSimulations((local) => mergeById(local, remoteSimulations)),
          onError: () => setCloudStatus('offline')
        });
      }).catch(() => {
        if (cancelled) return;
        setAttempts(importedAttempts);
        setSimulations(importedSimulations);
        setCloudReady(true);
        setAuthReady(true);
        setCloudStatus('offline');
      });
    });
    return () => {
      cancelled = true;
      stopLearning();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!account || !cloudReady) return;
    const syncWhenOnline = () => {
      void syncLocalLearning(account.uid, attemptsRef.current, simulationsRef.current)
        .then(() => setCloudStatus('synced'))
        .catch(() => setCloudStatus('offline'));
    };
    window.addEventListener('online', syncWhenOnline);
    return () => window.removeEventListener('online', syncWhenOnline);
  }, [account, cloudReady]);

  useEffect(() => {
    localStorage.setItem('rq-theme', theme);
  }, [theme]);

  const record = (
    questionId: string,
    selectedOption: OptionId,
    correct: boolean,
    errorReason?: ErrorReason,
    confidence: Attempt['confidence'] = 'sure',
    sessionId?: string,
    questionSnapshot?: Question
  ) => {
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      questionId,
      selectedOption,
      correct,
      errorReason,
      confidence,
      sessionId,
      answeredAt: new Date().toISOString(),
      elapsedSeconds: 0,
      questionSnapshot
    };
    setAttempts((prev) => [...prev, attempt]);
    if (account) void saveCloudAttempt(account.uid, attempt).then(() => setCloudStatus('synced')).catch(() => setCloudStatus('offline'));
  };

  const recordSimulation = (session: SimulationSession) => {
    setSimulations((prev) => mergeById(prev, [session]));
    if (account) void saveCloudSimulation(account.uid, session).then(() => setCloudStatus('synced')).catch(() => setCloudStatus('offline'));
  };

  const handleSignIn = () => {
    if (!firebaseConfigured) return;
    setCloudStatus('syncing');
    void signInWithGoogle().catch(() => setCloudStatus('offline'));
  };
  const handleSignOut = () => void signOutOfGoogle();

  if (!firebaseConfigured) {
    return <EntryPage theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} onSignIn={handleSignIn} status={cloudStatus} configured={false} />;
  }
  if (!authReady || (account && !cloudReady)) return <EntryLoading theme={theme} />;
  if (!account) {
    return <EntryPage theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} onSignIn={handleSignIn} status={cloudStatus} configured />;
  }

  return (
    <div className={`app-shell${isLanding ? ' landing-shell' : ''}`} data-testid="app-shell" data-theme={theme}>
      <aside className="sidebar" aria-label="Navegação principal">
        <NavLink className="brand" to="/" end aria-label="Dg Concursos, início">
          <BrandLogo theme={theme} />
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
          <span className="status-dot" /> {firebaseConfigured ? account ? 'Seu histórico acompanha esta conta Google.' : 'Entre com Google para sincronizar entre aparelhos.' : 'Suas respostas ficam salvas neste navegador.'}
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">PREFEITURA MUNICIPAL DE QUEIMADOS · RJ</span>
            <span className="topbar-title">Preparatório — Agente Administrativo</span>
          </div>
          <div className="topbar-actions">
            <CloudAccountControl account={account} status={cloudStatus} onSignOut={handleSignOut} />
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
            <Route path="/" element={<LandingPage attempts={attempts} theme={theme} onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} account={account} onSignOut={handleSignOut} />} />
            <Route path="/edital" element={<EditalGuidePage />} />
            <Route path="/questoes" element={<Practice onAnswer={record} />} />
            <Route path="/simulados" element={<ExamSimulator onAnswer={record} onSimulation={recordSimulation} storageKey={account ? `rq-active-simulation:${account.uid}` : 'rq-active-simulation'} />} />
            <Route path="/erros" element={<CadernoErros attempts={attempts} onAnswer={record} />} />
            <Route path="/estudo-ia" element={<AIQuestionStudio onAnswer={record} />} />
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
            <Route path="/progresso" element={<Progress attempts={attempts} simulations={simulations} account={account} />} />
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
            <strong>Dg Concursos</strong> — Preparação com método, um edital de cada vez.
          </div>
          <span>Banca examinadora: Instituto de Avaliação Nacional (IAN)</span>
        </footer>
      </div>

      <nav className="mobile-navigation">
        {navigationItems.filter((item) => primaryMobilePaths.includes(item.path)).map((item) => (
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
        <button
          className={`mobile-nav-item mobile-more-button${mobileMenuOpen || isAdditionalMobileRoute ? ' active' : ''}`}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-more-menu"
          aria-label={mobileMenuOpen ? 'Fechar mais opções' : 'Abrir todas as opções do programa'}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
          <small>Mais</small>
        </button>
      </nav>
      {mobileMenuOpen && (
        <div className="mobile-menu-scrim" onClick={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}>
          <section className="mobile-menu-sheet" id="mobile-more-menu" role="dialog" aria-modal="true" aria-label="Todas as áreas do programa">
            <div className="mobile-menu-heading">
              <div><span className="eyebrow">DG CONCURSOS</span><h2>Todas as áreas</h2></div>
              <button type="button" className="mobile-menu-close" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)}>×</button>
            </div>
            <nav className="mobile-menu-grid" aria-label="Outras áreas do programa">
              {additionalMobileItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `mobile-menu-link${isActive ? ' active' : ''}`}>
                  <span aria-hidden="true">{item.icon}</span><span>{item.label}</span><b aria-hidden="true">→</b>
                </NavLink>
              ))}
            </nav>
          </section>
        </div>
      )}
    </div>
  );
}

export function App() {
  return <AppContent />;
}
