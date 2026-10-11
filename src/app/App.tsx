import { NavLink, Route, Routes } from 'react-router-dom';
import { navigationItems } from './navigation';
import '../styles/global.css';

function LandingPage() {
  return (
    <section className="welcome-card" aria-labelledby="welcome-title">
      <div className="welcome-copy">
        <span className="eyebrow">SUA PREPARAÇÃO, UM DIA DE CADA VEZ</span>
        <h1 id="welcome-title">Constância constrói confiança.</h1>
        <p>Organize seu estudo, pratique com intenção e use cada erro como próximo passo.</p>
        <NavLink className="button button-primary" to="/questoes">Começar a estudar <span aria-hidden="true">→</span></NavLink>
      </div>
      <div className="welcome-mark" aria-hidden="true"><span>RQ</span><i /></div>
    </section>
  );
}

function AreaPage({ title }: { title: string }) {
  return (
    <section className="page-placeholder" aria-labelledby="page-title">
      <span className="eyebrow">SUA JORNADA DE ESTUDO</span>
      <h1 id="page-title">{title}</h1>
      <p>Este espaço faz parte do seu preparatório. Os recursos serão organizados aqui.</p>
    </section>
  );
}

export function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <NavLink className="brand" to="/" end aria-label="Rumo a Queimados, painel">
          <span className="brand-symbol" aria-hidden="true">R</span>
          <span className="brand-name">Rumo a <b>Queimados</b><small>PREPARATÓRIO 2026</small></span>
        </NavLink>
        <div className="nav-caption">ESTUDAR</div>
        <nav className="side-navigation">
          {navigationItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note"><span className="status-dot" /> Seu progresso fica neste dispositivo.</div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div><span className="topbar-kicker">PREFEITURA DE QUEIMADOS · RJ</span><span className="topbar-title">Agente Administrativo</span></div>
          <div className="topbar-date"><span className="status-dot" /> Prova prevista <b>22 nov 2026</b></div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {navigationItems.slice(1).map((item) => <Route key={item.path} path={item.path} element={<AreaPage title={item.label} />} />)}
            <Route path="*" element={<AreaPage title="Página não encontrada" />} />
          </Routes>
        </main>
        <footer className="app-footer">Uma preparação honesta, guiada pelo edital. <span>Sem promessas mágicas. Com prática e revisão.</span></footer>
      </div>

      <nav className="mobile-navigation" aria-label="Navegação móvel">
        {navigationItems.slice(0, 5).map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <span aria-hidden="true">{item.icon}</span><small>{item.shortLabel}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
