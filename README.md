# Rumo a Queimados — Agente Administrativo

Preparatório local para o concurso de Agente Administrativo de Queimados/RJ. O aplicativo organiza tópicos do edital, questões inéditas comentadas, um simulado completo no formato cadastrado, caderno de erros e indicadores de desempenho. As respostas são guardadas neste navegador.

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
- Navegação responsiva, dados de respostas salvos no navegador e fontes oficiais do edital.

O banco reúne questões autorais alinhadas aos tópicos do edital e uma questão histórica com origem identificada, retirada de uma prova IAN de 2016 e conferida em arquivo de terceiro. O acervo histórico é pequeno e não permite afirmar estatísticas de incidência da banca. Confira a origem na questão e consulte o edital oficial e suas retificações.

## Comandos de manutenção

- `pnpm test` — verifica os testes automatizados.
- `pnpm build` — verifica os tipos e gera os arquivos da aplicação em `dist/`.

## Limites desta versão

O histórico fica no armazenamento local do navegador e pode ser apagado ao limpar os dados do site. Ainda não há conta nem sincronização entre dispositivos. Os links na página **Fontes** identificam documentos oficiais e referências externas separadamente.
