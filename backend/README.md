# ⚙️ Camada de Backend & API REST - EcoSmart Mobile

Esta camada centraliza os controladores, rotas, serviços de sincronização e regras de negócio do ecossistema **EcoSmart Mobile**, conectando os três aplicativos clientes ao **Firebase Cloud Firestore**.

---

## 🏛️ Arquitetura do Backend

O backend é estruturado em módulos TypeScript fortemente tipados e desacoplados:

```text
backend/
├── src/
│   ├── controllers/            # Controladores da aplicação
│   │   ├── authController.ts   # Autenticação, RBAC e recuperação de senhas
│   │   ├── discardController.ts# Listagem, criação e baixa de descartes
│   │   └── adminController.ts  # Métricas ESG e CRUDs de governança
│   ├── routes/                 # Definição e mapeamento de rotas
│   │   ├── index.ts            # Ponto de agregação das rotas
│   │   ├── authRoutes.ts       # Rotas de login, registro e reset de senha
│   │   ├── discardRoutes.ts    # Rotas de descartes e confirmação de coleta
│   │   ├── adminRoutes.ts      # Rotas administrativas e relatórios ESG
│   │   └── syncRoutes.ts       # Rotas de sincronização de lote offline
│   ├── services/               # Regras de negócio auxiliares
│   │   └── syncService.ts      # Processamento de descartes criados offline
│   └── server.ts               # Ponto de entrada central da API
├── package.json
└── tsconfig.json
```

---

## 🌐 Endpoints da API REST (Porta 3333)

| Método | Endpoint | Controlador / Função | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | `sync-server.js` | Verificação de integridade e latência do servidor. |
| `GET` | `/api/events` | `sync-server.js` | Stream Server-Sent Events (SSE) para sincronização em tempo real. |
| `GET` | `/api/discards` | `discardController.listAvailable` | Listagem consolidada de descartes (suporta paginação `limit`/`offset`). |
| `POST` | `/api/discards` | `discardController.create` | Criação de novo descarte cadastrado pelo Cidadão (requer autenticação). |
| `PUT` / `PATCH` | `/api/discards/:id` | `discardController.update` | Edição de descarte existente preservando o `id` original (validação de proprietário/admin). |
| `POST` / `PATCH` | `/api/discards/:id/collect` | `discardController.markAsCollected` | Baixa e confirmação de coleta realizada por Coletor/Empresa. |
| `DELETE` | `/api/discards/:id` | `discardController.delete` | Cancelamento e exclusão de registro de descarte (validação de proprietário/admin). |
| `GET` | `/api/users` | `sync-server.js` | Consulta aos usuários cadastrados no ecossistema (sem exposição de senhas). |
| `POST` | `/api/users` | `sync-server.js` | Sincronização e cadastro de usuários e perfis (validação de token/propriedade). |

---

## 🔐 Controle de Acesso Baseado em Papéis (RBAC)

O backend valida estritamente a identidade e autorização (`Authorization: Bearer`, `X-User-Id`, `X-User-Role`) em todas as rotas mutáveis (`POST`, `PUT`, `PATCH`, `DELETE`), retornando `401` para requisições não autenticadas e `403` para tentativas de alterar recursos de terceiros:
- **Cidadão (`cidadao`):** Acesso restrito a cadastro, edição, exclusão e consulta de seus próprios descartes, pontos de coleta e dicas.
- **Empresa/Catador (`coletor`):** Acesso ao feed de descartes georreferenciados, rotas e confirmação de baixa de coleta.
- **Administrador (`admin`):** Acesso irrestrito a catálogos (resíduos, pontos, dicas), auditoria geral e emissão de relatórios ESG, validado via Custom Claims / token de servidor.

---

## 🚀 Como Executar o Servidor

```bash
# Iniciar o servidor central REST em Node.js (Porta 3333)
npm run server

# Ou através do script executável no Windows
executaveis/8-iniciar-servidor.bat
```