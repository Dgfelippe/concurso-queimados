import type { Question, OptionId } from '../domain/types';

const source = {
  kind: 'official' as const,
  label: 'Treino adaptado de prova anterior — gabarito final oficial conferido',
  sourceId: 'iv-ufg-goiania-2026',
  url: 'https://sistemas.institutoverbena.ufg.br/2025/concurso-camara-goiania/sistema/provas_gabaritos/provas/agente%20administrativo.pdf',
  banca: 'IV-UFG',
  contest: 'Câmara Municipal de Goiânia — Agente Administrativo',
  year: 2026
};

type Draft = {
  id: string;
  number: number;
  topicId: string;
  prompt: string;
  answers: [string, string, string, string];
  correct: OptionId;
  explanation: string;
  notes: [string, string, string, string];
  difficulty?: Question['difficulty'];
};

const drafts: Draft[] = [
  {
    id: 'ivufg-2026-q31', number: 31, topicId: 'esp-administracao-geral',
    prompt: 'Na Administração, qual função acompanha indicadores e verifica se ações, normas e objetivos estão sendo alcançados?',
    answers: ['Planejamento', 'Organização', 'Direção', 'Controle'], correct: 'D',
    explanation: 'Controle compara o desempenho observado com os objetivos e padrões definidos. O acompanhamento de indicadores permite identificar desvios e orientar correções.',
    notes: ['Planejamento define objetivos e caminhos antes da execução.', 'Organização distribui recursos, tarefas e responsabilidades.', 'Direção conduz pessoas e recursos durante a execução.', 'Correta. Controle acompanha resultados e verifica o cumprimento do que foi planejado.']
  },
  {
    id: 'ivufg-2026-q32', number: 32, topicId: 'esp-administracao-geral',
    prompt: 'No processo administrativo, a função ligada à orientação das pessoas para que as metas sejam alcançadas é:',
    answers: ['Planejar', 'Organizar', 'Dirigir', 'Controlar'], correct: 'C',
    explanation: 'Direção orienta e mobiliza as pessoas para executar os planos, usando comunicação, liderança e coordenação.',
    notes: ['Planejar estabelece objetivos e ações.', 'Organizar estrutura recursos, atividades e relações de trabalho.', 'Correta. Dirigir orienta a atuação das pessoas na execução.', 'Controlar mede resultados e corrige desvios.']
  },
  {
    id: 'ivufg-2026-q33', number: 33, topicId: 'esp-administracao-geral',
    prompt: 'As atividades que entregam valor diretamente ao usuário e costumam atravessar áreas da organização são chamadas de processos:',
    answers: ['Gerenciais', 'De suporte', 'Primários', 'Acessórios'], correct: 'C',
    explanation: 'Processos primários, também chamados finalísticos, estão ligados à atividade-fim e à entrega direta de valor ao usuário.',
    notes: ['Processos gerenciais orientam e monitoram a organização.', 'Processos de suporte fornecem recursos e apoio aos processos finalísticos.', 'Correta. Processos primários realizam a entrega central ao usuário.', '“Acessórios” não é a classificação adequada nesse conceito.']
  },
  {
    id: 'ivufg-2026-q34', number: 34, topicId: 'esp-administracao-geral',
    prompt: 'Uma rotina administrativa bem estruturada deve:',
    answers: ['Buscar apenas o aumento do rendimento financeiro.', 'Integrar etapas e áreas, com procedimentos e conhecimentos adequados.', 'Limitar-se a tarefas simples, sem necessidade de capacitação.', 'Ser executada isoladamente, sem conexão com objetivos institucionais.'], correct: 'B',
    explanation: 'Rotinas organizam tarefas recorrentes e seus fluxos. Para funcionar, precisam de procedimentos compreensíveis, pessoas capacitadas e integração com o trabalho das demais áreas.',
    notes: ['A rotina também busca regularidade, qualidade e atendimento ao interesse público.', 'Correta. Procedimentos e integração entre setores favorecem continuidade e menos retrabalho.', 'Mesmo rotinas padronizadas podem exigir conhecimento e atualização.', 'O isolamento dificulta a tramitação e pode comprometer os resultados institucionais.']
  },
  {
    id: 'ivufg-2026-q35', number: 35, topicId: 'esp-planejamento-controle',
    prompt: 'Ao avaliar se a gestão de processos gera valor público e resultados alinhados às expectativas sociais, avalia-se principalmente a:',
    answers: ['Efetividade', 'Eficiência', 'Produtividade', 'Conformidade'], correct: 'A',
    explanation: 'Efetividade considera os efeitos e o valor produzido para a sociedade. Eficiência observa a relação entre recursos utilizados e resultados; produtividade mede a produção em relação aos meios empregados.',
    notes: ['Correta. Efetividade observa impacto e valor público alcançado.', 'Eficiência relaciona resultados e recursos, sem medir sozinha o impacto social.', 'Produtividade compara volume produzido e insumos ou tempo.', 'Conformidade verifica aderência a regras e procedimentos.']
  },
  {
    id: 'ivufg-2026-q36', number: 36, topicId: 'esp-administracao-geral',
    prompt: 'Para melhorar o fluxo de um processo administrativo e dar transparência às etapas, é fundamental:',
    answers: ['Mapear decisões e interações entre os setores envolvidos.', 'Medir produtividade somente pelo tempo médio de execução.', 'Automatizar tudo antes de revisar o processo existente.', 'Analisar apenas o resultado final, ignorando etapas e circulação de informações.'], correct: 'A',
    explanation: 'Mapear o processo permite visualizar etapas, responsáveis, pontos de decisão e transferências entre áreas. Com esse diagnóstico, a equipe pode eliminar gargalos antes de propor automação.',
    notes: ['Correta. O mapeamento evidencia dependências, decisões e passagens entre setores.', 'Tempo é um indicador possível, mas sozinho não revela qualidade, retrabalho ou gargalos.', 'Automatizar um fluxo ruim pode apenas acelerar erros e desperdícios.', 'As etapas e informações intermediárias explicam atrasos e falhas no resultado final.']
  },
  {
    id: 'ivufg-2026-q37', number: 37, topicId: 'esp-materiais',
    prompt: 'No controle de estoque, o método que considera primeiro os materiais que entraram há mais tempo é o:',
    answers: ['Custo médio', 'Custo de reposição', 'PEPS', 'UEPS'], correct: 'C',
    explanation: 'PEPS significa “primeiro que entra, primeiro que sai”. A ordem cronológica de saída ajuda a evitar envelhecimento e vencimento dos materiais.',
    notes: ['Custo médio calcula um custo médio ponderado das entradas.', 'Custo de reposição usa o valor necessário para repor o item.', 'Correta. PEPS prioriza a saída do lote mais antigo.', 'UEPS considera primeiro o último lote que entrou.']
  },
  {
    id: 'ivufg-2026-q38', number: 38, topicId: 'esp-materiais',
    prompt: 'Compras, recebimento, armazenagem, distribuição e controle de bens e insumos integram a:',
    answers: ['Gestão de orçamento', 'Gestão de materiais', 'Gestão de protocolo', 'Gestão financeira'], correct: 'B',
    explanation: 'A gestão de materiais organiza o suprimento e o fluxo dos itens: aquisição, recebimento, guarda, distribuição e acompanhamento dos estoques.',
    notes: ['Gestão de orçamento trata da previsão e do acompanhamento de receitas e despesas.', 'Correta. Essas etapas compõem o ciclo de gestão de materiais.', 'Protocolo controla recebimento e tramitação de documentos.', 'Gestão financeira acompanha recursos e operações financeiras.']
  },
  {
    id: 'ivufg-2026-q41', number: 41, topicId: 'esp-orcamento',
    prompt: 'As três funções clássicas do orçamento público são:',
    answers: ['Reguladora, determinativa e controladora.', 'Alocativa, distributiva e estabilizadora.', 'Normativa, classificativa e verificativa.', 'Distributiva, executiva e avaliativa.'], correct: 'B',
    explanation: 'A função alocativa direciona recursos a bens e serviços públicos; a distributiva busca reduzir desigualdades; e a estabilizadora atua sobre emprego, preços e nível de atividade econômica.',
    notes: ['Não é a classificação clássica das funções orçamentárias.', 'Correta. Alocativa, distributiva e estabilizadora são as três funções econômicas clássicas.', 'Os termos não correspondem à classificação consagrada.', '“Executiva” e “avaliativa” não substituem as funções alocativa e estabilizadora.']
  },
  {
    id: 'ivufg-2026-q42', number: 42, topicId: 'esp-orcamento',
    prompt: 'O princípio da unidade orçamentária determina que o orçamento seja uno e que reúna:',
    answers: ['Somente parte das receitas e despesas do exercício.', 'Receitas e despesas com exercício financeiro semestral.', 'Receitas e despesas selecionadas por cada órgão, sem consolidação.', 'Todas as receitas e todas as despesas do exercício financeiro anual.'], correct: 'D',
    explanation: 'O princípio da unidade orienta a existência de um orçamento uno por ente, consolidando as receitas e despesas. A elaboração se refere ao exercício financeiro anual, conforme as normas orçamentárias.',
    notes: ['A fragmentação impede a visão consolidada do orçamento.', 'O exercício financeiro brasileiro é anual.', 'A consolidação é necessária para visão geral e controle.', 'Correta. A unidade reúne o conjunto das receitas e despesas do ente no período anual.']
  },
  {
    id: 'ivufg-2026-q43', number: 43, topicId: 'esp-arquivologia',
    prompt: 'Em classificação de acesso à informação, um documento ostensivo é aquele:',
    answers: ['Que exige medidas rigorosas de restrição.', 'Cuja tramitação deve ser sempre prioritária.', 'Cujo acesso é público, sem restrição de sigilo.', 'Que contém assunto inacessível ao público.'], correct: 'C',
    explanation: 'Documento ostensivo não é sigiloso; seu conteúdo pode ser acessado pelo público, observadas as regras de acesso e proteção de dados aplicáveis.',
    notes: ['Essa descrição se refere a conteúdo protegido ou sigiloso.', 'Prioridade de tramitação não define o grau de acesso.', 'Correta. Ostensivo é o documento sem classificação de sigilo.', 'A restrição de acesso caracteriza informação protegida, não ostensiva.']
  },
  {
    id: 'ivufg-2026-q44', number: 44, topicId: 'esp-arquivologia',
    prompt: 'Para fins de gestão documental, as fases do arquivo são classificadas como:',
    answers: ['Variáveis, regulares e permanentes.', 'Correntes, intermediárias e permanentes.', 'Casual, variável e regular.', 'Administrativas, financeiras e operacionais.'], correct: 'B',
    explanation: 'A teoria das três idades classifica os documentos em corrente, intermediário e permanente, conforme frequência de uso e destinação.',
    notes: ['Não corresponde à teoria das três idades.', 'Correta. São as fases corrente, intermediária e permanente.', 'Esses termos não definem as idades documentais.', 'São áreas ou qualificadores genéricos, não fases do ciclo documental.']
  },
  {
    id: 'ivufg-2026-q45', number: 45, topicId: 'esp-redacao-oficial',
    prompt: 'Na questão da prova de origem, qual documento foi apontado como meio de comunicação oficial entre autoridades, entre superiores e subordinados e entre a Administração e particulares?',
    answers: ['Memorando', 'Edital', 'Portaria', 'Ofício'], correct: 'D',
    explanation: 'O gabarito final da prova assinala “ofício”. A questão usa uma definição tradicional de correspondência oficial; estude também as orientações atuais do Manual de Redação da Presidência da República previstas no seu edital.',
    notes: ['Memorando é associado à comunicação interna em materiais tradicionais, mas não foi o gabarito final desse item.', 'Edital é instrumento de divulgação de ato ou convocação pública.', 'Portaria formaliza determinações e atos administrativos de autoridade.', 'Correta conforme o gabarito final oficial da prova.']
  },
  {
    id: 'ivufg-2026-q46', number: 46, topicId: 'esp-redacao-oficial',
    prompt: 'Na redação oficial, qual atributo recomenda texto claro, conciso e sem ambiguidade ou detalhes irrelevantes?',
    answers: ['Inserir opiniões pessoais do redator.', 'Clareza articulada com concisão.', 'Usar linguagem culta apenas quando o documento for externo.', 'Adotar jargão burocrático para facilitar a leitura.'], correct: 'B',
    explanation: 'A comunicação oficial deve permitir compreensão rápida e fiel. Clareza e concisão ajudam a transmitir a informação sem ambiguidades, excesso de palavras ou opiniões pessoais.',
    notes: ['A redação oficial representa o órgão e não deve inserir opiniões pessoais.', 'Correta. Clareza e concisão são atributos essenciais.', 'O padrão formal é esperado na comunicação oficial, sem depender de o destinatário ser externo.', 'Jargões podem dificultar a compreensão do público.']
  },
  {
    id: 'ivufg-2026-q47', number: 47, topicId: 'esp-etica',
    prompt: 'No atendimento ao público, empatia significa:',
    answers: ['Confirmar que a pessoa entendeu, sem considerar sua situação.', 'Ouvir e considerar o problema da pessoa, buscando compreendê-lo pela perspectiva dela.', 'Usar termos técnicos para transmitir segurança.', 'Definir regras individualizadas conforme a preferência de cada usuário.'], correct: 'B',
    explanation: 'Empatia envolve atenção individual e esforço para compreender a situação do usuário do seu ponto de vista, com respeito e sem abandonar as regras do serviço.',
    notes: ['Verificar compreensão é útil, mas não define empatia por si só.', 'Correta. Empatia considera a experiência e a necessidade da pessoa atendida.', 'Linguagem técnica pode afastar o usuário e dificultar o atendimento.', 'O servidor deve aplicar critérios impessoais e regras comuns a todos.']
  },
  {
    id: 'ivufg-2026-q48', number: 48, topicId: 'esp-administracao-geral',
    prompt: 'A comunicação que envolve os participantes da organização na discussão de problemas e na busca conjunta de soluções é chamada de:',
    answers: ['Organizacional', 'Corporativa', 'Mercadológica', 'Empresarial'], correct: 'A',
    explanation: 'Comunicação organizacional abrange os fluxos de informação e interação entre os integrantes e áreas da organização, apoiando a coordenação e a solução de problemas.',
    notes: ['Correta. O conceito cobre a comunicação e a interação no contexto da organização.', '“Corporativa” pode ser usada em contextos próximos, mas não é a resposta indicada no gabarito.', 'Comunicação mercadológica se relaciona à divulgação e ao mercado.', '“Empresarial” restringe o termo a organizações empresariais e não é o gabarito do item.']
  },
  {
    id: 'ivufg-2026-q49', number: 49, topicId: 'esp-administracao-publica',
    prompt: 'Quando cidadãos controlam governantes por meio de eleições, plebiscitos e referendos, essa forma de accountability é denominada:',
    answers: ['Horizontal', 'Diagonal', 'Governamental', 'Vertical'], correct: 'D',
    explanation: 'Accountability vertical ocorre na relação entre cidadãos e representantes, por mecanismos como voto, plebiscito e referendo. A horizontal é exercida por instituições estatais que fiscalizam outras instituições.',
    notes: ['Horizontal descreve controles entre órgãos e instituições do Estado.', '“Diagonal” não corresponde à classificação descrita no item.', '“Governamental” não é a categoria específica cobrada.', 'Correta. A sociedade controla representantes por mecanismos verticais de participação e responsabilização.']
  }
];

export const archiveQuestions: Question[] = drafts.map((draft) => ({
  id: draft.id,
  discipline: 'specific_knowledge',
  topicId: draft.topicId,
  prompt: draft.prompt,
  options: draft.answers.map((text, index) => ({
    id: (['A', 'B', 'C', 'D'] as const)[index],
    text,
    note: draft.notes[index]
  })),
  correctOption: draft.correct,
  explanation: draft.explanation,
  difficulty: draft.difficulty ?? 'medium',
  provenance: source
}));
