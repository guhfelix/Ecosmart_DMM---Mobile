# Lean Canvas - EcoSmart Mobile

| Bloco | Descrição |
|---|---|
| **Problema** | Descarte inadequado de materiais recicláveis, falta de informação sobre ecopontos e ausência de conexão prática e em tempo real entre cidadãos geradores de resíduos, cooperativas de catadores e gestores ambientais públicos. |
| **Segmentos de Clientes** | • **Cidadãos conscientes e comércios locais** (geradores de resíduos).<br>• **Catadores autônomos e cooperativas de reciclagem** (COOPERCÁCERES).<br>• **Gestores públicos e secretarias de meio ambiente** (SEMATUR / ESG). |
| **Proposta de Valor** | Facilitar o descarte sustentável e a logística reversa através de um ecossistema mobile simples, sem burocracias, dividido por perfil de uso e com geolocalização e sincronização em tempo real. |
| **Solução** | Três aplicativos integrados em React Native / Expo SDK 54:<br>1. **EcoSmart Cidadão:** Registro ágil com CEP/GPS, fotos, histórico, dicas, PEVs e detalhes/exclusão.<br>2. **EcoSmart Coletor:** Feed ordenado por proximidade GPS (Haversine), rotas e baixa de coleta em 1 toque no card.<br>3. **EcoSmart Admin:** CRUDs de gestão, auditoria de registros, relatórios de sustentabilidade ESG em CSV e governança. |
| **Canais** | Aplicativos móveis executados via Expo Go durante o MVP acadêmico, painel executável interativo (`executaveis/MENU-ECOSMART.bat`) e repositório GitHub para versionamento. |
| **Métricas Principais** | Quantidade de descartes registrados, coletas concluídas, pontos de coleta e dicas cadastradas, taxa de reciclagem (%), estimativa de kg de CO₂ evitado e litros de água economizados. |
| **Vantagem Competitiva** | Separação estrita em três perfis complementares com barramento de eventos instantâneo (0ms), servidor local REST auto-iniciado, Cloud Firestore com listeners em tempo real e arquitetura offline-first resiliente. |

---

## 🚀 MVP Atual Implementado

* **EcoSmart Cidadão (Porta 8081):** Login Google (Firebase Auth) e E-mail/Senha com RBAC, recuperação de senha com código (`ECO-XXXX`), cadastro simplificado de descarte com busca de CEP (ViaCEP), GPS e foto, gravação no Cloud Firestore (`saveCitizenDiscard`), histórico persistido no AsyncStorage isolado por usuário com busca e filtros, tela de detalhes com cancelamento/exclusão de descarte, catálogo de PEVs com rotas Google Maps/Waze, dicas educativas e Perfil do Cidadão.
* **EcoSmart Empresa/Catador (Porta 8082):** Login Google e E-mail/Senha com RBAC, feed de descartes com cálculo geográfico em tempo real (Haversine), ordenação por proximidade, ações em 1 toque no card (traçado de rota GPS e confirmação de coleta sem troca de tela), ouvintes nativos `onSnapshot`, baixa offline (`offlineSyncPending`), histórico de coletas realizadas e Perfil Operacional de Logística.
* **EcoSmart Admin (Porta 8083):** Login Google e E-mail/Senha protegido pela Chave Mestre de Segurança (`ADMIN2026`), CRUDs completos com busca em tempo real para resíduos, ecopontos e dicas, painel de registros gerais, exportação de Relatórios de Sustentabilidade ESG em formato CSV e Perfil de Gestão Master.
* **Servidor Central Backend & Barramento:** API REST em Node.js na porta 3333, barramento de eventos em tempo real via `BroadcastChannel` (0ms), auto-inicialização com `ensure-server.js` e persistência local em JSON.
* **Qualidade e Testes:** Contratos compartilhados em `shared/models`, tipagem estrita com TypeScript (`tsc --noEmit`), **75 suítes e 386 testes automatizados** com 100% de aprovação e diagnóstico E2E de comunicação (`npm run test:communication`).

---

## 🔮 Evolução Futura

- Implementação de Notificações Push nativas via Firebase Cloud Messaging (FCM).
- Otimização algorítmica de rotas com múltiplos pontos de coleta para caminhões da coleta seletiva municipal.
- Módulo de gamificação ecológica e pontos de sustentabilidade para cidadãos e cooperativas.
- Painel web avançado de telemetria com mapas de calor para secretarias municipais de meio ambiente.
- Geração automatizada de relatórios analíticos de sustentabilidade em formato PDF com gráficos e assinatura digital.
