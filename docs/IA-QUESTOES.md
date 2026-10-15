# Questões com IA e procedência

## O que o simulador faz

Ao gerar um simulado, o aplicativo solicita ao Firebase AI Logic três questões inéditas para um tópico aleatório de cada matéria. Em seguida, combina esses nove itens com questões aleatórias do banco local, mantendo a distribuição de 10 questões de Português, 5 de legislação municipal e 15 de conhecimentos específicos. O banco local atualmente tem apenas uma questão de concurso passado marcada com banca, concurso, ano e fonte; por isso ela pode aparecer na parte de conhecimentos específicos. O restante é identificado como treino autoral ou inédito de IA.

O simulador não diz que as questões criadas pela IA foram aplicadas em concurso. Para consultar provas e bancos com mais questões reais, abra a página Fontes Oficiais. Ela aponta para fontes IAN e plataformas de questões; a disponibilidade e os limites gratuitos pertencem a esses serviços.

## Ativação do Gemini sem configurar cobrança

1. No Firebase Console do projeto vinculado ao Dg Concursos, abra **AI Logic** e ative **Gemini Developer API**. Mantenha o projeto no plano Spark e não vincule uma conta de faturamento.
2. Em **Google Cloud → Fraud Defense**, crie uma chave Web baseada em pontuação para `dgfelippe.github.io`. O projeto sem faturamento usa a cota gratuita de até 10.000 avaliações mensais; ao exceder esse limite, novas avaliações falham até a virada do mês.
3. No Firebase Console, em **App Check → Apps**, registre o app Web com o provedor reCAPTCHA Enterprise e a chave pública criada no passo anterior.
4. No GitHub, abra **Settings → Secrets and variables → Actions → Variables** e crie `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` com a chave pública do reCAPTCHA Enterprise.
5. Confirme que as variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` e `VITE_FIREBASE_APP_ID` já existem no mesmo local. Publique uma nova execução do workflow do GitHub Pages.

Sem essa configuração, o simulado continua disponível pelo banco local e mostra o aviso de que a geração por IA ainda não está ativada.

## Limites e privacidade

O Firebase AI Logic não cobra pelo serviço de integração, mas o uso do Gemini tem cotas limitadas no nível gratuito. A cota pode mudar, e pedidos concorrentes podem falhar temporariamente. O reCAPTCHA Enterprise Essentials oferece até 10.000 avaliações mensais sem conta de faturamento; após esse limite, as avaliações falham até o próximo mês. A integração não vincula faturamento e não oferece geração ou busca ilimitada.

O modo sem cobrança não usa pesquisa web ao vivo para cada simulado. O conteúdo real é limitado a itens com fonte verificável no banco local e links para provas e plataformas externas. Busca fundamentada na web, captura automática de questões e volume ilimitado não são prometidos como gratuitos.

Ao solicitar geração ou explicação, o tópico e o texto da questão podem ser enviados ao Google Gemini. Nome e e-mail não são enviados pela função de geração. Revise a política atual de dados e retenção do provedor antes de usar material sensível.
