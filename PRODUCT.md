# Landing Optimizer

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Donos de negócios digitais e responsáveis por marketing de pequenas e médias empresas que dependem do site para vender. Têm uma oferta e tráfego existentes, mas a execução de melhorias passa por repasses, reuniões e decisões pouco mensuradas. Confirmado pelo usuário nesta revisão e no IDEAL_CUSTOMER_PROFILE.md do workspace.

## Product Purpose

Ajudar o cliente a buscar mais faturamento a partir das visitas que já recebe. A página deve explicar a passagem de comportamento observado para hipótese, revisão humana, teste e decisão sobre a mudança.

## Positioning

O produto conecta observação a testes A/B autorizados; não se limita a métricas. A IA propõe mudanças para o contexto de cada site. O cliente aprova o que será testado e decide o que fica. Não há promessa de ganho garantido.

## Operating Context

A landing page é pública, em português brasileiro. A conversão comercial é solicitar uma conversa usando apenas e-mail profissional e site. Não há agenda automática: o responsável consulta os pedidos e responde por e-mail. O site serve HTML/CSS/JavaScript e recebe POST /api/leads no mesmo servidor Node.js, com gravação no Firestore. Deploy pelo Console do Google Cloud com GitHub, Cloud Build e Cloud Run.

## Capabilities and Constraints

Preservar validação do formulário, mensagens honestas de sucesso/erro e dados coletados. Nenhum experimento é aplicado sem aprovação humana. Implementação inicial lado a lado com o time. O script de coleta é assíncrono; não prometer impacto de desempenho nulo. Não implementar integrações, preços ou funcionalidades comerciais ausentes.

## Brand Commitments

Landing Optimizer. Manter a identidade verde limpa já adotada, tom direto para o dono do negócio e foco em faturamento. O usuário rejeitou textos pequenos redundantes e scroll preso/confuso no mobile. A revisão atual foi autorizada para implementação direta em HTML, verificada no navegador.

## Evidence on Hand

PRODUCT_BRIEF.md, IDEAL_CUSTOMER_PROFILE.md e WHAT_WE_WANT_TO_SELL.md no workspace descrevem o produto. Não há depoimentos, logos de clientes ou resultados comprovados fornecidos. Valores e gráficos são ilustrativos. A demonstração usa 2% -> 2,6% (+30%) e uma base fictícia de R$ 500 mil/mês -> R$ 650 mil/mês. A calculadora independente inicia em 3% (+50%, R$ 750 mil/mês). Projeções de faturamento bruto com tráfego e ticket médio constantes; não são ROI líquido ou promessa de receita.

## Product Principles

- Vender o valor econômico sem inventar prova.
- Tornar a aprovação e a decisão do cliente explícitas.
- Explicar uma situação concreta antes da mecânica do produto.
- Dar ao celular leitura natural e ações claras por toque.
- Solicitar só os dados necessários para iniciar a conversa.
