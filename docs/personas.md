# Personas do Ecossistema EcoSmart Mobile

## 🌱 Maria Oliveira - Cidadã Consciente

Maria representa a cidadã engajada que quer descartar resíduos recicláveis corretamente, manter seus dados cadastrais organizados e acompanhar seus descartes.

Credencial de teste:
```text
E-mail: maria@gmail.com
Senha: 1234
Login Google: maria.google@gmail.com
Perfil: Cidadão
```

Necessidades:
- Autenticar-se de forma ágil com sua conta Google ou e-mail/senha.
- Registrar descartes com facilidade usando GPS e anexando fotos do material.
- Visualizar pontos de coleta próximos com cálculo de distância e traçado de rotas.
- Receber notificações em tempo real quando seu descarte for recolhido por um coletor.
- Acompanhar seu **Perfil de Cidadão** com resumo de descartes registrados, coletados e pendentes.
- Redefinir sua senha com segurança caso a esqueça ("Esqueci minha senha").

Como o app ajuda:
- Permite login oficial com Google integrado ao Firebase Auth.
- Permite cadastrar descartes online e offline.
- Exibe perfil pessoal limpo com resumo de descartes e edição cadastral.
- Auto-sincroniza pendências automaticamente ao restabelecer a conexão.

---

## 🚛 Lucas Santos - Cooperativa / Catador Credenciado

Lucas representa o profissional de logística reversa e coleta seletiva que precisa localizar rapidamente resíduos volumosos e planejar trajetos eficientes.

Credencial de teste:
```text
E-mail: lucas@gmail.com
Senha: 1234
Login Google: lucas.google@gmail.com
Perfil: Empresa/Catador
```

Necessidades:
- Autenticar-se com conta Google ou credenciais de coletor.
- Visualizar lista de descartes ordenados por proximidade geográfica (GPS).
- Inspecionar fotos dos materiais antes de deslocar seu veículo de coleta.
- Traçar rotas de navegação direta até o local de coleta.
- Registrar a conclusão das coletas mesmo em áreas sem sinal de internet.
- Manter seu **Perfil Operacional** atualizado com tipo de veículo (caminhonete, triciclo) e raio de atendimento.

Como o app ajuda:
- Conexão rápida via Google ou login tradicional.
- Exibe distância exata em km e rota integrada para cada descarte.
- Resumo operacional de coletas concluídas e pendências na região.
- Notifica a central e o cidadão assim que a coleta é confirmada.

---

## 🛡️ João Pereira - Administrador & Gestor ESG

João representa o coordenador ambiental ou gestor público responsável por manter o catálogo do sistema, gerenciar pontos de coleta e auditar relatórios de sustentabilidade.

Credencial de teste:
```text
E-mail: joao@gmail.com
Senha: 1234
Login Google: joao.google@gmail.com
Chave de Cadastro: ADMIN2026
Perfil: Administrador
```

Necessidades:
- Autenticar-se com sua conta Google de gestor ou credenciais de administrador.
- Gerenciar CRUDs completos de tipos de resíduos, pontos de coleta e dicas educativas.
- Acompanhar indicadores gerais do ecossistema e taxa de reciclagem em tempo real.
- Exportar relatórios analíticos ESG em formato CSV para prestação de contas.
- Manter o **Perfil de Governança** institucional com cargo, departamento e diretrizes de sustentabilidade.

Como o app ajuda:
- Acesso ágil com Google Auth ou Chave Mestre de Segurança (`ADMIN2026`).
- Interface administrativa com busca instantânea e filtros por status.
- Gerador e exportador de relatórios tabulares em CSV.
- Controle estrito de segurança RBAC com chave mestra obrigatória no cadastro.
