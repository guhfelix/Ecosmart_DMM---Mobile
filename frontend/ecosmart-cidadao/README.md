# 📱 EcoSmart Cidadão

O **EcoSmart Cidadão** é o aplicativo móvel voltado para os geradores de resíduos recicláveis (moradores, comércios e estabelecimentos de Cáceres - MT), permitindo o descarte rápido e consciente de materiais, consulta de pontos de entrega voluntária e acompanhamento em tempo real.

---

## 🎯 Funcionalidades Principais

- **🔐 Autenticação Flexível e Segura:**
  - Login rápido via **"Continuar com o Google" (Firebase Auth)**.
  - Login e cadastro tradicional com e-mail/senha protegidos com hash e salt criptográfico (`passwordHash` + `passwordSalt`, sem senhas em texto simples).
  - Recuperação de senha com código de verificação seguro (`ECO-XXXX`).
  - Bloqueio estrito de papéis cruzados (RBAC).

- **📦 Registro e Edição Completa de Descartes (CRUD):**
  - Seleção do tipo de resíduo aceito (Plástico, Papelão, Vidro, Metal, Eletrônicos, Óleo).
  - Validação numérica estrita de quantidade (> 0) e seletor de unidade de medida (`kg`, `unidade`, `saco`, `litro`).
  - Preenchimento inteligente por CEP via **ViaCEP API** com autocompletar de endereço e coordenadas de referência do bairro em Cáceres - MT.
  - Edição de descartes existentes preservando o `id` original (`PUT /api/discards/:id`), além de exclusão segura com tombstones offline (`deletedIds`).
  - Gravação direta no **Cloud Firestore** (`saveCitizenDiscard`) e fila offline persistente (`outboxQueue`).

- **📜 Histórico e Acompanhamento em Tempo Real:**
  - Listagem de descartes do cidadão com status dinâmico (*Pendente*, *Coletado*) e indicador explícito de sincronização pendente (`syncPending`).
  - Busca textual em tempo real por material, endereço ou bairro.
  - Notificações instantâneas quando o descarte for coletado.

- **📍 Ecopontos e Dicas Educativas:**
  - Catálogo de PEVs e Ecopontos de Cáceres com cálculo de distância (Haversine) e traçado de rotas no Google Maps e Waze.
  - Dicas de sustentabilidade e preservação do Pantanal e Rio Paraguai.

- **👤 Perfil do Cidadão:**
  - Resumo de descartes registrados, pendentes e coletados.
  - Edição de dados cadastrais e endereço padrão de coleta.

---

## 🔑 Credenciais de Teste

| Tipo de Acesso | E-mail | Senha | Perfil |
| :--- | :--- | :--- | :--- |
| **Login Tradicional** | `maria@gmail.com` | `1234` | `cidadao` |
| **Login Google** | `maria.google@gmail.com` | — | `cidadao` |

---

## 🚀 Como Executar

```bash
# A partir da pasta do app (Porta 8081)
cd frontend/ecosmart-cidadao
npx expo start --port 8081

# Ou a partir da raiz do monorepo
npm run start:cidadao

# Ou com duplo clique no executável do Windows
executaveis/3-iniciar-cidadao.bat
```
