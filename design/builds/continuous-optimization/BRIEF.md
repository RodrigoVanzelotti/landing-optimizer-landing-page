# Brief de direção: o site que continua evoluindo

Brief consolidado a partir das decisões já dadas pelo usuário. A composição e a coreografia são decisões de implementação; não são respostas inventadas de uma entrevista.

## Evidência e direção

- Público: donos de negócios digitais e responsáveis por marketing. Português brasileiro, verdes limpos, pouco texto e demonstrações interativas, conforme pedidos anteriores.
- Objetivo: “não somos apenas uma plataforma de métricas, mas sim uma otimização constante do site do cliente através de mudanças que o cliente testa e autoriza”.
- Referência fornecida: withsherpa.ai. Princípio observado: demonstrações operáveis explicam o produto melhor que parágrafos ou provas sociais inventadas.
- Jornada solicitada: representar o processo atual de decisão e como a plataforma quebra esse processo. Fonte principal: `WHAT_WE_WANT_TO_SELL.md`.
- Energia: abertura calma, tensão no acúmulo de repasses, alívio ao fechar o ciclo, controle na aprovação, intenção na conversa. Decisão de implementação baseada na jornada solicitada.
- Momento memorável: “a fila de reuniões virou um ciclo de melhoria que só avança com meu sim”.
- Assinatura: trocar entre o processo de repasses e um ciclo operável que destaca o papel humano; o estado da demo de aprovação/teste alimenta esse ciclo.
- Estilo: premium limpo e orientado ao produto. Sem identidade de marca rígida, conforme autorização anterior.
- Estrutura: cenas distintas. AIDA, sem voo contínuo ou scroll aprisionado. O fluxo antigo se acumula; o novo fecha um loop.
- Recursos: página, demos e formulário existentes. Não há fotos de clientes, depoimentos ou métricas reais fornecidos. Imagens editoriais não serão apresentadas como equipe ou clientes.

## Seleção determinística gpt-taste

Seed: 597 caracteres do pedido. Saída de Python executada antes de qualquer alteração de UI:

- Hero: Cinematic Center. Tipografia: Cabinet Grotesk.
- Componentes: Infinite Marquee, Horizontal Accordions, Inline Typography Images.
- GSAP: Card Stacking; Image Scale and Fade.

A faixa usará etapas reais do método, sem logos ou depoimentos fictícios, com pausa. A imagem dentro da tipografia será uma miniatura editorial, sem alegação de prova social. O acordeão será operável por teclado e toque.

## Curva de sentimento, antes do roteiro

1. Curiosidade: uma promessa curta de evolução contínua, com profundidade entre a imagem de fundo, o ciclo e o texto.
2. Reconhecimento: o visitante abre os repasses que reconhece na própria operação.
3. Tensão: análise, reunião, criação e implementação se empilham; a página permanece esperando.
4. Alívio e controle (pico): o botão que rompe a fila abre o ciclo e destaca a aprovação obrigatória.
5. Confiança: o visitante aprova um exemplo, acompanha seu objetivo e decide qual hipótese preparar depois.
6. Intenção: uma conversa sobre o próprio site, com os três campos já pedidos.

Frase para contar a alguém: “É o site onde você transforma uma fila de reuniões em um ciclo de testes que você autoriza.”

## Gramática: decisão guiada

Nova gramática permitida pela skill: navegação de marketing e abertura centrada; comparação operável no interesse; sequência de repasses em fluxo natural; resolução em loop operável; demo aprovada pelo visitante e fechamento com formulário real. Não é uma página de app, filme ou catálogo.

Proibições: estatísticas no hero, publicação automática, pinning global, falsas equipes/clientes, nenhum passo essencial escondido por falha de GSAP. Mobile usa leitura vertical e controles de toque. Redução de movimento elimina scrub/stack/parallax e apresenta os estados completos.

As oito gramáticas existentes não descrevem o conjunto: one-shot/worldflight removem a navegação livre; editorial/poster priorizam leitura; live-surface exclui marketing; catálogo exige objetos; split-stage exige duas colunas persistentes; cutlist prioriza cortes rápidos. Aqui a comparação é um capítulo e o fechamento é uma conversa, não o colapso de uma tela dividida.

## Roteiro e dispositivos

| Jornada | Dispositivo | Por quê |
| --- | --- | --- |
| Atenção | Camadas e escala/fade de mídia | Profundidade discreta, promessa sem números |
| Reconhecimento | Acordeão horizontal | O visitante explora os repasses |
| Tensão | Empilhamento GSAP em fluxo natural | O custo está no acúmulo de coordenação |
| Resolução, pico | Wipe e loop interativo | A mudança de método fica visível e exige ação |
| Desejo | Gráfico e reprodução sob aprovação | Demonstra o efeito e o próximo aprendizado |
| Ação | Formulário estável | Resolve o argumento no próprio negócio |

## Camadas do hero

Fundo editorial, baixo contraste, move menos; ciclo vetorial intermediário, deslocamento sutil; conexão/linha em primeiro plano, deslocamento distinto; texto e CTAs permanecem estáveis. Nenhuma pessoa recortada ou elemento com contato físico a preservar. No celular, o ciclo vem abaixo da promessa e não disputa espaço com o título.

## Escopo e limites

Arquivos afetados: HTML, CSS, motion/story JS, integração de estados da demo, servidor de arquivos/CSP, Dockerfile, testes e documentação. Formulário e persistência mantêm o contrato nome/e-mail/site. Não publicar nem criar recursos cloud nesta tarefa.

As capacidades descritas representam o fluxo proposto no resumo do usuário, demonstrado com dados fictícios. Não alegar disponibilidade comercial, ganhos garantidos, aprovação dispensável, vencedor automático ou implementação definitiva no código-fonte.

## Fingerprint

Registro inicialmente vazio: nenhuma linha anterior a comparar. A nova entrada será adicionada após a verificação. A revisão mantém a identidade do produto existente; não se apresenta como outro produto só para satisfazer variação.

## Verificação planejada

Capturas no início, meio e fim das cenas em desktop, 390 px, 360 px e movimento reduzido. Sem pointer lock/capture. Testar a troca do processo, fases do ciclo, acordeão por teclado, pausa da faixa, aprovação/revisão, próximos experimentos, formulário e falha de biblioteca externa. Os exemplos numéricos continuam explicitamente fictícios, conforme pedido do usuário.

## Revisão mobile autorizada

Pedido: simplificar dobras dependentes de scroll e remover subtítulos desnecessários e textos miúdos. Decisão: até 900px, leitura em fluxo normal, processo em cinco etapas verticais com explicação por toque e três controles explícitos para os sinais. Desktop preserva a narrativa guiada por scroll. O hero mobile tem um CTA direto; a prévia A fica compacta, a aprovação leva ao gráfico e as notas de dados fictícios permanecem. Corpo principal 16–18px, campos 16px e controles principais com pelo menos 44px. Fontes técnicas: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum e https://web.dev/learn/forms/design-basics.
