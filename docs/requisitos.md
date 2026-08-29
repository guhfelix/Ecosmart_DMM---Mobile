# Requisitos do Sistema EcoSmart Mobile

Este documento descreve os requisitos funcionais e não-funcionais implementados e auditados no ecossistema **EcoSmart Mobile**, projetado com foco em **simplicidade, fácil acesso, resiliência offline e agilidade operacional**.

---

## 🏛️ Requisitos Gerais e Arquitetura
- [x] **Arquitetura Modular em Monorepo:** Organização em `frontend/`, `backend/`, `database/`, `shared/`, `executaveis/`, `scripts/` e `docs/`.
- [x] **Design Focado em Simplicidade:** Interface limpa, intuitiva e sem fluxos pesados ou burocráticos.
- [x] **Autenticação Unificada & Social:** Suporte a **Google Sign-in (Firebase Auth)** e login tradicional por **E-mail e Senha**.
- [x] **Controle de Acesso Baseado em Papéis (RBAC):** Validação estrita impedindo acesso cruzado entre perfis (`cidadao`, `coletor`, `admin`) com mensagens claras e instrutivas.
- [x] **Modo Offline-First:** Monitoramento de rede reativo via `@react-native-community/netinfo`, banner visual de conectividade e fila de saída (*Outbox Pattern*).
- [x] **Persistência Local Isolada:** Armazenamento via `@react-native-async-storage/async-storage` com namespaces isolados por app e chave única por usuário (`@ecosmart_cidadao_discards_${userId}`).
- [x] **Barramento em Tempo Real (0ms):** Propagação imediata de eventos de novos descartes (`NEW_DISCARD`), coletas (`DISCARD_COLLECTED`) e exclusões (`DISCARD_DELETED`) via `BroadcastChannel`.
- [x] **Servidor Central Backend REST:** API local em Node.js (porta 3333) auto-iniciada em segundo plano com persistência JSON em disco.
- [x] **Gerenciamento de Áreas Seguras:** Utilização de `react-native-safe-area-context` e `SafeAreaProvider` em todos os 3 apps.
- [x] **Qualidade & Testes:** 75 suítes de testes e 386 testes automatizados com 100% de sucesso no Jest e React Native Testing Library.
- [x] **Tipagem Estática Estrita:** Zero erros no compilador TypeScript (`tsc --noEmit`).

---

## 👤 EcoSmart Cidadão (`frontend/ecosmart-cidadao` - Porta 8081)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha.
- [x] Criar cadastro rápido informando apenas nome, e-mail e senha.
- [x] Recuperação de senha com código de verificação temporário (`ECO-XXXX`).
- [x] Registrar descarte simples com seleção de material, quantidade, observação e endereço.
- [x] Busca automática de endereço por CEP através da API ViaCEP com preenchimento de logradouro e bairro.
- [x] Captura de localização geográfica por GPS simplificado.
- [x] Suporte a fotos de resíduos ou seleção de amostras representativas.
- [x] Registro de descarte em modo offline com status `Pendente (Offline)`.
- [x] Gravação transparente no Cloud Firestore (`saveCitizenDiscard`).
- [x] Auto-sincronização em background ao restabelecer a conexão de internet.
- [x] Consultar histórico de descartes do próprio cidadão com filtros (*Todos*, *Pendentes*, *Coletados*) e busca textual em tempo real.
- [x] **Detalhes e Exclusão de Descarte:** Visualizar dados completos e permitir o cancelamento/exclusão do descarte com propagação em tempo real no backend e no Firestore.
- [x] Consultar pontos de coleta (PEVs) em Cáceres - MT com cálculo de distância (Haversine) e rotas no Google Maps / Waze.
- [x] Consultar dicas educativas sobre sustentabilidade e conservação do Pantanal.
- [x] Central de notificações em tempo real com contador e modal.
- [x] **Perfil do Cidadão:** Edição de dados cadastrais (telefone, endereço padrão, número, bairro, cidade, bio) e resumo de descartes registrados.
- [x] Encerramento de sessão (Logout) seguro com limpeza de memória e cache.

---

## 🚚 EcoSmart Empresa/Catador (`frontend/ecosmart-coletor` - Porta 8082)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha com validação RBAC.
- [x] Criar cadastro de coletor com definição de tipo de veículo e capacidade de carga.
- [x] Recuperação de senha com código de verificação.
- [x] Menu inicial objetivo com 3 opções claras (Descartes disponíveis, Coletas realizadas e Perfil).
- [x] Feed em tempo real de descartes pendentes com distâncias calculadas por GPS (Haversine) e ordenação por proximidade.
- [x] **Ação Direta no Card (1 Toque):** Botões diretos no card para traçar rota GPS (Google Maps / Waze) e confirmar a coleta sem trocar de tela.
- [x] Visualizar detalhes completos do descarte com foto ampliada e observações.
- [x] Marcar descarte como coletado com suporte a baixa offline (`offlineSyncPending`).
- [x] Regra de consistência: descarte coletado nunca regride para pendente.
- [x] Auto-sincronização de coletas ao restabelecer a conexão.
- [x] Visualizar histórico de coletas realizadas com busca textual em tempo real.
- [x] Central de notificações em tempo real para novos descartes na região.
- [x] **Perfil Operacional & Logística:** Edição de veículo de coleta, capacidade de carga, bairros atendidos e resumo de coletas.
- [x] Encerramento de sessão (Logout).

---

## 👑 EcoSmart Admin (`frontend/ecosmart-admin` - Porta 8083)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha.
- [x] Cadastro restrito de administradores exigindo a Chave Mestre de Segurança (`ADMIN2026`).
- [x] CRUD completo de tipos de resíduos aceitos com busca em tempo real.
- [x] CRUD completo de pontos de coleta e PEVs municipais com geolocalização, horários e resíduos aceitos.
- [x] CRUD completo de dicas educativas de sustentabilidade com busca textual.
- [x] Painel de registros gerais com contadores dinâmicos (*Pendentes*, *Coletados*, *Total*), filtros e exclusão de registros.
- [x] **Exportação de Relatórios ESG em CSV:** Cálculo automático de Taxa de Reciclagem (%), kg de CO₂ evitado e litros de água economizados com Resumo Executivo.
- [x] Auto-sincronização de dados criados offline.
- [x] Central de notificações administrativas.
- [x] **Perfil de Gestor e Governança:** Edição de dados do gestor (cargo, departamento, bio) e dashboard de governança ESG.
- [x] Encerramento de sessão (Logout).

---

## 🧪 Qualidade e Validação Automatizada
- [x] **Suíte de Testes Unitários e Integração:** 75 suítes de testes com 386 testes passando com 100% de sucesso (`npm run test:all`).
- [x] **Diagnóstico E2E de Comunicação:** Script automatizado de teste de rotas REST, Firestore e Storage (`npm run test:communication`).
- [x] **Verificação de Tipos TypeScript:** Zero erros em todo o monorepo (`npm run typecheck:all`).
