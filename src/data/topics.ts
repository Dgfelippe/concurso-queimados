import type { Discipline } from '../domain/types';

export interface SyllabusTopic {
  id: string;
  discipline: Discipline;
  title: string;
  summary: string;
}

const topic = (id: string, discipline: Discipline, title: string, summary: string): SyllabusTopic => ({ id, discipline, title, summary });

export const syllabusTopics: SyllabusTopic[] = [
  topic('pt-interpretacao', 'portuguese', 'Leitura e interpretação', 'Compreensão global, informações explícitas e inferências.'),
  topic('pt-vocabulario', 'portuguese', 'Vocabulário e relações de sentido', 'Denotação, conotação, sinonímia, antonímia, homonímia, paronímia e polissemia.'),
  topic('pt-ortografia', 'portuguese', 'Ortografia e acentuação', 'Emprego das letras e regras de acentuação gráfica.'),
  topic('pt-pontuacao', 'portuguese', 'Pontuação', 'Emprego dos sinais de pontuação e efeitos de sentido.'),
  topic('pt-classes', 'portuguese', 'Classes de palavras', 'Pronomes, verbos, preposições, conjunções, substantivos e adjetivos.'),
  topic('pt-termos', 'portuguese', 'Termos da oração', 'Identificação e classificação das funções sintáticas.'),
  topic('pt-coordenacao', 'portuguese', 'Coordenação e subordinação', 'Relações sintáticas e semânticas entre orações.'),
  topic('pt-periodos', 'portuguese', 'Períodos e orações', 'Classificação de períodos simples e compostos.'),
  topic('pt-concordancia', 'portuguese', 'Concordância nominal e verbal', 'Relações de concordância entre os termos da oração.'),
  topic('pt-regencia', 'portuguese', 'Regência nominal e verbal', 'Relações de dependência e preposições exigidas.'),
  topic('pt-crase', 'portuguese', 'Crase', 'Emprego do acento indicativo de crase.'),
  topic('lm-organica', 'municipal_law', 'Lei Orgânica de Queimados', 'Organização municipal, princípios e competências previstos no texto oficial.'),
  topic('lm-estatuto', 'municipal_law', 'Lei Municipal nº 1.060/2011', 'Regime jurídico dos servidores, autarquias e fundações municipais.'),
  topic('esp-administracao-publica', 'specific_knowledge', 'Administração Pública', 'Princípios, administração direta e indireta, atos e poderes administrativos.'),
  topic('esp-administracao-geral', 'specific_knowledge', 'Administração Geral', 'Planejamento, organização, direção, controle, rotinas e processos.'),
  topic('esp-recursos-humanos', 'specific_knowledge', 'Recursos Humanos', 'Recrutamento, treinamento, avaliação e registros funcionais.'),
  topic('esp-materiais', 'specific_knowledge', 'Materiais e Patrimônio', 'Compras, recebimento, estoque, inventário e controle patrimonial.'),
  topic('esp-orcamento', 'specific_knowledge', 'Administração Financeira e Orçamentária', 'Orçamento, receitas, despesas, execução e controle de gastos.'),
  topic('esp-arquivologia', 'specific_knowledge', 'Arquivologia e Gestão Documental', 'Classificação, conservação, protocolo e documentos digitais.'),
  topic('esp-redacao-oficial', 'specific_knowledge', 'Redação Oficial', 'Comunicações oficiais, clareza, objetividade e concisão.'),
  topic('esp-normas', 'specific_knowledge', 'Legislação e Normas Administrativas', 'Leitura de normas e aplicação de procedimentos administrativos.'),
  topic('esp-planejamento-controle', 'specific_knowledge', 'Planejamento e Controle Administrativo', 'Planos de ação, indicadores, relatórios e acompanhamento.'),
  topic('esp-etica', 'specific_knowledge', 'Ética e Conduta no Serviço Público', 'Responsabilidade, princípios éticos e atendimento ao público.'),
  topic('esp-informatica', 'specific_knowledge', 'Noções Básicas de Informática', 'Arquivos, segurança, navegação, editores e planilhas em nível introdutório.')
];

export const getTopic = (topicId: string) => syllabusTopics.find((item) => item.id === topicId);
