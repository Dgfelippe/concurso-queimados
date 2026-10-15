import type { Question } from '../domain/types';

const provenance = {
  kind: 'official' as const,
  label: 'Treino adaptado de prova oficial — gabarito definitivo conferido',
  sourceId: 'fepese-urubici-2025',
  url: 'https://2025cpurubici.fepese.org.br/?arquivo=S01.pdf&go=download&inline=1',
  banca: 'FEPESE',
  contest: 'Prefeitura de Urubici — Agente Administrativo',
  year: 2026
};

export const urubiciQuestions: Question[] = [
  {
    id: 'fepese-urubici-2025-adapt-q21', discipline: 'specific_knowledge', topicId: 'esp-administracao-publica',
    prompt: 'Ao atender cidadãos, o servidor evita favorecimentos e aplica critérios iguais a pessoas em situações equivalentes. Que princípio orienta essa conduta?',
    options: [
      { id: 'A', text: 'Eficiência.', note: 'Eficiência se refere à qualidade dos resultados e ao uso adequado dos recursos.' },
      { id: 'B', text: 'Publicidade.', note: 'Publicidade diz respeito à transparência e à divulgação dos atos, com as exceções legais.' },
      { id: 'C', text: 'Impessoalidade.', note: 'Correta. Impessoalidade exige atuação sem favorecimento pessoal e voltada ao interesse público.' },
      { id: 'D', text: 'Autotutela.', note: 'Autotutela é a possibilidade de a Administração rever os próprios atos.' },
      { id: 'E', text: 'Continuidade.', note: 'Continuidade está ligada à prestação regular dos serviços públicos.' }
    ],
    correctOption: 'C', explanation: 'O tratamento sem favoritismos é expressão da impessoalidade. O agente deve agir segundo critérios públicos e objetivos.',
    studyTip: 'Diferencie impessoalidade (sem favorecimento) de moralidade (ética), publicidade (transparência) e eficiência (resultado).', difficulty: 'easy', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q22', discipline: 'specific_knowledge', topicId: 'esp-etica',
    prompt: 'Qual atitude representa uma conduta ética no serviço público?',
    options: [
      { id: 'A', text: 'Colocar interesses particulares acima das decisões funcionais.', note: 'A prioridade a interesse particular compromete a imparcialidade e o interesse coletivo.' },
      { id: 'B', text: 'Esconder informações públicas para acelerar a tramitação.', note: 'A celeridade não justifica ocultar informações que devam ser transparentes.' },
      { id: 'C', text: 'Favorecer fornecedores conhecidos para facilitar a comunicação.', note: 'Relações pessoais não justificam favorecimento em atividades públicas.' },
      { id: 'D', text: 'Ignorar procedimentos para cumprir metas rapidamente.', note: 'A busca de rapidez não autoriza descumprir regras e controles.' },
      { id: 'E', text: 'Atuar com transparência e responsabilidade.', note: 'Correta. Transparência e responsabilidade são bases da conduta ética no serviço público.' }
    ],
    correctOption: 'E', explanation: 'A conduta ética combina transparência, responsabilidade e compromisso com o interesse público, respeitando as normas aplicáveis.',
    studyTip: 'A finalidade pública não elimina a obrigação de seguir procedimentos nem legitima favorecimentos.', difficulty: 'easy', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q23', discipline: 'specific_knowledge', topicId: 'esp-planejamento-controle',
    prompt: 'Uma chefia acompanha metas e compara os resultados obtidos com os resultados esperados. Qual função administrativa está sendo exercida?',
    options: [
      { id: 'A', text: 'Planejamento.', note: 'Planejamento estabelece objetivos e define ações antes da execução.' },
      { id: 'B', text: 'Controle.', note: 'Correta. Controle acompanha a execução, compara resultados e identifica desvios.' },
      { id: 'C', text: 'Organização.', note: 'Organização distribui tarefas, recursos e responsabilidades.' },
      { id: 'D', text: 'Direção.', note: 'Direção orienta e mobiliza pessoas durante a execução.' },
      { id: 'E', text: 'Protocolo.', note: 'Protocolo registra e acompanha documentos, não metas de desempenho.' }
    ],
    correctOption: 'B', explanation: 'A função de controle verifica se a execução está alcançando os objetivos e permite corrigir desvios com base em informações.',
    studyTip: 'Se a situação fala em metas, acompanhamento, comparação ou correção de desvio, identifique controle.', difficulty: 'easy', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q24', discipline: 'specific_knowledge', topicId: 'esp-planejamento-controle',
    prompt: 'Uma unidade revisa seus procedimentos em intervalos regulares e faz pequenos ajustes com base nos resultados e nas manifestações dos usuários. Isso exemplifica:',
    options: [
      { id: 'A', text: 'Melhoria contínua.', note: 'Correta. Melhorar continuamente é avaliar processos e aperfeiçoá-los em ciclos sucessivos.' },
      { id: 'B', text: 'Centralização de decisões.', note: 'Centralização trata da concentração da autoridade decisória.' },
      { id: 'C', text: 'Arquivo permanente.', note: 'Arquivo permanente se refere à guarda documental, não ao aperfeiçoamento de processos.' },
      { id: 'D', text: 'Descentralização administrativa.', note: 'Descentralização distribui competências entre pessoas ou entidades.' },
      { id: 'E', text: 'Execução orçamentária.', note: 'Execução orçamentária envolve a realização das receitas e despesas previstas.' }
    ],
    correctOption: 'A', explanation: 'Melhoria contínua usa avaliação, indicadores e retorno dos usuários para aperfeiçoar rotinas de forma iterativa, sem esperar uma crise.',
    studyTip: 'Associe PDCA a planejar, executar, verificar e agir para corrigir ou aperfeiçoar.', difficulty: 'medium', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q25', discipline: 'specific_knowledge', topicId: 'esp-etica',
    prompt: 'Quando servidores com competências diferentes colaboram para alcançar uma meta comum, o principal benefício esperado é:',
    options: [
      { id: 'A', text: 'Reduzir a comunicação entre os integrantes.', note: 'Trabalho em equipe depende de comunicação e coordenação.' },
      { id: 'B', text: 'Substituir objetivos coletivos por metas individuais.', note: 'O propósito é integrar esforços em torno de objetivos compartilhados.' },
      { id: 'C', text: 'Melhorar os resultados pela combinação de esforços.', note: 'Correta. A cooperação reúne conhecimentos e contribuições para alcançar resultados comuns.' },
      { id: 'D', text: 'Eliminar a responsabilidade individual.', note: 'A colaboração não elimina as responsabilidades de cada integrante.' },
      { id: 'E', text: 'Impedir que integrantes apresentem sugestões.', note: 'A participação e a troca de ideias fortalecem o trabalho em equipe.' }
    ],
    correctOption: 'C', explanation: 'O trabalho em equipe combina capacidades e informações dos integrantes para atingir objetivos coletivos com melhor coordenação.',
    studyTip: 'Equipe não significa ausência de responsabilidade: cada pessoa contribui e responde por suas tarefas.', difficulty: 'easy', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q26', discipline: 'specific_knowledge', topicId: 'esp-etica',
    prompt: 'No atendimento ao cidadão, uma comunicação organizacional clara contribui principalmente para:',
    options: [
      { id: 'A', text: 'Restringir informações de rotina sem justificativa.', note: 'Restrições devem ter fundamento; comunicação clara não significa ocultação indiscriminada.' },
      { id: 'B', text: 'Priorizar apenas os fluxos internos do órgão.', note: 'O serviço também precisa responder às necessidades de quem o utiliza.' },
      { id: 'C', text: 'Reduzir o contato para evitar perguntas.', note: 'Evitar o contato não melhora o atendimento nem resolve as dúvidas do cidadão.' },
      { id: 'D', text: 'Tornar as orientações compreensíveis e o serviço mais eficiente.', note: 'Correta. Informações claras facilitam o acesso e reduzem erros e retrabalho.' },
      { id: 'E', text: 'Manter procedimentos sem considerar retornos dos usuários.', note: 'O retorno pode revelar falhas e oportunidades de aperfeiçoamento.' }
    ],
    correctOption: 'D', explanation: 'Comunicação clara ajuda o cidadão a compreender requisitos e etapas, favorece o acesso ao serviço e reduz pedidos incompletos e retrabalho.',
    studyTip: 'Relacione comunicação administrativa a clareza, orientação adequada e qualidade do atendimento.', difficulty: 'medium', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q28', discipline: 'specific_knowledge', topicId: 'esp-materiais',
    prompt: 'Para que serve o controle patrimonial de bens de um município?',
    options: [
      { id: 'A', text: 'Dispensar a conferência física dos bens.', note: 'O controle requer registros e conferências compatíveis com os procedimentos do órgão.' },
      { id: 'B', text: 'Priorizar novas aquisições em vez da conservação.', note: 'O controle patrimonial também permite acompanhar a conservação e a localização dos bens.' },
      { id: 'C', text: 'Registrar somente bens de alto valor.', note: 'O patrimônio público não se limita aos bens de alto valor.' },
      { id: 'D', text: 'Manter identificados e protegidos os bens públicos existentes.', note: 'Correta. O controle registra a existência e a situação dos bens e apoia sua guarda e conservação.' },
      { id: 'E', text: 'Substituir inventários por estimativas sem conferência.', note: 'Estimativas não substituem a conferência e a atualização dos registros.' }
    ],
    correctOption: 'D', explanation: 'O controle patrimonial acompanha identificação, localização, estado e responsabilidade pelos bens, apoiando a guarda e a prestação de contas.',
    studyTip: 'Inventário é uma ferramenta de conferência; controle patrimonial reúne os registros e procedimentos de acompanhamento.', difficulty: 'medium', provenance
  },
  {
    id: 'fepese-urubici-2025-adapt-q30', discipline: 'specific_knowledge', topicId: 'esp-planejamento-controle',
    prompt: 'Uma equipe usa indicadores e opiniões dos usuários para revisar periodicamente os procedimentos e aplicar melhorias graduais. Qual prática de gestão isso representa?',
    options: [
      { id: 'A', text: 'Manter rotinas antigas sem avaliar resultados.', note: 'A ausência de avaliação impede identificar falhas e oportunidades de melhoria.' },
      { id: 'B', text: 'Melhoria contínua baseada em avaliação e ajustes sucessivos.', note: 'Correta. A revisão periódica com dados e retorno permite aperfeiçoamento gradual.' },
      { id: 'C', text: 'Alterar os procedimentos apenas após uma crise.', note: 'Uma gestão preventiva acompanha os resultados antes que problemas se agravem.' },
      { id: 'D', text: 'Priorizar quantidade, mesmo que a qualidade caia.', note: 'Volume sem qualidade pode ampliar erros e comprometer o serviço.' },
      { id: 'E', text: 'Desconsiderar os indicadores e as manifestações recebidas.', note: 'Indicadores e feedback são insumos para avaliar o serviço.' }
    ],
    correctOption: 'B', explanation: 'Melhoria contínua é um ciclo de acompanhamento e ajuste. Indicadores mostram o desempenho e o feedback ajuda a reconhecer problemas sentidos pelos usuários.',
    studyTip: 'Procure alternativas que unem avaliação regular, evidências e correções graduais.', difficulty: 'medium', provenance
  }
];
