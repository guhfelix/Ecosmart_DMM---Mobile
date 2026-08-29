# 📚 Tecnologias, APIs, Bibliotecas e Funções do EcoSmart Mobile

Este documento apresenta o catálogo completo, exaustivo e estruturado de todas as **linguagens de programação**, **APIs e serviços externos**, **bibliotecas/SDKs**, **scripts de automação**, **controladores da API**, **repositórios de dados** e **funções/métodos implementados** no ecossistema **EcoSmart Mobile**, acompanhados de sua localização e resumo de sua finalidade técnica e operacional.

---

## 💻 1. Linguagens de Programação, Scripts e Marcação

| Linguagem / Formato | Extensões | Onde é Utilizada no Projeto | Breve Resumo da Utilidade |
| :--- | :---: | :--- | :--- |
| **TypeScript** | `.ts`, `.tsx` | `shared/`, `frontend/*/src/`, `backend/src/`, `database/` | Linguagem principal do projeto. Garante tipagem estática estrita, contratos de dados, interfaces e compilação sem erros (`tsc --noEmit`). |
| **JavaScript (Node.js)** | `.js` | `scripts/*.js`, `jest.config.js`, `metro.config.js` | Utilizado nos servidores de sincronização local (`sync-server.js`), auto-inicialização (`ensure-server.js`), testes diagnósticos (`test-communication.js`), seeding (`seed-firestore.js`) e automação do monorepo (`sync-shared.js`). |
| **Windows Batch Scripting** | `.bat` | `executaveis/*.bat` | Scripts executáveis com duplo clique no Windows para instalação de dependências, suíte de testes, auto-servidor e inicialização dos aplicativos. |
| **SQL (PostgreSQL DDL)** | `.sql` | `database/schemas/schema.sql` | Definição da estrutura relacional do banco de dados (tabelas de usuários, descartes, tipos de resíduos, pontos de coleta e relatórios). |
| **JSON / JSONC** | `.json` | `package.json`, `tsconfig.json`, `app.json`, `firestore.indexes.json`, `database/data/*.json` | Configuração de manifestos Expo, dependências do monorepo, regras de compilação TypeScript, índices compostos do Firestore e persistência local. |
| **Security Rules DSL** | `.rules` | `database/schemas/firestore.rules` | Linguagem declarativa do Firebase para controle de acesso granular baseado em papéis (RBAC) às coleções do Cloud Firestore. |
| **Markdown** | `.md` | `README.md`, `GUIA_DE_DESENVOLVIMENTO.md`, `docs/*.md`, `executaveis/README.md` | Documentação técnica, arquitetura, catálogos de funções, requisitos e guias de uso. |

---

## 🌐 2. APIs Externas, Serviços em Nuvem e Protocolos de Rede

| API / Serviço | Endpoint / Protocolo | Onde é Utilizada | Breve Resumo da Utilidade |
| :--- | :--- | :--- | :--- |
| **Firebase Authentication** | `getAuth()`, `GoogleAuthProvider` | [`shared/services/authService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts) | Provedor de identidade para login social com Google ("Continuar com o Google") e login tradicional com e-mail/senha. |
| **Cloud Firestore (Realtime DB)** | `getFirestore()`, `onSnapshot` | [`shared/services/firebaseService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts) | Banco de dados NoSQL em nuvem com listeners em tempo real (`onSnapshot`) para sincronização instantânea das coleções `usuarios`, `descartes`, `tipos_residuos`, `pontos_coleta`, `dicas_educativas` e `notificacoes`. |
| **Servidor Central Backend REST** | `http://localhost:3333/api/*` | [`scripts/sync-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-server.js), `crossAppSync.ts` | Servidor Node.js local que processa requisições HTTP REST de criação, consulta filtrada, baixa de coleta, exclusão e status de saúde do ecossistema. |
| **Barramento em Tempo Real (Event Bus)** | `BroadcastChannel('ecosmart_realtime_sync_bus')` | [`shared/services/crossAppSync.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts) | Canal de comunicação inter-aplicativos com 0ms de latência para eventos de novos descartes (`NEW_DISCARD`), coletas (`DISCARD_COLLECTED`) e exclusões (`DISCARD_DELETED`). |
| **ViaCEP API REST** | `https://viacep.com.br/ws/{cep}/json/` | [`shared/services/cepService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts) | Busca automática de endereço (logradouro, bairro, cidade, UF) a partir do CEP digitado no cadastro de descarte com timeout e validação. |
| **Google Maps Navigation** | `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` | [`shared/utils/geoUtils.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts) | Deep linking para abrir rotas de coleta e trajetos até ecopontos diretamente no Google Maps. |
| **Waze Navigation** | `https://waze.com/ul?ll={lat},{lng}&navigate=yes` | [`shared/utils/geoUtils.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts) | Deep linking alternativo para traçar rotas GPS no aplicativo Waze. |

---

## 📦 3. Bibliotecas e Frameworks Utilizados

| Biblioteca / SDK | Pacote npm | Onde é Utilizada | Breve Resumo da Utilidade |
| :--- | :--- | :--- | :--- |
| **Expo SDK 54 / React Native** | `expo`, `react-native` | Todos os apps em `frontend/` | Framework base para desenvolvimento de aplicações móveis híbridas para Android e iOS. |
| **AsyncStorage** | `@react-native-async-storage/async-storage` | `shared/services/`, telas | Armazenamento local de chave-valor para persistência offline de sessão, descartes e dados de cada perfil com namespaces isolados. |
| **NetInfo** | `@react-native-community/netinfo` | [`shared/hooks/useNetworkStatus.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/hooks/useNetworkStatus.ts) | Monitoramento reativo do estado da conexão com a internet (Wi-Fi, celular ou desconectado) para ativação do modo offline. |
| **Safe Area Context** | `react-native-safe-area-context` | `App.tsx`, componentes e telas | Garante renderização adaptada a entalhes (*notches*) e barras de navegação dos sistemas operacionais móveis. |
| **Firebase SDK Modular (v12)** | `firebase` | `shared/services/firebaseConfig.ts`, `firebaseService.ts` | SDK oficial modular para interação com Firebase App, Firestore e Auth. |
| **Jest & Testing Library** | `jest`, `jest-expo`, `@testing-library/react-native` | Todas as pastas `__tests__/` | Framework de testes unitários e de integração com cobertura de código (Istanbul) e asserções de tela. |

---

## ⚙️ 4. Catálogo Detalhado de Funções e Métodos por Módulo

### 🔐 4.1. Autenticação e Controle de Acesso (`shared/services/authService.ts`)

| Função / Método | Parâmetros Principais | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`authenticateUser`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L121) | `email, password, expectedRole, registeredUsers` | `{ success, message?, user? }` | Realiza login por e-mail e senha, validando o papel do usuário (RBAC) e bloqueando acessos cruzados. |
| [`registerUser`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L183) | `name, email, password, role, accessCode?, existingUsers` | `{ success, message?, user?, updatedUsers? }` | Cadastra novo usuário com perfil específico, exigindo o código mestre `ADMIN2026` para administradores. |
| [`signInWithGoogle`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L360) | `expectedRole, registeredUsers` | `Promise<{ success, message?, user?, updatedUsers? }>` | Autentica com o Google via Firebase Auth e sincroniza o cadastro do usuário na coleção `usuarios`. |
| [`requestPasswordReset`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L268) | `email, expectedRole, registeredUsers` | `ResetCodeResult` | Gera um token de verificação temporário (`ECO-XXXX`) para recuperação de contas cadastradas. |
| [`resetPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L310) | `email, verificationCode, expectedCode, newPassword, registeredUsers` | `ResetPasswordResult & { updatedUsers? }` | Valida o token digitado e atualiza a senha no repositório e no armazenamento local. |
| [`validateUserProfile`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L94) | `email, expectedRole, extraUsers` | `{ isValid, message?, user? }` | Valida se o e-mail informado pertence ao perfil correto para o app em execução. |
| [`getRoleAccessErrorMessage`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L81) | `actualRole` | `string` | Retorna mensagens amigáveis e explicativas ao tentar acessar o app incorreto para seu perfil. |

---

### ☁️ 4.2. Integração com Firebase e Listeners em Tempo Real (`shared/services/firebaseService.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`saveCitizenDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L133) | `discard, citizen?` | `Promise<{ success, id }>` | Persiste o descarte diretamente na coleção `descartes` do Cloud Firestore com campos normalizados. |
| [`getDiscardsByCitizen`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L167) | `citizenEmail, userId?` | `Promise<DiscardItem[]>` | Consulta no Firestore todos os descartes pertencentes ao e-mail/ID do cidadão logado. |
| [`subscribeToCitizenDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L246) | `citizenEmail, callback, userId?` | `() => void` (Unsubscribe) | Ouvinte nativo `onSnapshot` para receber alterações nos descartes do cidadão em tempo real. |
| [`subscribeToDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L399) | `callback` | `() => void` (Unsubscribe) | Ouvinte nativo `onSnapshot` que notifica instantaneamente sobre novos descartes e baixas de coleta. |
| [`saveDiscardDocument`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L99) | `discard` | `Promise<{ success, id }>` | Cria ou atualiza documento de descarte no Firestore com fallback resiliente em memória. |
| [`getAvailableDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L330) | `filterType?` | `Promise<CollectorDiscard[]>` | Consulta descartes pendentes de coleta aplicando filtros por tipo de resíduo. |
| [`markDiscardAsCollected`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L346) | `id, coletorId?` | `Promise<boolean>` | Atualiza o status do descarte para `coletado` e vincula o ID do coletor e timestamp. |
| [`deleteDiscardDocument`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L379) | `id` | `Promise<boolean>` | Remove um descarte do Cloud Firestore e do cache local. |
| [`subscribeToWasteTypes`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L430) | `callback` | `() => void` | Listener `onSnapshot` para catálogo de resíduos recicláveis. |
| [`subscribeToCollectionPoints`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L458) | `callback` | `() => void` | Listener `onSnapshot` para pontos de entrega voluntária (PEV). |
| [`subscribeToTips`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L486) | `callback` | `() => void` | Listener `onSnapshot` para orientações ecológicas. |
| [`saveUserDocument`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L518) | `user` | `Promise<boolean>` | Atualiza dados cadastrais e preferências do usuário no Firestore e no cache local. |
| [`getUserByEmail`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L545) | `email` | `Promise<Usuario \| null>` | Busca perfil do usuário no Firestore pelo endereço de e-mail. |
| [`uploadWastePhoto`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L690) | `localUri, discardId` | `Promise<string>` | Retorna URI pública no Firebase Cloud Storage para a foto do resíduo. |
| [`saveNotification`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L697) | `notification` | `Promise<void>` | Salva alerta no Firestore na coleção `notificacoes`. |
| [`clearLocalMemoryCache`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L87) | — | `void` | Limpa as coleções em cache de memória ao realizar logout. |

---

### 🔄 4.3. Barramento e Sincronização Inter-Aplicativos (`shared/services/crossAppSync.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`postNewDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L210) | `item, senderApp?` | `Promise<{ success, id }>` | Transmite novo descarte via Event Bus (0ms), envia para o Cloud Firestore e Servidor Sync HTTP. |
| [`markAsCollected`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L240) | `id, coletorId?, senderApp?` | `Promise<boolean>` | Transmite baixa de coleta via Event Bus (0ms) e propaga no Firestore e Servidor Central. |
| [`deleteDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L265) | `id, senderApp?` | `Promise<boolean>` | Notifica exclusão/cancelamento de descarte para todos os clientes e remove do backend e Firestore. |
| [`syncUserProfile`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L290) | `user, senderApp?` | `Promise<boolean>` | Sincroniza alterações no perfil do usuário com o backend e Firestore. |
| [`fetchDiscardsByUser`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L120) | `userId?, email?` | `Promise<CollectorDiscard[]>` | Consulta descartes pertencentes exclusivamente a um usuário via Servidor Local e Firestore. |
| [`fetchAllDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L165) | — | `Promise<CollectorDiscard[]>` | Consulta a lista consolidada de descartes no servidor REST backend e no Firestore. |
| [`onSyncEvent`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L80) | `callback` | `() => void` (Unsubscribe) | Registra ouvinte para eventos em tempo real (`NEW_DISCARD`, `DISCARD_COLLECTED`, `DISCARD_DELETED`). |
| [`broadcastEvent`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L98) | `type, payload?, senderApp?` | `void` | Emite mensagem pelo canal de `BroadcastChannel` para todas as instâncias abertas. |

---

### 📦 4.4. Serviço de Sincronização Offline e Normalização (`shared/services/syncService.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`normalizeToCitizenDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L49) | `raw` | `DiscardItem` | Converte qualquer objeto de descarte para o formato canônico da interface do Cidadão. |
| [`normalizeToCollectorDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L15) | `raw` | `CollectorDiscard` | Converte qualquer objeto de descarte para a interface do Coletor com geolocalização. |
| [`normalizeToAdminDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L83) | `raw` | `AdminDiscardRecord` | Converte registros de descarte para o formato tabular do Administrador. |
| [`processAutoSyncCitizenDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L138) | `discards, isOffline` | `{ updatedDiscards, syncedCount }` | Processa mutações salvas em modo offline pelo Cidadão ao restabelecer conectividade. |
| [`processAutoSyncCollectorDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L167) | `discards, isOffline` | `{ updatedDiscards, syncedCount }` | Sincroniza coletas marcadas pelo Coletor em áreas sem conexão (`offlineSyncPending`). |
| [`processAutoSyncAdminRecords`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L195) | `records, isOffline` | `{ updatedRecords, syncedCount }` | Sincroniza alterações administrativas criadas em modo offline. |
| [`enqueueMutation`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/syncService.ts#L116) | `action, payload` | `OutboxMutation<T>` | Enfileira uma mutação offline segundo o padrão Outbox. |

---

### 🔔 4.5. Central de Notificações (`shared/services/notificationService.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`createNotification`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/notificationService.ts#L25) | `title, message, type?` | `AppNotification` | Cria um novo objeto de notificação formatado com timestamp e status não-lido. |
| [`getUnreadNotificationCount`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/notificationService.ts#L64) | `notifications` | `number` | Calcula a quantidade de notificações pendentes de leitura para exibição na badge. |
| [`markAllNotificationsAsRead`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/notificationService.ts#L55) | `notifications` | `AppNotification[]` | Marca todas as notificações do usuário como lidas. |
| [`markNotificationAsRead`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/notificationService.ts#L45) | `notifications, id` | `AppNotification[]` | Marca uma notificação específica como lida pelo identificador. |

---

### 🗺️ 4.6. Geolocalização, Endereçamento e CEP (`shared/services/cepService.ts` & `shared/utils/geoUtils.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`fetchAddressByCep`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L91) | `cep` | `Promise<CepAddress \| null>` | Realiza requisição à API ViaCEP com timeout, validação de 8 dígitos e fallback offline. |
| [`cleanCepDigits`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L71) | `cep` | `string` | Remove traços, pontos e caracteres não numéricos de strings de CEP. |
| [`formatCep`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L61) | `cep` | `string` | Aplica a formatação padrão `00000-000` em números de CEP. |
| [`getCoordinatesForNeighborhood`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L78) | `neighborhood` | `{ latitude, longitude }` | Mapeia coordenadas geográficas para bairros de Cáceres - MT (Centro, Cavalhada, DNER, etc.). |
| [`calculateDistanceKm`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L19) | `lat1, lon1, lat2, lon2` | `number` | Calcula a distância em quilômetros entre dois pontos geográficos pela fórmula de Haversine. |
| [`formatDistance`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L42) | `distanceKm` | `string` | Exibe a distância de forma amigável ao usuário (ex: `800 m` ou `2.4 km`). |
| [`sortItemsByDistance`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L52) | `items, userLat, userLon` | `T[]` | Ordena descartes e ecopontos por proximidade física em relação ao usuário. |
| [`getGoogleMapsNavigationUrl`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L76) | `lat, lng` | `string` | Gera link para navegação curva a curva no Google Maps. |
| [`getWazeNavigationUrl`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L83) | `lat, lng` | `string` | Gera link para navegação direta no aplicativo Waze. |

---

### 📊 4.7. Relatórios de Sustentabilidade ESG (`shared/services/reportService.ts`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`generateSustainabilityMetrics`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/reportService.ts#L17) | `records` | `SustainabilityMetrics` | Calcula métricas ecológicas (taxa de reciclagem %, estimativa de CO₂ evitado em kg e água preservada em litros). |
| [`generateCsvReport`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/reportService.ts#L53) | `records` | `string` | Gera texto estruturado em formato CSV com registros de descarte e resumo executivo ESG para exportação. |

---

### 🛡️ 4.8. Segurança, Identificadores e Validação (`shared/services/securityService.ts` & `shared/utils/`)

| Função / Método | Parâmetros | Retorno | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| [`generateSalt`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L13) | `length?` | `string` | Cria sequência pseudo-aleatória de bytes hexadecimais para salgamento de credenciais. |
| [`hashPasswordWithSalt`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L22) | `password, salt` | `string` | Aplica algoritmo de hashing determinístico com salt criptográfico. |
| [`verifyPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L35) | `password, hash, salt` | `boolean` | Compara senha fornecida contra o hash armazenado de forma resistente a timing attacks. |
| [`generateSessionToken`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L44) | `userId` | `string` | Cria token de sessão com identificador de usuário, timestamp e validade de 24 horas. |
| [`validateSessionToken`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L57) | `token` | `{ isValid, userId?, expiresAt? }` | Verifica a validade temporal e a integridade do token de sessão. |
| [`generateUUID`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/idUtils.ts#L5) | — | `string` | Gera identificador universal único versão 4 (UUID v4) compatível com Hermes e React Native. |
| [`generateEntityId`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/idUtils.ts#L27) | `prefix` | `string` | Cria chaves primárias com prefixos semânticos claros (`disc-*`, `user-*`, `point-*`, `waste-*`, `tip-*`). |
| [`isValidEmail`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L10) | `email` | `boolean` | Valida formato de e-mail conforme expressão regular RFC. |
| [`isValidPhone`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L18) | `phone` | `boolean` | Valida telefones fixos e celulares com DDD brasileiro (10 a 11 dígitos). |
| [`isStrongPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L27) | `password` | `boolean` | Verifica requisitos de comprimento mínimo para senhas de acesso. |
| [`sanitizeText`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L35) | `text` | `string` | Remove tags `<` e `>` e caracteres de controle perigosos contra injeção. |

---

### 🗄️ 4.9. Repositórios da Camada de Banco de Dados (`database/repositories/`)

| Repositório | Arquivo | Métodos Disponíveis | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| **`userRepository`** | [`database/repositories/userRepository.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/database/repositories/userRepository.ts) | • `findByEmail(email)`<br>• `findById(id)`<br>• `create(user)`<br>• `update(id, updates)`<br>• `upsert(user)`<br>• `getAll()` | Acesso e persistência da coleção de usuários, perfis RBAC e credenciais. |
| **`discardRepository`** | [`database/repositories/discardRepository.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/database/repositories/discardRepository.ts) | • `getAllPending(filterType?)`<br>• `getCollected()`<br>• `findById(id)`<br>• `getByUserId(userId)`<br>• `create(discard)`<br>• `markAsCollected(id, coletorId?)` | Consulta de descartes disponíveis, histórico por usuário e baixa de coleta. |
| **`adminRepository`** | [`database/repositories/adminRepository.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/database/repositories/adminRepository.ts) | • `getWasteTypes()` / `saveWasteType()` / `deleteWasteType()`<br>• `getPoints()` / `savePoint()` / `deletePoint()`<br>• `getTips()` / `saveTip()` / `deleteTip()` | Operações completas de CRUD sobre catálogos de resíduos, PEVs e dicas. |

---

### ⚙️ 4.10. Controladores da API Backend (`backend/src/controllers/`)

| Controlador | Arquivo | Métodos Principais | Resumo da Funcionalidade |
| :--- | :--- | :--- | :--- |
| **`authController`** | [`backend/src/controllers/authController.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/backend/src/controllers/authController.ts) | • `login(req)`<br>• `register(req)` | Orquestra login e cadastro com validação estrita de perfis RBAC. |
| **`discardController`** | [`backend/src/controllers/discardController.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/backend/src/controllers/discardController.ts) | • `listAvailable(type?)`<br>• `listCollected()`<br>• `listByUser(userId)`<br>• `create(data)`<br>• `markAsCollected(id, coletorId?)` | Processa criação de descartes, listagens filtradas e confirmação de coletas. |
| **`adminController`** | [`backend/src/controllers/adminController.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/backend/src/controllers/adminController.ts) | • `getDashboardMetrics()`<br>• `getEsgMetrics()`<br>• CRUDs de Waste Types, Points e Tips | Totalizadores consolidados para dashboard, métricas ESG e CRUDs. |
| **`syncService`** | [`backend/src/services/syncService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/backend/src/services/syncService.ts) | • `syncOfflineDiscards(offlineItems)` | Processamento e persistência de lotes criados em modo offline. |

---

### 🌐 4.11. Endpoints do Servidor Central REST (`scripts/sync-server.js`)

| Método HTTP | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Diagnóstico de integridade, status e total de descartes. |
| `GET` | `/api/discards` | Consulta a listagem unificada de descartes (suporta query params `userId` ou `email`). |
| `POST` | `/api/discards` | Recebe e persiste novos descartes cadastrados. |
| `POST` / `PATCH` | `/api/discards/:id/collect` | Registra confirmação e baixa de coleta por um coletor. |
| `DELETE` | `/api/discards/:id` | Cancela e exclui um descarte do ecossistema. |
| `GET` | `/api/users` | Retorna lista de usuários cadastrados no ecossistema. |
| `POST` | `/api/users` | Insere ou atualiza o perfil de um usuário no banco central. |

---

### 🛠️ 4.12. Scripts de Automação e Executáveis (`scripts/` e `executaveis/`)

| Script / Arquivo | Tipo | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`scripts/ensure-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/ensure-server.js) | Node.js | Verifica/inicializa o servidor backend REST na porta 3333 e valida conexão com o Firebase antes de abrir os apps. |
| [`scripts/sync-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-server.js) | Node.js / HTTP | Servidor central REST que expõe rotas para descartes, coletas e perfis na porta 3333 com persistência em JSON. |
| [`scripts/test-communication.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/test-communication.js) | Node.js / Teste | Bateria completa de testes automatizados E2E para API REST, Firebase Firestore e isolamento de storage local. |
| [`scripts/sync-shared.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-shared.js) | Node.js | Propaga recursivamente todos os arquivos de `shared/` para as pastas `src/` dos 3 frontends. |
| [`scripts/seed-firestore.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/seed-firestore.js) | Node.js | Popula o Cloud Firestore com dados iniciais de Cáceres - MT (PEVs, resíduos, dicas e descartes de exemplo). |
| [`scripts/start-all.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/start-all.js) | Node.js | Inicializa o servidor central e os 3 aplicativos concorrentemente nas portas 8081, 8082 e 8083. |
| [`executaveis/MENU-ECOSMART.bat`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/executaveis/MENU-ECOSMART.bat) | Batch Script | Painel principal interativo para controlar instalação, testes, servidor e inicialização dos 3 aplicativos no Windows. |
