import type { Discipline, Question, OptionId } from '../domain/types';
import { buildExpandedQuestionBank } from './question-bank-expanded';
import { archiveQuestions } from './archive-questions';

export interface QuestionData extends Question {
  examReference?: string;
  studyTip?: string;
}

const optionIds: OptionId[] = ['A', 'B', 'C', 'D'];

type RawQuestion = {
  id: string;
  discipline: Discipline;
  topicId: string;
  prompt: string;
  answers: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  studyTip?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  provenance: {
    kind: 'official' | 'third_party' | 'original';
    label: string;
    sourceId: string;
    banca?: string;
    contest?: string;
    year?: number;
  };
};

const rawQuestionsList: RawQuestion[] = [
  // ==========================================
  // LÍNGUA PORTUGUESA (Questões de Concursos e Treino Oficial)
  // ==========================================
  {
    id: 'pt-ian-01',
    discipline: 'portuguese',
    topicId: 'pt-concordancia',
    prompt: 'Assinale a frase em que a concordância verbal está de acordo com a norma-padrão da língua portuguesa:',
    answers: [
      'Fazem muitos anos que a prefeitura não realizava concurso dessa magnitude.',
      'Houveram vários candidatos interessados no cargo de agente administrativo.',
      'Faz dez meses que as obras do novo centro administrativo foram concluídas.',
      'Devem haver muitos inscritos disputando as vagas disponíveis no edital.'
    ],
    correctIndex: 2,
    explanation: 'O verbo "fazer", indicando tempo transcorrido, é impessoal e deve ficar estritamente na 3ª pessoa do singular ("Faz dez meses"). As outras alternativas estão erradas: "Fazem muitos anos" (deve ser "Faz"), "Houveram vários" (haver no sentido de existir é impessoal: "Houve vários") e "Devem haver" (a impessoalidade do verbo principal "haver" transmite-se ao auxiliar: "Deve haver").',
    studyTip: '“Haver”, no sentido de existir, e “fazer”, indicando tempo, são impessoais e ficam na 3ª pessoa do singular.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-02',
    discipline: 'portuguese',
    topicId: 'pt-crase',
    prompt: 'O acento indicativo de crase está empregado corretamente em:',
    answers: [
      'O servidor público dirigiu-se à secretaria para protocolar o documento.',
      'O fiscal começou à analisar as notas fiscais apresentadas pela empresa.',
      'A servidora compareceu à uma reunião extraordinária com o coordenador.',
      'O atendimento aos cidadãos ocorre de segunda à sexta-feira sem interrupção.'
    ],
    correctIndex: 0,
    explanation: 'Em "dirigiu-se à secretaria", temos a fusão da preposição "a" exigida pela regência de "dirigir-se" com o artigo definido feminino "a" que determina o substantivo feminino "secretaria". Não há crase antes de verbo ("começou a analisar"), antes de artigo indefinido ("a uma reunião") nem em correlações simétricas sem artigo no primeiro elemento ("de segunda a sexta-feira").',
    studyTip: 'Teste do retorno: quem vai a e volta da, crase no A! "Fui à secretaria / Voltei da secretaria". Diante de verbo ou palavras masculinas: crase proibida.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-03',
    discipline: 'portuguese',
    topicId: 'pt-pontuacao',
    prompt: 'Em: "Cidadãos, apresentem os documentos necessários no guichê de atendimento", a vírgula foi empregada para:',
    answers: [
      'Separar o sujeito do predicado.',
      'Isolar um vocativo.',
      'Indicar a omissão de um verbo.',
      'Separar oração subordinada adjetiva restritiva.'
    ],
    correctIndex: 1,
    explanation: '"Cidadãos" é um vocativo, termo utilizado para chamar ou interpelar o interlocutor. Na norma culta, o vocativo deve sempre ser isolado por vírgula, independentemente da sua posição na frase.',
    studyTip: 'Nunca separe sujeito e predicado por vírgula. O vocativo é termo independente e sempre exige pontuação.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-04',
    discipline: 'portuguese',
    topicId: 'pt-regencia',
    prompt: 'Quanto à regência verbal, assinale a opção que está em plena conformidade com a norma-padrão:',
    answers: [
      'O agente público assistiu o treinamento sobre novo plano de cargos.',
      'Todos os servidores aspiravam ao cargo de chefia do setor administrativo.',
      'O funcionário esqueceu do prazo estipulado no edital de convocação.',
      'O diretor administrativo prefere mais a tramitação física do que a digital.'
    ],
    correctIndex: 1,
    explanation: 'O verbo "aspirar", no sentido de desejar/almejar, é transitivo indireto e exige a preposição "a" ("aspiravam ao cargo"). As demais alternativas contêm desvios: "assistir" no sentido de presenciar exige preposição "a" ("assistiu ao treinamento"); "esquecer" sem pronome é transitivo direto ("esqueceu o prazo", e não "esqueceu do"); e o verbo "preferir" rejeita intensificadores ("prefere X a Y", nunca "prefere mais X do que Y").',
    studyTip: 'Verbo aspirar com sentido de desejar exige "a". Verbo preferir: "prefiro estudar a procrastinar" (sem "do que" e sem "mais").',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-05',
    discipline: 'portuguese',
    topicId: 'pt-coordenacao',
    prompt: 'Leia o período: "O servidor concluiu o relatório no prazo estipulado, no entanto o sistema apresentou falha no envio." A conjunção em destaque expressa sentido de:',
    answers: [
      'Conclusão.',
      'Adversidade (oposição).',
      'Explicação.',
      'Consequência.'
    ],
    correctIndex: 1,
    explanation: 'A conjunção coordenativa "no entanto" (assim como "mas", "porém", "contudo", "todavia", "entretanto") estabelece relação de adversidade, contrapondo uma ideia de quebra de expectativa à oração anterior.',
    studyTip: 'Grave as conjunções adversativas: mas, porém, contudo, todavia, entretanto, no entanto, não obstante.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-06',
    discipline: 'portuguese',
    topicId: 'pt-classes',
    prompt: 'Assinale a opção em que a colocação pronominal segue rigorosamente as regras da norma culta formal:',
    answers: [
      'Me informaram que o processo administrativo foi protocolado ontem.',
      'Não se deve desrespeitar os prazos estabelecidos na legislação.',
      'O diretor chamou-o e disse que enviaria-lhe o memorando em seguida.',
      'Os cidadãos reuniram-se quando convocaram-nos para o esclarecimento.'
    ],
    correctIndex: 1,
    explanation: 'Em "Não se deve", a palavra de sentido negativo "Não" é fator atrativo obrigatório de próclise. Nas outras frases: "Me informaram" inicia oração com pronome oblíquo (vedado pela norma culta: deve ser "Informaram-me"); "enviaria-lhe" com verbo no futuro do pretérito exige mesóclise ("enviar-lhe-ia"); e "quando convocaram-nos" tem a conjunção subordinativa "quando" que atrai o pronome ("quando os convocaram").',
    studyTip: 'Palavras atrativas de próclise (PALAVRAS NEGATIVAS, advérbios, pronomes relativos e conjunções subordinativas) "puxam" o pronome para antes do verbo.',
    difficulty: 'hard',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-07',
    discipline: 'portuguese',
    topicId: 'pt-ortografia',
    prompt: 'De acordo com o Acordo Ortográfico vigente na língua portuguesa, assinale a palavra grafada e acentuada CORRETAMENTE:',
    answers: [
      'Jiboia',
      'Idéia',
      'Auto-escola',
      'Anti-social'
    ],
    correctIndex: 0,
    explanation: '"Jiboia" é palavra paroxítona com ditongo aberto "oi", o qual perdeu o acento agudo pelo Acordo Ortográfico (assim como "ideia", "heroico", "assembleia", "coreia"). "Idéia" está errada pelo acento; "Autoescola" grafa-se junto sem hífen (vogais diferentes); e "Antissocial" grafa-se junto dobrando o "s".',
    studyTip: 'Paroxítonas com ditongos abertos "ei" e "oi" NÃO levam acento: plateia, ideia, jiboia, colmeia.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-08',
    discipline: 'portuguese',
    topicId: 'pt-interpretacao',
    prompt: 'Considere o trecho: "Embora o processo de modernização digital traga celeridade aos trâmites administrativos municipais, é imprescindível preservar canais acessíveis ao cidadão que não dispõe de conectividade." A ideia central do fragmento é que:',
    answers: [
      'A tecnologia é desnecessária e prejudicial aos serviços públicos locais.',
      'O avanço digital é positivo, mas deve coexistir com a inclusão de quem não tem internet.',
      'Apenas pessoas conectadas devem ter acesso a serviços da prefeitura.',
      'O atendimento físico deve ser completamente extinto com a digitalização.'
    ],
    correctIndex: 1,
    explanation: 'A oração concessiva "Embora traga celeridade..." combinada com "é imprescindível preservar canais acessíveis" sintetiza o equilíbrio entre os benefícios da tecnologia e a necessidade de inclusão e equidade social no atendimento ao cidadão.',
    studyTip: 'A conjunção concessiva "embora" reconhece um fato positivo, mas a oração principal enfatiza o contraponto essencial do autor.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-09',
    discipline: 'portuguese',
    topicId: 'pt-termos',
    prompt: 'Na frase "A secretária municipal entregou a certidão ao requerente", o termo destacado "ao requerente" exerce a função sintática de:',
    answers: [
      'Objeto direto.',
      'Objeto indireto.',
      'Complemento nominal.',
      'Agente da passiva.'
    ],
    correctIndex: 1,
    explanation: 'O verbo "entregar" é transitivo direto e indireto (VTDI). Quem entrega, entrega algo ("a certidão" = objeto direto) a alguém ("ao requerente" = objeto indireto, regido pela preposição "a").',
    studyTip: 'Complemento de verbo com preposição exigida pelo verbo = Objeto Indireto. Complemento de substantivo/adjetivo/advérbio = Complemento Nominal.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-10',
    discipline: 'portuguese',
    topicId: 'pt-vocabulario',
    prompt: 'Assinale a alternativa que apresenta o emprego de palavras no sentido CONOTATIVO (figurado):',
    answers: [
      'O servidor organizou os processos arquivados nas pastas metálicas.',
      'Aquele agente administrativo é um verdadeiro pilar para o funcionamento do setor.',
      'A reunião do conselho municipal começou pontualmente às dez horas.',
      'O cidadão assinou a declaração na presença de duas testemunhas.'
    ],
    correctIndex: 1,
    explanation: 'A palavra "pilar" está empregada em sentido figurado (conotativo), representando metaforicamente alguém fundamental e sustentador do ambiente de trabalho. Nas outras opções, as palavras mantêm seu sentido literal (denotativo, de dicionário).',
    studyTip: 'D = Denotativo = Dicionário (real). C = Conotativo = Criativo (figurado, poético, metafórico).',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-11',
    discipline: 'portuguese',
    topicId: 'pt-periodos',
    prompt: 'Assinale a alternativa cujo período apresenta uma oração subordinada substantiva subjetiva (que funciona como sujeito da oração principal):',
    answers: [
      'É necessário que todos os servidores conheçam o Estatuto dos Funcionários.',
      'O supervisor constatou que as metas do trimestre foram cumpridas.',
      'O candidato tinha certeza de que seria aprovado no concurso público.',
      'O agente administrativo necessita de que o sistema seja restabelecido.'
    ],
    correctIndex: 0,
    explanation: 'Em "É necessário que todos os servidores conheçam...", a oração principal "É necessário" é formada por verbo de ligação + predicativo, sem sujeito próprio. A oração subordinada "que todos os servidores conheçam..." atua como sujeito ("Isso é necessário"), configurando-se como subordinada substantiva subjetiva.',
    studyTip: 'Macete: substitua a oração por "ISSO". "É necessário ISSO" -> "ISSO é necessário". Quando "ISSO" vira sujeito da oração, ela é subjetiva.',
    difficulty: 'hard',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'pt-ian-12',
    discipline: 'portuguese',
    topicId: 'pt-concordancia',
    prompt: 'Assinale a opção que atende à norma culta quanto à concordância nominal:',
    answers: [
      'As certidões solicitadas pela auditoria seguem anexas ao ofício.',
      'É proibido a entrada de pessoas sem identificação no arquivo central.',
      'A coordenadora disse: "Muito obrigado pelas informações prestadas."',
      'Os relatórios de prestação de contas estavam meio rasgados.'
    ],
    correctIndex: 0,
    explanation: 'A palavra "anexo" é adjetivo e concorda em gênero e número com o substantivo a que se refere ("as certidões seguem anexas"). Já a opção B erra porque, havendo artigo ("a entrada"), deve ser "É proibida a entrada"; a C erra porque mulheres dizem "obrigada"; e na D a palavra "meio" como advérbio é invariável ("meio rasgados"), porém a frase A é a norma-padrão exemplar e inequívoca.',
    studyTip: 'A palavra "anexo" varia ("fotos anexas", "documento anexo"). Já a locução "em anexo" é sempre invariável ("as certidões seguem em anexo").',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },

  // ==========================================
  // LEGISLAÇÃO MUNICIPAL (Queimados/RJ - Lei Orgânica e Lei 1.060/2011)
  // ==========================================
  {
    id: 'lm-qm-01',
    discipline: 'municipal_law',
    topicId: 'lm-organica',
    prompt: '(Lei Orgânica do Município de Queimados/RJ) Conforme o artigo 1º e as disposições preliminares da Lei Orgânica de Queimados, a Administração Pública Municipal rege-se, entre outros, pelos princípios fundamentais de:',
    answers: [
      'Legalidade, impessoalidade, moralidade, publicidade e eficiência.',
      'Soberania partidária, pessoalidade, sigilo absoluto e discricionariedade ampla.',
      'Independência fiscal plena sem sujeição à fiscalização do Tribunal de Contas.',
      'Subordinação hierárquica automática às deliberações exclusivas da União.'
    ],
    correctIndex: 0,
    explanation: 'A Lei Orgânica de Queimados consagra os princípios basilares da Administração Pública presentes no caput do art. 37 da Constituição Federal: legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE), garantindo atuação voltada ao interesse coletivo e à transparência.',
    studyTip: 'Artigo 1º da Lei Orgânica Municipal de Queimados: Decore o mnemônico LIMPE. Nenhum município pode criar princípios contrários a estes.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-qm-02',
    discipline: 'municipal_law',
    topicId: 'lm-estatuto',
    prompt: '(Lei Municipal nº 1.060/2011 - Estatuto dos Servidores de Queimados) Quanto ao provimento de cargos públicos e ao estágio probatório no Município de Queimados, é correto afirmar:',
    answers: [
      'A posse no cargo efetivo independe de prévia aprovação em concurso público.',
      'O servidor adquire estabilidade após 3 (três) anos de efetivo exercício, mediante aprovação em avaliação especial de desempenho.',
      'O estágio probatório tem duração de apenas 1 (um) ano para os cargos de nível médio.',
      'A investidura no cargo ocorre com a simples publicação da portaria de nomeação no Diário Oficial.'
    ],
    correctIndex: 1,
    explanation: 'Conforme preceitua a Lei Municipal nº 1.060/2011 (em simetria com a EC 19/98 da CF/88), o prazo do estágio probatório é de 3 (três) anos de efetivo exercício, período no qual a aptidão e capacidade do servidor são avaliadas. A investidura no cargo público ocorre formalmente com a POSSE.',
    studyTip: 'Cuidado com a pegadinha da posse x nomeação: a NOMEAÇÃO é forma de provimento; a INVESTIDURA se dá com a POSSE. Estágio probatório = 3 anos.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-qm-03',
    discipline: 'municipal_law',
    topicId: 'lm-estatuto',
    prompt: '(Lei Municipal nº 1.060/2011 - Regime Disciplinar) Segundo o Estatuto dos Servidores Públicos do Município de Queimados, são penalidades disciplinares a que está sujeito o servidor público municipal:',
    answers: [
      'Advertência verbal, prisão administrativa e retenção de bens.',
      'Repreensão, suspensão, demissão, cassação de aposentadoria/disponibilidade e destituição de cargo em comissão.',
      'Multa civil compulsória e perda imediata dos direitos políticos.',
      'Exoneração punitiva e transferência compulsória para outro município.'
    ],
    correctIndex: 1,
    explanation: 'O rol de penalidades disciplinares do estatuto municipal contempla a repreensão, a suspensão, a demissão, a cassação de aposentadoria ou disponibilidade e a destituição de cargo em comissão ou função de confiança. Prisão administrativa não existe e exoneração não tem caráter punitivo.',
    studyTip: 'Atenção: EXONERAÇÃO não é penalidade! Exoneração é desligamento voluntário ou por não aprovação no estágio. DEMISSÃO é penalidade disciplinar.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-qm-04',
    discipline: 'municipal_law',
    topicId: 'lm-organica',
    prompt: 'No âmbito da administração municipal brasileira, são poderes do Município, independentes e harmônicos entre si:',
    answers: [
      'O Executivo e o Legislativo.',
      'O Executivo, o Legislativo e o Judiciário.',
      'O Executivo, o Legislativo e o Ministério Público.',
      'O Legislativo e a Procuradoria Municipal.'
    ],
    correctIndex: 0,
    explanation: 'No âmbito municipal, existem APENAS dois poderes: o Poder Legislativo (exercido pela Câmara Municipal) e o Poder Executivo (exercido pelo Prefeito). Não existe Poder Judiciário nem Ministério Público na esfera municipal (o Poder Judiciário pertence ao Estado e à União).',
    studyTip: 'Pegadinha clássica em provas de prefeitura fluminense: Município NÃO tem Poder Judiciário!',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-qm-05',
    discipline: 'municipal_law',
    topicId: 'lm-estatuto',
    prompt: '(Lei Municipal nº 1.060/2011 - Direitos e Vantagens) Sobre as férias dos servidores públicos municipais de Queimados reguladas pela Lei 1.060/2011, é correto assinalar:',
    answers: [
      'O servidor tem direito a 30 (trinta) dias consecutivos de férias a cada período de 12 (doze) meses de exercício.',
      'As férias não admitem acumulação sob nenhuma hipótese de necessidade do serviço.',
      'O adicional de férias é de apenas 10% da remuneração do servidor.',
      'O direito a férias só é adquirido após cinco anos ininterruptos de serviço público.'
    ],
    correctIndex: 0,
    explanation: 'O servidor faz jus a 30 dias de férias a cada 12 meses de efetivo exercício (período aquisitivo), recebendo remuneração acrescida do terço constitucional (1/3), conforme prevê o estatuto municipal e o art. 7º, XVII c/c art. 39, §3º da CF/88.',
    studyTip: 'Período aquisitivo: 12 meses de exercício = direito a 30 dias de férias + 1/3 da remuneração.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-qm-06',
    discipline: 'municipal_law',
    topicId: 'lm-organica',
    prompt: '(Lei Orgânica de Queimados/RJ) A fiscalização contábil, financeira e orçamentária do Município de Queimados é exercida pela Câmara Municipal mediante controle externo, com o auxílio do:',
    answers: [
      'Tribunal de Contas da União (TCU).',
      'Tribunal de Contas do Estado do Rio de Janeiro (TCE-RJ).',
      'Conselho de Contas dos Municípios.',
      'Poder Judiciário Estadual.'
    ],
    correctIndex: 1,
    explanation: 'No Estado do Rio de Janeiro, o auxílio técnico ao controle externo exercido pelas Câmaras Municipais (exceto Rio de Janeiro capital que tem o TCM-RJ) compete ao Tribunal de Contas do Estado do Rio de Janeiro (TCE-RJ). Queimados/RJ é fiscalizado pelo TCE-RJ.',
    studyTip: 'Em Queimados, quem emite o parecer prévio sobre as contas do Prefeito para julgamento da Câmara é o TCE-RJ.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },

  // ==========================================
  // Conhecimentos específicos do conteúdo programático
  // ==========================================
  {
    id: 'esp-ian-01',
    discipline: 'specific_knowledge',
    topicId: 'esp-administracao-publica',
    prompt: 'Os atos administrativos possuem determinados atributos que os distinguem dos atos jurídicos de direito privado. O atributo pelo qual o ato administrativo é considerado legítimo e verdadeiro até que se prove o contrário denomina-se:',
    answers: [
      'Imperatividade.',
      'Autoexecutoriedade.',
      'Presunção de legitimidade e veracidade.',
      'Tipicidade.'
    ],
    correctIndex: 2,
    explanation: 'A presunção de legitimidade diz respeito à conformidade do ato com a lei, e a presunção de veracidade refere-se aos fatos alegados pela Administração como verdadeiros. Juntas, operam a presunção relativa (juris tantum) de que o ato nasceu válido.',
    studyTip: 'Mnemônico dos Atributos do Ato: PATI (Presunção de legitimidade, Autoexecutoriedade, Tipicidade, Imperatividade).',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-02',
    discipline: 'specific_knowledge',
    topicId: 'esp-administracao-geral',
    prompt: 'No âmbito das funções clássicas da Teoria Geral da Administração, o processo administrativo compõe-se de quatro funções essenciais. Aquela responsável por definir previamente objetivos, diretrizes e planos de ação chama-se:',
    answers: [
      'Organização.',
      'Direção.',
      'Controle.',
      'Planejamento.'
    ],
    correctIndex: 3,
    explanation: 'O Planejamento é a função administrativa que estabelece os objetivos a serem alcançados e define os meios, etapas e recursos necessários para atingi-los. As quatro funções clássicas formam o ciclo PODC: Planejar, Organizar, Dirigir e Controlar.',
    studyTip: 'Ciclo PODC: Planejamento (define metas), Organização (aloca recursos), Direção (lidera e orienta pessoas), Controle (avalia e corrige resultados).',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-03',
    discipline: 'specific_knowledge',
    topicId: 'esp-arquivologia',
    prompt: 'Na arquivologia, a Teoria das Três Idades classifica os documentos de acordo com seu ciclo vital. Os documentos que perderam o valor administrativo e probatório primário, mas são conservados definitivamente em função de seu valor histórico, cultural e de pesquisa, pertencem à:',
    answers: [
      'Primeira idade (arquivo corrente).',
      'Segunda idade (arquivo intermediário).',
      'Terceira idade (arquivo permanente).',
      'Fase transitória de descarte imediato.'
    ],
    correctIndex: 2,
    explanation: 'A terceira idade documental é constituída pelo Arquivo Permanente (ou histórico). Documentos recolhidos ao arquivo permanente são inalienáveis e imprescritíveis, jamais podendo ser eliminados, pois guardam valor secundário (histórico, científico, probatório perpétuo).',
    studyTip: 'Ciclo Vital dos Documentos: 1ª Idade (Corrente - uso frequente), 2ª Idade (Intermediário - aguarda prazo de guarda), 3ª Idade (Permanente - nunca se elimina!).',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-04',
    discipline: 'specific_knowledge',
    topicId: 'esp-redacao-oficial',
    prompt: 'De acordo com as diretrizes do Manual de Redação da Presidência da República (3ª edição), os fechos para comunicações oficiais foram padronizados em duas fórmulas. O fecho adequado para autoridades de mesma hierarquia ou de hierarquia inferior é:',
    answers: [
      'Respeitosamente,',
      'Atenciosamente,',
      'Cordialmente,',
      'Com estima e apreço,'
    ],
    correctIndex: 1,
    explanation: 'Conforme o Manual da Presidência da República: "Respeitosamente," é utilizado para autoridades de hierarquia superior à do remetente (inclusive o Presidente da República); "Atenciosamente," é utilizado para autoridades de mesma hierarquia, de hierarquia inferior ou para particulares.',
    studyTip: 'Regra definitiva do Manual da PR: Superior = Respeitosamente. Igual ou Inferior = Atenciosamente. Elimine qualquer outro fecho ("cordialmente", "grato").',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-05',
    discipline: 'specific_knowledge',
    topicId: 'esp-materiais',
    prompt: 'Na gestão de materiais e estoques, o método de avaliação pelo qual as primeiras unidades que entraram no estoque são as primeiras a saírem no momento do consumo, fazendo com que o estoque final fique avaliado pelos custos mais recentes, é conhecido pela sigla:',
    answers: [
      'PEPS (ou FIFO - First In, First Out).',
      'UEPS (ou LIFO - Last In, First Out).',
      'Custo Médio Ponderado Fixo.',
      'Preço Máximo de Reposição.'
    ],
    correctIndex: 0,
    explanation: 'PEPS (Primeiro que Entra, Primeiro que Sai), correspondente ao FIFO em inglês, estabelece que o lote mais antigo é consumido primeiro, refletindo nos estoques remanescentes os preços das compras mais recentes.',
    studyTip: 'PEPS = Primeiro a Entrar é o Primeiro a Sair. O UEPS (último a entrar, primeiro a sair) não é aceito pela legislação fiscal brasileira para avaliação de estoques.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-06',
    discipline: 'specific_knowledge',
    topicId: 'esp-orcamento',
    prompt: 'De acordo com a Lei Federal nº 4.320/1964, a execução da despesa pública orçamentária é processada obrigatoriamente por meio de três estágios consecutivos. A ordem legal correta é:',
    answers: [
      'Fixação, arrecadação e recolhimento.',
      'Empenho, liquidação e pagamento.',
      'Lançamento, liquidação e quitação.',
      'Programação, autorização e liberação.'
    ],
    correctIndex: 1,
    explanation: 'Nos termos dos artigos 58 a 65 da Lei Federal nº 4.320/1964, os três estágios da despesa pública são: 1º Empenho (reserva do crédito orçamentário), 2º Liquidação (verificação do direito adquirido pelo credor mediante comprovantes da prestação do serviço/entrega do bem), e 3º Pagamento (emissão de ordem de pagamento ao credor).',
    studyTip: 'Mnemônico clássico da despesa: "ELP" -> Empenho, Liquidação, Pagamento. Já a receita pública segue: Previsão, Lançamento, Arrecadação e Recolhimento.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-07',
    discipline: 'specific_knowledge',
    topicId: 'esp-recursos-humanos',
    prompt: 'No gerenciamento de Recursos Humanos nas organizações públicas, o processo sistemático que busca estimar o aproveitamento e a eficiência com que os servidores realizam suas atividades, fornecendo subsídios para treinamentos e progressão na carreira, denomina-se:',
    answers: [
      'Recrutamento misto.',
      'Avaliação de desempenho.',
      'Admissão por certame.',
      'Controle sumário de assiduidade.'
    ],
    correctIndex: 1,
    explanation: 'A avaliação de desempenho é a apreciação sistemática do desempenho de cada servidor na função desempenhada e do seu potencial de desenvolvimento futuro, orientando diagnósticos de capacitação funcional e meritocracia.',
    studyTip: 'Avaliação de desempenho avalia comportamento, entrega e resultados; nunca deve ter cunho pessoal ou arbitrário.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-08',
    discipline: 'specific_knowledge',
    topicId: 'esp-administracao-geral',
    prompt: 'Na área de Organização e Métodos (O&M), a representação gráfica padronizada da sequência lógica e temporal dos passos ou rotinas de um processo de trabalho denomina-se:',
    answers: [
      'Organograma.',
      'Fluxograma.',
      'Cronograma físico-financeiro.',
      'Matriz SWOT.'
    ],
    correctIndex: 1,
    explanation: 'O Fluxograma é o gráfico que descreve o fluxo passo a passo de um processo ou rotina administrativa. O Organograma, por sua vez, representa a estrutura hierárquica e formal dos setores de uma organização.',
    studyTip: 'Não confunda: Organograma = estrutura de cargos e setores. Fluxograma = fluxo de atividades, tarefas e rotinas.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-09',
    discipline: 'specific_knowledge',
    topicId: 'esp-arquivologia',
    prompt: 'No setor de Protocolo de uma repartição pública municipal, a operação de conferência de dados, abertura de capa com número de ordem cronológica e inclusão de folha inicial para dar origem a um processo administrativo chama-se:',
    answers: [
      'Autuação (ou protocolização).',
      'Desentranhamento.',
      'Descarte sumário.',
      'Microfilmagem definitiva.'
    ],
    correctIndex: 0,
    explanation: 'Autuação é o ato de formalizar um documento recebido, atribuindo-lhe capa numerada, data e registro formal para transformá-lo em processo administrativo sujeito a tramitação e controle.',
    studyTip: 'Rotinas do Protocolo: Recebimento -> Registro e Autuação -> Classificação -> Distribuição / Tramitação -> Expedição.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-10',
    discipline: 'specific_knowledge',
    topicId: 'esp-informatica',
    prompt: 'No Microsoft Excel e em planilhas compatíveis, qual função deve ser utilizada para calcular a média aritmética simples dos valores contidos no intervalo de células de B2 até B10?',
    answers: [
      '=MEDIANA(B2:B10)',
      '=MÉDIA(B2:B10)',
      '=SOMA(B2:B10)/TOTAL',
      '=MEDIA.PONDERADA(B2;B10)'
    ],
    correctIndex: 1,
    explanation: 'A função padronizada no Microsoft Excel em língua portuguesa é =MÉDIA(intervalo), que soma todos os valores numéricos no intervalo delimitado por dois pontos (B2:B10) e divide pelo número de células com valores.',
    studyTip: 'No Excel: ":" significa "até" (B2 até B10). ";" significa "e" (célula B2 e célula B10). Toda fórmula inicia com o sinal de igual (=).',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-11',
    discipline: 'specific_knowledge',
    topicId: 'esp-etica',
    prompt: 'O princípio ético da Administração Pública que veda expressamente o servidor de utilizar a máquina pública para autopromoção pessoal ou favorecimento indevido de terceiros é o da:',
    answers: [
      'Legalidade estrita.',
      'Impessoalidade.',
      'Publicidade irrestrita.',
      'Razoabilidade orçamentária.'
    ],
    correctIndex: 1,
    explanation: 'O princípio da impessoalidade estabelece que a atividade administrativa deve ser dirigida estritamente ao interesse público, não podendo o servidor valer-se de sua função para auferir vantagens pessoais ou privilegiar terceiros, vedando-se nomes, símbolos ou imagens que caracterizem promoção pessoal.',
    studyTip: 'CF art. 37, §1º: A publicidade dos atos, programas, obras e serviços terá caráter educativo, informativo ou de orientação social, dela não podendo constar nomes, símbolos ou imagens que caracterizem promoção pessoal.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-12',
    discipline: 'specific_knowledge',
    topicId: 'esp-planejamento-controle',
    prompt: 'O método de melhoria contínua amplamente adotado na administração para planejar, executar, verificar resultados frente às metas e agir corretivamente em desvios é simbolizado pela sigla:',
    answers: [
      'PDCA (Plan, Do, Check, Act).',
      'SWOT (Strengths, Weaknesses, Opportunities, Threats).',
      'BSC (Balanced Scorecard).',
      'PEPS (Primeiro que Entra, Primeiro que Sai).'
    ],
    correctIndex: 0,
    explanation: 'O ciclo PDCA (Deming/Shewhart) é a ferramenta de controle e melhoria contínua estruturada em 4 etapas: Planejar (Plan), Executar (Do), Checar/Controlar (Check) e Agir corretivamente (Act).',
    studyTip: 'PDCA é um ciclo sem fim de melhoria: planeja a ação, executa, checa os desvios com indicadores e age para corrigir.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-13',
    discipline: 'specific_knowledge',
    topicId: 'esp-materiais',
    prompt: 'Na gestão de patrimônio de um órgão público municipal, o procedimento administrativo que consiste no levantamento físico e conferência de todos os bens móveis e imóveis permanentes pertencentes à instituição chama-se:',
    answers: [
      'Alienação fiduciária.',
      'Inventário patrimonial.',
      'Tombamento sumário.',
      'Baixa por obsolescência.'
    ],
    correctIndex: 1,
    explanation: 'O inventário patrimonial é o levantamento detalhado e a verificação in loco de todos os bens permanentes do órgão, conferindo sua localização, plaqueta de identificação (tombamento), estado de conservação e conformidade com os registros contábeis.',
    studyTip: 'Tombamento é a identificação e registro inicial do bem. Inventário é a contagem e verificação periódica de todos os bens já existentes.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-14',
    discipline: 'specific_knowledge',
    topicId: 'esp-normas',
    prompt: 'Em um processo administrativo municipal, o princípio que impõe à autoridade administrativa o dever de expor expressamente as razões de fato e os fundamentos jurídicos que justificam sua decisão é o princípio da:',
    answers: [
      'Motivação.',
      'Autotutela.',
      'Discricionariedade absoluta.',
      'Continuidade do serviço.'
    ],
    correctIndex: 0,
    explanation: 'A motivação é a demonstração formal das razões de fato (acontecimentos) e de direito (normas jurídicas) que fundamentam a prática do ato administrativo, viabilizando o controle de legalidade pelo cidadão e pelo Poder Judiciário.',
    studyTip: 'Atenção à diferença: "Motivo" é o acontecimento fático que gerou o ato; "Motivação" é o texto escrito onde a autoridade justifica e fundamenta a decisão.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-ian-15',
    discipline: 'specific_knowledge',
    topicId: 'esp-informatica',
    prompt: 'Um servidor municipal recebe uma mensagem de e-mail informando que sua conta institucional foi bloqueada e solicitando que clique em um link para digitar usuário e senha bancária. Essa técnica fraudulenta de engenharia social é conhecida como:',
    answers: [
      'Firewall.',
      'Phishing.',
      'Spyware reverso.',
      'Backup em nuvem.'
    ],
    correctIndex: 1,
    explanation: 'Phishing (pescaria digital) é a técnica de fraude eletrônica em que invasores utilizam comunicações falsas que simulam entidades confiáveis (bancos, órgãos oficiais) para induzir a vítima a fornecer dados pessoais, senhas ou clicar em links maliciosos.',
    studyTip: 'Desconfie de links urgentes, e-mails com ameaças de bloqueio ou solicitação de dados sensíveis. Nunca passe senhas por e-mail.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },

  // ==========================================
  // BLOCO COMPLEMENTAR PARA COMPLETUDE TOTAL E TREINO ESPECÍFICO
  // ==========================================
  {
    id: 'esp-tr-01',
    discipline: 'specific_knowledge',
    topicId: 'esp-administracao-publica',
    prompt: 'A Administração Indireta do Município é composta por entidades descentralizadas que possuem personalidade jurídica própria. São exemplos de entidades da Administração Indireta:',
    answers: [
      'Autarquias, Fundações Públicas, Empresas Públicas e Sociedades de Economia Mista.',
      'Secretarias Municipais, Gabinete do Prefeito e Subprefeituras.',
      'Tribunal de Contas do Estado e Assembleia Legislativa.',
      'Conselhos Comunitários e Cooperativas de Moradores.'
    ],
    correctIndex: 0,
    explanation: 'A administração indireta é fruto da descentralização administrativa por outorga e compreende: Autarquias, Fundações Públicas, Empresas Públicas e Sociedades de Economia Mista. Órgãos como Secretarias Municipais pertencem à administração direta.',
    studyTip: 'Mnemônico da Administração Indireta: FASE (Fundações, Autarquias, Sociedades de economia mista, Empresas públicas).',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-02',
    discipline: 'specific_knowledge',
    topicId: 'esp-redacao-oficial',
    prompt: '(Manual de Redação da Presidência da República / Edital Queimados) No padrão formal de redação oficial, o pronome de tratamento correto para se dirigir ao Prefeito Municipal de Queimados em uma correspondência oficial é:',
    answers: [
      'Vossa Excelência.',
      'Vossa Magnificência.',
      'Vossa Ilustríssima.',
      'Vossa Santidade.'
    ],
    correctIndex: 0,
    explanation: 'O Manual de Redação da Presidência da República determina o tratamento de "Vossa Excelência" para chefes de Poder Executivo (Presidente, Governadores e Prefeitos), membros do Poder Legislativo e do Poder Judiciário.',
    studyTip: 'Prefeito Municipal = Vossa Excelência. O vocativo em ofício é "Senhor Prefeito,".',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-03',
    discipline: 'specific_knowledge',
    topicId: 'esp-materiais',
    prompt: 'Em um almoxarifado municipal, a quantidade de estoque que tem a finalidade de evitar o desabastecimento em caso de atraso na entrega pelo fornecedor ou aumento imprevisto no consumo é denominada:',
    answers: [
      'Estoque de Segurança (ou Estoque Mínimo).',
      'Estoque Máximo Operacional.',
      'Ponto de Venda Residual.',
      'Lote Econômico Descartável.'
    ],
    correctIndex: 0,
    explanation: 'O estoque de segurança (ou estoque mínimo) é uma reserva preventiva calculada para absorver incertezas no prazo de reposição (lead time) e oscilações atípicas de demanda, impedindo a ruptura de estoque.',
    studyTip: 'Estoque mínimo protege contra falta; ponto de pedido dispara a nova compra.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-04',
    discipline: 'specific_knowledge',
    topicId: 'esp-planejamento-controle',
    prompt: 'A ferramenta da qualidade que organiza o planejamento de ações respondendo a 7 perguntas essenciais (O que, Por que, Onde, Quando, Quem, Como e Quanto custará) é conhecida como:',
    answers: [
      '5W2H.',
      'Diagrama de Ishikawa.',
      'Gráfico de Pareto.',
      'Análise GUT.'
    ],
    correctIndex: 0,
    explanation: '5W2H sintetiza: What (o que), Why (por que), Where (onde), When (quando), Who (quem), How (como) e How much (quanto custa), sendo amplamente utilizada para estruturar planos de ação administrativos.',
    studyTip: '5W (What, Why, Where, When, Who) + 2H (How, How much) = Plano de ação claro e completo.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-05',
    discipline: 'specific_knowledge',
    topicId: 'esp-recursos-humanos',
    prompt: 'O tipo de recrutamento no qual a organização busca preencher vagas abertas aproveitando seus próprios servidores, por meio de promoções ou transferências internas, chama-se:',
    answers: [
      'Recrutamento externo.',
      'Recrutamento interno.',
      'Recrutamento compulsório.',
      'Terceirização emergencial.'
    ],
    correctIndex: 1,
    explanation: 'O recrutamento interno ocorre quando a vaga é ofertada aos colaboradores que já atuam na própria instituição, valorizando o quadro e motivando os servidores existentes.',
    studyTip: 'Recrutamento interno valoriza os servidores da casa; recrutamento externo traz novas competências de fora.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-06',
    discipline: 'specific_knowledge',
    topicId: 'esp-orcamento',
    prompt: 'O documento emitido pela Administração Pública no estágio do empenho que formaliza a reserva de dotação orçamentária e especifica o credor, a importância e o objeto da despesa é a:',
    answers: [
      'Nota de Empenho (NE).',
      'Ordem Bancária (OB).',
      'Guia de Recolhimento da União.',
      'Declaração de Arrecadação Fiscal.'
    ],
    correctIndex: 0,
    explanation: 'A Nota de Empenho (NE) formaliza o ato de empenho, garantindo ao fornecedor ou prestador de serviço que os recursos correspondentes à despesa foram devidamente reservados e comprometidos no orçamento público.',
    studyTip: 'Empenho = gera Nota de Empenho (NE). Pagamento = gera Ordem Bancária (OB).',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-tr-07',
    discipline: 'municipal_law',
    topicId: 'lm-organica',
    prompt: '(Lei Orgânica de Queimados/RJ) O prazo do mandato do Prefeito e do Vice-Prefeito de Queimados, eleitos pelo voto direto e secreto, é de:',
    answers: [
      '4 (quatro) anos, permitida uma reeleição para o período subsequente.',
      '5 (cinco) anos, vedada a reeleição em qualquer hipótese.',
      '2 (dois) anos com renovação bienal compulsória.',
      '6 (seis) anos sem direito a prorrogação.'
    ],
    correctIndex: 0,
    explanation: 'Em consonância com o art. 29, II da Constituição Federal e a Lei Orgânica Municipal, o mandato é de 4 anos, tendo início em 1º de janeiro do ano seguinte ao da eleição, sendo permitida a reeleição para um único mandato subsequente.',
    studyTip: 'Mandato municipal no Brasil: sempre 4 anos para Prefeito, Vice e Vereadores.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'lm-tr-08',
    discipline: 'municipal_law',
    topicId: 'lm-estatuto',
    prompt: '(Lei Municipal nº 1.060/2011 - Estatuto dos Servidores) De acordo com o Estatuto dos Servidores de Queimados, a investidura do servidor aprovado em concurso público efetiva-se com:',
    answers: [
      'A posse.',
      'A simples homologação do concurso.',
      'A inscrição no certame.',
      'A realização do exame médico pré-admissional.'
    ],
    correctIndex: 0,
    explanation: 'A posse é o ato formal no qual o candidato nomeado assina o termo de compromisso e aceita as atribuições, deveres e responsabilidades do cargo público, momento em que se concretiza a INVESTIDURA no cargo.',
    studyTip: 'Nomeação chama; Posse INVESTE no cargo; Exercício começa a trabalhar.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-07',
    discipline: 'specific_knowledge',
    topicId: 'esp-etica',
    prompt: 'No trato com os cidadãos que procuram a prefeitura municipal, é DEVER do agente administrativo:',
    answers: [
      'Atender com presteza, urbanidade, paciência e imparcialidade, prestando as informações solicitadas, ressalvadas as protegidas por sigilo legal.',
      'Priorizar parentes e amigos na fila de atendimento com base no princípio da amizade.',
      'Cobrar taxa informal para agilizar a tramitação de requerimentos prioritários.',
      'Recusar-se a prestar informações quando o cidadão for humilde ou iletrado.'
    ],
    correctIndex: 0,
    explanation: 'O dever de urbanidade e presteza exige atenção, respeito e atendimento impessoal a qualquer cidadão, assegurando o direito fundamental de acesso à informação (Lei 12.527/2011) e proibindo favorecimentos ou cobranças ilegais.',
    studyTip: 'Urbanidade + Eficiência + Impessoalidade = Base do atendimento ao público no concurso.',
    difficulty: 'easy',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  },
  {
    id: 'esp-tr-08',
    discipline: 'specific_knowledge',
    topicId: 'esp-normas',
    prompt: 'Na administração pública, o poder conferido à autoridade para fiscalizar, ordenar, coordenar e rever os atos de seus agentes subordinados é o:',
    answers: [
      'Poder hierárquico.',
      'Poder de polícia.',
      'Poder judicante.',
      'Poder regulamentar originário.'
    ],
    correctIndex: 0,
    explanation: 'O Poder Hierárquico é o instrumento de que dispõe o Executivo para distribuir e escalonar funções de seus órgãos, ordenando e revendo a atuação de seus agentes, estabelecendo a relação de subordinação.',
    studyTip: 'Hierarquia = ordenar, coordenar, controlar e rever atos de subordinados dentro do mesmo órgão.',
    difficulty: 'medium',
    provenance: { kind: 'original', label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  }
];

// Preservamos também as questões de fixação rápida já mapeadas anteriormente para completar o banco
const originalSeeds: [string, Discipline, string, string, [string, string, string, string], 0 | 1 | 2 | 3, string, string?][] = [
  ['pt01','portuguese','pt-interpretacao','Ao ler que “a equipe reorganizou o arquivo para localizar documentos com mais rapidez”, conclui-se que a medida buscou principalmente:', ['Aumentar a produção de documentos.','Facilitar a recuperação da informação.','Eliminar o protocolo.','Restringir o acesso aos registros.'],1,'A organização arquivística permite localizar e recuperar documentos com agilidade e integridade.', 'Foco no objetivo principal do texto.'],
  ['pt02','portuguese','pt-interpretacao','Um texto oficial relata: “Embora o atendimento tenha começado no horário, a fila cresceu por falta de pessoal.” A causa do aumento da fila foi:', ['O início pontual.','A ausência de usuários.','A insuficiência de pessoal.','A redução do expediente.'],2,'A oração introduzida por “por” expressa a causa direta: a falta de pessoal no guichê.', 'Identifique o conectivo causal.'],
  ['pt03','portuguese','pt-vocabulario','Em “o servidor apresentou uma resposta clara”, o termo “clara” significa contextualmente:', ['Transparente fisicamente.','Compreensível e nítida.','Iluminada por lâmpada.','Brilhante ao sol.'],1,'No contexto da comunicação administrativa, “clara” significa inteligível, compreensível.', 'Sentido contextual das palavras.'],
  ['pt04','portuguese','pt-vocabulario','Assinale o par de vocábulos que estabelecem relação de ANTONÍMIA:', ['Cordial e gentil.','Expedir e enviar.','Provisório e permanente.','Rápido e veloz.'],2,'Provisório e permanente exprimem ideias antagônicas, opostas.', 'Antônimos têm sentidos contrários.'],
  ['pt05','portuguese','pt-ortografia','Assinale a palavra corretamente grafada e acentuada de acordo com o padrão ortográfico:', ['ideia','heróico','voo com acento circunflexo','enjôo'],0,'Pelo Acordo Ortográfico, paroxítonas com ditongos abertos "ei" e "oi" (ideia, assembleia) e hiatos "oo" (voo, enjoo) não recebem acento gráfico.', 'Ditongos abertos em paroxítonas perderam o acento.'],
  ['pt06','portuguese','pt-ortografia','A grafia correta do substantivo é:', ['excessão','exceção','escessão','excesssão'],1,'A grafia correta na língua portuguesa é "exceção" (com "xc" e "ç").', 'Atenção aos dígrafos e sibilantes.'],
  ['pt07','portuguese','pt-pontuacao','Em “Senhores servidores, encaminhem o relatório”, a vírgula é obrigatória para isolar:', ['O sujeito simples.','O vocativo.','O adjunto adnominal.','O predicativo do sujeito.'],1,'“Senhores servidores” interpela o interlocutor, configurando vocativo, que exige vírgula.', 'Vocativo sempre se isola por vírgula.'],
  ['pt08','portuguese','pt-pontuacao','Em “O documento, que estava devidamente assinado, foi anexado aos autos”, as vírgulas isolam:', ['Oração subordinada adjetiva explicativa.','Enumeração de itens do processo.','Vocativo composto.','Aposto especificativo.'],0,'A oração adjetiva introduzida por pronome relativo entre vírgulas possui caráter explicativo.', 'Entre vírgulas = explicativa; sem vírgulas = restritiva.'],
  ['pt09','portuguese','pt-classes','Na oração “O agente administrativo analisou cuidadosamente os requerimentos”, o vocábulo “cuidadosamente” é morfologicamente classificado como:', ['Adjetivo.','Substantivo concreto.','Advérbio de modo.','Preposição acidental.'],2,'O advérbio modifica o verbo "analisou", indicando a circunstância de modo.', 'Terminação em -mente geralmente indica advérbio de modo.'],
  ['pt10','portuguese','pt-classes','Em “Aqueles processos físicos foram digitalizados”, a palavra “aqueles” classifica-se como:', ['Pronome pessoal do caso reto.','Pronome demonstrativo.','Pronome relativo.','Pronome indefinido.'],1,'“Aqueles” situa o substantivo "processos" no espaço/contexto, sendo pronome demonstrativo.', 'Pronomes demonstrativos apontam posição.'],
  ['pt11','portuguese','pt-termos','Na oração “A comissão de concurso homologou as inscrições”, o sujeito é classificado como:', ['A comissão de concurso (sujeito simples).','Homologou (sujeito oculto).','As inscrições (sujeito paciente).','Indeterminado.'],0,'O sujeito simples possui apenas um núcleo: "comissão".', 'Encontre o verbo e pergunte: quem praticou a ação?'],
  ['pt12','portuguese','pt-termos','Em “O atendente entregou o comprovante ao cidadão”, o termo “ao cidadão” funciona sintaticamente como:', ['Sujeito composto.','Objeto direto.','Objeto indireto.','Agente da passiva.'],2,'O verbo "entregar" rege complemento com preposição ("a quem"), funcionando como objeto indireto.', 'Complemento verbal preposicionado = objeto indireto.'],
  ['pt13','portuguese','pt-coordenacao','“O prazo do edital encerrou-se, portanto novas inscrições não serão aceitas.” A conjunção em destaque estabelece valor de:', ['Conclusão.','Oposição.','Causa.','Alternância.'],0,'“Portanto” é conjunção coordenativa conclusiva, ligando a premissa à sua decorrência lógica.', 'Portanto, logo, por conseguinte = conclusivas.'],
  ['pt14','portuguese','pt-coordenacao','“O fiscal realizou a vistoria e lavrou o auto de infração.” A conjunção “e” estabelece sentido de:', ['Adição de ações.','Condição hipotética.','Concessão fática.','Causa explicativa.'],0,'A conjunção aditiva “e” soma duas ações praticadas sucessivamente pelo agente.', 'Ação somada a outra ação = valor aditivo.'],
  ['pt15','portuguese','pt-periodos','“Quando a reunião começou, os conselheiros receberam a pauta.” O período classifica-se como:', ['Simples.','Composto por subordinação.','Composto por coordenação pura.','Nominal incompleto.'],1,'Há duas orações e a primeira é subordinada adverbial temporal iniciada por "quando".', 'Conjunção subordinativa gera período subordinado.'],
  ['pt16','portuguese','pt-periodos','A sentença “O protocolo registrou os documentos e expediu as certidões” constitui um período composto com:', ['Uma oração absoluta.','Duas orações coordenadas.','Três orações subordinadas adjetivas.','Nenhuma forma verbal conjugada.'],1,'Os verbos “registrou” e “expediu” formam duas orações coordenadas aditivas.', 'Contagem de orações = contagem de verbos.'],
  ['pt17','portuguese','pt-concordancia','Assinale a opção em que a concordância verbal obedece estritamente ao padrão culto:', ['Fazem dez anos que o estatuto foi editado.','Faz dez anos que o estatuto foi editado.','Houveram muitas dúvidas na inscrição.','Existe muitas pendências a resolver.'],1,'“Fazer” indicando tempo transcorrido é impessoal e fica na 3ª pessoa do singular.', 'Verbo impessoal não tem sujeito e fica no singular.'],
  ['pt18','portuguese','pt-concordancia','Indique a construção com concordância nominal CORRETA:', ['Seguem anexas as declarações exigidas no edital.','Segue anexas as declarações exigidas no edital.','Segue anexo as declarações exigidas no edital.','Seguem anexo a declaração exigida no edital.'],0,'O adjetivo “anexas” concorda em gênero e número com o sujeito “as declarações”.', '"Anexo" concorda com o nome a que se refere.'],
  ['pt19','portuguese','pt-regencia','No sentido de “presenciar / assistir a”, qual frase atende à norma culta?', ['O servidor assistiu ao treinamento obrigatório.','O servidor assistiu o treinamento obrigatório.','O servidor assistiu do treinamento obrigatório.','O servidor assistiu no treinamento obrigatório.'],0,'No sentido de ver ou presenciar, "assistir" exige preposição "a".', 'Assistir = ver -> transitivo indireto com preposição "a".'],
  ['pt20','portuguese','pt-regencia','Assinale a frase em que a regência do verbo "obedecer" está correta:', ['O servidor deve obedecer as normas regimentais.','O servidor deve obedecer às normas regimentais.','O servidor deve obedecer com as normas regimentais.','O servidor deve obedecer pelas normas regimentais.'],1,'O verbo "obedecer" é transitivo indireto e rege a preposição "a" (às normas = a + as).', 'Obedecer e desobedecer exigem preposição "a".'],
  ['pt21','portuguese','pt-crase','O uso do acento indicativo de crase é OBRIGATÓRIO em:', ['Entregou a documentação à diretora de administração.','Começou à redigir o relatório da comissão.','O candidato veio à pé ao local de aplicação da prova.','Encaminhou solicitação à Vossa Excelência.'],0,'Há fusão da preposição "a" exigida por entregar com o artigo definido "a" antes de diretora.', 'Antes de verbo, palavra masculina e pronome de tratamento (em regra), não há crase.'],
  ['pt22','portuguese','pt-crase','Na frase “O atendimento ao público ocorre de segunda a sexta”, não há crase porque:', ['Não existe preposição na frase.','O termo "a" é apenas preposição isolada, sem artigo antes de "sexta".','O verbo ocorrer rejeita qualquer preposição.','A palavra sexta é masculina.'],1,'Na correlação "de... a...", quando a primeira não tem artigo (de, e não da), a segunda também não tem artigo.', 'Se diz "de segunda", usa-se "a sexta" sem crase.'],
  
  // Legislação Municipal
  ['lm01','municipal_law','lm-organica','Segundo a Lei Orgânica Municipal de Queimados, a administração pública municipal deve observar expressamente os princípios de:', ['Legalidade, impessoalidade, moralidade e publicidade.','Sigilo, conveniência individual e promoção partidária.','Hierarquia religiosa e soberania orçamentária plena.','Autonomia sem fiscalização contábil.'],0,'O texto consagra legalidade, impessoalidade, moralidade, publicidade e supremacia do interesse público.', 'Princípios fundamentais do art. 37 da CF e da Lei Orgânica.'],
  ['lm02','municipal_law','lm-organica','Para dirimir dúvidas sobre o texto vigente da Lei Orgânica de Queimados, a orientação mais segura ao candidato é:', ['Consultar resumos genéricos sem indicação de ano.','Conferir o texto integral e as emendas disponibilizadas oficialmente para o concurso.','Utilizar normas de capitais vizinhas.','Ignorar as alterações legislativas recentes.'],1,'Legislação local exige consulta ao texto e emendas disponibilizados na página do concurso e da Câmara Municipal.', 'Foque na legislação indicada no Anexo do edital.'],
  ['lm03','municipal_law','lm-estatuto','A Lei Municipal nº 1.060/2011 de Queimados dispõe sobre:', ['O Regime Jurídico dos Servidores Públicos do Município de Queimados, de suas autarquias e fundações.','O Código Tributário e arrecadação de ISS.','As diretrizes urbanísticas do plano diretor da baixada.','O estatuto dos servidores estaduais do Rio de Janeiro.'],0,'A Lei 1.060/2011 é o estatuto jurídico único dos servidores estatutários de Queimados/RJ.', 'Esta lei é o cerne do conteúdo de Legislação Municipal.'],
  ['lm04','municipal_law','lm-estatuto','O servidor público estável do Município de Queimados só perderá o cargo em virtude de:', ['Sentença judicial transitada em julgado, processo administrativo disciplinar com ampla defesa ou avaliação periódica de desempenho.','Decisão verbal e discricionária do chefe do setor.','Simples troca de mandato do prefeito municipal.','Redução informal do quadro de funcionários.'],0,'Garantias constitucionais do art. 41 reproduzidas no estatuto municipal protegem o servidor estável contra arbitrariedades.', 'Estabilidade traz segurança jurídica à função pública.'],
  ['lm05','municipal_law','lm-organica','O princípio da publicidade no serviço público municipal visa principalmente:', ['Garantir a transparência dos atos administrativos e permitir o controle social.','Promover a imagem individual do agente público.','Dispensar a fundamentação das decisões públicas.','Restringir o acesso dos munícipes aos dados do município.'],0,'A publicidade torna os atos conhecidos, gerando eficácia e permitindo o controle da sociedade.', 'Transparência é regra; o sigilo é exceção taxativa.'],
  ['lm06','municipal_law','lm-estatuto','Constitui dever fundamental do servidor público de Queimados previsto no estatuto:', ['Exercer com zelo e dedicação as atribuições do cargo e observar as normas legais e regulamentares.','Ausentar-se do serviço sem autorização prévia durante o expediente.','Promover comércio particular dentro do ambiente de trabalho.','Recusar fé a documentos públicos oficiais.'],0,'O exercício com zelo, lealdade e observância às normas é dever nuclear do servidor público.', 'Deveres do servidor: zelo, assiduidade e legalidade.'],

  // Conhecimentos Específicos
  ['sp01','specific_knowledge','esp-administracao-publica','O princípio constitucional da impessoalidade veda ao agente público:', ['Atuar com base em preferências políticas ou favorecimento pessoal.','Cumprir os prazos estabelecidos em regulamento.','Prestar atendimento respeitoso a qualquer munícipe.','Acatar as ordens legais emanadas de seus superiores.'],0,'A impessoalidade proíbe perseguições ou privilégios, tratando todos com isonomia.', 'Impessoalidade é agir em nome do Estado, sem partidarismo.'],
  ['sp02','specific_knowledge','esp-administracao-publica','Dentre os entes abaixo, pertence à Administração Pública Indireta:', ['Uma autarquia municipal.','Uma secretaria municipal de saúde.','O gabinete do chefe do executivo.','Um departamento interno sem CNPJ.'],0,'Autarquias possuem personalidade jurídica própria de direito público e integram a administração indireta.', 'Secretarias são órgãos da administração direta.'],
  ['sp03','specific_knowledge','esp-administracao-geral','A função administrativa responsável pela distribuição de tarefas, autoridade e recursos entre os membros da organização é:', ['A organização.','O controle posterior.','A redação oficial.','O arquivamento permanente.'],0,'Organizar consiste em agrupar atividades e alocar recursos humanos e materiais adequadamente.', 'Organizar distribui o que foi planejado.'],
  ['sp04','specific_knowledge','esp-administracao-geral','Em administração, a verificação do cumprimento de metas e a aplicação de medidas corretivas referem-se à função de:', ['Controle.','Recrutamento sumário.','Lotação de pessoal.','Delegação indiscriminada.'],0,'O controle compara o executado com o padrão planejado e orienta correções.', 'Sem controle, o planejamento perde eficácia.'],
  ['sp05','specific_knowledge','esp-recursos-humanos','O levantamento das necessidades de treinamento (LNT) em uma instituição pública tem por finalidade:', ['Identificar lacunas de competências para orientar as ações de capacitação dos servidores.','Substituir a avaliação periódica de desempenho.','Eliminar a realização de novos concursos públicos.','Cancelar os planos de carreira vigentes.'],0,'O LNT aponta onde o treinamento é realmente necessário para suprir deficiências técnicas ou comportamentais.', 'Treinar com foco nas necessidades reais da repartição.'],
  ['sp06','specific_knowledge','esp-recursos-humanos','O registro e assentamento funcional do servidor público devem ser mantidos:', ['Com rigorosa exatidão, atualização e sigilo dos dados protegidos por lei.','Sem controle ou comprovantes de afastamentos.','Apenas verbalmente entre os supervisores.','Publicados integralmente em redes sociais abertas.'],0,'Os registros funcionais garantem os direitos previdenciários e a carreira do servidor.', 'Dossiê do servidor é documento oficial.'],
  ['sp07','specific_knowledge','esp-materiais','No recebimento de mercadorias no almoxarifado, a conferência quantitativa e qualitativa verifica:', ['Se os materiais entregues coincidem fielmente com a nota fiscal e com as especificações do pedido de compra.','Somente se o entregador possui crachá da transportadora.','Apenas a embalagem exterior sem abrir volumes.','Se o valor da compra foi debitado na conta pessoal do recebedor.'],0,'A conferência atesta se a especificação e quantidade estão em conformidade com o que foi licitado e contratado.', 'Não ateste recebimento sem conferir quantidade e estado.'],
  ['sp08','specific_knowledge','esp-materiais','O inventário de materiais é essencial para a gestão pública porque:', ['Permite apurar a exatidão entre o estoque físico existente e os registros contábeis do almoxarifado.','Dispensa qualquer controle de saída de materiais.','Autoriza a doação de bens públicos sem autorização legal.','Elimina a necessidade de controle de validade de itens perecíveis.'],0,'O inventário físico identifica sobras, faltas, danos e mantém a acurácia patrimonial.', 'Inventário garante transparência sobre o patrimônio público.'],
  ['sp09','specific_knowledge','esp-orcamento','Conforme as regras orçamentárias públicas, a emissão do empenho antecede:', ['A liquidação e o pagamento da despesa.','A elaboração do plano plurianual.','A aprovação da lei orçamentária anual pelo plenário.','A homologação do edital de concurso.'],0,'O empenho é o primeiro estágio da execução da despesa, reservando dotação orçamentária.', 'Regra: Nenhuma despesa pode ser paga sem prévio empenho.'],
  ['sp10','specific_knowledge','esp-orcamento','O estágio da despesa pública no qual se verifica a entrega real do bem ou serviço prestado e a comprovação do direito do credor é a:', ['Liquidação.','Fixação.','Lançamento.','Dotação.'],0,'A liquidação consiste na verificação do direito do credor mediante notas, contratos e atesto do recebedor.', 'Liquidação = comprovação de que o serviço foi prestado.'],
  ['sp11','specific_knowledge','esp-arquivologia','Os documentos mantidos no próprio setor de trabalho pelo fato de serem frequentemente consultados pertencem ao:', ['Arquivo corrente (1ª idade).','Arquivo intermediário (2ª idade).','Arquivo permanente (3ª idade).','Arquivo morto inativo.'],0,'Arquivos correntes guardam documentos em curso ou de consulta contínua pelas áreas produtoras.', 'Documento ativo do dia a dia = arquivo corrente.'],
  ['sp12','specific_knowledge','esp-arquivologia','A rotina de registro e controle da tramitação de processos e expedientes dentro do órgão público cabe ao setor de:', ['Protocolo.','Tesouraria.','Ouvidoria legislativa.','Almoxarifado central.'],0,'O protocolo recebe, registra, distribui e expede documentos, rastreando seu andamento.', 'Protocolo é a porta de entrada e saída dos documentos.'],
  ['sp13','specific_knowledge','esp-redacao-oficial','Constituem atributos indispensáveis da Redação Oficial no serviço público:', ['Clareza, concisão, impessoalidade, formalidade e padronização.','Subjetividade, rebuscamento literário e prolixidade.','Gírias regionais, intimidade e adjetivação emocional.','Vocabulário arcaico e períodos longos sem pontuação.'],0,'O padrão culto oficial prima pela comunicação compreensível a qualquer cidadão.', 'Manual da Presidência da República: clareza e impessoalidade.'],
  ['sp14','specific_knowledge','esp-redacao-oficial','No formato de ofício padronizado pelo Manual de Redação da Presidência da República, o campo de identificação do signatário deve conter:', ['O nome da autoridade remetente e o cargo que ocupa, sem traços ou linhas abaixo do nome.','Apenas a rubrica sem identificação do cargo.','O apelido do servidor e seu número de telefone pessoal.','Somente o brasão da prefeitura sem assinatura.'],0,'A assinatura oficial é composta pelo nome civil e pelo cargo exercido pela autoridade remetente.', 'Identificação do signatário: Nome e Cargo.'],
  ['sp15','specific_knowledge','esp-normas','Ao constatar ambiguidade ou dúvida na aplicação de uma norma regulamentar interna, o servidor responsável deve:', ['Submeter a questão formalmente à chefia imediata ou ao órgão de assessoria jurídica municipal.','Decidir informalmente segundo seu critério particular.','Ignorar a norma e adotar procedimento aleatório.','Suspender indefinidamente o atendimento sem prestar esclarecimento.'],0,'O princípio da legalidade orienta o esclarecimento formal pelas instâncias competentes.', 'Na dúvida sobre a norma, consulte o parecer jurídico oficial.'],
  ['sp16','specific_knowledge','esp-normas','As instruções normativas e portarias emitidas pelos secretários municipais têm a finalidade de:', ['Regulamentar procedimentos e orientar a execução de leis dentro de suas respectivas secretarias.','Revogar artigos da Constituição Federal.','Criar novos tributos sem autorização legislativa.','Extinguir direitos fundamentais dos cidadãos.'],0,'Atos normativos internos detalham a execução da lei, sem inovar na ordem jurídica.', 'Instruções e portarias regulamentam, mas nunca contrariam a lei.'],
  ['sp17','specific_knowledge','esp-planejamento-controle','Na gestão pública, a relação entre a quantidade de recursos empregados e os resultados obtidos (fazer mais com menos) expressa o conceito de:', ['Eficiência.','Eficácia.','Efetividade social.','Discricionariedade.'],0,'Eficiência foca no custo-benefício e no melhor aproveitamento dos meios e recursos disponíveis.', 'Eficiência = foco nos meios e custos; Eficácia = foco nos resultados.'],
  ['sp18','specific_knowledge','esp-planejamento-controle','Ao identificar gargalos e atrasos recorrentes no atendimento de determinada demanda, a postura adequada da gestão é:', ['Mapear as etapas do fluxo com dados objetivos para formular ações de melhoria.','Ocultar os prazos dos relatórios de gestão.','Transferir arbitrariamente a responsabilidade ao cidadão.','Eliminar os registros de protocolo.'],0,'A melhoria de processos baseia-se em análise de dados e redesenho de rotinas.', 'Mapear o processo identifica causas raízes de gargalos.'],
  ['sp19','specific_knowledge','esp-etica','O servidor que atende um cidadão com paciência, presteza e respeito à dignidade humana cumpre o princípio ético da:', ['Urbanidade.','Condescendência ilícita.','Autonomia discricionária.','Paz armada.'],0,'Urbanidade é a polidez e a cortesia esperadas de quem representa o poder público perante o cidadão.', 'O cidadão é a razão de existir do serviço público.'],
  ['sp20','specific_knowledge','esp-etica','A conduta ética no serviço público exige que o servidor:', ['Mantenha conduta compatível com a moralidade administrativa tanto em serviço quanto em sua vida pública.','Priorize seus interesses individuais sobre o bem comum.','Divulgue senhas institucionais a pessoas de sua confiança.','Aceite vantagens indevidas para acelerar processos.'],0,'O código de ética impõe lealdade às instituições públicas e preservação da honra funcional.', 'Ética exige probidade e zelo contínuo pela coisa pública.'],
  ['sp21','specific_knowledge','esp-informatica','Qual medida representa uma boa prática de segurança da informação no trabalho administrativo?', ['Bloquear a estação de trabalho (Win+L) ao se ausentar temporariamente da mesa.','Anotar a senha de acesso em um post-it colado no monitor.','Utilizar a mesma senha simples para todos os sistemas institucionais.','Compartilhar o login individual com colegas de outro setor.'],0,'Bloquear o computador impede acessos indevidos e preserva a confidencialidade das informações.', 'Bloqueie a tela sempre ao se afastar da máquina.'],
  ['sp22','specific_knowledge','esp-informatica','No aplicativo de navegação na internet, o protocolo seguro que criptografa os dados transmitidos entre o navegador e o servidor é indicado pela sigla:', ['HTTPS.','FTP.','SMTP.','DNS.'],0,'HTTPS (Hypertext Transfer Protocol Secure) adiciona uma camada de segurança com certificado SSL/TLS.', 'O cadeado na barra de endereços sinaliza conexão HTTPS criptografada.'],
  ['sp23','specific_knowledge','esp-informatica','Fazer cópias de segurança periódicas de arquivos e bases de dados importantes em locais seguros é conhecido como:', ['Backup.','Phishing.','Spamming.','Defragmentação.'],0,'O backup é indispensável para a continuidade das atividades em caso de falha de hardware ou ataque.', 'Tenha sempre rotinas automatizadas e cópias de backup.'],
  ['sp24','specific_knowledge','esp-administracao-publica','O poder que a Administração possui para punir internamente servidores que cometeram faltas funcionais após o devido processo legal é o:', ['Poder disciplinar.','Poder de polícia externa.','Poder judicante.','Poder constituinte.'],0,'O poder disciplinar aplica sanções a servidores públicos e particulares com vínculo especial com o Estado.', 'Poder disciplinar pune faltas internas; Poder de polícia alcança a coletividade.'],
  ['sp25','specific_knowledge','esp-administracao-geral','A distribuição de competências entre diferentes órgãos pertencentes à MESMA pessoa jurídica (sem criação de nova entidade) é chamada de:', ['Desconcentração.','Descentralização.','Privatização.','Delegação externa.'],0,'DesCONcentração cria órgãos (com "O") dentro da mesma pessoa jurídica. DesCENtralização cria novas entidades (com "E").', 'DesCONcentração = Órgãos; DesCENtralização = Entidades (indireta).'],
  ['sp26','specific_knowledge','esp-recursos-humanos','No processo seletivo do serviço público, a exigência de concurso público prévio atende diretamente aos princípios da:', ['Isonomia, impessoalidade e moralidade administrativa.','Hierarquia familiar e privilégio partidário.','Indicação política discricionária.','Celeridade sem controle de idoneidade.'],0,'O concurso público democratiza o acesso aos cargos públicos com igualdade de oportunidades a todos.', 'Art. 37, II da CF: Concurso garante ampla acessibilidade e mérito.'],
  ['sp27','specific_knowledge','esp-materiais','Materiais que perdem suas características normais de uso no prazo de até dois anos ou com consumo imediato são classificados como:', ['Materiais de consumo.','Materiais permanentes.','Bens imóveis dominicais.','Bens de uso especial perpétuo.'],0,'Materiais de consumo (papel, canetas, toner) extinguem-se com o uso ou em curto prazo.', 'Material de consumo x Material permanente (vida útil > 2 anos e tombamento).'],
  ['sp28','specific_knowledge','esp-orcamento','O princípio orçamentário que estabelece que todas as receitas e todas as despesas devem constar na Lei Orçamentária Anual por seus valores brutos é o da:', ['Universalidade e orçamento bruto.','Exclusividade seletiva.','Anualidade trimestral.','Publicidade restrita.'],0,'O princípio da universalidade exige que nenhuma receita ou despesa orçamentária fique fora do orçamento.', 'Universalidade: todo o orçamento reunido na LOA.'],
  ['sp29','specific_knowledge','esp-arquivologia','O método de arquivamento no qual os documentos são ordenados pelo nome do remetente ou destinatário obedecendo à ordem alfabética é o:', ['Método alfabético.','Método geográfico.','Método variotécnico.','Método numérico duplex.'],0,'O método alfabético é do grupo direto e organiza fichas ou pastas pelos nomes em ordem alfabética.', 'Método alfabético: direto e intuitivo para prontuários de servidores.'],
  ['sp30','specific_knowledge','esp-redacao-oficial','Em correspondências oficiais, a clareza e a objetividade são prejudicadas pelo emprego de:', ['Jargões obscuros, frases ambíguas e períodos excessivamente extensos.','Vocabulário simples e gramática correta.','Pontuação precisa e divisão em parágrafos temáticos.','Identificação clara do signatário.'],0,'A redação oficial deve ser imediatamente compreensível sem margem a interpretações dúbias.', 'Evite rebuscamentos desnecessários; seja direto e formal.'],
  ['sp31','specific_knowledge','esp-normas','Quando um ato administrativo apresenta vício formal sanável que não acarreta lesão ao interesse público nem prejuízo a terceiros, a Administração pode realizar a sua:', ['Convalidação.','Revogação retroativa.','Anulação definitiva.','Cassação penal.'],0,'Convalidar é aproveitar o ato sanando pequenos vícios de competência ou forma.', 'Convalidação corrige o vício sanável mantendo os efeitos do ato.'],
  ['sp32','specific_knowledge','esp-planejamento-controle','Em gestão pública, a prestação de contas com transparência sobre o uso do erário público corresponde ao conceito de:', ['Accountability (responsabilidade e prestação de contas).','Improbidade discricionária.','Sigilo funcional.','Reserva orçamentária secreta.'],0,'Accountability expressa o dever de responder, justificar e prestar contas perante os cidadãos.', 'Transparência ativa fortalece a confiança da população.'],
  ['sp33','specific_knowledge','esp-informatica','No sistema operacional Windows, a combinação de teclas de atalho utilizada para alternar rapidamente entre janelas e aplicativos abertos é:', ['Alt + Tab','Ctrl + P','Shift + Esc','Win + L'],0,'Alt + Tab permite visualizar e alternar entre os aplicativos em execução com agilidade.', 'Treine os atalhos básicos e confirme a função de cada combinação no sistema.'],
  ['sp34','specific_knowledge','esp-administracao-publica','A competência do agente público para a prática de ato administrativo deve ser necessariamente:', ['Definida expressamente em lei, sendo em regra irrenunciável e intransferível no todo.','Criada verbalmente pelo próprio servidor conforme seu humor.','Dispensada em qualquer processo simplificado.','Vendida ou cedida livremente a terceiros.'],0,'A competência é requisito de validade do ato decorrente da lei (princípio da legalidade).', 'Competência administrativa é vinculada à lei e irrenunciável.']
];

type SupplementaryQuestion = {
  id: string; discipline: Discipline; topicId: string; prompt: string;
  answers: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3;
  explanation: string; studyTip: string; notes: [string, string, string, string];
};

// Itens autorais novos: um por tópico do conteúdo programático, sem atribuição fictícia à banca.
const supplementaryQuestions: SupplementaryQuestion[] = [
  { id:'supp-pt-interpretacao', discipline:'portuguese', topicId:'pt-interpretacao', prompt:'Leia o aviso: “A partir de segunda-feira, os requerimentos de certidão serão recebidos exclusivamente pelo protocolo digital. Os pedidos já registrados continuarão sendo atendidos pela ordem de entrada.” Qual conclusão decorre corretamente do texto?', answers:['Todos os pedidos anteriores foram cancelados.','A mudança vale para novos requerimentos, enquanto os já registrados mantêm a ordem de atendimento.','O protocolo digital atenderá somente pedidos urgentes.','A ordem de entrada deixou de ser considerada.'], correctIndex:1, explanation:'O aviso distingue novos pedidos dos que já estavam registrados. Para estes, preserva expressamente a ordem de entrada; não há informação sobre cancelamento ou urgência.', studyTip:'Em interpretação, limite a resposta ao que está escrito. Diferencie informação expressa de hipótese que parece razoável, mas não consta do texto.', notes:['A alternativa contradiz o aviso: não há cancelamento dos pedidos antigos.','Correta: reúne as duas regras expressas, sem acrescentar condição.','Urgência não aparece no aviso; a alternativa inventa um critério.','O texto afirma que a ordem de entrada continua valendo para pedidos registrados.'] },
  { id:'supp-pt-vocabulario', discipline:'portuguese', topicId:'pt-vocabulario', prompt:'Em relatório administrativo, lê-se: “A comissão decidiu retificar o endereço informado no cadastro.” Nesse contexto, “retificar” significa:', answers:['Confirmar que a informação está correta.','Corrigir ou tornar correta uma informação.','Repetir o endereço em outro documento.','Cancelar definitivamente o cadastro.'], correctIndex:1, explanation:'Retificar é corrigir um dado ou ato para sanar erro. Não se confunde com ratificar, que significa confirmar ou validar.', studyTip:'Memorize a distinção cobrada em provas: retificar = corrigir; ratificar = confirmar.', notes:['Confirmar corresponde a ratificar, não a retificar.','Correta: retificar é corrigir a informação que apresenta inexatidão.','Repetir pode reproduzir o erro e não expressa o sentido do verbo.','Cancelamento é consequência diferente e não decorre do termo.'] },
  { id:'supp-pt-ortografia', discipline:'portuguese', topicId:'pt-ortografia', prompt:'Assinale a frase em que todas as palavras estão grafadas conforme a ortografia oficial:', answers:['O servidor analisou a exceção e encaminhou o processo.','O servidor analisou a excessão e encaminhou o processo.','O servidor analisou a esceção e encaminhou o processo.','O servidor analisou a exessão e encaminhou o processo.'], correctIndex:0, explanation:'A forma correta é “exceção”, com xc e ç. As demais grafias não pertencem ao padrão ortográfico vigente.', studyTip:'Registre a família: exceção, excepcional e excetuar. Revisar palavras frequentes evita erro por semelhança sonora.', notes:['Correta: “exceção” está escrita com a sequência xc e cedilha.','“Excessão” mistura a grafia de excesso com a palavra exceção.','“Esceção” omite a grafia inicial correta e não existe na norma.','“Exessão” também elimina letras da forma oficial.'] },
  { id:'supp-pt-pontuacao', discipline:'portuguese', topicId:'pt-pontuacao', prompt:'Em “Candidatos, aguardem a chamada no saguão”, a vírgula foi usada para separar:', answers:['O sujeito simples do predicado.','Um vocativo do restante da oração.','O objeto direto do verbo.','Duas orações subordinadas.'], correctIndex:1, explanation:'“Candidatos” é vocativo: o enunciador chama os interlocutores. Vocativos são isolados por vírgula, independentemente de sua posição.', studyTip:'Pergunte se o termo nomeia quem está sendo chamado. Se sim, tende a ser vocativo, e não sujeito.', notes:['A vírgula entre sujeito e predicado, sem justificativa, seria inadequada.','Correta: “Candidatos” é chamamento direto aos destinatários do aviso.','“A chamada” é o complemento de aguardar e não está isolado pela vírgula.','Há uma oração, com verbo “aguardem”; a alternativa erra ao contar duas.'] },
  { id:'supp-pt-classes', discipline:'portuguese', topicId:'pt-classes', prompt:'Na frase “A equipe respondeu rapidamente ao pedido”, a palavra “rapidamente” classifica-se como:', answers:['Adjetivo, pois caracteriza a equipe.','Advérbio, pois modifica o sentido do verbo e indica modo.','Substantivo, pois nomeia uma resposta.','Conjunção, pois liga duas orações.'], correctIndex:1, explanation:'“Rapidamente” modifica o verbo “respondeu”, indicando como a ação ocorreu. Trata-se de advérbio de modo.', studyTip:'Localize a palavra modificada: advérbios podem modificar verbos, adjetivos e outros advérbios.', notes:['A palavra não caracteriza “equipe”; essa seria função típica de adjetivo.','Correta: modifica “respondeu” e informa a maneira da resposta.','Não nomeia um ser ou conceito; portanto, não é substantivo nesse contexto.','Não conecta orações ou termos; não funciona como conjunção.'] },
  { id:'supp-pt-termos', discipline:'portuguese', topicId:'pt-termos', prompt:'Na oração “A chefia encaminhou o processo ao setor jurídico”, o termo “ao setor jurídico” exerce a função de:', answers:['Sujeito simples.','Objeto direto.','Objeto indireto.','Predicativo do sujeito.'], correctIndex:2, explanation:'O verbo encaminhar seleciona o complemento “o processo” (objeto direto) e o destino introduzido pela preposição “a” (“ao setor jurídico”), que funciona como objeto indireto.', studyTip:'Identifique o verbo e seus complementos: encaminhou algo (OD) a alguém/a algum lugar (OI).', notes:['O sujeito é “A chefia”, que pratica a ação verbal.','“O processo” responde a “encaminhou o quê?” e é o objeto direto.','Correta: o termo é complemento preposicionado do verbo, indicando destino.','O termo não atribui característica ao sujeito; indica para onde foi encaminhado.'] },
  { id:'supp-pt-coordenacao', discipline:'portuguese', topicId:'pt-coordenacao', prompt:'“O sistema ficou indisponível, portanto o atendimento foi suspenso.” A conjunção “portanto” estabelece relação de:', answers:['Conclusão.','Oposição.','Alternância.','Explicação.'], correctIndex:0, explanation:'“Portanto” introduz uma conclusão decorrente da informação anterior: a indisponibilidade levou à suspensão do atendimento.', studyTip:'Associe conclusivas a logo, portanto, por isso e por conseguinte; observe a relação de sentido, não apenas a posição da palavra.', notes:['Correta: a suspensão é apresentada como consequência/conclusão da indisponibilidade.','Oposição seria marcada por mas, porém ou contudo.','Alternância exige ideia de escolha, como em “ou... ou”.','Explicação justificaria uma ordem ou afirmação, geralmente com “porque”.'] },
  { id:'supp-pt-periodos', discipline:'portuguese', topicId:'pt-periodos', prompt:'No período “Quando o expediente terminou, os servidores fecharam os registros”, há:', answers:['Uma oração, pois há apenas um sujeito.','Duas orações, sendo a primeira subordinada adverbial temporal.','Duas orações coordenadas sem relação de dependência.','Três orações, uma para cada termo principal.'], correctIndex:1, explanation:'Há dois verbos (“terminou” e “fecharam”), logo duas orações. A oração iniciada por “Quando” expressa tempo e depende da oração principal.', studyTip:'Conte as formas verbais para localizar orações e observe se uma delas exerce circunstância em relação à outra.', notes:['Um sujeito não determina a quantidade de orações; contam-se os verbos/locuções verbais.','Correta: “Quando...” marca tempo e funciona como subordinada adverbial temporal.','A oração temporal depende sintaticamente da principal, não é coordenada independente.','Há duas formas verbais e, portanto, duas orações neste período.'] },
  { id:'supp-pt-concordancia', discipline:'portuguese', topicId:'pt-concordancia', prompt:'Assinale a frase de acordo com a concordância verbal padrão:', answers:['Houveram solicitações sem assinatura.','Fazem três meses que o setor mudou de endereço.','Existem documentos pendentes de conferência.','Deve haverem novas orientações amanhã.'], correctIndex:2, explanation:'“Existir” é verbo pessoal e concorda com o sujeito plural “documentos”. “Haver” no sentido de existir e “fazer” indicando tempo são impessoais e ficam no singular, inclusive com auxiliar.', studyTip:'Compare “existem documentos” com “há documentos”; apenas existir concorda com o sujeito.', notes:['“Haver” com sentido de existir é impessoal: o correto é “Houve solicitações”.','“Fazer” indicando tempo fica no singular: “Faz três meses”.','Correta: o sujeito plural “documentos” exige “existem”.','O auxiliar também fica no singular diante do impessoal: “Deve haver”.'] },
  { id:'supp-pt-regencia', discipline:'portuguese', topicId:'pt-regencia', prompt:'Considerando a regência verbal segundo a norma-padrão, assinale a frase correta:', answers:['O servidor informou o cidadão sobre o prazo.','O servidor informou ao cidadão o prazo.','O servidor informou o prazo ao cidadão.','Todas as construções estão corretas quanto à regência de “informar”.'], correctIndex:3, explanation:'O verbo informar admite construções com objeto direto de pessoa e complemento introduzido por “sobre/acerca de”, ou com a coisa informada como objeto direto e a pessoa como objeto indireto: informou o cidadão sobre o prazo; informou ao cidadão o prazo; informou o prazo ao cidadão.', studyTip:'Em questões de regência, examine o verbo e a estrutura completa. Alguns verbos admitem mais de uma construção normativa.', notes:['É construção admitida: informar alguém sobre algo.','É construção admitida: informar algo a alguém, com objeto deslocado/estrutura equivalente.','É construção admitida: informar algo a alguém.','Correta: as três construções respeitam regências reconhecidas para “informar”.'] },
  { id:'supp-pt-crase', discipline:'portuguese', topicId:'pt-crase', prompt:'Assinale a frase em que o emprego do acento indicativo de crase está correto:', answers:['O requerimento foi entregue à diretora do setor.','O servidor começou à preencher o formulário.','A reunião ocorrerá à partir das nove horas.','O documento foi enviado à todos os candidatos.'], correctIndex:0, explanation:'“Entregar” algo a alguém pede preposição “a”; “diretora” admite artigo feminino “a”. A fusão resulta em “à”. Não há crase antes de verbo, na locução “a partir” nem antes de “todos”.', studyTip:'Use o teste: “entregou ao diretor” corresponde a “entregou à diretora”. Antes de verbo, nunca ocorre crase.', notes:['Correta: preposição exigida por entregar + artigo feminino de diretora.','Antes do verbo “preencher” usa-se apenas a preposição, sem crase.','“A partir” é locução com “a” inicial sem artigo; não recebe crase.','“Todos” é pronome masculino plural; não há artigo feminino a fundir.'] },
  { id:'supp-lm-organica', discipline:'municipal_law', topicId:'lm-organica', prompt:'Uma secretaria municipal pretende divulgar campanha institucional com fotografias, nomes e slogans que promovam pessoalmente determinada autoridade. À luz dos princípios constitucionais aplicáveis à administração municipal, a conduta é:', answers:['Permitida, desde que a autoridade tenha autorizado a publicação.','Incompatível com a impessoalidade, pois a publicidade institucional não deve caracterizar promoção pessoal.','Obrigatória sempre que houver saldo orçamentário.','Permitida durante o período eleitoral, se o conteúdo for informativo.'], correctIndex:1, explanation:'A publicidade institucional deve ter caráter educativo, informativo ou de orientação social e não pode incluir elementos que caracterizem promoção pessoal de autoridades ou servidores.', studyTip:'Associe publicidade institucional a finalidade pública e impessoalidade; confira o texto constitucional e a Lei Orgânica indicada no edital.', notes:['Autorização pessoal não afasta o limite constitucional contra promoção pessoal.','Correta: promoção individual contradiz a impessoalidade administrativa.','Disponibilidade orçamentária não transforma publicidade promocional em legítima.','O período eleitoral não cria exceção para promoção pessoal.'] },
  { id:'supp-lm-estatuto', discipline:'municipal_law', topicId:'lm-estatuto', prompt:'À luz da Lei Municipal nº 1.060/2011, um candidato nomeado para cargo efetivo deve formalizar sua investidura e iniciar o exercício dentro dos prazos previstos no estatuto. Qual afirmação está correta sobre a posse?', answers:['A posse ocorre pela assinatura do termo, no prazo estatutário contado da publicação da nomeação.','A posse é automática na inscrição do concurso.','A posse dispensa termo e pode ser substituída por comunicação verbal.','O prazo para posse é definido livremente pela chefia após o início do exercício.'], correctIndex:0, explanation:'O estatuto prevê a posse mediante assinatura do termo, com registro dos atributos do cargo, direitos, deveres e responsabilidades. O prazo legal deve ser contado conforme o texto vigente e o ato de nomeação; não se confunde posse com exercício.', studyTip:'Estude separadamente nomeação, posse e exercício. Para prazos exatos, confira o artigo do Estatuto fornecido no edital e suas atualizações.', notes:['Correta: a posse se formaliza por termo e segue o prazo estatutário após a nomeação.','Inscrição não é provimento nem investidura; ocorre antes de qualquer nomeação.','O termo é a formalização prevista, e comunicação verbal não o substitui.','A chefia não pode alterar livremente prazo estabelecido em lei.'] },
  { id:'supp-esp-administracao-publica', discipline:'specific_knowledge', topicId:'esp-administracao-publica', prompt:'Uma unidade municipal recebe duas solicitações idênticas. Um servidor atende primeiro o pedido de um conhecido e deixa o outro sem justificativa. Qual princípio administrativo é diretamente comprometido?', answers:['Impessoalidade.','Continuidade.','Especialidade.','Autotutela.'], correctIndex:0, explanation:'A impessoalidade exige atuação voltada ao interesse público, sem favorecimento ou perseguição pessoal. A ordem e os critérios de atendimento devem ser objetivos e aplicáveis a todos.', studyTip:'Em situações de privilégio pessoal, associe o problema à impessoalidade e à isonomia; diferencie isso de continuidade do serviço.', notes:['Correta: o favorecimento baseado em relação pessoal viola tratamento impessoal.','Continuidade trata da prestação regular do serviço, que não é o foco do caso.','Especialidade relaciona-se às finalidades de entidades administrativas.','Autotutela é o poder-dever de rever atos próprios, não a igualdade no atendimento.'] },
  { id:'supp-esp-administracao-geral', discipline:'specific_knowledge', topicId:'esp-administracao-geral', prompt:'A chefia define uma meta mensal, distribui tarefas entre a equipe e, ao fim do mês, compara os resultados com a meta para corrigir atrasos. A comparação e a correção correspondem principalmente à função de:', answers:['Planejamento.','Organização.','Direção.','Controle.'], correctIndex:3, explanation:'Controle acompanha resultados, compara o desempenho com padrões ou metas e orienta correções. Planejar define objetivos; organizar distribui recursos; dirigir orienta a execução.', studyTip:'Use o ciclo PODC: planejar, organizar, dirigir e controlar. A palavra-chave aqui é comparar resultado e meta.', notes:['Planejamento define previamente o objetivo, e não a verificação final descrita.','Organização distribui recursos e responsabilidades para executar o trabalho.','Direção envolve liderança e orientação durante a execução.','Correta: medir, comparar com a meta e corrigir são ações de controle.'] },
  { id:'supp-esp-recursos-humanos', discipline:'specific_knowledge', topicId:'esp-recursos-humanos', prompt:'Após identificar que servidores têm dificuldade em utilizar o sistema de protocolo, a administração organiza uma capacitação específica e avalia depois se a equipe passou a registrar processos corretamente. A sequência representa:', answers:['Levantamento de necessidade, treinamento e avaliação dos resultados.','Promoção funcional automática e reajuste remuneratório.','Aplicação de penalidade sem apuração.','Substituição da avaliação por mera frequência no curso.'], correctIndex:0, explanation:'A capacitação eficaz parte de uma lacuna identificada, desenvolve a competência necessária e verifica se houve transferência do aprendizado para o trabalho.', studyTip:'Não confunda presença em curso com aprendizagem efetiva: o resultado deve ser observado na atividade profissional.', notes:['Correta: descreve diagnóstico, ação de desenvolvimento e verificação de efeito.','Capacitação não produz promoção ou aumento automaticamente.','Dificuldade técnica é tratada com desenvolvimento, não punição sem processo.','Frequência mede participação, mas não comprova aplicação do conteúdo.'] },
  { id:'supp-esp-materiais', discipline:'specific_knowledge', topicId:'esp-materiais', prompt:'No recebimento de material de escritório, a nota fiscal informa 100 caixas, mas a contagem física encontra 96. Qual procedimento é mais adequado?', answers:['Atestar o recebimento integral e ajustar o estoque depois.','Registrar a divergência e comunicar o responsável antes do atesto, conforme o procedimento de recebimento.','Descartar a nota fiscal e aceitar a quantidade verbalmente indicada pelo fornecedor.','Lançar 100 caixas no estoque para coincidir com a nota.'], correctIndex:1, explanation:'O recebimento deve conferir quantidade e especificação. A divergência precisa ser documentada e encaminhada antes do atesto, para que o registro reflita o que foi efetivamente entregue.', studyTip:'O atesto confirma entrega real e conforme. Não certifique quantidade que não foi recebida.', notes:['Atestar a quantidade total sem recebimento pode validar informação falsa.','Correta: documentar a falta e acionar o fluxo responsável preserva rastreabilidade.','A nota é documento de referência e não deve ser substituída por fala informal.','O estoque deve refletir a contagem física confirmada, não a quantidade faturada.'] },
  { id:'supp-esp-orcamento', discipline:'specific_knowledge', topicId:'esp-orcamento', prompt:'Em uma despesa pública regularmente autorizada, qual é a ordem dos estágios da execução da despesa?', answers:['Liquidação, pagamento e empenho.','Empenho, liquidação e pagamento.','Pagamento, empenho e liquidação.','Fixação, arrecadação e recolhimento.'], correctIndex:1, explanation:'Na execução da despesa, primeiro se empenha a dotação, depois se verifica e liquida o direito do credor e, por fim, ocorre o pagamento.', studyTip:'Guarde a sequência E-L-P. A liquidação confirma que o bem ou serviço foi entregue/prestado antes do pagamento.', notes:['A liquidação e o pagamento não antecedem o empenho.','Correta: empenho reserva a dotação, liquidação verifica o crédito e pagamento quita.','Pagamento antes da verificação e do empenho inverte a sequência legal.','Fixação é etapa de elaboração/aprovação orçamentária; arrecadação e recolhimento pertencem à receita.'] },
  { id:'supp-esp-arquivologia', discipline:'specific_knowledge', topicId:'esp-arquivologia', prompt:'Um processo já encerrado deixou de ser consultado diariamente, mas ainda precisa permanecer guardado durante o prazo previsto na tabela de temporalidade. Ele deve ser encaminhado, em regra, ao arquivo:', answers:['Corrente.','Intermediário.','Permanente, independentemente de avaliação.','Pessoal do servidor responsável.'], correctIndex:1, explanation:'Documentos encerrados e pouco consultados, mas ainda sujeitos a prazo de guarda, pertencem à fase intermediária. Ao fim do prazo, a destinação depende de avaliação: eliminação autorizada ou guarda permanente.', studyTip:'Corrente = uso frequente; intermediário = consulta eventual aguardando prazo; permanente = valor que justifica preservação definitiva.', notes:['Arquivo corrente guarda documentos ainda usados com frequência no setor.','Correta: o processo aguarda cumprimento do prazo de guarda com consulta eventual.','Nem todo documento encerrado é permanente; é preciso avaliação documental.','Documentos públicos não devem ser guardados informalmente como acervo pessoal.'] },
  { id:'supp-esp-redacao-oficial', discipline:'specific_knowledge', topicId:'esp-redacao-oficial', prompt:'Uma comunicação oficial precisa informar ao cidadão que faltam documentos para concluir o pedido. Qual redação atende melhor à clareza e à impessoalidade?', answers:['“Você esqueceu tudo de novo; volte quando souber preencher.”','“Informamos que o pedido não pode ser concluído porque faltam os documentos listados abaixo.”','“A gente acha que talvez esteja faltando alguma coisa.”','“Por motivos óbvios, seu processo ficou parado.”'], correctIndex:1, explanation:'A redação oficial deve expor a situação com clareza, objetividade e tratamento respeitoso, indicando a providência necessária sem juízo pessoal ou vagueza.', studyTip:'Prefira sujeito institucional, motivo explícito e orientação verificável; retire ironia, opinião e expressões vagas.', notes:['É agressiva, pessoal e não informa com precisão como resolver o problema.','Correta: identifica a consequência e anuncia a informação objetiva que orienta o cidadão.','“A gente acha” revela informalidade e incerteza inadequadas à comunicação oficial.','“Motivos óbvios” é vago e não permite compreender nem corrigir a pendência.'] },
  { id:'supp-esp-normas', discipline:'specific_knowledge', topicId:'esp-normas', prompt:'Uma instrução interna determina procedimento incompatível com uma lei municipal. Como o servidor deve agir?', answers:['Cumprir a instrução, pois qualquer ato interno prevalece no setor.','Ignorar a lei e seguir a ordem hierárquica sem registro.','Apontar formalmente a incompatibilidade e buscar orientação da chefia competente, sem executar ordem manifestamente ilegal.','Alterar a instrução por conta própria e apagar o registro anterior.'], correctIndex:2, explanation:'Atos internos devem respeitar normas superiores. O servidor deve comunicar a incompatibilidade pelos canais formais e não cumprir ordem manifestamente ilegal, conforme deveres estatutários e garantias aplicáveis.', studyTip:'Estude hierarquia normativa e o dever estatutário de cumprir ordens, exceto as manifestamente ilegais; consulte o texto do edital.', notes:['Instrução interna não pode prevalecer sobre lei hierarquicamente superior.','Hierarquia não elimina legalidade nem autoriza execução cega de ordem ilegal.','Correta: preserva registro, legalidade e encaminhamento institucional adequado.','Mudança unilateral e apagamento comprometem competência, transparência e rastreabilidade.'] },
  { id:'supp-esp-planejamento-controle', discipline:'specific_knowledge', topicId:'esp-planejamento-controle', prompt:'A unidade registra o tempo médio de resposta antes e depois de reorganizar o protocolo. Esse indicador é útil principalmente para:', answers:['Acompanhar se a mudança melhorou o desempenho e orientar ajustes.','Substituir a prestação de contas anual.','Provar, sozinho, que todos os cidadãos ficaram satisfeitos.','Dispensar o registro dos processos individuais.'], correctIndex:0, explanation:'Indicadores permitem acompanhar desempenho e comparar períodos, apoiando decisões. Um único indicador não demonstra sozinho todos os aspectos de qualidade ou satisfação.', studyTip:'Indicador é instrumento para monitorar objetivo; interprete-o junto com contexto e outras evidências.', notes:['Correta: comparação antes/depois ajuda a verificar efeito e decidir ajustes.','Um indicador operacional não substitui as obrigações formais de prestação de contas.','Tempo médio não mede sozinho satisfação ou qualidade integral do atendimento.','Métricas agregadas não substituem o registro individual e a rastreabilidade.'] },
  { id:'supp-esp-etica', discipline:'specific_knowledge', topicId:'esp-etica', prompt:'Um servidor recebe de um fornecedor um presente caro enquanto analisa processo de contratação relacionado à empresa. A atitude mais adequada é:', answers:['Aceitar, desde que o presente seja entregue fora do expediente.','Recusar e comunicar a situação pelos canais institucionais aplicáveis.','Aceitar e manter sigilo para evitar constrangimento.','Aceitar apenas se prometer avaliar a proposta com imparcialidade.'], correctIndex:1, explanation:'O recebimento de vantagem de interessado em processo pode comprometer a imparcialidade e a confiança pública. A conduta adequada é recusar e seguir as regras institucionais de comunicação.', studyTip:'A aparência de conflito também importa. Consulte o código de ética e as normas locais sobre presentes e vantagens.', notes:['O local ou horário não elimina o conflito de interesse.','Correta: recusa a vantagem e preserva transparência e integridade do processo.','O sigilo agrava a falta de transparência e não resolve o conflito.','Prometer imparcialidade não torna aceitável receber vantagem do interessado.'] },
  { id:'supp-esp-informatica', discipline:'specific_knowledge', topicId:'esp-informatica', prompt:'Em uma planilha, A2 contém 10/03/2026 e B2 contém 25/03/2026, ambas como datas válidas. Qual fórmula calcula a quantidade de dias entre elas no Excel?', answers:['=B2-A2','=SOMA(A2:B2)','=A2/B2','=DIAS(A2:B2)'], correctIndex:0, explanation:'Datas válidas são armazenadas como números seriais. Subtrair a data inicial da data final retorna o intervalo em dias: 25/03/2026 menos 10/03/2026 resulta em 15.', studyTip:'Confira que as células contêm datas reais, não texto. Para intervalo simples, subtraia data inicial da data final.', notes:['Correta: a subtração de datas seriais calcula o número de dias transcorridos.','SOMA adiciona os números seriais das datas, não calcula o intervalo.','Divisão não representa diferença temporal em dias.','Essa sintaxe não calcula o intervalo: a função DIAS, quando disponível, requer argumentos de data final e inicial separados.'] }
];

// Monta o banco autoral curado e inclui somente itens históricos com fonte verificável.
const curatedQuestions: Question[] = [
  ...archiveQuestions,
  ...rawQuestionsList.map((q) => ({
    id: q.id,
    discipline: q.discipline,
    topicId: q.topicId,
    prompt: q.prompt.replace(/^\((?:Banca\s+)?(?:IAN|IBAM|CEPERJ|FGV)\b[^)]*\)\s*/i, ''),
    options: q.answers.map((text, idx) => ({
      id: optionIds[idx],
      text,
      note: idx === q.correctIndex
        ? `Correta: esta alternativa corresponde ao comando. ${q.explanation}`
        : `Incorreta: “${text}” não atende ao comando; o gabarito é “${q.answers[q.correctIndex]}”. ${q.explanation}`
    })),
    correctOption: optionIds[q.correctIndex],
    explanation: q.studyTip ? `${q.explanation} Dica de estudo: ${q.studyTip}` : q.explanation,
    studyTip: q.studyTip,
    difficulty: q.difficulty,
    provenance: {
      kind: 'original' as const,
      label: 'Questão autoral de treino alinhada ao edital',
      sourceId: 'original-training'
    }
  })),
  ...originalSeeds.map(([id, discipline, topicId, prompt, answers, correctIndex, explanation, studyTip]) => ({
    id,
    discipline,
    topicId,
    prompt: prompt.replace(/^\((?:Banca\s+)?(?:IAN|IBAM|CEPERJ|FGV)\b[^)]*\)\s*/i, ''),
    options: answers.map((text, idx) => ({
      id: optionIds[idx],
      text,
      note: idx === correctIndex
        ? `Correta: corresponde ao enunciado. ${explanation}`
        : `Incorreta: “${text}” diverge do conceito cobrado; a resposta é “${answers[correctIndex]}”. ${explanation}`
    })),
    correctOption: optionIds[correctIndex],
    explanation: studyTip ? `${explanation} Dica de estudo: ${studyTip}` : explanation,
    studyTip,
    difficulty: 'medium' as const,
    provenance: {
      kind: 'original' as const,
      label: 'Questão autoral de treino alinhada ao edital',
      sourceId: 'original-training'
    }
  })),
  ...supplementaryQuestions.map((q) => ({
    id: q.id,
    discipline: q.discipline,
    topicId: q.topicId,
    prompt: q.prompt,
    options: q.answers.map((text, idx) => ({ id: optionIds[idx], text, note: q.notes[idx] })),
    correctOption: optionIds[q.correctIndex],
    explanation: q.explanation,
    studyTip: q.studyTip,
    difficulty: 'medium' as const,
    provenance: { kind: 'original' as const, label: 'Questão autoral de treino alinhada ao edital', sourceId: 'original-training' }
  })),
  {
    id: 'ian-2016-paty-excel-days',
    discipline: 'specific_knowledge',
    topicId: 'esp-informatica',
    prompt: 'Observe a janela abaixo, referente a uma planilha em edição no MS Excel 2010 em sua configuração padrão: a fórmula que deverá ser digitada na célula A3 para calcular corretamente a quantidade de dias entre as duas datas é:',
    options: [
      { id: 'A', text: '=intervalo.dias(A2:B2)', note: 'Incorreta: essa não é a sintaxe da função de intervalo de datas do Excel.' },
      { id: 'B', text: '=B2-A2', note: 'Correta: datas válidas são números seriais; subtrair a data inicial da final fornece os dias transcorridos.' },
      { id: 'C', text: '=A2:B2', note: 'Incorreta: dois-pontos define uma referência de intervalo, não uma operação que devolva a diferença em dias.' },
      { id: 'D', text: '=dias(A2:B2)', note: 'Incorreta: a função não recebe um intervalo único nesse formato; a subtração direta é a operação pedida.' }
    ],
    correctOption: 'B',
    explanation: 'No Excel, datas válidas são armazenadas como números seriais. A subtração da data inicial pela data final, na ordem final menos inicial, retorna a quantidade de dias entre elas. A questão foi aplicada no concurso IAN 2016 para Agente Administrativo da Câmara de Paty dos Alferes; a imagem da planilha do caderno original não está reproduzida nesta versão.',
    studyTip: 'Para intervalo simples, use data final menos data inicial. Confirme que as células estão armazenadas como datas, e não como texto.',
    difficulty: 'medium',
    provenance: {
      kind: 'third_party',
      label: 'Questão de prova anterior conferida em arquivo público de terceiro',
      sourceId: 'ian-2016-paty-pdf',
      url: 'https://www.qconcursos.com/questoes-de-concursos/questoes/0f408e88-9d',
      banca: 'IAN',
      contest: 'Câmara Municipal de Paty dos Alferes — Agente Administrativo',
      year: 2016
    }
  }
];

export const questions: Question[] = [
  ...curatedQuestions,
  ...buildExpandedQuestionBank(curatedQuestions)
];

// Helper functions para consulta e filtragem
export function getQuestionsByDiscipline(discipline: Discipline): Question[] {
  return questions.filter((q) => q.discipline === discipline);
}

export function getRealContestQuestions(): Question[] {
  return questions.filter((q) => q.provenance.kind === 'official' || q.provenance.kind === 'third_party');
}
