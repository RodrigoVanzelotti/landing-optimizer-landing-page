# Landing Optimizer — página comercial

Landing page em português brasileiro para donos de negócios digitais. HTML, CSS e JavaScript sem etapa de build ou dependências npm. O mesmo servidor Node.js entrega a página e recebe o formulário em `POST /api/leads`. A gravação usa a API REST oficial do Firestore e a identidade do Cloud Run.

## O que acontece com o formulário

Nome, e-mail e site são validados no servidor e gravados na coleção `landing_leads`, com data e status `new`. O navegador só confirma o pedido após a gravação. Os leads não ficam disponíveis em nenhum endpoint público. Não há armazenamento de leads no navegador ou em arquivos locais.

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

[Passo a passo para publicar no Google Cloud](DEPLOY_GOOGLE_CLOUD.md).

## Validação e limites

- `npm.cmd test`: dezessete testes de validação, rotas públicas, gravação, falha de armazenamento, limite de volume, estados do formulário, troca do processo, ciclo sincronizado com a demo, acordeão por teclado, pausa da faixa, seletores visuais, linha do tempo e novas hipóteses com nova aprovação, aprovação/pausa/reinício da demonstração, movimento reduzido e cálculo de cenários positivos e negativos. Os testes usam memória e respostas HTTP simuladas; não comprovam conexão com Firestore.
- Verificação em Chrome headless: desktop (1440 px), celular (390 px), movimento reduzido, ausência de rolagem horizontal, seletores de cenários e comportamento guiado por rolagem, e envio do formulário com armazenamento de teste. A inspeção estática também verifica links, IDs e arquivos. O deploy, a gravação em um projeto Google Cloud real e o uso em um celular físico ainda precisam ser verificados.
- Os exemplos visuais são ilustrativos; não há depoimentos, métricas ou resultados de clientes inventados.
- `visuals.js` controla o gráfico selecionável, as camadas de comportamento, a demonstração de experimento e a calculadora. Após aprovar a demo, o visitante pode explorar um gráfico contínuo de taxa de cadastro, com as duas curvas variando e sem controle de dias, ver o comparativo percentual e preparar um dos próximos experimentos fictícios. Cada novo exemplo exige aprovação. Todos os experimentos demonstrativos terminam com ganho positivo; o FAQ esclarece que testes reais negativos ou inconclusivos também geram aprendizado. Não envia eventos de analytics. A simulação de experimento começa por ação do visitante, permite pausa e reinício e pausa ao sair da aba; com movimento reduzido, exibe o resultado do exemplo diretamente. Todo número é fictício ou uma conta explicitamente hipotética. O exemplo principal explica a passagem de 2% para 3%: +1 ponto percentual na taxa e +50% de cadastros para o mesmo tráfego. As camadas de atenção, dificuldade e profundidade mudam com o scroll; com movimento reduzido, a leitura permanece estática com resumos das três camadas.
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
