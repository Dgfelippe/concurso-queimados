# Preparatório local — Agente Administrativo de Queimados

## Objetivo

Construir um aplicativo de estudo utilizável, em português do Brasil, para apoiar a preparação individual ao cargo de Agente Administrativo (ensino médio) do Concurso Público 01/2026 da Prefeitura de Queimados/RJ, organizado pelo Instituto de Avaliação Nacional (IAN). O produto deve tornar o estudo diário concreto e mensurável: organizar o conteúdo do edital, oferecer prática, ensinar com a correção e direcionar revisões. Não promete aprovação nem substitui o estudo.

## Perfil, ambiente e restrições

- Uso individual, sem conta, senha, assinatura, chave de API ou serviço pago.
- Aplicação web responsiva, executada localmente a partir do VS Code e preparada como PWA. A instalação em outros dispositivos requer servir a versão compilada por uma origem HTTPS; publicação e sincronização entre dispositivos ficam fora desta etapa.
- Funcionalidades essenciais disponíveis sem conexão depois de carregadas; sem backend ou sincronização em nuvem.
- Perfil, respostas e progresso armazenados no dispositivo por IndexedDB. O usuário pode exportar e importar uma cópia de segurança em JSON.
- Interface em português, simples em celular e computador, com estados vazios e mensagens que orientam o próximo passo.
- Criar o projeto em `concurso-queimados/`, sem modificar os outros projetos presentes no workspace.

## Regras do concurso

Usar como dados iniciais — sempre editáveis caso haja retificação oficial:

- Cargo: Agente Administrativo; escolaridade: ensino médio; jornada: 40 horas semanais.
- 54 vagas imediatas mais cadastro de reserva; remuneração indicada: R$ 3.422,60 por mês.
- Banca: Instituto de Avaliação Nacional (IAN).
- Prova prevista para 22/11/2026, das 14h às 17h (horário de Brasília), duração de 3 horas.
- 30 questões objetivas, quatro alternativas (A–D): Português 10 questões × 2 pontos; Legislação Municipal 5 × 1 ponto; Conhecimentos Específicos 15 × 5 pontos. Total de 100 pontos.
- Mínimo de 50 pontos e nota diferente de zero em cada disciplina. O aplicativo deve alertar sobre esses dois critérios, sem sugerir que alcançar a nota mínima garante classificação ou nomeação.
- Exibir a data de prova usada e permitir alterá-la após retificação. Recomendar conferência de retificações, convocação, local e horário nos canais oficiais.

## Conteúdo programático

O catálogo de tópicos deve refletir o edital enviado e permitir acompanhar cada tópico separadamente.

**Língua Portuguesa:** leitura e interpretação; vocabulário e relações de sentido; ortografia e acentuação; pontuação; classes de palavras (pronomes, verbos, preposições, conjunções, substantivos e adjetivos); termos da oração; coordenação e subordinação; períodos e orações; concordância nominal e verbal; regência nominal e verbal; crase.

**Legislação Municipal:** Lei Orgânica do Município de Queimados/RJ e Lei Municipal nº 1.060, de 22/12/2011 (regime jurídico dos servidores municipais, autarquias e fundações públicas). O estudo artigo por artigo, as citações e as questões que dependam da literalidade só podem usar texto normativo oficial carregado ou localizado e identificado. Se o texto não estiver disponível, o sistema deve dizer isso e permitir anexá-lo; nunca inventar artigo, prazo ou regra. Legislação posterior ao edital não entra automaticamente no conteúdo cobrado.

**Conhecimentos Específicos:** Administração Pública (conceitos, princípios, direta/indireta, atos e poderes em nível introdutório); Administração Geral (planejamento, organização, direção, controle, organização e métodos, fluxos, rotinas e processos); Recursos Humanos; Materiais e Patrimônio; Administração Financeira e Orçamentária; Arquivologia e Gestão Documental; Redação Oficial; Legislação e Normas Administrativas; Planejamento e Controle Administrativo; Ética e Conduta no Serviço Público; Noções Básicas de Informática. Não inserir Saúde Pública ou matérias de outros cargos como conteúdo da prova.

## Fluxo de estudo

1. No primeiro uso, coletar horas disponíveis por dia, dias da semana, confiança por disciplina, experiência prévia e preferência entre explicação curta ou questões primeiro.
2. Aplicar um diagnóstico inicial por disciplina e tópico; informar que uma amostra pequena não mede definitivamente o conhecimento.
3. Gerar e recalcular um plano até a data de prova configurada. Considerar pesos, desempenho e disponibilidade; priorizar Conhecimentos Específicos sem abandonar Português e Legislação, pois nota zero em qualquer disciplina elimina.
4. Cada sessão combina explicação objetiva, recuperação ativa com questões, correção comentada e revisão de erros; permitir reagendamento sem mensagens de culpa.
5. Exibir painel com tarefa do dia, contagem regressiva, revisões vencidas, estudo concluído e pendências.

## Questões, provas e correções

- Filtros por disciplina, tópico, banca, ano, dificuldade, origem e situação (nova, respondida, errada).
- Incluir inicialmente um conjunto de questões inéditas de treino, identificadas como não oficiais e sem alegar que reproduzem com certeza o estilo IAN. Questões de outras bancas devem manter a banca verdadeira e ser marcadas como treino complementar.
- Guardar origem, banca, concurso, ano, tópico, gabarito e justificativa de cada questão. Não apresentar questão inventada como questão aplicada.
- Permitir cadernos personalizados, blocos curtos, revisão de erradas, simulados por disciplina e simulado completo no formato exato do edital.
- Simulado completo: 30 questões na distribuição 10/5/15, alternativas A–D, cronômetro configurável até 3 horas e pesos 2/1/5. Ao terminar, apresentar acertos, erros, pontos por disciplina, total, duração e comparação com tentativas anteriores; sinalizar nota abaixo de 50 ou nota zero em disciplina.
- Após cada resposta, mostrar acerto/erro, gabarito, explicação do raciocínio, análise das alternativas, tópico do edital e fonte/referência normativa quando pertinente. Se a base da explicação for insuficiente, expor a incerteza.
- Registrar resposta, duração, confiança (dúvida/chute) e motivo de erro: desconhecimento, confusão conceitual, interpretação, desatenção, dúvida entre alternativas ou cálculo/procedimento.

## Memória, revisão e progresso

- Caderno de erros inclui erradas, dúvidas e acertos por chute, com revisão espaçada configurável (sugestão inicial: 1, 3 e 7 dias).
- Mostrar evolução por tópico, disciplina, banca, data, tempo e tipo de erro; não apagar nem ocultar tentativas anteriores.
- Só marcar tópico como consolidado após desempenho repetido em sessões distintas, com regra visível ao usuário.
- Persistir automaticamente no dispositivo; incluir exportação/importação de backup e aviso claro de que limpar dados do navegador pode apagar o progresso.

## Navegação e áreas

Painel, Plano, Conteúdos, Questões, Simulados, Caderno de Erros, Progresso e Fontes e Limites. A interface precisa ter ações funcionais, não apenas telas demonstrativas. Uma área de anexos deve permitir acrescentar provas, gabaritos e textos normativos para uso local; cada material importado deve preservar sua origem.

## Fontes, privacidade e limites

- Distinguir claramente conteúdo oficial, material de terceiros e questão inédita de treino.
- Exibir fonte e data de consulta para normas e informações do concurso; informar que retificações devem ser conferidas nos canais oficiais do IAN e da Prefeitura.
- Materiais e histórico permanecem no dispositivo e não são enviados a serviços externos.
- Não incluir serviços pagos, telemetria, anúncios, contas ou chamadas de IA.
- O aplicativo organiza e acompanha o estudo; não prevê aprovação, classificação ou nomeação.

## Critérios de aceitação

1. O usuário consegue configurar disponibilidade, iniciar diagnóstico, abrir uma tarefa e registrar respostas.
2. Questões erradas, dúvidas e chutes entram no caderno de erros e recebem revisão agendada.
3. O simulado respeita quantidade, alternativas, duração e pontuação oficiais; o resultado detecta nota abaixo do mínimo e nota zero por disciplina.
4. Plano, desempenho e data restante se atualizam com as respostas e com a data de prova configurada.
5. Progresso sobrevive a fechar e reabrir o aplicativo no mesmo dispositivo e pode ser exportado e restaurado.
6. Todas as questões têm proveniência identificável; nenhuma questão inédita aparece como oficial.
7. A experiência principal é responsiva e funciona localmente sem chave, assinatura ou backend.
8. Conteúdo legal sem texto oficial permanece explicitamente pendente, sem citações normativas inventadas.
