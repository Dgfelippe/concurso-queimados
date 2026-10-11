export const navigationItems = [
  { path: '/', label: 'Painel', shortLabel: 'Início', icon: '◫' },
  { path: '/plano', label: 'Plano de estudo', shortLabel: 'Plano', icon: '▤' },
  { path: '/conteudos', label: 'Conteúdos', shortLabel: 'Conteúdos', icon: '▧' },
  { path: '/questoes', label: 'Questões', shortLabel: 'Questões', icon: '◎' },
  { path: '/simulados', label: 'Simulados', shortLabel: 'Simulados', icon: '◷' },
  { path: '/erros', label: 'Caderno de erros', shortLabel: 'Erros', icon: '↗' },
  { path: '/progresso', label: 'Progresso', shortLabel: 'Progresso', icon: '▥' },
  { path: '/fontes', label: 'Fontes e limites', shortLabel: 'Fontes', icon: '⌕' }
] as const;

export type AppPath = (typeof navigationItems)[number]['path'];
