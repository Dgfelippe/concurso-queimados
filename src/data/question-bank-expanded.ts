import type { Question } from '../domain/types';
import { syllabusTopics } from './topics';

const scenarioByDiscipline: Record<Question['discipline'], string[]> = {
  portuguese: [
    'a equipe está revisando um aviso de atendimento ao cidadão',
    'um agente confere a redação de um comunicado interno',
    'o setor prepara instruções claras para um formulário público',
    'uma servidora analisa um trecho de relatório administrativo',
    'a unidade precisa responder a uma solicitação por escrito',
    'um servidor revisa um texto antes de sua divulgação oficial',
    'a equipe organiza informações para uma orientação ao público'
  ],
  municipal_law: [
    'a equipe consulta o texto municipal indicado no edital',
    'um servidor analisa um procedimento à luz das normas locais',
    'a unidade confere as atribuições previstas na legislação municipal',
    'um candidato revisa a Lei Orgânica e o Estatuto dos Servidores',
    'a administração precisa fundamentar uma decisão em norma vigente',
    'o setor verifica os deveres aplicáveis à situação funcional',
    'um processo administrativo exige consulta à redação oficial da lei'
  ],
  specific_knowledge: [
    'a unidade recebe uma demanda que precisa ser registrada e encaminhada',
    'um agente organiza uma rotina de trabalho no setor administrativo',
    'a equipe confere informações antes de concluir um procedimento',
    'um servidor presta atendimento e precisa seguir o fluxo institucional',
    'o setor acompanha materiais, documentos ou tarefas pendentes',
    'a chefia avalia uma situação relacionada ao serviço público',
    'a repartição revisa seus procedimentos para reduzir erros e retrabalho'
  ]
};

const framingByDiscipline: Record<Question['discipline'], string[]> = {
  portuguese: [
    'Em uma situação de trabalho,',
    'Ao revisar o texto do caso,',
    'Considerando a norma-padrão,',
    'Para preservar a clareza da comunicação,',
    'No trecho apresentado,',
    'Com base no uso formal da língua,'
  ],
  municipal_law: [
    'À luz da legislação municipal indicada,',
    'Considerando o regime jurídico local,',
    'Com atenção ao texto vigente da norma,',
    'Para aplicar corretamente a regra municipal,',
    'No âmbito da administração de Queimados,',
    'Tendo como referência o conteúdo do edital,'
  ],
  specific_knowledge: [
    'Para resolver a situação com segurança,',
    'Considerando as boas práticas administrativas,',
    'No exercício das atribuições do cargo,',
    'Para manter a regularidade do procedimento,',
    'Com foco na organização do serviço público,',
    'Diante dessa rotina de trabalho,'
  ]
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}

function shuffledOptions(question: Question, variant: number): Question['options'] {
  const options = [...question.options];
  let seed = hash(`${question.id}:${variant}`);
  for (let index = options.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }
  return options.map((option, index) => ({ ...option, id: ['A', 'B', 'C', 'D'][index] as Question['options'][number]['id'] }));
}

/** Creates deterministic, contextualized local drills from reviewed original questions. */
export function buildExpandedQuestionBank(baseQuestions: Question[], variantsPerTopic = 42): Question[] {
  const originalByTopic = new Map<string, Question[]>();
  for (const question of baseQuestions) {
    if (question.provenance.kind !== 'original') continue;
    const grouped = originalByTopic.get(question.topicId) ?? [];
    grouped.push(question);
    originalByTopic.set(question.topicId, grouped);
  }

  return syllabusTopics.flatMap((topic) => {
    const bases = originalByTopic.get(topic.id) ?? [];
    if (bases.length === 0) throw new Error(`O banco não tem uma questão-base revisada para ${topic.title}.`);
    const scenarios = scenarioByDiscipline[topic.discipline];
    const frames = framingByDiscipline[topic.discipline];

    return Array.from({ length: variantsPerTopic }, (_, variant) => {
      const base = bases[variant % bases.length];
      const scenario = scenarios[Math.floor(variant / frames.length) % scenarios.length];
      const frame = frames[variant % frames.length];
      const options = shuffledOptions(base, variant);
      const correctOption = options.find((option) => option.text === base.options.find((candidate) => candidate.id === base.correctOption)?.text)?.id;
      if (!correctOption) throw new Error(`Não foi possível preservar o gabarito da questão-base ${base.id}.`);

      return {
        ...base,
        id: `local-variation-${topic.id}-${String(variant + 1).padStart(2, '0')}`,
        prompt: `Situação de treino: ${scenario}. ${frame} responda ao item: ${base.prompt}`,
        options,
        correctOption,
        explanation: `${base.explanation} Este exercício é uma variação de treino do mesmo conteúdo; confira a redação oficial da legislação quando a resposta depender de regra municipal literal.`,
        practiceGroupId: base.id,
        provenance: {
          kind: 'original',
          label: 'Variação autoral para prática local — alinhada ao edital',
          sourceId: 'local-training-variations'
        }
      };
    });
  });
}

export function selectDistinctPracticeGroups(candidates: Question[], count: number): Question[] {
  const selected: Question[] = [];
  const seen = new Set<string>();
  for (const question of candidates) {
    const group = question.practiceGroupId ?? question.id;
    if (seen.has(group)) continue;
    selected.push(question);
    seen.add(group);
    if (selected.length === count) break;
  }
  return selected;
}
