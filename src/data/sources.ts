export interface StudySource {
  id: string;
  title: string;
  type: 'official' | 'third_party' | 'original';
  url?: string;
  accessedAt?: string;
  note: string;
}

export const studySources: StudySource[] = [
  { id: 'ian-edital', title: 'Edital e documentos do Concurso 01/2026 — Queimados', type: 'official', url: 'https://portal.ian.org.br/edital/ver/53', accessedAt: '2026-10-11', note: 'Página oficial do IAN. Consulte retificações e os arquivos anexos do edital.' },
  { id: 'camara-organica', title: 'Lei Orgânica Municipal — Câmara Municipal de Queimados', type: 'official', url: 'https://www.queimados.rj.leg.br/leis/lei-organica-municipal', accessedAt: '2026-10-11', note: 'O portal disponibiliza a publicação original e informa conteúdo atualizado. A publicação digitalizada pode conter falhas de OCR; confira o texto e as emendas oficiais.' },
  { id: 'ian-lei1060', title: 'Lei Municipal nº 1.060/2011 — arquivo indicado pelo IAN', type: 'official', url: 'https://portal.ian.org.br/edital/ver/53', accessedAt: '2026-10-11', note: 'A página oficial do concurso lista o arquivo do Estatuto dos Servidores. Abra a área de downloads e confira o texto oficial e a versão considerada pelo edital.' },
  { id: 'previqueimados-leis', title: 'Acervo de leis municipais — PREVIQUEIMADOS', type: 'official', url: 'https://previqueimados.rj.gov.br/legislacao/leis-municipais/', accessedAt: '2026-10-11', note: 'Confirma a identificação e a ementa da Lei 1.060/2011; consulte o arquivo do edital para o texto integral.' },
  { id: 'original-training', title: 'Questões inéditas de treino deste aplicativo', type: 'original', note: 'Questões autorais de prática, não oficiais e não apresentadas como questões aplicadas pelo IAN.' }
];

export const sourceLinks = studySources;
