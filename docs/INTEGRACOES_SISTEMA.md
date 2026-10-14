# Documento de Integrações Técnicas - EcoSmart Mobile

## 1. Visão Geral da Arquitetura de Integrações

O ecossistema **EcoSmart Mobile** foi projetado sob um paradigma híbrido e resiliente (**Offline-First com Sincronização Dupla**). O sistema orquestra três aplicações front-end móveis (**EcoSmart Cidadão**, **EcoSmart Coletor** e **EcoSmart Admin**) conectadas a:
1. **Servidor Backend REST / WebSocket Central** (Node.js/Express na porta `3333`).
2. **Nuvem Google Firebase** (Cloud Firestore, Firebase Authentication, Cloud Storage, Cloud Functions e Firebase Data Connect).
3. **Serviços e APIs Externas** (ViaCEP para normalização de logradouro e motores de georreferenciamento para rotas GPS).

---

## 2. Diagrama de Fluxo de Dados e Comunicação (Mermaid)

```mermaid
flowchart TB
    subgraph Frontends ["Camada Frontend Mobile (Expo / React Native / Android Compose)"]
        AppCidadao["📱 EcoSmart Cidadão\n(Porta 8081 / App ID)"]
        AppColetor["🚛 EcoSmart Coletor\n(Porta 8082 / App ID)"]
        AppAdmin["👑 EcoSmart Admin\n(Porta 8083 / App ID)"]
    end

    subgraph SyncBus ["Barramento de Sincronização em Tempo Real"]
        BroadcastBus["🔄 BroadcastChannel / Local Storage\n(crossAppSync.ts - 'ecosmart_realtime_sync_bus')"]
    end

    subgraph BackendREST ["Servidor Central Backend (Node.js / Express)"]
        APIExpress["⚙️ API REST Core (Porta 3333)\n(/api/discards, /api/users, /api/health)"]
        OutboxQueue["📦 Fila Outbox & Resiliência Offline"]
    end

    subgraph CloudServices ["Serviços Cloud (Google Firebase)"]
        FirebaseAuth["🔐 Firebase Authentication\n(Email/Password & Google Sign-In)"]
        FirestoreDB["🔥 Cloud Firestore (Tempo Real)\n(Coleções: usuarios, descartes, etc.)"]
        FirebaseStorage["📁 Cloud Storage\n(Fotos de Resíduos e Avatares)"]
        FunctionsGenkit["🤖 Cloud Functions & Genkit\n(IA Generativa / Gatilhos)"]
        DataConnect["🔌 Firebase Data Connect\n(PostgreSQL / Cloud SQL)"]
    end

    subgraph ExternalAPIs ["APIs e Serviços Externos"]
        ViaCEP["📬 ViaCEP API REST\n(https://viacep.com.br/ws/{cep}/json/)"]
        MapServices["🗺️ Serviços de Navegação GPS\n(Google Maps & Waze Intents)"]
    end

    %% Fluxos de Frontends
    AppCidadao -->|1. Cadastro de Descarte / Perfil| APIExpress
    AppCidadao -->|2. Escuta de Status onSnapshot| FirestoreDB
    AppCidadao -->|3. Consulta de Endereço| ViaCEP
    AppCidadao <-->|4. Eventos entre Apps| BroadcastBus

    AppColetor -->|1. Feed de Descartes & Baixa 1 Toque| APIExpress
    AppColetor -->|2. Listener em Tempo Real| FirestoreDB
    AppColetor -->|3. Traçar Rota de Coleta| MapServices
    AppColetor <-->|4. Eventos entre Apps| BroadcastBus

    AppAdmin -->|1. CRUD de Catálogos & Auditoria| APIExpress
    AppAdmin -->|2. Gestão de Entidades| FirestoreDB
    AppAdmin -->|3. Relatórios ESG| BackendREST
    AppAdmin <-->|4. Eventos entre Apps| BroadcastBus

    %% Conexões Backend e Cloud
    APIExpress -->|Sincronização Bidirecional| FirestoreDB
    APIExpress -->|Geração de Tokens & Sessão| FirebaseAuth
    APIExpress -->|Persistência Local JSON| OutboxQueue

    AppCidadao -.->|Upload de Foto| FirebaseStorage
    AppColetor -.->|Autenticação Direta| FirebaseAuth
    AppAdmin -.->|IA / Insights| FunctionsGenkit
    BackendREST -.->|Consultas SQL Avançadas| DataConnect
```

---

## 3. Mapeamento Detalhado dos Serviços Integrados

### 3.1. Firebase Authentication
* **Arquivos Responsáveis:** `shared/services/firebaseConfig.ts`, `shared/services/authService.ts`, `backend/src/controllers/authController.ts`.
* **Provedores:**
  * **E-mail e Senha:** Utilizado com suporte a criptografia local (`securityService.ts`) e validação via `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`.
  * **Google Sign-In:** Botão "Continuar com o Google" mapeado nos 3 apps.
* **Mecanismo de RBAC (Controle de Acesso Baseado em Papel):**
  * Cada usuário possui o atributo estrito `perfil` (`cidadao`, `coletor` ou `admin`).
  * No app Admin, o cadastro e acesso exigem a validação prévia da **Chave Mestre Administrativa (`ADMIN2026`)**.
  * Tentativas de login cruzado (ex.: Coletor tentando logar no app Cidadão) disparam validação defensiva bloqueando a sessão.

### 3.2. Cloud Firestore (Banco de Dados NoSQL em Tempo Real na Instância (default))
* **Arquivos Responsáveis:** `shared/services/firebaseService.ts`, `database/schemas/firestore.rules`, `database/schemas/firestore.indexes.json`.
* **Modo de Operação Híbrido:** O `FirebaseService` opera com **Cache em Memória Resiliente (`memoryCache`) + Chamadas Diretas ao Firestore** encapsuladas com timeouts protetivos (`withFirestoreTimeout` de 7.000 ms).
* **Coleções e Listeners:**
  * `admins`: Coleção raiz blindada para gestores e administradores, isolada de acessos não autorizados via Security Rules (`isAdmin()`).
  * `admin_logs`: Trilha de auditoria das ações administrativas.
  * `usuarios`: Armazena exclusivamente metadados operacionais de cidadãos e coletores (veículo, capacidade de carga, contatos).
  * `descartes`: Ouve alterações com `subscribeToDiscards` e `subscribeToCitizenDiscards` usando `onSnapshot`.
  * `tipos_residuos`, `pontos_coleta`, `dicas_educativas`: Catálogos municipais lidos em tempo real por todos os usuários autenticados.
  * `notificacoes`: Alertas de descarte e confirmação de coleta.

### 3.3. Firebase Data Connect
* **Arquivos Responsáveis:** `dataconnect/dataconnect.yaml`, `dataconnect/schema/schema.gql`, `dataconnect/seed_data.gql`.
* **Tecnologia:** Conector GraphQL gerenciado integrado ao PostgreSQL (Cloud SQL).
* **Diagnóstico Atual:** O esquema presente em `dataconnect/schema/schema.gql` contém o template base padrão do Firebase (`User`, `Project`, `Task`, `Comment`). Para o ambiente de produção, deve ser migrado para o esquema do domínio EcoSmart (`Descarte`, `PontoColeta`, `TipoResiduo`).

### 3.4. Cloud Functions & Firebase Genkit
* **Arquivos Responsáveis:** `functions/src/index.ts`, `functions/src/genkit-sample.ts`, `functions/package.json`.
* **Tecnologia:** Firebase Functions v2 (`node 24`) com suporte a **Genkit 1.41.0** e modelos Vertex AI (`gemini-2.5-flash`).
* **Diagnóstico Atual:** Estrutura base configurada e testada no sample `genkit-sample.ts`. Requer exportação no `index.ts` das funções específicas de categorização automática de resíduos por imagem e dicas contextuais.

### 3.5. API de CEP (ViaCEP)
* **Arquivo Responsável:** `shared/services/cepService.ts`.
* **Endpoint Consumido:** `GET https://viacep.com.br/ws/{cep}/json/`.
* **Tratamento de Erros e Caching:**
  * Regex de sanitização de caracteres não-numéricos.
  * Validação de 8 dígitos.
  * Fallback inteligente de Georreferenciamento: se o CEP for de Cáceres - MT (`78200-000` a `78215-999`), o serviço associa automaticamente as coordenadas geográficas (`latitude`, `longitude`) do bairro correspondente (Centro, Cavalhada, Santos Dumont, Cohab Nova, etc.).

### 3.6. Mecanismo de Sincronização Cross-App e Outbox (`crossAppSync.ts` e `syncService.ts`)
* **Barramento de Eventos:** Utiliza a API `BroadcastChannel` (`ecosmart_realtime_sync_bus`) em navegadores/web e emulação de barramento de eventos para refletir ações entre telas e abas abertas simultaneamente.
* **Tipos de Eventos:** `NEW_DISCARD`, `DISCARD_COLLECTED`, `DISCARD_DELETED`, `USER_UPDATED`.
* **Persistência Local Isolada:**
  * Cidadão: `@ecosmart_cidadao_discards`, `@ecosmart_cidadao_session`.
  * Coletor: `@ecosmart_coletor_data`, `@ecosmart_coletor_session`.
  * Admin: `@ecosmart_admin_waste_types`, `@ecosmart_admin_records`.
* **Fila Outbox:** Armazena mutações locais com flag `offline = true` ou `offlineSyncPending = true` e dispara flush periódico quando a conectividade é restabelecida.

### 3.7. Geolocalização e Cálculo de Rotas (`geoUtils.ts`)
* **Cálculo de Proximidade:** Utiliza a **Fórmula de Haversine** considerando o raio médio da Terra de 6.371 km.
* **Ordenação:** Ordena descartes pendentes da menor para a maior distância em relação à localização do catador.
* **Integração Externa:** Dispara intents nativas ou URLs de navegação para:
  * Google Maps: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`.
  * Waze: `https://waze.com/ul?ll={lat},{lng}&navigate=yes`.

---

## 4. Variáveis de Ambiente e Segredos

Arquivo `.env` recomendado para as aplicações e scripts:

```env
# Servidor Central REST
EXPO_PUBLIC_SYNC_SERVER_URL=http://localhost:3333
REACT_NATIVE_API_URL=http://localhost:3333
PORT=3333

# Credenciais Públicas do Firebase Client (Expo / Web)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDgw9lpCdYbnGeAA98-q-LgN4BjL6xTspU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ecosmart-mobile.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ecosmart-mobile
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ecosmart-mobile.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=105163046365
EXPO_PUBLIC_FIREBASE_APP_ID=1:105163046365:web:271e4c6d0ecec7f17a8a34
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KPNJWGPF8R

# Credencial Administrativa para Scripts de Carga (Seed)
EXPO_PUBLIC_FIREBASE_ADMIN_EMAIL=admin.caceres@ecosmart.com
EXPO_PUBLIC_FIREBASE_ADMIN_PASSWORD=Password@1234

# Chave Mestre de Segurança (RBAC Admin)
ADMIN_ACCESS_CODE=ADMIN2026

# Genkit / Vertex AI (Cloud Functions)
GOOGLE_GENAI_API_KEY=sua_chave_aistudio_aqui
```
