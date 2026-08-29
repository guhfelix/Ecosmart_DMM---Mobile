# 📱 EcoSmart Cidadão

O **EcoSmart Cidadão** é o aplicativo móvel voltado para os geradores de resíduos recicláveis (moradores, comércios e estabelecimentos de Cáceres - MT), permitindo o descarte rápido e consciente de materiais, consulta de pontos de entrega voluntária e acompanhamento em tempo real.

---

## 🎯 Funcionalidades Principais

- **🔐 Autenticação Flexível:**
  - Login rápido via **"Continuar com o Google" (Firebase Auth)**.
  - Login e cadastro tradicional com e-mail/senha.
  - Recuperação de senha com código de verificação seguro (`ECO-XXXX`).
  - Bloqueio estrito de papéis cruzados (RBAC).

- **📦 Registro Rápido e Descomplicado de Descartes:**
  - Seleção do tipo de resíduo aceito (Plástico, Papelão, Vidro, Metal, Eletrônicos, Óleo).
  - Preenchimento inteligente por CEP via **ViaCEP API** com autocompletar de endereço e coordenadas em Cáceres - MT.
  - Captura simplificada de GPS.
  - Gravação direta e transparente no **Cloud Firestore** (`saveCitizenDiscard`).

- **📜 Histórico e Acompanhamento em Tempo Real:**
  - Listagem de descartes do cidadão com status dinâmico (*Pendente*, *Coletado*).
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

