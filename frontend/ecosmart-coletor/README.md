# 🚚 EcoSmart Empresa/Catador

O **EcoSmart Empresa/Catador** é o aplicativo móvel operacional destinado a catadores individuais, cooperativas locais (**COOPERCÁCERES**) e empresas de coleta seletiva e logística reversa em Cáceres - MT.

---

## 🎯 Funcionalidades Principais

- **🔐 Autenticação Flexível:**
  - Login rápido via **"Continuar com o Google" (Firebase Auth)** com perfil de coletor.
  - Login e cadastro tradicional com e-mail/senha.
  - Bloqueio estrito de papéis cruzados (RBAC).

- **📦 Feed em Tempo Real de Descartes:**
  - Visualização dinâmica de materiais pendentes com ouvintes em tempo real (`onSnapshot`).
  - Cálculo de distância geodésica em tempo real via **Fórmula de Haversine** (`geoUtils.ts`).
  - Ordenação por proximidade geográfica em relação à localização atual do coletor.
  - Filtro instantâneo por tipo de resíduo aceito e busca textual por bairro.

- **⚡ Ações Rápidas no Card (1 Toque):**
  - **`🗺️ Rota GPS`:** Abre imediatamente trajeto curva a curva no Google Maps ou Waze.
  - **`✅ Coletar`:** Baixa e confirmação do recolhimento diretamente no card, notificando a central e o cidadão em tempo real.

- **🚛 Coletas Realizadas & Resumo Operacional:**
  - Histórico completo de recolhimentos realizados pelo coletor.
  - Suporte a operações offline (`offlineSyncPending`) com auto-sincronização.

- **👤 Perfil Operacional:**
  - Gestão de dados operacionais: tipo de veículo (caminhonete, carretinha, triciclo), capacidade de carga (kg) e bairros atendidos.

---

## 🔑 Credenciais de Teste

| Tipo de Acesso | E-mail | Senha | Perfil |
| :--- | :--- | :--- | :--- |
| **Login Tradicional** | `lucas@gmail.com` | `1234` | `coletor` |
| **Login Google** | `lucas.google@gmail.com` | — | `coletor` |

---

## 🚀 Como Executar

```bash
# A partir da pasta do app (Porta 8082)
cd frontend/ecosmart-coletor
npx expo start --port 8082

# Ou a partir da raiz do monorepo
npm run start:coletor

# Ou com duplo clique no executável do Windows
executaveis/4-iniciar-coletor.bat
```

