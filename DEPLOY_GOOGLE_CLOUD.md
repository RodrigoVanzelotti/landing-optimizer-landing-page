# Publicar a landing page no Google Cloud

O caminho proposto usa **um serviço Cloud Run + um banco Firestore**. Não precisa de banco SQL, chave JSON, servidor separado ou frontend build. O Google Cloud SDK (`gcloud`) deve estar instalado, o projeto deve ter faturamento ativo e sua conta precisa ter permissão para ativar APIs, criar contas de serviço e configurar IAM.

## 1. Instalar as ferramentas e escolher o projeto

1. No [Google Cloud Console](https://console.cloud.google.com/), crie ou selecione um projeto e vincule uma conta de faturamento.
2. Instale a [Google Cloud CLI para Windows](https://docs.cloud.google.com/sdk/docs/install). Feche e reabra o PowerShell após a instalação.
3. Copie o **ID do projeto**, que pode ser diferente do nome exibido no console.
4. Abra o PowerShell na pasta desta landing page:

```powershell
Set-Location "C:\Users\Vanzelotti\Desktop\dev\optimizer workspace v2\landing-optimizer-landing-page"
gcloud --version
```

Os comandos deste guia são para PowerShell. Não é necessário instalar Docker localmente: a imagem será construída pelo Google Cloud. Execute cada comando e confira se terminou sem erro antes de continuar.

## 2. Ativar os serviços

Execute na pasta desta página, substituindo o ID do projeto. Os comandos criam recursos e podem gerar custos.

```powershell
$landingProject = "SEU_PROJECT_ID"
$landingRegion = "southamerica-east1"
gcloud auth login
gcloud config set project $landingProject
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com iam.googleapis.com compute.googleapis.com
```

## 3. Criar ou reutilizar o Firestore

Confira os bancos existentes:

```powershell
gcloud firestore databases list
```

Se o projeto **ainda não tem** um banco Firestore `(default)`, crie-o:

```powershell
gcloud firestore databases create --database="(default)" --location=$landingRegion --type=firestore-native
```

Se já existe, reutilize o banco somente se apropriado para esse projeto. A localização é uma decisão de armazenamento; escolha antes da criação. Para um projeto compartilhado, prefira um projeto dedicado à página para isolar os dados e as permissões.

## 4. Configurar as permissões

Crie uma identidade de execução para o site, sem emitir chaves:

```powershell
gcloud iam service-accounts create landing-page --display-name="Landing Optimizer landing page"
$landingIdentity = "landing-page@${landingProject}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $landingProject --member="serviceAccount:$landingIdentity" --role="roles/datastore.user"
```

A conta de build também precisa do papel Cloud Run Builder. Para o fluxo padrão com a conta Compute Engine do projeto:

```powershell
$landingNumber = gcloud projects describe $landingProject --format="value(projectNumber)"
gcloud projects add-iam-policy-binding $landingProject --member="serviceAccount:${landingNumber}-compute@developer.gserviceaccount.com" --role="roles/run.builder"
```

Se sua organização usa outra conta de build, conceda esse papel à conta escolhida conforme a documentação abaixo. A conta de quem publica precisa das permissões de deploy e de uso da identidade de execução; políticas da organização podem restringir acesso público.

## 5. Publicar a partir desta pasta

```powershell
gcloud run deploy landing-optimizer-landing-page --source . --region $landingRegion --service-account $landingIdentity --allow-unauthenticated --min-instances 0 --max-instances 2 --memory 256Mi --port 8080 --timeout 30
```

O Dockerfile é usado pelo Cloud Build. O comando retorna a URL HTTPS do site. O formulário já usa `/api/leads` nessa mesma URL: não precisa editar endereço de endpoint ou configurar CORS. Nas próximas publicações, execute o mesmo comando de deploy.

## 6. Testar o site e o formulário

Para recuperar a URL e verificar se o servidor responde:

```powershell
$landingUrl = gcloud run services describe landing-optimizer-landing-page --region $landingRegion --format="value(status.url)"
Write-Output $landingUrl
Invoke-RestMethod -Uri "$landingUrl/health"
```

O endpoint deve retornar `ok: True`. Ele verifica o servidor; confirme a conexão com o Firestore enviando o formulário:

1. Abra a URL retornada, envie um pedido de teste e confira a mensagem de confirmação.
2. No Google Cloud Console, abra **Firestore → banco `(default)` → Dados → `landing_leads`**. Confirme nome, e-mail, site e data.
3. Entre em contato pelo e-mail enviado para combinar a conversa. Marque o status do registro no console conforme seu processo.
4. Antes de divulgar a página, defina quem acompanhará os pedidos, o prazo de retenção e o canal para solicitações sobre dados pessoais. Ajuste o aviso junto ao formulário à operação real da empresa.

Use IAM para restringir acesso administrativo aos leads. O navegador nunca acessa o Firestore diretamente. Não habilite regras públicas de leitura/escrita no banco para este site. A identidade de servidor usa credenciais automáticas do Cloud Run.

**Importante:** o site registra um pedido de conversa. Não há agendamento de horário, envio automático de e-mail ou notificação ao responsável. Consulte os pedidos no Firestore e responda ao interessado.

## 7. Publicar alterações

Edite os arquivos e execute novamente o comando do passo 5 na mesma pasta. O Cloud Run criará uma nova revisão do serviço, mantendo a URL e os dados no Firestore.

Se abriu outro PowerShell, redefina as variáveis antes:

```powershell
$landingProject = "SEU_PROJECT_ID"
$landingRegion = "southamerica-east1"
$landingIdentity = "landing-page@${landingProject}.iam.gserviceaccount.com"
gcloud config set project $landingProject
```

Não é necessário recriar o banco ou as contas de serviço em cada publicação.

## 8. Resolver problemas comuns

| Situação | O que verificar |
| --- | --- |
| `gcloud` não é reconhecido | Confirme a instalação da CLI e reabra o terminal. |
| Erro de faturamento | Vincule o projeto a uma conta de faturamento ativa. |
| `PERMISSION_DENIED` | Confira a conta em `gcloud auth list` e o projeto em `gcloud config get-value project`. A preparação exige permissões para ativar APIs e administrar IAM; as permissões de deploy estão nas referências oficiais abaixo. |
| Build falha por permissão | Confira a conta usada no histórico do Cloud Build e conceda a ela `roles/run.builder`. A identidade usada pode variar entre projetos. Permissões recém-concedidas podem levar alguns minutos para propagar. |
| Banco ou conta de serviço já existe | Confira o recurso e pule a criação correspondente. Não exclua recursos para repetir o tutorial. |
| Página exige login Google | Confira o acesso público do serviço. Políticas da organização podem impedir `--allow-unauthenticated`. |
| Página abre, mas formulário falha | Confirme banco `(default)` em modo nativo, API do Firestore ativa e papel `roles/datastore.user` na identidade do serviço. Não configure `FIRESTORE_EMULATOR_HOST` em produção. |
| Pedido recebido, mas nenhum e-mail chega | Os pedidos ficam no Firestore; não há notificação automática. Consulte a coleção e contate o interessado. |

Consulte os logs do serviço com:

```powershell
gcloud run services logs read landing-optimizer-landing-page --region $landingRegion --limit 50
```

A aplicação não inclui os dados do formulário nos logs de erro. Para problemas de construção da imagem, confira também o histórico do Cloud Build no console.

## Custos e operação

- Cloud Run, Cloud Build, Artifact Registry e Firestore podem gerar cobrança. Configure alertas de orçamento no console; alertas não bloqueiam gastos automaticamente.
- O comando usa zero instâncias mínimas e no máximo duas instâncias. A primeira visita após inatividade pode levar mais tempo para carregar. O limite de instâncias não é um teto financeiro.
- O limite atual de envio é de 30 tentativas por minuto por instância. Se houver spam, complemente a proteção.
- Defina quem acompanhará os pedidos e por quanto tempo os dados serão mantidos.

## Referências oficiais

- [Instalar a Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install)
- [Deploy a partir do código-fonte](https://docs.cloud.google.com/run/docs/deploying-source-code)
- [Conta de serviço usada no build](https://docs.cloud.google.com/run/docs/configuring/services/build-service-account)
- [Criar e administrar bancos Firestore](https://docs.cloud.google.com/firestore/native/docs/manage-databases)
- [Identidade de execução do Cloud Run](https://docs.cloud.google.com/run/docs/securing/service-identity)

Os comandos não foram executados em um projeto Google Cloud durante a elaboração deste guia.

