# 👑 EcoSmart Admin

O **EcoSmart Admin** é o aplicativo móvel executivo de gestão ambiental pública e governança ESG voltado para secretarias municipais (ex: SEMATUR de Cáceres - MT), órgãos de fiscalização e administradores do ecossistema.

---

## 🎯 Funcionalidades Principais

- **🔐 Autenticação com Chave Mestre de Segurança:**
  - Login rápido via **"Continuar com o Google" (Firebase Auth)** com permissões administrativas.
  - Login tradicional por e-mail e senha.
  - Cadastro de novos administradores protegido obrigatoriamente pela **Chave Mestre de Segurança (`ADMIN2026`)**.
  - Bloqueio estrito de perfis cruzados (RBAC).

- **♻️ Gestão de Catálogos Municipais (CRUDs em Tempo Real):**
  - **Tipos de Resíduos:** Cadastro, edição e exclusão de materiais recicláveis com busca textual.
  - **Pontos de Coleta (PEVs):** Gestão completa de Ecopontos com endereços, coordenadas GPS e horários de atendimento.
  - **Dicas Educativas:** Publicação e manutenção de orientações de preservação do Pantanal.

- **📊 Auditoria de Registros & Relatórios de Sustentabilidade ESG:**
  - Visualização de todas as solicitações e descartes do município com filtros de status (*Pendentes*, *Coletados*).
  - Cálculo automático de indicadores ecológicos:
    - **Taxa de Reciclagem (%)**
    - **Estimativa de Carbono Evitado (kg CO₂)**
    - **Volume de Água Preservada (Litros)**
  - **Exportação de Relatórios ESG em formato CSV** pronto para prestação de contas.

- **👤 Perfil Institucional:**
  - Dados institucionais do gestor: cargo, departamento/secretaria e diretrizes ambientais.

---

## 🔑 Credenciais de Teste

| Tipo de Acesso | E-mail | Senha / Chave | Perfil |
| :--- | :--- | :--- | :--- |
| **Login Tradicional** | `joao@gmail.com` | `1234` | `admin` |
| **Login Google** | `joao.google@gmail.com` | — | `admin` |
| **Chave de Cadastro Master** | — | `ADMIN2026` | `admin` |

---

## 🚀 Como Executar

```bash
# A partir da pasta do app (Porta 8083)
cd frontend/ecosmart-admin
npx expo start --port 8083

# Ou a partir da raiz do monorepo
npm run start:admin

# Ou com duplo clique no executável do Windows
executaveis/5-iniciar-admin.bat
```

