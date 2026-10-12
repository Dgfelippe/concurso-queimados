export interface LawSection {
  title: string;
  badge: string;
  keyPoints: {
    heading: string;
    description: string;
    importantAlert?: string;
  }[];
}

export const dossieQueimados: LawSection[] = [
  {
    title: 'Lei Orgânica Municipal de Queimados/RJ',
    badge: 'Lei Fundamental da Cidade',
    keyPoints: [
      {
        heading: 'Princípios Expressos da Administração Pública Local',
        description: 'A atuação municipal deve pautar-se pela legalidade, impessoalidade, moralidade, publicidade, eficiência, razoabilidade, finalidade e supremacia do interesse público sobre o privado.',
        importantAlert: 'Pegadinha de prova: Nenhum ato de agente público pode ter caráter de autopromoção pessoal com nomes ou imagens.'
      },
      {
        heading: 'Divisão dos Poderes no Município',
        description: 'O Município possui apenas dois Poderes: o Poder Executivo (exercido pelo Prefeito e Secretários) e o Poder Legislativo (exercido pela Câmara Municipal de Queimados e seus Vereadores). São independentes e harmônicos entre si.',
        importantAlert: 'O Município exerce funções executivas e legislativas; a função jurisdicional cabe ao Poder Judiciário estadual ou federal, conforme a matéria.'
      },
      {
        heading: 'Símbolos Oficiais e Autonomia',
        description: 'São símbolos municipais de Queimados a Bandeira, o Brasão e o Hino representativos de sua cultura e história.',
        importantAlert: 'O Município goza de autonomia política, legislativa, administrativa e financeira nos limites da CF/88 e da Constituição Estadual.'
      },
      {
        heading: 'Fiscalização e Controle Externo',
        description: 'A prestação de contas do Prefeito e da Mesa da Câmara é fiscalizada pelo Poder Legislativo com parecer prévio obrigatório do Tribunal de Contas do Estado do Rio de Janeiro (TCE-RJ).',
        importantAlert: 'Em Queimados, quem atua como órgão auxiliar de controle externo é o TCE-RJ.'
      }
    ]
  },
  {
    title: 'Lei Municipal nº 1.060/2011 — Estatuto dos Servidores',
    badge: 'Regime Jurídico dos Servidores de Queimados',
    keyPoints: [
      {
        heading: 'Provimento e Investidura no Cargo Público',
        description: 'A Nomeação é o chamamento formal após aprovação em concurso público. A INVESTIDURA no cargo público ocorre com a assinatura do termo de POSSE. Após a posse, o servidor entra em efetivo EXERCÍCIO.',
        importantAlert: 'Regra de ouro: Nomeação chama; Posse investe no cargo; Exercício inicia o trabalho.'
      },
      {
        heading: 'Estágio Probatório e Estabilidade Funcional',
        description: 'O servidor nomeado para cargo efetivo cumpre estágio probatório pelo período de 3 (três) anos (36 meses) de efetivo exercício, período em que são avaliados: assiduidade, disciplina, capacidade de iniciativa, produtividade e responsabilidade.',
        importantAlert: 'A estabilidade exige 3 anos de efetivo serviço mais aprovação em avaliação especial de desempenho.'
      },
      {
        heading: 'Formas de Provimento que Caem em Prova',
        description: 'Além da nomeação, o estatuto prevê: Reintegração (quando a demissão é invalidada por decisão judicial ou administrativa, com ressarcimento integral); Recondução (retorno do servidor estável ao cargo de origem); Readaptação (investidura em cargo de atribuições afins por limitação física ou mental superveniente); Reversão (retorno do servidor aposentado à ativa).',
        importantAlert: 'Decore as formas com "R": Reintegração, Recondução, Readaptação e Reversão.'
      },
      {
        heading: 'Penalidades Disciplinares e o que NÃO é Penalidade',
        description: 'As penalidades disciplinares aplicáveis são: Repreensão (escrita), Suspensão (máximo de 90 dias), Demissão, Cassação de aposentadoria ou disponibilidade e Destituição de cargo em comissão.',
        importantAlert: 'Exoneração não é penalidade disciplinar. Estude as hipóteses previstas no estatuto e diferencie exoneração de demissão.'
      },
      {
        heading: 'Deveres e Proibições do Servidor de Queimados',
        description: 'Deveres: pontualidade, lealdade à instituição, urbanidade no trato com os munícipes, guarda de sigilo sobre assuntos da repartição e cumprimento de ordens superiores (exceto se manifestamente ilegais). Proibições: ausentar-se sem permissão, recusar fé a documentos públicos, praticar usura ou comércio nas dependências da repartição e valer-se do cargo para obter vantagem ilícita.'
      }
    ]
  },
  {
    title: 'Como interpretar a estrutura da prova',
    badge: 'Orientação baseada no edital',
    keyPoints: [
      {
        heading: 'Distribuição e pesos previstos no edital',
        description: 'A prova para Agente Administrativo tem 30 questões valendo 100 pontos: Português (10 questões x 2 pts = 20 pts), Legislação Municipal (5 questões x 1 pt = 5 pts) e Conhecimentos Específicos (15 questões x 5 pts = 75 pts).',
        importantAlert: 'Dedique pelo menos 60% do seu tempo de estudo às Específicas, pois é onde a nota de corte é decidida!'
      },
      {
        heading: 'Atenção aos Critérios Eliminatórios',
        description: 'Para ser aprovado, o candidato precisa alcançar pelo menos 50 pontos no total (50%) E NÃO PODE OBTER NOTA ZERO em qualquer uma das três disciplinas. Ou seja: você precisa acertar pelo menos 1 questão de Legislação Municipal para não ser desclassificado na hora!',
        importantAlert: 'Nunca deixe Legislação Municipal de lado! Se zerar os 5 pontos de legislação, você está eliminado mesmo gabaritando o resto.'
      },
      {
        heading: 'Organização do tempo de prova',
        description: 'Você terá 3 horas (180 minutos) para resolver 30 questões e preencher o cartão-resposta. Isso equivale a uma média folgada de 5 a 6 minutos por questão. Faça uma primeira passada resolvendo o que tem certeza, marque no gabarito preliminar, e revise com calma as questões de dúvida.',
        importantAlert: 'Saída da sala permitida somente após 1 hora. Levar o caderno de questões para conferência: somente após 2 horas de prova!'
      }
    ]
  }
];
