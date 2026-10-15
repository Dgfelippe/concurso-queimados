export const navigationItems = [
  { path: '/', label: 'Painel', shortLabel: 'Início', icon: '◫' },
  { path: '/edital', label: 'Guia do Edital', shortLabel: 'Edital', icon: '📋' },
  { path: '/questoes', label: 'Questões', shortLabel: 'Questões', icon: '◎' },
  { path: '/simulados', label: 'Simulados', shortLabel: 'Simulados', icon: '◷' },
  { path: '/erros', label: 'Caderno de erros', shortLabel: 'Erros', icon: '↗' },
  { path: '/legislacao', label: 'Dossiê Queimados', shortLabel: 'Leis', icon: '⚖️' },
  { path: '/conteudos', label: 'Conteúdos', shortLabel: 'Ementa', icon: '▧' },
  { path: '/plano', label: 'Plano de estudo', shortLabel: 'Plano', icon: '▤' },
  { path: '/progresso', label: 'Progresso', shortLabel: 'Estatísticas', icon: '▥' },
  { path: '/fontes', label: 'Fontes Oficiais', shortLabel: 'Fontes', icon: '⌕' },
  { path: '/estudo-ia', label: 'Estudo com IA', shortLabel: 'Tutor IA', icon: '✦' }
] as const;

export type AppPath = (typeof navigationItems)[number]['path'];
