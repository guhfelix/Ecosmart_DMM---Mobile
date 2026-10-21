# 👑 EcoSmart Admin

O **EcoSmart Admin** é o aplicativo móvel executivo de gestão ambiental pública e governança ESG voltado para secretarias municipais (ex: SEMATUR de Cáceres - MT), órgãos de fiscalização e administradores do ecossistema.

---

## 🎯 Funcionalidades Principais

- **🔐 Autenticação Administrativa Segura:**
  - Login rápido via **"Continuar com o Google" (Firebase Auth)** com permissões administrativas verificadas.
  - Login tradicional por e-mail e senha com hash seguro (`passwordHash` + `passwordSalt`).
  - Cadastro de novos administradores validado via **Custom Claims / Token de Servidor** (`validateAdminRegistrationAccess`), sem chaves estáticas expostas no bundle cliente.
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

| Tipo de Acesso | E-mail | Senha | Perfil |
| :--- | :--- | :--- | :--- |
| **Login Tradicional** | `joao@gmail.com` | `1234` | `admin` |
| **Login Google** | `joao.google@gmail.com` | — | `admin` |

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
