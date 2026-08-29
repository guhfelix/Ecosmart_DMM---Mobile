# Lean Canvas - EcoSmart Mobile

| Bloco | Descrição |
|---|---|
| Problema | Muitas pessoas têm dúvida sobre descarte correto e existe pouca conexão prática entre cidadãos, coletores e responsáveis pela gestão ambiental. |
| Segmentos de clientes | Cidadãos, coletores/cooperativas/empresas de coleta e administradores do sistema. |
| Proposta de valor | Facilitar o descarte sustentável por meio de um ecossistema mobile simples, dividido por perfil de uso. |
| Solução | Três aplicativos: Cidadão para registrar descartes, Empresa/Catador para visualizar e coletar resíduos, Admin para gerenciar dados e acompanhar registros. |
| Canais | Aplicativos mobile executados via Expo Go durante o MVP e GitHub para versionamento do projeto acadêmico. |
| Métricas principais | Quantidade de descartes registrados, coletas realizadas, pontos de coleta cadastrados e dicas educativas disponíveis. |
| Vantagem | Organização do fluxo completo em três perfis conectáveis, facilitando evolução futura para backend real. |

## MVP atual

- **EcoSmart Cidadão:** Login com Google (Firebase Auth) e E-mail/Senha, cadastro de descarte simples (com tipo, quantidade, observação, CEP com ViaCEP e GPS simplificado), gravação no Cloud Firestore (`saveCitizenDiscard`), histórico persistido no AsyncStorage com busca e filtros, consulta de dicas educativas e pontos de coleta com rotas, notificações em tempo real e Perfil do Cidadão.
- **EcoSmart Empresa/Catador:** Login com Google (Firebase Auth) e E-mail/Senha, feed de descartes com distâncias geográficas em tempo real (Haversine), ordenação por proximidade, ações em 1 toque no card (rota GPS e confirmação de coleta), ouvintes em tempo real (`onSnapshot`), coletas realizadas e Perfil Operacional.
- **EcoSmart Admin:** Login com Google (Firebase Auth) e E-mail/Senha com Chave Mestre (`ADMIN2026`), CRUDs completos com busca em tempo real para resíduos, pontos de coleta e dicas, painel de registros gerais, exportação de relatórios ESG em CSV e Perfil de Gestão Master.
- **Servidor Central Backend:** API REST em Node.js na porta 3333, barramento de eventos inter-aplicativos, auto-inicialização e conexão validada com o Firebase Firestore.
- **Qualidade e Testes:** Modelos compartilhados em `shared/models`, tipagem estrita com TypeScript (`tsc --noEmit`), 74 suítes e 383 testes automatizados (100% de aprovação).

## Evolução futura

- Implementação de Push Notifications nativas via Firebase Cloud Messaging (FCM).
- Otimização inteligente de rotas com múltiplos pontos de coleta para caminhões de coleta seletiva.
- Módulo de gamificação e cashback ecológico para cidadãos e cooperativas.
- Painel web avançado de telemetria e gráficos interativos para secretarias municipais de meio ambiente.
- Geração automatizada de relatórios analíticos de sustentabilidade em formato PDF com assinatura digital.
