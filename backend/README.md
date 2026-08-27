# ⚙️ Camada de Backend & API - EcoSmart Mobile

Esta camada centraliza os controladores, rotas e regras de negócio do ecossistema EcoSmart.

## 📂 Estrutura

- `src/controllers/`: Controladores de Autenticação (RBAC), Descartes, Coletas e Painel Administrativo.
- `src/services/`: Serviços de sincronização offline e regras de validação.
- `src/server.ts`: Ponto de entrada da API.

## 🔐 Controle de Acesso (RBAC)
- Validação estrita por perfil (`cidadao`, `coletor`, `admin`).
- Proteção de cadastro do administrador por chave de acesso (`ADMIN2026`).