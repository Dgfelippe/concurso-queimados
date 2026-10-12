# Revisão Guiada de Erros IAN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma rotina local de estudo que ensine cada questão errada, confirme domínio em sessões diferentes e amplie questões alinhadas ao edital sem alegações de origem não verificadas.

**Architecture:** Derivar a fila e o estado de domínio do histórico local de tentativas. Atribuir ID de sessão em prática e simulado, renderizar a aula do erro a partir do enunciado, explicação, notas das alternativas e dica, e manter os dados de questão com metadados verificáveis. O banco atual continua no formato TypeScript e o app continua sem serviço externo.

**Tech Stack:** React 19, TypeScript, React Router, Vitest, Testing Library, CSS existente e `localStorage`.

**Spec:** `docs/superpowers/specs/2026-10-12-revisao-guiada-e-curadoria-ian-design.md`

## Global Constraints

- Usar conteúdo do Edital de Abertura 01/2026, Anexo VII, para o cargo de Agente Administrativo.
- Preservar distribuição oficial de simulado 10/5/15 e pesos 2/1/5; aprovação exige pelo menos 50 pontos e acerto em cada disciplina.
- Não marcar questão como oficial/histórica sem uma referência pública verificável para aquela questão/prova.
- Manter itens sem procedência verificável como autorais, sem nome de banca/ano que induza a erro.
- Manter o app local-first, sem conta, API, chave de IA ou dependência externa nova.
- Não afirmar estatística de incidência da IAN sem mostrar tamanho e origem da amostra.

## Review Focus

- Tentativas legadas sem `sessionId` não contam como duas sessões corretas para domínio; validar migração e retenção dos erros.
- Uma sessão repetida não pode contar duas vezes para domínio; validar IDs estáveis dentro da sessão e distintos entre sessões.
- Resposta errada depois de item dominado reabre a revisão; validar estado derivado em ordem temporal.
- Atualizar a página após responder mantém histórico e estado de revisão; validar `localStorage`.
- Questões com gabarito/origem inconsistentes não podem aparecer como prova real; validar esquema e filtros de procedência.

---

### Task 1: Derivar a fila de revisão e domínio

**Files:**
- Create: `src/domain/review-state.ts`
- Create: `src/domain/review-state.test.ts`
- Modify: `src/domain/types.ts`

**Interfaces:**
- Produces `deriveReviewQueue(attempts: Attempt[]): ReviewQueueItem[]`.
- `ReviewQueueItem` contém `questionId`, `status` (`pending | reviewing | mastered`), `wrongCount`, `correctSessions`, `lastWrongAttempt`, `lastAttemptAt` e `latestErrorReason`.
- Uma tentativa só conta para domínio quando tem `sessionId`; respostas certas contam no máximo uma vez por sessão e um erro posterior zera a sequência e reabre o item.

- [x] Escrever testes para primeiro erro, erro seguido de acerto, acertos em uma única sessão, acertos em duas sessões distintas, erro após domínio e tentativas antigas sem sessão.
- [x] Rodar `npm test -- src/domain/review-state.test.ts`; confirmar falhas porque a função ainda não existe.
- [x] Implementar `deriveReviewQueue` em ordem cronológica, preservando primeiro erro e último estado.
- [x] Rodar o teste focal; confirmar que todos os estados e transições passam.

### Task 2: Identificar sessões e persistir tentativas utilizáveis

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/domain/types.ts`
- Modify: `src/app/App.test.tsx`

**Interfaces:**
- Estender callback de resposta para aceitar `sessionId?: string` sem quebrar quem já o chama.
- A prática cria um ID por sessão de estudo; cada simulado cria um ID ao iniciar e reutiliza-o ao registrar as respostas da prova.
- O registro persiste o ID junto com cada tentativa existente em `rq-attempts`; nenhum novo serviço ou chave de sessão de servidor é criado.

- [x] Adicionar teste de integração que confirma `sessionId` persistido para respostas de prática e simulado.
- [x] Executar os testes focalizados; confirmar que falham antes do registro da sessão.
- [x] Implementar atribuição de ID estável por sessão e preservar a gravação atual de tentativas.
- [x] Executar os testes focados; validar navegação e submissão existentes.

### Task 3: Construir aula interativa no Caderno de Erros

**Files:**
- Create: `src/app/ErrorTutor.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- `ErrorTutor` recebe questões erradas, tentativas, fila derivada e callback `onAnswer`; não grava diretamente em `localStorage`.
- Cada aula mostra resposta errada registrada, motivo informado, comando da questão, conceito/explicação, análise de cada alternativa (`QuestionOption.note`), dica de estudo e controle de nova tentativa.
- Após responder, o tutor mostra acerto/erro e mantém o item revisável conforme o estado derivado.

- [x] Escrever testes de interface para escolha de um erro, abertura da aula, exibição das quatro análises e resposta de nova tentativa.
- [x] Executar testes focados; confirmar falhas antes da interface.
- [x] Substituir o uso de `Practice` em `/erros` por `ErrorTutor`; manter ligações para o banco quando não houver pendências.
- [x] Adicionar resumo de pendentes, em revisão e dominadas e agrupamento simples por disciplina/motivo; ordenar primeiro erros recentes e conhecimentos específicos de maior peso, mantendo todos acessíveis.
- [x] Estilizar estados de aula, alternativa e revisão nos temas claro/escuro sem introduzir dependências.
- [x] Executar os testes de interface; confirmar persistência do fluxo através do estado global do app.

### Task 4: Auditar procedência e ampliar itens de treino

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/data/questions.ts`
- Modify: `src/data/sources.ts`
- Modify: `src/data/question-bank.ts`
- Modify: `src/data/questions.test.ts`

**Interfaces:**
- A procedência oferece URL/referência individual opcional para fonte pública e mantém os tipos `official`, `third_party` e `original`.
- Um item original não pode carregar banca/ano de aplicação; item histórico precisa identificar banca, concurso, ano e referência verificável.
- Acrescentar pelo menos 24 questões autorais (uma por tópico cadastrado no edital), com gabarito, comentário de cada alternativa, explicação e dica; rotular todas como treino.

- [x] Auditar todos os itens existentes contra fonte pública individual; criar testes que impeçam rótulo histórico sem referência e rótulo autoral com dados de banca/ano.
- [x] Reclassificar como treino os itens cuja aplicação exata não possa ser verificada; preservar como históricos apenas itens sustentados pelas fontes, incluindo links para provas IAN antigas.
- [x] Criar os 24 novos itens (um por tópico do edital) e testes de cobertura, unicidade, alternativas, comentários, gabarito e procedência.
- [x] Rodar `npm test -- src/data/questions.test.ts`; corrigir dados até a suíte passar.
- [x] Confirmar que os filtros existentes “provas anteriores” e “treino” usam os metadados auditados.

### Task 5: Verificação de integração e documentação de fontes

**Files:**
- Modify: `src/app/App.test.tsx`
- Modify: `src/data/sources.ts`
- Modify: `README.md`

- [x] Acrescentar teste de fluxo: responder errado, abrir /erros, estudar, acertar em outra sessão, recarregar e ver o item em revisão; repetir em uma terceira sessão para dominar; errar depois para reabrir.
- [x] Confirmar pelo teste que simulados conservam 10/5/15, pesos e nota mínima/eliminação por disciplina.
- [x] Acrescentar na tela/fontes o limite da amostra histórica IAN e links públicos de prova; não estimar frequência como certeza.
- [x] Rodar `npm test` e `npm run build`; corrigir erros encontrados e verificar que a compilação final conclui.
- [x] Rever `git diff` para garantir que não entraram mudanças fora do escopo aprovado. O diretório já continha mudanças da implementação anterior do mesmo preparatório; foram preservadas e não foram empacotadas em commit novo.

## Execution Handoff

Implementar em execução nativa, uma tarefa por vez, com testes focados antes de cada mudança e suíte/build completos ao final. A execução deve preservar todas as alterações preexistentes não relacionadas no diretório de trabalho.
