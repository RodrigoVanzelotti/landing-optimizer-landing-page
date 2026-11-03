---
name: Landing Optimizer
description: Identidade verde limpa, profissional e orientada à aprovação humana.
colors:
  green: "#174b37"
  lime: "#d6edaa"
  paper: "#fbfcf8"
  ink: "#223b30"
  muted: "#52634f"
  line: "#d5dfcf"
  surface: "#f0f4e8"
  browser: "#fffefa"
  white: "#ffffff"
  calculator: "#1b4831"
  focus: "#73a23e"
  primary-hover: "#0d3827"
typography:
  display:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "clamp(52px,6.2vw,90px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-.03em"
  headline:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "clamp(37px,4.1vw,55px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-.03em"
  body:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  lead:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "18px"
    lineHeight: 1.7
  button:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.5
  field-label:
    fontFamily: "Cabinet Grotesk, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 550
rounded:
  field: "6px"
  button: "8px"
  browser: "12px"
  surface: "16px"
spacing:
  compact: "12px"
  related: "24px"
  columns: "32px"
  scene: "64px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "17px 23px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px"
  browser-card:
    backgroundColor: "{colors.browser}"
    textColor: "{colors.ink}"
    rounded: "{rounded.browser}"
    padding: "30px"
  calculator:
    backgroundColor: "{colors.calculator}"
    rounded: "{rounded.surface}"
    padding: "36px"
---

# Design System: Landing Optimizer

## Overview

**Creative North Star: "Crescimento com o seu sim"**

A identidade verde existente comunica crescimento com clareza e sobriedade. Títulos grandes e diretos, superfícies claras e diagramas de aprovação tornam uma proposta técnica legível para quem dirige um negócio. O contraste entre verde profundo e verde claro organiza ações e decisões.

Esta documentação extrai o sistema implementado em HTML e CSS; o nome acima sintetiza a direção já confirmada, sem representar uma nova escolha de identidade. A composição usa alinhamento editorial e poucos contornos. O movimento explica estados e mantém controles explícitos para aprovação humana.

**Key Characteristics:**

- Verde profundo para ações e contextos de decisão; verde claro para destaque.
- Títulos de leitura direta, com texto de apoio legível.
- Superfícies tonais, contornos discretos e ícones SVG consistentes.
- Fluxo natural no celular e alternativas por toque e teclado.

## Colors

A paleta combina verde de crescimento com neutros vegetais quase brancos; os valores normativos estão no frontmatter.

### Primary

- **Verde profundo** (`green`): botões principais e identidade.
- **Verde claro** (`lime`): seleção, destaques e estados sobre fundos escuros.
- **Verde de calculadora** (`calculator`): superfície escura para explorar cenários.

### Neutral

- **Papel vegetal** (`paper`): fundo geral.
- **Tinta verde** (`ink`): texto principal sobre fundos claros.
- **Folhagem discreta** (`muted`): explicações e texto secundário.
- **Divisória vegetal** (`line`): limites discretos.
- **Superfície clara** (`surface`): agrupamentos e narrativa móvel.
- **Papel de navegador** (`browser`): exemplos de página.
- **Branco** (`white`): campos e texto de botões escuros.

O token `focus` identifica navegação por teclado; `primary-hover` registra o estado de interação do botão. Tonalidades locais do processo e dos gráficos são detalhes do exemplo, não novas cores de marca.

## Typography

**Display Font:** Cabinet Grotesk, com Arial e sans-serif como fallback.
**Body Font:** a mesma família.

A intenção tipográfica é uma grotesca contemporânea, compacta nos títulos e aberta na leitura. Cabinet Grotesk não ficou disponível na captura local; Arial foi o fallback verificado. A fonte continua dependendo de entrega remota. As tentativas de obter o arquivo para hospedagem local falharam por restrição de acesso; a hospedagem local permanece pendente. Esse resultado é uma limitação de entrega da fonte, não uma decisão para substituir a família de marca em novas superfícies.

### Hierarchy

- **Display:** papel do título principal no desktop; em telas médias passa a (52px), e no celular usa `clamp(38px,9.5vw,60px)` com entrelinha (1.08). Até (360px), fixa (38px).
- **Headline:** base de títulos de seção; a introdução do processo usa `clamp(38px,4.2vw,60px)` e (34px) no celular.
- **Body / Lead:** texto geral e explicações destacadas; descrições comerciais mantêm leitura confortável e linha moderada.
- **Button:** peso firme sem caixa alta; a ação do hero móvel usa (16px).
- **Field label:** rótulos explícitos dos campos; nunca substituir rótulos por placeholders.

**The Direct Reading Rule.** Dar prioridade ao título e à explicação útil; não acrescentar microtextos redundantes para preencher espaço.

## Layout

O contêiner principal limita a largura a (1160px), com largura disponível de `calc(100% - 80px)` no desktop. Abaixo de (760px), as margens gerais são (18px) por lado. A reorganização principal ocorre em (900px): hero, demonstração e calculadora passam a composições empilhadas. O hero preserva a composição original centralizada, com ciclo visual de aprovação no desktop e CTA direto ao formulário em todas as larguras. A seção da simulação usa título centralizado, sem subtítulo, seguido pelos cards. O CTA de contato é “Quero faturar mais com meu site”.

A composição mantém seções amplas, títulos alinhados à esquerda e agrupamentos por proximidade. O espaço de seção no desktop é fluido, `clamp(80px,10vw,150px)`; no celular, a regra existente usa (76px). As narrativas fixas no desktop acompanham o scroll; no celular, as seções seguem o fluxo natural e a demonstração usa swipe e botões. Movimento reduzido e ausência de JavaScript possuem apresentação alternativa.

## Elevation & Depth

A camada final usa profundidade sobretudo por cor e contorno. Formulário, exemplos de navegador, resultado e cena de processo removem sombras dos estilos históricos. O pequeno polegar do seletor de processo conserva sombra difusa para indicar controle físico. Não estender sombras históricas de cartões a novos componentes.

## Shapes

Campos têm cantos suaves; botões, uma curva um pouco maior; navegadores e superfícies amplas usam os raios correspondentes do frontmatter. O cabeçalho tem contorno inferior e cantos retos, inclusive no celular. Os indicadores circulares pertencem aos diagramas e estados. Ícones usam SVG com traço arredondado, sem preenchimento, em (24px), com traço (1.8); dentro dos botões usam (20px).

## Components

### Buttons

Ação firme, curta e legível. O botão principal combina verde profundo e branco; o cabeçalho sobre fundo escuro usa botão verde claro. Hover eleva (2px), o estado pressionado reduz a escala a (.98), e foco visível recebe contorno (3px) com afastamento (5px). O formulário mantém altura mínima (56px). A aprovação usa verbo explícito e ícone de confirmação.

### Cards / Containers

Agrupar apenas o que precisa compartilhar estado. Exemplos de navegador usam contorno fino, barra superior discreta e interior claro; o resultado usa superfície verde clara. As explicações da hipótese ficam fora da moldura do navegador. O formulário e a calculadora usam superfícies amplas, sem sombra.

### Inputs / Fields

Campos de e-mail e site usam rótulos persistentes, fundo branco, borda fina, tamanho de texto (16px), altura mínima (49px) no desktop e (54px) no celular, e preenchimento do frontmatter. A borda de foco passa a verde e preserva o contorno de teclado global. Placeholder é auxílio; mensagens de validação, erro e sucesso continuam textuais. A ação envia apenas os dados solicitados.

### Navigation

Marca à esquerda e apenas os links “Quem somos” e “Blog de pesquisas” à direita, sem CTA no menu. Até 900px, um botão hambúrguer de 44px abre os links em uma lista abaixo do cabeçalho. O menu fecha por Escape, clique fora, navegação ou troca de breakpoint; sem JavaScript os links permanecem visíveis. As rotas `/quem-somos` e `/pesquisas` exibem o mesmo placeholder “Em breve”, com retorno à página inicial. O CTA de faturamento permanece no hero.

### Process Toggle

Os rótulos “Processo atual” e “Com Landing Optimizer” são botões selecionáveis. A chave central é um botão com `role="switch"` e `aria-checked`. Cliques saltam para a posição correspondente da narrativa, preservando a transição horizontal e a sincronização com o scroll. Com movimento reduzido, a troca é estática e preserva a seleção manual.

### Signal Controls and Approval Demo

Sinais ativos recebem contraste e indicador; no desktop, botões acessíveis por clique e teclado saltam à fase correspondente da narrativa, mantendo a rolagem sincronizada; os controles móveis têm altura mínima (48px) e estado `aria-pressed`. A aprovação revela a comparação apenas depois da autorização. Swipe, botões e estados acessíveis compartilham a mesma história. Gráficos e números mantêm rótulos e identificação explícita de exemplo fictício. O gráfico de conversão usa eixo Y de 1,5% a 3%, com intervalos de 0,5 ponto percentual; o botão de aprovação se oculta assim que o exemplo começa, sem controle de pausa, preservando “Recomeçar”. A simulação suspende em abas ocultas e retoma ao voltar. O título de faturamento recebe marca-texto verde claro cobrindo toda a altura da frase; ao ficar pelo menos 65% visível, o preenchimento percorre a frase em 1 segundo, uma vez por carregamento. Sem JavaScript ou com movimento reduzido, o destaque é estático, e hipótese/mudança proposta usam ícones SVG de lâmpada e frasco de experimento.

### Fictional Customer Site

A página fictícia da simulação usa neutros discretos: superfície (#fafbf9), texto (#37423b) e botões (#58645c), sem marca adicional. O mesmo estilo aparece nas versões A/B e no mobile. Verde permanece nos controles do Landing Optimizer, separando a página analisada da ação real de aprovação.

### Desktop Scroll Hint

Nas narrativas fixas de processo e sinais, “Role para saber mais” aparece após 10 segundos sem rolagem. Usa seta SVG de 28px, texto de 18px, superfície clara e entrada suave de 800ms; a seta se move discretamente por dois ciclos e depois para. Desaparece ao rolar ou sair da narrativa; abas ocultas reiniciam a espera. Ao clicar, avança à próxima seção e move o foco para ela, com rolagem suave ou imediata para movimento reduzido. Não aparece até 900px e não anima com movimento reduzido.

## Do's and Don'ts

### Do:

- **Do** preservar a identidade verde e a hierarquia direta já implementadas.
- **Do** usar SVG consistente para ícones e manter rótulos, foco e estados acessíveis.
- **Do** manter aprovação humana explícita e exemplos identificados como fictícios.
- **Do** oferecer leitura natural e controles por toque no celular.

### Don't:

- **Don't** acrescentar microtextos redundantes ou decoração de dashboard à página comercial.
- **Don't** substituir o mundo verde existente ou adicionar fotografia aleatória.
- **Don't** apresentar simulações como prova de resultado ou promessa de receita.
- **Don't** prender o scroll móvel para reproduzir a narrativa do desktop.
