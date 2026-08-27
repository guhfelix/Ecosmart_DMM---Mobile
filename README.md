# EcoSmart Mobile

## Ecossistema mobile para descarte sustentável de resíduos e logística reversa

![Status](https://img.shields.io/badge/status-Completo%20(MVP%20%2B%20Melhorias%20%2B%20Google%20Auth%20%2B%20Firebase)-brightgreen)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tests](https://img.shields.io/badge/Tests-74%20suites%20%7C%20383%20passed-success)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange)
![License](https://img.shields.io/badge/license-academic-lightgrey)

O **EcoSmart Mobile** é um ecossistema simples, ágil e de fácil acesso desenvolvido para conectar cidadãos a catadores/empresas de coleta e apoiar a gestão municipal e ambiental (ESG).

O projeto é estruturado em três aplicativos independentes em **React Native com Expo**:

| Aplicativo | Perfil | Porta | Função Principal |
| :--- | :--- | :--- | :--- |
| **EcoSmart Cidadão** | Cidadão | `8081` | Registro rápido de descartes (tipo, quantidade, endereço com CEP e GPS simplificado), gravação no Firestore (`saveCitizenDiscard`), histórico com busca e filtros, dicas, pontos com rotas, auto-sync, **Login com Google (Firebase Auth)** e **Perfil do Cidadão**. |
| **EcoSmart Empresa/Catador** | Coletor | `8082` | Feed de descartes com distâncias geográficas (Haversine), ouvintes em tempo real (`onSnapshot`), ordenação por proximidade, rota GPS e baixa de coleta em 1 toque no card, auto-sync, **Login com Google (Firebase Auth)** e **Perfil Operacional**. |
| **EcoSmart Admin** | Administrador | `8083` | **Login com Google / Chave Mestre (ADMIN2026)**, CRUDs de resíduos, pontos e dicas com busca em tempo real, dashboard e exportação de Relatórios ESG (CSV) e **Perfil de Gestão Master**. |

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

O ecossistema conta com **74 suítes de testes** e **383 testes automatizados** (100% de sucesso):

```bash
# Executa todos os testes dos 3 aplicativos
npm run test:all

# Executa diagnóstico prático de comunicação da API e Firebase
npm run test:communication

# Executa verificação estática de tipos TypeScript
npm run typecheck:all
```

---

## 🚀 Como Iniciar o Projeto

### Iniciar Aplicativos Individualmente (com Auto-Servidor e Firebase):
```bash
# Iniciar EcoSmart Cidadão (Porta 8081)
npm run start:cidadao

# Iniciar EcoSmart Coletor (Porta 8082)
npm run start:coletor

# Iniciar EcoSmart Admin (Porta 8083)
npm run start:admin
```
