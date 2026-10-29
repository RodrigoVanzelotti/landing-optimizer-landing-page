# Verificação da narrativa de otimização contínua

## Resultado entregue

A abertura apresenta otimização contínua sob decisão do cliente. O processo de repasses pode ser trocado por um ciclo explorável de observar, propor, aprovar, testar, decidir e recomeçar. O ciclo acompanha os estados da demonstração real da página: aprovação inicia o teste fictício, o resultado leva à decisão e uma nova hipótese volta à revisão.

Não há ação implícita que aprove testes ou publique o vencedor. A simulação continua com dados fictícios. O formulário mantém nome, e-mail e site; apenas confirma recebimento depois da gravação.

## Evidências

- `npm.cmd test`: 16 testes aprovados. Incluem transição do processo, revisão humana, estados sincronizados, teclado no acordeão, pausa da faixa e regressões de formulário/armazenamento/demos.
- Chrome headless: 1440 × 1000, 390 × 844 e movimento reduzido. Troca de processos, fases do ciclo, acordeão, pausa, aprovação, comparação, próxima hipótese e envio de formulário com armazenamento de teste aprovados.
- Auditoria adicional: 42 posições em sete cenas no desktop e 42 posições em 360 × 640. Título do hero com no máximo três linhas; nenhum overflow horizontal nos pontos amostrados. Leitura visual das duas folhas de contato realizada.
- Sem JavaScript: o ciclo e os conteúdos do método continuam disponíveis em leitura estática. O formulário permanece desabilitado, com instrução; seu método também é POST, evitando dados pessoais na URL.
- Inspeção estática: IDs únicos, referências ARIA e links internos válidos; assets locais presentes. Sintaxe de `story.js` e `motion.js` verificada.
- Os arquivos de engine do ScrollCraft são cópias sem alterações da skill. Rotas e Dockerfile incluem os novos recursos locais.

As capturas de trabalho estão em `.preview/desktop-contact-sheet.png`, `.preview/compact-contact-sheet.png` e nos arquivos `*-hero`, `*-legacy`, `*-continuous` e `*-results`. Esses artefatos e o diretório `design` não entram no upload Cloud Run.

## Limites observados, sem mascarar falhas

O ambiente bloqueou as conexões externas de GSAP/jsDelivr, Fontshare e Picsum. As capturas finais verificam a alternativa local do ScrollCraft, a transição nativa e as fontes/planos de contingência. Não comprovam a aparência da foto editorial, a fonte remota ou a execução de GSAP com CDN disponível.

O código de GSAP usa `matchMedia` para limitar escala/fade e empilhamento a movimento permitido. A carga externa é assíncrona, tem timeout e não bloqueia os controles locais. A alternativa local mantém profundidade no hero e empilhamento com CSS sticky no desktop. Movimento reduzido mantém a leitura estática completa e elimina a faixa em reprodução.

O preflight encontrou Chrome e FFmpeg; Playwright e a chave Kie não estavam disponíveis. Não foram gerados novos bitmaps ou vídeos, nem instaladas dependências para substituir esses itens. A verificação foi feita por Chrome/CDP, com pointer lock e pointer capture desabilitados na automação.

Não foram executados deploy, testes de Firestore real, teste em celular físico ou estudo de usabilidade. A calibração de contraste reforçou legendas e texto secundário; não representa certificação completa de acessibilidade.

## Leitura da composição

O hero comunica agência do cliente; o acúmulo de cartões mostra o custo dos repasses; a troca para o ciclo verde é o maior contraste visual da narrativa. O formulário encerra com um próximo passo concreto. Não foi inserido scroll vazio para criar duração artificial.

Ao revisar as capturas, foram corrigidos: colisão da palavra “Aprender” com o plano de aprovação no hero, módulos fechados do acordeão com espaço pouco útil e texto auxiliar claro demais. A versão compacta foi verificada depois desses ajustes.

Essa leitura é uma avaliação de composição, não uma emoção atribuída a usuários reais. A curva planejada e a autoria das decisões permanecem em [BRIEF.md](BRIEF.md).

## Registro de variação

Primeira entrada no registro local: nenhuma linha histórica para comparar. Gramática, navegação, hero, sequência, fechamento e assinatura estão registrados em `design/FINGERPRINTS.md`. A escolha de gramática própria e a razão para não usar as oito gramáticas existentes estão no briefing.
