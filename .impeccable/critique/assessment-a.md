# Assessment A — revisão independente de design

Método: subagente independente A; avaliação de design concluída sem acesso a detector ou Assessment B.
Alvo: `landing-optimizer-landing-page/index.html`. Inspeção de código e navegador Chrome/CDP, nova aba, desktop 1440 × 1000 e mobile 390 × 844. Capturas em `.impeccable/critique/baseline-a/`.

## Veredito de especificidade

O produto já tem um argumento visual próprio: o ciclo interrompido pela aprovação humana, a fila de reuniões e a demonstração de uma hipótese ligam forma e função. A identidade verde é coerente, sóbria e reconhecível. Ainda assim, os grandes títulos centralizados, as alternâncias entre superfícies creme/verde e os mockups de navegadores com blocos vazios poderiam servir a qualquer SaaS de marketing. A oportunidade não é adicionar decoração: é fazer o mesmo caso de negócio atravessar sinais → hipótese → aprovação → comparação → decisão, com números e limitações evidentes. Hoje as seções contam partes relacionadas, mas cada uma reinicia o contexto.

## Saúde do design

Escala 0–4: maior é melhor; n/a para heurísticas sem aplicação relevante nesta página persuasiva.

| # | Heurística | Nota | Evidência |
|---|---|---:|---|
| 1 | Visibilidade do estado | 3 | Demonstração anuncia fases e progresso; formulário tem envio/sucesso/erro. O progresso mobile é só visual para quem enxerga, e a natureza fictícia não acompanha os números finais. |
| 2 | Correspondência com o mundo real | 3 | Receita e aprovação humana são compreensíveis; “Agendar conversa” promete um agendamento que ainda será combinado por e-mail. |
| 3 | Controle e liberdade | 2 | Mobile tem abas, voltar e reiniciar; desktop depende de rolagem para alterar o processo e os sinais, apesar de affordances de seleção. |
| 4 | Consistência e padrões | 2 | O grande desenho de switch não é um controle; itens de sinais parecem seletores, mas no desktop são `li` sem ação. Os controles mobile correspondentes são botões reais. |
| 5 | Prevenção de erros | 3 | Campos obrigatórios, e-mail nativo, validação de site e bloqueio de envio repetido. A calculadora permite cenários menores, mas não explica todas as premissas da projeção junto aos números. |
| 6 | Reconhecimento em vez de memória | 3 | Botões e campos rotulados; a demonstração concretiza a proposta. Depois dela, a calculadora volta a 3% sem dizer claramente que é outra simulação. |
| 7 | Flexibilidade e eficiência | n/a | Landing page persuasiva; aceleradores não são necessários ao pedido de conversa. |
| 8 | Estética e minimalismo | 3 | Hierarquia e cores funcionam; desktop repete benefício e enquadra a demonstração em muitas camadas de UI. |
| 9 | Reconhecer e recuperar de erros | 3 | Código preserva dados no erro, informa correção de site/conexão e permite repetir. Inspeção do código; falhas remotas reais não foram provocadas. |
| 10 | Ajuda e documentação | n/a | A superfície não precisa de documentação de produto. O FAQ já oferece esclarecimento antes do contato. |
| Total | | **22/32 — aceitável, 68,75%** | As fraquezas são de confiança e interação, não uma quebra do fluxo principal. |

## O que funciona

1. A promessa “Mais faturamento. Com o mesmo tráfego.” chega em segundos. A tipografia grande e o contraste da hero eliminam a necessidade de procurar a proposta.
2. Aprovar antes de testar é visível na hero e demonstrado no experimento. Isso transforma uma preocupação de risco em parte reconhecível da marca.
3. A adaptação mobile já evita os pins e faixas de rolagem prolongadas do desktop. Há fluxo vertical comum, controles de sinais de 48 px, formulário de apenas dois campos e um experimento dividido em passos legíveis.

## Prioridades

### [P1] O dinheiro parece mais comprovado e personalizado do que é

O resultado final renderizado mostra +R$ 150.000/mês e R$ 500.000 → R$ 650.000 sem manter o aviso “base fictícia” que existia antes da atualização. No mobile, o parágrafo do desfecho com condições é ocultado. A calculadora diz “Hoje, com 2%” e “por mês que você poderia estar deixando na mesa”, embora não conheça dados do visitante; `aria-describedby="revenue-assumptions"` aponta para um elemento inexistente. Não há resultados reais fornecidos pelo negócio para sustentar esse enquadramento.

**Por que importa:** quem compra uma solução de otimização precisa separar prova, hipótese e ilustração. O cálculo pode estar aritmeticamente certo e ainda transmitir certeza indevida.

**Correção:** uma única linha visível e legível junto ao resultado: “Cenário fictício, com mesmo tráfego e ticket médio; não é previsão de resultado.” Dar à calculadora um título “Explore outro cenário” e base “Exemplo: R$ 500 mil/mês, conversão de 2%”. Preservar as notas quando o resultado mudar; eliminar a linguagem de perda personalizada. Manter 2% → 2,6% = +30% e R$ 650 mil na demonstração; 3% = R$ 750 mil continua cenário independente. A conclusão deve ser “Você decide se a mudança fica”, seguida de uma CTA de conversa, em vez de terminar só com pergunta retórica sobre próximo experimento.

**Comandos adequados:** `impeccable clarify`, `impeccable harden`.

### [P1] A CTA pede agendamento, mas entrega um pedido de contato

Header, hero e formulário dizem “Agendar conversa”. O formulário não escolhe dia nem horário. Só depois de enviar, a mensagem esclarece “A conversa ainda não está agendada”.

**Por que importa:** a pequena quebra de expectativa acontece exatamente no momento em que o visitante entrega seu e-mail. O fluxo deveria parecer previsível.

**Correção:** usar “Solicitar conversa” nas CTAs e “Vamos entrar em contato por e-mail para combinar o horário” junto ao formulário. Duas entradas continuam suficientes; não criar calendário nem campos extras. A confirmação pode ser curta e positiva porque a expectativa já foi alinhada antes do envio.

**Comando adequado:** `impeccable clarify`.

### [P2] O desktop mostra controles que não oferecem controle

O grande switch “Processo atual / Com Landing Optimizer” é `role="img"`, com transição só pela rolagem. Os três sinais no desktop parecem opções selecionáveis, mas são itens de lista governados pelo scroll. No mobile, o mesmo conteúdo tem botões e accordions reais. São duas gramáticas de interação para o mesmo conceito.

**Por que importa:** quem tenta selecionar “Onde aparece dificuldade” ou ativar o switch não recebe resposta; quem lê com atenção compete com o movimento da página. O processo ocupa 240svh e a página desktop totalizou cerca de 9990 px no viewport de teste.

**Correção:** tornar os três sinais botões também no desktop e reduzir o switch a uma comparação claramente editorial ou oferecer dois botões reais “Hoje / Com Landing Optimizer”. Preservar a animação como reforço opcional, com a leitura completa disponível sem cumprir uma sequência de rolagem. Não reintroduzir pins no mobile.

**Comandos adequados:** `impeccable adapt`, `impeccable layout`.

### [P2] O experimento desktop gasta altura explicando antes de deixar comparar

Na captura desktop, o cartão A tem título e mockup, enquanto B empilha problema, hipótese e mockup. O conteúdo real a comparar não se alinha, e o botão de aprovação fica abaixo do primeiro viewport da seção. “Objetivo: mais vendas e faturamento” apenas repete o título. O resultado troca a composição sem uma passagem editorial forte para a decisão de manter a mudança.

**Por que importa:** o momento que deveria demonstrar o produto é o que mais parece um conjunto de painéis. A recompensa de ver a receita vem depois de procurar o botão e esperar a simulação.

**Correção:** apresentar problema e hipótese em uma frase acima do par A/B, alinhar as duas prévias, colocar uma única aprovação logo abaixo. Usar o resultado financeiro como pico, com premissas próximas e conclusão explícita sobre a decisão humana. Retirar a linha redundante de objetivo. No mobile, manter os passos com botões de 44 px e fluxo vertical sem captura de gestos verticais.

**Comandos adequados:** `impeccable distill`, `impeccable layout`.

## Carga cognitiva

**Moderada, 3 de 8 falhas:**

- Foco único: passa; pedir conversa é a única ação comercial.
- Chunking ≤4: falha pontual; processo mostra cinco etapas exploráveis e o FAQ seis perguntas irmãs.
- Agrupamento: passa; conjuntos são reconhecíveis por proximidade e superfícies.
- Hierarquia: passa; títulos, receita e botões têm peso distinguível.
- Uma coisa por vez: falha no desktop; ler argumentos, perceber scroll e acompanhar mudança automática competem.
- Escolhas mínimas: passa para conversão; a única violação secundária são cinco nós de processo, e seis perguntas do FAQ. Isso não justifica esconder ou remover conteúdo útil.
- Memória de trabalho: falha; visitante precisa distinguir a demonstração 2,6% da calculadora 3% sem uma transição explícita.
- Divulgação progressiva: passa; FAQ recolhido, processo mobile expansível e experimento mobile em passos.

Contagem >4: cinco etapas do processo, seis perguntas do FAQ. Não são decisões irreversíveis; a gravidade é menor do que um formulário com muitos campos. Não recomendo um menu ou agrupamento artificial só para atingir quatro.

## Jornada emocional

**Entrada:** oportunidade econômica clara e tom controlado. **Tensão:** reuniões e atrasos descrevem o desperdício, mas a permanência nessa situação no desktop prolonga um vale já compreendido. **Reasseguramento:** “Você aprova” funciona e deveria reaparecer também na decisão final. **Pico:** +R$ 150 mil/mês concretiza o valor; precisa continuar explicitamente fictício para o pico não virar desconfiança. **Fim:** contato simples, mas “Agendar” versus pedido de conversa cria atrito desnecessário. A história ideal termina em “vamos investigar a sua oportunidade”, sem prometer que os números do exemplo são do visitante.

## Personas e alertas

- **Jordan, primeira visita:** entende receita e aprovação; pode interpretar o exemplo final como caso real e o pedido como agendamento confirmado. Explicar o resultado no próprio contexto supera acrescentar microtexto espalhado.
- **Riley, comprador que confere as promessas:** os cálculos renderizados estão coerentes (2% → 2,6%, +30%, 500 mil → 650 mil; calculadora 3% → 750 mil). O problema é a ausência persistente de premissas e o texto “Hoje”. A pergunta “qual seria o próximo experimento?” também não explica que resultados reais podem ser negativos ou inconclusivos; isso só aparece no FAQ.
- **Casey, celular com pouca atenção:** a navegação vertical livre e os dois campos são bons. A calculadora mais a introdução ultrapassam uma tela, e o resultado mobile esconde explicações de condições. Reduzir redundância; não diminuir a fonte para caber mais.

## Observações menores

- O único recurso fotográfico é remoto e não carregou nesta execução (`naturalWidth=0`); o fundo verde de fallback permaneceu coeso. Não fazer a composição depender dessa foto genérica.
- A captura mobile de resultado mostrou porcentagem relativa e gráfico, mas as taxas de A/B foram removidas visualmente. Se o gráfico continuar, nomear 2,0% e 2,6% na conclusão ajuda a leitura sem reintroduzir tabelas.
- Ícones da marca, skips, foco visível em CSS e labels reais são uma base boa. Auditoria com leitor de tela, contraste instrumental e 200% de zoom ficaram fora deste assessor.
- Aumentar o texto técnico secundário indefinidamente não resolve os blocos redundantes. A prioridade é cortar repetições e dar ao texto necessário um lugar claro.

## Perguntas provocativas para a síntese

- E se toda a página acompanhasse uma única decisão de negócio, em vez de reiniciar a explicação a cada seção?
- O momento de maior confiança deveria ser a receita estimada ou a liberdade de rejeitar uma mudança que não funciona?
- A pessoa sabe, antes de digitar o e-mail, exatamente o que vai acontecer depois?

## Proveniência e limites deste assessor

Fontes da aplicação somente lidas. Nenhum detector executado ou consultado. Capturas feitas em nova aba por CDP usando servidor local com armazenamento de leads injetado em memória/no-op; nenhum lead real enviado. Nenhum arquivo de aplicação alterado. Helper `.preview/assessment-a.mjs` foi criado exclusivamente para evidência e removido após a captura. Servidor e Chrome próprios encerrados em `finally`. Nenhum ignore list foi encontrado. Notas de limpeza de perfil temporário do Chrome são responsabilidade do ambiente; não foi feita exclusão recursiva do perfil fora do workspace.
