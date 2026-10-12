# Dg Concursos — Preparação para concursos públicos

Dg Concursos é uma plataforma independente de preparação para concursos públicos. Esta edição começa pelo concurso de Agente Administrativo de Queimados/RJ e organiza tópicos do edital, questões comentadas, simulados, caderno de erros e indicadores de desempenho. O progresso fica salvo no navegador; com Firebase Spark configurado e login Google, pode sincronizar entre aparelhos.

## Abrir no VS Code

1. Abra a pasta `concurso-queimados` no VS Code.
2. Abra o terminal integrado nessa pasta.
3. Execute `pnpm install` uma vez.
4. Execute `pnpm dev` e abra o endereço local informado pelo Vite (neste computador, `http://127.0.0.1:5173/`).

O servidor local já foi iniciado nesta sessão. Enquanto ele estiver ligado, atualize a página para ver as alterações.

## O que já funciona

- Painel com contagem regressiva, tentativas e aproveitamento.
- Questões por matéria e tópico, com comentário e registro de confiança/motivo de erro.
- Caderno de erros, plano diário ajustável e progresso por matéria.
- Simulado de 30 questões com distribuição 10/5/15, pesos por disciplina, cronômetro de até 3 horas e resultado por matéria.
- Navegação responsiva, respostas e resultados de simulados salvos no navegador, gráfico 5D e fontes oficiais do edital.
- Sincronização opcional com Firebase Spark: login Google, Firestore com regras por usuário e cache local para uso no mesmo aparelho.

O banco reúne questões autorais alinhadas aos tópicos do edital e uma questão histórica com origem identificada, retirada de uma prova IAN de 2016 e conferida em arquivo de terceiro. O acervo histórico é pequeno e não permite afirmar estatísticas de incidência da banca. Confira a origem na questão e consulte o edital oficial e suas retificações.

## Comandos de manutenção

- `pnpm test` — verifica os testes automatizados.
- `pnpm build` — verifica os tipos e gera os arquivos da aplicação em `dist/`.

## Configuração do Firebase gratuito

Siga [`docs/FIREBASE-GRATUITO.md`](docs/FIREBASE-GRATUITO.md) para criar o projeto no plano Spark, publicar as regras do Firestore e configurar as variáveis públicas no GitHub Actions. Sem essa configuração, o app funciona localmente e não mostra a opção de login. Não habilite faturamento/Blaze se a meta é manter tudo gratuito.

Os links na página **Fontes** identificam documentos oficiais e referências externas separadamente.
