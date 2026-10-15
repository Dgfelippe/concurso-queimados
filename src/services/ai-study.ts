import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import { z } from 'zod';
import type { Question } from '../domain/types';
import { getTopic } from '../data/topics';
import { firebaseAiConfigured, firebaseApp } from './firebase';
import { InvalidAiJsonError, parseAiJson } from './ai-json';
import { withAiQuotaRetry } from './ai-errors';

const optionIds = ['A', 'B', 'C', 'D'] as const;
const questionSchema = z.object({
  discipline: z.enum(['portuguese', 'municipal_law', 'specific_knowledge']),
  topicId: z.string(),
  prompt: z.string().min(20).max(1200),
  options: z.array(z.object({ id: z.enum(optionIds), text: z.string().min(2).max(500), note: z.string().min(2).max(500) })).length(4),
  correctOption: z.enum(optionIds),
  explanation: z.string().min(30).max(1600),
  studyTip: z.string().min(8).max(400),
  difficulty: z.enum(['easy', 'medium', 'hard'])
}).superRefine((question, ctx) => {
  if (new Set(question.options.map((option) => option.id)).size !== 4 || !optionIds.every((id) => question.options.some((option) => option.id === id))) {
    ctx.addIssue({ code: 'custom', message: 'A questão precisa ter uma alternativa A, B, C e D.' });
  }
});

const generationSchema = z.object({ questions: z.array(questionSchema).min(1).max(3) });
const simulationGenerationSchema = z.object({ questions: z.array(questionSchema).length(9) });
type GeneratedQuestion = z.infer<typeof questionSchema>;

function structuredQuestionSchema(maxQuestions: number) {
  return Schema.object({
  properties: {
    questions: Schema.array({
      minItems: maxQuestions,
      maxItems: maxQuestions,
      items: Schema.object({
        properties: {
          discipline: Schema.enumString({ enum: ['portuguese', 'municipal_law', 'specific_knowledge'] }),
          topicId: Schema.string(),
          prompt: Schema.string(),
          options: Schema.array({ minItems: 4, maxItems: 4, items: Schema.object({
            properties: { id: Schema.enumString({ enum: [...optionIds] }), text: Schema.string(), note: Schema.string() },
            required: ['id', 'text', 'note']
          }) }),
          correctOption: Schema.enumString({ enum: [...optionIds] }),
          explanation: Schema.string(),
          studyTip: Schema.string(),
          difficulty: Schema.enumString({ enum: ['easy', 'medium', 'hard'] })
        },
        required: ['discipline', 'topicId', 'prompt', 'options', 'correctOption', 'explanation', 'studyTip', 'difficulty']
      })
    })
  },
  required: ['questions']
  });
}

function getModel(options: { systemInstruction?: string; structuredOutput?: boolean; maxQuestions?: number } = {}) {
  if (!firebaseAiConfigured || !firebaseApp) {
    throw new Error('A IA ainda não está habilitada. Falta concluir a configuração gratuita do Firebase AI Logic e do App Check.');
  }
  const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    // Current Flash supports structured output; the project stays on the no-billing tier.
    model: 'gemini-3.8-flash',
    systemInstruction: options.systemInstruction,
    generationConfig: options.structuredOutput
      ? { maxOutputTokens: options.maxQuestions === 9 ? 12000 : 5000, responseMimeType: 'application/json', responseSchema: structuredQuestionSchema(options.maxQuestions ?? 3) }
      : { maxOutputTokens: 5000 }
  });
}

function responseJson<T>(text: string, validator: z.ZodType<T>): T {
  const parsed = parseAiJson(text);
  const result = validator.safeParse(parsed);
  if (!result.success) throw new Error('A IA não conseguiu montar uma questão completa agora. Tente novamente.');
  return result.data;
}

function sourceQuestion(question: GeneratedQuestion): Question {
  const topic = getTopic(question.topicId);
  if (!topic || topic.discipline !== question.discipline) throw new Error('A IA retornou um tópico fora do edital. Gere novamente.');
  return {
    ...question,
    id: `ai-${crypto.randomUUID()}`,
    provenance: {
      kind: 'original',
      label: 'Questão nova para treino — confira com o material oficial',
      sourceId: 'gemini-ai-training'
    }
  };
}

export async function generateTopicQuestions(input: {
  topicId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examples: Question[];
}): Promise<Question[]> {
  const topic = getTopic(input.topicId);
  if (!topic) throw new Error('Escolha um tópico que faça parte do edital.');
  const examples = input.examples
    .filter((item) => item.topicId === input.topicId)
    .slice(0, 3)
    .map(({ prompt, options, correctOption, explanation }) => ({
      prompt,
      options: options.map((option) => `${option.id}) ${option.text}`),
      correctOption,
      explanation
    }));
  const prompt = `Crie exatamente 3 questões objetivas inéditas, em português brasileiro, com quatro alternativas A-D, para treino de concurso de Agente Administrativo do Município de Queimados/RJ.
Use exclusivamente o conteúdo do tópico abaixo e os exemplos de estilo fornecidos. Não copie as questões de exemplo. Distribua o bloco entre aspectos diferentes do resumo, sem repetir a mesma habilidade nas três questões. Os exemplos servem apenas para observar o formato da banca quando forem do mesmo tópico; não os trate como fonte para ampliar o conteúdo programático.
Não invente números de artigos, trechos legais, prazos, direitos ou regras municipais que não apareçam no contexto. Se o resumo não sustentar uma cobrança factual, faça uma questão conceitual segura dentro do recorte disponível e informe essa limitação na explicação. Em informática, não cobre produto, versão, comando ou recurso que não esteja delimitado pelo edital.
Tópico do edital: ${topic.title} (${topic.id})
Resumo disponível: ${topic.summary}
Matéria: ${topic.discipline}
Dificuldade solicitada: ${input.difficulty}. Fácil = aplicação direta; média = interpretação/aplicação com um passo de raciocínio; difícil = distinção conceitual ou caso com mais de uma etapa, sem ambiguidade.
Exemplos de estilo, para referência e não para copiar: ${JSON.stringify(examples)}
Produza alternativas plausíveis e apenas uma correta. Antes de responder, resolva cada item sem olhar o gabarito proposto, confira se exatamente uma alternativa é defensável pelo enunciado e pelo resumo e confirme que a explicação sustenta a mesma letra. Explique a correta e o defeito específico de cada distrator no campo note. Responda apenas o JSON conforme o esquema.`;
  const model = getModel({ structuredOutput: true });
  let generated: GeneratedQuestion[];
  try {
    const result = await withAiQuotaRetry(() => model.generateContent(prompt));
    generated = responseJson(result.response.text(), generationSchema).questions;
  } catch (cause) {
    if (!(cause instanceof InvalidAiJsonError)) throw cause;
    const retry = await withAiQuotaRetry(() => model.generateContent(`${prompt}\n\nREFAÇA A RESPOSTA: entregue somente um objeto JSON completo no formato solicitado, sem introdução, sem bloco Markdown e sem texto depois do objeto.`));
    generated = responseJson(retry.response.text(), generationSchema).questions;
  }
  if (generated.some((item) => item.topicId !== topic.id || item.discipline !== topic.discipline)) {
    throw new Error('A IA trouxe uma questão fora do tópico selecionado. Gere novamente.');
  }
  return generated.map(sourceQuestion);
}

export async function generateSimulationQuestions(input: {
  topics: { topicId: string; examples: Question[] }[];
  difficulty: 'easy' | 'medium' | 'hard';
  onQuotaWait?: (milliseconds: number) => void;
}): Promise<Record<Question['discipline'], Question[]>> {
  if (input.topics.length !== 3) throw new Error('Não foi possível selecionar os tópicos do edital para o simulado.');
  const topics = input.topics.map(({ topicId, examples }) => {
    const topic = getTopic(topicId);
    if (!topic) throw new Error('Um dos tópicos selecionados não faz parte do edital.');
    const styleExamples = examples.filter((item) => item.topicId === topicId).slice(0, 3).map(({ prompt, options, correctOption, explanation }) => ({
      prompt,
      options: options.map((option) => `${option.id}) ${option.text}`),
      correctOption,
      explanation
    }));
    return { topic, examples: styleExamples };
  });
  const disciplines = topics.map(({ topic }) => topic.discipline);
  if (new Set(disciplines).size !== 3) throw new Error('O simulado precisa selecionar um tópico de cada matéria.');

  const topicContext = topics.map(({ topic, examples }) => JSON.stringify({
    discipline: topic.discipline,
    topicId: topic.id,
    title: topic.title,
    summary: topic.summary,
    styleExamples: examples
  })).join('\n');
  const difficultyLabel = { easy: 'fácil', medium: 'média', hard: 'difícil' }[input.difficulty];
  const prompt = `Crie exatamente 9 questões objetivas inéditas, em português brasileiro, para um simulado de Agente Administrativo do Município de Queimados/RJ. Gere exatamente 3 questões para cada tópico descrito no contexto e mantenha em cada item o discipline e topicId correspondentes.
Use exclusivamente o resumo do tópico para definir o conteúdo. Os exemplos são apenas referência de estilo, não podem ser copiados nem usados para ampliar o conteúdo. Distribua as questões entre aspectos diferentes do resumo, com quatro alternativas A-D e apenas uma correta.
Não invente artigos, trechos legais, prazos, direitos ou regras municipais que não apareçam no resumo. Se o resumo não sustentar uma cobrança factual, formule uma questão conceitual segura dentro do recorte e registre a limitação na explicação. Em informática, não cobre produto, versão, comando ou recurso fora do conteúdo informado.
Dificuldade: ${difficultyLabel}. Fácil = aplicação direta; média = interpretação ou aplicação com um passo de raciocínio; difícil = distinção conceitual ou caso com mais de uma etapa, sempre sem ambiguidade.
Para cada item, explique a resposta correta e o defeito específico de cada alternativa incorreta no campo note. Antes de responder, resolva a questão de forma independente e confira que o gabarito e a explicação concordam.
Contexto dos três tópicos do edital (um bloco de três itens por tópico):\n${topicContext}\nResponda apenas o JSON completo conforme o esquema.`;

  const model = getModel({ structuredOutput: true, maxQuestions: 9 });
  let generated: GeneratedQuestion[];
  try {
    const result = await withAiQuotaRetry(() => model.generateContent(prompt), undefined, input.onQuotaWait);
    generated = responseJson(result.response.text(), simulationGenerationSchema).questions;
  } catch (cause) {
    if (!(cause instanceof InvalidAiJsonError)) throw cause;
    const retry = await withAiQuotaRetry(() => model.generateContent(`${prompt}\n\nREFAÇA: retorne somente um objeto JSON completo e válido conforme o esquema, sem Markdown ou texto adicional.`), undefined, input.onQuotaWait);
    generated = responseJson(retry.response.text(), simulationGenerationSchema).questions;
  }

  const result: Record<Question['discipline'], Question[]> = { portuguese: [], municipal_law: [], specific_knowledge: [] };
  for (const { topic } of topics) {
    const matching = generated.filter((question) => question.topicId === topic.id && question.discipline === topic.discipline);
    if (matching.length !== 3) throw new Error('A resposta não trouxe três questões para cada matéria do edital. Tente gerar o simulado novamente.');
    result[topic.discipline] = matching.map(sourceQuestion);
  }
  if (generated.some((question) => !topics.some(({ topic }) => topic.id === question.topicId && topic.discipline === question.discipline))) {
    throw new Error('A resposta trouxe questões fora dos tópicos selecionados no edital. Tente novamente.');
  }
  return result;
}

export async function explainMistake(input: {
  question: Question;
  selectedOption: string;
  errorReason?: string;
}): Promise<string> {
  const { question } = input;
  const topic = getTopic(question.topicId);
  const model = getModel({ systemInstruction: 'Você é um tutor de concursos cuidadoso. Ensine em português brasileiro claro e respeitoso. Use apenas o enunciado, alternativas, gabarito e comentário fornecidos. Não invente lei, artigo ou fonte. Se houver insuficiência ou possível inconsistência, diga isso com clareza. Não prometa aprovação.' });
  const prompt = `Ajude a aprender com esta questão.
Matéria: ${question.discipline}; tópico do edital: ${topic?.title ?? question.topicId}; resumo do tópico: ${topic?.summary ?? 'não fornecido'}.
Enunciado: ${question.prompt}
Alternativas: ${question.options.map((option) => `${option.id}) ${option.text}`).join('\n')}
Gabarito registrado: ${question.correctOption}
Comentário do banco: ${question.explanation}
Resposta escolhida pelo candidato: ${input.selectedOption}
Motivo que o candidato registrou: ${input.errorReason ?? 'não informado'}

Ensine com subtítulos curtos: O que a questão cobra; Como raciocinar; Por que minha escolha pareceu atraente e onde falha; análise breve de A, B, C e D; regra para guardar; uma pergunta-relâmpago sem resposta no final. Se o comentário do banco e o gabarito parecerem inconsistentes, não os concilie artificialmente: aponte a inconsistência.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  if (!text) throw new Error('A IA não retornou uma explicação. Tente novamente.');
  return text.slice(0, 7000);
}
