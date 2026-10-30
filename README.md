# Landing Optimizer — página comercial

Landing page em português brasileiro para donos de negócios digitais. HTML, CSS e JavaScript sem etapa de build ou dependências npm. O mesmo servidor Node.js entrega a página e recebe o formulário em `POST /api/leads`. A gravação usa a API REST oficial do Firestore e a identidade do Cloud Run.

## O que acontece com o formulário

E-mail e site são validados no servidor e gravados na coleção `landing_leads`, com data e status `new`. O navegador só confirma o pedido após a gravação. Os leads não ficam disponíveis em nenhum endpoint público. Não há armazenamento de leads no navegador ou em arquivos locais. Novos pedidos não coletam nem gravam nome; registros antigos permanecem como estão, sem necessidade de migração.

**A conversa é solicitada, não agendada automaticamente.** Consulte os registros no console do Firestore e entre em contato por e-mail para combinar um horário. Não há envio automático de e-mails, integração de calendário ou CRM.

## Rodar localmente

Requer Node.js 22 ou superior. No PowerShell, nesta pasta:

```powershell
npm.cmd test
npm.cmd start
```

Abra `http://localhost:8080`. A página abre sem autenticação Google. Para testar o formulário localmente, inicie o emulador do Firestore e configure:

```powershell
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8081"
$env:GOOGLE_CLOUD_PROJECT = "landing-local"
npm.cmd start
```

O emulador não está incluído. Sem ele, os envios locais retornam erro de armazenamento, sem confirmação falsa. No Cloud Run, a identidade do serviço é usada automaticamente. Os testes automatizados usam armazenamento em memória e não dependem do Google Cloud.

## Publicar no Google Cloud

[Passo a passo pelo Google Cloud Console com GitHub](DEPLOY_GOOGLE_CLOUD.md), sem CLI ou Docker local. Conecte o repositório ao Cloud Run via Cloud Build, selecionando `/Dockerfile` na raiz e a branch `main`. O Dockerfile executa os testes antes de gerar a imagem de produção; pushes nessa branch publicam novas revisões automaticamente após a configuração no Console.

## Validação e limites

- `npm.cmd test`: vinte e três testes cobrindo validação, rotas, armazenamento, diagnóstico de falhas, estados do formulário, ciclo de aprovação, comportamento guiado por scroll, animação da hipótese, pausa/reinício, movimento reduzido e cálculos. Os testes usam memória e respostas HTTP simuladas; não comprovam conexão com Firestore.
- Verificação em Chrome headless: desktop (1440 px), celular (390 px), movimento reduzido, ausência de rolagem horizontal, transição de aprovação e comportamento guiado por rolagem, e envio do formulário com armazenamento de teste. A inspeção estática também verifica links, IDs e arquivos. O deploy, a gravação em um projeto Google Cloud real e o uso em um celular físico ainda precisam ser verificados.
- Os exemplos visuais são ilustrativos; não há depoimentos, métricas ou resultados de clientes inventados.
- A interface remove rótulos decorativos, endereços fictícios, subtítulos repetidos e instruções redundantes. Permanecem títulos, explicações de valor, controles, rótulos de formulário e legendas necessárias dos gráficos. Estados e contadores da simulação são informados por texto acessível sem competir visualmente. A indicação de dados fictícios fica consolidada em uma única nota legível.
- `visuals.js` controla as camadas de comportamento, a demonstração e a calculadora. A demo separa o problema e a hipótese da prévia do site, que aparece dentro de uma moldura de navegador. A aprovação fica em uma faixa própria. Ao aprovar, o mesmo card desliza para a esquerda e os gráficos aparecem à direita; em telas pequenas ficam empilhados. Abaixo ficam o texto explicativo do ganho e a pergunta sobre o próximo experimento, sem novas opções clicáveis. A simulação usa dados fictícios, permite pausa/reinício, pausa ao sair da aba e respeita movimento reduzido. A demonstração liga vendas a faturamento: 2% para 2,6% significa +0,6 ponto percentual e +30% relativo. Sobre uma base fictícia de R$ 500 mil/mês, projeta R$ 650 mil/mês, ou +R$ 150 mil, mantendo tráfego e ticket médio. A calculadora é independente: inicia em 3% (R$ 750 mil/mês, +R$ 250 mil), usa a mesma base e inclui cenários de queda e de resultado igual. São valores de faturamento bruto; não se calcula ROI sem o custo do investimento. No desktop, atenção, dificuldade e profundidade são guiadas por scroll; até 900px, três botões trocam as camadas e a rolagem não altera a escolha. No celular, a seção conta uma história por swipe nativo e botões: problema, hipótese, aprovação e resultado. Deslizar não autoriza o teste. A mesma simulação e o mesmo gráfico são reutilizados no quarto passo, liberado pela aprovação explícita, com pausa e reinício. Ao voltar ao desktop, os elementos retornam à composição original.
- `story.js` transforma o processo atual em um ciclo de melhoria pelo scroll: um grande interruptor muda a composição e as cores. A troca desliza horizontalmente e a seta percorre cinco etapas; trechos futuros ficam pontilhados e os percorridos ficam contínuos. Hover e foco pausam para explicar; um clique fixa a etapa; outro clique nela ou Escape retoma. O ciclo é ilustrativo e não aprova testes reais. Movimento reduzido mostra a composição final estática. Até 900px, o processo vira uma lista vertical sem pinning ou reprodução automática, com explicações abertas por toque dentro da própria etapa. O hero tem um CTA direto, os campos usam 16px e as legendas redundantes ficam ocultas.
- O servidor limita o corpo do formulário a 8 KB e aceita no máximo 30 tentativas por minuto por instância. Esse limite é uma barreira inicial de volume, não proteção distribuída contra spam. Avalie proteção gerenciada caso apareça abuso.
- Não há bloqueio de provedores pessoais de e-mail: o campo pede e-mail profissional sem excluir proprietários de pequenos negócios que usam outros provedores.
- A tipografia Cabinet Grotesk é carregada de forma não bloqueante pelo Fontshare, com fonte de sistema como alternativa. GSAP 3.13.0 e ScrollTrigger usam jsDelivr; imagens editoriais usam Picsum. Se a rede falhar, a composição local e o ScrollCraft mantêm a leitura e a profundidade, sem bloquear os controles ou o formulário. A cena respeita movimento reduzido. Não há tracking de analytics.
- Os registros de erro da aplicação não incluem os dados enviados. Logs da plataforma são administrados no Google Cloud.
- Cloud Run, Cloud Build, Artifact Registry e Firestore podem gerar cobrança. Limitar instâncias não estabelece um teto de gastos.

## Referências oficiais

- [Deploy de código-fonte no Cloud Run](https://docs.cloud.google.com/run/docs/deploying-source-code)
- [Criar e administrar bancos Firestore](https://docs.cloud.google.com/firestore/native/docs/manage-databases)
- [Identidade da conta de build](https://docs.cloud.google.com/run/docs/configuring/services/build-service-account)
- [API REST para criar documentos Firestore](https://docs.cloud.google.com/firestore/docs/reference/rest/v1/projects.databases.documents/createDocument)
- [Identidade de serviço do Cloud Run](https://docs.cloud.google.com/run/docs/securing/service-identity)

Nenhuma publicação em projeto Google Cloud é feita automaticamente por este repositório.

O posicionamento comercial enfatiza mais faturamento com o mesmo tráfego. Os quatro repasses do processo atual recebem selos vermelhos de calendário (+1 reunião), com um selo resumido na versão mobile.
