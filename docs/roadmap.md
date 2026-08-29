# Roadmap do Ecossistema EcoSmart Mobile

Este documento apresenta o histórico de etapas concluídas do desenvolvimento do **EcoSmart Mobile** e as próximas fases de evolução do projeto.

---

## 🏁 Etapa 1 - Estrutura Inicial e Monorepo
**Status:** Concluída ✅
- [x] Estruturar repositório modular em `frontend/`, `backend/`, `database/`, `shared/`, `executaveis/`, `scripts/` e `docs/`.
- [x] Padronizar os três aplicativos no Expo SDK 54 com React Native.
- [x] Centralizar contratos e modelos TypeScript em `shared/models`.
- [x] Criar sincronizador automatizado de código compartilhado (`scripts/sync-shared.js`).

---

## 👤 Etapa 2 - Aplicativo EcoSmart Cidadão
**Status:** Concluída ✅
- [x] Implementar login social com Google (Firebase Auth) e login tradicional E-mail/Senha com RBAC estrito.
- [x] Implementar recuperação de senha com código de verificação temporário (`ECO-XXXX`).
- [x] Implementar cadastro simples e direto de descarte (material, quantidade, observações e fotos).
- [x] Integrar busca automática de endereço por CEP via ViaCEP e GPS simplificado.
- [x] Gravação transparente no Cloud Firestore (`saveCitizenDiscard`).
- [x] Implementar histórico de descartes persistido no AsyncStorage isolado por usuário (`@ecosmart_cidadao_discards_${userId}`).
- [x] Implementar tela de Detalhes do Descarte com botão de cancelamento/exclusão em tempo real.
- [x] Implementar catálogo de Ecopontos e PEVs de Cáceres - MT com cálculo de distância (Haversine) e rotas (Google Maps / Waze).
- [x] Implementar feed de dicas educativas de sustentabilidade e conservação do Pantanal.
- [x] Implementar Perfil do Cidadão (resumo de descartes e edição cadastral).
- [x] Banner visual de status offline e auto-sincronização reativa ao reconectar.

---

## 🚚 Etapa 3 - Aplicativo EcoSmart Empresa/Catador
**Status:** Concluída ✅
- [x] Implementar login (Google e E-mail/Senha) e cadastro com RBAC estrito.
- [x] Menu simplificado com 3 opções claras (Descartes disponíveis, Coletas realizadas e Perfil).
- [x] Listar descartes disponíveis com cálculo de distâncias (Haversine) e ordenação automática por proximidade GPS.
- [x] **Ações em 1 Toque no Card:** Traçado direto de rota GPS e confirmação de coleta sem troca de tela.
- [x] Tela de detalhes do descarte com foto ampliada e observações.
- [x] Marcar descarte como coletado com propagação em tempo real (0ms) e listeners nativos `onSnapshot`.
- [x] Suporte a baixa de coleta offline com flag `offlineSyncPending` e auto-sincronização.
- [x] Regra de consistência: descarte coletado nunca regride para pendente.
- [x] Histórico de coletas realizadas com busca em tempo real.
- [x] Implementar Perfil Operacional do Coletor com gestão de veículo, capacidade de carga e histórico.

---

## 👑 Etapa 4 - Aplicativo EcoSmart Admin
**Status:** Concluída ✅
- [x] Implementar login (Google e E-mail/Senha) e cadastro protegido por Chave Mestre de Segurança (`ADMIN2026`).
- [x] CRUD completo de tipos de resíduos aceitos com busca em tempo real.
- [x] CRUD completo de pontos de coleta (PEVs) com geolocalização e horários.
- [x] CRUD completo de dicas educativas de sustentabilidade com categorização.
- [x] Visualizar registros gerais com contadores dinâmicos (*Pendentes*, *Coletados*, *Total*), filtros e exclusão.
- [x] **Exportação de Relatórios ESG em CSV:** Cálculo automático de Taxa de Reciclagem (%), kg de CO₂ evitado e litros de água economizados com Resumo Executivo.
- [x] Implementar Perfil de Governança do Administrador com cargo, departamento e políticas municipais.

---

## 🧪 Etapa 5 - Qualidade, Padronização e Isolamento
**Status:** Concluída ✅
- [x] Migração para `react-native-safe-area-context` e `SafeAreaProvider` nos 3 apps.
- [x] Namespaces isolados no `AsyncStorage` para evitar contaminação cruzada entre apps e usuários.
- [x] Validação TypeScript estrita (`tsc --noEmit`) com 0 erros.
- [x] 100% de sucesso nos testes automatizados (**75 suítes e 386 testes passando** no Jest).

---

## ⚡ Etapa 6 - Camada de Backend e Sincronização em Tempo Real
**Status:** Concluída ✅
- [x] Barramento de eventos instantâneo em tempo real via `BroadcastChannel` (0ms de latência).
- [x] Servidor Central Backend REST em Node.js (`scripts/sync-server.js` na porta 3333).
- [x] Auto-inicialização do servidor e validação com Firebase nos scripts de inicialização (`ensure-server.js`).
- [x] Listeners nativos `onSnapshot` no Firestore para atualização contínua sem recarregamento.
- [x] Teste automatizado de diagnóstico de comunicação E2E (`scripts/test-communication.js`).

---

## 🚀 Etapa 7 - Executáveis e Automação (.bat no Windows)
**Status:** Concluída ✅
- [x] Painel interativo `MENU-ECOSMART.bat`.
- [x] Scripts dedicados de instalação, testes, sincronização e inicialização dos apps na pasta `executaveis/`.

---

## 🔮 Etapa 8 - Evolução Futura (Próximos Passos)
**Status:** Planejada 📋
- [ ] Push Notifications nativas via Firebase Cloud Messaging (FCM).
- [ ] Algoritmo de roteirização multi-parada para caminhões de coleta seletiva.
- [ ] Módulo de gamificação ecológica e pontos de sustentabilidade.
- [ ] Painel web avançado para secretarias municipais de meio ambiente.
- [ ] Exportação de relatórios analíticos de sustentabilidade em PDF com gráficos e assinatura digital.
