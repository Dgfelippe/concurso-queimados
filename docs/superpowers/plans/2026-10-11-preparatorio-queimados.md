# Preparatório de Queimados — Plano de Implementação

> **Para agentes de implementação:** executar tarefa por tarefa em modo nativo nesta sessão, mantendo os testes por tarefa e commits frequentes no repositório local do projeto.

**Objetivo:** Entregar um aplicativo local, responsivo e gratuito que organize a preparação para Agente Administrativo de Queimados, aplique questões e simulados no formato do edital, explique respostas, acompanhe erros e preserve o progresso no dispositivo.

**Arquitetura:** SPA em React/TypeScript com Vite e PWA, sem backend. Regras de estudo, pontuação e revisão ficam em módulos puros; conteúdo do edital e banco inicial ficam em dados tipados; Dexie/IndexedDB persiste perfil, tentativas, revisões e anexos. A interface consome esses módulos e oferece rotas para cada área do estudo.

**Tecnologias:** React, TypeScript, Vite, React Router, Dexie, Zod, vite-plugin-pwa, Vitest, jsdom e Testing Library. PDF.js para visualizar/analisar texto de anexos PDF localmente, sem enviar os arquivos à internet.

**Especificação:** `docs/superpowers/specs/2026-10-11-concurso-queimados-design.md`

## Restrições globais

- Sem login, senha, assinatura, chave de API, backend, sincronização em nuvem, anúncios, telemetria ou chamadas de IA.
- A prova inicial é 22/11/2026, das 14h às 17h, e a data permanece editável após retificação.
- O simulado completo tem 30 questões: 10 de Português valendo 2 pontos cada, 5 de Legislação valendo 1 ponto cada e 15 de Conhecimentos Específicos valendo 5 pontos cada.
- A nota mínima é 50/100 e nota zero em qualquer disciplina elimina; o app não promete classificação ou nomeação.
- Questões inéditas devem ser rotuladas como não oficiais; não afirmar que reproduzem com certeza o estilo IAN.
- Questões de legislação e explicações literais exigem fonte normativa oficial identificada; sem ela, o app sinaliza pendência e não inventa conteúdo.
- Salvar perfil, respostas e progresso em IndexedDB no próprio dispositivo; oferecer backup JSON.
- Execução local pelo VS Code; instalação PWA em outro dispositivo depende de origem HTTPS. Publicação não faz parte desta etapa.
- Implementar somente em `concurso-queimados/`, sem tocar nos demais projetos do workspace.

## Foco de revisão

1. Backup truncado, versão desconhecida ou JSON inválido deve ser recusado sem apagar os dados existentes — teste em `backup.test.ts`.
2. Virada de data local, fuso de Brasília e mudança de data da prova não devem deslocar tarefas nem produzir contagem regressiva negativa — teste em `dates.test.ts` e `planner.test.ts`.
3. Um banco filtrado incompleto não pode produzir simulado com distribuição/pontuação incorreta; avisar quais disciplinas não têm questões suficientes — teste em `simulation.test.ts`.
4. Falha de IndexedDB ou armazenamento cheio não pode mostrar “salvo” falsamente; apresentar erro acionável e manter a tela atual — teste no adaptador de persistência.
5. Ausência ou falha de leitura da norma municipal não pode gerar artigo, gabarito ou citação inventados — teste de validação da origem das questões legais.

---

## Mapa de arquivos

- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `public/manifest.webmanifest`, `public/icons/*`: execução, compilação e PWA.
- `src/main.tsx`, `src/app/App.tsx`, `src/app/routes.tsx`, `src/app/navigation.ts`: inicialização, composição e navegação.
- `src/domain/types.ts`: tipos comuns de edital, questão, perfil, tentativa, revisão e simulado.
- `src/domain/scoring.ts`, `planner.ts`, `reviews.ts`, `mastery.ts`, `dates.ts`: regras puras e determinísticas.
- `src/data/edital.ts`, `topics.ts`, `questions.json`, `sources.ts`: edital, catálogo de tópicos, banco rotulado e fontes.
- `src/storage/db.ts`, `repositories.ts`, `backup.ts`: IndexedDB versionado e backup validado.
- `src/features/onboarding/*`, `dashboard/*`, `plan/*`, `content/*`, `practice/*`, `simulation/*`, `errors/*`, `progress/*`, `sources/*`: telas e fluxos por área.
- `src/components/*`, `src/styles/*`: componentes compartilhados e estilo responsivo.
- `src/test/setup.ts` e testes ao lado dos módulos: testes de regras, persistência e interação.

## Tarefa 1: Base do projeto, PWA e navegação

**Arquivos:** criar `package.json`, configs Vite/TypeScript/Vitest, `index.html`, `public/manifest.webmanifest`, `src/main.tsx`, `src/app/App.tsx`, `src/app/routes.tsx`, navegação e estilo base. Criar repositório Git local dentro de `concurso-queimados/` para checkpoints, sem remoto.

**Interfaces:** rotas estáveis `/`, `/plano`, `/conteudos`, `/questoes`, `/simulados`, `/erros`, `/progresso` e `/fontes`; `App` fornece navegação responsiva e destinos vazios com estado claramente identificado.

- [ ] Criar configuração mínima de React/TypeScript/Vite, instalação local e scripts `dev`, `build`, `test` e `preview`.
- [ ] Criar o teste `src/app/App.test.tsx` chamado `renders_navigation_destinations` e confirmar falha por ausência da aplicação.
- [ ] Implementar shell acessível com navegação por teclado, layout mobile/desktop e destinos das oito áreas.
- [ ] Configurar manifest e cache PWA dos arquivos estáticos, sem cache de dados pessoais em service worker.
- [ ] Rodar teste do shell e `pnpm build`; confirmar renderização, rotas e compilação.
- [ ] Fazer checkpoint Git local da base funcional.

## Tarefa 2: Edital, tópicos e banco rastreável de questões

**Arquivos:** criar `src/domain/types.ts`, `src/data/edital.ts`, `src/data/topics.ts`, `src/data/questions.json`, `src/data/sources.ts` e `src/data/questions.test.ts`.

**Interfaces:** `Discipline = 'portuguese' | 'municipal_law' | 'specific_knowledge'`; `OptionId = 'A' | 'B' | 'C' | 'D'`. `Question` contém `id`, `discipline`, `topicId`, `prompt`, opções `A`–`D`, `correctOption`, `explanation`, explicações por alternativa e `provenance` (`official`, `third_party` ou `original`). `provenance` guarda origem, banca, concurso/ano quando aplicável e referência verificável.

- [ ] Escrever testes para cobertura dos tópicos do edital, quatro alternativas únicas, gabarito válido e proveniência obrigatória antes de criar os dados.
- [ ] Confirmar falha dos testes com o catálogo e banco ausentes.
- [ ] Implementar os metadados do edital e tópicos por disciplina; definir questão inédita como `original` e nunca preenchê-la com banca IAN.
- [ ] Pesquisar e registrar fontes oficiais para legislação municipal antes de criar qualquer questão normativa; se o texto não puder ser verificado, deixar explícita a pendência e não fabricar questão legal.
- [ ] Criar aproximadamente 60 questões inéditas de treino cobrindo o edital, cada uma com explicação e rótulo não oficial; questões legais específicas só entram com texto normativo oficial verificado.
- [ ] Rodar testes de integridade e cobertura; revisar distribuição e ausência de temas de outros cargos.
- [ ] Fazer checkpoint Git local do catálogo e banco.

## Tarefa 3: Regras de diagnóstico, plano, datas, revisão e pontuação

**Arquivos:** criar `src/domain/dates.ts`, `scoring.ts`, `planner.ts`, `reviews.ts`, `mastery.ts` e os testes correspondentes `dates.test.ts`, `scoring.test.ts`, `planner.test.ts`, `reviews.test.ts`, `mastery.test.ts`.

**Interfaces:** `computeSimulationResult(questions, answers): SimulationResult`; `buildStudyPlan(profile, topicStats, examDate, today): StudyDay[]`; `scheduleReviews(attempt, intervals): Review[]`; `calculateMastery(attempts): MasteryState`. Resultado contém acertos/erros e pontos por disciplina, total e avisos de mínimo/eliminatória.

- [ ] Escrever testes RED para pesos 2/1/5, mínimo de 50, nota zero, data local, seleção 10/5/15, carga horária semanal, revisão 1/3/7 dias e consolidação só após sessões distintas.
- [ ] Confirmar falha pelos módulos ausentes.
- [ ] Implementar funções puras, com limites e datas determinísticas injetáveis para teste.
- [ ] Garantir que nenhum cronograma deixe Português ou Legislação de fora e que Conhecimentos Específicos receba peso proporcional maior.
- [ ] Rodar testes de domínio e corrigir até passar.
- [ ] Fazer checkpoint Git local das regras.

## Tarefa 4: Persistência local, backup e anexos

**Arquivos:** criar `src/storage/db.ts`, `repositories.ts`, `backup.ts`, `src/features/content/AttachmentLibrary.tsx` e testes de armazenamento.

**Interfaces:** repositórios assíncronos para perfil, respostas, simulados, revisões e anexos PDF; `exportBackup(): Promise<StudyBackup>`; `importBackup(value): Promise<ImportResult>`. Validar backup com Zod antes de gravar; importação inválida não altera dados.

- [ ] Escrever testes RED para persistir após reabrir banco, exportar/importar, recusar backup inválido sem sobrescrever, anexar PDF e informar falha/quota.
- [ ] Confirmar falha sem o adaptador.
- [ ] Implementar schema versionado Dexie/IndexedDB e repositórios sem chamadas externas.
- [ ] Implementar backup JSON validado e aviso de risco de limpar os dados do navegador.
- [ ] Implementar anexos locais de provas, gabaritos e normas com origem, nome, data e tamanho; usar PDF.js somente no dispositivo para abrir/extrair texto quando existir camada textual, avisando quando o PDF for escaneado.
- [ ] Rodar testes de persistência e backup; verificar isolamento entre sessões do navegador.
- [ ] Fazer checkpoint Git local.

## Tarefa 5: Onboarding, sessão de estudo, correção e caderno de erros

**Arquivos:** criar telas e componentes em `src/features/onboarding/*`, `src/features/practice/*`, `src/features/errors/*` e testes de interação.

**Interfaces:** sessão recebe questões e grava `Attempt` com resposta, duração, confiança/motivo do erro; componente de correção recebe uma `Question` e `Attempt` e mostra gabarito, explicações, tópico e origem.

- [ ] Escrever testes RED para configuração inicial, resposta certa/errada, dúvida, chute, explicação e inclusão automática no caderno de erros.
- [ ] Confirmar falha sem os fluxos.
- [ ] Implementar questionário de disponibilidade/confiança/preferência e diagnóstico inicial com aviso sobre amostra pequena.
- [ ] Implementar blocos diários, filtros por disciplina/tópico/banca/ano/origem/situação, criação manual e importação validada de questões JSON/CSV de provas anexadas, preservação da banca/ano/fonte verdadeiros, caderno personalizado, treino de erradas e feedback por alternativa.
- [ ] Implementar razões de erro e agendamento editável de revisões; permitir reagendar sessão sem culpa.
- [ ] Rodar testes de fluxo e acessibilidade básica por teclado.
- [ ] Fazer checkpoint Git local.

## Tarefa 6: Simulados e histórico de resultados

**Arquivos:** criar `src/features/simulation/*`, `src/domain/simulation.ts` e testes do gerador e resultados.

**Interfaces:** `createSimulation(bank, mode, filters): SimulationSession | InsufficientBank`; `finishSimulation(session, answers, elapsedSeconds): SimulationResult`. Não iniciar simulado completo se faltar quantidade em qualquer disciplina.

- [ ] Escrever testes RED para seleção exata 10/5/15, alternativas A–D, cronômetro máximo de 10.800 segundos, distribuição insuficiente, cálculo e comparação histórica.
- [ ] Confirmar falha do gerador e tela de resultado ausentes.
- [ ] Implementar simulados por disciplina e completo, salvamento de rascunho/tentativa, pausa permitida e finalização com resultados claros.
- [ ] Apresentar pontos e alertas de 50 pontos/nota zero sem sugerir aprovação garantida.
- [ ] Rodar testes de simulado e conferir o cenário-limite de banco incompleto.
- [ ] Fazer checkpoint Git local.

## Tarefa 7: Painel, plano adaptativo, progresso e fontes

**Arquivos:** criar `src/features/dashboard/*`, `plan/*`, `progress/*`, `sources/*` e testes de componentes.

- [ ] Escrever testes RED para tarefa diária, contagem regressiva, revisões vencidas, atualização de data, evolução por tópico e aviso de retificação/fontes.
- [ ] Confirmar falha sem as páginas.
- [ ] Implementar painel, calendário/plano recalculável, conteúdos com estado de conclusão, gráficos simples e histórico sem ocultar erros.
- [ ] Permitir editar data de prova e perfil de estudo; exibir data considerada e referência de fonte.
- [ ] Criar “Fontes e Limites” separando material oficial, terceiros e questões inéditas; legislação sem fonte oficial permanece pendente.
- [ ] Rodar testes das telas e validar navegação entre tarefa, questão, erro e revisão.
- [ ] Fazer checkpoint Git local.

## Tarefa 8: Acabamento responsivo, execução local e verificação integrada

**Arquivos:** ajustar `src/styles/*`, `README.md`, manifest, ícones e fluxos já criados.

- [ ] Escrever testes de integração RED para primeiro uso até primeira sessão, backup completo e simulado completo até resultado.
- [ ] Confirmar falha nos fluxos ainda não conectados.
- [ ] Implementar estados vazios, carregamento, falha de armazenamento, formulários móveis e acessibilidade de contraste/foco.
- [ ] Documentar em português como abrir no VS Code, instalar dependências, iniciar localmente, instalar PWA em origem compatível e guardar/restaurar backup.
- [ ] Rodar `pnpm test` e `pnpm build`; validar funcionamento local e ausência de chamadas externas no fluxo essencial.
- [ ] Corrigir regressões, revisar o diff e fazer checkpoint Git final.

## Revisão de cobertura e consistência

- Edital, regras, tópicos e proveniência: Tarefa 2.
- Diagnóstico, pesos, calendário, revisões e consolidação: Tarefas 3 e 5.
- Persistência local, anexos, backup e privacidade: Tarefa 4.
- Simulados 30/10/5/15, cronômetro, pontos, mínimos e histórico: Tarefa 6.
- Painel, plano, progresso, fonte/limites e atualização da data: Tarefa 7.
- Responsividade, instruções, instalação, testes completos e build: Tarefas 1 e 8.
- As funções em `src/domain` são as interfaces de referência consumidas pelas páginas; a persistência só armazena tipos definidos em `src/domain/types.ts`.

