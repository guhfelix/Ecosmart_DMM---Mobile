# Personas do Ecossistema EcoSmart Mobile

Este documento detalha as personas que representam os três perfis de usuários do **EcoSmart Mobile**, suas necessidades operacionais, credenciais de teste e como cada aplicativo soluciona suas dores cotidianas.

---

## 🌱 1. Maria Oliveira - Cidadã Pantaneira Consciente

Maria representa a cidadã engajada de Cáceres - MT que gera materiais recicláveis em sua residência ou pequeno comércio e deseja descartá-los de forma correta, rápida e sustentável.

### Credencial de Teste:
```text
E-mail: maria@gmail.com
Senha: 1234
Login Google: maria.google@gmail.com
Perfil: Cidadão
Aplicativo: EcoSmart Cidadão (Porta 8081)
```

### Necessidades e Dores:
* Autenticar-se de forma ágil com sua conta Google ou e-mail e senha.
* Registrar descartes em segundos usando busca automática por CEP (ViaCEP) ou GPS simplificado, informando quantidade e anexando fotos.
* Consultar pontos de coleta voluntária (PEVs) próximos de sua casa com cálculo de distância e traçado de rotas.
* Poder acompanhar o histórico e status de seus descartes (Pendente / Coletado) ou cancelá-los/excluí-los se necessário.
* Receber notificações visuais em tempo real no momento em que o coletor recolhe seus resíduos.
* Poder cadastrar descartes mesmo em locais com oscilação de sinal (Modo Offline).
* Redefinir sua senha com facilidade caso a esqueça ("Esqueci minha senha" com token `ECO-XXXX`).

### Como o EcoSmart Cidadão ajuda:
* Interface limpa e acolhedora com atalhos diretos na tela inicial.
* Isolamento estrito de dados: visualiza exclusivamente os seus próprios descartes.
* Sincronização em tempo real (0ms) e salvamento transparente no Cloud Firestore.
* Auto-sincronização de descartes offline assim que a conexão é restabelecida.

---

## 🚛 2. Lucas Santos - Cooperativa COOPERCÁCERES / Catador

Lucas representa o profissional de logística reversa e coleta seletiva em Cáceres - MT, atuando em cooperativas ou de forma autônoma, que precisa localizar rapidamente resíduos disponíveis e otimizar seus trajetos de recolhimento.

### Credencial de Teste:
```text
E-mail: lucas@gmail.com
Senha: 1234
Login Google: lucas.google@gmail.com
Perfil: Empresa/Catador
Aplicativo: EcoSmart Empresa/Catador (Porta 8082)
```

### Necessidades e Dores:
* Acessar o sistema com perfil verificado de coletor (RBAC) via Google ou e-mail/senha.
* Visualizar a listagem de descartes pendentes organizados por proximidade geográfica (distância Haversine via GPS).
* **Agilidade no Campo:** Traçar a melhor rota GPS e confirmar o recolhimento com apenas **1 toque diretamente no card**, sem perda de tempo em formulários secundários.
* Visualizar detalhes e fotos dos materiais antes do deslocamento.
* Registrar a conclusão das coletas mesmo em áreas periféricas sem sinal de internet (baixa offline `offlineSyncPending`).
* Manter seu perfil operacional atualizado com tipo de veículo (caminhonete, triciclo de carga), capacidade de carga e bairros atendidos.

### Como o EcoSmart Coletor ajuda:
* Menu simplificado com 3 opções claras (Descartes disponíveis, Coletas realizadas e Perfil).
* Botões de ação direta no próprio card para navegação (Google Maps/Waze) e baixa de coleta.
* Regra estrita de não-regressão de status: descartes coletados nunca voltam para pendentes.
* Resumo operacional com contador de coletas concluídas.

---

## 👑 3. João Pereira - Gestor Ambiental SEMATUR & Administrador ESG

João representa o coordenador ambiental municipal da Secretaria de Meio Ambiente e Turismo (SEMATUR) de Cáceres - MT, responsável pela governança dos catálogos ecológicos e pela auditoria dos indicadores de sustentabilidade.

### Credencial de Teste:
```text
E-mail: joao@gmail.com
Senha: 1234
Login Google: joao.google@gmail.com
Chave Mestre de Cadastro: ADMIN2026
Perfil: Administrador
Aplicativo: EcoSmart Admin (Porta 8083)
```

### Necessidades e Dores:
* Autenticar-se com perfil administrativo protegido por Chave Mestre de Segurança (`ADMIN2026`).
* Gerenciar CRUDs completos de materiais recicláveis, Ecopontos/PEVs municipais (com geolocalização e horários) e dicas educativas para os cidadãos.
* Monitorar a integridade geral dos descartes realizados no município e poder auditar/excluir registros inconsistentes.
* **Prestação de Contas ESG:** Gerar e exportar relatórios ambientais estruturados em formato **CSV** com indicadores de Taxa de Reciclagem (%), kg de CO₂ evitado e litros de água economizados.
* Manter os dados institucionais da secretaria no Perfil de Governança.

### Como o EcoSmart Admin ajuda:
* Painel executivo com métricas consolidadas em tempo real.
* Gerenciador administrativo com busca instantânea e filtros por status.
* Gerador de relatórios ESG em formato CSV com Resumo Executivo tabular.
* Controle estrito de segurança RBAC com bloqueio de acesso para perfis não autorizados.
