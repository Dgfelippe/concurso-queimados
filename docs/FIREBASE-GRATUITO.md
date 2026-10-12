# Configurar sincronização gratuita

O aplicativo funciona sem Firebase: questões, tentativas, simulados e tema continuam salvos no armazenamento local do navegador. A sincronização entre celular e computador exige uma conta Google e um projeto Firebase no plano Spark.

## Criar o projeto no plano gratuito

1. Entre em [Firebase Console](https://console.firebase.google.com/) com sua conta Google e crie um projeto chamado `concurso-queimados`.
2. Na etapa de faturamento, mantenha o plano **Spark (no-cost)**. Não vincule uma conta de faturamento e não faça upgrade para Blaze.
3. Em **Authentication → Sign-in method**, habilite **Google**.
4. Em **Authentication → Settings → Authorized domains**, confirme `dgfelippe.github.io`.
5. Em **Firestore Database**, crie o banco em modo de produção, escolha uma região próxima e mantenha Spark.
6. Publique no Firestore as regras do arquivo [`firestore.rules`](../firestore.rules). As regras impedem que uma conta leia os dados de outra.
7. Em **Project settings → General → Your apps**, registre um app Web e copie os campos `apiKey`, `authDomain`, `projectId` e `appId` da configuração do SDK.
8. No GitHub, abra **Dgfelippe/concurso-queimados → Settings → Secrets and variables → Actions → Variables**. Crie estas variáveis com os valores da configuração Web:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`

9. Em **Actions**, execute novamente **Build and deploy to GitHub Pages**. O botão “Salvar na nuvem com Google” aparecerá após a publicação.

A configuração Web do Firebase é identificador público do app; a proteção dos registros é feita pelas regras do Firestore e pela autenticação. Não coloque senha, chave privada ou arquivo de service account no GitHub.

## Custos e limites

O plano Spark não cobra automaticamente. O Firestore tem cota gratuita de armazenamento e operações por dia; ao exceder uma cota Spark, as operações podem ser interrompidas até o próximo ciclo. Para manter o projeto gratuito, não habilite faturamento nem mude para Blaze. Consulte os limites atuais nos [planos do Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) e na [página de preços do Firestore](https://firebase.google.com/docs/firestore/pricing).

## Privacidade e aparelhos

Cada usuário autenticado só acessa `users/{uid}`. Ao entrar pela primeira vez, respostas anônimas existentes naquele navegador são importadas para a conta; depois disso, celulares e computadores sincronizam o histórico dessa conta. Antes do primeiro login, dados permanecem apenas no aparelho e não podem aparecer em outro dispositivo.
