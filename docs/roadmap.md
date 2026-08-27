# Roadmap do Ecossistema EcoSmart Mobile

## Etapa 1 - Estrutura inicial e Monorepo
Status: concluída.
- [x] Estruturar repositório em `frontend`, `backend`, `database`, `shared`, `executaveis` e `docs`.
- [x] Criar os três apps base no Expo SDK 54.
- [x] Centralizar modelos compartilhados em `shared/models`.

## Etapa 2 - App Cidadão
Status: concluída.
- [x] Implementar login (Google com Firebase Auth e E-mail/Senha) e cadastro com RBAC estrito.
- [x] Implementar cadastro simples e direto de descarte (com tipo, quantidade, observação, CEP e GPS).
- [x] Gravação direta e transparente no Cloud Firestore (`saveCitizenDiscard`).
- [x] Implementar histórico de descartes persistido no AsyncStorage com busca e filtros.
- [x] Implementar consulta de dicas educativas e pontos de coleta com rotas.
- [x] Implementar Perfil do Cidadão (edição cadastral e resumo de descartes).
- [x] Banner visual de status offline e auto-sincronização.

## Etapa 3 - App Empresa/Catador
Status: concluída.
- [x] Implementar login (Google com Firebase Auth e E-mail/Senha) e cadastro com RBAC estrito.
- [x] Menu simplificado com 3 opções claras (Descartes disponíveis, Coletas realizadas e Perfil).
- [x] Listar descartes disponíveis com cálculo de distâncias (Haversine) e ordenação por proximidade.
- [x] Ações em 1 toque no card: traçado de rota GPS e confirmação direta de coleta.
- [x] Marcar descarte como coletado com sincronização em tempo real via listeners `onSnapshot`.
- [x] Exibir coletas realizadas com busca em tempo real.
- [x] Implementar Perfil do Coletor com Dados Operacionais.

## Etapa 4 - App Admin
Status: concluída.
- [x] Implementar login (Google com Firebase Auth e E-mail/Senha) e cadastro protegido por chave mestre (`ADMIN2026`).
- [x] CRUD completo de tipos de resíduos com busca.
- [x] CRUD completo de pontos de coleta com geolocalização.
- [x] CRUD completo de dicas educativas com busca textual.
- [x] Visualizar registros gerais com contadores e exportação de relatórios ESG em CSV.
- [x] Implementar Perfil do Administrador com Métricas de Governança do Ecossistema.

## Etapa 5 - Qualidade, Padronização e Isolamento
Status: concluída.
- [x] Migração para `react-native-safe-area-context` e `SafeAreaProvider` nos 3 apps.
- [x] Namespaces isolados no `AsyncStorage` para evitar contaminação cruzada.
- [x] Validação TypeScript estrita (`tsc --noEmit`) com 0 erros.
- [x] 100% de sucesso nos testes unitários e de integração (74 suítes e 383 testes passando).

## Etapa 6 - Camada de Backend e Sincronização em Tempo Real
Status: concluída.
- [x] Servidor Central Backend REST / WebSocket (`scripts/sync-server.js` na porta 3333).
- [x] Auto-inicialização do servidor e validação com Firebase nos scripts de inicialização (`ensure-server.js`).
- [x] Listeners nativos `onSnapshot` no Firestore para propagação instantânea de status.
- [x] Teste automatizado de diagnóstico de comunicação (`scripts/test-communication.js`).

## Etapa 7 - Executáveis e Automação (.bat no Windows)
Status: concluída.
- [x] Painel interativo `MENU-ECOSMART.bat`.
- [x] Scripts dedicados de instalação, testes, sincronização e inicialização dos apps na pasta `executaveis/`.
