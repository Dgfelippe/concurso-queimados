import type { Question } from '../domain/types';

const provenance = {
  kind: 'official' as const,
  label: 'Treino adaptado de prova oficial — gabarito final conferido',
  sourceId: 'iv-ufg-gameleira-2025',
  url: 'https://sistemas.institutoverbena.ufg.br/2025/prefeitura-gameleira/sistema/provas_gabaritos/provas/agente%20administrativo.pdf',
  banca: 'IV-UFG',
  contest: 'Prefeitura e Câmara Municipal de Gameleira de Goiás — Agente Administrativo',
  year: 2026
};

export const gameleiraQuestions: Question[] = [
  {
    id: 'ivufg-gameleira-2026-q31', discipline: 'specific_knowledge', topicId: 'esp-administracao-publica',
    prompt: 'Na administração pública, qual princípio está ligado à oferta de serviços com qualidade, produtividade e uso econômico dos recursos?',
    options: [
      { id: 'A', text: 'Impessoalidade.', note: 'A impessoalidade impede favorecimentos e exige atuação voltada ao interesse público.' },
      { id: 'B', text: 'Eficiência.', note: 'Correta. Eficiência relaciona qualidade dos serviços e resultados ao uso adequado dos recursos.' },
      { id: 'C', text: 'Legalidade.', note: 'Legalidade exige que a Administração atue conforme a lei.' },
      { id: 'D', text: 'Moralidade.', note: 'Moralidade exige conduta ética e proba, conforme os padrões da Administração.' }
    ],
    correctOption: 'B', explanation: 'A eficiência orienta a Administração a produzir bons resultados e serviços de qualidade com uso responsável dos recursos públicos.',
    studyTip: 'Associe eficiência à qualidade do serviço e à boa relação entre recursos empregados e resultados.', difficulty: 'medium', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q32', discipline: 'specific_knowledge', topicId: 'esp-etica',
    prompt: 'Qual conduta de um servidor demonstra compromisso ético com o interesse público?',
    options: [
      { id: 'A', text: 'Decidir com base em preferências pessoais.', note: 'Preferências pessoais podem gerar favorecimento e violar a impessoalidade.' },
      { id: 'B', text: 'Usar informações do trabalho em benefício próprio.', note: 'O acesso funcional a informações não autoriza uso em proveito particular.' },
      { id: 'C', text: 'Priorizar pessoas com maior influência social.', note: 'Dar preferência por influência contraria a igualdade no atendimento.' },
      { id: 'D', text: 'Buscar o bem coletivo e preservar os bens públicos.', note: 'Correta. A atuação ética serve ao interesse coletivo e protege os recursos públicos.' }
    ],
    correctOption: 'D', explanation: 'A ética no serviço público exige que decisões e recursos sejam orientados ao interesse coletivo, sem favorecimentos ou proveito privado.',
    studyTip: 'Em questões de ética, desconfie de alternativas que autorizem privilégio, uso privado de recursos ou informação funcional.', difficulty: 'easy', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q33', discipline: 'specific_knowledge', topicId: 'esp-administracao-geral',
    prompt: 'No processo administrativo, qual função define objetivos futuros e escolhe previamente ações, recursos e tarefas para alcançá-los?',
    options: [
      { id: 'A', text: 'Planejamento.', note: 'Correta. Planejar define objetivos e os caminhos, recursos e tarefas necessários.' },
      { id: 'B', text: 'Organização.', note: 'Organizar distribui atividades, recursos e responsabilidades para executar o plano.' },
      { id: 'C', text: 'Controle.', note: 'Controlar acompanha resultados e compara o que foi realizado com o planejado.' },
      { id: 'D', text: 'Direção.', note: 'Dirigir orienta pessoas e conduz a execução das atividades.' }
    ],
    correctOption: 'A', explanation: 'Planejamento é a função que olha para o futuro, estabelece objetivos e define ações e recursos para alcançá-los.',
    studyTip: 'Memorize a sequência: planejar define o caminho; organizar estrutura; dirigir conduz; controlar verifica.', difficulty: 'easy', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q34', discipline: 'specific_knowledge', topicId: 'esp-materiais',
    prompt: 'Qual é a finalidade central do inventário patrimonial em um órgão público?',
    options: [
      { id: 'A', text: 'Estimar preços de mercado para vender imediatamente os bens.', note: 'O inventário não tem como finalidade promover alienação imediata.' },
      { id: 'B', text: 'Conferir fisicamente os bens e atualizar os registros patrimoniais.', note: 'Correta. O inventário permite verificar a existência e a situação dos bens e manter os registros atualizados.' },
      { id: 'C', text: 'Substituir o tombamento e dispensar o registro dos bens.', note: 'Inventário e tombamento são procedimentos relacionados, mas um não elimina o outro.' },
      { id: 'D', text: 'Atualizar o passivo financeiro do órgão.', note: 'Passivo financeiro não é o objeto do inventário de bens patrimoniais.' }
    ],
    correctOption: 'B', explanation: 'O inventário compara os bens existentes com os registros patrimoniais, permitindo identificar divergências, verificar conservação e corrigir controles.',
    studyTip: 'Diferencie inventário (conferência e atualização) de aquisição, avaliação para venda e registro inicial.', difficulty: 'medium', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q36', discipline: 'specific_knowledge', topicId: 'esp-planejamento-controle',
    prompt: 'Como se chama o conjunto de mecanismos que exige dos gestores públicos prestação de contas à sociedade e responsabilização pelos resultados?',
    options: [
      { id: 'A', text: 'Empowerment.', note: 'Empowerment trata de ampliar autonomia e participação das pessoas nas decisões.' },
      { id: 'B', text: 'Benchmarking.', note: 'Benchmarking compara práticas e resultados para identificar referências de melhoria.' },
      { id: 'C', text: 'Accountability.', note: 'Correta. O conceito reúne prestação de contas, transparência e responsabilização.' },
      { id: 'D', text: 'Governança.', note: 'Governança envolve direção, coordenação e mecanismos de avaliação, mas não é o termo específico definido no enunciado.' }
    ],
    correctOption: 'C', explanation: 'Accountability é a obrigação de prestar contas e responder pelos atos e resultados. Na gestão pública, relaciona-se à transparência e ao controle social.',
    studyTip: 'Associe accountability a prestação de contas e responsabilização; governança é um conceito mais amplo de direção e controle.', difficulty: 'hard', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q37', discipline: 'specific_knowledge', topicId: 'esp-orcamento',
    prompt: 'Qual instrumento de planejamento público estabelece diretrizes, objetivos e metas governamentais para um período de quatro anos?',
    options: [
      { id: 'A', text: 'Lei de Diretrizes Orçamentárias (LDO).', note: 'A LDO orienta a elaboração da lei orçamentária anual e define metas e prioridades para cada exercício.' },
      { id: 'B', text: 'Lei Orçamentária Anual (LOA).', note: 'A LOA estima receitas e fixa despesas para um exercício financeiro.' },
      { id: 'C', text: 'Relatório de Gestão Fiscal (RGF).', note: 'O RGF é instrumento de transparência e acompanhamento da gestão fiscal.' },
      { id: 'D', text: 'Plano Plurianual (PPA).', note: 'Correta. O PPA organiza diretrizes, objetivos e metas para um ciclo de quatro anos.' }
    ],
    correctOption: 'D', explanation: 'O Plano Plurianual estrutura as prioridades e metas do governo para um período de quatro anos. LDO e LOA detalham a programação para os exercícios.',
    studyTip: 'Guarde a função de cada peça: PPA (quatro anos), LDO (prioridades e orientação) e LOA (receitas e despesas do ano).', difficulty: 'medium', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q38', discipline: 'specific_knowledge', topicId: 'esp-redacao-oficial',
    prompt: 'Quais atributos textuais contribuem diretamente para a ligação e a harmonia entre as partes de um texto oficial?',
    options: [
      { id: 'A', text: 'Clareza e precisão.', note: 'Clareza e precisão facilitam a compreensão e evitam ambiguidades.' },
      { id: 'B', text: 'Formalidade e padronização.', note: 'Formalidade e padronização mantêm o padrão institucional das comunicações.' },
      { id: 'C', text: 'Coesão e coerência.', note: 'Correta. Coesão conecta os elementos do texto; coerência mantém a unidade de sentido.' },
      { id: 'D', text: 'Objetividade e concisão.', note: 'Objetividade e concisão reduzem desvios e excessos, mas não nomeiam especificamente a conexão entre elementos.' }
    ],
    correctOption: 'C', explanation: 'Coesão diz respeito à articulação linguística entre partes do texto. Coerência diz respeito à compatibilidade e à progressão das ideias.',
    studyTip: 'Quando o comando mencionar conexão entre frases e harmonia de sentido, pense em coesão e coerência.', difficulty: 'medium', provenance
  },
  {
    id: 'ivufg-gameleira-2026-q39', discipline: 'specific_knowledge', topicId: 'esp-arquivologia',
    prompt: 'No ciclo de vida dos documentos, qual fase define o que será preservado, eliminado ou mantido por prazo administrativo, legal ou fiscal?',
    options: [
      { id: 'A', text: 'Utilização.', note: 'Utilização corresponde ao uso e à consulta do documento durante sua tramitação e atividade.' },
      { id: 'B', text: 'Destinação.', note: 'Correta. A destinação define guarda permanente ou eliminação, respeitados os prazos e critérios aplicáveis.' },
      { id: 'C', text: 'Produção.', note: 'Produção é a criação ou recepção do documento no curso das atividades.' },
      { id: 'D', text: 'Implantação.', note: 'Implantação não é a fase do ciclo de vida definida pelo enunciado.' }
    ],
    correctOption: 'B', explanation: 'A destinação documental estabelece o destino final: eliminação autorizada ou guarda permanente, depois da avaliação e dos prazos de retenção.',
    studyTip: 'Relacione destinação à tabela de temporalidade e à decisão de eliminar ou preservar permanentemente.', difficulty: 'medium', provenance
  }
];
