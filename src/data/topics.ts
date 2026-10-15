import type { Discipline } from '../domain/types';

export interface SyllabusTopic {
  id: string;
  discipline: Discipline;
  title: string;
  summary: string;
}

const topic = (id: string, discipline: Discipline, title: string, summary: string): SyllabusTopic => ({ id, discipline, title, summary });

export const syllabusTopics: SyllabusTopic[] = [
  topic('pt-interpretacao', 'portuguese', 'Leitura e interpretação', 'Leitura, compreensão e interpretação de textos; tema, finalidade, informações explícitas, relações entre ideias e inferências autorizadas pelo texto.'),
  topic('pt-vocabulario', 'portuguese', 'Vocabulário e relações de sentido', 'Vocabulário e sentido denotativo e conotativo; sinonímia, antonímia, homonímia, paronímia e polissemia.'),
  topic('pt-ortografia', 'portuguese', 'Ortografia e acentuação', 'Ortografia: emprego das letras e das palavras; acentuação gráfica conforme as regras vigentes.'),
  topic('pt-pontuacao', 'portuguese', 'Pontuação', 'Emprego dos sinais de pontuação e efeitos de sentido.'),
  topic('pt-classes', 'portuguese', 'Classes de palavras', 'Pronomes: classificação, emprego e colocação pronominal (próclise, ênclise e mesóclise). Verbos: emprego dos modos e tempos, flexões dos verbos irregulares, abundantes e defectivos, e vozes verbais. Preposições e locuções prepositivas: relações semânticas. Conjunções e locuções conjuntivas: classificação e relações estabelecidas. Substantivos e adjetivos: classificação e flexões.'),
  topic('pt-termos', 'portuguese', 'Termos da oração', 'Identificação e classificação das funções sintáticas.'),
  topic('pt-coordenacao', 'portuguese', 'Coordenação e subordinação', 'Processos sintáticos de coordenação e subordinação; relações de sentido entre orações e emprego de conjunções e locuções conjuntivas.'),
  topic('pt-periodos', 'portuguese', 'Períodos e orações', 'Classificação de períodos simples e compostos.'),
  topic('pt-concordancia', 'portuguese', 'Concordância nominal e verbal', 'Relações de concordância entre os termos da oração.'),
  topic('pt-regencia', 'portuguese', 'Regência nominal e verbal', 'Relações de dependência e preposições exigidas.'),
  topic('pt-crase', 'portuguese', 'Crase', 'Emprego do acento indicativo de crase.'),
  topic('lm-organica', 'municipal_law', 'Lei Orgânica de Queimados', 'Estudo da Lei Orgânica do Município de Queimados/RJ conforme o texto oficial e suas emendas aplicáveis. Não presumir redação de artigo: questões literais devem se apoiar no texto atualizado fornecido.'),
  topic('lm-estatuto', 'municipal_law', 'Lei Municipal nº 1.060/2011', 'Lei Municipal nº 1.060, de 22 de dezembro de 2011: Regime Jurídico dos Servidores Públicos do Município de Queimados, de suas autarquias e fundações públicas. Não inventar artigos, prazos ou direitos; questões literais exigem o texto oficial atualizado.'),
  topic('esp-administracao-publica', 'specific_knowledge', 'Administração Pública', 'Conceitos e princípios da Administração Pública: legalidade, impessoalidade, moralidade, publicidade e eficiência. Organização administrativa: administração direta e indireta. Atos administrativos: conceito, requisitos, atributos e espécies (noções). Poderes administrativos (noções básicas).'),
  topic('esp-administracao-geral', 'specific_knowledge', 'Administração Geral', 'Funções administrativas: planejamento, organização, direção e controle. Organização e métodos (O&M). Elaboração de fluxogramas, organogramas e rotinas administrativas. Gestão por processos (noções básicas).'),
  topic('esp-recursos-humanos', 'specific_knowledge', 'Recursos Humanos', 'Administração de Recursos Humanos: recrutamento e seleção (noções); treinamento e desenvolvimento de pessoal; avaliação de desempenho (noções); rotinas de pessoal, incluindo controle de frequência, férias e registros funcionais.'),
  topic('esp-materiais', 'specific_knowledge', 'Materiais e Patrimônio', 'Administração de Materiais e Patrimônio: gestão de materiais, compras, recebimento, armazenamento e distribuição; controle de estoque; inventário de bens; controle patrimonial.'),
  topic('esp-orcamento', 'specific_knowledge', 'Administração Financeira e Orçamentária', 'Administração Financeira e Orçamentária (noções): conceitos básicos de orçamento público; receita e despesa pública (noções); execução orçamentária e financeira; controle de gastos públicos.'),
  topic('esp-arquivologia', 'specific_knowledge', 'Arquivologia e Gestão Documental', 'Conceitos de arquivo; classificação, organização e conservação de documentos; protocolo: recebimento, registro, tramitação e expedição; arquivo físico e digital.'),
  topic('esp-redacao-oficial', 'specific_knowledge', 'Redação Oficial', 'Correspondências oficiais: ofício, memorando e relatório; padrão formal de linguagem; clareza, objetividade e concisão; noções do Manual de Redação da Presidência da República.'),
  topic('esp-normas', 'specific_knowledge', 'Legislação e Normas Administrativas', 'Legislação e normas administrativas (noções): aplicação de leis e regulamentos na Administração Pública; interpretação básica de normas; procedimentos administrativos. Não criar conteúdo de lei ou regulamento sem fonte.'),
  topic('esp-planejamento-controle', 'specific_knowledge', 'Planejamento e Controle Administrativo', 'Elaboração e acompanhamento de planos de ação; controle da execução física e financeira; análise de dados e elaboração de relatórios; indicadores de desempenho (noções).'),
  topic('esp-etica', 'specific_knowledge', 'Ética e Conduta no Serviço Público', 'Princípios éticos; responsabilidade do servidor público; relações interpessoais e atendimento ao público.'),
  topic('esp-informatica', 'specific_knowledge', 'Noções Básicas de Informática', 'Noções básicas de informática conforme o conteúdo programático do edital. Não extrapolar para ferramentas, versões, comandos ou recursos específicos que o edital não detalha; quando elaborar treino conceitual, identificar o recorte adotado.')
];

export const getTopic = (topicId: string) => syllabusTopics.find((item) => item.id === topicId);
