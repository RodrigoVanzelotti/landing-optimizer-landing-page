# Publicar pelo Google Cloud Console com GitHub

Este guia usa o navegador, sem Google Cloud CLI, Cloud Shell ou Docker local. O fluxo é **GitHub → Cloud Build → Cloud Run**, com contatos salvos no **Firestore**. O Console cria o gatilho e a configuração de build; o repositório fornece o `Dockerfile`.

## 1. Enviar esta versão ao GitHub

O repositório configurado é [RodrigoVanzelotti/landing-optimizer-landing-page](https://github.com/RodrigoVanzelotti/landing-optimizer-landing-page), na branch `main`.

Faça commit e push das alterações usando sua ferramenta Git habitual. Arquivos que estão somente no computador não chegam ao Google Cloud. Confira se a raiz do GitHub contém:

```text
Dockerfile
.dockerignore
package.json
server.mjs
index.html
styles.css, story.css, process.css
script.js, visuals.js, story.js, motion.js
favicon.svg
assets/
test/
```

O caminho será **`/Dockerfile`**, com contexto na raiz. Não use o caminho Windows nem `/landing-optimizer-landing-page/Dockerfile`: este é um repositório independente.

O Dockerfile executa os testes antes de produzir a imagem de execução. Uma falha interrompe a construção. A imagem final inclui apenas servidor e arquivos públicos, executados como usuário sem privilégios. Não há instalação de dependências npm.

## 2. Preparar o projeto

1. Abra o [Google Cloud Console](https://console.cloud.google.com/) e crie ou selecione o projeto. Anote seu **ID**, diferente do nome de exibição.
2. Em **Faturamento / Billing**, vincule uma conta de faturamento.
3. Em **APIs e serviços → Biblioteca**, ative: **Cloud Run Admin API**, **Cloud Build API**, **Artifact Registry API**, **Cloud Firestore API** e **Identity and Access Management (IAM) API**. Habilite também serviços adicionais solicitados pelo assistente.
4. Prefira um projeto dedicado à landing page para separar contatos e permissões dos demais produtos.

Sua conta precisa poder ativar serviços, criar banco e identidades, configurar IAM e conectar o GitHub. Se houver bloqueio, peça ao administrador a permissão indicada; não transforme as contas da aplicação em Owner. Veja as permissões de publicação no [guia oficial](https://docs.cloud.google.com/run/docs/quickstarts/deploy-continuously).

## 3. Criar o Firestore

1. Busque **Firestore** no Console e abra **Bancos de dados / Databases**.
2. Se não existir, clique em **Criar banco de dados**: edição **Standard**, ID **`(default)`**, modo **Firestore Native**. A aplicação usa esse ID.
3. Selecione regras iniciais **Restritivas / Restrictive** quando a opção aparecer. O navegador não acessa o banco diretamente.
4. Escolha a localização antes de criar. Para esta operação no Brasil, use `southamerica-east1` (São Paulo), se disponível.
5. Conclua. O primeiro envio cria a coleção `landing_leads` automaticamente.

Se `(default)` já existe, confira modo, localização e adequação antes de reutilizar. Não apague um banco para repetir o tutorial. [Referência da criação pelo Console](https://docs.cloud.google.com/firestore/native/docs/manage-databases).

## 4. Criar a identidade do site

1. Abra **IAM e administrador → Contas de serviço → Criar conta de serviço**.
2. Use o nome `landing-page`.
3. Na concessão de acesso ao projeto, selecione **Cloud Datastore User** (`roles/datastore.user`).
4. Conclua e anote o e-mail: `landing-page@SEU_PROJECT_ID.iam.gserviceaccount.com`.

Não crie chaves JSON. Essa conta será a identidade de execução do Cloud Run, com credenciais automáticas. O código obtém o ID do projeto pela infraestrutura do Google; não precisa de Firebase config nem senha no repositório.

A identidade do site deve ser diferente da conta que constrói/publica a imagem. Ela precisa acessar os contatos, não administrar o Cloud Run.

## 5. Conectar GitHub e configurar o build

1. Abra **Cloud Run → Serviços → Conectar repositório / Connect repo**. Em algumas interfaces, a opção aparece em **Criar serviço / Deploy container → Implantar continuamente de um repositório**.
2. Selecione **Cloud Build → Configurar com Cloud Build / Set up with Cloud Build**.
3. Autentique no GitHub e autorize o aplicativo solicitado apenas para este repositório. Organizações podem exigir aprovação do administrador.
4. Selecione `RodrigoVanzelotti/landing-optimizer-landing-page` e confirme o consentimento de integração.
5. Em **Branch**, use **`^main$`** para publicar apenas a branch principal.
6. Em **Build type**, selecione **Dockerfile**.
7. Em **Source location / Local do código-fonte**, informe **`/Dockerfile`**. Se houver campo separado de contexto, mantenha a raiz (`.`).
8. Salve e volte ao formulário do serviço. Anote a **conta de serviço de build** apresentada, se houver; caso contrário, consulte-a no gatilho após a criação.

Não selecione Buildpacks ou função. Não precisa criar `cloudbuild.yaml` nem GitHub Actions: o assistente mantém a configuração do gatilho. [Referência da configuração com Dockerfile](https://docs.cloud.google.com/run/docs/continuous-deployment).

## 6. Configurar o serviço e publicar

No formulário de criação, use:

| Campo | Valor |
| --- | --- |
| Nome | `landing-optimizer-landing-page` |
| Região | `southamerica-east1` (São Paulo) |
| Autenticação | **Permitir acesso público / Allow public access** |
| Entrada de tráfego / Ingress | **Todos / All** |
| Cobrança | Baseada em solicitações / Request-based |
| Instâncias mínimas | `0` |
| Instâncias máximas | `2` |
| CPU | `1` vCPU |
| Memória | `256 MiB` |
| Porta do contêiner | `8080` |
| Timeout de solicitação | `30` segundos |
| Conta de serviço de execução | `landing-page@SEU_PROJECT_ID.iam.gserviceaccount.com` |

Expanda **Contêineres, volumes, rede e segurança** para encontrar as opções do contêiner e a identidade. Deixe comando e argumentos vazios: o Dockerfile inicia o servidor. Não configure `PORT` manualmente; o Cloud Run a fornece. Não configure `FIRESTORE_EMULATOR_HOST` ou `GOOGLE_APPLICATION_CREDENTIALS` em produção.

Clique em **Criar** e acompanhe o link do build até a revisão ficar pronta. O assistente pode solicitar permissões para a identidade de build; confira o próximo passo se houver falha de build ou deploy.

A opção [Allow public access](https://docs.cloud.google.com/run/docs/authenticating/public) desativa a verificação IAM do invocador. O Firestore continua privado. Políticas da organização podem restringir essa configuração.

## 7. Conferir a identidade de build

A conta de build varia por projeto. **Não deduza seu e-mail de exemplos de outros tutoriais.** Em **Cloud Build → Gatilhos / Triggers**, selecione a região da integração e edite o gatilho da landing page. Consulte **Service account**; os detalhes do build também mostram a identidade utilizada.

Se o assistente ainda não concedeu as permissões:

1. Em **IAM e administrador → IAM → Conceder acesso**, use o e-mail exato dessa conta e conceda no projeto **Cloud Build Service Account** (`roles/cloudbuild.builds.builder`) e **Cloud Run Admin** (`roles/run.admin`). O primeiro cobre construção, artefatos e logs; o segundo permite publicar revisões. O papel de build tem acesso amplo a artefatos do projeto; use o projeto dedicado sugerido no passo 2.
2. Em **Contas de serviço → landing-page → Principais com acesso / Principals with access → Conceder acesso**, adicione a conta de build com **Service Account User** (`roles/iam.serviceAccountUser`). Conceda esse acesso na conta `landing-page`, sem estendê-lo a todas as identidades do projeto.
3. Se sua conta de operador não conseguir selecionar uma identidade ou executar o gatilho, o administrador também deve conceder a ela **Service Account User** na identidade correspondente, além das permissões para operar Cloud Build e Cloud Run.
4. Aguarde a propagação. Em **Cloud Build → Gatilhos → Executar / Run**, selecione `main`, confira o commit e acompanhe o novo build.

Não conceda **Cloud Build Service Agent** a uma conta de execução comum. O papel `roles/run.builder` do antigo fluxo por upload de código-fonte não substitui as permissões deste gatilho Docker com deploy.

Referências: [papel de build](https://docs.cloud.google.com/build/docs/cloud-build-service-account) e [publicação usando uma identidade específica](https://docs.cloud.google.com/run/docs/manually-set-up-continuous-deployment).

## 8. Verificar a publicação e os contatos

1. Em **Cloud Run → landing-optimizer-landing-page**, abra a URL HTTPS exibida em janela anônima. Não deve exigir login Google.
2. Abra `https://SUA_URL.run.app/health` no navegador: deve retornar `{"ok":true}`. Isso confirma o servidor, não a conexão com o banco.
3. Envie e-mail e site de teste no formulário. O sucesso só aparece depois da gravação.
4. Em **Firestore → (default) → Dados**, abra `landing_leads` e confira `email`, `website`, `createdAt` e `status`. Novos registros não possuem `name`; não é necessário migrar os contatos existentes.
5. Confira no Cloud Run se a revisão utiliza a identidade `landing-page`.

A página e `POST /api/leads` usam a mesma origem; não há URL de endpoint ou CORS para configurar. Mantenha regras do Firestore restritivas e controle o acesso administrativo aos contatos por IAM.

**O formulário registra um pedido de conversa.** Não há escolha de horário, envio automático de e-mail nem notificação. Defina quem consultará os contatos e responderá, além do prazo de retenção e do canal para solicitações sobre dados pessoais.

## 9. Atualizar e voltar a uma versão anterior

Depois da integração, cada push em `main` dispara teste, build e deploy. Revise as mudanças antes de incorporá-las nessa branch. Acompanhe **Cloud Build → Histórico** e **Cloud Run → Revisões**; a URL permanece. Falhas nos testes impedem a nova imagem e preservam a revisão publicada.

Para republicar sem outro commit, use **Cloud Build → Gatilhos → Executar**, conferindo branch e commit. Não recrie serviço ou banco.

Para voltar temporariamente a uma versão boa, abra **Cloud Run → Revisões → Gerenciar tráfego** e direcione 100% para a revisão escolhida. Depois reverta a alteração no GitHub; o próximo deploy pode direcionar o tráfego para a nova revisão. O rollback da página não apaga os contatos.

Se já existe um serviço criado pelo fluxo antigo, abra-o e procure **Configurar/Editar implantação contínua** para associar o repositório ao mesmo serviço. Preserve região, identidade e banco; confira acesso público e as opções da tabela. Evite criar outro serviço sem necessidade.

## Problemas comuns

| Sintoma | Onde conferir e como resolver |
| --- | --- |
| GitHub não lista o repositório | Confira a conta GitHub e a autorização do aplicativo para este repositório. Organizações podem exigir aprovação. |
| Dockerfile, testes ou arquivos não encontrados | Confira commit enviado, `main`, `/Dockerfile` e contexto na raiz. `test/` precisa estar no GitHub e permitido no `.dockerignore`. |
| Build mostra teste falhando | Abra o log e corrija teste ou implementação. Não remova a verificação para publicar. |
| Build/deploy retorna `PERMISSION_DENIED` | Confira a identidade efetiva do gatilho e o passo 7. Construir e executar o site são identidades diferentes. |
| Página pede login ou retorna 403 | Cloud Run → serviço → Segurança → Permitir acesso público; confira Ingress. Políticas organizacionais podem exigir intervenção do administrador. |
| Contêiner não inicia | Confira logs, porta 8080 e comando/argumentos vazios. O servidor escuta em `0.0.0.0` e respeita a porta do Cloud Run. |
| Site abre, mas formulário falha | Confira API do Firestore, `(default)` Native, identidade `landing-page` com `roles/datastore.user` e ausência de variáveis de emulador. Veja logs do serviço. |
| Envio retorna 429 | Limite de 30 tentativas por minuto por instância. Aguarde; avalie proteção adicional se houver abuso. |
| Nenhum e-mail chega | Consulte `landing_leads`; não há notificação automática. |
| Push não publica | Confira gatilho habilitado, região, conexão GitHub e expressão `^main$`. |

Logs de build: **Cloud Build → Histórico → build → Logs**. Logs do site: **Cloud Run → serviço → Logs**. A aplicação não inclui formulários nas mensagens de erro.

## Custos e limites da verificação

Cloud Run, Cloud Build, Artifact Registry e Firestore podem gerar cobrança. Configure orçamento e alertas em **Faturamento → Orçamentos e alertas**; eles não impõem teto automático. Zero instâncias mínimas reduz recursos ociosos, mas a primeira visita pode carregar mais devagar. Duas instâncias máximas não limitam todos os custos do projeto.

O guia foi conferido com a documentação oficial. A criação dos recursos, autorização do GitHub e gravação no Firestore real precisam ser verificadas no seu projeto. Nomes de menus podem variar com o idioma e atualizações do Console.
