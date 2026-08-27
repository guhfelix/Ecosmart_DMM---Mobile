# 📚 Tecnologias, APIs, Bibliotecas e Funções do EcoSmart Mobile

Este documento apresenta o catálogo completo, exaustivo e estruturado de todas as **linguagens de programação**, **APIs e serviços externos**, **bibliotecas/SDKs**, **scripts de automação** e **funções/métodos implementados** no ecossistema **EcoSmart Mobile**, acompanhados de sua localização e resumo de sua finalidade técnica e operacional.

---

## 💻 1. Linguagens de Programação, Scripts e Marcação

| Linguagem / Formato | Extensões | Onde é Utilizada no Projeto | Breve Resumo da Utilidade |
| :--- | :---: | :--- | :--- |
| **TypeScript** | `.ts`, `.tsx` | `shared/`, `frontend/*/src/`, `backend/src/` | Linguagem principal do projeto. Garante tipagem estática estrita, contratos de dados, interfaces e compilação sem erros (`tsc --noEmit`). |
| **JavaScript (Node.js)** | `.js` | `scripts/*.js`, `jest.config.js`, `metro.config.js` | Utilizado nos servidores de sincronização local (`sync-server.js`), auto-inicialização (`ensure-server.js`), testes diagnósticos (`test-communication.js`) e automação do monorepo (`sync-shared.js`). |
| **Windows Batch Scripting** | `.bat` | `executaveis/*.bat` | Scripts executáveis com duplo clique no Windows para instalação de dependências, suíte de testes, auto-servidor e inicialização dos aplicativos. |
| **SQL (PostgreSQL DDL)** | `.sql` | `database/schemas/schema.sql` | Definição da estrutura relacional do banco de dados (tabelas de usuários, descartes, tipos de resíduos, pontos de coleta e relatórios). |
| **JSON / JSONC** | `.json` | `package.json`, `tsconfig.json`, `app.json`, `firestore.indexes.json` | Configuração de manifestos Expo, dependências do monorepo, regras de compilação TypeScript e índices compostos do Firestore. |
| **Security Rules DSL** | `.rules` | `database/schemas/firestore.rules` | Linguagem declarativa do Firebase para controle de acesso granular baseado em papéis (RBAC) às coleções do Cloud Firestore. |
| **Markdown** | `.md` | `README.md`, `GUIA_DE_DESENVOLVIMENTO.md`, `docs/*.md`, `executaveis/README.md` | Documentação técnica, arquitetura, catálogos de funções, requisitos e guias de uso. |

---

## 🌐 2. APIs Externas, Serviços em Nuvem e Protocolos de Rede

| API / Serviço | Endpoint / Protocolo | Onde é Utilizada | Breve Resumo da Utilidade |
| :--- | :--- | :--- | :--- |
| **Firebase Authentication** | `getAuth()`, `GoogleAuthProvider` | [`shared/services/authService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts) | Provedor de identidade para login social com Google ("Continuar com o Google") e login tradicional com e-mail/senha. |
| **Cloud Firestore (Realtime DB)** | `getFirestore()`, `onSnapshot` | [`shared/services/firebaseService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts) | Banco de dados NoSQL em nuvem com listeners em tempo real (`onSnapshot`) para sincronização instantânea das coleções `usuarios`, `descartes`, `tipos_residuos`, `pontos_coleta` e `dicas_educativas`. |
| **Servidor Central Backend REST** | `http://localhost:3333/api/*` | [`scripts/sync-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-server.js), `crossAppSync.ts` | Servidor Node.js local que processa requisições HTTP REST de criação, consulta, baixa de coleta e saúde do ecossistema. |
| **ViaCEP API REST** | `https://viacep.com.br/ws/{cep}/json/` | [`shared/services/cepService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts) | Busca automática de endereço (logradouro, bairro, cidade, UF) a partir do CEP digitado no cadastro de descarte. |
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

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`authenticateUser`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L82) | `AuthScreen` (Cidadão, Coletor, Admin) | Realiza login por e-mail e senha, validando o papel do usuário (RBAC) e bloqueando acessos cruzados. |
| [`registerUser`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L129) | `AuthScreen` (Cidadão, Coletor, Admin) | Cadastra novo usuário com perfil específico, exigindo o código mestre `ADMIN2026` para administradores. |
| [`signInWithGoogle`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L280) | `AuthScreen` (Cidadão, Coletor, Admin) | Autentica com o Google via Firebase Auth e sincroniza o cadastro do usuário na coleção `usuarios`. |
| [`requestPasswordReset`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L193) | `AuthScreen` (Recuperação de Senha) | Gera um token de verificação (`ECO-XXXX`) para recuperação de contas cadastradas. |
| [`resetPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L227) | `AuthScreen` (Recuperação de Senha) | Valida o token digitado e atualiza a senha no repositório e no armazenamento local. |
| [`getRoleAccessErrorMessage`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L42) | `authenticateUser`, `requestPasswordReset` | Retorna mensagens amigáveis e explicativas ao tentar acessar o app incorreto para seu perfil. |
| [`saveCustomUsersToStorage`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L65) | `authService.ts`, `AuthScreen` | Salva novos usuários registrados localmente no AsyncStorage isolado. |
| [`loadCustomUsersFromStorage`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/authService.ts#L52) | `App.tsx`, `authService.ts` | Carrega os usuários cadastrados localmente ao iniciar os aplicativos. |

---

### ☁️ 4.2. Integração com Firebase e Listeners em Tempo Real (`shared/services/firebaseService.ts`)

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`saveCitizenDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L130) | `App.tsx` (Cidadão) | Persiste o descarte diretamente na coleção `descartes` do Cloud Firestore com campos normalizados. |
| [`getDiscardsByCitizen`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L162) | `App.tsx` (Cidadão) | Consulta no Firestore todos os descartes pertencentes ao e-mail do cidadão logado. |
| [`subscribeToCitizenDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L210) | `App.tsx` (Cidadão) | Ouvinte nativo `onSnapshot` para receber alterações nos descartes do cidadão em tempo real. |
| [`subscribeToDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L185) | `App.tsx` (Coletor, Admin) | Ouvinte nativo `onSnapshot` que notifica instantaneamente sobre novos descartes e baixas de coleta. |
| [`saveDiscardDocument`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L69) | `RegisterDiscardScreen`, `syncService` | Cria ou atualiza documento de descarte no Firestore com fallback resiliente em memória. |
| [`getAvailableDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L103) | `AvailableDiscardsScreen` (Coletor) | Consulta descartes pendentes de coleta aplicando filtros por tipo de resíduo. |
| [`markDiscardAsCollected`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L132) | `DiscardDetailsScreen`, `AvailableDiscardsScreen` | Atualiza o status do descarte para `coletado` e vincula o ID do coletor e timestamp. |
| [`subscribeToWasteTypes`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L225) | `WasteTypesScreen` (Admin) | Listener `onSnapshot` para catálogo de resíduos recicláveis. |
| [`subscribeToCollectionPoints`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L265) | `CollectionPointsScreen` (Admin/Cidadão) | Listener `onSnapshot` para pontos de entrega voluntária (PEV). |
| [`subscribeToTips`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L305) | `EducationalTipsScreen` (Admin/Cidadão) | Listener `onSnapshot` para orientações ecológicas. |
| [`saveUserDocument`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts#L167) | `ProfileScreen`, `authService.ts` | Atualiza dados cadastrais e preferências do usuário no Firestore e no cache local. |

---

### 🔄 4.3. Barramento e Sincronização Inter-Aplicativos (`shared/services/crossAppSync.ts`)

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`postNewDiscard`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L95) | `App.tsx` (Cidadão) | Envia novo descarte via HTTP POST ao servidor backend central e publica evento no barramento. |
| [`postDiscardCollected`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L125) | `App.tsx` (Coletor) | Envia baixa de coleta ao servidor central e propaga evento de recolhimento em tempo real. |
| [`postDiscardDeleted`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L155) | `App.tsx` (Cidadão, Admin) | Notifica exclusão/cancelamento de descarte ao servidor central e outros clientes. |
| [`syncUserProfile`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L180) | `ProfileScreen` (3 Apps) | Sincroniza alterações no perfil do usuário com o backend e Firestore. |
| [`fetchAllDiscards`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L205) | `App.tsx` (Coletor, Admin) | Consulta a lista consolidada de descartes no servidor REST backend. |
| [`onSyncEvent`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/crossAppSync.ts#L75) | `App.tsx` (3 Apps) | Registra ouvinte para eventos em tempo real (`NEW_DISCARD`, `DISCARD_COLLECTED`, `DISCARD_DELETED`). |

---

### 🗺️ 4.4. Geolocalização, Endereçamento e CEP (`shared/services/cepService.ts` & `shared/utils/geoUtils.ts`)

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`fetchAddressByCep`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L91) | `RegisterDiscardScreen` (Cidadão) | Realiza requisição à API ViaCEP com timeout, validação de 8 dígitos e fallback offline. |
| [`cleanCepDigits`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L71) | `cepService.ts`, telas | Remove traços, pontos e caracteres não numéricos de strings de CEP. |
| [`formatCep`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L61) | `cepService.ts`, listagens | Aplica a formatação padrão `00000-000` em números de CEP. |
| [`getCoordinatesForNeighborhood`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/cepService.ts#L78) | `RegisterDiscardScreen` | Mapeia coordenadas geográficas para bairros de Cáceres - MT (Centro, Cavalhada, DNER, etc.). |
| [`calculateDistanceKm`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L19) | `geoUtils.ts`, telas do Coletor | Calcula a distância em quilômetros entre dois pontos geográficos pela fórmula de Haversine. |
| [`formatDistance`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L42) | Telas do Coletor e Cidadão | Exibe a distância de forma amigável ao usuário (ex: `800 m` ou `2.4 km`). |
| [`sortItemsByDistance`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L52) | `AvailableDiscardsScreen`, `CollectionPointsScreen` | Ordena descartes e ecopontos por proximidade física em relação ao usuário. |
| [`getGoogleMapsNavigationUrl`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L76) | Telas com botões de rota GPS | Gera link para navegação curva a curva no Google Maps. |
| [`getWazeNavigationUrl`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/geoUtils.ts#L83) | Telas com botões de rota GPS | Gera link para navegação direta no aplicativo Waze. |

---

### 📊 4.5. Relatórios de Sustentabilidade ESG (`shared/services/reportService.ts`)

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`generateSustainabilityMetrics`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/reportService.ts#L22) | `RecordsScreen` (Admin), `ProfileScreen` (Admin) | Calcula métricas ecológicas (taxa de reciclagem %, estimativa de CO₂ evitado em kg e água preservada em litros). |
| [`generateCsvReport`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/reportService.ts#L65) | `RecordsScreen` (Admin) | Gera texto estruturado em formato CSV com registros de descarte e resumo executivo ESG para exportação. |

---

### 🛡️ 4.6. Segurança, Validação e Identificadores (`shared/services/securityService.ts` & `shared/utils/`)

| Função / Método | Onde é Utilizada | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`generateSalt`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L13) | `securityService.ts` | Cria sequência pseudo-aleatória de bytes hexadecimais para salgamento de credenciais. |
| [`hashPasswordWithSalt`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L22) | `securityService.ts` | Aplica algoritmo de hashing determinístico com salt criptográfico. |
| [`verifyPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L35) | `securityService.ts`, `authService.ts` | Compara senha fornecida contra o hash armazenado de forma resistente a ataques de temporização. |
| [`generateSessionToken`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L44) | `authService.ts` | Cria token de sessão com identificador de usuário, timestamp e validade de 24 horas. |
| [`validateSessionToken`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/securityService.ts#L57) | `securityService.ts` | Verifica a validade temporal e a assinatura do token de sessão. |
| [`generateUUID`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/idUtils.ts#L5) | `idUtils.ts`, entidades | Gera identificador universal único versão 4 (UUID v4) compatível com Hermes e React Native. |
| [`generateEntityId`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/idUtils.ts#L27) | `firebaseService.ts`, formulários | Cria chaves primárias com prefixos semânticos claros (`disc-*`, `user-*`, `point-*`, `waste-*`, `tip-*`). |
| [`isValidEmail`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L10) | Formulários de Auth e Perfil | Valida formato de e-mail conforme expressão regular RFC. |
| [`isValidPhone`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L18) | `ProfileScreen` (Cidadão, Coletor, Admin) | Valida telefones fixos e celulares com DDD brasileiro (10 a 11 dígitos). |
| [`isStrongPassword`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L27) | `AuthScreen` | Verifica requisitos de comprimento mínimo para senhas de acesso. |
| [`sanitizeText`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/utils/validationUtils.ts#L35) | Formulários de cadastro e edição | Remove tags `<` e `>` e caracteres de controle perigosos contra injeção. |

---

### 💾 4.7. Namespaces Isolados de Armazenamento Local (`shared/services/storageKeys.ts`)

| Chave / Constante | Namespace | Finalidade |
| :--- | :--- | :--- |
| `STORAGE_KEYS.CIDADAO.SESSION` | `@ecosmart_cidadao_session` | Sessão autenticada ativa do Cidadão. |
| `STORAGE_KEYS.CIDADAO.DISCARDS` | `@ecosmart_cidadao_discards` | Histórico de descartes criados pelo cidadão no dispositivo. |
| `STORAGE_KEYS.COLETOR.SESSION` | `@ecosmart_coletor_session` | Sessão autenticada ativa do Coletor. |
| `STORAGE_KEYS.COLETOR.DATA` | `@ecosmart_coletor_data` | Histórico operacional e coletas concluídas pelo coletor. |
| `STORAGE_KEYS.ADMIN.SESSION` | `@ecosmart_admin_session` | Sessão autenticada ativa do Administrador. |
| `STORAGE_KEYS.ADMIN.RECORDS` | `@ecosmart_admin_records` | Cache de auditoria geral e relatórios ESG do gestor. |

---

### 🛠️ 4.8. Scripts e Automações (`scripts/` e `executaveis/`)

| Script / Arquivo | Tipo | Resumo da Funcionalidade |
| :--- | :--- | :--- |
| [`scripts/ensure-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/ensure-server.js) | Node.js | Verifica/inicializa o servidor backend REST na porta 3333 e valida conexão com o Firebase antes de abrir os apps. |
| [`scripts/sync-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-server.js) | Node.js / HTTP | Servidor central REST que expõe rotas para descartes, coletas e perfis na porta 3333. |
| [`scripts/test-communication.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/test-communication.js) | Node.js / Teste | Bateria completa de testes automatizados E2E para API REST, Firebase Firestore e isolamento de storage local. |
| [`scripts/sync-shared.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-shared.js) | Node.js | Propaga recursivamente todos os arquivos de `shared/` para as pastas `src/` dos 3 frontends. |
| [`executaveis/MENU-ECOSMART.bat`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/executaveis/MENU-ECOSMART.bat) | Batch Script | Painel principal interativo para controlar instalação, testes, servidor e inicialização dos 3 aplicativos no Windows. |
