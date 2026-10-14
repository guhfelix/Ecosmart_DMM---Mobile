# EcoSmart Mobile

## Ecossistema mobile para descarte sustentável de resíduos e logística reversa

![Status](https://img.shields.io/badge/status-Em%20Desenvolvimento-yellow)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)
![Node.js](https://img.shields.io/badge/Node.js-Backend%20REST-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tests](https://img.shields.io/badge/Tests-77%20suites%20%7C%20425%20passed-success)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange)
![License](https://img.shields.io/badge/license-academic-lightgrey)

O **EcoSmart Mobile** é um ecossistema simples, ágil e de fácil acesso desenvolvido para conectar cidadãos a catadores/empresas de coleta e apoiar a gestão municipal e ambiental (ESG).

O projeto é estruturado em três aplicativos móveis independentes em **React Native com Expo** e um **Servidor Central Backend em Node.js**:

| Módulo / Aplicativo | Perfil / Tipo | Porta | Função Principal |
| :--- | :--- | :--- | :--- |
| **EcoSmart Cidadão** | Cidadão | `8081` | Registro rápido de descartes (tipo, quantidade, endereço com CEP e GPS simplificado), gravação direta no Firestore (`saveCitizenDiscard`), histórico com busca e filtros, dicas, pontos com rotas, auto-sync, **Login com Google (Firebase Auth)** e **Perfil do Cidadão**. |
| **EcoSmart Empresa/Catador** | Coletor | `8082` | Feed de descartes com distâncias geográficas (Haversine), ouvintes em tempo real (`onSnapshot`), ordenação por proximidade, rota GPS e baixa de coleta em 1 toque no card, auto-sync, **Login com Google (Firebase Auth)** e **Perfil Operacional**. |
| **EcoSmart Admin** | Administrador | `8083` | **Login com Google / Chave Mestre (ADMIN2026)**, base exclusiva de gestão isolada no Firestore, CRUDs de resíduos, pontos e dicas com busca em tempo real, dashboard e exportação de Relatórios ESG (CSV) e **Perfil de Gestão Master**. |
| **Servidor Central Backend** | API REST / Node.js | `3333` | API centralizada de sincronização em tempo real, barramento de eventos, persistência intermediária, controle de rotas de descartes/coletas e verificação automática com o Firebase Firestore. |

---

## 📁 Estrutura de Pastas e Módulos do Projeto

O repositório é configurado como um monorepo modular organizado da seguinte forma:

```text
Ecosmart_DMM---Mobile/
├── frontend/                     📱 Aplicativos móveis independentes (React Native / Expo SDK 54)
│   ├── ecosmart-cidadao/         # App Cidadão (Porta 8081 - Cadastro de descartes, histórico, PEVs e perfil)
│   ├── ecosmart-coletor/         # App Coletor/Catador (Porta 8082 - Feed georreferenciado, rotas GPS e baixa em 1 toque)
│   └── ecosmart-admin/           # App Gestor/Admin (Porta 8083 - Catálogos, auditoria, relatórios ESG e base isolada)
│
├── shared/                       🔄 Núcleo de código e contratos compartilhados entre os frontends
│   ├── components/               # Componentes compartilhados (AppCard, OfflineBanner, NotificationModal)
│   ├── data/                     # Dados semente locais com geolocalização oficial de Cáceres - MT
│   ├── hooks/                    # Hooks reutilizáveis (useNetworkStatus para modo offline)
│   ├── models/                   # Contratos TypeScript de domínio (Usuario, Descarte, CollectorDiscard, etc.)
│   ├── services/                 # Serviços centrais (firebaseService, authService, crossAppSync, cepService, reportService)
│   ├── theme/                    # Paleta de cores, tipografia e diretrizes visuais
│   └── utils/                    # Utilitários de distância (Haversine), IDs e validações
│
├── backend/                      ⚙️ Servidor Backend em Node.js / Express
│   └── src/
│       ├── controllers/          # Controladores REST (authController, discardController, adminController)
│       ├── routes/               # Rotas da API REST (/api/discards, /api/users, /api/health)
│       ├── services/             # Regras de negócio e sincronização offline (syncService)
│       └── server.ts             # Ponto de entrada do servidor backend
│
├── database/                     🗄️ Esquemas de dados, regras de segurança e persistência
│   ├── data/                     # Banco local JSON persistido em disco (ecosmart-live-db.json)
│   ├── repositories/             # Repositórios desacoplados (userRepository, discardRepository, adminRepository)
│   ├── schemas/                  # Regras Firestore (firestore.rules), índices e esquemas SQL
│   └── seeds/                    # Carga inicial com coordenadas reais do Pantanal e Cáceres - MT
│
├── scripts/                      🛠️ Scripts utilitários de automação e integração
│   ├── sync-shared.js            # Sincroniza e sanitiza shared/ para os 3 frontends com blindagem de isolamento
│   ├── seed-firestore.js         # Migração ao vivo e carga de dados com isolamento estrito no Cloud Firestore
│   ├── sync-server.js            # Servidor central REST de sincronização (Porta 3333)
│   ├── ensure-server.js          # Auto-inicializador do servidor backend e verificação do Firebase
│   ├── test-communication.js     # Diagnóstico automatizado E2E de integração da API e Firestore
│   └── start-all.js              # Inicialização concorrente dos 3 apps e do backend
│
├── executaveis/                  🚀 Automações em lote (.bat) para execução com duplo clique no Windows
│   ├── MENU-ECOSMART.bat         # Painel interativo com menu de opções para todo o ecossistema
│   ├── 1-instalar-dependencias.bat
│   ├── 2-executar-testes.bat
│   ├── 3-iniciar-cidadao.bat
│   ├── 4-iniciar-coletor.bat
│   ├── 5-iniciar-admin.bat
│   ├── 6-sincronizar-modulos.bat
│   ├── 7-testar-comunicacao.bat
│   └── 8-iniciar-servidor.bat
│
└── docs/                         📚 Documentação técnica completa, arquitetura, segurança e manuais
```

---

## 🛡️ Arquitetura de Isolamento de Dados do Administrador no Firestore `(default)`

Para garantir a **máxima segurança e privacidade** sem gerar custos adicionais de múltiplos bancos no GCP, o ecossistema utiliza a instância padrão `(default)` do Cloud Firestore estruturada em **ambientes estritamente isolados no nível de coleções raiz**:

1. **Coleções Raiz Dedicadas da Administração:**
   - `/admins/{adminId}`: Coleção raiz exclusiva para credenciais, perfis e dados de gestores públicos (`user-admin-1` - João Gestor SEMATUR).
   - `/admin_logs/{logId}`: Coleção raiz de auditoria das ações administrativas.
   - **Regra de Acesso:** Bloqueio total para clientes comuns (`allow read, write: if isAdmin();`). Cidadãos e Coletores não têm permissão de listar nem ler documentos administrativos.
2. **Coleção de Usuários Operacionais (`/usuarios`):**
   - Contém **exclusivamente** perfis operacionais (`cidadao` e `coletor`). Administradores são proibidos de residir nesta coleção.
   - Tentativas de cadastro de perfil `admin` nesta coleção disparam exceção defensiva imediata.
3. **Acesso Cruzado de Gestão:**
   - O aplicativo administrativo (`ecosmart-admin`) conecta à sua base exclusiva (`admins` e `admin_logs`) para autenticação e governança, mantendo acesso de leitura e escrita às coleções gerais (`usuarios`, `descartes`, `pontos_coleta`, `tipos_residuos`, `dicas_educativas`) para monitoramento ESG.
4. **Script de Migração e Sincronização ao Vivo:**
   - Execute `node scripts/seed-firestore.js` para migrar o administrador para a coleção dedicada `admins` e limpar contas gestoras da coleção `usuarios`.

---

## ⚙️ Backend e Arquitetura de API REST

O backend do ecossistema é centralizado e responsável por intermediar as requisições de todos os aplicativos conectados, além de conectar com o **Firebase Cloud Firestore**:

* **Localização:** [`scripts/sync-server.js`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/scripts/sync-server.js) e [`backend/src/server.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/backend/src/server.ts).
* **Porta:** `3333` (`http://localhost:3333`).
* **Auto-Inicialização:** Ao rodar qualquer aplicativo (`npm run start:*`), o script `scripts/ensure-server.js` inicia o servidor backend automaticamente em segundo plano e valida a conexão com o Firebase.

### Endpoints da API REST:

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de integridade, status e latência do servidor. |
| `GET` | `/api/discards` | Consulta a listagem unificada de descartes para coletores e gestores. |
| `POST` | `/api/discards` | Criação e recebimento de novo descarte cadastrado pelo Cidadão. |
| `POST` | `/api/discards/:id/collect` | Baixa e confirmação de coleta realizada por Coletor/Empresa. |
| `DELETE` | `/api/discards/:id` | Cancelamento e exclusão de registro de descarte. |
| `POST` | `/api/users` | Sincronização de perfis e dados cadastrais de usuários. |

---

## 💡 Princípio de Design: Simplicidade e Fácil Acesso

* **Interface Descomplicada:** Foco na utilidade imediata — sem formulários extensos, fluxos pesados de upload ou leitores de QR Code.
* **Operação em 1 Toque:** Coletores podem verificar o endereço, traçar a melhor rota GPS e confirmar o recolhimento diretamente no card do descarte.
* **Resiliência Offline:** Funciona sem conexão à internet e sincroniza automaticamente quando restabelecida.

---

## 🔄 Métodos de Sincronização & Persistência Local Isolada

1. **Servidor Centralizado Backend (Node.js REST na Porta 3333):**
   * Endpoint de mutação rápida HTTP (`POST /api/discards`, `POST /api/discards/:id/collect`, `DELETE /api/discards/:id`).
   * Auto-iniciado automaticamente em segundo plano ao executar qualquer aplicativo.

2. **Banco de Dados em Tempo Real (Firebase Cloud Firestore):**
   * Listeners nativos **`onSnapshot`** em [`firebaseService.ts`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/shared/services/firebaseService.ts) para atualização instantânea sem recarregamento.
   * Persistência explícita de descartes na coleção `descartes` através de `saveCitizenDiscard()`.

3. **Persistência Local Isolada por Aplicativo (`AsyncStorage`):**
   * Cada aplicativo mantém seus dados locais sob namespace próprio (`@ecosmart_cidadao_*`, `@ecosmart_coletor_*`, `@ecosmart_admin_*`), garantindo que o app Cidadão salve e exiba apenas seus próprios descartes locais.

---

## 📂 Executáveis e Automação (.bat no Windows)

A pasta [`executaveis/`](file:///C:/Users/gabri/Documents/faculdade/7%20semestre/DESENVOLVIMENTO%20DE%20SISTEMAS%20PARA%20DISPOSITIVOS%20M%C3%93VEIS/Ecosmart_DMM---Mobile/executaveis/) possui scripts prontos com duplo clique:

| Arquivo | Função | Porta |
| :--- | :--- | :--- |
| **`MENU-ECOSMART.bat`** | **Painel Principal Interativo:** Menu completo para controlar todos os apps, testes, servidor e Firebase. | — |
| **`1-instalar-dependencias.bat`** | Instala as dependências de todo o monorepo e dos 3 frontends. | — |
| **`2-executar-testes.bat`** | Roda `sync:shared`, checagem TypeScript (`tsc --noEmit`), testes Jest e diagnóstico. | — |
| **`3-iniciar-cidadao.bat`** | Inicia servidor backend + Firebase e abre o **EcoSmart Cidadão**. | `8081` |
| **`4-iniciar-coletor.bat`** | Inicia servidor backend + Firebase e abre o **EcoSmart Coletor**. | `8082` |
| **`5-iniciar-admin.bat`** | Inicia servidor backend + Firebase e abre o **EcoSmart Admin**. | `8083` |
| **`6-sincronizar-modulos.bat`** | Sincroniza imediatamente o diretório `shared/` com os frontends. | — |
| **`7-testar-comunicacao.bat`** | Executa o teste de criação e diagnóstico de sync (API + Firebase). | — |
| **`8-iniciar-servidor.bat`** | Inicia o Servidor Backend REST centralizado de sincronização. | `3333` |

---

## 🧪 Qualidade e Testes Automatizados

O ecossistema conta com **77 suítes de testes** e **425 testes automatizados** (100% de sucesso):

```bash
# Executa todos os testes dos 3 aplicativos com propagação do shared
npm run test:all

# Executa diagnóstico prático de comunicação da API e Firebase
npm run test:communication

# Executa verificação estática de tipos TypeScript em todo o monorepo
npm run typecheck:all
```

---

## 🚀 Como Iniciar o Projeto

### 1. Iniciar Aplicativos Individualmente (com Auto-Servidor e Firebase):
```bash
# Iniciar EcoSmart Cidadão (Porta 8081)
npm run start:cidadao

# Iniciar EcoSmart Coletor (Porta 8082)
npm run start:coletor

# Iniciar EcoSmart Admin (Porta 8083)
npm run start:admin
```

### 2. Iniciar Apenas o Servidor Backend:
```bash
# Iniciar Servidor Central REST (Porta 3333)
npm run server
```

### 3. Migrar e Popular o Cloud Firestore:
```bash
# Sincroniza dados com Cáceres - MT e isola a base administrativa
node scripts/seed-firestore.js
```
