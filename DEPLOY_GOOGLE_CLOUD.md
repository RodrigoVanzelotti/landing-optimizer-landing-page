# Deploy no Google Cloud

A configuração e a execução de Cloud pertencem ao repositório
`RodrigoVanzelotti/personal-cloud-infrastructure`, em
`solutions/landing-optimizer/terraform/project`. O state e o serviço existentes
foram preservados. Não crie uma segunda conexão de deploy pelo Console.

1. Faça as alterações da aplicação e execute `npm.cmd test`.
2. Publique na `main` pelo processo autorizado do repositório.
3. O workflow `CI` chama o workflow central de release, que constrói/testa o
   container, publica um digest imutável e aplica Terraform para este serviço.
4. Verifique o resultado do workflow e a página publicada. O pipeline usa um lock
   compartilhado e não pode alterar IAM, banco ou os outros serviços numa release.

Referências: [guia completo da infraestrutura](../personal-cloud-infrastructure/solutions/landing-optimizer/README.md)
e [workflow central](https://github.com/RodrigoVanzelotti/personal-cloud-infrastructure/blob/main/.github/workflows/deploy-landing-optimizer.yml).

O serviço mantém a identidade de runtime e o acesso ao Firestore para receber
leads. Credenciais não são gravadas no repositório ou na imagem. Mudanças em Cloud,
permissões e versões de secrets devem ser declaradas no Terraform central.

A troca dos workflows está preparada localmente. Até a publicação e validação do
substituto, o trigger antigo continua ativo na Cloud e não deve ser desativado.
