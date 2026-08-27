# Requisitos do Sistema EcoSmart Mobile

Este documento descreve os requisitos funcionais e não-funcionais implementados no ecossistema **EcoSmart Mobile**, focado em **simplicidade, fácil acesso e agilidade operacional**.

## Requisitos Gerais e Arquitetura
- [x] Arquitetura modular separada em `frontend`, `backend`, `database`, `shared`, `executaveis` e `docs`.
- [x] Interface limpa e descomplicada, focada em fácil acesso e uso imediato sem burocracias.
- [x] Autenticação unificada com suporte a **Google Sign-in (Firebase Auth)** e **E-mail/Senha**.
- [x] Validação estrita de perfil (RBAC) com bloqueio de perfil cruzado e mensagens claras.
- [x] Modo offline com monitoramento de rede (`NetInfo`), banner visual e persistência de ações.
- [x] Persistência local isolada com `AsyncStorage` por aplicativo.
- [x] Código de acesso administrativo obrigatório no cadastro (`ADMIN2026`).
- [x] Gerenciamento de áreas seguras com `react-native-safe-area-context` e `SafeAreaProvider`.
- [x] Suíte de testes unitários com Jest e React Native Testing Library nos 3 apps (74 suítes e 383 testes passando).
- [x] Zero erros de tipagem estrita com TypeScript (`tsc --noEmit`).

## EcoSmart Cidadão (`frontend/ecosmart-cidadao`)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha.
- [x] Criar cadastro simples de cidadão.
- [x] Recuperação de senha com código de verificação ("Esqueci minha senha").
- [x] Registrar descarte simples com tipo de resíduo, quantidade, observação e endereço.
- [x] Capturar localização por GPS simplificado ou busca por CEP (ViaCEP) com autopreenchimento.
- [x] Registro de descarte em modo offline com status `Pendente (Offline)`.
- [x] Gravação direta e transparente no Cloud Firestore (`saveCitizenDiscard`).
- [x] Auto-sincronização em background ao reconectar a internet.
- [x] Consultar histórico de descartes cadastrados com busca em tempo real e filtros de status.
- [x] Consultar dicas educativas com busca por assunto/categoria.
- [x] Consultar pontos de coleta com cálculo de distância (GPS) e visualização de rotas.
- [x] Central de notificações em tempo real com contador e modal.
- [x] **Perfil do Cidadão:** Edição de dados cadastrais (nome, telefone, endereço, bairro, cidade, bio) e resumo de descartes registrados, coletados e pendentes.
- [x] Encerramento de sessão (Logout) com limpeza do storage de sessão.

## EcoSmart Empresa/Catador (`frontend/ecosmart-coletor`)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha.
- [x] Criar cadastro simples de coletor.
- [x] Recuperação de senha com código de verificação.
- [x] Menu inicial objetivo com 3 opções claras (Descartes disponíveis, Coletas realizadas e Perfil).
- [x] Visualizar descartes disponíveis com cálculo de distâncias (GPS) e ordenação por proximidade.
- [x] **Ação Direta no Card:** Botão de traçado de rota GPS e confirmação de coleta em 1 toque.
- [x] Marcar descarte como coletado (com suporte a gravação offline `offlineSyncPending`).
- [x] Auto-sincronização de coletas ao restabelecer conectividade.
- [x] Visualizar histórico de coletas realizadas com busca textual.
- [x] Central de notificações em tempo real.
- [x] **Perfil do Coletor e Logística:** Edição de dados operacionais (nome/razão social, telefone, bairros de atuação, tipo de veículo, capacidade de carga, bio) e resumo operacional.
- [x] Encerramento de sessão (Logout).

## EcoSmart Admin (`frontend/ecosmart-admin`)
- [x] Realizar login com Google (Firebase Auth) ou e-mail/senha com Chave Mestre `ADMIN2026`.
- [x] CRUD completo de tipos de resíduos com busca em tempo real.
- [x] CRUD completo de pontos de coleta com geolocalização e busca.
- [x] CRUD completo de dicas educativas com busca textual.
- [x] Visualizar registros gerais com contadores (pendentes, coletados) e filtros.
- [x] Exportação de Relatórios de Sustentabilidade ESG (CSV) com cálculo de CO₂ evitado e água economizada.
- [x] Auto-sincronização de dados offline.
- [x] Central de notificações administrativas.
- [x] **Perfil de Gestor e Governança:** Edição de dados do administrador e dashboard de governança.
- [x] Encerramento de sessão (Logout).

## Qualidade e Testes Automatizados
- [x] **Suíte Abrangente de Testes:** 74 suítes de testes cobrindo 100% das regras de negócio, serviços, utilitários, componentes, hooks e telas (`383 passed, 0 failed`).
- [x] **Diagnóstico de Comunicação:** Script automatizado de teste de rotas REST, Firebase e Storage (`npm run test:communication`).
- [x] **Scripts de Validação:** `npm run test:all`, `npm run test:communication`, `npm run typecheck:all`.
